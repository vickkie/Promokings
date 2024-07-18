import React, { useContext } from "react";
import { StyleSheet, Text, View, Image, TouchableOpacity, ScrollView, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import styles from "./profile.style";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { COLORS, SIZES } from "../constants";
import { useNavigation } from "@react-navigation/native";
import { AuthContext } from "../components/auth/AuthContext";
import Toast from "react-native-toast-message";

const Profile = () => {
  const navigation = useNavigation();
  const { userData, userLogout } = useContext(AuthContext);

  const clearCache = () => {
    Alert.alert(
      "Clear cache",
      "Delete all our saved data on your device?",
      [
        {
          text: "Cancel",
          onPress: () => {
            console.log("Cancelled clear cache");
          },
          style: "cancel",
        },
        {
          text: "Continue",
          onPress: () => {
            console.log("Cache cleared");
          },
        },
      ],
      { cancelable: true }
    );
  };

  const deleteAccount = () => {
    Alert.alert(
      "Delete account",
      "Are you sure to delete your account?",
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
      { cancelable: true }
    );
  };

  const logout = () => {
    Alert.alert(
      "Logout",
      "Are you sure you want to logout?",
      [
        {
          text: "Cancel",
          onPress: () => {},
          style: "cancel",
        },
        {
          text: "Continue",
          onPress: () => {
            userLogout();
            showToast("success", "You have been  logged out", "Thankyou for being with us ");
          },
        },
      ],
      { cancelable: true } // allows the alert to be dismissed by tapping outside of it
    );
  };

  const showToast = (type, text1, text2) => {
    Toast.show({
      type: type,
      text1: text1,
      text2: text2 ? text2 : "",
    });
  };

  return (
    <ScrollView>
      <SafeAreaView style={styles.container}>
        <StatusBar backgroundColor={COLORS.gray} />
        <View style={{ width: "100%", height: SIZES.height / 3.3, overflow: "hidden" }}>
          <Image source={require("../assets/images/profilecover.webp")} style={styles.cover} />
        </View>
        <View style={styles.profileContainer}>
          <Image source={require("../assets/images/profile-picture.webp")} style={styles.profile} />
          <Text style={styles.name}>{userData ? userData.name : "Please login to account"}</Text>

          {userData ? (
            <View style={styles.loginBtn}>
              <Text style={styles.menuText}>{userData.email}</Text>
            </View>
          ) : (
            <TouchableOpacity onPress={() => navigation.navigate("Login")}>
              <View style={styles.loginBtn}>
                <Text style={styles.menuText}>LOGIN</Text>
              </View>
            </TouchableOpacity>
          )}

          {userData && (
            <View style={styles.menuWrapper}>
              <TouchableOpacity onPress={() => navigation.navigate("Favourites")}>
                <View style={styles.menuItem(0.5)}>
                  <MaterialCommunityIcons name="heart-outline" size={24} color={COLORS.primary} />
                  <Text style={styles.menuText}>Favourites</Text>
                </View>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => navigation.navigate("Orders")}>
                <View style={styles.menuItem(0.5)}>
                  <MaterialCommunityIcons name="truck-cargo-container" size={24} color={COLORS.primary} />
                  <Text style={styles.menuText}>Orders</Text>
                </View>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => navigation.navigate("Cart")}>
                <View style={styles.menuItem(0.5)}>
                  <MaterialCommunityIcons name="cart" size={24} color={COLORS.primary} />
                  <Text style={styles.menuText}>Cart</Text>
                </View>
              </TouchableOpacity>
              <TouchableOpacity onPress={clearCache}>
                <View style={styles.menuItem(0.5)}>
                  <MaterialCommunityIcons name="reload" size={24} color={COLORS.primary} />
                  <Text style={styles.menuText}>Clear cache</Text>
                </View>
              </TouchableOpacity>
              <TouchableOpacity onPress={deleteAccount}>
                <View style={styles.menuItem(0.5)}>
                  <Ionicons name="person-remove-outline" size={24} color={COLORS.primary} />
                  <Text style={styles.menuText}>Delete Account</Text>
                </View>
              </TouchableOpacity>
              <TouchableOpacity onPress={logout}>
                <View style={styles.menuItem(0.5)}>
                  <MaterialCommunityIcons name="logout" size={24} color={COLORS.primary} />
                  <Text style={styles.menuText}>Logout</Text>
                </View>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </SafeAreaView>
    </ScrollView>
  );
};

export default Profile;
