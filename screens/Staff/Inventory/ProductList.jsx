import { FlatList, Text, View, ActivityIndicator, TouchableOpacity, RefreshControl, StyleSheet } from "react-native";
import React, { useRef, useState, useCallback } from "react";
import { COLORS, SIZES, SHADOWS } from "../../../constants";
import useFetch from "../../../hook/useFetch";
import { SafeAreaView } from "react-native-safe-area-context";
import ProductsCardView from "../../../components/products/ProductsCardView";
import { Ionicons } from "@expo/vector-icons";
import Icon from "../../../constants/icons";
import { useNavigation } from "@react-navigation/native";

const EditProductList = () => {
  const { data, isLoading, error, refetch } = useFetch("products");
  const [refreshing, setRefreshing] = useState(false);

  const navigation = useNavigation();

  const scrollRef = useRef(null);
  const [showScrollTopButton, setShowScrollTopButton] = useState(false);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    try {
      refetch();
    } catch (error) {
      // console.error("Failed to refresh data", error);
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

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  if (data.length === 0) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorMessage}>Sorry, no products available</Text>
        <TouchableOpacity onPress={refetch} style={styles.retryButton}>
          <Ionicons size={24} name={"reload-circle"} color={COLORS.white} />
          <Text style={styles.retryButtonText}>Retry Again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorMessage}>Error loading products</Text>
        <TouchableOpacity onPress={refetch} style={styles.retryButton}>
          <Text style={styles.retryButtonText}>Retry Fetch</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.topWelcomeWrapper}>
        <View style={styles.appBarWrapper}>
          <View style={styles.appBar}>
            <TouchableOpacity
              style={styles.buttonWrap}
              onPress={() => {
                navigation.goBack();
              }}
            >
              <Icon name="backbutton" size={24} />
            </TouchableOpacity>

            <Text style={styles.greetingMessage}>
              <Text style={styles.username}>Products</Text>
            </Text>

            <View style={{ flexDirection: "row" }}>
              <TouchableOpacity onPress={() => {}} style={styles.buttonWrap2}>
                <Icon name="menu" size={24} />
              </TouchableOpacity>
            </View>
          </View>
        </View>
        <View style={styles.totalWrapper}>
          <Text style={styles.totalCount}>{data.length} Products in inventory</Text>
        </View>
      </View>
      <FlatList
        ref={scrollRef}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        keyExtractor={(item) => item._id}
        contentContainerStyle={[{ columnGap: SIZES.medium }, styles.flatlistContainer]}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        numColumns={2}
        data={data}
        renderItem={({ item }) => <ProductsCardView item={item} />}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      />
      {showScrollTopButton && (
        <View style={styles.toTopButton}>
          <TouchableOpacity onPress={scrollTop}>
            <Ionicons name="arrow-up-circle-outline" size={32} color={COLORS.white} />
          </TouchableOpacity>
        </View>
      )}
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

  flatlistContainer: {
    paddingTop: SIZES.xxLarge,
    paddingLeft: SIZES.small / 2,
    width: SIZES.width - SIZES.small,
    // flex: 1,
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
    borderRadius: SIZES.medium,
  },
  topSafeview: {
    flex: 1,
    backgroundColor: COLORS.themeg,
    borderRadius: SIZES.medium,
    marginTop: SIZES.xxSmall,
  },
});
