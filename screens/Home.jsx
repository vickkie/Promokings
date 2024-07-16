import { Text, TouchableOpacity, View, ScrollView, Image } from "react-native";
import React, { useContext, useEffect, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons, Fontisto } from "@expo/vector-icons";
import styles from "./home.style";
import { Welcome } from "../components/home";
import Carousel from "../components/home/Carousel";
import Headings from "../components/home/Headings";
import ProductsRow from "../components/products/ProductsRow";
import { useNavigation } from "@react-navigation/native";

import Icon from "../constants/icons";
import { AuthContext } from "../components/auth/AuthContext";
import { COLORS, SIZES } from "../constants";
import useFetch from "../hook/useFetch";
import { useCart } from "../contexts/CartContext";

const Home = () => {
  const { userData, userLogin, productCount } = useContext(AuthContext);
  const navigation = useNavigation();
  // const { itemCount, handleItemCountChange } = useCart();

  const [itemCount, setItemCount] = useState(0);
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    if (!userLogin) {
      setUserId(1);
    } else if (userData && userData._id) {
      setUserId(userData._id);
    }
  }, [userLogin, userData]);

  const { data, isLoading } = useFetch(`carts/find/${userId}`);

  useEffect(() => {
    if (!isLoading && data.length !== 0) {
      const products = data[0]?.products || [];

      // Calculate item count
      setItemCount(products.length - 1);

      console.log(itemCount);
    }
  }, [isLoading, data]);

  return (
    <SafeAreaView style={styles.topSafeview}>
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

              <TouchableOpacity
                onPress={() => {
                  navigation.navigate("Profile");
                }}
                style={[styles.buttonWrap2, {}]}
              >
                {!userLogin ? (
                  <Icon name="user" size={24} color="#fff" />
                ) : (
                  <Image
                    source={require("../assets/images/profile.webp")}
                    style={{ height: 52, width: 52, borderRadius: 100 }}
                  />
                )}
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
              <Headings />
              <ProductsRow />
            </View>
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

export default Home;
