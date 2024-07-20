import { FlatList, Text, View, ActivityIndicator, TouchableOpacity, RefreshControl } from "react-native";
import React, { useCallback, useState } from "react";
import { COLORS, SIZES } from "../../constants";
import useFetch from "../../hook/useFetch";
import styles from "./categorieslist.style";
import CategoryCardView from "./CategoryCardView";
import { Ionicons } from "@expo/vector-icons";

const CategoriesList = () => {
  const { data, isLoading, error, refetch } = useFetch("category");
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    try {
      refetch(); // Call refetch, assuming it's synchronous
    } catch (error) {
      console.error("Failed to refresh data", error);
    } finally {
      setRefreshing(false); // Ensure refreshing state is reset
    }
  }, [refetch]);

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
        <Text style={styles.errorMessage}>Sorry, no categories found</Text>
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
        <Text style={styles.errorMessage}>Error loading categories</Text>
        <TouchableOpacity onPress={refetch} style={styles.retryButton}>
          <Text style={styles.retryButtonText}>Retry Fetch</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        keyExtractor={(item) => item._id.toString()}
        contentContainerStyle={[{ columnGap: SIZES.medium }, styles.container]}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        numColumns={1}
        data={data}
        renderItem={({ item }) => <CategoryCardView item={item} />}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      />
    </View>
  );
};

export default CategoriesList;
