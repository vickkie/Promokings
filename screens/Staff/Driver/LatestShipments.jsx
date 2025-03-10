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
import React, { useEffect, useState, useContext } from "react";
import { COLORS, SIZES } from "../../../constants";
import useFetch from "../../../hook/useFetch";
import { Ionicons } from "@expo/vector-icons";

import { useNavigation } from "@react-navigation/native";
import { AuthContext } from "../../../components/auth/AuthContext";
import LottieView from "lottie-react-native";

const LatestShipments = ({ refreshList, setRefreshing, limit, offset, status, search }) => {
  const { hasRole, userData } = useContext(AuthContext);
  const navigation = useNavigation();
  const { data, isLoading, error, refetch } = useFetch(
    `shipment/driver/${userData._id}?limit=${limit}&offset=${offset}` +
      (status ? `&status=${status}` : "") +
      (search ? `&search=${search}` : "")
  );

  const [deliveries, setDeliveries] = useState([]);

  // Ensure data is an array and sort by creation date
  const dataArray = Array.isArray(data.deliveries) ? data.deliveries : [];
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
  const keyExtractor = (shipment) => shipment._id;

  // Render individual order item
  const renderItem = ({ item: shipment }) => (
    <View style={styles.latestProductCards}>
      <TouchableOpacity
        style={{
          borderRadius: 100,
          backgroundColor: COLORS.themew,
          width: 36,
          height: 36,
          padding: 7,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
        onPress={() => {
          navigation.navigate("OrderSalesDetails", {
            products: order?.products,
            orderId: order._id,
            item: order,
          });
        }}
      >
        <Image source={require("../../../assets/images/truck.png")} style={styles.productImage} />
      </TouchableOpacity>

      <View style={styles.orderDetails}>
        <Text style={styles.latestProductTitle}>{shipment.deliveryId}</Text>
        <Text style={styles.latestProductdetail}>Assigned: {new Date(shipment?.assignedAt).toLocaleString()}</Text>
      </View>

      <TouchableOpacity
        onPress={() => {
          navigation.navigate("PreviewProduct", {
            order: order,
            orderid: order._id,
          });
        }}
        style={[styles.flexEnd, styles.buttonView]}
      >
        <Text
          style={{
            backgroundColor:
              shipment.status === "pending"
                ? "#C0DAFF"
                : shipment.status === "approved"
                ? "#CBFCCD"
                : shipment.status === "completed"
                ? "#F3D0CE"
                : shipment.status === "cancelled"
                ? "#F3D0CE"
                : COLORS.themey, // Default color
            paddingVertical: 4,
            paddingHorizontal: 8,
            borderRadius: SIZES.medium,
            width: 90,
            textAlign: "center",
            marginTop: 20,
            alignSelf: "center",
            fontSize: SIZES.small,
            color: COLORS.black,
            fontFamily: "medium",
          }}
        >
          {shipment?.status}
        </Text>
      </TouchableOpacity>
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
                    source={require("../../../assets/data/delivery.json")}
                    autoPlay
                    loop={false}
                    style={styles.animation}
                  />
                </View>
                <View style={{ marginTop: 0, paddingBottom: 10 }}>
                  <Text style={{ fontFamily: "GtAlpine", fontSize: SIZES.medium }}>"Oops, No shipments here!</Text>
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
    paddingVertical: 1,
    backgroundColor: COLORS.lightWhite,
    borderRadius: SIZES.medium,
    minHeight: 40,
    marginBottom: 10,
    paddingTop: 12,
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
