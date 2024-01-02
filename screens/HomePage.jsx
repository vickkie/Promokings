import { View, Text } from "react-native";
import React, { useEffect, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import styles from "./Home";
import { Ionicons, Fontisto } from "@expo/vector-icons";
import { TouchableOpacity } from "react-native";
import { ScrollView } from "react-native";
import Welcome from "../components";
import Carousel from "../components/home/Carousel";
import Headings from "../components/home/Headings";
import ProductRow from "../components/products/ProductRow";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";

const HomePage = () => {

  const navigation = useNavigation(); // Move useNavigation hook inside the component

  useEffect(() => {
    checkExistingUser();
  }, []);

  const [userData, setUserData] = useState(null);
  const [userLogin, setUserLogin] = useState(false);

  const checkExistingUser = async () => {
    const id = await AsyncStorage.getItem("id");
    const useId = `user${JSON.parse(id)}`;

    try {
      const currentUser = await AsyncStorage.getItem(useId);
      if (currentUser !== null) {
        const parsedData = JSON.parse(currentUser);
        setUserData(parsedData);
        setUserLogin(true);
      } else {
        navigation.navigate("Login"); // Now you can access navigation
      }
    } catch (error) {
      console.log("Error retrieving", error);
    }
  };


  return (
    <SafeAreaView>
      <View style={styles.appBarWrapper}>
        <View style={styles.appBar}>
          <Ionicons name="location-outline" size={24} />
          <Text style={styles.location}> {userData ? userData.location : "Nigeria"} </Text>

          <View style={{ alignItems: "flex-end" }}>
            <View style={styles.cartCount}>
              <Text style={styles.cartNumber}>8</Text>
            </View>

            <TouchableOpacity>
              <Fontisto name="shopping-bag" size={24} />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <ScrollView>
        <Welcome />
        <Carousel />
        <Headings />
        <ProductRow />
      </ScrollView>
    </SafeAreaView>
  );
};

export default HomePage;
