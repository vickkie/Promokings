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
import React, { useRef, useState, useCallback, useEffect } from "react";
import { COLORS, SIZES, SHADOWS } from "../../../constants";
import useFetch from "../../../hook/useFetch";
import { SafeAreaView } from "react-native-safe-area-context";
import ProductListCard from "./ProductListCard";
import { Ionicons } from "@expo/vector-icons";
import Icon from "../../../constants/icons";
import { useNavigation, useRoute } from "@react-navigation/native";

import { useFocusEffect } from "@react-navigation/native";

import { Picker } from "@react-native-picker/picker";

const EditProductList = () => {
  const route = useRoute();

  const categoryTitle = route.params?.categoryTitle || "";
  const products = route.params?.products ? route.params.products : "products";

  // console.log(route.params);

  const { data, isLoading, error, refetch } = useFetch(products);

  const [refreshList, setRefreshList] = useState(false);

  const [refreshing, setRefreshing] = useState(false);
  const [isGridView, setIsGridView] = useState(true);
  const [categories, setCategories] = useState([]);
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

  // useFocusEffect(
  //   useCallback(() => {
  //     if (route.params) {
  //       navigation.setParams({ refreshList: undefined, products: "products" }); // Clear params
  //     }
  //   }, [route.params])
  // );

  useEffect(() => {
    if (data.length > 0) {
      const uniqueCategories = [...new Set(data.map((item) => item.category))];
      setCategories(uniqueCategories);
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
  const filteredData = data
    .filter((item) => (selectedCategory ? item.category === selectedCategory : true))
    .filter((item) => item.title.toLowerCase().includes(searchText.toLowerCase()));

  const flatListKey = isGridView ? "grid" : "list"; // Key for FlatList

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.topWelcomeWrapper}>
        <View style={styles.appBarWrapper}>
          <View style={styles.appBar}>
            <TouchableOpacity style={styles.buttonWrap} onPress={() => navigation.goBack()}>
              <Icon name="backbutton" size={24} />
            </TouchableOpacity>

            <Text style={styles.greetingMessage}>
              <Text style={styles.username}>Products</Text>
            </Text>

            <View style={{ flexDirection: "row" }}>
              <TouchableOpacity onPress={toggleSearching} style={styles.buttonWrap2}>
                {!searching ? <Icon name="search" size={24} /> : <Icon name="menu" size={24} />}
              </TouchableOpacity>
            </View>
          </View>
        </View>
        <View style={styles.totalWrapper}>
          <Text style={styles.totalCount}>{filteredData.length} Products in inventory</Text>
        </View>
      </View>

      <View style={styles.bottomList}>
        <View style={styles.viewToggleContainer}>
          {searching ? (
            <View style={styles.searchWrapper}>
              <TextInput
                ref={inputRef}
                value={searchText}
                onChangeText={(text) => setSearchText(text)}
                onSubmitEditing={handleSearch}
                style={styles.searchInput}
                placeholder="Search items..."
              />
            </View>
          ) : (
            <TouchableOpacity style={styles.button} onPress={() => {}}>
              <View style={styles.content}>
                <Text style={styles.text}>Sort</Text>
                <Ionicons name="chevron-down" size={16} color="#000" />
              </View>
              <Picker
                selectedValue={selectedCategory}
                style={styles.picker}
                onValueChange={(itemValue) => setSelectedCategory(itemValue)}
              >
                <Picker.Item label="All Categories" value="" />
                {categories.map((category, index) => (
                  <Picker.Item key={index} label={category} value={category} />
                ))}
              </Picker>
            </TouchableOpacity>
          )}

          {searching ? (
            <View style={styles.searchBtn}>
              <TouchableOpacity onPress={handleSearch}>
                <Ionicons name="ios-search-circle" size={SIZES.xxLarge - 6} color={COLORS.white} />
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity onPress={toggleViewMode} style={styles.toggleViewMode}>
              {!isGridView ? <Icon name="menu" size={24} /> : <Ionicons name="list-outline" size={26} />}
            </TouchableOpacity>
          )}
        </View>

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
            keyExtractor={(item) => item._id}
            contentContainerStyle={[{ columnGap: SIZES.medium }, styles.flatlistContainer]}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
            numColumns={isGridView ? 2 : 1}
            data={filteredData}
            renderItem={({ item }) => <ProductListCard item={item} isGridView={isGridView} />}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          />
        )}

        {filteredData.length === 0 && !isLoading && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorMessage}>Sorry, no products available</Text>
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

        {showScrollTopButton && (
          <View style={styles.toTopButton}>
            <TouchableOpacity onPress={scrollTop}>
              <Ionicons name="arrow-up-circle-outline" size={32} color={COLORS.white} />
            </TouchableOpacity>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
};

export default EditProductList;

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    paddingTop: SIZES.xxSmall,
    width: SIZES.width,
  },

  picker: {
    height: 20,
    width: SIZES.width - 160,
  },

  flatlistContainer: {
    paddingTop: SIZES.xxSmall,
    paddingLeft: SIZES.small / 2,
    width: SIZES.width - SIZES.small,
    paddingBottom: 510,
  },
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
    flex: 1,
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
  appBarWrapper: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.medium,
    marginTop: 10,
  },
  appBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginHorizontal: 10,
    width: SIZES.width - 20,
  },

  buttonWrap: {
    backgroundColor: COLORS.hyperlight,
    padding: 15,
    borderRadius: 100,
    justifyContent: "center",
    alignItems: "center",
  },
  buttonWrap2: {
    backgroundColor: COLORS.hyperlight,
    borderRadius: 100,
    width: 50,
    height: 50,
    justifyContent: "center",
    alignItems: "center",
    marginEnd: 4,
  },
  topWelcomeWrapper: {
    minHeight: 140,
    backgroundColor: COLORS.themew,
    borderRadius: SIZES.medium,
    ...SHADOWS.small,
    marginBottom: 2,
    shadowColor: COLORS.lightWhite,
    width: SIZES.width - 10,
  },
  greeting: {
    flex: 1,
    justifyContent: "center",
    // alignItems: "center",
    paddingHorizontal: 20,
  },
  greetingMessage: {
    fontFamily: "bold",
    fontSize: SIZES.xLarge,
  },
  hello: {
    fontFamily: "regular",
    color: "#BABDB6",
  },
  username: {
    fontFamily: "semibold",
    color: COLORS.themeb,
  },
  totalWrapper: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 20,
    alignItems: "center",
  },
  totalCount: {
    fontFamily: "regular",
    color: "#BABDB6",
    fontSize: SIZES.medium,
  },
  lowerWelcome: {
    backgroundColor: COLORS.themew,
    marginHorizontal: 4,
    borderTopLeftRadius: SIZES.medium,
    borderTopRightRadius: SIZES.medium,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  lowerWelcomeWrapper: {
    backgroundColor: COLORS.themeg,
    borderTopLeftRadius: SIZES.medium,
    borderTopRightRadius: SIZES.medium,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  bottomList: {
    backgroundColor: COLORS.themew,
    borderRadius: SIZES.medium,
    marginTop: SIZES.xxSmall,
    width: SIZES.width - 10,
    minHeight: SIZES.height - 22,
  },
  viewToggleContainer: {
    marginBottom: 10,
    alignItems: "center",
  },
  viewToggleContainer: {
    flexDirection: "row",
    padding: 10,
    display: "flex",
    justifyContent: "space-between",
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    backgroundColor: COLORS.themeg,
    borderRadius: 15,
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
