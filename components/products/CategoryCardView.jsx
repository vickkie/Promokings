import { Text, TouchableOpacity, View, Image } from "react-native";
import React from "react";
import styles from "./categorycardview.style";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

const CategoryCardView = ({ item }) => {
  const navigation = useNavigation();

  const routeParam = `products/category/${item.title}`;

  return (
    <TouchableOpacity
      onPress={() => {
        navigation.navigate("ProductList", { routeParam });
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
          <MaterialCommunityIcons name="asterisk" size={24}></MaterialCommunityIcons>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
};

export default CategoryCardView;
