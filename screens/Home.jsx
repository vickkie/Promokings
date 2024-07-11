import { Text, TouchableOpacity, View, ScrollView } from "react-native";
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
        // navigation.navigate("Login");
        console.log("user data not available");
      }
    } catch (error) {
      console.log("Error retrieving data:", error);
    }
  };

  return (
    <SafeAreaView>
      <View style={styles.appBarWrapper}>
        <View style={styles.appBar}>
          <Ionicons name="location-outline" size={24}></Ionicons>
          <Text style={styles.location}> {userData ? userData.username : " Nairobi"} </Text>

          <View style={{ alignItems: "flex-end" }}>
            <View style={styles.cartCount}>
              <View style={styles.cartWrapper}>
                <Text style={styles.cartNumber}>33</Text>
              </View>

              <TouchableOpacity onPress={() => {}}>
                <Fontisto name="shopping-bag-1" style={styles.cartBag} size={24}></Fontisto>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
      <ScrollView>
        <Welcome />
        <Carousel />
        <Headings />
        <ProductsRow />
      </ScrollView>
    </SafeAreaView>
  );
};

export default Home;
