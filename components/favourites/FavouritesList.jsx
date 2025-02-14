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
import LottieView from "lottie-react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

const FavouritesList = ({ wishlist = [] }) => {
  const { userData, userLogin } = useContext(AuthContext);
  const navigation = useNavigation();
  const { cart, cartCount, addToCart, removeFromCart, clearCart } = useCart();
  const { wishCount, addToWishlist, removeFromWishlist, clearWishlist } = useWish();

  const [userId, setUserId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [totals, setTotals] = useState({ subtotal: 0 });
  const [additionalFees, setAdditionalFees] = useState(0);

  useEffect(() => {
    if (!userLogin) {
      setUserId(1);
    } else if (userData && userData._id) {
      setUserId(userData._id);
    }
  }, [userLogin, userData]);

  const calculateTotals = (wishlist) => {
    if (!Array.isArray(wishlist)) return;

    const initialTotals = wishlist.reduce((acc, item) => {
      if (item.price) {
        const parsedPrice =
          typeof price === "number"
            ? item.price
            : item.price != null
            ? parseFloat(String(item.price).replace(/[^0-9.-]+/g, ""))
            : 0;

        const totalPrice = parsedPrice * (item.quantity || 1);
        acc[item.id] = totalPrice;
      }
      return acc;
    }, {});

    const initialSubtotal = Object.values(initialTotals).reduce((acc, price) => acc + price, 0);
    setTotals((prevTotals) => ({ ...prevTotals, ...initialTotals, subtotal: initialSubtotal }));
  };

  useEffect(() => {
    calculateTotals(wishlist);
  }, [wishlist]);

  const estimatedAmount = (totals.subtotal || 0) + (additionalFees || 0);

  const handleRefetch = async () => {
    try {
      const storedWish = await AsyncStorage.getItem("wishlist");
      const parsedWish = storedWish ? JSON.parse(storedWish) : [];
      calculateTotals(parsedWish);
    } catch (error) {
      console.error("Error refreshing wishlist:", error);
    }
  };

  const updateTotalAmount = (adjustment) => {
    setTotals((prevTotals) => ({
      ...prevTotals,
      subtotal: prevTotals.subtotal + adjustment,
    }));
  };

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

  if (!wishlist || wishlist.length === 0) {
    return (
      <View style={styles.containerx}>
        <View style={styles.containLottie}>
          <View style={styles.animationWrapper}>
            <LottieView source={require("../../assets/data/nodata.json")} autoPlay loop style={styles.animation} />
          </View>
          <View style={{ marginTop: 0, paddingBottom: 10 }}>
            <Text style={{ fontFamily: "GtAlpine", fontSize: SIZES.medium }}>Empty, Find and save items you like!</Text>
          </View>
        </View>
      </View>
    );
  }

  return (
    <View>
      <View style={styles.container}>
        <FlatList
          keyExtractor={(product) => (product.id ? product.id.toString() : Math.random().toString())}
          contentContainerStyle={[{ columnGap: SIZES.medium }, wishlist.length > 0 ? styles.wrapper : styles.none]}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          numColumns={1}
          scrollEnabled={false}
          data={wishlist}
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
