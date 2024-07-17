import React, { useContext, useState } from "react";
import styles from "./favourites.style";
import { SafeAreaView } from "react-native-safe-area-context";
import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { COLORS } from "../constants/index";
import { Ionicons } from "@expo/vector-icons";
import FavouritesList from "../components/favourites/FavouritesList";
import { useNavigation } from "@react-navigation/native";

import BackBtn from "../components/BackBtn";
import Icon from "../constants/icons";
import { AuthContext } from "../components/auth/AuthContext";
import { useCart } from "../contexts/CartContext";

const Favourites = () => {
  const navigation = useNavigation();
  const { userLogin, userData } = React.useContext(AuthContext);
  const { itemCount, handleItemCountChange } = useCart();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.wrapper}>
        <View style={styles.upperRow}>
          <View style={styles.upperButtons}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={[styles.backBtn, styles.buttonWrap]}>
              <Icon name="backbutton" size={26} />
            </TouchableOpacity>
            <View style={{ justifyContent: "space-between", flexDirection: "row" }}>
              <TouchableOpacity style={styles.buttonWrap}>
                <Icon name="heart" size={26} />
                <View style={styles.numbers}>
                  {itemCount !== 0 ? (
                    <Text style={styles.number}>{itemCount}</Text>
                  ) : (
                    <Text style={styles.number}>0</Text>
                  )}
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.buttonWrap}
                onPress={() => {
                  navigation.navigate("Cart");
                }}
              >
                <Icon name="cart" size={26} />
                <View style={styles.numbers}>
                  {itemCount !== 0 ? (
                    <Text style={styles.number}>{itemCount}</Text>
                  ) : (
                    <Text style={styles.number}>0</Text>
                  )}
                </View>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.lowerheader}>
            <Text style={styles.heading}>My WishList</Text>

            {itemCount !== 0 ? (
              <Text style={styles.statement}> Products i like ( {itemCount} )</Text>
            ) : (
              <Text style={styles.statement}>Like more products</Text>
            )}
          </View>
        </View>
        <ScrollView>
          <FavouritesList onItemCountChange={handleItemCountChange} />
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

export default Favourites;
