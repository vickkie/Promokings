import React, { useContext, useEffect, useRef, useState } from "react";
import { ScrollView, View, Text, Image, TouchableOpacity, Alert, StyleSheet, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";

import { COLORS, SIZES } from "../../constants";
import { useNavigation } from "@react-navigation/native";
import { AuthContext } from "../../components/auth/AuthContext";
import Toast from "react-native-toast-message";
import Icon from "../../constants/icons";
import * as FileSystem from "expo-file-system";
import useDelete from "../../hook/useDelete2";
import { VERSION_LONG, VERSION_SHORT } from "@env";
import WebView from "react-native-webview";
import COLOR_THIEF_SOURCE from "../../constants/colorThiefSource";
import { LinearGradient } from "expo-linear-gradient";
import logger from "../../utils/logger";

const clearCache = async () => {
  try {
    const files = await FileSystem.readDirectoryAsync(FileSystem.documentDirectory);
    await Promise.all(files.map((file) => FileSystem.deleteAsync(FileSystem.documentDirectory + file)));
    Toast.show({
      type: "success",
      text1: "Cache cleared",
      text2: "All cached data has been removed.",
    });
  } catch (_error) {
    Toast.show({
      type: "error",
      text1: "Error clearing cache",
      text2: "There was an issue clearing the cache. Please try again later.",
    });
  }
};

const ProfileScreen = ({ profileImageUrl }) => {
  const [gradientColors, setGradientColors] = useState(["rgb(43,58,68)", "rgb(177,196,199)"]);
  const [webViewKey, setWebViewKey] = useState(0);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- legacy sync-state pattern kept to preserve behavior
    setWebViewKey((prevKey) => prevKey + 1); // Force re-render when profileImageUrl changes
  }, [profileImageUrl]);

  const webviewRef = useRef(null);

  // Page script receives the image URL via postMessage - user-controlled data
  // is never interpolated into executable code (MB-SEC-005). ColorThief is
  // vendored locally; no remote script is fetched.
  const webviewHtml = `
  <html>
    <head><script>${COLOR_THIEF_SOURCE}</script></head>
    <body>
      <script>
        function extractColors(url) {
          var img = new Image();
          img.crossOrigin = "Anonymous";
          img.onload = function () {
            try {
              var colorThief = new ColorThief();
              var colors = colorThief.getPalette(img, 2);
              window.ReactNativeWebView.postMessage(JSON.stringify({ type: "colors", data: colors }));
            } catch (error) {
              window.ReactNativeWebView.postMessage(
                JSON.stringify({ type: "error", message: String(error && error.message) })
              );
            }
          };
          img.onerror = function () {
            window.ReactNativeWebView.postMessage(JSON.stringify({ type: "error", message: "Image failed to load" }));
          };
          img.src = url;
        }
        function onMessage(event) {
          try {
            var data = JSON.parse(event.data);
            if (data && data.type === "profile-image" && typeof data.url === "string") {
              extractColors(data.url);
            }
          } catch (e) {}
        }
        window.addEventListener("message", onMessage);
        document.addEventListener("message", onMessage);
      </script>
    </body>
  </html>`;

  const handleMessage = (event) => {
    try {
      const parsedMessage = JSON.parse(event.nativeEvent.data);

      if (parsedMessage.type === "colors" && Array.isArray(parsedMessage.data)) {
        const smoothGradient = parsedMessage.data.map((color) => `rgb(${color.join(",")})`);
        setGradientColors(smoothGradient);
      }
    } catch (error) {
      logger.error("WebView message parse error:", error);
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
          ref={webviewRef}
          key={webViewKey} // Forces re-render when profileImageUrl changes
          source={{ html: webviewHtml }}
          onLoadEnd={() =>
            webviewRef.current?.postMessage(JSON.stringify({ type: "profile-image", url: profileImageUrl || "" }))
          }
          onMessage={handleMessage}
          originWhitelist={["about:blank"]}
          style={{ width: 1, height: 1, opacity: 0 }}
        />
      </LinearGradient>
    </View>
  );
};

const MenuRow = ({ icon, label, onPress }) => (
  <TouchableOpacity onPress={onPress}>
    <View style={styles.menuItem(0.5)}>
      {icon}
      <Text style={styles.menuText}>{label}</Text>
    </View>
  </TouchableOpacity>
);

const StaffProfileSettings = ({
  role,
  profileRoute,
  messageRoute = "Message",
  messageIcon = <Icon name="message" size={26} color={COLORS.primary} />,
  topItems = [],
  bottomItems = [],
  allowDeleteAccount = true,
  profileLabel = "My profile",
  aboutLabel = "About",
  nameBadgeColor = COLORS.themey,
}) => {
  const navigation = useNavigation();
  const { userData, hasRole, userLogout, userLogin } = useContext(AuthContext);
  const { redelete } = useDelete(`user/`);

  const [userId, setUserId] = useState(null);

  useEffect(() => {
    if (!userLogin) {
      navigation.replace("Login");
    } else if (hasRole(role)) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- legacy sync-state pattern kept to preserve behavior
      setUserId(userData._id);
    } else {
      userLogout();
      navigation.replace("Login");
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps -- intentional minimal dep set to avoid refetch loops
  }, [userLogin, navigation, hasRole]);

  const handleClearCache = () => {
    Alert.alert(
      "Clear cache",
      "Delete all our saved data on your device?",
      [
        { text: "Cancel", onPress: () => {}, style: "cancel" },
        { text: "Continue", onPress: async () => await clearCache() },
      ],
      { cancelable: true }
    );
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      "Delete account",
      "Are you sure you want to delete your account?",
      [
        { text: "Cancel", onPress: () => {}, style: "cancel" },
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
        { text: "Cancel", onPress: () => {}, style: "cancel" },
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

  const [loading, setLoading] = useState(true);

  const renderProfilePicture = () => {
    if (!userLogin) {
      return <Image source={require("../../assets/images/userDefault.webp")} style={styles.profile} />;
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
            onError={() => setLoading(false)}
          />
        </View>
      );
    }

    return <Image source={require("../../assets/images/userDefault.webp")} style={styles.profile} />;
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
          <TouchableOpacity onPress={() => navigation.navigate(profileRoute)} style={styles.buttonWrap2}>
            {renderProfilePicture()}
          </TouchableOpacity>
          <View style={styles.versionWrapper}>
            <Text style={styles.versionText}> {VERSION_SHORT}</Text>
          </View>
          <Text style={styles.name}>{userData ? userData.name : "Please login to account"}</Text>

          {userData ? (
            <View style={[styles.nameBtn, { backgroundColor: nameBadgeColor }]}>
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
                <Text style={styles.regText}>Don&apos;t have an account? Register</Text>
              </TouchableOpacity>
            </View>
          )}

          {userData && (
            <View style={styles.menuWrapper}>
              <MenuRow
                icon={<Icon name="userhandup" size={24} color={COLORS.primary} />}
                label={profileLabel}
                onPress={() => navigation.navigate(profileRoute)}
              />
              {topItems.map((item) => (
                <MenuRow
                  key={item.label}
                  icon={item.icon}
                  label={item.label}
                  onPress={() => navigation.navigate(item.route)}
                />
              ))}
              <MenuRow icon={messageIcon} label="Message Center" onPress={() => navigation.navigate(messageRoute)} />
              <MenuRow
                icon={<Icon name="about" size={24} color={COLORS.primary} />}
                label={aboutLabel}
                onPress={() => navigation.navigate("About")}
              />
              {bottomItems.map((item) => (
                <MenuRow
                  key={item.label}
                  icon={item.icon}
                  label={item.label}
                  onPress={() => navigation.navigate(item.route)}
                />
              ))}
              <MenuRow
                icon={<MaterialCommunityIcons name="reload" size={24} color={COLORS.primary} />}
                label="Clear cache"
                onPress={handleClearCache}
              />
              {allowDeleteAccount && (
                <MenuRow
                  icon={<Ionicons name="person-remove-outline" size={24} color={COLORS.primary} />}
                  label="Delete Account"
                  onPress={handleDeleteAccount}
                />
              )}
              <MenuRow
                icon={<MaterialCommunityIcons name="logout" size={24} color={COLORS.primary} />}
                label="Logout"
                onPress={logout}
              />
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

export default StaffProfileSettings;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.lightWhite,
    paddingBottom: 60,
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
