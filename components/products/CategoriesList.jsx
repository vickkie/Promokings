import { FlatList, Text, View, ActivityIndicator, TouchableOpacity, RefreshControl } from "react-native";
import React, { useCallback, useEffect, useState } from "react";
import { COLORS, SIZES } from "../../constants";
import useFetch from "../../hook/useFetch";
import styles from "./categorieslist.style";
import CategoryCardView from "./CategoryCardView";
import { Ionicons } from "@expo/vector-icons";
import LottieView from "lottie-react-native";
import NetInfo from "@react-native-community/netinfo";

const CategoriesList = () => {
  const { data, isLoading, error, refetch } = useFetch("category");
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    try {
      refetch();
    } catch (error) {
    } finally {
      setRefreshing(false); // Ensure refreshing state is reset
    }
  }, [refetch]);

  const checkNetInfo = async () => {
    try {
      const { isConnected } = await NetInfo.fetch();

      if (!isConnected) {
        console.log("No internet connection.");
        return;
      }
    } catch (error) {
      console.log(error, "net");
    }
  };

  useEffect(() => {
    checkNetInfo();
  }, []);

  let isOffline = !NetInfo.useNetInfo().isConnected;

  if (isLoading) {
    return (
      <View style={styles.containerx}>
        <View style={styles.containLottie}>
          <View style={styles.animationWrapper}>
            <LottieView source={require("../../assets/data/loading.json")} autoPlay loop style={styles.animation} />
          </View>
        </View>
      </View>
    );
  }

  if (data.length === 0) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorMessage}>Sorry, no categories found</Text>
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
        <Text style={styles.errorMessage}>Looks like you are offline</Text>
        <TouchableOpacity onPress={refetch} style={styles.retryButton}>
          <Text style={styles.retryButtonText}>Retry Fetch</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        keyExtractor={(item) => item._id.toString()}
        contentContainerStyle={[{ columnGap: SIZES.medium }, styles.container]}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        numColumns={1}
        data={data}
        renderItem={({ item }) => <CategoryCardView item={item} />}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      />
    </View>
  );
};

export default CategoriesList;
