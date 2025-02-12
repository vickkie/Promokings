import { Text, TouchableOpacity, View, Image, ScrollView, ActivityIndicator } from "react-native";
import { useRoute } from "@react-navigation/native";
import React, { useState, useContext, useEffect } from "react";
import { Ionicons, Fontisto } from "@expo/vector-icons";
import { COLORS } from "../../constants";
import styles from "./productdetails.style";
// import Animated from "react-native-reanimated";
import Icon from "../../constants/icons";
import usePost from "../../hook/usePost";
import { AuthContext } from "../auth/AuthContext";
import useFetch from "../../hook/useFetch";
import Toast from "react-native-toast-message";

import { useCart } from "../../contexts/CartContext";
const ProductDetails = ({ navigation }) => {
  const { addToCart, cart } = useCart();

  const route = useRoute();
  const { item } = route.params;
  const [isWished, setIsWished] = useState(false);
  const [count, setCount] = useState(1);
  const [selectedSize, setSelectedSize] = useState("M");
  const [isExpanded, setIsExpanded] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [isAdded, setisAdded] = useState(false);

  const sizes = ["XS", "S", "M", "L", "XL"];
  const parsedPrice = item.price ? parseFloat(item.price.replace(/[^0-9.-]+/g, "")) : 0;
  const [shortDescription, setShortDescription] = useState("");

  const { isLoading: isLoadingCart, error: cartError, addCart } = usePost("carts/");
  const {
    updateStatus,
    isLoading: isLoadingFavourites,
    error: favouritesError,
    errorMessage,
    addCart: addFavourite,
  } = usePost(`favourites`);

  const [itemDescription, setItemDescription] = useState(item.description || ".");
  const { userData, userLogin } = useContext(AuthContext);
  const [userId, setUserId] = useState(null);
  const { data, refetch } = useFetch(`products/${item._id}`);

  useEffect(() => {
    if (data) {
      setItemDescription(data.description);
    }
  }, [data, refetch, itemDescription]);

  useEffect(() => {
    if (!userLogin) {
      setUserId(1); // Default user ID for demonstration purposes && test
    } else if (userData && userData._id) {
      setUserId(userData._id);
    }
  }, [userLogin, userData]);

  const processDescription = () => {
    if (itemDescription) {
      const splitDescription = itemDescription.split(". ");
      const firstLine = splitDescription[0];
      setShortDescription(firstLine);
    }
  };

  useEffect(() => {
    processDescription();
  }, [itemDescription]);

  const increment = () => {
    setCount(count + 1);
  };

  const decrement = () => {
    if (count > 1) {
      setCount(count - 1);
    }
  };

  const addNow = () => {
    useEffect(() => {
      setisAdded(true);
    }, []);
  };

  const addWishlist = async () => {
    setIsWished(!isWished);

    if (userLogin && item._id) {
      const cartData = {
        userId: userId,
        favouriteItem: item._id,
      };
      try {
        addFavourite(cartData);
        if (updateStatus == 200) {
          showToast("success", "Success", "Added to Wishlist ⭐⭐");
        }
      } catch (error) {
        // console.log(error);
        showToast("error", "Error occurred", "Failed to add to wishlist");
      }
    }
  };

  const handleAddToCart = () => {
    console.log("cartitem clicked");
    const cartItem = {
      id: item._id,
      title: item.title,
      imageUrl: item.imageUrl,
      price: parsedPrice,
      quantity: count > 0 ? count : 1,
      size: selectedSize,
    };

    console.log("cartitem", cartItem);

    addToCart(cartItem);
    setisAdded(true);
    showToast("success", "Added to Cart", `${item.title} added to cart 🛒`);
  };

  const showToast = (type, text1, text2) => {
    Toast.show({
      type: type,
      text1: text1,
      text2: text2,
    });
  };

  const transitionTag = item._id ? `${item._id}` : null;

  return (
    <ScrollView>
      <View style={styles.container}>
        <View style={styles.upperRow}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="chevron-back-circle" size={32} />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => {
              addWishlist();
            }}
            style={styles.buttonWrap2}
          >
            {isWished ? (
              <Ionicons name="heart" size={26} color={COLORS.primary} />
            ) : (
              <Ionicons name="heart-outline" size={26} color={COLORS.primary} />
            )}
          </TouchableOpacity>
        </View>
        <View style={styles.cartView}>
          <TouchableOpacity onPress={() => navigation.navigate("Cart")} style={styles.buttonWrap1}>
            <Icon size={26} name="cart" />
            <View style={styles.numbers}>
              {cart.length > 0 ? (
                <Text style={styles.number}>{cart.length}</Text>
              ) : (
                <Text style={styles.number}>0</Text>
              )}
            </View>
          </TouchableOpacity>
        </View>

        <View style={styles.imageWrapper}>
          <Image source={{ uri: item.imageUrl }} sharedTransitionTag={transitionTag} style={styles.image} />
        </View>
        <View style={styles.containerWrapper}>
          <View style={styles.details}>
            <View style={styles.titleRow}>
              <Text style={styles.title}>{item.title}</Text>
            </View>
            <View style={styles.ratingRow}>
              <View style={styles.priceWrapper}>
                <Text style={styles.price}>
                  {`Ksh ${new Intl.NumberFormat("en-US", { style: "currency", currency: "KES" })
                    .format(parsedPrice)
                    .replace("KES", "")
                    .trim()}`}
                </Text>
              </View>
              <View>
                <TouchableOpacity
                  onPress={() => {
                    userLogin
                      ? navigation.navigate("Help", {
                          item_id: item._id,
                          item_name: item.title,
                          item_image: item.imageUrl,
                        })
                      : showToast("error", "Oops!", "Please log in to continue your inquiry.");
                  }}
                  style={styles.helpBtn}
                >
                  <Text style={styles.helpBtnText}>Inquire</Text>
                  <Icon name="messagefilled" size={37} />
                </TouchableOpacity>
              </View>
            </View>
            <View style={styles.sizeWrapper}>
              <View style={styles.sizeInnerWrapper}>
                <Text style={styles.sizeHeader}>Select Size:</Text>
              </View>
              <View style={styles.sizeButtons}>
                {sizes.map((size, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[styles.sizeButton, selectedSize === size && styles.selectedSizeButton]}
                    onPress={() => setSelectedSize(size)}
                  >
                    <Text style={[styles.sizeButtonText, selectedSize === size && styles.selectedSizeButtonText]}>
                      {size}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
            {!isExpanded ? (
              <View style={styles.shortDescription}>
                <Text style={styles.description}>{shortDescription}.</Text>
              </View>
            ) : (
              ""
            )}
            <TouchableOpacity style={styles.expandableHeader} onPress={() => setIsExpanded(!isExpanded)}>
              <Text style={styles.expandableHeaderText}>{isExpanded ? "Less Description" : " Description"}</Text>
              {!isExpanded ? <Icon name={"down"} size={24} /> : <Icon name={"up"} size={24} />}
            </TouchableOpacity>
            {isExpanded && (
              <View style={styles.expandableContent}>
                <Text style={styles.description}>{item.description}</Text>
              </View>
            )}
            <View style={styles.cartRow}>
              <TouchableOpacity onPress={handleAddToCart} style={styles.cartBtn}>
                {isLoadingCart ? (
                  <ActivityIndicator size="small" color={COLORS.white} />
                ) : feedback ? (
                  <Text style={styles.cartTitle}>
                    {feedback.status === "error" ? "Failed to add" : "Added to cart successfully"}
                  </Text>
                ) : (
                  <Text style={styles.cartTitle}>Order now</Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity onPress={handleAddToCart} style={styles.addBtn}>
                {isLoadingCart ? (
                  <ActivityIndicator size="small" color={COLORS.lightWhite} />
                ) : feedback ? (
                  feedback.status === "error" ? (
                    <Ionicons name="ios-close-circle-outline" color={COLORS.red} size={32} />
                  ) : (
                    <Ionicons name="ios-checkmark-circle-outline" color={COLORS.green} size={32} />
                  )
                ) : (
                  <Fontisto name="shopping-bag" color={COLORS.lightWhite} size={17} />
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

export default ProductDetails;
