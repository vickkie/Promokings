import React, { useContext, useEffect, useState } from "react";
import { ScrollView, View, Text, Image, TouchableOpacity, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import styles from "./profile.style";
import { COLORS, SIZES } from "../constants";
import { useNavigation } from "@react-navigation/native";
import { AuthContext } from "../components/auth/AuthContext";
import Toast from "react-native-toast-message";
import Icon from "../constants/icons";
import * as FileSystem from "expo-file-system";
import useDelete from "../hook/useDelete2";

// Function to clear cache
const clearCache = async () => {
  try {
    const files = await FileSystem.readDirectoryAsync(FileSystem.documentDirectory);
    await Promise.all(files.map((file) => FileSystem.deleteAsync(FileSystem.documentDirectory + file)));
    console.log("Cache cleared");
    Toast.show({
      type: "success",
      text1: "Cache cleared",
      text2: "All cached data has been removed.",
    });
  } catch (error) {
    console.error("Failed to clear cache", error);
    Toast.show({
      type: "error",
      text1: "Error clearing cache",
      text2: "There was an issue clearing the cache. Please try again later.",
    });
  }
};

const Profile = () => {
  const navigation = useNavigation();
  const { userData, userLogout, userLogin } = useContext(AuthContext);
  const { deleteStatus, isDeleting, errorStatus, redelete } = useDelete(`user/`);

  const [userId, setUserId] = useState(null);

  useEffect(() => {
    if (!userLogin) {
      setUserId(1);
    } else if (userData && userData._id) {
      setUserId(userData._id);
    }
  }, [userLogin, userData]);

  const handleClearCache = () => {
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
          onPress: async () => {
            await clearCache(); // Clear the cache
          },
        },
      ],
      { cancelable: true }
    );
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      "Delete account",
      "Are you sure you want to delete your account?",
      [
        {
          text: "Cancel",
          onPress: () => console.log("Cancelled delete"),
          style: "cancel",
        },
        {
          text: "Continue",
          onPress: async () => {
            await redelete(userId, async () => {
              await clearCache();
              userLogout();
              navigation.navigate("Home");
              Toast.show({
                type: "success",
                text1: "Account deleted",
                text2: "Your account has been successfully deleted.",
              });
            });
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
            showToast("success", "You have been logged out", "Thank you for being with us");
          },
        },
      ],
      { cancelable: true }
    );
  };

  const showToast = (type, text1, text2) => {
    Toast.show({
      type: type,
      text1: text1,
      text2: text2 ? text2 : "",
      visibilityTime: 3000,
    });
  };

  const renderProfilePicture = () => {
    if (!userLogin) {
      // User not logged in
      return <Image source={require("../assets/images/userDefault.webp")} style={styles.profile} />;
    }

    if (userData && userData.profilePicture) {
      return <Image source={{ uri: `${userData.profilePicture}` }} style={styles.profile} />;
    }

    return <Image source={require("../assets/images/userDefault.webp")} style={styles.profile} />;
  };

  return (
    <ScrollView>
      <SafeAreaView style={styles.container}>
        <StatusBar backgroundColor={COLORS.themey} />
        <View style={{ width: "100%", height: SIZES.height / 4, overflow: "hidden" }}>
          <Image source={require("../assets/images/abstract1.webp")} style={styles.cover} />
        </View>
        <View style={styles.profileContainer}>
          <TouchableOpacity onPress={() => navigation.navigate("UserDetails")} style={styles.buttonWrap2}>
            {renderProfilePicture()}
          </TouchableOpacity>
          <Text style={styles.name}>{userData ? userData.name : "Please login to account"}</Text>

          {userData ? (
            <View style={styles.nameBtn}>
              <Text style={styles.menuText}>{userData.email}</Text>
            </View>
          ) : (
            <View style={styles.loginhere}>
              <TouchableOpacity onPress={() => navigation.navigate("Login")}>
                <View style={styles.loginBtn}>
                  <Text style={styles.menuText}>LOGIN</Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity onPress={() => navigation.navigate("Register")}>
                <Text style={styles.regText}>Don't have an account? Register</Text>
              </TouchableOpacity>
            </View>
          )}

          {userData && (
            <View style={styles.menuWrapper}>
              <TouchableOpacity onPress={() => navigation.navigate("UserDetails")}>
                <View style={styles.menuItem(0.5)}>
                  <Icon name="userhandup" size={24} color={COLORS.primary} />
                  <Text style={styles.menuText}>My profile</Text>
                </View>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => navigation.navigate("Favourites")}>
                <View style={styles.menuItem(0.5)}>
                  <MaterialCommunityIcons name="heart-outline" size={24} color={COLORS.primary} />
                  <Text style={styles.menuText}>Favourites</Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity onPress={() => navigation.navigate("Cart")}>
                <View style={styles.menuItem(0.5)}>
                  <Icon name="trolley" size={24} color={COLORS.primary} />
                  <Text style={styles.menuText}>Cart</Text>
                </View>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => navigation.navigate("Orders")}>
                <View style={styles.menuItem(0.5)}>
                  <Icon name="delivery" size={26} color={COLORS.primary} />
                  <Text style={styles.menuText}>Orders</Text>
                </View>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => navigation.navigate("Message")}>
                <View style={styles.menuItem(0.5)}>
                  <Icon name="message" size={26} color={COLORS.primary} />
                  <Text style={styles.menuText}>Message Center</Text>
                </View>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleClearCache}>
                <View style={styles.menuItem(0.5)}>
                  <MaterialCommunityIcons name="reload" size={24} color={COLORS.primary} />
                  <Text style={styles.menuText}>Clear cache</Text>
                </View>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleDeleteAccount}>
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
