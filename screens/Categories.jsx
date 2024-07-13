import React from "react";
import styles from "./categories.style";
import { SafeAreaView } from "react-native-safe-area-context";
import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { COLORS } from "../constants/index";
import { Ionicons } from "@expo/vector-icons";
import CategoriesList from "../components/products/CategoriesList";
import { useNavigation } from "@react-navigation/native";
import BackBtn from "../components/BackBtn";
import Icon from "../constants/icons";

const Categories = () => {
  const navigation = useNavigation();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.wrapper}>
        <View style={styles.upperRow}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={[styles.backBtn, styles.buttonWrap]}>
            <Icon name="backbutton" size={26} />
          </TouchableOpacity>
          <Text style={styles.heading}>All categories</Text>
          <TouchableOpacity style={styles.buttonWrap}>
            <Icon name="cart" size={26} />
          </TouchableOpacity>
        </View>

        <CategoriesList />
      </View>
    </SafeAreaView>
  );
};

export default Categories;
