import React, { useState, useContext, useEffect } from "react";

import { COLORS, SIZES } from "../constants";

import { SafeAreaView } from "react-native-safe-area-context";
import { StyleSheet, View, Text, ScrollView, TouchableOpacity } from "react-native";
import CategoriesList from "../components/products/CategoriesList";
import { useNavigation } from "@react-navigation/native";
import Icon from "../constants/icons";
import { useCart } from "../contexts/CartContext";

const Categories = () => {
  const navigation = useNavigation();
  const { cartCount } = useCart();

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
              {cartCount !== 0 ? <Text style={styles.number}>{cartCount}</Text> : <Text style={styles.number}>0</Text>}
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

const styles = StyleSheet.create({
  textStyles: {
    fontFamily: "bold",
    fontSize: 19,
  },
  heading: {
    fontFamily: "bold",
    textTransform: "uppercase",
    fontSize: SIZES.large,
    textAlign: "center",
    color: COLORS.themeb,
  },
  container: {
    flex: 1,
    backgroundColor: COLORS.black,
  },
  wrapper: {
    flex: 1,
    backgroundColor: COLORS.white,
  },

  upperRow: {
    width: SIZES.width - 14,
    marginHorizontal: SIZES.xSmall - 4,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    position: "absolute",
    backgroundColor: COLORS.themeg,
    borderRadius: SIZES.large,
    top: SIZES.xxSmall,
    zIndex: 999,
    height: 120,
  },

  backBtn: {
    left: 10,
  },
  buttonWrap: {
    backgroundColor: COLORS.white,
    padding: 15,
    borderRadius: 100,
    justifyContent: "center",
    alignItems: "center",
    marginEnd: 10,
  },
  numbers: {
    // padding: 3,
    width: 20,
    height: 20,
    backgroundColor: COLORS.themey,
    color: COLORS.themew,
    borderRadius: 100,
    position: "absolute",
    top: "-6%",
    left: "-5%",
    justifyContent: "center",
    alignItems: "center",
  },
  number: {
    color: COLORS.white,
  },
});
