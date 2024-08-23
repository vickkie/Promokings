// Home.js

import React, { useState, useContext, useEffect, useCallback, useRef } from "react";
import { Text, TouchableOpacity, View, ScrollView, Image, StatusBar, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { Welcome } from "../components/home";
import Carousel from "../components/home/Carousel";
import Headings from "../components/home/Headings";
import ProductsRow from "../components/products/ProductsRow";
import LatestProducts from "../components/products/LatestProducts";
import Icon from "../constants/icons";
import { AuthContext } from "../components/auth/AuthContext";
import useFetch from "../hook/useFetch";
import { useCart } from "../contexts/CartContext";
import HomeMenu from "../components/bottomsheets/HomeMenu";

import { COLORS, SIZES, SHADOWS } from "../constants";

import { jwtDecode } from "jwt-decode";

import atob from "core-js-pure/stable/atob";
import btoa from "core-js-pure/stable/btoa";

global.atob = atob;
global.btoa = btoa;

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

  useEffect(() => {
    if (!userLogin) {
      setUserId(1);
    } else if (userData && userData.TOKEN) {
      console.log(userData);
      setUserId(userData._id);
      // Decode the token to get role information
      const decodedToken = jwtDecode(userData.TOKEN);
      const userRole = decodedToken.role;

      console.log(userRole);
      // Redirect based on user role
      switch (userRole) {
        case "inventory":
          setUserId(userData._id);
          navigation.replace("Inventory Navigation");
          break;
        default:
          break;
      }
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
      return <Image source={{ uri: `${userData.profilePicture}` }} style={styles.profilePicture} />;
    }

    return <Image source={require("../assets/images/userDefault.webp")} style={styles.profilePicture} />;
  };

  const BottomSheetRef = useRef(null);

  const openMenu = () => {
    if (BottomSheetRef.current) {
      BottomSheetRef.current.present();
    }
  };

  return (
    <SafeAreaView style={styles.topSafeview}>
      <HomeMenu ref={BottomSheetRef} />

      <StatusBar barStyle="dark-content" backgroundColor={COLORS.themey} />

      <View style={styles.topWelcomeWrapper}>
        <View style={styles.appBarWrapper}>
          <View style={styles.appBar}>
            <TouchableOpacity
              style={styles.buttonWrap}
              onPress={() => {
                openMenu();
              }}
            >
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

const styles = StyleSheet.create({
  carouselContainer: {
    flex: 1,
    alignItems: "center",
    backgroundColor: COLORS.themey,
    height: 100,
  },
  textStyles: {
    fontFamily: "bold",
    fontSize: 19,
  },
  appBarWrapper: {
    // marginHorizontal: 4,
    // marginTop: SIZES.small - 2,
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
  location: {
    fontFamily: "semibold",
    fontSize: SIZES.medium,
    color: COLORS.gray,
  },
  cartContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  cartNumber: {
    position: "absolute",
    fontFamily: "regular",
    fontWeight: "800",
    fontSize: 13,
    color: COLORS.lightWhite,
    borderRadius: 700,
    backgroundColor: COLORS.themey,
  },
  cartWrapper: {
    zIndex: 11,
    backgroundColor: COLORS.themey,
    justifyContent: "center",
    padding: 10,
    borderRadius: 100,
    position: "absolute",
    right: 40,
    top: 4,
    zIndex: 77,
    alignItems: "center",
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
    justifyContent: "center",
    alignItems: "center",
  },
  topWelcomeWrapper: {
    minHeight: 180,
    backgroundColor: COLORS.themew,
    marginHorizontal: 4,
    borderRadius: SIZES.medium,
    // ...SHADOWS.small,
    // marginBottom: 2,
    // shadowColor: COLORS.lightWhite,
  },
  greeting: {
    flex: 1,
    justifyContent: "center",
    // alignItems: "center",
    paddingHorizontal: 20,
  },
  greetingMessage: {
    fontFamily: "bold",
    fontSize: SIZES.xxLarge,
  },
  hello: {
    fontFamily: "regular",
    color: "#BABDB6",
  },
  username: {
    fontFamily: "semibold",
    color: COLORS.themeb,
  },
  sloganWrapper: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 20,
    // alignItems: "center",
  },
  slogan: {
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
  profilePicture: {
    height: 52,
    width: 52,
    borderRadius: 100,
  },
  closeButton: {
    position: "absolute",
    top: 40,
    right: 20,
    backgroundColor: "white",
    padding: 10,
    borderRadius: 20,
  },
  closeButtonText: {
    fontSize: 16,
    color: "black",
  },
});
