import { StyleSheet, Text, TouchableOpacity, View, Image } from "react-native";
import React, { useState, useEffect, useContext } from "react";
import { COLORS, SIZES } from "../../constants";
import styles from "./productcardview.style";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import Animated from "react-native-reanimated";
import usePost from "../../hook/usePost";
import { AuthContext } from "../auth/AuthContext";
import Toast from "react-native-toast-message";

const ProductsCardView = ({ item }) => {
  const navigation = useNavigation();
  const [isWished, setIsWished] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const {
    updateStatus,
    isLoading: isLoadingFavourites,
    error: favouritesError,
    errorMessage,
    addCart: addFavourite,
  } = usePost(`favourites`);

  const { userData, userLogin } = useContext(AuthContext);
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    if (!userLogin) {
      setUserId(1); // Default user ID for demonstration purposes && test
    } else if (userData && userData._id) {
      setUserId(userData._id);
    }
  }, [userLogin, userData]);

  const addWishlist = async () => {
    setIsWished(!isWished);

    if (userLogin && item._id) {
      const cartData = {
        userId: userId,
        favouriteItem: item._id,
      };
      try {
        await addFavourite(cartData);
        if (updateStatus == 200) {
          showToast("success", "Success", "Added to your wishlist");
        }
      } catch (error) {
        console.log(error);
        showToast("error", "Ooops, Failed to add to Wishlist", "Try again later");
      } finally {
        setTimeout(() => setFeedback(null), 5000);
      }
    }
  };

  const showToast = (type, text1, text2) => {
    Toast.show({
      type: type,
      text1: text1,
      text2: text2 ? text2 : "",
    });
  };

  const transitionTag = item._id ? `${item._id}` : null;

  return (
    <TouchableOpacity
      onPress={() => {
        navigation.navigate("ProductDetails", {
          item: item,
          itemid: item._id,
        });
      }}
    >
      <View style={styles.container}>
        <View style={styles.imageContainer}>
          <Animated.Image source={{ uri: item.imageUrl }} style={styles.image} sharedTransitionTag={transitionTag} />
        </View>
        <View style={styles.details}>
          <Text style={styles.title} numberOfLines={1}>
            {item.title}
          </Text>
          <Text style={styles.supplier} numberOfLines={1}>
            {item.supplier}
          </Text>
          <Text style={styles.price}>Kshs {parseInt(item.price.replace("$", ""))}</Text>
        </View>

        <TouchableOpacity style={styles.addBtn} onPress={addWishlist}>
          {isWished ? (
            <Ionicons name="heart" size={32} color={COLORS.primary} />
          ) : (
            <Ionicons name="heart-outline" size={32} color={COLORS.primary} />
          )}
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
};

export default ProductsCardView;
