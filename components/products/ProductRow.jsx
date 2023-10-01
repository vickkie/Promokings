import { View, Text, FlatList } from "react-native";
import React from "react";
import { SIZES } from "../../constants";
import ProductCardView from "./ProductCardView";
import styles from "./ProductRow.style";
import useFetch from "../../hook/useFetch";

const ProductRow = () => {
  const products = [1, 2, 3, 4];

  const {data} = useFetch();

  return (
    <View style={styles.container}>
      <FlatList
        data={data}
        keyExtractor={(item) => item._id}
        horizontal
        renderItem={({ item }) => <ProductCardView /> }
        contentContainerStyle={{columnGap: SIZES.medium}}
      />
    </View>
  );
};

export default ProductRow;
