import { FlatList, Text, View, SafeAreaView, ActivityIndicator, RefreshControl, TouchableOpacity } from "react-native";
import React, { useEffect, useState, useCallback, memo } from "react";
import { COLORS, SIZES } from "../../constants";
import styles from "./productsRow.style";
import ProductsCardView from "./ProductsCardView";
import useFetch from "../../hook/useFetch";
import { Ionicons } from "@expo/vector-icons";

const ProductsRow = ({ refreshList, setRefreshList }) => {
  const { data, isLoading, error, refetch } = useFetch("products?limit=10&offset=0");
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (refreshList) {
      refetch();
      // console.log("refreshing", refreshList);
    }

    return setRefreshList(false);
  }, [refreshList]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    try {
      refetch();
    } catch (error) {
      console.error("Error refreshing:", error);
    } finally {
      setRefreshing(false);
    }
  }, [refetch]);

  const dataArray = Array.isArray(data) ? data : [];
  const handleRefetch = useCallback(() => {
    refetch();
  }, [refetch]);

  const keyExtractor = useCallback((item) => item._id, []);

  const renderItem = useCallback(({ item }) => <ProductsCardView item={item} />, []);

  return (
    <View style={[styles.container, { marginBottom: 20 }]}>
      {isLoading ? (
        <ActivityIndicator size={SIZES.xxLarge} color={COLORS.primary} />
      ) : error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorMessage}>Looks like you're offline</Text>
          <TouchableOpacity onPress={handleRefetch} style={styles.retryButton}>
            <Ionicons size={24} name={"reload-circle"} color={COLORS.white} />
            <Text style={styles.retryButtonText}>Retry Loading</Text>
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
          renderItem={renderItem}
          horizontal
          initialNumToRender={3}
          maxToRenderPerBatch={5}
          updateCellsBatchingPeriod={50}
          removeClippedSubviews={true}
          windowSize={21}
          contentContainerStyle={{ columnGap: 2 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />}
        />
      )}
    </View>
  );
};

export default ProductsRow;
