import { Text, TouchableOpacity, View, Image } from "react-native";
import React, { useState, useEffect, useContext } from "react";
import { COLORS, SIZES } from "../../constants";
import styles from "./productcardview.style";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import usePost from "../../hook/usePost";
import { AuthContext } from "../auth/AuthContext";
import Toast from "react-native-toast-message";
import * as FileSystem from "expo-file-system";

// Function to cache image
const cacheImage = async (uri) => {
  try {
    // Extract file extension if present
    const extension = uri.split(".").pop().split(/\#|\?/)[0]; // Handles query params/fragments
    const safeName = uri.replace(/[^a-zA-Z0-9]/g, "_"); // Replace unsafe chars with _
    const fileName = `${safeName}.${extension}`; // Append extension properly
    const fileUri = FileSystem.documentDirectory + fileName;

    const { exists } = await FileSystem.getInfoAsync(fileUri);
    if (!exists) {
      // console.log(`Downloading image to ${fileUri}`);
      await FileSystem.downloadAsync(uri, fileUri);
    } else {
      // console.log(`Image already cached at ${fileUri}`);
    }
    return fileUri;
  } catch (error) {
    return uri; // Fallback if caching fails
  }
};

const ProductsCardView = ({ item, refetch }) => {
  const navigation = useNavigation();
  const [isWished, setIsWished] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [imageUri, setImageUri] = useState(null);

  const {
    updateStatus,
    isLoading: isLoadingFavourites,
    error: favouritesError,
    errorMessage,
    addCart: addFavourite,
  } = usePost("favourites");

  const { userData, userLogin } = useContext(AuthContext);
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    if (!userLogin) {
      setUserId(1); // Default user ID for demonstration purposes && test
    } else if (userData && userData._id) {
      setUserId(userData._id);
    }
  }, [userLogin, userData]);

  useEffect(() => {
    const loadImage = async () => {
      if (item.imageUrl) {
        const cachedUri = await cacheImage(item.imageUrl);
        setImageUri(cachedUri);
      }
    };
    loadImage();
  }, [item.imageUrl]);

  const addWishlist = async () => {
    setIsWished(!isWished);

    if (userLogin && item._id) {
      const cartData = {
        userId: userId,
        favouriteItem: item._id,
      };
      try {
        addFavourite(cartData);

        showToast("success", "Added to your wishlist", "Item was successfully added");
      } catch (error) {
        // console.log(error);
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

  if (item) {
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
            <Image
              source={{ uri: imageUri || item.imageUrl }}
              style={styles.image}
              sharedTransitionTag={transitionTag}
            />
          </View>
          <View style={styles.details}>
            <Text style={styles.title} numberOfLines={1}>
              {item.title}
            </Text>
            <Text style={styles.supplier} numberOfLines={1}>
              {item.supplier}
            </Text>
            <Text style={styles.price}>Ksh {parseInt(item.price.replace("$", "")).toLocaleString()}</Text>
          </View>

          <TouchableOpacity style={styles.addBtn} onPress={addWishlist}>
            {isWished ? (
              <Ionicons name="heart" size={26} color={COLORS.primary} />
            ) : (
              <Ionicons name="heart-outline" size={26} color={COLORS.primary} />
            )}
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  }
};

export default ProductsCardView;
