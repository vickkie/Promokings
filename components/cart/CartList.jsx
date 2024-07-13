import { FlatList, Text, View, ActivityIndicator, TouchableOpacity } from "react-native";
import React from "react";
import { COLORS, SIZES } from "../../constants";
import useFetch from "../../hook/useFetch";
import styles from "./cartlist.style";
import { Ionicons } from "@expo/vector-icons";
import CartCardVIew from "./CartCardVIew";

const CartList = () => {
  const { data, isLoading, error, refetch } = useFetch("carts/find/668f9d41346eff0a5c6253fd");

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
        <Text style={styles.errorMessage}>Sorry no categories found</Text>
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
        <Text style={styles.errorMessage}>Error loading cart</Text>
        <TouchableOpacity onPress={handleRefetch} style={styles.retryButton}>
          <Text style={styles.retryButtonText}>Retry Fetch</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Extract products from the response data
  const products = data[0]?.products || [];

  return (
    <View style={styles.container}>
      {/* {console.log(products)} */}
      <FlatList
        keyExtractor={(item) => item._id.toString()}
        contentContainerStyle={[{ columnGap: SIZES.medium }, styles.wrapper]}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        numColumns={1}
        data={products}
        renderItem={({ item }) => <CartCardVIew item={item} />}
      />
    </View>
  );
};

export default CartList;
