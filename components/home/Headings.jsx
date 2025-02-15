import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { COLORS, SIZES } from "../../constants";
import React from "react";
import { Ionicons } from "@expo/vector-icons";
import styles from "./headings.style";
import { useNavigation } from "@react-navigation/native";
import Icon from "../../constants/icons";

const Headings = ({ heading }) => {
  const routeParam = "products";

  const navigation = useNavigation();
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{heading}</Text>
        <TouchableOpacity
          onPress={() => {
            navigation.navigate("ProductList", { routeParam, category: "All Products" });
          }}
        >
          <Icon name="carousel" size={26} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default Headings;
