import React, { useEffect, useState, useCallback, useMemo, useContext } from "react";
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
  FlatList,
} from "react-native";
import moment from "moment";
import axios from "axios";
import { Ionicons } from "@expo/vector-icons";
import { COLORS, SIZES } from "../../../constants";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import Icon from "../../../constants/icons";
import { BACKEND_PORT } from "@env";
import LottieView from "lottie-react-native";
import { AuthContext } from "../../../components/auth/AuthContext";
// example tabs (modify if needed to reflect statuses from your API like "Pending", "Paid", "Failed")
const TABS = ["All", "pending", "paid", "failed"];

const PaymentList = ({ refreshList, setRefreshing, setiRefresh, irefresh, setPending, setRefreshList }) => {
  const navigation = useNavigation();
  const [data, setData] = useState([]);
  const [offset, setOffset] = useState(0);
  const [loading, setLoading] = useState(false);
  const [refreshingState, setRefreshingState] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("All");
  const { userData } = useContext(AuthContext);

  const limit = 200; // Adjust limit if needed
  const supplierId = userData?.supplierProfile?._id;

  // fetchData now hits your supplier payments endpoint
  const fetchData = async (reset = false, statusFilter = "All", searchQuery = "") => {
    if (loading || (!reset && !hasMore)) return;
    setLoading(true);
    try {
      const params = {
        limit,
        page: reset ? 1 : Math.floor(offset / limit) + 1,
      };

      // if filtering by status, only add if not "All"
      if (statusFilter && statusFilter !== "All") {
        params.filterStatus = statusFilter.charAt(0).toUpperCase() + statusFilter.slice(1);
      }

      if (searchQuery.trim()) {
        params.search = searchQuery.trim();
      }

      const response = await axios.get(`${BACKEND_PORT}/api/v3/payments/mine/${supplierId}`, { params });

      // our endpoint returns: { message, totalCount, totalPages, currentPage, payments }
      const newPayments = response.data.payments || [];
      setData((prev) => (reset ? newPayments : [...prev, ...newPayments]));
      setHasMore(newPayments.length === limit);
      setOffset((prev) => (reset ? limit : prev + limit));
      setError(null);
    } catch (err) {
      setError("Failed to fetch payments.");
    } finally {
      setLoading(false);
      if (reset) setRefreshingState(false);
    }
  };

  // initial & refresh fetches
  useEffect(() => {
    fetchData(true, activeTab, searchQuery);
  }, [refreshList, supplierId]);

  useEffect(() => {
    fetchData(true, activeTab, searchQuery);
  }, [activeTab, searchQuery]);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    fetchData(true, tab, searchQuery);
  };

  const handleSearch = (text) => {
    setSearchQuery(text);
    fetchData(true, activeTab, text);
  };

  const onRefresh = useCallback(() => {
    setRefreshingState(true);
    setHasMore(true);
    setOffset(0);
    fetchData(true, activeTab, searchQuery);
  }, [activeTab, searchQuery]);

  const handleEndReached = () => {
    if (!loading && hasMore) {
      fetchData(false, activeTab, searchQuery);
    }
  };

  // sort data (latest first)
  const sortedData = useMemo(() => {
    return [...data].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }, [data]);

  // filter based on status if needed (status is now in item?.status)
  const filteredData = useMemo(() => {
    if (activeTab === "All") return sortedData;
    return sortedData.filter((item) => item?.status.toLowerCase() === activeTab.toLowerCase());
  }, [sortedData, activeTab]);

  // group by date for SectionList
  const groupByDate = (list) => {
    const grouped = {};
    list.forEach((item) => {
      // group by start of day
      const dateKey = moment(item?.createdAt).startOf("day").format();
      if (!grouped[dateKey]) grouped[dateKey] = [];
      grouped[dateKey].push(item);
    });
    const sections = Object.keys(grouped)
      .sort((a, b) => new Date(b) - new Date(a))
      .map((dateKey) => ({
        title: formatSectionHeader(dateKey),
        data: grouped[dateKey],
      }));
    return sections;
  };

  // header formatting: "Today", "Yesterday", or date string
  const formatSectionHeader = (dateStr) => {
    const date = moment(dateStr);
    if (date.isSame(moment(), "day")) return "Today";
    if (date.isSame(moment().subtract(1, "day"), "day")) return "Yesterday";
    return date.format("MMM DD, YYYY");
  };

  const sections = useMemo(() => groupByDate(filteredData), [filteredData]);

  // Track pending orders if needed
  const pendingOrders = useMemo(() => {
    return sortedData.filter((order) => order.status.toLowerCase() === "pending");
  }, [sortedData]);

  useEffect(() => {
    setPending && setPending(pendingOrders);
  }, [pendingOrders, setPending]);

  useFocusEffect(
    useCallback(() => {
      onRefresh();
    }, [onRefresh])
  );

  // payment logos mapping
  const paymentLogos = {
    visacash: require("../../../assets/images/logos/visa.png"),
    mastercard: require("../../../assets/images/logos/mastercard.png"),
    paypal: require("../../../assets/images/logos/paypal.png"),
  };

  // render each payment item
  const renderItem = ({ item }) => {
    // assuming you want to display productName from inventoryRequest
    const productName = item?.inventoryRequest?.productName || "No product";
    const paymentMethod = item?.method?.toLowerCase();
    const paymentLogo = paymentLogos[paymentMethod] || require("../../../assets/images/logos/paysafecard.png");

    // example: positive check (adjust if you have an amount that can be negative)
    const isPositive = item?.amount >= 0;

    return (
      <View style={styles.paymentCard}>
        <TouchableOpacity
          style={styles.logoContainer}
          onPress={() => {
            navigation.navigate("OrderPaymentDetails", {
              item,
              supplierId,
            });
          }}
        >
          <Image source={paymentLogo} style={styles.productImage} />
        </TouchableOpacity>
        <View style={styles.infoContainer}>
          <Text style={styles.itemTitle}>{productName}</Text>
          <Text style={styles.itemSubtitle}>
            {moment(item?.createdAt).format("hh:mm A")} • {item?.method}
          </Text>
        </View>
        {/* {console.log(item)} */}
        <View style={styles.amountContainer}>
          <Text style={[styles.amountText, { color: isPositive ? COLORS.success : COLORS.error }]}>
            <Text style={[styles.amountText, { color: isPositive ? COLORS.success : COLORS.error }]}>
              {isPositive
                ? `+KSH ${Number(item?.amount).toLocaleString()}`
                : `-KSH ${Math.abs(item?.amount).toLocaleString()}`}
            </Text>
          </Text>
          <Text style={[styles.statusText, getStatusStyle(item?.status)]}>{item?.status}</Text>
        </View>
        <TouchableOpacity
          style={styles.editIcon}
          onPress={() => {
            // console.log("meeee", item?.inventoryRequest);
            navigation.navigate("SupplyDetails", {
              item: item,
              bid: item?.inventoryRequest,
              bidId: item?.inventoryRequest?._id,
            });
          }}
        >
          <Icon name="pencil" size={20} />
        </TouchableOpacity>
      </View>
    );
  };

  // render section header
  const renderSectionHeader = ({ section: { title } }) => {
    return (
      <View style={styles.sectionHeaderContainer}>
        <Text style={styles.sectionHeaderText}>{title}</Text>
      </View>
    );
  };

  // render tabs
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

  return (
    <View style={[styles.container, { marginBottom: 0 }]}>
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
          <Text style={styles.errorMessage}>{error}</Text>
          <TouchableOpacity onPress={onRefresh} style={styles.retryButton}>
            <Ionicons size={24} name="reload-circle" color={COLORS.white} />
            <Text style={styles.retryButtonText}>Retry Fetch</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <SectionList
          sections={sections}
          keyExtractor={(item) => item?._id}
          renderItem={renderItem}
          renderSectionHeader={renderSectionHeader}
          contentContainerStyle={{ padding: 4 }}
          refreshControl={<RefreshControl refreshing={refreshingState} onRefresh={onRefresh} />}
          onEndReached={handleEndReached}
          onEndReachedThreshold={0.1}
          ListFooterComponent={loading && hasMore ? <ActivityIndicator size="large" color={COLORS.primary} /> : null}
          ListEmptyComponent={
            loading ? (
              <View style={styles.loaderContainer}>
                <LottieView
                  source={require("../../../assets/data/loading.json")}
                  autoPlay
                  loop={false}
                  style={styles.animation}
                />
                <Text style={styles.loadingText}>Loading!</Text>
              </View>
            ) : (
              <View style={styles.containerx}>
                <View style={styles.animationWrapper}>
                  <LottieView
                    source={require("../../../assets/data/card-payment.json")}
                    autoPlay
                    loop={false}
                    style={styles.animation}
                  />
                  <Text style={styles.emptyText}>Oops, No Payments here!</Text>
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

const getStatusStyle = (status) => {
  // modify these styles based on your design
  if (status.toLowerCase() === "pending") return { color: "#FFA500" };
  if (status.toLowerCase() === "paid") return { color: "#008000" };
  if (status.toLowerCase() === "partial") return { color: "#D4641B" };
  if (status.toLowerCase() === "Failed") return { color: "#FF0000" };
  return {};
};

export default PaymentList;

// -------------------------------
// 10. Styles
// -------------------------------
const styles = StyleSheet.create({
  container: {
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
    marginTop: 10,
    backgroundColor: COLORS.primary,
    padding: SIZES.small,
    borderRadius: SIZES.small,
    justifyContent: "center",
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
    fontWeight: "bold",
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
    right: 10,
    backgroundColor: COLORS.themey,
    padding: 9.5,
    borderRadius: 100,
  },
  containLottie: {
    width: SIZES.width - 20,
    flex: 1,
  },
  animationWrapper: {
    // width: 200,
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
  filterContainer: {
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  // filterButton: {
  //   padding: 10,
  //   borderRadius: 20,
  //   marginHorizontal: 5,
  //   backgroundColor: "#f0f0f0",
  // },
  selectedFilter: {
    backgroundColor: COLORS.primary,
  },
  tabText: {
    fontSize: 14,
    color: "#333",
  },
  activeTabText: {
    color: "#fff",
  },

  errorContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginTop: 20,
  },
  errorMessage: {
    color: "red",
    fontSize: 16,
  },
  retryButton: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
  },
  retryButtonText: {
    marginLeft: 5,
    color: "#fff",
  },
  paymentCard: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 10,
    alignItems: "center",
    marginBottom: 10,
  },
  logoContainer: {
    borderRadius: 100,
    backgroundColor: COLORS.lightWhite,
    width: 60,
    height: 36,
    justifyContent: "center",
    alignItems: "center",
  },
  productImage: {
    width: 40,
    height: 40,
    resizeMode: "contain",
  },
  infoContainer: {
    flex: 1,
    paddingHorizontal: 10,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: "500",
  },
  itemSubtitle: {
    fontSize: 14,
    color: "#666",
  },
  amountContainer: {
    alignItems: "flex-end",
  },
  amountText: {
    fontSize: 16,
    fontWeight: "bold",
  },
  statusText: {
    fontSize: 14,
    marginTop: 4,
    fontWeight: "bold",
  },
  editIcon: {
    marginLeft: 8,
  },
  sectionHeaderContainer: {
    paddingVertical: 5,
    backgroundColor: "#f5f5f5",
    paddingHorizontal: 10,
  },
  sectionHeaderText: {
    fontSize: 16,
    fontWeight: "600",
  },
  separator: {
    height: 10,
  },
  loaderContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: SIZES.medium,
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  emptyText: {
    marginTop: 10,
    fontSize: SIZES.medium,
  },
});
