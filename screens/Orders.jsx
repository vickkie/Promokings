import React, { useContext, useState, useEffect } from "react";
import { View, Text, TextInput, FlatList, TouchableOpacity, StyleSheet, Image, SafeAreaView } from "react-native";
import { COLORS, SIZES } from "../constants";
import Icon from "../constants/icons";
import { useNavigation } from "@react-navigation/native";
import { AuthContext } from "../components/auth/AuthContext";
import useFetch from "../hook/useFetch";

const Orders = () => {
  const [userId, setUserId] = useState(null);
  const { userData, userLogin } = useContext(AuthContext);
  const navigation = useNavigation();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("All");

  useEffect(() => {
    if (!userLogin) {
      setUserId(1);
      navigation.navigate("Login");
      return;
    } else if (userData && userData._id) {
      setUserId(userData._id);
    }
  }, [userLogin, userData]);

  const { data, isLoading, error, refetch } = useFetch(`orders/user/${userId}`);

  const [ordersData, setOrdersData] = useState([]);
  const [products, setProducts] = useState("");
  const [orderItems, setOrderItems] = useState("");

  const [sortedOrdersData, setSortedOrdersData] = useState([]);
  const [last3orders, setlast3orders] = useState([]);

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
      title: "Premium Box Packing",
      image: require("../assets/images/isometric.png"),
      // shippingId: "V789456AR123",
      shippingId: last3orders[0] ? last3orders[0].id : "Order now",

      color: "#ffedd2",
      stylez: '{"height": 220, "width": 220, "position": "absolute", "right": -50, "top": -10, "opacity": 0.6}',
    },
    {
      id: "2",
      title: "Small Box Packing",
      image: require("../assets/images/isometric2.png"),
      shippingId: last3orders[1] ? last3orders[1].id : "Order now",
      color: "#a3eed8",
      stylez:
        '{"height": 170, "width": 170, "position": "absolute", "right": -67, "top": 25, "opacity": 0.8,"transform": [{ "rotate": "-15deg" }]}',
    },
    {
      id: "3",
      title: "Envelope Packing",
      image: require("../assets/images/isometric.png"),
      color: "#e6bfdf",
      shippingId: last3orders[2] ? last3orders[2].id : "Order now",

      stylez: '{"height": 220, "width": 220, "position": "absolute", "right": -40, "top": -10, "opacity": 0.6}',
    },
  ];

  const searchData = [
    {
      id: "101",
      title: "Order #101",
      status: "Pending",
      details: "Order details for #101",
    },
    {
      id: "102",
      title: "Order #102",
      status: "On Delivery",
      details: "Order details for #102",
    },
    {
      id: "103",
      title: "Order #103",
      status: "Delivered",
      details: "Order details for #103",
    },
    // Add more search data as needed
  ];

  useEffect(() => {
    if (sortedOrdersData.length > 0) {
      function extractProductDetails(orders) {
        orders.forEach((order) => {
          console.log("orderid", order._id);

          setOrderItems();

          order.products.forEach((product) => {
            // console.log(product);
            const items = product.cartItem._id;

            const { _id, title, price, imageUrl, description } = product.cartItem._id || {};

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
  }, [sortedOrdersData]);

  const filterOrdersByStatus = () => {
    return searchData.filter((order) => selectedStatus === "All" || order.status === selectedStatus);
  };

  const filterOrdersBySearchQuery = (orders) => {
    return orders.filter((order) => order.title.toLowerCase().includes(searchQuery.toLowerCase()));
  };

  const filteredOrders = filterOrdersBySearchQuery(filterOrdersByStatus());

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
              <Text style={styles.shippingId}>{`ID: ${shippingId}`}</Text>
            </View>
          </View>
          <View>
            <TouchableOpacity onPress={() => navigation.goBack()} style={[styles.backBtn, styles.buttonView]}>
              <Icon name="backbutton" size={26} />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  const SearchResultCard = ({ orderId, item, products, status }) => {
    const titles = products
      .map((product) => {
        const { title } = product.cartItem._id || {};
        return title;
      })
      .filter(Boolean); // This filters out undefined titles, in case some products don't have titles

    const titlesString = titles.join(", ");

    console.log("titles", titlesString);

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
          },
        ]}
      >
        <TouchableOpacity
          style={{
            borderRadius: 100,
            padding: 10,
            backgroundColor: COLORS.themeg,
            width: 30,
            height: 30,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Icon name="home" size={16} />
        </TouchableOpacity>
        <View>
          <Text style={styles.searchResultTitle}>{titlesString}</Text>
          <Text style={styles.searchResultdetail}>Order id : {orderId}</Text>
        </View>
        <TouchableOpacity onPress={() => navigation.goBack()} style={[styles.flexEnd, styles.buttonView]}>
          <Icon name="backbutton" size={26} />
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
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
            <Text style={styles.statement}>You can track your orders from here</Text>
          </View>
        </View>
      </View>

      <View style={{ paddingTop: 20, width: SIZES.width - 20, paddingHorizontal: 22 }}>
        <Text style={{ fontFamily: "semibold", fontSize: SIZES.medium + 4, letterSpacing: 0 }}>Latest orders</Text>
      </View>

      <View style={styles.carouselContainer}>
        <FlatList
          data={primaryData}
          renderItem={({ item }) => (
            <Card
              title={item.title}
              image={item.image}
              color={item.color}
              stylez={item.stylez}
              shippingId={item.shippingId}
            />
          )}
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
        data={["All", "Pending", "On Delivery", "Delivered"]}
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
        <FlatList
          {...console.log(sortedOrdersData)}
          data={sortedOrdersData}
          renderItem={({ item }) => (
            <SearchResultCard item={item} orderId={item.orderId} products={item.products} status={item.status} />
          )}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.list}
        />
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
    // flex: 1,
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
    top: 10,
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
    paddingHorizontal: 22,
  },
  filterButton: {
    marginHorizontal: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: "#f0f0f0",
    borderRadius: 16,
    height: 30,
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
});
