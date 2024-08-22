import { FlatList, StyleSheet, Text, View, ActivityIndicator, TouchableOpacity, Image } from "react-native";
import React, { useEffect, useCallback } from "react";
import { COLORS, SIZES } from "../../../constants";
import useFetch from "../../../hook/useFetch";
import { Ionicons } from "@expo/vector-icons";

const LatestProducts = ({ navigation, refreshList }) => {
  const { data, isLoading, error, refetch } = useFetch("products?limit=6&offset=0");

  // Ensure data is treated as an array to avoid accessing .length of undefined
  const dataArray = Array.isArray(data) ? data : [];

  // Sort the dataArray by 'createdAt' in descending order
  const sortedData = dataArray.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  const handleRefetch = () => {
    refetch();
  };

  //refresh this list if new product or some happens
  useEffect(() => {
    // console.log("Refresh List changed to: ", refreshList);
    if (refreshList === true) {
      refetch();
    }
  }, [refreshList]);

  // Corrected the arrow function syntax and parameter reference
  const parsedPrice = (item) => (item.price ? parseFloat(item.price.replace(/[^0-9.-]+/g, "")) : 0);

  const keyExtractor = (item) => item._id;

  const renderItem = ({ item }) => {
    return (
      <View style={styles.latestProductCards}>
        <TouchableOpacity
          style={{
            borderRadius: 100,
            backgroundColor: COLORS.gray,
            width: 36,
            height: 36,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Image source={{ uri: item.imageUrl }} style={styles.productImage} />
        </TouchableOpacity>

        <View>
          <Text style={styles.latestProductTitle}>{item.title}</Text>
          <Text style={styles.latestProductdetail}>Product id: {item.productId}</Text>
        </View>

        <TouchableOpacity
          onPress={() => {
            navigation.navigate("OrderDetails", { _id: item._id, item });
          }}
          style={[styles.flexEnd, styles.buttonView]}
        >
          <Text style={styles.productPrice}>{`KES ${new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "KES",
          })
            .format(parsedPrice(item))
            .replace("KES", "")
            .trim()}`}</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={[styles.container, { marginBottom: 20 }]}>
      {isLoading ? (
        <ActivityIndicator size={SIZES.xxLarge} color={COLORS.primary} />
      ) : error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorMessage}>Looks like you're offline</Text>
          <TouchableOpacity onPress={handleRefetch} style={styles.retryButton}>
            <Ionicons size={24} name={"reload-circle"} color={COLORS.white} />
            <Text style={styles.retryButtonText}>Retry Fetch</Text>
          </TouchableOpacity>
        </View>
      ) : sortedData.length === 0 ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorMessage}>No products at the moment</Text>
          <TouchableOpacity onPress={handleRefetch} style={styles.retryButton}>
            <Ionicons size={24} name={"reload-circle"} color={COLORS.white} />
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={sortedData}
          keyExtractor={keyExtractor}
          renderItem={renderItem}
          contentContainerStyle={{ columnGap: 2 }}
          scrollEnabled={false}
        />
      )}
    </View>
  );
};

export default LatestProducts;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  productImage: {
    width: 35,
    height: 35,
    borderRadius: 100,
    borderBlockColor: "black",
    borderWidth: 2,
  },
  productTitle: {
    fontSize: SIZES.medium,
    fontWeight: "bold",
    color: COLORS.primary,
  },
  productPrice: {
    fontSize: SIZES.small,
    color: COLORS.black,
    fontFamily: "medium",
  },

  productLocation: {
    fontSize: SIZES.small,
    color: COLORS.gray,
    marginTop: SIZES.small,
  },
  errorContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  errorMessage: {
    fontSize: SIZES.medium,
    color: COLORS.error,
    marginBottom: SIZES.medium,
  },
  retryButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.primary,
    padding: SIZES.small,
    borderRadius: SIZES.small,
  },
  retryButtonText: {
    color: COLORS.white,
    marginLeft: SIZES.small,
  },
  latestProductCards: {
    paddingHorizontal: 10,
    backgroundColor: COLORS.themeg,
    borderRadius: SIZES.medium,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 3,
    backgroundColor: COLORS.lightWhite,
    borderRadius: SIZES.medium,
    minHeight: 40,
    marginBottom: 10,
    marginHorizontal: 4,
  },
  flexEnd: {
    position: "absolute",
    right: 10,
  },
  buttonView: {
    width: 80,
  },
  latestProductTitle: {
    fontSize: 16,
    fontWeight: "semibold",
    marginBottom: 8,
  },
  latestProductdetail: {
    fontSize: SIZES.small,
    fontWeight: "regular",
    color: COLORS.gray,
    marginBottom: 5,
  },
});
