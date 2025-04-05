import {
  FlatList,
  Text,
  View,
  ActivityIndicator,
  TouchableOpacity,
  RefreshControl,
  StyleSheet,
  TextInput,
} from "react-native";
import React, { useRef, useState, useCallback, useEffect, useContext } from "react";
import { COLORS, SIZES, SHADOWS } from "../../../constants";
import useFetch from "../../../hook/useFetch";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import Icon from "../../../constants/icons";
import { useNavigation, useRoute } from "@react-navigation/native";
import InventoryAdd from "../../../components/bottomsheets/InventoryAdd";

import { useFocusEffect } from "@react-navigation/native";

import { Picker } from "@react-native-picker/picker";
import RequestCard from "./RequestCard";
import { AuthContext } from "../../../components/auth/AuthContext";

const LatestOrders = () => {
  const route = useRoute();
  const { userData, userLogin } = useContext(AuthContext);
  const categoryTitle = route.params?.categoryTitle || "";

  const { data, isLoading, error, refetch } = useFetch(
    `inventory-requests/supplier/accepted/${userData?.supplierProfile?._id}`
  );

  console.log(userData?.supplierProfile?._id);

  const [refreshList, setRefreshList] = useState(false);

  const [refreshing, setRefreshing] = useState(false);
  const [isGridView, setIsGridView] = useState(false);
  const [statuses, setstatuses] = useState(["Pending", "Accepted", "Rejected"]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [searching, setIsSearching] = useState(false);
  const [searchText, setSearchText] = useState("");

  const navigation = useNavigation();
  const scrollRef = useRef(null);
  const [showScrollTopButton, setShowScrollTopButton] = useState(false);
  const inputRef = useRef(null);

  //refetch on update
  useFocusEffect(
    useCallback(() => {
      if (route.params?.refreshList && !refreshList) {
        setRefreshList(true);
        onRefresh();
      }
      setRefreshing(false);

      return () => {
        //  cleanup logic i will add
      };
    }, [route.params, refreshList])
  );

  useFocusEffect(
    useCallback(() => {
      if (route.params?.categoryTitle && categoryTitle !== "") {
        setSelectedCategory(categoryTitle);
      }

      return () => {
        //  cleanup logic i will add if i need
      };
    }, [route.params, categoryTitle])
  );

  const BottomSheetRef = React.useRef(null);

  const openMenu = () => {
    if (BottomSheetRef.current) {
      BottomSheetRef.current.present();
    }
  };

  useEffect(() => {
    if (data.length > 0) {
      const uniqueStatus = [...new Set(data.map((item) => item.status))];
      setstatuses(uniqueStatus);
    }
  }, [data]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    try {
      refetch();
      navigation.setParams({ refreshList: undefined, products: "products" }); // Clear params
    } catch (error) {
      // Handle error
    } finally {
      setRefreshing(false);
    }
  }, [refetch]);

  const handleScroll = (event) => {
    const offsetY = event.nativeEvent.contentOffset.y;
    setShowScrollTopButton(offsetY > 100);
  };

  const scrollTop = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollToOffset({ offset: 0, animated: true });
    }
  };

  const toggleViewMode = () => {
    setIsGridView(!isGridView);
  };

  const toggleSearching = () => {
    setIsSearching(!searching);
  };

  const handleSearch = () => {
    inputRef.current?.blur(); // Dismiss keyboard on search
  };

  // Filter products based on selected category, selected and search text
  const filteredData = data.filter((item) => item.productName.toLowerCase().includes(searchText.toLowerCase()));

  const now = new Date();

  const flatListKey = isGridView ? "grid" : "list"; // Key for FlatList

  return (
    <>
      <InventoryAdd ref={BottomSheetRef} />
      <View style={styles.topWelcomeWrapper}>
        {isLoading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={COLORS.primary} />
          </View>
        )}

        {!isLoading && filteredData.length > 0 && (
          <FlatList
            ref={scrollRef}
            onScroll={handleScroll}
            scrollEventThrottle={16}
            key={flatListKey}
            scrollEnabled={false}
            keyExtractor={(item) => item._id}
            contentContainerStyle={[{ columnGap: SIZES.medium }, styles.flatlistContainer]}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
            numColumns={isGridView ? 2 : 1}
            data={filteredData}
            renderItem={({ item }) => <RequestCard item={item} isGridView={isGridView} />}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          />
        )}

        {filteredData.length === 0 && !isLoading && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorMessage}>Sorry, no bids available</Text>
            <TouchableOpacity onPress={refetch} style={styles.retryButton}>
              <Ionicons size={24} name={"reload-circle"} color={COLORS.white} />
              <Text style={styles.retryButtonText}>Retry Again</Text>
            </TouchableOpacity>
          </View>
        )}

        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorMessage}>Error loading products</Text>
            <TouchableOpacity onPress={refetch} style={styles.retryButton}>
              <Text style={styles.retryButtonText}>Retry Fetch</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </>
  );
};

export default LatestOrders;

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    height: SIZES.height,
  },

  separator: {
    height: 16,
  },
  errorContainer: {
    // flex: 1,
    alignItems: "center",
    justifyContent: "center",
    alignContent: "center",
    height: SIZES.height,
  },
  errorMessage: {
    fontFamily: "bold",
  },

  retryButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 14,
    marginTop: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  retryButtonText: {
    color: "#fff",
    fontSize: SIZES.medium,
    textAlign: "center",
  },
  toTopButton: {
    position: "absolute",
    bottom: 20,
    right: 20,
    backgroundColor: "black",
    padding: 10,
    borderRadius: 100,
  },
  textStyles: {
    fontFamily: "bold",
    fontSize: 19,
  },

  content: {
    flexDirection: "row",
    alignItems: "center",
  },
  text: {
    fontSize: 16,
    color: "#000",
    marginRight: 5,
  },
  toggleViewMode: {
    padding: 10,
    borderRadius: 100,
    padding: 6,
    height: 50,
    width: 50,
    backgroundColor: COLORS.themeg,
    justifyContent: "center",
    alignItems: "center",
  },
  searchWrapper: {
    flex: 1,
    backgroundColor: COLORS.themeg,
    marginRight: 10,
    borderRadius: SIZES.medium,
    justifyContent: "center",
    paddingLeft: 10,
  },
  searchInput: {
    fontFamily: "regular",
    width: "100%",
  },
  searchBtn: {
    padding: 10,
    borderRadius: 100,
    padding: 6,
    height: 50,
    width: 50,
    backgroundColor: COLORS.themeg,
    justifyContent: "center",
    alignItems: "center",
  },
});
