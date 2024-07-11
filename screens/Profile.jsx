import { StyleSheet, Text, View, Image, TouchableOpacity, ScrollView, Alert } from "react-native";
import React, { useState, useEffect } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";

import styles from "./profile.style";
import { Ionicons, AntDesign, SimpleLineIcons, MaterialCommunityIcons } from "@expo/vector-icons";
import { COLORS, SIZES } from "../constants";
import { useNavigation } from "@react-navigation/native";

import AsyncStorage from "@react-native-async-storage/async-storage";

const Profile = () => {
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
        navigation.navigate("Login");
      }
    } catch (error) {
      console.log("Error retrieving data:", error);
    }
  };

  const userLogout = async () => {
    const id = await AsyncStorage.getItem("id");
    const userId = `user${JSON.parse(id)}`;

    try {
      await AsyncStorage.multiRemove([userId, "id"]);
      navigation.replace("Bottom Navigation");
    } catch (err) {
      console.log("Error loggin out the user:", err);
    }
  };

  const logout = () => {
    Alert.alert(
      "Logout",
      "Are you sure you want to logout?",
      [
        {
          text: "Cancel",
          onPress: () => {
            console.log("Cancelled logout");
          },
          style: "cancel",
        },
        {
          text: "Continue",
          onPress: () => {
            userLogout();
            console.log("Logout continue");
          },
        },
      ],
      { cancelable: true } // allows the alert to be dismissed by tapping outside of it
    );
  };

  const clearCache = () => {
    Alert.alert(
      "Clear cache",
      "Delete all our saved data on your device?",
      [
        {
          text: "Cancel",
          onPress: () => {
            console.log("Cancelled logout");
          },
          style: "cancel",
        },
        {
          text: "Continue",
          onPress: () => {
            console.log("Logout continue");
          },
        },
      ],
      { cancelable: true } // allows the alert to be dismissed by tapping outside of it
    );
  };

  const deleteAccount = () => {
    Alert.alert(
      "Delete account",
      "Are you sure to delete you account?",
      [
        {
          text: "Cancel",
          onPress: () => {
            console.log("Cancelled delete");
          },
          style: "cancel",
        },
        {
          text: "Continue",
          onPress: () => {
            console.log("Delete account pressed");
          },
        },
      ],
      { cancelable: true } // allows the alert to be dismissed by tapping outside of it
    );
  };

  return (
    <ScrollView>
      <View style={styles.container}>
        <View style={styles.container}>
          <StatusBar backgroundColor={COLORS.gray} />
          <View style={{ width: "100%", height: SIZES.height / 3.3, overflow: "hidden" }}>
            <Image source={require("../assets/images/profilecover.webp")} style={styles.cover} />
          </View>
          <View style={styles.profileContainer}>
            <Image source={require("../assets/images/profile-picture.webp")} style={styles.profile} />
            <Text style={styles.name}>{userLogin === true ? userData.name : "Please login to account"}</Text>

            {userLogin === false ? (
              <TouchableOpacity
                onPress={() => {
                  navigation.navigate("Login");
                }}
              >
                <View style={styles.loginBtn}>
                  <Text style={styles.menuText}>LOGIN</Text>
                </View>
              </TouchableOpacity>
            ) : (
              <View style={styles.loginBtn}>
                <Text style={styles.menuText}>{userData.email}</Text>
              </View>
            )}

            {userLogin === false ? (
              <View>
                <TouchableOpacity></TouchableOpacity>
              </View>
            ) : (
              <View style={styles.menuWrapper}>
                <TouchableOpacity
                  onPress={() => {
                    navigation.navigate("Favourites");
                  }}
                >
                  <View style={styles.menuItem(0.5)}>
                    <MaterialCommunityIcons name="heart-outline" size={24} color={COLORS.primary} />
                    <Text style={styles.menuText}>Favourites</Text>
                  </View>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => {
                    navigation.navigate("Orders");
                  }}
                >
                  <View style={styles.menuItem(0.5)}>
                    <MaterialCommunityIcons name="truck-cargo-container" size={24} color={COLORS.primary} />
                    <Text style={styles.menuText}>Orders</Text>
                  </View>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => {
                    navigation.navigate("Cart");
                  }}
                >
                  <View style={styles.menuItem(0.5)}>
                    <MaterialCommunityIcons name="cart" size={24} color={COLORS.primary} />
                    <Text style={styles.menuText}>Cart</Text>
                  </View>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => {
                    clearCache();
                  }}
                >
                  <View style={styles.menuItem(0.5)}>
                    <MaterialCommunityIcons name="reload" size={24} color={COLORS.primary} />
                    <Text style={styles.menuText}>Clear cache</Text>
                  </View>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => {
                    deleteAccount();
                  }}
                >
                  <View style={styles.menuItem(0.5)}>
                    <Ionicons name="person-remove-outline" size={24} color={COLORS.primary} />
                    <Text style={styles.menuText}>Delete Account</Text>
                  </View>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => {
                    logout();
                  }}
                >
                  <View style={styles.menuItem(0.5)}>
                    <MaterialCommunityIcons name="logout" size={24} color={COLORS.primary} />
                    <Text style={styles.menuText}>Logout</Text>
                  </View>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

export default Profile;
