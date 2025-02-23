import React, { useState, useContext, useEffect, useCallback, useRef } from "react";
import {
  Text,
  TouchableOpacity,
  View,
  ScrollView,
  Image,
  StatusBar,
  StyleSheet,
  RefreshControl,
  Animated,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation, useFocusEffect, useRoute } from "@react-navigation/native";
import Icon from "../../../constants/icons";
import { AuthContext } from "../../../components/auth/AuthContext";
import HomeMenu from "../../../components/bottomsheets/HomeMenu";
import { COLORS, SIZES } from "../../../constants";
import useFetch from "../../../hook/useFetch";

import { FlatList } from "react-native";
import { WebView } from "react-native-webview";

const zeroData = {
  totalProducts: 0,
  outOfStock: 0,
  lowStock: 0,
  availableStock: 0,
};

const fallbackImage = require("../../../assets/images/userDefault.webp");

const profileImageUrl = "https://res.cloudinary.com/drsuclnkw/image/upload/v1739574545/profilePicture_lynjfy.jpg";

const ProfileScreen = () => {
  const [gradientColors, setGradientColors] = useState(["#000000", "#222222"]);

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
        const colors = colorThief.getPalette(img, 2); // Extract 2 colors

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
      } else if (
        parsedMessage.type === "colors" &&
        Array.isArray(parsedMessage.data) &&
        parsedMessage.data.length > 1
      ) {
        setGradientColors([`rgb(${parsedMessage.data[0].join(",")})`, `rgb(${parsedMessage.data[1].join(",")})`]);
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
    <View style={[{ flex: 1, backgroundColor: gradientColors[0] }]}>
      <WebView
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
      <Image source={{ uri: profileImageUrl }} style={{ width: 100, height: 100, borderRadius: 50 }} />
    </View>
  );
};

const DriverCard = ({ driver, isPressed, onPress, onPressOut }) => {
  const renderProfilePicture = () => {
    if (driver && driver.profilePicture) {
      return <Image source={{ uri: `${driver?.profilePicture}` }} style={styles.profilePicture} />;
    }

    return <Image source={require("../../../assets/images/userDefault.webp")} style={styles.profilePicture} />;
  };
  const opacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const animateDot = () => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(opacity, {
            toValue: 0.3,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.timing(opacity, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          }),
        ])
      ).start();
    };

    if (driver?.status === "available" || driver?.status === "transit") {
      animateDot();
    }
  }, [driver?.status]);
  return (
    <TouchableOpacity
      style={[styles.driverCard, isPressed ? styles.pressed : styles.nopress]}
      onPress={onPress}
      onPressOut={onPressOut}
      delayPressOut={2}
    >
      <View style={styles.infoContainerx}>
        <View style={styles.flexme}>{renderProfilePicture()}</View>
        <View style={[styles.flexme, styles.spaceVertical]}>
          <Text style={styles.driverName}>{driver.fullName}</Text>
        </View>
        <View style={[styles.flexme]}>
          <Text style={styles.status}>{driver.numberPlate}</Text>
        </View>

        <View style={[styles.flexme, styles.spaceVertical]}>
          <TouchableOpacity style={styles.roundedview}>
            {/* Animated Dot */}
            <View style={styles.statusContainer}>
              <Animated.View
                style={[
                  styles.statusDot,
                  {
                    backgroundColor: driver?.status === "available" ? "green" : "red",
                    opacity: opacity,
                  },
                ]}
              />
              <Text>
                {driver?.status ? driver.status.charAt(0).toUpperCase() + driver.status.slice(1).toLowerCase() : ""}
              </Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity style={styles.roundview}>
            <Image source={require("../../../assets/new-arrow.png")} style={styles.arrow} />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const DriverList = () => {
  const { userLogin, hasRole, userData, userLogout } = useContext(AuthContext);
  const navigation = useNavigation();
  const route = useRoute();

  const { data, isLoading, error, errorMessage, statusCode, refetch } = useFetch("staff/drivers");

  const [userId, setUserId] = useState(null);
  const [refreshList, setRefreshList] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [drivers, setDrivers] = useState([]);
  const [pressedId, setPressedId] = useState(null);

  const handlePress = (driverId) => {
    setPressedId((prevId) => (prevId === driverId ? null : driverId));
  };

  const handlePressOut = () => {
    setPressedId(null);
  };

  useEffect(() => {
    if (!userLogin) {
      navigation.replace("Login");
    } else if (hasRole("sales")) {
      setUserId(userData._id);
    } else {
      userLogout();
      navigation.replace("Login");
    }
  }, [userLogin, navigation, hasRole]);

  useFocusEffect(
    useCallback(() => {
      if (route.params?.refreshList) {
        setRefreshList(true);
        refetch();
      }
    }, [route.params])
  );

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setRefreshList(true);
    setTimeout(() => {
      setRefreshing(false);
      setRefreshList(false); // Reset refreshList after refreshing
    }, 2000);
  }, []);

  useEffect(() => {
    refetch();
  }, [refreshing]);

  const BottomSheetRef = useRef(null);

  useEffect(() => {
    if (!isLoading && data) {
      setDrivers(data);
    } else if (!isLoading && !data) {
      setDrivers(zeroData);
    }
  }, [isLoading, data]);

  return (
    <SafeAreaView style={styles.topSafeview}>
      <HomeMenu ref={BottomSheetRef} />
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.themey} />
      <View style={styles.topWelcomeWrapper}>
        <View style={styles.appBarWrapper}>
          <View style={styles.appBar}>
            <TouchableOpacity style={styles.buttonWrap} onPress={() => navigation.goBack()}>
              <Icon name="backbutton" size={24} />
            </TouchableOpacity>

            <View style={styles.greeting}>
              <Text style={styles.greetingMessage}>
                <Text style={styles.username}>Driver Management</Text>
              </Text>
            </View>
            <View style={{ flexDirection: "row" }}>
              <TouchableOpacity
                onPress={() => navigation.navigate("SalesShipments")}
                style={[styles.backBtn, styles.buttonWrap]}
              >
                <Icon name="truckfilled" size={26} />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <View style={styles.sloganWrapper}>
          <Text style={styles.slogan}>{`All courriers available `}</Text>
        </View>
      </View>
      <ScrollView refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
        <View style={{ flex: 1, borderRadius: 45, marginTop: 6 }}>
          <ProfileScreen />
          <FlatList
            scrollEnabled={false}
            data={drivers}
            numColumns={2}
            columnWrapperStyle={{ justifyContent: "space-between" }}
            keyExtractor={(item, index) => (item._id ? item._id.toString() : index.toString())}
            renderItem={({ item }) => (
              <DriverCard
                driver={item}
                isPressed={pressedId === item._id}
                onPress={() => handlePress(item._id)}
                onPressOut={() => {
                  handlePressOut;
                }}
              />
            )}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default DriverList;

const styles = StyleSheet.create({
  carouselContainer: {
    flex: 1,
    alignItems: "center",
    backgroundColor: COLORS.themey,
    height: 100,
  },
  textStyles: {
    fontFamily: "bold",
    fontSize: 19,
  },
  appBarWrapper: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.medium,
    marginTop: 10,
  },
  appBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginHorizontal: 10,
    width: SIZES.width - 20,
  },
  location: {
    fontFamily: "semibold",
    fontSize: SIZES.medium,
    color: COLORS.gray,
  },
  cartContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  cartNumber: {
    position: "absolute",
    fontFamily: "regular",
    fontWeight: "800",
    fontSize: 13,
    color: COLORS.lightWhite,
    borderRadius: 700,
    backgroundColor: COLORS.themey,
  },
  cartWrapper: {
    zIndex: 11,
    backgroundColor: COLORS.themey,
    justifyContent: "center",
    padding: 10,
    borderRadius: 100,
    position: "absolute",
    right: 40,
    top: 4,
    zIndex: 77,
    alignItems: "center",
  },
  buttonWrap: {
    backgroundColor: COLORS.hyperlight,
    padding: 15,
    borderRadius: 100,
    justifyContent: "center",
    alignItems: "center",
  },
  buttonWrap2: {
    backgroundColor: COLORS.hyperlight,
    borderRadius: 100,
    width: 50,
    justifyContent: "center",
    alignItems: "center",
    marginEnd: 4,
  },
  topWelcomeWrapper: {
    minHeight: 90,
    backgroundColor: COLORS.themew,
    marginHorizontal: 4,
    borderRadius: SIZES.medium,
    // ...SHADOWS.small,
    // marginBottom: 2,
    // shadowColor: COLORS.lightWhite,
  },
  greeting: {
    flex: 1,
    justifyContent: "center",
    // alignItems: "center",
    paddingHorizontal: 20,
  },
  greetingMessage: {
    fontFamily: "bold",
    fontSize: SIZES.large,
  },
  hello: {
    fontFamily: "regular",
    color: "#BABDB6",
  },
  username: {
    fontFamily: "semibold",
    color: COLORS.themeb,
  },
  sloganWrapper: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 20,
    // alignItems: "center",
  },
  slogan: {
    fontFamily: "regular",
    color: "#BABDB6",
    fontSize: SIZES.medium,
  },
  lowerWelcome: {
    backgroundColor: COLORS.themew,
    marginHorizontal: 4,
    borderTopLeftRadius: SIZES.medium,
    borderTopRightRadius: SIZES.medium,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  lowerWelcomeWrapper: {
    backgroundColor: COLORS.themeg,
    borderRadius: SIZES.medium,
  },
  topSafeview: {
    flex: 1,
    backgroundColor: "#F2F5EF",
    borderRadius: SIZES.medium,
    marginTop: SIZES.xxSmall,
  },
  profilePicture: {
    height: 52,
    width: 52,
    borderRadius: 100,
  },

  flexEnd: {
    position: "absolute",
    right: 10,
  },
  buttonView: {
    display: "flex",
    alignItems: "center",
    // backgroundColor: "red",
    alignItems: "center",
    height: "100%",
  },

  driverImage: {
    width: 50,
    height: 50,
    borderRadius: 50,
  },
  infoContainer: {
    // flex: 1,
    marginLeft: 15,
  },
  driverName: {
    fontSize: SIZES.medium,
    fontWeight: "semibold",
    color: COLORS.black,
  },
  status: {
    fontSize: SIZES.small,
    color: COLORS.gray,
  },
  actionButton: {
    backgroundColor: COLORS.primary,
    padding: 10,
    borderRadius: 50,
  },
  driverCard: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    margin: 5,
    minHeight: 140,
    backgroundColor: COLORS.themew,
    borderRadius: 10,

    alignItems: "center",
    flexDirection: "row",
    alignItems: "center",
    padding: 4,
    borderRadius: SIZES.medium,
    marginVertical: 1,
  },
  flexme: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-evenly",
    alignItems: "center",
  },

  infoContainerx: {
    flex: 1,
  },
  roundview: {
    height: 45,
    width: 45,
    borderRadius: 100,
    backgroundColor: "#EEEFE7",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  roundedview: {
    height: 45,
    width: "68%",
    borderRadius: 100,
    backgroundColor: "white",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  spaceVertical: {
    marginVertical: 5,
  },
  statusContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  pressed: {
    backgroundColor: COLORS.themey,
  },
  nopress: {
    backgroundColor: COLORS.themew,
  },

  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: "#fff",
  },
});
