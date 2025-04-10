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

import { useNavigation } from "@react-navigation/native";

const LatestPayments = ({ refreshList, setRefreshing, setRefreshList, userData }) => {
  const navigation = useNavigation();
  let token = userData?.TOKEN;
  const { data, isLoading, error, refetch } = useFetch("orders?limit=5&offset=0", true, token);

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
          setRefreshList(false);
        });
      } else {
        setRefreshing(false);
        setRefreshList(false);
      }
    }
  }, [refreshList]);

  const paymentLogos = {
    visa: require("../../../assets/images/logos/visa.png"),
    mastercard: require("../../../assets/images/logos/mastercard.png"),
    paypal: require("../../../assets/images/logos/paypal.png"),
  };

  // Key extractor for FlatList
  const keyExtractor = (order) => order._id;

  // Render individual order item
  const renderItem = ({ item: order }) => {
    // Get the payment method from order object
    const paymentMethod = order?.paymentInfo?.selectedPaymentMethod?.toLowerCase();
    // console.log(order);

    // Use mapped image or fallback
    const paymentLogo = paymentLogos[paymentMethod] || require("../../../assets/images/logos/paysafecard.png");

    return (
      <View style={styles.latestProductCards}>
        <TouchableOpacity
          style={{
            borderRadius: 100,
            backgroundColor: COLORS.gray,
            width: 60,
            height: 36,
            padding: 10,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
          onPress={() => {
            navigation.navigate("OrderPaymentDetails", {
              products: order?.products,
              orderId: order._id,
              item: order,
            });
          }}
        >
          <Image source={paymentLogo} style={styles.productImage} />
        </TouchableOpacity>

        <View style={styles.orderDetails}>
          <Text
            style={{
              backgroundColor:
                order?.paymentStatus === "pending"
                  ? "#C0DAFF"
                  : order?.paymentStatus === "paid"
                  ? "#CBFCCD"
                  : order?.paymentStatus === "partial"
                  ? "#F3D0CE"
                  : order?.paymentStatus === "cancelled"
                  ? "#F3D0CE"
                  : COLORS.themey, // Default color
              paddingVertical: 4,
              paddingHorizontal: 8,
              borderRadius: SIZES.medium,
              width: 80,
              textAlign: "center",
              // marginTop: 20,
              alignSelf: "center",
              fontSize: SIZES.small,
              color: COLORS.black,
              fontFamily: "medium",
            }}
          >
            {order.paymentStatus}
          </Text>
        </View>

        <TouchableOpacity
          onPress={() => {
            navigation.navigate("OrderPaymentDetails", {
              products: order?.products,
              orderId: order._id,
              item: order,
            });
          }}
          // style={[styles.flexEnd, styles.buttonView]}
        >
          <Text style={styles.productPrice}>+ KSHS {order.totalAmount}</Text>
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
          scrollEnabled={false}
          contentContainerStyle={{ padding: 4 }}
          refreshControl={<RefreshControl refreshing={refreshList} onRefresh={handleRefetch} />}
          ListEmptyComponent={
            <View style={styles.emptyList}>
              <Text style={styles.emptyListText}>No Payments found</Text>
            </View>
          }
          ItemSeparatorComponent={() => <View style={styles.separator} />}
        />
      )}
    </View>
  );
};

export default LatestPayments;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  productImage: {
    width: 60,
    height: 35,
    borderRadius: 100,
    borderWidth: 2,
    alignSelf: "center",
    backgroundColor: COLORS.themew,
  },
  productTitle: {
    fontSize: SIZES.medium,
    fontWeight: "bold",
    color: COLORS.primary,
  },
  productPrice: {
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
    alignItems: "center",
    gap: 6,
    paddingVertical: 3,
    backgroundColor: COLORS.lightWhite,
    borderRadius: SIZES.medium,
    minHeight: 40,
    marginBottom: 10,
    marginHorizontal: 4,
    paddingTop: 10,
    justifyContent: "space-between",
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
});
