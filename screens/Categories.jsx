import React from "react";
import styles from "./categories.style";
import { SafeAreaView } from "react-native-safe-area-context";
import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { COLORS } from "../constants/index";
import { Ionicons } from "@expo/vector-icons";
import CategoriesList from "../components/products/CategoriesList";
import { useNavigation } from "@react-navigation/native";

const Categories = () => {
  const navigation = useNavigation();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.wrapper}>
        <View style={styles.upperRow}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Ionicons size={30} name="chevron-back-circle" color={COLORS.lightWhite} />
          </TouchableOpacity>
          <Text style={styles.heading}>All categories</Text>
        </View>
        <CategoriesList />
      </View>
    </SafeAreaView>
  );
};

export default Categories;
