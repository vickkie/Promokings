import { FlatList, Text, View, ActivityIndicator, TouchableOpacity, RefreshControl } from "react-native";
import React, { useRef, useState, useEffect, useCallback } from "react";
import axios from "axios";
import { COLORS, SIZES } from "../../constants";
import { SafeAreaView } from "react-native-safe-area-context";
import styles from "./productlist.style";
import ProductsCardView from "./ProductsCardView";
import { Ionicons } from "@expo/vector-icons";
import { useRoute } from "@react-navigation/native";

const ProductList = ({ sendDataToParent, routeParams }) => {
  const route = useRoute();
  const params = route.params || routeParams;
  const { routeParam, category } = params;

  sendDataToParent(category); // Send category to parent

  // State for products and pagination
  const [products, setProducts] = useState([]);
  const [offset, setOffset] = useState(0);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const limit = 6; // Number of items per request

  // Scroll management
  const scrollRef = useRef(null);
  const [showScrollTopButton, setShowScrollTopButton] = useState(false);

  // Fetch products from API
  const fetchProducts = async (reset = false) => {
    if (loading) return;

    setLoading(true);
    try {
      const response = await axios.get(`http://192.168.100.20:3000/api/${routeParam}`, {
        params: { limit, offset: reset ? 0 : offset },
      });

      // console.log(`http://192.168.100.20:3000/api/${routeParam}`, { limit, offset: reset ? 0 : offset, reset });

      setProducts((prev) => (reset ? response.data : [...prev, ...response.data]));
      setOffset((prev) => (reset ? limit : prev + limit));
      setError(null);
    } catch (err) {
      setError("Failed to fetch products.");
    } finally {
      setLoading(false);
      if (reset) setRefreshing(false);
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchProducts(true);
  }, [routeParam]);

  // Refresh function
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchProducts(true);
  }, []);

  // Handle scrolling to show/hide "scroll to top" button
  const handleScroll = (event) => {
    const offsetY = event.nativeEvent.contentOffset.y;
    setShowScrollTopButton(offsetY > 100);
  };

  // Scroll to top function
  const scrollTop = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollToOffset({ offset: 0, animated: true });
    }
  };

  // **Loading State**
  if (loading && products.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  // **Error State**
  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorMessage}>{error}</Text>
        <TouchableOpacity onPress={() => fetchProducts(true)} style={styles.retryButton}>
          <Ionicons size={24} name={"reload-circle"} color={COLORS.white} />
          <Text style={styles.retryButtonText}>Retry Fetch</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // **Empty State**
  if (products.length === 0) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorMessage}>Sorry, no products available</Text>
        <TouchableOpacity onPress={() => fetchProducts(true)} style={styles.retryButton}>
          <Ionicons size={24} name={"reload-circle"} color={COLORS.white} />
          <Text style={styles.retryButtonText}>Retry Again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        ref={scrollRef}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        keyExtractor={(item, index) => index.toString()} // Fix: Use index if _id is not guaranteed
        contentContainerStyle={[{ columnGap: SIZES.medium }, styles.flatlistContainer]}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        numColumns={2}
        initialNumToRender={3}
        maxToRenderPerBatch={5}
        updateCellsBatchingPeriod={50}
        data={products}
        renderItem={({ item }) => <ProductsCardView item={item} />}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        onEndReached={() => fetchProducts(false)} // Infinite scroll
        onEndReachedThreshold={0.5}
        ListFooterComponent={loading && <ActivityIndicator size="large" />}
      />

      {/* Scroll to top button */}
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
