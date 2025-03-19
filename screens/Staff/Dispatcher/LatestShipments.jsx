import {
  FlatList,
  StyleSheet,
  Text,
  View,
  ActivityIndicator,
  TouchableOpacity,
  Image,
  RefreshControl,
} from "react-native";
import React, { useEffect, useState } from "react";
import { COLORS, SIZES } from "../../../constants";
import useFetch from "../../../hook/useFetch";
import { Ionicons } from "@expo/vector-icons";
import LottieView from "lottie-react-native";

import { useNavigation } from "@react-navigation/native";
import Icon from "../../../constants/icons";

const LatestShipments = ({ refreshList, setRefreshing }) => {
  const navigation = useNavigation();
  const { data, isLoading, error, refetch } = useFetch("orders/summary/dispatch");

  // Ensure data is an array and sort by creation date
  const dataArray = Array.isArray(data.orders) ? data.orders : [];
  const sortedData = dataArray.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  const handleRefetch = () => {
    refetch();
  };

  // Handle refresh logic
  useEffect(() => {
    if (refreshList) {
      const refetchResult = refetch();
      if (refetchResult && typeof refetchResult.finally === "function") {
        refetchResult.finally(() => {
          setRefreshing(false);
        });
      } else {
        setRefreshing(false);
      }
    }
  }, [refreshList]);

  // Key extractor for FlatList
  const keyExtractor = (order) => order._id;

  // Render individual order item
  const renderItem = ({ item: order }) => (
    <View style={styles.latestProductCards}>
      <TouchableOpacity
        style={{
          borderRadius: 100,
          backgroundColor: "#FFD2D5",
          width: 36,
          height: 36,
          paddingLeft: 3,
          justifyContent: "center",
          alignItems: "center",
        }}
        onPress={() => {
          navigation.navigate("OrderDispatchDetails", {
            products: order?.products,
            orderId: order._id,
            item: order,
          });
        }}
      >
        <Icon name="isometric" size={26} />
      </TouchableOpacity>

      <View style={styles.orderDetails}>
        <Text style={styles.latestProductTitle}>{order.orderId}</Text>
        <Text style={styles.latestProductdetail}>Delivery status: {order.deliveryStatus}</Text>
      </View>

      <TouchableOpacity
        onPress={() => {
          navigation.navigate("OrderDispatchDetails", {
            products: order?.products,
            orderId: order._id,
            item: order,
          });
        }}
        style={[styles.flexEnd, styles.buttonView]}
      ></TouchableOpacity>
    </View>
  );

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
      ) : (
        <FlatList
          data={sortedData}
          keyExtractor={keyExtractor}
          renderItem={renderItem}
          scrollEnabled={false}
          contentContainerStyle={{ padding: 4 }}
          refreshControl={<RefreshControl refreshing={refreshList} onRefresh={handleRefetch} />}
          ListEmptyComponent={
            <View style={styles.containerx}>
              <View style={styles.containLottie}>
                <View style={styles.animationWrapper}>
                  <LottieView
                    source={require("../../../assets/data/working.json")}
                    autoPlay
                    loop={false}
                    style={styles.animation}
                  />
                </View>
                <View style={{ marginTop: 0, paddingBottom: 10 }}>
                  <Text style={{ fontFamily: "GtAlpine", fontSize: SIZES.medium }}>
                    "Oops, No pending shipments here!
                  </Text>
                </View>
              </View>
            </View>
          }
          ItemSeparatorComponent={() => <View style={styles.separator} />}
        />
      )}
    </View>
  );
};

export default LatestShipments;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  productImage: {
    width: 35,
    height: 35,
    borderRadius: 100,
    borderWidth: 2,
    alignSelf: "center",
  },
  productTitle: {
    fontSize: SIZES.medium,
    fontWeight: "bold",
    color: COLORS.primary,
  },
  productPrice: {
    paddingTop: 20,
    alignSelf: "center",
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
    alignorders: "center",
    justifyContent: "center",
  },
  errorMessage: {
    fontSize: SIZES.medium,
    color: COLORS.error,
    marginBottom: SIZES.medium,
  },
  retryButton: {
    flexDirection: "row",
    alignorders: "center",
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
    alignorders: "center",
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
    display: "flex",
    alignItems: "center",
    // backgroundColor: "red",
    alignItems: "center",
    height: "100%",
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
  containLottie: {
    justifyContent: "center",
    alignItems: "center",
    width: SIZES.width - 20,
    flex: 1,
  },
  animationWrapper: {
    width: 200,
    height: 200,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  animation: {
    width: "100%",
    height: "100%",
  },
  containerx: {
    flex: 1,
    backgroundColor: COLORS.themeg,
    marginTop: 2,
    // width: SIZES.width - 20,
    marginHorizontal: 10,
    borderRadius: SIZES.medium,
  },
});
