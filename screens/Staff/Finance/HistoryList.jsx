import React, { useEffect, useState, useCallback, useMemo } from "react";
import {
  View,
  Text,
  SectionList,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Image,
  RefreshControl,
  TextInput,
} from "react-native";
import moment from "moment";
import axios from "axios";
import { Ionicons } from "@expo/vector-icons";
import { COLORS, SIZES } from "../../../constants";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import Icon from "../../../constants/icons";
import { BACKEND_PORT } from "@env";
import { FlatList } from "react-native";
import LottieView from "lottie-react-native";

// Example tabs
const TABS = ["All", "partial", "paid"];

const HistoryList = ({ refreshList, setRefreshing, setiRefresh, irefresh, setPending, setRefreshList }) => {
  const navigation = useNavigation();

  const [data, setData] = useState([]);
  const [offset, setOffset] = useState(0);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing2] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  // For controlling which tab is selected
  const [activeTab, setActiveTab] = useState("All");

  const limit = 200; // Adjusted limit for performance

  const fetchData = async (reset = false, paymentStatus = "All", searchQuery = "") => {
    if (loading || (!reset && !hasMore)) return;
    setLoading(true);

    try {
      const params = {
        limit,
        offset: reset ? 0 : offset,
        paymentStatus: paymentStatus !== "All" ? paymentStatus.toLowerCase() : undefined,
      };

      if (searchQuery.trim()) {
        params.search = searchQuery.trim(); // Only add search if it's not empty
      }

      const response = await axios.get(`${BACKEND_PORT}/api/orders`, {
        params,
        Authorization: `Bearer ${userData?.TOKEN}`,
      });

      const newOrders = response.data.orders || [];
      setData((prev) => (reset ? newOrders : [...prev, ...newOrders]));

      setHasMore(newOrders.length === limit);
      setOffset((prev) => (reset ? limit : prev + limit));
      setError(null);
    } catch (err) {
      setError("Failed to fetch orders.");
    } finally {
      setLoading(false);
      if (reset) setRefreshing2(false);
    }
  };

  // Initial fetch (or refetch when refreshList changes)
  useEffect(() => {
    fetchData(true);
  }, [refreshList]);

  useEffect(() => {
    fetchData(true, activeTab, searchQuery);
  }, [activeTab, searchQuery]);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    fetchData(true, tab);
  };

  const handleSearch = (text) => {
    setSearchQuery(text);
    fetchData(true, activeTab, text);
  };

  // -------------------------------
  // 2. Pull-to-Refresh
  // -------------------------------
  const onRefresh = useCallback(() => {
    setRefreshing2(true);
    setHasMore(true);
    fetchData(true);
  }, []);

  // -------------------------------
  // 3. Infinite scroll
  // -------------------------------
  const handleEndReached = () => {
    if (!loading && hasMore) {
      fetchData(false);
    }
  };

  // -------------------------------
  // 4. Sort + Filter Data
  // -------------------------------
  // Sort data by creation date (latest first)
  const sortedData = useMemo(() => {
    return [...data].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }, [data]);

  // Example: filter by “Sent”, “Request”, “Transfer”, etc.
  // (You need to adapt this to how your data tracks each transaction type.)
  const filteredData = useMemo(() => {
    if (activeTab === "All") return sortedData;
    return sortedData.filter((item) => {
      // Example: if item.transactionType === "sent", "transfer", etc.
      // Adjust this field name based on your actual data
      const type = item?.paymentStatus?.toLowerCase() || "";
      return type === activeTab.toLowerCase();
    });
  }, [sortedData, activeTab]);

  // -------------------------------
  // 5. Group by Date for SectionList
  // -------------------------------
  const groupByDate = (list) => {
    const grouped = {};

    list.forEach((item) => {
      // Start of day as key => "2025-09-19T00:00:00Z"
      const dateKey = moment(item.createdAt).startOf("day").format();
      if (!grouped[dateKey]) grouped[dateKey] = [];
      grouped[dateKey].push(item);
    });

    // Convert grouped object to an array of sections
    // Sort by date descending
    const sections = Object.keys(grouped)
      .sort((a, b) => new Date(b) - new Date(a))
      .map((dateKey) => {
        return {
          title: formatSectionHeader(dateKey),
          data: grouped[dateKey],
        };
      });

    return sections;
  };

  // Utility: Show “Today” / “Yesterday” / “MMM DD, YYYY”
  const formatSectionHeader = (dateStr) => {
    const date = moment(dateStr);
    if (date.isSame(moment(), "day")) return "Today";
    if (date.isSame(moment().subtract(1, "day"), "day")) return "Yesterday";
    return date.format("MMM DD, YYYY");
  };

  // Prepare final sections
  const sections = useMemo(() => groupByDate(filteredData), [filteredData]);

  // -------------------------------
  // 6. Pending Orders
  // -------------------------------
  const pendingOrders = useMemo(() => {
    return sortedData.filter((order) => ["pending"].includes(order.paymentStatus));
  }, [sortedData]);

  // Let parent know about pending orders
  useEffect(() => {
    setPending && setPending(pendingOrders);
  }, [pendingOrders, setPending]);

  // Refresh when screen is focused
  useFocusEffect(
    useCallback(() => {
      onRefresh();
    }, [onRefresh])
  );

  // -------------------------------
  // 7. Render Items
  // -------------------------------
  const paymentLogos = {
    visa: require("../../../assets/images/logos/visa.png"),
    mastercard: require("../../../assets/images/logos/mastercard.png"),
    paypal: require("../../../assets/images/logos/paypal.png"),
  };

  const renderItem = ({ item }) => {
    const paymentMethod = item?.paymentInfo?.selectedPaymentMethod?.toLowerCase();
    const paymentLogo = paymentLogos[paymentMethod] || require("../../../assets/images/logos/paysafecard.png");

    // Example: decide color based on +/- amount
    const isPositive = item.totalAmount >= 0;

    return (
      <View style={styles.latestProductCards}>
        {/* Logo / Icon */}
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
              products: item?.products,
              orderId: item._id,
              item,
            });
          }}
        >
          <Image source={paymentLogo} style={styles.productImage} />
        </TouchableOpacity>

        {/* Middle Info */}
        <View style={{ flex: 1 }}>
          {/* Maybe the user’s name or merchant name */}
          <Text style={styles.itemTitle}>{item?.userId?.fullname || item?.userId?.username || "Unknown User"}</Text>

          {/* Show time or transaction type, etc. */}
          <Text style={styles.itemSubtitle}>
            {moment(item.createdAt).format("hh:mm A")} {item.transactionType ? `• ${item.transactionType}` : ""}
          </Text>
        </View>

        {/* Right-side Amount & Status */}
        <View style={{ alignItems: "flex-end" }}>
          <Text style={[styles.amountText, { color: isPositive ? COLORS.success : COLORS.error }]}>
            {isPositive ? `+KSH ${item.totalAmount}` : `-KSH ${Math.abs(item.totalAmount)}`}
          </Text>

          <Text style={[styles.statusText, getStatusStyle(item.paymentStatus)]}>{item.paymentStatus}</Text>
        </View>

        {/* Edit Icon */}
        <TouchableOpacity
          style={{ marginLeft: 8 }}
          onPress={() => {
            navigation.navigate("OrderPaymentDetails", {
              products: item?.products,
              orderId: item._id,
              item,
            });
          }}
        >
          <Icon name="pencil" size={20} />
        </TouchableOpacity>
      </View>
    );
  };

  // Section Header (Today, Yesterday, etc.)
  const renderSectionHeader = ({ section: { title } }) => {
    return (
      <View style={styles.sectionHeaderContainer}>
        <Text style={styles.sectionHeaderText}>{title}</Text>
      </View>
    );
  };

  // -------------------------------
  // 8. Tab Rendering
  // -------------------------------
  const renderTabs = () => {
    return (
      <FlatList
        horizontal
        data={TABS}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.filterButton, activeTab === item && styles.selectedFilter]}
            onPress={() => handleTabChange(item)}
          >
            <Text style={[styles.tabText, activeTab === item && styles.activeTabText]}>{item}</Text>
          </TouchableOpacity>
        )}
        keyExtractor={(item) => item}
        contentContainerStyle={styles.filterContainer}
        showsHorizontalScrollIndicator={false}
      />
    );
  };

  // -------------------------------
  // 9. Render Component
  // -------------------------------
  return (
    <View style={[styles.container, { marginBottom: 0 }]}>
      {/* Render the top tabs */}
      {renderTabs()}

      <View style={styles.searchBarContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search Payment"
          value={searchQuery}
          onChangeText={handleSearch}
        />
        <TouchableOpacity style={styles.searchButton}>
          <Icon name="search" size={26} />
        </TouchableOpacity>
      </View>

      {error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorMessage}>Looks like you're offline</Text>
          <TouchableOpacity onPress={onRefresh} style={styles.retryButton}>
            <Ionicons size={24} name="reload-circle" color={COLORS.white} />
            <Text style={styles.retryButtonText}>Retry Fetch</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <SectionList
          sections={sections}
          keyExtractor={(item) => item._id}
          renderItem={renderItem}
          renderSectionHeader={renderSectionHeader}
          contentContainerStyle={{ padding: 4 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          onEndReached={handleEndReached}
          onEndReachedThreshold={0.1}
          ListFooterComponent={loading && hasMore ? <ActivityIndicator size="large" color={COLORS.primary} /> : null}
          ListEmptyComponent={
            loading ? (
              <View style={styles.containerx}>
                <View style={styles.containLottie}>
                  <View style={styles.animationWrapper}>
                    <LottieView
                      source={require("../../../assets/data/loading.json")}
                      autoPlay
                      loop={false}
                      style={styles.animation}
                    />
                  </View>
                  <View style={{ marginTop: 0, paddingBottom: 20 }}>
                    <Text style={{ fontFamily: "GtAlpine", fontSize: SIZES.medium }}>"Loading!</Text>
                  </View>
                </View>
              </View>
            ) : (
              <View style={styles.containerx}>
                <View style={styles.containLottie}>
                  <View style={styles.animationWrapper}>
                    <LottieView
                      source={require("../../../assets/data/card-payment.json")}
                      autoPlay
                      loop={false}
                      style={styles.animation}
                    />
                  </View>
                  <View style={{ marginTop: 0, paddingBottom: 20 }}>
                    <Text style={{ fontFamily: "GtAlpine", fontSize: SIZES.medium }}>"Oops, No Payments here!</Text>
                  </View>
                </View>
              </View>
            )
          }
          ItemSeparatorComponent={() => <View style={styles.separator} />}
        />
      )}
    </View>
  );
};

export default HistoryList;

// -------------------------------
// 10. Styles
// -------------------------------
const styles = StyleSheet.create({
  container: {
    // flex: 1,
    marginTop: 90,
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
    justifyContent: "center",
    height: 100,
  },
  latestProductTitle: {
    fontSize: 16,
    fontWeight: "600", // Changed from "semibold" (not valid)
    marginBottom: 8,
  },
  latestProductdetail: {
    fontSize: SIZES.small,
    fontWeight: "400", // Changed from "regular" (not valid)
    color: COLORS.gray,
    marginBottom: 5,
  },
  flexMe: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 10,
  },
  statusText: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: SIZES.medium,
    width: 80,
    textAlign: "center",
  },
  // Added missing styles:
  centerContent: {
    justifyContent: "center",
    alignItems: "center",
  },
  textCenter: {
    textAlign: "center",
  },
  fullWidth: {
    width: "100%",
  },
  boldText: {
    fontWeight: "bold",
  },
  filterContainer: {
    paddingVertical: 8,
    paddingHorizontal: 15,
    // backgroundColor: "red",
    // height: 50,
  },
  filterButton: {
    marginHorizontal: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: COLORS.themeg,
    borderRadius: 16,
    height: 33,
  },
  selectedFilter: {
    backgroundColor: COLORS.themey,
    color: COLORS.themew,
  },
  sectionHeaderContainer: {
    backgroundColor: COLORS.lightWhite,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderTopLeftRadius: SIZES.small,
    borderTopRightRadius: SIZES.small,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray,
  },
  sectionHeaderText: {
    fontSize: SIZES.medium,
    fontWeight: "bold",
    color: COLORS.primary,
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

// Helper to color-code status
function getStatusStyle(paymentStatus) {
  switch (paymentStatus) {
    case "pending":
      return { backgroundColor: "#C0DAFF" };
    case "paid":
      return { backgroundColor: "#CBFCCD" };
    case "partial":
      return { backgroundColor: "#F3D0CE" };
    default:
      return { backgroundColor: "#ccc" };
  }
}
