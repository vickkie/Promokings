import { FlatList, Text, View, ActivityIndicator, TouchableOpacity } from "react-native";
import React, { useContext, useState, useEffect } from "react";
import { COLORS, SIZES } from "../../constants";
import styles from "./cartlist.style";
import { Ionicons } from "@expo/vector-icons";
import CartCardVIew from "./CartCardVIew";
import useFetch from "../../hook/useFetch";
import { AuthContext } from "../auth/AuthContext";
import { useNavigation } from "@react-navigation/native";

const CartList = ({ onItemCountChange }) => {
  const { userData, userLogin } = useContext(AuthContext);
  const navigation = useNavigation();

  const [userId, setUserId] = useState(null);
  const [totals, setTotals] = useState({ subtotal: 0 });
  const [additionalFees, setAdditionalFees] = useState(0);
  const [itemCount, setItemCount] = useState(0);

  useEffect(() => {
    if (!userLogin) {
      setUserId(1);
    } else if (userData && userData._id) {
      setUserId(userData._id);
    }
  }, [userLogin, userData]);

  const { data, isLoading, error, refetch } = useFetch(`carts/find/${userId}`);

  useEffect(() => {
    if (!isLoading && data.length !== 0) {
      const products = data[0]?.products || [];

      setItemCount(products.length);

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

  if (isLoading) {
    return (
      <View style={styles.errorcontainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

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

  return (
    <View>
      <View style={styles.container}>
        <FlatList
          keyExtractor={(item) => item._id.toString()}
          contentContainerStyle={[{ columnGap: SIZES.medium }, styles.wrapper]}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          numColumns={1}
          scrollEnabled={false}
          data={products}
          renderItem={({ item }) => (
            <CartCardVIew item={item} handleRefetch={handleRefetch} onUpdateTotal={updateTotalAmount} />
          )}
        />
      </View>
      <View style={styles.subtotalWrapper}>
        <View style={styles.topSubtotal}>
          <Text style={styles.additionalHeader}>Subtotal amount</Text>
          <Text style={styles.amounts}>KES {totals.subtotal.toFixed(2)}</Text>
        </View>
        <View style={styles.centerSubtotal}>
          <Text style={styles.additionalHeader}>Additional fees</Text>
          <Text style={styles.amounts}>KES {additionalFees.toFixed(2)}</Text>
        </View>
        <View style={styles.centerSubtotal}>
          <Text style={styles.subtotalHeader}>Estimated Amount</Text>
          <Text style={[styles.amounts, styles.totalAmount]}>KES {estimatedAmount.toFixed(2)}</Text>
        </View>
      </View>
      <TouchableOpacity
        style={styles.checkoutBtnWrapper}
        onPress={() => {
          navigation.navigate("Checkout", { estimatedAmount });
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
