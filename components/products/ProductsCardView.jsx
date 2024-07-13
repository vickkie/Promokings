import { StyleSheet, Text, TouchableOpacity, View, Image, SafeAreaView } from "react-native";
import React from "react";
import { COLORS, SIZES } from "../../constants";
import styles from "./productcardview.style";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import Animated, { SharedTransition } from "react-native-reanimated";

const ProductsCardView = ({ item }) => {
  const navigation = useNavigation();

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

        <TouchableOpacity style={styles.addBtn} onPress={() => {}}>
          <Ionicons name="heart-outline" size={24}></Ionicons>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
};

export default ProductsCardView;
