import { TouchableOpacity, Text, View, Image, Alert } from "react-native";
import React, { useState, useEffect, useContext, memo } from "react";
import { useNavigation } from "@react-navigation/native";
import styles from "./cartcardview.style";
import Icon from "../../constants/icons";
import useUpdate from "../../hook/useUpdate";
import useDelete from "../../hook/useDelete";
import { AuthContext } from "../auth/AuthContext";

const CartCardView = memo(({ item, handleRefetch, onUpdateTotal }) => {
  const navigation = useNavigation();
  const { userData } = useContext(AuthContext);
  const userId = userData ? userData._id : null;

  const { cartItem, quantity, size } = item || {};

  if (!cartItem) return null; // Return null if cartItem is null or undefined

  const { _id, title, price, imageUrl } = cartItem;

  const parsedPrice = parseFloat(price.replace(/[^0-9.-]+/g, ""));
  const [count, setCount] = useState(quantity);
  const [totalPrice, setTotalPrice] = useState(parsedPrice * quantity);
  const [isWished, setIsWished] = useState(false);

  const { updateStatus: incrementStatus, reupdate: incrementUpdate } = useUpdate("carts/increment");
  const { updateStatus: decrementStatus, reupdate: decrementUpdate } = useUpdate("carts/decrement");
  const { deleteStatus, errorStatus, redelete } = useDelete(`carts/item`, handleRefetch);

  useEffect(() => {
    if (incrementStatus === 200 || decrementStatus === 200) {
      // Handle successful update here if needed
    }
  }, [incrementStatus, decrementStatus]);

  useEffect(() => {
    if (deleteStatus === 200) {
      handleRefetch();
      console.log("Deleted successfully");
    } else if (errorStatus) {
      console.warn(errorStatus);
    }
  }, [deleteStatus, errorStatus]);

  const increment = () => {
    const newCount = count + 1;
    setCount(newCount);
    const newTotalPrice = parsedPrice * newCount;
    const adjustment = newTotalPrice - totalPrice;
    setTotalPrice(newTotalPrice);
    incrementUpdate({ userId, cartItem: _id }); // Update backend
    onUpdateTotal(adjustment); // Notify parent of adjustment
  };

  const decrement = () => {
    if (count > 1) {
      const newCount = count - 1;
      setCount(newCount);
      const newTotalPrice = parsedPrice * newCount;
      const adjustment = newTotalPrice - totalPrice;
      setTotalPrice(newTotalPrice);
      decrementUpdate({ userId, cartItem: _id }); // Update backend
      onUpdateTotal(adjustment); // Notify parent of adjustment
    }
  };

  const addWishlist = () => {
    setIsWished(!isWished);
  };

  const deleteItem = (id) => {
    Alert.alert(
      "Remove item",
      "Are you sure you want to remove item from cart?",
      [
        {
          text: "Cancel",
          onPress: () => console.log("Cancelled"),
          style: "cancel",
        },
        {
          text: "Continue",
          onPress: () => redelete(id),
        },
      ],
      { cancelable: true }
    );
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.imageContainer}
        onPress={() => {
          navigation.navigate("ProductDetails", {
            item: cartItem,
            itemid: cartItem._id,
          });

          console.log(item._id);
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
            <TouchableOpacity style={styles.lovebuttons} onPress={addWishlist}>
              <Icon name="heart" size={18}></Icon>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.lovebuttons}
              onPress={() => {
                console.log(item._id);
                deleteItem(item._id);
              }}
            >
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
          <View style={styles.addminus}>
            <TouchableOpacity style={styles.addBtn} onPress={decrement}>
              <Icon name="minus" size={24}></Icon>
            </TouchableOpacity>
            <Text style={styles.quantity}>{count}</Text>
            <TouchableOpacity style={styles.addBtn} onPress={increment}>
              <Icon name="add" size={24}></Icon>
            </TouchableOpacity>
          </View>

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

export default CartCardView;
