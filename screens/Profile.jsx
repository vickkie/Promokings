import React, { useContext, useEffect, useState } from "react";
import { ScrollView, View, Text, Image, TouchableOpacity, Alert, StyleSheet, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { COLORS, SIZES } from "../constants";
import { useNavigation } from "@react-navigation/native";
import { AuthContext } from "../components/auth/AuthContext";
import Toast from "react-native-toast-message";
import Icon from "../constants/icons";
import * as FileSystem from "expo-file-system";
import AsyncStorage from "@react-native-async-storage/async-storage";
import useDelete from "../hook/useDelete2";
import { VERSION_LONG, VERSION_SHORT } from "@env";
import { useCart } from "../contexts/CartContext";
import { useWish } from "../contexts/WishContext";

const Profile = () => {
  const navigation = useNavigation();
  const { userData, userLogout, userLogin } = useContext(AuthContext);
  const { deleteStatus, isDeleting, errorStatus, redelete } = useDelete(`user/`);
  const { clearCart } = useCart();
  const { clearWishlist } = useWish();

  const [userId, setUserId] = useState(null);

  useEffect(() => {
    if (!userLogin) {
      setUserId(1);
    } else if (userData && userData._id) {
      setUserId(userData._id);
    }
  }, [userLogin, userData]);

  // Function to clear cache
  const clearCache = async () => {
    try {
      //clear cart and wishCount
      clearWishlist();
      clearCart();

      // Clear AsyncStorage
      await AsyncStorage.clear();

      // Clear FileSystem cache
      const files = await FileSystem.readDirectoryAsync(FileSystem.documentDirectory);
      await Promise.all(files.map((file) => FileSystem.deleteAsync(FileSystem.documentDirectory + file)));

      // Show success message
      Toast.show({
        type: "success",
        text1: "Cache Cleared",
        text2: "All cached data and local storage have been removed.",
      });
    } catch (error) {
      // Show error message
      Toast.show({
        type: "error",
        text1: "Error Clearing Cache",
        text2: "There was an issue clearing the cache. Please try again later.",
      });
    }
  };

  const handleClearCache = () => {
    Alert.alert(
      "Clear cache",
      "Delete all our saved data on your device?",
      [
        {
          text: "Cancel",
          onPress: () => {
            // console.log("Cancelled clear cache");
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
          onPress: () => {
            // console.log("Cancelled delete")
          },
          style: "cancel",
        },
        {
          text: "Continue",
          onPress: async () => {
            await redelete(userId, async () => {
              await clearCache();
              userLogout();
              // Reset the navigation stack
              navigation.reset({
                index: 0,
                routes: [{ name: "Bottom Navigation" }],
              });
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
  const login = () => {
    navigation.navigate("Login");
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
    const [loading, setLoading] = useState(true);

    if (!userLogin) {
      // User not logged in, show default image
      return <Image source={require("../assets/images/userDefault.webp")} style={styles.profile} />;
    }

    if (userData?.profilePicture) {
      return (
        <View style={{ position: "relative" }}>
          {loading && (
            <ActivityIndicator
              size="small"
              color="#000"
              style={{ position: "absolute", alignSelf: "center", top: "50%" }}
            />
          )}
          <Image
            source={{ uri: userData.profilePicture }}
            style={styles.profile}
            onLoadStart={() => setLoading(true)}
            onLoad={() => setLoading(false)}
            onError={() => setLoading(false)} // Hide loader if error occurs
          />
        </View>
      );
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
          <View style={styles.versionWrapper}>
            <Text style={styles.versionText}> {VERSION_SHORT}</Text>
          </View>
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
                  <Text style={styles.menuText}>Wishlist</Text>
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
              <TouchableOpacity onPress={() => navigation.navigate("About")}>
                <View style={styles.menuItem(0.5)}>
                  <Icon name="about" size={24} color={COLORS.primary} />
                  <Text style={styles.menuText}>About</Text>
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
              {userLogin ? (
                <TouchableOpacity onPress={logout}>
                  <View style={styles.menuItem(0.5)}>
                    <MaterialCommunityIcons name="logout" size={24} color={COLORS.primary} />
                    <Text style={styles.menuText}>Logout</Text>
                  </View>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity onPress={login}>
                  <View style={styles.menuItem(0.5)}>
                    <MaterialCommunityIcons name="login" size={24} color={COLORS.primary} />
                    <Text style={styles.menuText}>Login</Text>
                  </View>
                </TouchableOpacity>
              )}
              <View style={styles.versionWrapper}>
                <Text style={styles.versionText}>{VERSION_LONG}</Text>
              </View>
            </View>
          )}
        </View>
      </SafeAreaView>
    </ScrollView>
  );
};

export default Profile;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.lightWhite,
    paddingBottom: 60,
  },

  cover: {
    height: 250,
    width: "100%",
    resizeMode: "cover",
  },
  profileContainer: {
    flex: 1,
    alignItems: "center",
    minHeight: SIZES.height / 1.5 + 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    backgroundColor: COLORS.lightWhite,
    marginTop: -20,
  },
  profile: {
    height: 155,
    width: 155,
    borderRadius: 1000,
    borderWidth: 2,
    borderColor: COLORS.primary,
    resizeMode: "cover",
    marginTop: -90,
    // marginBottom: 50,
  },
  name: {
    fontFamily: "bold",
    color: COLORS.primary,
    marginVertical: 3,
  },
  loginhere: {
    paddingTop: SIZES.medium,
    justifyContent: "center",
    alignItems: "center",
    gap: SIZES.xLarge,
    flexDirection: "column",
  },
  regText: {
    color: "#000",
    fontSize: SIZES.medium,
    textDecorationStyle: "solid",
    textDecorationLine: "underline",
    fontFamily: "medium",
  },
  loginBtn: {
    backgroundColor: COLORS.secondary,
    padding: 2,
    borderWidth: 0.4,
    borderColor: COLORS.primary,
    borderRadius: SIZES.xxLarge,
    width: SIZES.width / 4,
  },

  nameBtn: {
    backgroundColor: COLORS.secondary,
    padding: 2,
    borderWidth: 0.4,
    borderColor: COLORS.primary,
    borderRadius: SIZES.xxLarge,
  },
  menuText: {
    fontFamily: "regular",
    color: COLORS.gray,
    marginLeft: 20,
    marginRight: 20,
    fontWeight: "600",
    fontSize: 14,
    lineHeight: 26,
  },
  menuWrapper: {
    marginTop: SIZES.xLarge,
    width: SIZES.width - SIZES.large,
    backgroundColor: COLORS.lightWhite,
    borderRadius: 12,
  },
  menuItem: (borderBottomWidth) => ({
    borderBottomWidth: borderBottomWidth,
    flexDirection: "row",
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderColor: COLORS.gray,
  }),
  versionWrapper: {
    paddingTop: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  versionText: {
    fontFamily: "GtAlpine",
    color: COLORS.gray,
  },
});
