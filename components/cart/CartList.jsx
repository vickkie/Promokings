import { FlatList, Text, View, ActivityIndicator, TouchableOpacity } from "react-native";
import React, { useContext, useState, useEffect } from "react";
import { COLORS, SIZES } from "../../constants";
import styles from "./cartlist.style";
import CartCardVIew from "./CartCardVIew";
import useFetch from "../../hook/useFetch";
import { AuthContext } from "../auth/AuthContext";
import { useNavigation } from "@react-navigation/native";
import LottieView from "lottie-react-native";

const CartList = ({ onItemCountChange }) => {
  const { userData, userLogin } = useContext(AuthContext);
  const navigation = useNavigation();

  const [userId, setUserId] = useState(null);
  const [totals, setTotals] = useState({ subtotal: 0 });
  const [additionalFees, setAdditionalFees] = useState(0);
  const [itemCount, setItemCount] = useState(0);

  // Set userId based on login status
  useEffect(() => {
    if (!userLogin) {
      setUserId(1);
    } else if (userData && userData._id) {
      setUserId(userData._id);
    }
  }, [userLogin, userData]);

  // Fetch cart data
  const { data, isLoading, error, refetch } = useFetch(`carts/find/${userId}`);

  // Calculate totals when data is fetched
  useEffect(() => {
    if (!isLoading && data.length !== 0) {
      const products = data[0]?.products || [];

      setItemCount(products.length);
      console.log("products length", products.length);

      const initialTotals = products.reduce((acc, item) => {
        if (item.cartItem && item.cartItem.price) {
          const parsedPrice = parseFloat(item.cartItem.price.replace(/[^0-9.-]+/g, ""));
          const totalPrice = parsedPrice * item.quantity;
          return { ...acc, [item._id]: totalPrice };
        }
        return acc;
      }, {});

      const initialSubtotal = Object.values(initialTotals).reduce((acc, price) => acc + price, 0);
      setTotals((prevTotals) => ({ ...prevTotals, ...initialTotals, subtotal: initialSubtotal }));
    }
  }, [isLoading, data]);

  const estimatedAmount = (totals.subtotal || 0) + (additionalFees || 0);

  // Notify parent component about item count change
  useEffect(() => {
    onItemCountChange(itemCount);
  }, [itemCount, onItemCountChange]);

  const handleRefetch = () => {
    refetch();
  };

  const updateTotalAmount = (adjustment) => {
    setTotals((prevTotals) => ({
      ...prevTotals,
      subtotal: prevTotals.subtotal + adjustment,
    }));
  };

  // Loading state
  if (isLoading) {
    return (
      <View style={styles.containerx}>
        <View style={styles.containLottie}>
          <View style={styles.animationWrapper}>
            <LottieView source={require("../../assets/data/loading.json")} autoPlay loop style={styles.animation} />
          </View>
        </View>
      </View>
    );
  }

  // Error state
  if (error) {
    return (
      <View style={styles.errorcontainer}>
        <Text style={styles.errorMessage}>Error loading cart</Text>
        <TouchableOpacity onPress={handleRefetch} style={styles.retryButton}>
          <Text style={styles.retryButtonText}>Retry Fetch</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const products = data[0]?.products || [];

  // Empty cart state
  if (products.length === 0) {
    return (
      <View style={styles.containerx}>
        <View style={styles.containLottie}>
          <View style={styles.animationWrapper}>
            <LottieView
              source={require("../../assets/data/cartempty.json")}
              autoPlay
              loop={false}
              style={styles.animation}
            />
          </View>
          <View style={{ marginTop: 0, paddingBottom: 10 }}>
            <Text style={{ fontFamily: "GtAlpine", fontSize: SIZES.medium }}>
              "Oops, your cart is empty. Let's fix that!
            </Text>
          </View>
        </View>
      </View>
    );
  }

  // Cart items list
  return (
    <View>
      <View style={styles.container}>
        <FlatList
          keyExtractor={(item) => item._id.toString()}
          contentContainerStyle={[{ columnGap: SIZES.medium }, products.length > 0 ? styles.wrapper : styles.none]}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          numColumns={1}
          scrollEnabled={false}
          data={products}
          renderItem={({ item }) => (
            <CartCardVIew item={item} handleRefetch={handleRefetch} onUpdateTotal={updateTotalAmount} />
          )}
        />
      </View>

      {/* Subtotal and Checkout */}
      <View style={styles.subtotalWrapper}>
        <View style={styles.topSubtotal}>
          <Text style={styles.additionalHeader}>Subtotal amount</Text>
          <Text style={styles.amounts}>Ksh {Number(totals.subtotal.toFixed(2)).toLocaleString()}</Text>
        </View>
        <View style={styles.centerSubtotal}>
          <Text style={styles.additionalHeader}>Additional fees</Text>
          <Text style={styles.amounts}>Ksh {additionalFees.toFixed(2)}</Text>
        </View>
        <View style={styles.centerSubtotal}>
          <Text style={styles.subtotalHeader}>Estimated Amount</Text>
          <Text style={[styles.amounts, styles.totalAmount]}>
            Ksh {Number(estimatedAmount.toFixed(2)).toLocaleString()}
          </Text>
        </View>
      </View>
      <TouchableOpacity
        style={styles.checkoutBtnWrapper}
        onPress={() => {
          if (estimatedAmount > 0 && products.length > 0) {
            navigation.navigate("Checkout", {
              estimatedAmount,
              products,
              totals,
              additionalFees,
            });
          }
        }}
      >
        <View style={styles.checkoutBtn}>
          <Text style={styles.checkoutTxt}>Checkout</Text>
        </View>
      </TouchableOpacity>
    </View>
  );
};

export default CartList;
