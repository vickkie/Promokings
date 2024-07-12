import { Text, TouchableOpacity, View, ScrollView, Image } from "react-native";
import React, { useEffect, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons, Fontisto } from "@expo/vector-icons";
import styles from "./home.style";
import { Welcome } from "../components/home";
import Carousel from "../components/home/Carousel";
import Headings from "../components/home/Headings";
import ProductsRow from "../components/products/ProductsRow";
import { useNavigation } from "@react-navigation/native";

import AsyncStorage from "@react-native-async-storage/async-storage";
import Icon from "../constants/icons";
import { COLORS, SIZES } from "../constants";

const Home = () => {
  const [userData, setUserData] = useState(null);
  const [userLogin, setUserLogin] = useState(false);

  const navigation = useNavigation();

  useEffect(() => {
    checkExistingUser();
  }, []);

  const checkExistingUser = async () => {
    const id = await AsyncStorage.getItem("id");
    const userId = `user${JSON.parse(id)}`;

    try {
      const currentUser = await AsyncStorage.getItem(userId);
      if (currentUser !== null) {
        const parsedData = JSON.parse(currentUser);
        setUserData(parsedData);
        setUserLogin(true);
      } else {
        console.log("user data not available");
      }
    } catch (error) {
      console.log("Error retrieving data:", error);
    }
  };

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
                    <Text style={styles.cartNumber}>0</Text>
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
