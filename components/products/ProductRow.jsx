import { View, Text, FlatList } from "react-native";
import React from "react";
import { SIZES } from "../../constants";
import ProductCardView from "./ProductCardView";
import styles from "./ProductRow.style";

const ProductRow = () => {
  const products = [1, 2, 3, 4];

  return (
    <View style={styles.container}>
      <FlatList
        data={products}
        horizontal
        renderItem={({ item }) => <ProductCardView /> }
        contentContainerStyle={{columnGap: SIZES.medium}}
      />
    </View>
  );
};

export default ProductRow;
