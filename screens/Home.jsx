import { Text, TouchableOpacity, View, ScrollView, Image, StatusBar } from "react-native";
import React, { useContext, useEffect, useState, useCallback } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import styles from "./home.style";
import { Welcome } from "../components/home";
import Carousel from "../components/home/Carousel";
import Headings from "../components/home/Headings";
import ProductsRow from "../components/products/ProductsRow";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { BACKEND_PORT } from "@env";

import Icon from "../constants/icons";
import { AuthContext } from "../components/auth/AuthContext";
import useFetch from "../hook/useFetch";
import { useCart } from "../contexts/CartContext";
import { COLORS } from "../constants";
import LatestProducts from "../components/products/LatestProducts";

const Home = () => {
  const { userData, userLogin, productCount } = useContext(AuthContext);
  const navigation = useNavigation();
  const { itemCount: itemCountG, handleItemCountChange } = useCart();

  const [itemCount, setItemCount] = useState(0);
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    if (!userLogin) {
      setUserId(1);
    } else if (userData && userData._id) {
      setUserId(userData._id);
    }
  }, [userLogin, userData]);

  const { data, isLoading, refetch } = useFetch(`carts/find/${userId}`);

  useFocusEffect(
    useCallback(() => {
      refetch();
    }, [userId])
  );

  useEffect(() => {
    if (!isLoading && data.length !== 0) {
      const products = data[0]?.products || [];
      setItemCount(products.length);
    }
  }, [isLoading, data]);

  useEffect(() => {
    handleItemCountChange(itemCount);
  }, [itemCount]);

  const renderProfilePicture = () => {
    if (!userLogin) {
      // User not logged in
      return <Icon name="user" size={24} color="#000" />;
    }
    if (userData && userData.profilePicture) {
      // console.log(userData.profilePicture);
      return <Image source={{ uri: `${userData.profilePicture}` }} style={styles.profilePicture} />;
    }

    return <Image source={require("../assets/images/userDefault.webp")} style={styles.profilePicture} />;
  };

  return (
    <SafeAreaView style={styles.topSafeview}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.themey} />
      <View style={styles.topWelcomeWrapper}>
        <View style={styles.appBarWrapper}>
          <View style={styles.appBar}>
            <TouchableOpacity style={styles.buttonWrap}>
              <Icon name="menu" size={24} />
            </TouchableOpacity>

            <View style={{ flexDirection: "row" }}>
              <View style={{ alignItems: "flex-end", marginRight: 5 }}>
                <View style={styles.cartContainer}>
                  <View style={styles.cartWrapper}>
                    <Text style={styles.cartNumber}>{itemCount}</Text>
                  </View>

                  <TouchableOpacity
                    onPress={() => {
                      navigation.navigate("Cart");
                    }}
                    style={styles.buttonWrap}
                  >
                    <Icon name="cart" size={24} />
                  </TouchableOpacity>
                </View>
              </View>

              <TouchableOpacity onPress={() => navigation.navigate("UserDetails")} style={styles.buttonWrap2}>
                {renderProfilePicture()}
              </TouchableOpacity>
            </View>
          </View>
        </View>
        <View style={styles.greeting}>
          <Text style={styles.greetingMessage}>
            <Text style={styles.hello}>Hello! </Text>
            <Text style={styles.username}>{userData ? userData.username : "There"}</Text>
          </Text>
        </View>
        <View style={styles.sloganWrapper}>
          <Text style={styles.slogan}>PromoKings, your one stop shop</Text>
        </View>
      </View>

      <View style={{ flex: 1, borderRadius: 45 }}>
        <ScrollView>
          <View style={styles.lowerWelcomeWrapper}>
            <Welcome />

            <View style={styles.lowerWelcome}>
              <Carousel />
              <Headings heading={"Top products"} />
              <ProductsRow />
              <Headings heading={"Latest Products"} />
              <LatestProducts />
            </View>
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

export default Home;
