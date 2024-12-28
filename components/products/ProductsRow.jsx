import { FlatList, Text, View, SafeAreaView, ActivityIndicator, RefreshControl, TouchableOpacity } from "react-native";
import React, { useEffect, useState } from "react";
import { COLORS, SIZES } from "../../constants";
import styles from "./productsRow.style";
import ProductsCardView from "./ProductsCardView";
import useFetch from "../../hook/useFetch";
import { Ionicons } from "@expo/vector-icons";
import { useCallback } from "react";

const ProductsRow = () => {
  const { data, isLoading, error, refetch } = useFetch("products?limit=10&offset=0");
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    try {
      refetch();
    } catch (error) {
    } finally {
      setRefreshing(false); // Ensure refreshing state is reset
    }
  }, [refetch]);

  // Ensure data is treated as an array to avoid accessing .length of undefined
  const dataArray = Array.isArray(data) ? data : [];

  const handleRefetch = () => {
    refetch();
  };

  const keyExtractor = (item) => item._id;

  return (
    <View style={[styles.container, { marginBottom: 20 }]}>
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
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        />
      )}
    </View>
  );
};

export default ProductsRow;
