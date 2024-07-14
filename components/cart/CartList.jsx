import { FlatList, Text, View, ActivityIndicator, TouchableOpacity } from "react-native";
import React, { useContext, useState, useEffect } from "react";
import { COLORS, SIZES } from "../../constants";
import styles from "./cartlist.style";
import { Ionicons } from "@expo/vector-icons";
import CartCardVIew from "./CartCardVIew";

import useFetch from "../../hook/useFetch";
import { AuthContext } from "../auth/AuthContext";

const CartList = () => {
  const { userData, userLogin, productCount } = useContext(AuthContext);

  const [userId, setUserId] = useState(null);

  useEffect(() => {
    if (!userLogin) {
      setUserId(1);
    } else if (userData && userData._id) {
      setUserId(userData._id);
    }
  }, [userLogin, userData]);

  const { data, isLoading, error, refetch } = useFetch(`carts/find/${userId}`);

  const handleRefetch = () => {
    refetch();
  };

  if (isLoading) {
    return (
      <View style={styles.errorcontainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  if (data.length === 0) {
    return (
      <View style={styles.errorcontainer}>
        <Text style={styles.errorMessage}>Cart is empty</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorcontainer}>
        <Text style={styles.errorMessage}>Error loading cart</Text>
        <TouchableOpacity onPress={handleRefetch} style={styles.retryButton}>
          <Text style={styles.retryButtonText}>Retry Fetch</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Extracting products from the response data
  const products = data[0]?.products || [];

  return (
    <View style={styles.container}>
      {/* {console.log(products)} */}
      <FlatList
        keyExtractor={(item) => item._id.toString()}
        contentContainerStyle={[{ columnGap: SIZES.medium }, styles.wrapper]}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        numColumns={1}
        data={products}
        renderItem={({ item }) => <CartCardVIew item={item} handleRefetch={handleRefetch} />}
      />
    </View>
  );
};

export default CartList;
