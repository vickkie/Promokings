import { FlatList, Text, View, SafeAreaView, ActivityIndicator } from "react-native";
import React, { useEffect } from "react";
import { COLORS, SIZES } from "../../constants";
import styles from "./productsRow.style";
import ProductsCardView from "./ProductsCardView";
import useFetch from "../../hook/useFetch";

const ProductsRow = () => {
  const { data, isLoading, error } = useFetch();

  // Ensure data is treated as an array to avoid accessing .length of undefined
  const dataArray = Array.isArray(data) ? data : [];

  const keyExtractor = (item) => item._id;

  return (
    <View style={styles.container}>
      {isLoading ? (
        <ActivityIndicator size={SIZES.xxLarge} color={COLORS.primary} />
      ) : error ? (
        <View style={styles.errorBox}>
          <Text style={styles.errorMessage}>
            Sorry could not connect,{`\n`}Error: {error}
          </Text>
        </View>
      ) : dataArray.length === 0 ? (
        <Text>No products found.</Text>
      ) : (
        <FlatList
          data={dataArray}
          keyExtractor={keyExtractor}
          renderItem={({ item }) => <ProductsCardView item={item} />}
          horizontal
          contentContainerStyle={{ columnGap: SIZES.medium }}
        />
      )}
    </View>
  );
};

export default ProductsRow;
