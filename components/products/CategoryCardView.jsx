import { Text, TouchableOpacity, View, Image } from "react-native";
import React from "react";
import { COLORS, SIZES } from "../../constants";
import styles from "./categorycardview.style";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

const CategoryCardView = ({ item }) => {
  const navigation = useNavigation();

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
          <Image source={{ uri: item.imageUrl }} style={styles.image} />
        </View>
        <View style={styles.details}>
          <Text style={styles.title} numberOfLines={1}>
            {item.title}
          </Text>
        </View>

        <TouchableOpacity style={styles.addBtn} onPress={() => {}}>
          <Ionicons name="heart-outline" size={24}></Ionicons>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
};

export default CategoryCardView;
