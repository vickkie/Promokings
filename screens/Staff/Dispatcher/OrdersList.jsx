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
import React, { useEffect, useState, useCallback, useContext } from "react";
import { COLORS, SIZES } from "../../../constants";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import Icon from "../../../constants/icons";
import axios from "axios";
import { BACKEND_PORT } from "@env";
import { AuthContext } from "../../../components/auth/AuthContext";
import LottieView from "lottie-react-native";

const OrdersDispatchList = ({ refreshList, setRefreshing, setiRefresh, irefresh, setPending, filter }) => {
  const { userData } = useContext(AuthContext);
  const navigation = useNavigation();

  const [data, setData] = useState([]);
  const [offset, setOffset] = useState(0);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing2] = useState(false);
  const [endReached, setEndReached] = useState(false);
  const [error, setError] = useState(null);
  const limit = 210000;

  console.log(filter);

  // Fetch products from API
  const fetchData = async (reset = false) => {
    if (loading) return; // Prevent multiple fetch calls
    setLoading(true);

    try {
      const response = await axios.get(`${BACKEND_PORT}/api/orders`, {
        params: { limit, offset: reset ? 0 : offset, status: filter },
        Authorization: `Bearer ${userData?.TOKEN}`,
      });

      // Ensure unique products
      setData((prev) => {
        const newData = reset ? response.data.orders : [...prev, ...response.data.orders];

        return Array.from(new Map(newData.map((item) => [item._id, item])).values());
      });

      setOffset((prev) => (reset ? limit : prev + limit));

      setError(null);
    } catch (err) {
      setError("Failed to fetch products.");
    } finally {
      setLoading(false);
      if (reset) setRefreshing2(false);
    }
  };
  // Initial fetch
  useEffect(() => {
    fetchData(true);
  }, []);

  // fetchData(true);
  const handleEndReached = () => {
    if (!loading && endReached) {
      setEndReached(true);
      fetchData(false);
      setTimeout(() => setEndReached(false), 1000); // Delay next fetch
    }
  };

  // Refresh function
  const onRefresh = useCallback(() => {
    setRefreshing2(true);
    fetchData(true);
  }, []);

  // Ensure data is an array and sort by creation date
  const dataArray = Array.isArray(data) ? data : [];
  const sortedData = dataArray.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  const pendingOrders = sortedData.filter(
    (order) => ["paid", "pending"].includes(order.paymentStatus) && order.status === "pending"
  );

  useEffect(() => {
    setPending(pendingOrders);
  }, []);

  useFocusEffect(
    useCallback(() => {
      onRefresh();
    }, [])
  );

  // useEffect(() => {
  //   if (irefresh) {
  //     onRefresh();
  //     setiRefresh(false);
  //   }
  // }, [irefresh, setiRefresh]);

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
          alignSelf: "center",
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
        <Text style={styles.latestProductTitle}>ID : {order.orderId}</Text>
        <View style={styles.flexMe}>
          <Text
            style={{
              backgroundColor:
                order.deliveryStatus === "pending"
                  ? "#C0DAFF"
                  : order.deliveryStatus === "transit"
                  ? "#F3D0CE"
                  : order.deliveryStatus === "completed"
                  ? "#F3D0CE"
                  : order.deliveryStatus === "cancelled"
                  ? "#F3D0CE"
                  : COLORS.themey, // Default color
              paddingVertical: 4,
              paddingHorizontal: 8,
              borderRadius: SIZES.medium,
              minWidth: 90,
              textAlign: "center",
            }}
          >
            {(() => {
              switch (order.deliveryStatus) {
                case "pending":
                  return "undelivered";
                case "ready_for_pickup":
                  return "pickup ready";
                default:
                  return order.deliveryStatus;
              }
            })()}
          </Text>
          <Text
            style={{
              backgroundColor:
                order.paymentStatus === "pending"
                  ? "#C0DAFF"
                  : order.paymentStatus === "paid"
                  ? "#CBFCCD"
                  : order.paymentStatus === "partial"
                  ? "#F3D0CE"
                  : COLORS.themey, // Default color
              paddingVertical: 4,
              paddingHorizontal: 8,
              borderRadius: SIZES.medium,
              width: 80,
              textAlign: "center",
            }}
          >
            {order.paymentStatus === "pending"
              ? "Unpaid"
              : order.paymentStatus === "paid"
              ? "Paid"
              : order.paymentStatus}
          </Text>
        </View>
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
      >
        <Icon name="pencil" size={25} />
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={[styles.container, { marginBottom: 20 }]}>
      {loading ? (
        <ActivityIndicator size={SIZES.xxLarge} color={COLORS.primary} />
      ) : error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorMessage}>Looks like you're offline</Text>
          <TouchableOpacity onPress={onRefresh} style={styles.retryButton}>
            <Ionicons size={24} name={"reload-circle"} color={COLORS.white} />
            <Text style={styles.retryButtonText}>Retry Fetch</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={sortedData}
          keyExtractor={keyExtractor}
          renderItem={renderItem}
          contentContainerStyle={{ padding: 4 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          onEndReached={handleEndReached}
          onEndReachedThreshold={0.5}
          // refreshControl={<RefreshControl refreshing={refreshList} onRefresh={handleRefetch} />}
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

export default OrdersDispatchList;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: 90,
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
    paddingTop: 10,
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
    alignSelf: "center",
    justifyContent: "center",
    height: 100,
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
  flexMe: {
    display: "flex",
    flexDirection: "row",
    gap: 6,
    paddingVertical: 5,
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
