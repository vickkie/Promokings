import { FlatList, Text, View, ActivityIndicator, TouchableOpacity } from "react-native";
import React, { useContext, useState, useEffect } from "react";
import { COLORS, SIZES } from "../../constants";
import styles from "./favourtiteslist.style";
import FavouritesCardVIew from "./FavouritesCardVIew";
import { AuthContext } from "../auth/AuthContext";
import { useNavigation } from "@react-navigation/native";
import useFetch from "../../hook/useFetch";
import { useCart } from "../../contexts/CartContext";
import { useWish } from "../../contexts/WishContext";

const FavouritesList = ({ onWishCountChange, onItemCountChange }) => {
  const { userData, userLogin } = useContext(AuthContext);
  const navigation = useNavigation();
  const { itemCount, handleItemCountChange } = useCart();
  const { wishCount, handleWishCountChange } = useWish();

  const [userId, setUserId] = useState(null);
  const [totals, setTotals] = useState({ subtotal: 0 });
  const [additionalFees, setAdditionalFees] = useState(0);
  const [favouriteCount, setWishCount] = useState(0);

  useEffect(() => {
    if (!userLogin) {
      setUserId(1);
    } else if (userData && userData._id) {
      setUserId(userData._id);
    }
  }, [userLogin, userData]);

  const { data, isLoading, error, refetch } = useFetch(`favourites/${userId}`);

  useEffect(() => {
    if (!isLoading && data !== undefined && data !== null) {
      const products = data.products || [];
      setWishCount(products.length);

      const initialTotals = products.reduce((acc, item) => {
        if (item.favouriteItem && item.favouriteItem.price) {
          const parsedPrice = parseFloat(item.favouriteItem.price.replace(/[^0-9.-]+/g, ""));
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

  const handleRefetch = () => {
    refetch();
  };

  const updateTotalAmount = (adjustment) => {
    setTotals((prevTotals) => ({
      ...prevTotals,
      subtotal: prevTotals.subtotal + adjustment,
    }));
  };

  useEffect(() => {
    handleItemCountChange(itemCount);
  }, [itemCount, onItemCountChange]);

  useEffect(() => {
    handleWishCountChange(favouriteCount);
  }, [favouriteCount, onWishCountChange]);

  if (isLoading) {
    return (
      <View style={styles.errorcontainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  const products = (data && data.products) || [];

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
            <FavouritesCardVIew item={item} handleRefetch={handleRefetch} onUpdateTotal={updateTotalAmount} />
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
    </View>
  );
};

export default FavouritesList;
