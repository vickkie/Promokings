import React, { useMemo, useCallback, useRef, forwardRef, useContext, useState, useEffect } from "react";
import {
  StyleSheet,
  TextInput,
  Text,
  View,
  TouchableOpacity,
  Image,
  Alert,
  FlatList,
  ActivityIndicator,
} from "react-native";
import { BottomSheetBackdrop, BottomSheetModal } from "@gorhom/bottom-sheet";
import { COLORS, SIZES } from "../../constants";
import Icon from "../../constants/icons";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { AuthContext } from "../auth/AuthContext";
import Toast from "react-native-toast-message";
import { ScrollView } from "react-native-gesture-handler";
import axios from "axios";
import { Formik } from "formik";
import * as Yup from "yup";
import { BACKEND_PORT } from "@env";

const SupplierBid = forwardRef((props, ref) => {
  // Assuming product details are passed in props.item
  const { item, lostBid, bidAccepted } = props; // product details object

  const snapPoints = useMemo(() => ["70%", "80%"], []);
  const navigation = useNavigation();
  const { userData, userLogin } = useContext(AuthContext);

  const [userId, setUserId] = useState(null);
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(false);
  const [bidData, setBidData] = useState([]);
  const [loader, setLoader] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [offset, setOffset] = useState(0);
  const [limit, setLimit] = useState(2100);
  const [refreshing, setRefreshing2] = useState(false);
  const [haveBid, setHaveBid] = useState(false);
  const [oldBid, setOldBid] = useState(false);
  const [ilostBid, setIlostBid] = useState(false);
  const [bidClosed, setBidclosed] = useState(false);

  useEffect(() => {
    // console.log(ilostBid, bidAccepted);
  }, [ilostBid, bidAccepted]);

  const [error, setError] = useState(null);

  useEffect(() => {
    if (!userLogin) {
      setUserId(1);
    } else if (userData && userData._id) {
      setUserId(userData._id);
    }
  }, [userLogin, userData]);

  // Create a ref for the BottomSheetModal if not provided
  const bottomSheetRef = ref || useRef(null);

  const renderBackdrop = useCallback(
    (props) => <BottomSheetBackdrop appearsOnIndex={0} disappearsOnIndex={-1} {...props} opacity={0.3} />,
    []
  );

  const showToast = (type, text1, text2) => {
    Toast.show({
      type,
      text1,
      text2: text2 ? text2 : "",
      visibilityTime: 3000,
    });
  };

  const getValidationSchema = () => {
    return Yup.object().shape({
      bidPrice: Yup.string().required("Provide a bid supply price"),
    });
  };

  // Fetch products from API
  const fetchData = async (reset = false) => {
    if (loading || !item?.inventoryId) return;

    setLoading(true);

    try {
      // console.log(item?.inventoryId);

      const response = await axios.get(`${BACKEND_PORT}/api/products/${item?.inventoryId}`, {
        params: { limit, offset: reset ? 0 : offset },
      });

      if (response.status === 200) {
        setProduct((prev) => {
          const newData = reset ? [response.data] : [...prev, ...response.data];

          return Array.from(new Map(newData.map((item) => [item?._id, item])).values());
        });
      }

      setOffset((prev) => (reset ? limit : prev + limit));

      setError(null);
    } catch (err) {
      setError("Failed to fetch bids.");
    } finally {
      setLoading(false);
      if (reset) setRefreshing2(false);
    }
  };

  // Fetch bid data from API
  const fetchBidData = async (reset = false) => {
    if (loading || !item?._id) return;

    setLoading(true);

    try {
      const response = await axios.get(`${BACKEND_PORT}/api/inventory-requests/${item?._id}`, {
        params: { limit, offset: reset ? 0 : offset },
      });

      if (response.status === 200) {
        setBidData((prev) => {
          const newData = reset ? [response.data] : [...prev, ...response.data];

          return Array.from(new Map(newData.map((item) => [item._id, item])).values());
        });
      }

      setOffset((prev) => (reset ? limit : prev + limit));

      setError(null);
    } catch (err) {
      setError("Failed to fetch bids.");
    } finally {
      setLoading(false);
      if (reset) setRefreshing2(false);
    }
  };

  const handleSubmitBid = async (values) => {
    console.log("is submitting");
    // console.log(userData);

    setLoader(true);
    setIsEditing(false);

    if (bidAccepted) {
      showToast("error", "Your Bid supply is already approved");
      return;
    }
    try {
      const bidData = {
        bidPrice: values.bidPrice || undefined,
        supplierId: userData?.supplierProfile?._id,
      };

      const endpoint = `${BACKEND_PORT}/api/inventory-requests/${item?._id}`;

      const response = await axios.patch(endpoint, bidData, {
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.status === 200) {
        bottomSheetRef.current?.dismiss();
        showToast("success", "successfully Bid supply", "Please await reply in due time");
      }
    } catch (err) {
      showToast("error", "Update error", err?.response?.data?.error || err.message);
    } finally {
      setLoader(false);
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchData(true);
  }, []);

  const deadlineDate = new Date(item?.deadline);
  const today = new Date();
  const diffTime = deadlineDate - today;
  const daysRemaining = Math.ceil(diffTime / 86400000);
  const deadlineLabel =
    daysRemaining > 1
      ? `${daysRemaining} days remaining`
      : daysRemaining === 1
      ? "Due tomorrow"
      : daysRemaining === 0
      ? "Due today"
      : "Deadline passed";

  useEffect(() => {
    if (daysRemaining < 0) {
      setBidclosed(true);
    }
  });

  const filteredBids =
    !loading && bidData && bidData[0]?.bids ? bidData[0].bids.filter((bid) => bid.supplier !== null) : [];

  useEffect(() => {
    !loading && bidData && userData?.supplierProfile?._id
      ? filteredBids.find((bid) => {
          if (bid.supplier._id === userData.supplierProfile._id) {
            setHaveBid(true);
            setOldBid(bid?.bidPrice);
          }
        })
      : null;
  }, [loading, bidData]);

  // console.log(haveBid);

  const handleEditBid = () => {
    setIsEditing(!isEditing);
  };

  return (
    <BottomSheetModal
      ref={bottomSheetRef}
      index={1}
      snapPoints={snapPoints}
      onChange={(index) => {
        // Assuming index 1 means fully open
        if (index === 1) {
          fetchBidData(true);
          setIlostBid(lostBid);
        }
      }}
      enablePanDownToClose={false}
      backgroundStyle={{
        backgroundColor: COLORS.themew,
        borderRadius: SIZES.medium,
      }}
      backdropComponent={renderBackdrop}
      bottomInset={20}
      containerStyle={{ borderRadius: SIZES.large, marginHorizontal: 10 }}
      handleIndicatorStyle={styles.handlebar}
      handleHeight={10}
    >
      <ScrollView>
        <View style={styles.productContainer}>
          {/* Header */}
          <View style={styles.productHeader}>
            <Text style={styles.productTitle}>Bid Product Details</Text>
            <Text
              style={{
                backgroundColor: daysRemaining >= 0 ? "#C0DAFF" : daysRemaining < 0 ? "#F3D0CE" : COLORS.themey,
                paddingVertical: 4,
                paddingHorizontal: 8,
                borderRadius: SIZES.medium,
                width: 125,
                textAlign: "center",
                marginTop: 10,
                fontWeight: "bold",
                color: daysRemaining >= 0 ? "#337DE7" : daysRemaining < 0 ? "#B65454" : COLORS.primary,
              }}
            >
              {deadlineLabel}
            </Text>
          </View>

          {/* Product Image */}
          {item?.imageUrl && <Image source={{ uri: item.imageUrl }} style={styles.productImage} />}
          {/* Product Info */}
          <View style={styles.productInfo}>
            <View style={styles.flexmex}>
              <Text style={styles.productName}>{item?.productName || "Product Name Here"}</Text>
            </View>

            <Text style={styles.supplier} numberOfLines={1}>
              Quantity : {`${item?.quantity} units bid`}
            </Text>
            <Text style={styles.supplier}>
              Price range : KSHS [ {item?.expectedPrice || "0"}] - [ {(item?.expectedPrice / 100) * 130 || "0"}]
            </Text>
            <Text style={styles.productDescription}>{item?.bidDescription || "Product description goes here."}</Text>
          </View>

          {(userLogin && userData !== null && !bidClosed && !ilostBid && !haveBid) || isEditing ? (
            <Formik
              initialValues={{
                bidPrice: "",
              }}
              validationSchema={getValidationSchema()}
              onSubmit={(values) => handleSubmitBid(values)}
            >
              {({ handleChange, handleBlur, handleSubmit, values, errors, isValid, setFieldTouched, touched }) => (
                <>
                  <View style={styles.profileData}>
                    <View style={styles.wrapper}>
                      <View style={styles.flexmex}>
                        <Text style={styles.label}>Bid price</Text>
                        {touched.bidPrice && errors.bidPrice && (
                          <Text style={styles.errorMessage}>{errors.bidPrice}</Text>
                        )}
                      </View>

                      <View style={[styles.inputWrapper, touched.bidPrice && { borderColor: COLORS.secondary }]}>
                        <TextInput
                          placeholder="Bid Price"
                          onChangeText={handleChange("bidPrice")}
                          onBlur={handleBlur("bidPrice")}
                          value={values.bidPrice}
                          keyboardType="numeric"
                          style={styles.input}
                        />
                      </View>
                    </View>
                  </View>

                  <TouchableOpacity style={styles.actionButton} onPress={handleSubmit} disabled={loader}>
                    {loader ? (
                      <ActivityIndicator color="#fff" />
                    ) : (
                      <Text style={styles.actionButtonText}>
                        {isEditing ? "Submit Bid Edit" : "Submit Supply Product Bid"}
                      </Text>
                    )}
                  </TouchableOpacity>
                </>
              )}
            </Formik>
          ) : (
            ""
          )}
          {haveBid && (
            <View style={styles.bidContainer}>
              <Text style={styles.productDescription}>You have a bid of : Kshs {oldBid}</Text>

              {!bidClosed && !ilostBid && !bidAccepted && (
                <TouchableOpacity style={styles.editButton} onPress={handleEditBid}>
                  <Text style={styles.editButtonText}>Edit</Text>
                </TouchableOpacity>
              )}
            </View>
          )}
          {ilostBid && (
            <View style={styles.lostbidContainer}>
              <Text>Supply Bid Lost</Text>
            </View>
          )}
          {bidClosed && (
            <View style={styles.lostbidContainer}>
              <Text>Supply Bid Closed</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </BottomSheetModal>
  );
});

export default SupplierBid;

const styles = StyleSheet.create({
  productContainer: {
    flex: 1,
    padding: SIZES.medium,
    backgroundColor: "white",
    borderTopLeftRadius: SIZES.medium,
    borderTopRightRadius: SIZES.medium,
  },
  productHeader: {
    alignItems: "center",
    borderBottomColor: "#ccc",
    borderBottomWidth: 1,
    paddingBottom: 10,
    marginBottom: 10,
  },
  productTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: COLORS.black,
  },
  productImage: {
    width: "100%",
    height: "auto",
    aspectRatio: 1,
    alignSelf: "center",
    borderRadius: SIZES.medium,
    marginBottom: 15,
  },

  productInfo: {
    marginBottom: 15,
  },
  flexmex: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  productName: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.black,
  },
  supplier: {
    fontSize: 14,
    marginVertical: 7,
    color: COLORS.gray,
  },
  productSupplier: {
    fontSize: 14,
    color: COLORS.gray,
    marginVertical: 5,
  },
  productPrice: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.primary,
  },
  productDescription: {
    fontSize: 14,
    color: COLORS.black,
    marginTop: 10,
    lineHeight: 20,
  },
  bidsContainer: {
    marginVertical: 10,
  },
  bidsTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 5,
    color: COLORS.black,
  },
  bidItemContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: SIZES.small,
    borderBottomColor: "#eee",
    borderBottomWidth: 1,
  },
  bidInfo: {
    flex: 1,
  },
  bidSupplier: {
    fontSize: 14,
    fontWeight: "bold",
    color: COLORS.black,
  },
  bidPrice: {
    fontSize: 14,
    color: COLORS.primary,
  },
  bidStatus: {
    fontSize: 12,
    color: COLORS.gray,
  },
  acceptButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 5,
  },
  acceptButtonText: {
    color: "white",
    fontWeight: "bold",
  },
  actionButton: {
    backgroundColor: COLORS.primary,
    padding: 15,
    borderRadius: SIZES.xxLarge,
    alignItems: "center",
    marginTop: 15,
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "white",
  },
  handlebar: {
    width: SIZES.xxLarge * 2,
    backgroundColor: COLORS.themey,
  },
  label: {
    fontSize: SIZES.small,
    marginBottom: SIZES.xSmall,
    color: COLORS.gray,
    // marginStart: SIZES.large,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.themeg,
    padding: 10,
    borderRadius: SIZES.medium,
    marginBottom: 10,
    width: SIZES.width - 50,
    // marginStart: 10,
  },
  errorMessage: {
    color: COLORS.red,
    fontSize: 12,
    marginBottom: 10,
    marginStart: SIZES.large,
  },
  bidContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginVertical: 10,
    padding: 10,
    backgroundColor: "#f2f2f2",
    borderRadius: 8,
  },
  lostbidContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 10,
    padding: 10,
    backgroundColor: "#F3D0CE",
    borderRadius: 8,
  },
  productDescription: {
    fontSize: 16,
    color: "#333",
    flex: 1,
  },
  editButton: {
    backgroundColor: "#337DE7",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 4,
    marginLeft: 10,
  },
  editButtonText: {
    color: "white",
    fontWeight: "bold",
  },
});
