import React, { useContext, useState } from "react";
import styles from "./cart.style";
import { SafeAreaView } from "react-native-safe-area-context";
import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { COLORS } from "../constants/index";
import { Ionicons } from "@expo/vector-icons";
import CartList from "../components/cart/CartList";
import { useNavigation } from "@react-navigation/native";

import BackBtn from "../components/BackBtn";
import Icon from "../constants/icons";
import { AuthContext } from "../components/auth/AuthContext";

const Cart = () => {
  const navigation = useNavigation();

  const { userLogin, userData } = useContext(AuthContext);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.wrapper}>
        <View style={styles.upperRow}>
          <View style={styles.upperButtons}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={[styles.backBtn, styles.buttonWrap]}>
              <Icon name="backbutton" size={26} />
            </TouchableOpacity>
            <Text style={styles.topheading}>cart</Text>
            <TouchableOpacity style={styles.buttonWrap}>
              <Icon name="cart" size={26} />
              <View style={styles.numbers}>
                <Text style={styles.number}>0</Text>
              </View>
            </TouchableOpacity>
          </View>

          <View style={styles.lowerheader}>
            <Text style={styles.heading}>My cart</Text>
            <Text style={styles.statement}>0 items in my cart</Text>
            <View style={styles.location}>
              <TouchableOpacity style={styles.locationName}>
                <Icon name="location" size={24} />
                {userLogin ? <Text>{userData.location}</Text> : <Text> Nairobi</Text>}
              </TouchableOpacity>
              <TouchableOpacity style={styles.rightLocation} onPress={() => navigation.navigate("Profile")}>
                <Text>change</Text>
                <View style={styles.toggleLocation}>
                  <Icon name="tuning" size={24} />
                </View>
              </TouchableOpacity>
            </View>
          </View>
        </View>
        <ScrollView>
          <CartList />
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

export default Cart;
