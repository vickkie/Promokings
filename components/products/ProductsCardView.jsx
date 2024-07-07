import { StyleSheet, Text, TouchableOpacity, View, Image, SafeAreaView } from "react-native";
import React from "react";
import { COLORS, SIZES } from "../../constants";
import styles from "./productcardview.style";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

const ProductsCardView = () => {
  const navigation = useNavigation();
  return (
    <TouchableOpacity
      onPress={() => {
        navigation.navigate("ProductDetails");
      }}
    >
      <View style={styles.container}>
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: "https://promokings.co.ke/wp-content/uploads/2023/04/promo-signage.jpg" }}
            style={styles.image}
          />
        </View>
        <View style={styles.details}>
          <Text style={styles.title} numberOfLines={1}>
            Board design
          </Text>
          <Text style={styles.supplier} numberOfLines={1}>
            Product
          </Text>
          <Text style={styles.price}>Kshs 300</Text>
        </View>
        <TouchableOpacity style={styles.addBtn}>
          <Ionicons name="heart-outline" size={24}></Ionicons>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
};

export default ProductsCardView;
