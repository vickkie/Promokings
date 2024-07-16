import { Text, TouchableOpacity, View, Image, ScrollView, ActivityIndicator } from "react-native";
import { useRoute } from "@react-navigation/native";
import React, { useState, useContext, useEffect } from "react";
import { Ionicons, SimpleLineIcons, Fontisto } from "@expo/vector-icons";
import { COLORS } from "../../constants";
import styles from "./productdetails.style";
import { SafeAreaView } from "react-native-safe-area-context";
import Animated from "react-native-reanimated";
import Icon from "../../constants/icons";
import usePost from "../../hook/usePost";
import { AuthContext } from "../auth/AuthContext";

const ProductDetails = ({ navigation }) => {
  const route = useRoute();
  const { item } = route.params;
  const [isWished, setIsWished] = useState(false);
  const [count, setCount] = useState(1);
  const [selectedSize, setSelectedSize] = useState("M");
  const [isExpanded, setIsExpanded] = useState(false);

  const sizes = ["XS", "S", "M", "L", "XL"];
  const parsedPrice = parseFloat(item.price.replace(/[^0-9.-]+/g, ""));
  const [shortDescription, setShortDescription] = useState("");

  const { isLoading, updateStatus, error, addCart } = usePost("carts/");
  const [quantity, setQuantity] = useState(1);

  const { userData, userLogin, productCount } = useContext(AuthContext);
  const [userId, setUserId] = useState(null);
  const [errorHere, setErrorHere] = useState(false);

  useEffect(() => {
    if (!userLogin) {
      setUserId(1); // Default user ID for demonstration purposes
    } else if (userData && userData._id) {
      setUserId(userData._id);
    }
  }, [userLogin, userData]);

  const processDescription = () => {
    const splitDescription = item.description.split(". ");
    const firstLine = splitDescription[0];
    setShortDescription(firstLine);
  };

  useEffect(() => {
    processDescription();
  }, [item.description]);

  const increment = () => {
    setCount(count + 1);
  };

  const decrement = () => {
    if (count > 1) {
      setCount(count - 1);
    }
  };

  const addWishlist = () => {
    setIsWished(!isWished);
  };

  const addToCart = () => {
    if (userId && item._id) {
      const cartData = {
        userId: userId,
        cartItem: item._id,
        quantity: quantity,
        size: selectedSize,
      };
      addCart(cartData);
      setErrorHere(false);
    } else {
      setErrorHere(true);
    }
  };

  const transitionTag = item._id ? `${item._id}` : null;

  return (
    <ScrollView>
      <View style={styles.container}>
        <View style={styles.upperRow}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="chevron-back-circle" size={32} />
          </TouchableOpacity>
          <TouchableOpacity onPress={addWishlist}>
            {isWished ? (
              <Ionicons name="heart" size={32} color={COLORS.primary} />
            ) : (
              <Ionicons name="heart-outline" size={32} color={COLORS.primary} />
            )}
          </TouchableOpacity>
        </View>
        <View style={styles.imageWrapper}>
          <Animated.Image source={{ uri: item.imageUrl }} sharedTransitionTag={transitionTag} style={styles.image} />
        </View>
        <View style={styles.containerWrapper}>
          <View style={styles.details}>
            <View style={styles.titleRow}>
              <Text style={styles.title}>{item.title}</Text>
            </View>
            <View style={styles.ratingRow}>
              <View style={styles.priceWrapper}>
                <Text style={styles.price}>
                  {`KES ${new Intl.NumberFormat("en-US", { style: "currency", currency: "KES" })
                    .format(parsedPrice)
                    .replace("KES", "")
                    .trim()}`}
                </Text>
              </View>
              <View style={styles.rating}>
                {[1, 2, 3, 4, 5].map((index) => (
                  <Ionicons key={index} name="star" size={16} color="gold" />
                ))}
                <Text style={styles.ratingText}>(5.0)</Text>
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
              <TouchableOpacity
                onPress={() => {
                  addToCart();
                }}
                style={styles.cartBtn}
              >
                {!isLoading ? (
                  <Text style={styles.cartTitle}>Order now</Text>
                ) : (
                  <ActivityIndicator size="small" color={COLORS.white} />
                )}
              </TouchableOpacity>

              <TouchableOpacity onPress={addToCart} style={styles.addBtn}>
                {!errorHere === true ? (
                  <Fontisto name="shopping-bag" color={COLORS.lightWhite} size={17} />
                ) : (
                  <Ionicons name="close-circle-outline" color={COLORS.red} size={32} />
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
