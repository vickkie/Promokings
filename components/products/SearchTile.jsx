import { View, Text } from "react-native";
import React from "react";
import { TouchableOpacity } from "react-native";
import styles from "./SearchTile.style";
import { Image } from "react-native";
import { useNavigation } from "@react-navigation/native";

const SearchTile = ({ item }) => {

  const navigation = useNavigation();

  return (
    <View>
      <TouchableOpacity style={styles.container} onPress={() => navigation.navigate("ProductDetails", {item}) }>
        <View style={styles.image}>
          <Image source={{ uri: item.imageUrl }} style={styles.productImg} />
        </View>

        <View style={styles.textContainer}>
          <Text style={styles.productTitle}> {item.title} </Text>
          <Text style={styles.supplier}> {item.supplier} </Text>
          <Text style={styles.price}> {item.price} </Text>
        </View>
      </TouchableOpacity>
    </View>
  );
};

export default SearchTile;