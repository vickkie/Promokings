import { TouchableOpacity, Text, View, Image, Alert } from "react-native";
import React, { useState, useEffect, useContext, memo } from "react";
import { useNavigation } from "@react-navigation/native";
import styles from "./favouritescardview.style";
import Icon from "../../constants/icons";
import { AuthContext } from "../auth/AuthContext";
import Toast from "react-native-toast-message";
import { useCart } from "../../contexts/CartContext";
import { useWish } from "../../contexts/WishContext";

const FavouritesCardView = memo(({ item, handleRefetch }) => {
  const navigation = useNavigation();
  const { userData } = useContext(AuthContext);
  const { cart, cartCount, addToCart, removeFromCart, clearCart } = useCart();
  const { wishlist, wishCount, addToWishlist, removeFromWishlist, clearWishlist } = useWish();

  const userId = userData ? userData._id : null;

  const { quantity, size, id, title, price, imageUrl } = item || {};
  // console.log(item);

  if (!id) return null; // Return null if favouriteItem is null or undefined

  const parsedPrice =
    typeof price === "number" ? price : price != null ? parseFloat(String(price).replace(/[^0-9.-]+/g, "")) : 0;

  const [feedback, setFeedback] = useState("");

  const deleteItem = (item) => {
    Alert.alert(
      "Remove item",
      "Are you sure you want to remove item from Wishlist?",
      [
        {
          text: "Cancel",
          onPress: () => console.log("Cancelled"),
          style: "cancel",
        },
        {
          text: "Continue",
          onPress: () => {
            removeFromWishlist(id, size);
            handleRefetch();

            showToast("success", "Item was successfully removed from wishlist", "Continue shopping with us");
          },
        },
      ],
      { cancelable: true }
    );
  };

  const handleAddToCart = async (item) => {
    try {
      addToCart(item);
      showToast("success", "Added to Cart", `${item.title} added to cart ❤️`);
    } catch (error) {
      setFeedback({ status: "error", message: "Failed to add to cart" });
      showToast("error", "Error occurred", "Failed to add to cart");
    } finally {
      setTimeout(() => setFeedback(null), 5000); // Revert after 5 seconds
    }
  };

  const showToast = (type, text1, text2) => {
    Toast.show({
      type: type,
      text1: text1,
      text2: text2,
    });
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.imageContainer}
        onPress={() => {
          navigation.navigate("ProductDetails", {
            item: { ...item, _id: id },
            itemid: id,
          });
        }}
      >
        <Image source={{ uri: imageUrl }} style={styles.image} />
      </TouchableOpacity>

      <View style={{ gap: 12 }}>
        <View style={styles.details}>
          <Text style={styles.title} numberOfLines={1}>
            {title.length > 20 ? `${title.substring(0, 20)}...` : title}
          </Text>
          <View style={styles.lovehate}>
            {/* {console.log(item?.item?.category)} */}
            {!(item?.item?.quoteBased || item?.item?.category === "Quote-Based") ? (
              <TouchableOpacity
                style={styles.lovebuttons}
                onPress={() => {
                  if (id && size) {
                    handleAddToCart(item);
                  }
                }}
              >
                <Icon name="cart" size={18} />
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={styles.lovebuttons}
                onPress={() => {
                  userData
                    ? navigation.navigate("Help", {
                        item_id: item._id,
                        item_name: item.title,
                        item_image: item.imageUrl,
                      })
                    : showToast("error", "Oops!", "Please log in to continue your inquiry.");
                }}
              >
                <Icon name="call" size={18} />
              </TouchableOpacity>
            )}

            <TouchableOpacity style={styles.lovebuttons} onPress={deleteItem}>
              <Icon name="delete" size={18}></Icon>
            </TouchableOpacity>
          </View>
        </View>

        <View>
          <Text style={styles.size} numberOfLines={1}>
            SIZE-{size}
          </Text>
        </View>

        <View style={styles.priceadd}>
          <Text style={styles.price}>
            {`Ksh ${new Intl.NumberFormat("en-US", { style: "currency", currency: "KES" })
              .format(parsedPrice)
              .replace("KES", "")
              .trim()}`}
          </Text>
        </View>
      </View>
    </View>
  );
});

export default FavouritesCardView;
