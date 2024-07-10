import { FlatList, Text, View, ActivityIndicator, TouchableOpacity } from "react-native";
import React from "react";
import { COLORS, SIZES } from "../../constants";
import useFetch from "../../hook/useFetch";
import { SafeAreaView } from "react-native-safe-area-context";
import styles from "./productlist.style";
import ProductsCardView from "./ProductsCardView";
import { Ionicons, SimpleLineIcons, Fontisto } from "@expo/vector-icons";
import Animated from "react-native-reanimated";

const ProductList = () => {
  const { data, isLoading, error, refetch } = useFetch();

  const handleRefetch = () => {
    refetch();
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
        <Text style={styles.errorMessage}>Sorry no products found</Text>
        <TouchableOpacity onPress={handleRefetch} style={styles.retryButton}>
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
        <TouchableOpacity onPress={handleRefetch} style={styles.retryButton}>
          <Text style={styles.retryButtonText}>Retry Fetch</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        keyExtractor={(item) => item._id.toString()}
        contentContainerStyle={({ columnGap: SIZES.medium }, styles.container)}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        numColumns={2}
        data={data}
        renderItem={({ item }) => <ProductsCardView item={item} />}
      />
    </View>
  );
};

export default ProductList;
