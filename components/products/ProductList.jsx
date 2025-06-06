import { FlatList, Text, View, ActivityIndicator, TouchableOpacity, RefreshControl } from "react-native";
import React, { useRef, useState, useEffect, useCallback } from "react";
import axios from "axios";
import { COLORS, SIZES } from "../../constants";
import { SafeAreaView } from "react-native-safe-area-context";
import styles from "./productlist.style";
import ProductsCardView from "./ProductsCardView";
import { Ionicons } from "@expo/vector-icons";
import { useRoute } from "@react-navigation/native";
import { BACKEND_PORT } from "@env";

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
  const [endReached, setEndReached] = useState(false);
  const [error, setError] = useState(null);
  const limit = 6; // Number of items per request

  // Scroll management
  const scrollRef = useRef(null);
  const [showScrollTopButton, setShowScrollTopButton] = useState(false);

  // Fetch products from API
  const fetchProducts = async (reset = false) => {
    if (loading) return; // Prevent multiple fetch calls
    setLoading(true);

    try {
      console.log(BACKEND_PORT);

      const response = await axios.get(`${BACKEND_PORT}/api/${routeParam}`, {
        params: { limit, offset: reset ? 0 : offset },
      });

      console.log(response.data.length);

      // Ensure unique products
      setProducts((prev) => {
        const newData = reset ? response.data : [...prev, ...response.data];
        return Array.from(new Map(newData.map((item) => [item._id, item])).values());
      });

      setOffset((prev) => (reset ? limit : prev + limit));

      setError(null);
    } catch (err) {
      setError("Sorry try again.");
    } finally {
      setLoading(false);
      if (reset) setRefreshing(false);
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchProducts(true);
  }, [routeParam]);

  const handleEndReached = () => {
    if (!loading && !endReached) {
      setEndReached(true);
      fetchProducts(false);
      setTimeout(() => setEndReached(false), 1000); // Delay next fetch
    }
  };

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
        keyExtractor={(item, index) => (item.id ? item.id.toString() : index.toString())}
        contentContainerStyle={[{ columnGap: SIZES.medium }, styles.flatlistContainer]}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        numColumns={2}
        initialNumToRender={3}
        maxToRenderPerBatch={5}
        updateCellsBatchingPeriod={50}
        data={products}
        renderItem={({ item }) => <ProductsCardView item={item} />}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        onEndReached={handleEndReached}
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
