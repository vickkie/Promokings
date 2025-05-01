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
import { VERSION_LONG, VERSION_SHORT, BACKEND_PORT } from "@env";
import { useCart } from "../contexts/CartContext";
import { useWish } from "../contexts/WishContext";
import WebView from "react-native-webview";
import { LinearGradient } from "expo-linear-gradient";
import axios from "axios";
import LottieView from "lottie-react-native";

const ProfileScreen = ({ profileImageUrl }) => {
  const [gradientColors, setGradientColors] = useState(["rgb(43,58,68)", "rgb(177,196,199)"]);

  const [webViewKey, setWebViewKey] = useState(0);

  useEffect(() => {
    setWebViewKey((prevKey) => prevKey + 1); // Force re-render when profileImageUrl changes
  }, [profileImageUrl]);

  const extractColors = `
  (function() {
    console.log("✅ WebView script started");
    window.ReactNativeWebView.postMessage(JSON.stringify({ type: "status", message: "WebView script started" }));

    const img = new Image();
    img.crossOrigin = "Anonymous";
    img.src = "${profileImageUrl}";

    img.onload = function() {
      console.log("✅ Image loaded in WebView");
      window.ReactNativeWebView.postMessage(JSON.stringify({ type: "status", message: "Image loaded in WebView" }));

      try {
        if (!window.ColorThief) {
          throw new Error("ColorThief.js not loaded");
        }

        const colorThief = new ColorThief();
        const colors = colorThief.getPalette(img, 2); // Extract 6 colors for a smooth gradient
    

        window.ReactNativeWebView.postMessage(JSON.stringify({ type: "colors", data: colors }));
      } catch (error) {
        console.error("❌ Color extraction failed:", error);
        window.ReactNativeWebView.postMessage(JSON.stringify({ type: "error", message: error.message }));
      }
    };

    img.onerror = function() {
      console.error("❌ Image failed to load");
      window.ReactNativeWebView.postMessage(JSON.stringify({ type: "error", message: "Image failed to load" }));
    };
  })();
  `;

  const handleMessage = (event) => {
    try {
      const parsedMessage = JSON.parse(event.nativeEvent.data);

      if (parsedMessage.type === "status") {
        console.log("ℹ️ Status:", parsedMessage.message);
      } else if (parsedMessage.type === "colors" && Array.isArray(parsedMessage.data)) {
        // Convert the extracted colors to rgb format
        const smoothGradient = parsedMessage.data.map((color) => `rgb(${color.join(",")})`);
        setGradientColors(smoothGradient);
        console.log(smoothGradient);
      } else if (parsedMessage.type === "error") {
        console.error("❌ Error:", parsedMessage.message);
      } else {
        console.warn("⚠️ Unknown message type received:", parsedMessage);
      }
    } catch (error) {
      console.error("🚨 JSON Parse Error:", error);
    }
  };

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: gradientColors[0],
        backgroundImage: `linear-gradient(180deg, ${gradientColors.join(" , ")})`,
      }}
    >
      <LinearGradient
        colors={gradientColors}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={{ position: "absolute", width: "100%", height: "100%" }}
      >
        <WebView
          key={webViewKey} // Forces re-render when profileImageUrl changes
          source={{
            html: `
          <html>
            <head>
              <script src="https://cdnjs.cloudflare.com/ajax/libs/color-thief/2.3.0/color-thief.umd.js"></script>
            </head>
            <body></body>
          </html>
          `,
          }}
          injectedJavaScript={extractColors}
          onMessage={handleMessage}
          style={{ width: 1, height: 1, opacity: 0 }}
        />
      </LinearGradient>
    </View>
  );
};

const Profile = () => {
  const navigation = useNavigation();
  const { userData, userLogout, userLogin } = useContext(AuthContext);
  const { deleteStatus, isDeleting, errorStatus, redelete } = useDelete(`user/`);
  const [deleting, setDEleting] = useState(false);
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

  const deleteAccount = async () => {
    // return;
    setDEleting(false);
    try {
      const endpoint = `${BACKEND_PORT}/api/user/delete-account/${userData?._id}`;

      console.log(endpoint);

      const response = await axios.delete(endpoint);

      console.log(response);
      // Check response status and token first
      if (response.status === 200 && response.data.success) {
        console.log("here1");

        console.log("here2");
        await clearCache();
        console.log("here3");

        userLogout();

        // Reset the navigation stack
        navigation.reset({
          index: 0,
          routes: [{ name: "Bottom Navigation" }],
        });
        showToast("success", response?.data?.message, response?.data?.message2);
        setDEleting(false);
        return;
      } else {
        Alert.alert("Error Deleting", "Unexpected response. Please try again later.");
        setDEleting(false);
      }
    } catch (error) {
      console.log(error);
      showToast("error", "Sorry an error occured");
    } finally {
      setDEleting(false);
    }
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
          onPress: () => {
            deleteAccount();
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
      visibilityTime: 5000,
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
          <ProfileScreen
            profileImageUrl={
              userData?.profilePicture
                ? userData.profilePicture
                : "https://res.cloudinary.com/drsuclnkw/image/upload/t_here1/productImage_f7sj7z"
            }
          />
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
          {userData && !deleting && (
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

              <TouchableOpacity onPress={() => navigation.navigate("AboutUs")}>
                <View style={styles.menuItem(0.5)}>
                  <Icon name="about" size={24} color={COLORS.primary} />
                  <Text style={styles.menuText}>About Us</Text>
                </View>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleClearCache}>
                <View style={styles.menuItem(0.5)}>
                  <MaterialCommunityIcons name="reload" size={24} color={COLORS.primary} />
                  <Text style={styles.menuText}>Clear cache</Text>
                </View>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => {
                  handleDeleteAccount();
                }}
              >
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
          {deleting && (
            <View style={styles.containerx}>
              <View style={styles.containLottie}>
                <View style={styles.animationWrapper}>
                  <LottieView source={require("../assets/data/loading.json")} autoPlay loop style={styles.animation} />
                </View>
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
    backgroundColor: COLORS.themey,
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
  containLottie: {
    justifyContent: "center",
    alignItems: "center",
    width: SIZES.width - 20,
    flex: 1,
  },
  animationWrapper: {
    width: 200,
    height: 200,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  animation: {
    width: "100%",
    height: "100%",
  },
  containerx: {
    minHeight: SIZES.height / 2 - 20,
    backgroundColor: COLORS.themeg,
    marginTop: 30,
    width: SIZES.width - 20,
    marginHorizontal: 10,
    borderRadius: SIZES.medium,
  },
});
