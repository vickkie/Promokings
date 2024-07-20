import React, { useState, useContext, useEffect } from "react";
import styles from "./categories.style";
import { SafeAreaView } from "react-native-safe-area-context";
import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import CategoriesList from "../components/products/CategoriesList";
import { useNavigation } from "@react-navigation/native";
import Icon from "../constants/icons";
import { useCart } from "../contexts/CartContext";

const Categories = () => {
  const navigation = useNavigation();

  const { itemCount, handleItemCountChange } = useCart();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.wrapper}>
        <View style={styles.upperRow}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={[styles.backBtn, styles.buttonWrap]}>
            <Icon name="backbutton" size={26} />
          </TouchableOpacity>
          <Text style={styles.heading}>All categories</Text>
          <TouchableOpacity
            style={styles.buttonWrap}
            onPress={() => {
              navigation.navigate("Cart");
            }}
          >
            <View style={styles.numbers}>
              {itemCount !== 0 ? <Text style={styles.number}>{itemCount}</Text> : <Text style={styles.number}>0</Text>}
            </View>
            <Icon name="cart" size={26} />
          </TouchableOpacity>
        </View>

        <CategoriesList />
      </View>
    </SafeAreaView>
  );
};

export default Categories;
