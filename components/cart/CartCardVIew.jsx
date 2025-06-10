import { TouchableOpacity, Text, View, Image, Alert } from "react-native";
import React, { useState, useEffect, useContext, useCallback, useRef } from "react";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import styles from "./cartcardview.style";
import Icon from "../../constants/icons";
import Toast from "react-native-toast-message";
import { useCart } from "../../contexts/CartContext";
import { useWish } from "../../contexts/WishContext";
import { Ionicons, Fontisto } from "@expo/vector-icons";
import { COLORS } from "../../constants";

const CartCardView = ({ item, handleRefresh }) => {
  // console.log(item);
  const navigation = useNavigation();
  const { cart, addToCart, removeFromCart } = useCart();
  const { wishlist, wishCount, addToWishlist, removeFromWishlist, clearWishlist } = useWish();

  const { id, title, price, imageUrl, imageUri, quantity, size } = item || {};

  const parsedPrice =
    typeof price === "number" ? price : price != null ? parseFloat(String(price).replace(/[^0-9.-]+/g, "")) || 0 : 0;

  const [count, setCount] = useState(quantity || 1);
  const [selectedSize, setSelectedSize] = useState(size || "M");
  const [totalPrice, setTotalPrice] = useState(parsedPrice * (quantity || 1));
  const [isWished, setIsWished] = useState(false);

  useEffect(() => {
    setTotalPrice(parsedPrice * count);
  }, [count, parsedPrice]);

  useEffect(() => {
    const found = wishlist.some((wishItem) => wishItem.id === item.id && wishItem.size === selectedSize);
    setIsWished(found);
  }, [wishlist, item.id, selectedSize]);

  useFocusEffect(
    useCallback(() => {
      if (!cart || !Array.isArray(cart)) {
        console.warn("Cart is undefined or not an array.");
        return;
      }

      const foundItem = cart.find((cartItem) => cartItem.id === id && cartItem.size === size);

      if (foundItem) {
        setCount(foundItem.quantity);
      } else {
        console.warn("Item not found in cart:", id);
      }
    }, [cart, id, size])
  );

  useEffect(() => {
    setTotalPrice(parsedPrice * count);
  }, [count]);

  const showToast = (type, text1, text2) => {
    Toast.show({
      type: type,
      text1: text1,
      text2: text2 || "",
      visibilityTime: 3000,
    });
  };

  const longPressInterval = useRef(null); // 🔥 Store interval reference

  const increment = () => {
    setCount((prevCount) => {
      const newCount = prevCount + 1;
      addToCart({ ...item, quantity: newCount - prevCount });
      return newCount;
    });
  };

  const decrement = () => {
    setCount((prevCount) => {
      if (prevCount > 1) {
        const newCount = prevCount - 1;
        addToCart({ ...item, quantity: newCount - prevCount });
        return newCount;
      }
      return prevCount;
    });
  };

  // ✅ Start Long Press for Increment (Jump by 10)
  const startLongPressIncrement = () => {
    if (longPressInterval.current) return; // Prevent multiple intervals
    longPressInterval.current = setInterval(() => {
      setCount((prevCount) => {
        const newCount = prevCount + 10;
        addToCart({ ...item, quantity: newCount - prevCount });
        return newCount;
      });
    }, 900); // Increase every 300ms
  };

  // ✅ Start Long Press for Decrement (Jump by 10)
  const startLongPressDecrement = () => {
    if (longPressInterval.current) return;
    longPressInterval.current = setInterval(() => {
      setCount((prevCount) => {
        if (prevCount > 10) {
          const newCount = prevCount - 10;
          addToCart({ ...item, quantity: newCount - prevCount });
          return newCount;
        }
        return prevCount;
      });
    }, 900);
  };

  // ✅ Stop Long Press
  const stopLongPress = () => {
    if (longPressInterval.current) {
      clearInterval(longPressInterval.current);
      longPressInterval.current = null;
    }
  };
  const deleteItem = () => {
    Alert.alert(
      "Remove item",
      "Are you sure you want to remove this item from the cart?",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Remove", onPress: () => removeFromCart(id, size) },
      ],
      { cancelable: true }
    );
  };

  const toggleWishlist = () => {
    const product = {
      id: id,
      title: item.title,
      imageUri: item.imageUri,
      imageUrl: item.imageUrl,
      size: selectedSize,
      price: item.price,
    };
    // console.log(product, "wtf");

    if (isWished) {
      removeFromWishlist(item.id, selectedSize);
      showToast("info", "Removed", `${item.title} removed from wishlist`);
    } else {
      addToWishlist(product);
      showToast("success", "Added to Wishlist", `${item.title} added to wishlist ❤️`);
    }

    setIsWished(!isWished);
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.imageContainer}
        onPress={() => navigation.navigate("ProductDetails", { item: { ...item, _id: id }, itemid: id })}
      >
        <Image source={{ uri: imageUri || imageUrl }} style={styles.image} />
        {/* {console.log("source", imageUri || imageUrl)} */}
      </TouchableOpacity>

      <View style={{ gap: 12 }}>
        <View style={styles.details}>
          <Text style={styles.title} numberOfLines={1}>
            {title.length > 20 ? `${title.substring(0, 20)}...` : title}
          </Text>
          <View style={styles.lovehate}>
            <TouchableOpacity style={styles.lovebuttons} onPress={toggleWishlist}>
              {isWished ? (
                <Ionicons name="heart" size={20} color={COLORS.primary} />
              ) : (
                <Ionicons name="heart-outline" size={20} color={COLORS.primary} />
              )}
            </TouchableOpacity>
            <TouchableOpacity style={styles.lovebuttons} onPress={deleteItem}>
              <Icon name="delete" size={18} />
            </TouchableOpacity>
          </View>
        </View>

        <Text style={styles.size}>SIZE-{size}</Text>

        <View style={styles.priceadd}>
          <View style={styles.addminus}>
            <TouchableOpacity
              style={styles.addBtn}
              onPress={decrement}
              onLongPress={startLongPressDecrement}
              onPressOut={stopLongPress}
            >
              <Icon name="minus" size={24} />
            </TouchableOpacity>
            <Text style={styles.quantity}>{count}</Text>
            <TouchableOpacity
              style={styles.addBtn}
              onPress={increment}
              onLongPress={startLongPressIncrement}
              onPressOut={stopLongPress}
            >
              <Icon name="add" size={24} />
            </TouchableOpacity>
          </View>
          <Text style={styles.price}>{`Ksh ${totalPrice.toLocaleString()}`}</Text>
        </View>
      </View>
    </View>
  );
};

export default CartCardView;
