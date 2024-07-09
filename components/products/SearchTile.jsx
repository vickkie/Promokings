import { View, Text, TouchableOpacity, Image, ScrollView } from "react-native";
import React from "react";
import { COLORS, SIZES, SHADOWS } from "../../constants";
import styles from "./searchtile.style";

import { useNavigation } from "@react-navigation/native";

const SearchTile = ({ item }) => {
  const navigation = useNavigation();

  return (
    <View>
      <TouchableOpacity onPress={() => navigation.navigate("ProductDetails", (item = { item }))}>
        <View style={styles.container}>
          <Image source={{ uri: item.imageUrl }} style={styles.image} />
          <View style={styles.textContainer}>
            <Text style={styles.productTitle}>{item.title}</Text>
          </View>
        </View>
      </TouchableOpacity>
    </View>
  );
};

export default SearchTile;
