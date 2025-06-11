import React, { useEffect } from "react";
import { StyleSheet, View, Text, TouchableOpacity, Image, StatusBar, BackHandler } from "react-native";
import LottieView from "lottie-react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { BlurView } from "expo-blur";
import { COLORS, SIZES } from "../constants";
import { useNavigation, useRoute } from "@react-navigation/native";
import Icon from "../constants/icons";
import * as Clipboard from "expo-clipboard";

const OrderSuccess = () => {
  const currentDate = new Date().toLocaleString();
  const navigation = useNavigation();
  const route = useRoute();
  const { orderId } = route.params;

  useEffect(() => {
    const handleBackPress = () => {
      navigation.navigate("Bottom Navigation", {
        screen: "Home",
        params: { refreshList: true },
      });

      // Return true to prevent default back navigation
      return true;
    };

    BackHandler.addEventListener("hardwareBackPress", handleBackPress);

    return () => {
      BackHandler.removeEventListener("hardwareBackPress", handleBackPress);
    };
  }, []);

  const handleCopy = async () => {
    await Clipboard.setStringAsync(orderId);
    alert("Order ID copied to clipboard!");
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.gray2} />
      <View style={styles.imageContainer}>
        <Image source={require("../assets/images/happyy.webp")} style={styles.image} />
        <BlurView intensity={50} style={styles.blurView} />
      </View>

      <View style={styles.content}>
        <SafeAreaView style={styles.contentContainer}>
          <View style={styles.headerWrapper}>
            <Text style={styles.header}>Order Status</Text>
          </View>

          <View style={styles.animationWrapper}>
            <LottieView
              source={require("../assets/data/success2.json")}
              autoPlay
              loop={true}
              style={styles.animation}
            />
          </View>

          <View style={styles.detailsWrapper}>
            <Text style={styles.successText}>Order Successful</Text>
            <View style={styles.orderDetails}>
              <Text style={styles.orderDetail}>Order No:</Text>
              <View style={styles.copyContainer}>
                <TouchableOpacity style={styles.orderNumber}>
                  <Text style={{ fontFamily: "light" }}>{orderId}</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={handleCopy}>
                  <Icon name="copywhite" size={21} />
                </TouchableOpacity>
              </View>
              <Text style={styles.orderDetail}>Date: {currentDate}</Text>
            </View>
            <View style={styles.actionsWrapper}>
              <TouchableOpacity style={styles.button}>
                <Text
                  style={styles.buttonText}
                  onPress={() => {
                    navigation.navigate("Orders");
                  }}
                >
                  Track Order
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.button}
                onPress={() =>
                  navigation.navigate("Bottom Navigation", {
                    screen: "Home",
                    params: { refreshList: true },
                  })
                }
              >
                <Text style={styles.buttonText}>Back to Home</Text>
              </TouchableOpacity>
            </View>
          </View>
        </SafeAreaView>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  imageContainer: {
    flex: 1,
    position: "relative",
  },
  image: {
    ...StyleSheet.absoluteFillObject,
    width: "100%",
    height: "100%",
  },
  blurView: {
    ...StyleSheet.absoluteFillObject,
  },
  content: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 0,
  },
  contentContainer: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    borderRadius: SIZES.medium,
    padding: 20,
    width: "90%",
  },
  headerWrapper: {
    alignItems: "center",
    marginBottom: 20,
  },
  header: {
    fontSize: SIZES.xLarge,
    fontWeight: "bold",
    color: COLORS.white,
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
  detailsWrapper: {
    alignItems: "center",
  },
  successText: {
    fontSize: SIZES.large,
    fontWeight: "600",
    color: COLORS.white,
    marginBottom: 10,
  },
  orderDetails: {
    marginBottom: 20,
    alignItems: "center",
  },
  orderDetail: {
    fontSize: SIZES.medium,
    color: COLORS.white,
    marginBottom: 5,
  },
  actionsWrapper: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
  button: {
    backgroundColor: COLORS.themey,
    padding: 12,
    borderRadius: SIZES.small,
    alignItems: "center",
    flex: 1,
    marginHorizontal: 5,
  },
  buttonText: {
    color: COLORS.white,
    fontSize: SIZES.medium,
    fontWeight: "bold",
  },
  copyContainer: { flexDirection: "row", gap: 10, justifyContent: "center", alignItems: "center" },
  orderNumber: {
    backgroundColor: COLORS.gray2,
    paddingVertical: 5,
    paddingHorizontal: 5,
    height: SIZES.xLarge + 4,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 24,
    marginVertical: 10,
  },
});

export default OrderSuccess;
