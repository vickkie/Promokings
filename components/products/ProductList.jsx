import { FlatList, Text, View, ActivityIndicator, TouchableOpacity } from "react-native";
import React from "react";
import { COLORS, SIZES } from "../../constants";
import useFetch from "../../hook/useFetch";
import { SafeAreaView } from "react-native-safe-area-context";
import styles from "./productlist.style";
import ProductsCardView from "./ProductsCardView";
import { Ionicons } from "@expo/vector-icons";
import Animated, { useAnimatedScrollHandler, useAnimatedStyle, useSharedValue } from "react-native-reanimated";
import { useRoute } from "@react-navigation/native";

const ProductList = () => {
  const route = useRoute();
  const { routeParam } = route.params; // Accessing routeParam from route.params
  const { data, isLoading, error, refetch } = useFetch(routeParam);

  // console.log("route ", routeParam);

  const scrollY = useSharedValue(0);
  const scrollRef = React.useRef(null);

  const handleRefetch = () => {
    refetch();
  };

  //Animated scroll to top details ->

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
    },
  });

  const buttonStyle = useAnimatedStyle(() => {
    return {
      opacity: scrollY.value > 100 ? 1 : 0,
    };
  });

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
        <Text style={styles.errorMessage}>Sorry no products available</Text>
        <TouchableOpacity onPress={handleRefetch} style={styles.retryButton}>
          <Ionicons size={24} name={"reload-circle"} color={COLORS.white} />
          <Text style={styles.retryButtonText}>Retry Again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (error) {
    console.log(error);
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorMessage}>Error loading products</Text>
        <TouchableOpacity onPress={handleRefetch} style={styles.retryButton}>
          <Text style={styles.retryButtonText}>Retry Fetch</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View>
      <Animated.View style={styles.container}>
        <Animated.FlatList
          ref={scrollRef}
          onScroll={scrollHandler}
          scrollEventThrottle={16}
          keyExtractor={(item) => item._id}
          contentContainerStyle={[{ columnGap: SIZES.medium }, styles.flatlistContainer]}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          numColumns={2}
          data={data}
          renderItem={({ item }) => <ProductsCardView item={item} />}
        />
      </Animated.View>
      <Animated.View style={[styles.toTopButton, buttonStyle]}>
        <TouchableOpacity onPress={scrollTop}>
          <Ionicons name="arrow-up-circle-outline" size={32} color={COLORS.white} />
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
};

export default ProductList;
