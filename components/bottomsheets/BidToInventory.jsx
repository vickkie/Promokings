import React, { useMemo, useCallback, useRef, forwardRef, useContext, useState, useEffect } from "react";
import { StyleSheet, Text, View, TouchableOpacity, Image, Alert, FlatList } from "react-native";
import { BottomSheetBackdrop, BottomSheetModal } from "@gorhom/bottom-sheet";
import { COLORS, SIZES } from "../../constants";
import Icon from "../../constants/icons";
import { useNavigation } from "@react-navigation/native";
import { AuthContext } from "../auth/AuthContext";
import Toast from "react-native-toast-message";
import { ScrollView } from "react-native-gesture-handler";
import axios from "axios";
import { BACKEND_PORT } from "@env";

const BidToInventory = forwardRef((props, ref) => {
  // Assuming product details are passed in props.item
  const { item } = props; // product details object
  const snapPoints = useMemo(() => ["80%", "80%"], []);
  const navigation = useNavigation();
  const { userData, userLogin } = useContext(AuthContext);

  const [userId, setUserId] = useState(null);
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(false);
  const [offset, setOffset] = useState(0);
  const [limit, setLimit] = useState(2100);
  const [refreshing, setRefreshing2] = useState(false);

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

  // Fetch products from API
  const fetchData = async (reset = false) => {
    if (loading || !item?.inventoryId) return;

    setLoading(true);

    try {
      console.log(item?.inventoryId);

      const response = await axios.get(`${BACKEND_PORT}/api/products/${item?.inventoryId}`, {
        params: { limit, offset: reset ? 0 : offset },
      });

      if (response.status === 200) {
        setProduct((prev) => {
          const newData = reset ? [response.data] : [...prev, ...response.data];

          return Array.from(new Map(newData.map((item) => [item._id, item])).values());
        });
      }

      setOffset((prev) => (reset ? limit : prev + limit));

      setError(null);
    } catch (err) {
      setError("Failed to fetch products.");
    } finally {
      console.log("checking hey");
      setLoading(false);
      if (reset) setRefreshing2(false);
    }
  };
  // Initial fetch
  useEffect(() => {
    fetchData(true);
  }, []);
  useEffect(() => {
    console.log(product);
  }, [product]);

  // Handler for accepting a bid
  const handleAcceptBid = (bid) => {
    Alert.alert("Accept Bid", `Accept bid from ${bid.supplier?.name || "Unknown"} for KES ${bid.bidPrice}?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Accept",
        onPress: () => acceptBid(bid),
      },
    ]);
  };

  const acceptBid = async (bid) => {
    try {
      const payload = {
        selectedSupplier: bid?.supplier?._id,
        status: "Accepted",
      };

      const endpoint = `${BACKEND_PORT}/api/inventory-requests/accept/${item?._id}`;

      const response = await axios.patch(endpoint, { ...payload });

      if (response.status === 200) {
        showToast("success", "Bid Accepted", `Accepted bid from ${bid.supplier?.name || "Unknown"}`);
        bottomSheetRef.current?.dismiss();
      }
    } catch (error) {
      console.error("Error accepting bid:", error);
      showToast("error", "Failed", "Could not accept bid");
    }
  };

  const deadlineDate = new Date(item?.deadline);
  const today = new Date();
  const diffTime = deadlineDate - today;
  const daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  const deadlineLabel = daysRemaining >= 0 ? `${daysRemaining} days remaining` : "Deadline passed";

  // Render each bid item in the FlatList
  const renderBidItem = ({ item: bid }) => {
    console.log(item);
    return (
      <View style={styles.bidItemContainer}>
        <View style={styles.bidInfo}>
          <Text style={styles.bidSupplier}>Supplier: {bid.supplier?.name || "Unknown"}</Text>
          <Text style={styles.bidPrice}>KES {bid.bidPrice}</Text>
          <Text style={styles.bidStatus}>Status: {bid.status}</Text>
        </View>
        <TouchableOpacity style={styles.acceptButton} onPress={() => handleAcceptBid(bid)}>
          <Text style={styles.acceptButtonText}>Accept</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <BottomSheetModal
      ref={bottomSheetRef}
      index={1}
      snapPoints={snapPoints}
      onChange={(index) => {}}
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
            <Text style={styles.productTitle}>Product Details</Text>
          </View>

          {/* Product Image */}
          {item?.imageUrl && <Image source={{ uri: item.imageUrl }} style={styles.productImage} />}

          {/* Product Info */}
          <View style={styles.productInfo}>
            <View style={styles.flexmex}>
              <Text style={styles.productName}>{item?.productName || "Product Name Here"}</Text>
              <Text
                style={{
                  backgroundColor: daysRemaining >= 0 ? "#C0DAFF" : daysRemaining < 0 ? "#F3D0CE" : COLORS.themey,
                  paddingVertical: 4,
                  paddingHorizontal: 8,
                  borderRadius: SIZES.medium,
                  width: 125,
                  textAlign: "center",
                  fontWeight: "bold",
                  color: daysRemaining >= 0 ? "#337DE7" : daysRemaining < 0 ? "#B65454" : COLORS.primary,
                }}
              >
                {deadlineLabel}
              </Text>
            </View>

            <Text style={styles.supplier} numberOfLines={1}>
              {`${item?.quantity} units bid`}
            </Text>
            <Text style={styles.productSupplier}>{item?.supplier || "No Supplier Yet"}</Text>
            <Text style={styles.productPrice}>KES {item?.expectedPrice || "0"}</Text>
            <Text style={styles.productDescription}>{item?.bidDescription || "Product description goes here."}</Text>
          </View>

          {/* Supplier Bids List */}
          {item?.bids?.length > 0 && (
            <View style={styles.bidsContainer}>
              <Text style={styles.bidsTitle}>Supplier Bids</Text>
              <FlatList
                data={item.bids}
                keyExtractor={(bid, index) => index.toString()}
                renderItem={renderBidItem}
                scrollEnabled={false}
              />
            </View>
          )}

          {/* Action Buttons */}
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => {
              bottomSheetRef.current?.dismiss();
              userLogin
                ? navigation.navigate("EditProduct", { item, productold: product })
                : showToast("error", "Oops!", "Please log in to continue ");
            }}
          >
            <Text style={styles.actionButtonText}>Edit Product</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => {
              bottomSheetRef.current?.dismiss();
              navigation.navigate("AddBid", { product: item });
            }}
          >
            <Text style={styles.actionButtonText}>New Supply Bid</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </BottomSheetModal>
  );
});

export default BidToInventory;

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
    height: 200,
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
});
