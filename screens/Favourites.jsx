import React, { useContext, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from "react-native";
import Icon from "../constants/icons";
import FavouritesList from "../components/favourites/FavouritesList";
import { useNavigation } from "@react-navigation/native";
import { AuthContext } from "../components/auth/AuthContext";
import { useCart } from "../contexts/CartContext";
import { useWish } from "../contexts/WishContext";
import { COLORS, SIZES } from "../constants";

const Favourites = () => {
  const navigation = useNavigation();
  const { userLogin, userData } = useContext(AuthContext);
  const { cartCount } = useCart();
  const { wishCount, wishlist } = useWish();

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
                  {wishCount !== 0 ? (
                    <Text style={styles.number}>{wishCount}</Text>
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
                  {cartCount !== 0 ? (
                    <Text style={styles.number}>{cartCount}</Text>
                  ) : (
                    <Text style={styles.number}>0</Text>
                  )}
                </View>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.lowerheader}>
            <Text style={styles.heading}>My WishList</Text>

            {wishCount !== 0 ? (
              <Text style={styles.statement}> Products I like ( {wishCount} )</Text>
            ) : (
              <Text style={styles.statement}>Like more products</Text>
            )}
          </View>
        </View>
        <ScrollView>
          <FavouritesList wishlist={wishlist} />
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

export default Favourites;

const styles = StyleSheet.create({
  textStyles: {
    fontFamily: "bold",
    fontSize: 19,
  },
  heading: {
    fontFamily: "bold",
    textTransform: "capitalize",
    fontSize: SIZES.large,
    textAlign: "left",
    color: COLORS.themeb,
    marginStart: 20,
  },
  topheading: {
    fontSize: SIZES.medium,
    textAlign: "center",
    color: COLORS.themeb,
    fontFamily: "semibold",
  },
  container: {
    flex: 1,
    // backgroundColor: COLORS.black,
  },
  wrapper: {
    flex: 1,
    backgroundColor: COLORS.white,
    flexDirection: "column",
  },

  upperRow: {
    width: SIZES.width - 20,
    marginHorizontal: SIZES.xSmall,
    flexDirection: "column",
    justifyContent: "space-between",
    alignItems: "center",
    position: "absolute",
    backgroundColor: COLORS.themeg,
    borderRadius: SIZES.large,
    top: SIZES.xxSmall,
    zIndex: 999,
    minHeight: 120,
  },
  upperButtons: {
    width: SIZES.width - 20,
    marginHorizontal: SIZES.xSmall,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginHorizontal: SIZES.xSmall,
    top: SIZES.xxSmall,
  },
  backBtn: {
    left: 10,
  },
  buttonWrap: {
    backgroundColor: COLORS.white,
    padding: 15,
    borderRadius: 100,
    justifyContent: "center",
    alignItems: "center",
    marginEnd: 10,
  },
  lowerheader: {
    flexDirection: "column",
    justifyContent: "flex-start",
    flex: 1,
    paddingTop: 20,
    paddingBottom: 20,
  },
  statement: {
    fontFamily: "regular",
    paddingLeft: 10,
    paddingVertical: 15,
  },
  location: {
    paddingVertical: 15,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderRadius: SIZES.medium,
    backgroundColor: COLORS.themew,
    width: SIZES.width - 40,
  },
  toggleLocation: {
    right: 10,
    padding: 7,
    backgroundColor: COLORS.white,
    borderRadius: 100,
  },
  homeheading: {
    fontFamily: "regular",
    textTransform: "capitalize",
    fontSize: SIZES.medium,
    textAlign: "left",
    color: COLORS.themeb,
    marginStart: 10,
  },
  rightLocation: {
    flexDirection: "row",
    gap: 10,
    justifyContent: "space-between",
    alignItems: "center",
  },
  locationName: {
    paddingLeft: 10,
    flexDirection: "row",
    alignItems: "center",
  },
  numbers: {
    padding: 3,
    width: 20,
    height: 20,
    backgroundColor: COLORS.themey,
    color: COLORS.themew,
    borderRadius: 100,
    position: "absolute",
    top: "-10%",
    left: "-10%",
    justifyContent: "center",
    alignItems: "center",
  },
  number: {
    color: COLORS.white,
  },
});
