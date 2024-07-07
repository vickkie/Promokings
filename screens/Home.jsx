import { Text, TouchableOpacity, View, ScrollView } from "react-native";
import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons, Fontisto } from "@expo/vector-icons";
import styles from "./home.style";
import { Welcome } from "../components/home";
import Carousel from "../components/home/Carousel";
import Headings from "../components/home/Headings";
import ProductsRow from "../components/products/ProductsRow";

const Home = () => {
  return (
    <SafeAreaView>
      <View style={styles.appBarWrapper}>
        <View style={styles.appBar}>
          <Ionicons name="location-outline" size={24}></Ionicons>
          <Text style={styles.location}> Nairobi </Text>

          <View style={{ alignItems: "flex-end" }}>
            <View style={styles.cartCount}>
              <View style={styles.cartWrapper}>
                <Text style={styles.cartNumber}>33</Text>
              </View>

              <TouchableOpacity>
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
