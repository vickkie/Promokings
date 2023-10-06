import { View, Text } from "react-native";
import React from "react";
import useFetch from "../../hook/useFetch";
import { ActivityIndicator } from "react-native";
import { COLORS, SIZES } from "../../constants";
import styles from "./ProductList.style";
import { FlatList } from "react-native";
import ProductCardView from "./ProductCardView";

const ProductList = () => {
  const { data, isLoading, error } = useFetch();

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size={SIZES.xxLarge} color={COLORS.primary} />
      </View>
    );
  }
  return (
    <View style={styles.container}>
      <FlatList
        contentContainerStyle={styles.container}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        numColumns={2}
        data={data}
        renderItem={({ item }) => <ProductCardView item={item} />}
      />
    </View>
  );
};

export default ProductList;




