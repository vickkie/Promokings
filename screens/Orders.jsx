import React, { useContext, useState, useEffect, useCallback, useMemo } from "react";
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Image,
  SafeAreaView,
  ScrollView,
} from "react-native";
import { COLORS, SIZES } from "../constants";
import Icon from "../constants/icons";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { AuthContext } from "../components/auth/AuthContext";
import LottieView from "lottie-react-native";
import { BACKEND_PORT } from "@env";
import { StatusBar } from "expo-status-bar";
import * as Clipboard from "expo-clipboard";
import Toast from "react-native-toast-message";

const Orders = () => {
  const [userId, setUserId] = useState(null);
  const { userData, userLogin } = useContext(AuthContext);
  const navigation = useNavigation();

  useEffect(() => {
    if (!userLogin) {
      setUserId(1);
      navigation.navigate("Login");
      return;
    } else if (userData && userData._id) {
      setUserId(userData._id);
    }
  }, [userLogin, userData]);

  // const { data, isLoading, error, refetch } = useFetch(`orders/user/${userId}`);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [ordersData, setOrdersData] = useState([]);
  const [products, setProducts] = useState("");
  const [orderItems, setOrderItems] = useState("");

  const [sortedOrdersData, setSortedOrdersData] = useState([]);
  const [last3orders, setlast3orders] = useState([]);

  // State for orders, loading, and error
  const [data, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!userLogin) {
      setUserId(1); // Consider handling this differently, maybe redirecting to login immediately
      navigation.navigate("Login");
      return;
    } else if (userData && userData._id) {
      setUserId(userData._id);
    }
  }, [userLogin, userData]);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch(`${BACKEND_PORT}/api/orders/user/${userId}`);
        const data = await response.json();

        // console.log(data);
        setOrders(data || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    if (userId) {
      fetchData();
    }
  }, [userId]);

  useEffect(() => {
    // console.log(data);
  }, [data, ordersData]);

  // useFocusEffect(
  //   useCallback(() => {
  //     refetch();
  //   }, [])
  // );

  useEffect(() => {
    if (!isLoading && !error && data.orders && data.orders.length !== 0) {
      // Destructure orders from data
      const orders = data.orders || [];
      setOrdersData(orders);

      // Sort orders
      const sortedOrders = [...orders].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setSortedOrdersData(sortedOrders);

      // Get the latest three orders
      const latestThreeOrders = sortedOrders.slice(0, 3).map((order) => ({
        id: order.orderId,
      }));

      setlast3orders(latestThreeOrders);
    }
  }, [data, isLoading, error]);

  const primaryData = [
    {
      id: "1",
      title: "Order tracker",
      image: require("../assets/images/isometric.webp"),
      // shippingId: "V789456AR123",
      shippingId: last3orders[0] ? last3orders[0].id : "Order now",

      color: "#ffedd2",
      stylez: '{"height": 220, "width": 220, "position": "absolute", "right": -50, "top": -10, "opacity": 0.6}',
    },
    {
      id: "2",
      // title: "Small Box Packing",
      title: "Shipment Tracker",
      image: require("../assets/images/isometric2.png"),
      shippingId: last3orders[1] ? last3orders[1].id : "Order now",
      color: "#a3eed8",
      stylez:
        '{"height": 170, "width": 170, "position": "absolute", "right": -67, "top": 25, "opacity": 0.8,"transform": [{ "rotate": "-15deg" }]}',
    },
    {
      id: "3",
      title: "Order tracker",
      // title: "Gift Packing",
      image: require("../assets/images/gift.webp"),
      color: "#e6bfdf",
      shippingId: last3orders[2] ? last3orders[2].id : "Order now",

      stylez: '{"height": 220, "width": 220, "position": "absolute", "right": -70, "top": 10, "opacity": 0.6}',
    },
  ];

  useEffect(() => {
    if (sortedOrdersData.length > 0) {
      function extractProductDetails(orders) {
        orders.forEach((order) => {
          // console.log("orderid", order._id);

          setOrderItems();

          order.products.forEach((product) => {
            // console.log(product);
            const items = product._id;

            const { _id, title, price, imageUrl, description } = product._id || {};

            setProducts();

            // console.log(items);

            // console.log(
            //   `ID: ${_id}, Title: ${title}, Price: ${price}, Image URL: ${imageUrl}, Description: ${description}`
            // );
          });
        });
      }
      extractProductDetails(data.orders);
    }
  }, [sortedOrdersData, data]);

  const filterOrdersByStatus = useCallback(() => {
    if (selectedStatus === "All") {
      return sortedOrdersData;
    }
    return sortedOrdersData.filter((order) => order.status === selectedStatus);
  }, [selectedStatus, sortedOrdersData]);

  const filterOrdersBySearchQuery = useCallback(
    (orders) => {
      return orders.filter((order) => order.orderId.includes(searchQuery));
    },
    [searchQuery]
  );

  const filteredOrders = useMemo(() => {
    const statusFiltered = filterOrdersByStatus();
    return filterOrdersBySearchQuery(statusFiltered);
  }, [filterOrdersByStatus, filterOrdersBySearchQuery]);

  const showToast = (type, text1, text2) => {
    Toast.show({
      type: type,
      text1: text1,
      text2: text2 ? text2 : "",
      visibilityTime: 3000,
    });
  };

  const handleCopy = async (shippingId) => {
    await Clipboard.setStringAsync(shippingId);
    showToast("success", "Copied to clipboard", "Your order tracking number has been copied to clipboard");
  };

  const Card = ({ title, image, shippingId, color, stylez }) => {
    const parsedStyle = stylez ? JSON.parse(stylez) : {};
    return (
      <View
        style={{
          backgroundColor: color || COLORS.themey,
          height: 170,
          width: 250,
          borderRadius: SIZES.medium,
          overflow: "hidden",
        }}
      >
        <View style={styles.cardContent}>
          <Image source={image} style={[styles.image, parsedStyle]} />
          <View style={{ gap: 10, flexDirection: "column" }}>
            <Text style={styles.title}>{title}</Text>
            <View style={{ alignSelf: "flex-start" }}>
              <TouchableOpacity
                onPress={() => {
                  handleCopy(shippingId);
                }}
              >
                <Text style={styles.shippingId}>{`ID: ${shippingId}`}</Text>
              </TouchableOpacity>
            </View>
          </View>
          <View>
            <TouchableOpacity onPress={() => {}} style={[styles.backBtn, styles.buttonView]}>
              <Icon name="backbutton" size={26} />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  const SearchResultCard = ({ orderId, item, products, status, icon, color, totals }) => {
    const titles = products
      .map((product, index) => {
        const { title } = product._id || {};
        return {
          title,
        };
      })
      .filter(({ title }) => Boolean(title)); // Filter out undefined titles, in case some products don't have titles

    const titlesString = titles.map(({ title }) => title).join(", ");

    // console.log("titles", titlesString);

    return (
      <View
        style={[
          styles.searchResultCards,
          {
            flexDirection: "row",
            alignItems: "center",
            gap: 6,
            paddingVertical: 10,
            backgroundColor: COLORS.lightWhite,
            paddingHorizontal: 10,
            borderRadius: 8,
            overflow: "hidden",
          },
        ]}
      >
        <TouchableOpacity
          // key={index}
          style={{
            borderRadius: 100,
            padding: 17,
            backgroundColor: color,
            width: 36,
            height: 36,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <TouchableOpacity style={styles.checkmark}>
            <Icon name="check" size={11} />
          </TouchableOpacity>
          <Icon name={icon} size={21} />
        </TouchableOpacity>

        <View>
          <Text style={styles.searchResultTitle}>{titlesString}</Text>
          <Text style={styles.searchResultdetail}>Order id : {orderId}</Text>
        </View>
        <TouchableOpacity
          onPress={() => {
            navigation.navigate("OrderDetails", { orderId, item, products, totals });
          }}
          style={[styles.flexEnd, styles.buttonView]}
        >
          <Icon name="backbutton" size={26} />
        </TouchableOpacity>
      </View>
    );
  };

  const renderCards = useCallback(
    ({ item }) => (
      <Card
        title={item.title}
        image={item.image}
        color={item.color}
        stylez={item.stylez}
        shippingId={item.shippingId}
      />
    ),
    [data]
  );

  return (
    <SafeAreaView style={styles.containerx}>
      <StatusBar backgroundColor={COLORS.themey} />
      <View style={{ marginTop: 0 }}>
        <View style={styles.wrapper}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={[styles.backBtn, styles.buttonWrap]}>
            <Icon name="backbutton" size={26} />
          </TouchableOpacity>
          <View style={styles.upperRow}>
            <View style={styles.upperButtons}>
              <Text style={styles.heading}>My orders</Text>
            </View>
            <TouchableOpacity onPress={() => {}} style={styles.outWrap}>
              <Icon name="bellfilled" size={26} />
            </TouchableOpacity>
            <View style={styles.lowerheader}>
              <Text style={styles.statement}>Thankyou for shopping with us</Text>
            </View>
          </View>
        </View>

        <ScrollView>
          <View style={{ marginTop: 130 }}>
            <View style={{ paddingTop: 20, width: SIZES.width - 20, paddingHorizontal: 22 }}>
              <Text style={{ fontFamily: "GtAlpine", fontSize: SIZES.medium + 4, fontWeight: "600" }}>
                Latest orders
              </Text>
            </View>

            <View style={styles.carouselContainer}>
              <FlatList
                data={primaryData}
                renderItem={renderCards}
                keyExtractor={(item) => item.id}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.list}
              />
            </View>

            <View style={styles.searchBarContainer}>
              <TextInput
                style={styles.searchInput}
                placeholder="Search orders"
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
              <TouchableOpacity style={styles.searchButton}>
                <Icon name="search" size={26} />
              </TouchableOpacity>
            </View>

            <FlatList
              horizontal
              data={["All", "pending", "transit", "completed"]}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[styles.filterButton, selectedStatus === item && styles.selectedFilter]}
                  onPress={() => setSelectedStatus(item)}
                >
                  <Text>{item}</Text>
                </TouchableOpacity>
              )}
              keyExtractor={(item) => item}
              contentContainerStyle={styles.filterContainer}
            />

            <View style={styles.detailsWrapper}>
              {sortedOrdersData.length > 0 && (
                <FlatList
                  // {...console.log(sortedOrdersData)}
                  data={filteredOrders}
                  // data={sortedOrdersData}
                  renderItem={({ item, index }) => {
                    const icons = ["isometric", "isometric2", "isometric3"];
                    const colors = ["#FFD2D5", "#D7F6D4", "#C3ECFE"];

                    const iconIndex = index % icons.length;
                    const colorIndex = index % colors.length;
                    return (
                      <SearchResultCard
                        item={item}
                        orderId={item.orderId}
                        products={item.products}
                        totals={item.totalAmount}
                        status={item.status}
                        icon={icons[iconIndex]}
                        color={colors[colorIndex]}
                      />
                    );
                  }}
                  keyExtractor={(item) => item._id}
                  contentContainerStyle={styles.list}
                  scrollEnabled={false}
                />
              )}

              {!isLoading && filteredOrders.length == 0 && (
                <View style={styles.containLottie}>
                  <View style={styles.animationWrapper}>
                    <LottieView
                      source={require("../assets/data/emptybox.json")}
                      autoPlay
                      loop
                      style={styles.animation}
                    />
                  </View>
                  <View style={{ marginTop: -20, paddingBottom: 10 }}>
                    <Text style={{ fontFamily: "GtAlpine", fontSize: SIZES.medium }}> Nothing to see here</Text>
                  </View>
                </View>
              )}
            </View>
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

export default Orders;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9F9F9",
  },
  wrapper: {
    flexDirection: "column",
    position: "absolute",
    top: 2,
  },
  backBtn: {
    left: 10,
  },
  buttonView: {
    backgroundColor: COLORS.themew,
    padding: 12,
    borderRadius: 100,
    justifyContent: "center",
    alignItems: "center",
    width: 30,
    height: 30,
    transform: [{ rotate: "180deg" }],
  },
  buttonWrap: {
    backgroundColor: COLORS.themeg,
    padding: 12,
    borderRadius: 100,
    justifyContent: "center",
    alignItems: "center",
    position: "absolute",
    zIndex: 9,
    top: 10,
    left: 10,
  },
  upperRow: {
    width: SIZES.width - 12,
    marginHorizontal: 6,
    flexDirection: "column",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: COLORS.themew,
    borderRadius: SIZES.large,
    top: SIZES.xxSmall,
    zIndex: 2,
    minHeight: 70,
  },
  upperButtons: {
    width: SIZES.width - 20,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: SIZES.medium,
  },
  topprofileheading: {
    fontSize: SIZES.medium,
    textAlign: "center",
    color: COLORS.themeb,
    fontFamily: "semibold",
  },
  outWrap: {
    backgroundColor: COLORS.themeg,
    padding: 12,
    borderRadius: 100,
    justifyContent: "center",
    alignItems: "center",
    position: "absolute",
    top: 5,
    right: 10,
  },
  lowerheader: {
    flexDirection: "column",
    justifyContent: "flex-start",
    width: SIZES.width - 20,
    marginTop: 15,
    paddingTop: SIZES.xSmall,
    paddingBottom: 20,
  },
  heading: {
    fontFamily: "bold",
    textTransform: "capitalize",
    fontSize: SIZES.xLarge + 3,
    textAlign: "left",
    color: COLORS.themeb,
    marginStart: 20,
  },
  statement: {
    fontFamily: "regular",
    paddingLeft: 20,
    paddingVertical: 5,
    color: COLORS.gray2,
    textAlign: "center",
  },
  list: {
    paddingHorizontal: 10,
    gap: 10,
    marginVertical: 10,
  },
  cardContent: {
    flex: 1,
    justifyContent: "space-between",
    flexDirection: "column",
    padding: 15,
    // overflow: "hidden",
  },
  image: {
    position: "absolute", // Default styles, overridden by `parsedStyle`
  },
  title: {
    fontSize: 16,
    fontWeight: "bold",
    color: COLORS.themeb,
    fontFamily: "semibold",
  },
  shippingId: {
    padding: 5,
    backgroundColor: COLORS.themew,
    borderRadius: SIZES.medium,
    fontSize: 14,
    color: "#cccca0",
  },
  detailsWrapper: {
    width: SIZES.width - 12,
    marginHorizontal: 6,
    marginTop: SIZES.xSmall,
    backgroundColor: COLORS.themew,
    borderRadius: SIZES.medium,
    minHeight: SIZES.height / 3,
    marginBottom: 60,
    // alignItems: "center",
    // justifyContent: "center",
    // backgroundColor: "green",
  },
  searchBarContainer: {
    flexDirection: "row",
    marginBottom: 16,
    paddingHorizontal: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  searchInput: {
    flex: 1,
    padding: 8,
    borderColor: "#ddd",
    borderWidth: 1,
    borderRadius: 100,
  },
  searchButton: {
    position: "absolute",
    right: 17,
  },
  filterContainer: {
    paddingVertical: 8,
    paddingHorizontal: 15,
    // backgroundColor: "red",
    height: 50,
  },
  filterButton: {
    marginHorizontal: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: COLORS.themew,
    borderRadius: 16,
    height: 33,
  },
  selectedFilter: {
    backgroundColor: COLORS.themey,
    color: COLORS.themew,
  },
  searchResultCard: {
    padding: 10,
    backgroundColor: COLORS.themew,
    borderRadius: SIZES.medium,
  },
  searchResultTitle: {
    fontSize: 16,
    fontWeight: "semibold",
    marginBottom: 8,
  },
  searchResultdetail: {
    fontSize: SIZES.small,
    fontWeight: "regular",
    color: COLORS.gray,
    marginBottom: 5,
  },

  searchResultStatus: {
    marginTop: 5,
    color: COLORS.gray,
    fontStyle: "italic",
  },
  flexEnd: {
    position: "absolute",
    right: 10,
  },
  checkmark: { position: "absolute", top: 17, left: 18, height: 20, zIndex: 111 },
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
    paddingTop: 26,
  },
});
