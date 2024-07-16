import { FlatList, Text, View, ActivityIndicator, TouchableOpacity } from "react-native";
import React, { useContext, useState, useEffect } from "react";
import { COLORS, SIZES } from "../../constants";
import styles from "./cartlist.style";
import { Ionicons } from "@expo/vector-icons";
import CartCardVIew from "./CartCardVIew";

import useFetch from "../../hook/useFetch";
import { AuthContext } from "../auth/AuthContext";
import { ScrollView } from "react-native-gesture-handler";

const CartList = () => {
  const { userData, userLogin } = useContext(AuthContext);

  const [userId, setUserId] = useState(null);
  const [totals, setTotals] = useState({ subtotal: 0, additionalFees: 0 });
  const [estimatedAmount, setestimatedAmount] = useState(0);

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
      const initialTotals = products.reduce((acc, item) => {
        const parsedPrice = parseFloat(item.cartItem.price.replace(/[^0-9.-]+/g, ""));
        const totalPrice = parsedPrice * item.quantity;
        return { ...acc, [item._id]: totalPrice };
      }, {});

      const initialSubtotal = Object.values(initialTotals).reduce((acc, price) => acc + price, 0);
      setTotals((prevTotals) => ({ ...prevTotals, ...initialTotals, subtotal: initialSubtotal }));
    }
  }, [isLoading, data]);

  useEffect(() => {
    setestimatedAmount(totals.subtotal + totals.additionalFees);
  });

  const handleRefetch = () => {
    refetch();
  };

  const updateTotalAmount = (itemId, newTotalPrice) => {
    setTotals((prevTotals) => {
      const updatedTotals = { ...prevTotals, [itemId]: newTotalPrice };
      const subtotal = Object.keys(updatedTotals)
        .filter((key) => key !== "subtotal" && key !== "additionalFees" && key !== "estimatedAmount")
        .reduce((acc, key) => acc + updatedTotals[key], 0);
      return { ...updatedTotals, subtotal };
    });
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

  if (!isLoading && data.length !== 0) {
    return (
      <View>
        <View style={styles.container}>
          <FlatList
            keyExtractor={(item) => item._id.toString()}
            contentContainerStyle={[{ columnGap: SIZES.medium }, styles.wrapper]}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
            numColumns={1}
            data={products}
            renderItem={({ item }) => (
              <CartCardVIew item={item} handleRefetch={handleRefetch} onUpdateTotal={updateTotalAmount} />
            )}
          />
        </View>
        <View style={styles.subtotalWrapper}>
          <View style={styles.topSubtotal}>
            <Text style={styles.additionalHeader}>Subtotal amount</Text>
            <Text style={styles.amounts}>KES {totals.subtotal || 0}</Text>
          </View>
          <View style={styles.centerSubtotal}>
            <Text style={styles.additionalHeader}>Additional fees</Text>
            <Text style={styles.amounts}>KES {totals.additionalFees || 0}</Text>
          </View>
          <View style={styles.centerSubtotal}>
            <Text style={styles.subtotalHeader}>Estimated Amount</Text>
            <Text style={styles.amounts}>KES {estimatedAmount || 0}</Text>
          </View>
        </View>
      </View>
    );
  }
};

export default CartList;
