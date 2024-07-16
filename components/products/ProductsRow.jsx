import { FlatList, Text, View, SafeAreaView, ActivityIndicator, TouchableOpacity } from "react-native";
import React, { useEffect } from "react";
import { COLORS, SIZES } from "../../constants";
import styles from "./productsRow.style";
import ProductsCardView from "./ProductsCardView";
import useFetch from "../../hook/useFetch";
import { Ionicons } from "@expo/vector-icons";

const ProductsRow = () => {
  const { data, isLoading, error, refetch } = useFetch("products");

  // Ensure data is treated as an array to avoid accessing .length of undefined
  const dataArray = Array.isArray(data) ? data : [];

  const handleRefetch = () => {
    refetch();
  };

  const keyExtractor = (item) => item._id;

  return (
    <View style={styles.container}>
      {isLoading ? (
        <ActivityIndicator size={SIZES.xxLarge} color={COLORS.primary} />
      ) : error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorMessage}>Looks like you're offline</Text>
          <TouchableOpacity onPress={handleRefetch} style={styles.retryButton}>
            <Ionicons size={24} name={"reload-circle"} color={COLORS.white} />
            <Text style={styles.retryButtonText}>Retry Fetch</Text>
          </TouchableOpacity>
        </View>
      ) : dataArray.length === 0 ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorMessage}>No products at the moment</Text>
          <TouchableOpacity onPress={handleRefetch} style={styles.retryButton}>
            <Ionicons size={24} name={"reload-circle"} color={COLORS.white} />
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={dataArray}
          keyExtractor={keyExtractor}
          renderItem={({ item }) => <ProductsCardView item={item} />}
          horizontal
          contentContainerStyle={{ columnGap: 2 }}
        />
      )}
    </View>
  );
};

export default ProductsRow;
