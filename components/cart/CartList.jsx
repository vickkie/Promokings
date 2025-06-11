import { FlatList, Text, View, TouchableOpacity } from "react-native";
import React, { useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { COLORS, SIZES } from "../../constants";
import styles from "./cartlist.style";
import CartCardVIew from "./CartCardVIew";
import { useNavigation } from "@react-navigation/native";
import LottieView from "lottie-react-native";

const CartList = ({ cart }) => {
  const navigation = useNavigation();
  const [totals, setTotals] = useState({ subtotal: 0 });
  const [additionalFees, setAdditionalFees] = useState(0);
  const estimatedAmount = totals.subtotal + additionalFees;

  useEffect(() => {
    calculateTotals(cart);
  }, [cart]);

  const calculateTotals = (cartItems) => {
    const subtotal = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
    setTotals({ subtotal });
  };

  const handleRefetch = async () => {
    try {
      const storedCart = await AsyncStorage.getItem("cart");
      const parsedCart = storedCart ? JSON.parse(storedCart) : [];
      calculateTotals(parsedCart);
    } catch (error) {
      console.error("Error refreshing cart:", error);
    }
  };

  if (!cart || cart.length === 0) {
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

  return (
    <View>
      <View style={styles.container}>
        {/* {console.log(cart)} */}
        <FlatList
          keyExtractor={(item, index) => {
            const key = `${item.id}-${item.size ?? index}`;
            // console.log("🧩 key:", key);
            return key;
          }}
          nestedScrollEnabled={true}
          scrollEnabled={false}
          data={cart}
          renderItem={({ item }) => <CartCardVIew item={item} handleRefetch={handleRefetch} />}
        />
      </View>

      <View style={styles.subtotalWrapper}>
        <View style={styles.topSubtotal}>
          <Text style={styles.additionalHeader}>Subtotal amount</Text>
          <Text style={styles.amounts}>Ksh {totals.subtotal.toLocaleString()}</Text>
        </View>
        <View style={styles.centerSubtotal}>
          <Text style={styles.additionalHeader}>Additional fees</Text>
          <Text style={styles.amounts}>Ksh {additionalFees.toFixed(2)}</Text>
        </View>
        <View style={styles.centerSubtotal}>
          <Text style={styles.subtotalHeader}>Estimated Amount</Text>
          <Text style={[styles.amounts, styles.totalAmount]}>Ksh {estimatedAmount.toLocaleString()}</Text>
        </View>
      </View>

      <TouchableOpacity
        style={styles.checkoutBtnWrapper}
        onPress={() => {
          if (estimatedAmount > 0 && cart.length > 0) {
            navigation.navigate("Checkout", { estimatedAmount, products: cart, totals, additionalFees });
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
