import { FlatList, Text, View, SafeAreaView } from "react-native";
import React from "react";
import { COLORS, SIZES } from "../../constants";
import styles from "./productsRow.style";
import ProductsCardView from "./ProductsCardView";

const ProductsRow = () => {
  const products = [1, 2, 3, 4];

  return (
    <View style={styles.container}>
      <FlatList
        data={products}
        renderItem={({ item }) => <ProductsCardView />}
        horizontal
        contentContainerStyle={{ columnGap: SIZES.medium }}
      />
    </View>
  );
};

export default ProductsRow;
