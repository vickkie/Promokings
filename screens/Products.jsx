import { View, Text, TouchableOpacity } from "react-native";
import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import styles from "./products.style";
import ProductList from "../components/products/ProductList";
import Icon from "../constants/icons";

const Products = ({ navigation }) => {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.wrapper}>
        <View style={styles.upperRow}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.buttonWrap}>
            <Icon size={30} name="backbutton" />
          </TouchableOpacity>
          <Text style={styles.heading}>Products</Text>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.buttonWrap}>
            <Icon size={30} name="heart" />
          </TouchableOpacity>
        </View>
        <ProductList />
      </View>
    </SafeAreaView>
  );
};

export default Products;
