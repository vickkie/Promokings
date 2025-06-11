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
import { useWish } from "../../contexts/WishContext";
const ProductDetails = ({ navigation }) => {
  const { addToCart, cart } = useCart();
  const { wishlist, wishCount, addToWishlist, removeFromWishlist, clearWishlist } = useWish();

  const route = useRoute();
  const { item, imageUri } = route.params;
  const [isWished, setIsWished] = useState(false);
  const [count, setCount] = useState(1);
  const [selectedSize, setSelectedSize] = useState("M");
  const [isExpanded, setIsExpanded] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [isAdded, setisAdded] = useState(false);
  const [isLoadingCart, setisLoadingCart] = useState(false);

  const sizes = ["XS", "S", "M", "L", "XL"];

  // ✅ Check if the item is in the wishlist when the component loads
  useEffect(() => {
    const found = wishlist.some((wishItem) => wishItem.id === item._id && wishItem.size === selectedSize);
    setIsWished(found);
  }, [wishlist, item, selectedSize]);

  const { price } = item;
  const parsedPrice =
    typeof price === "number" ? price : price != null ? parseFloat(String(price).replace(/[^0-9.-]+/g, "")) : 0;

  const [shortDescription, setShortDescription] = useState("");
  const [quantity, setQuantity] = useState(10);

  const [itemDescription, setItemDescription] = useState(item.description || ".");
  const { userData, userLogin } = useContext(AuthContext);
  const [userId, setUserId] = useState(null);
  const { data, refetch } = useFetch(`products/${item._id}`);

  useEffect(() => {
    if (!userLogin) {
      setUserId(1); // Default user ID for demonstration purposes && test
    } else if (userData && userData._id) {
      setUserId(userData._id);
    }
  }, [userLogin, userData]);

  useEffect(() => {
    if (data) {
      setItemDescription(data.description);
      setQuantity(data.quantity ? data.quantity : 0);
    }
  }, [data, refetch, itemDescription]);

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

  const handleAddToCart = () => {
    // console.log("cartitem clicked");
    const cartItem = {
      id: item._id,
      title: item.title,
      imageUrl: item.imageUrl,
      imageUri: imageUri,
      price: parsedPrice,
      quantity: count > 0 ? count : 1,
      size: selectedSize,
    };

    // console.log("cartitem", cartItem);

    addToCart(cartItem);
    setisAdded(true);
    showToast("success", "Added to Cart", `${item.title} added to cart 🛒`);
  };

  const toggleWishlist = () => {
    const product = {
      id: item._id,
      title: item.title,
      imageUrl: item.imageUrl,
      imageUri: imageUri,
      size: selectedSize,
      price: item?.price,
      item: item,
    };

    if (isWished) {
      removeFromWishlist(item._id, selectedSize);
      showToast("info", "Removed", `${item.title} removed from wishlist`);
    } else {
      addToWishlist(product);
      showToast("success", "Added to Wishlist", `${item.title} added to wishlist ❤️`);
    }

    setIsWished(!isWished);
  };

  const showToast = (type, text1, text2) => {
    Toast.show({
      type: type,
      text1: text1,
      text2: text2,
    });
  };

  const transitionTag = item._id ? `${item._id}` : null;

  // console.log(imageUri);

  return (
    <ScrollView>
      <View style={styles.container}>
        <View style={styles.upperRow}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="chevron-back-circle" size={32} />
          </TouchableOpacity>
          <TouchableOpacity onPress={toggleWishlist} style={styles.buttonWrap2}>
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
          <Image source={{ uri: imageUri || item.imageUrl }} sharedTransitionTag={transitionTag} style={styles.image} />
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
            {/* {console.log(item)} */}

            <View style={styles.sizeWrapper}>
              <View style={styles.sizeInnerWrapper}>
                <Text style={styles.sizeHeader}>Select Size:</Text>
              </View>
              <View style={styles.sizeButtons}>
                {sizes.map((size, index) => (
                  <TouchableOpacity
                    disabled={item?.sizeApplicable ? false : true}
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
            {!item?.quoteBased ? (
              <View style={styles.cartRow}>
                <TouchableOpacity
                  onPress={() => {
                    handleAddToCart();
                  }}
                  style={[styles.cartBtn]}
                >
                  {isLoadingCart ? (
                    <ActivityIndicator size="small" color={COLORS.white} />
                  ) : feedback ? (
                    <Text style={styles.cartTitle}>
                      {feedback.status === "error" ? "Failed to add" : "Added to cart successfully"}
                    </Text>
                  ) : (
                    <Text style={styles.cartTitle}>{"Order now"}</Text>
                  )}
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => {
                    handleAddToCart();
                  }}
                  style={styles.addBtn}
                >
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
            ) : (
              <View style={styles.cartRow}>
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
                  style={styles.cartBtn2}
                >
                  <Text style={styles.cartTitle}>{"Inquire now"}</Text>
                </TouchableOpacity>

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
                  style={styles.addBtn2}
                >
                  <Fontisto name="phone" color={COLORS.lightWhite} size={17} />
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

export default ProductDetails;
