import { TouchableOpacity, Text, View, Image, Alert } from "react-native";
import React, { useState, useEffect, useContext, memo } from "react";
import { useNavigation } from "@react-navigation/native";
import styles from "./favouritescardview.style";
import Icon from "../../constants/icons";
import useDelete from "../../hook/useDelete2";
import { AuthContext } from "../auth/AuthContext";
import usePost from "../../hook/usePost";
import Toast from "react-native-toast-message";

const FavouritesCardView = memo(({ item, handleRefetch }) => {
  const navigation = useNavigation();
  const { userData } = useContext(AuthContext);
  const userId = userData ? userData._id : null;

  const { favouriteItem, quantity, size } = item || {};

  if (!favouriteItem) return null; // Return null if favouriteItem is null or undefined

  const { _id: favouriteItemId, title, price, imageUrl } = favouriteItem;

  const parsedPrice = parseFloat(price.replace(/[^0-9.-]+/g, ""));
  const [totalPrice, setTotalPrice] = useState(parsedPrice * quantity);
  const [isWished, setIsWished] = useState(false);
  const { deleteStatus, errorStatus, redelete } = useDelete(`favourites/${userId}/item/`);
  const { isLoading: isLoadingCart, error: cartError, addCart } = usePost("carts/");
  const [feedback, setFeedback] = useState("");

  useEffect(() => {
    if (deleteStatus === 200) {
      handleRefetch();
      console.log("Deleted successfully");
      showToast("success", "Item was successfully removed from wishlist", "Continue shopping with us");
    } else if (errorStatus) {
      console.warn(errorStatus);
      showToast("error", "Error occurred", errorStatus);
    }
  }, [deleteStatus, errorStatus]);

  const addWishlist = () => {
    setIsWished(!isWished);
  };

  const deleteItem = () => {
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
            redelete(item._id);
          },
        },
      ],
      { cancelable: true }
    );
  };

  const addToCart = async (id) => {
    if (userId && item._id) {
      const cartData = {
        userId: userId,
        cartItem: id,
        quantity: 1,
        size: "M",
      };
      try {
        await addCart(cartData);
        if (!cartError) {
          setFeedback({ status: "success", message: "Added to cart" });
          showToast("success", "Success", "Item has been added to cart 👋");
        } else {
          setFeedback({ status: "error", message: "Failed to add to cart" });
          showToast("error", "Error occurred", "Failed to add to cart");
        }
      } catch (error) {
        setFeedback({ status: "error", message: "Failed to add to cart" });
        showToast("error", "Error occurred", "Failed to add to cart");
      } finally {
        setTimeout(() => setFeedback(null), 5000); // Revert after 5 seconds
      }
    } else {
      setFeedback({ status: "error", message: "Failed to add to cart" });
      showToast("error", "Error occurred", "Failed to add to cart");
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
            item: favouriteItem,
            itemid: favouriteItem._id,
          });
        }}
      >
        <Image source={{ uri: imageUrl }} style={styles.image} />
      </TouchableOpacity>

      <View style={{ gap: 12 }}>
        <View style={styles.details}>
          <Text style={styles.title} numberOfLines={1}>
            {title}
          </Text>
          <View style={styles.lovehate}>
            <TouchableOpacity
              style={styles.lovebuttons}
              onPress={() => {
                if (favouriteItem._id && userId) {
                  addToCart(favouriteItem._id);
                }
              }}
            >
              <Icon name="cart" size={18}></Icon>
            </TouchableOpacity>
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
            {`KES ${new Intl.NumberFormat("en-US", { style: "currency", currency: "KES" })
              .format(totalPrice)
              .replace("KES", "")
              .trim()}`}
          </Text>
        </View>
      </View>
    </View>
  );
});

export default FavouritesCardView;
