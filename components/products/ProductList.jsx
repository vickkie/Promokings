import { FlatList, Text, View, ActivityIndicator, TouchableOpacity, RefreshControl } from "react-native";
import React, { useRef, useState, useCallback } from "react";
import { COLORS, SIZES } from "../../constants";
import useFetch from "../../hook/useFetch";
import { SafeAreaView } from "react-native-safe-area-context";
import styles from "./productlist.style";
import ProductsCardView from "./ProductsCardView";
import { Ionicons } from "@expo/vector-icons";
import { useRoute } from "@react-navigation/native";

const ProductList = ({ sendDataToParent }) => {
  const route = useRoute();
  const { routeParam, category } = route.params;

  sendDataToParent(category);

  const { data, isLoading, error, refetch } = useFetch(routeParam);
  const [refreshing, setRefreshing] = useState(false);

  const scrollRef = useRef(null);
  const [showScrollTopButton, setShowScrollTopButton] = useState(false);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    try {
      refetch(); // Call refetch as synchronous
    } catch (error) {
      // console.error("Failed to refresh data", error);
    } finally {
      setRefreshing(false);
    }
  }, [refetch]);

  const handleScroll = (event) => {
    const offsetY = event.nativeEvent.contentOffset.y;
    setShowScrollTopButton(offsetY > 100);
  };

  const scrollTop = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollToOffset({ offset: 0, animated: true });
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  if (data.length === 0) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorMessage}>Sorry, no products available</Text>
        <TouchableOpacity onPress={refetch} style={styles.retryButton}>
          <Ionicons size={24} name={"reload-circle"} color={COLORS.white} />
          <Text style={styles.retryButtonText}>Retry Again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorMessage}>Error loading products</Text>
        <TouchableOpacity onPress={refetch} style={styles.retryButton}>
          <Text style={styles.retryButtonText}>Retry Fetch</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {console.log(data)}

      <FlatList
        ref={scrollRef}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        keyExtractor={(item) => item._id}
        contentContainerStyle={[{ columnGap: SIZES.medium }, styles.flatlistContainer]}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        numColumns={2}
        data={data}
        renderItem={({ item }) => <ProductsCardView item={item} refetch={refetch} />}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      />

      {showScrollTopButton && (
        <View style={styles.toTopButton}>
          <TouchableOpacity onPress={scrollTop}>
            <Ionicons name="arrow-up-circle-outline" size={32} color={COLORS.white} />
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
};

export default ProductList;
