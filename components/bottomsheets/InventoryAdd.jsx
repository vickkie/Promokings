// InventoryAdd.js
import React, { useMemo, useCallback, useRef, forwardRef, useContext, useState, useEffect } from "react";
import { StyleSheet, Text, View, TouchableOpacity, Image, Alert } from "react-native";
import { BottomSheetBackdrop, BottomSheetModal } from "@gorhom/bottom-sheet";
import { COLORS, SIZES } from "../../constants";
import Icon from "../../constants/icons";
import { useNavigation } from "@react-navigation/native";
import { AuthContext } from "../auth/AuthContext";
import Toast from "react-native-toast-message";
import { ScrollView } from "react-native-gesture-handler";

const InventoryAdd = forwardRef((props, ref) => {
  // Assuming product details are passed in props.item
  const { item } = props; // product details object
  const snapPoints = useMemo(() => [460, 570], []);
  const navigation = useNavigation();
  const { userData, userLogout, userLogin } = useContext(AuthContext);

  const [userId, setUserId] = useState(null);

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

  const handleNavigation = (screen) => {
    navigation.navigate(screen);
    bottomSheetRef.current?.dismiss(); // Dismiss the bottom sheet
  };

  const showToast = (type, text1, text2) => {
    Toast.show({
      type: type,
      text1: text1,
      text2: text2 ? text2 : "",
      visibilityTime: 3000,
    });
  };

  return (
    <BottomSheetModal
      ref={bottomSheetRef}
      index={1}
      snapPoints={snapPoints}
      onChange={(index) => {}}
      enablePanDownToClose={false}
      backgroundStyle={{
        backgroundColor: COLORS.themeg,
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
            <View style={styles.flexme}>
              <Text style={styles.productName}>{item?.title || "Product Name"}</Text>

              <Text style={styles.supplier} numberOfLines={1}>
                {`${item?.quantity} units`}
              </Text>
            </View>

            <Text style={styles.productSupplier}>{item?.supplier || "Supplier Name"}</Text>
            <Text style={styles.productPrice}>KES {item?.price || "0"}</Text>
            <Text style={styles.productCategory}>{item?.category || "Category"}</Text>
            <Text style={styles.productDescription}>{item?.description || "Product description goes here."}</Text>
          </View>

          {/* Action Button */}
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => {
              bottomSheetRef.current?.dismiss();
              userLogin
                ? navigation.navigate("EditProduct", {
                    item: item,
                  })
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

export default InventoryAdd;

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
  productName: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.black,
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
    marginVertical: 5,
  },
  productCategory: {
    fontSize: 14,
    color: COLORS.gray,
    marginVertical: 5,
  },
  productDescription: {
    fontSize: 14,
    color: COLORS.black,
    marginTop: 10,
    lineHeight: 20,
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
  flexme: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
  },
});
