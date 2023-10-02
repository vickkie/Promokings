import { View, Text, FlatList } from "react-native";
import { COLORS, SIZES } from "../../constants";
import ProductCardView from "./ProductCardView";
import styles from "./ProductRow.style";
import useFetch from "../../hook/useFetch";
import { ActivityIndicator } from "react-native";

const ProductRow = () => {
  const products = [1, 2, 3, 4];

  const { data, isLoading, error } = useFetch();

  return (
    <View style={styles.container}>
      {isLoading ? (
        <ActivityIndicator size={SIZES.xxLarge} color={COLORS.primary} />
      ) : error ? (
        <Text>Something went wrong</Text>
      ) : (
        <FlatList
          data={data}
          keyExtractor={(item) => item._id}
          horizontal
          renderItem={({ item }) => <ProductCardView item={item} />}
          contentContainerStyle={{ columnGap: SIZES.medium }}
        />
      )}
    </View>
  );
};

export default ProductRow;
