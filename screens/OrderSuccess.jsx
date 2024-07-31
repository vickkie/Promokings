import React from "react";
import { StyleSheet, View, Text, TouchableOpacity, ImageBackground } from "react-native";
import LottieView from "lottie-react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Icon from "../constants/icons"; // Ensure Icon is correctly imported and used
import { COLORS, SIZES } from "../constants"; // Define your colors and sizes in constants

const OrderSuccess = () => {
  const currentDate = new Date().toLocaleString(); // Current date and time

  return (
    <ImageBackground
      source={require("../assets/images/mz.jpg")} // Your background image path
      style={styles.background}
    >
      <View style={styles.overlay} />
      <SafeAreaView style={styles.container}>
        <View style={styles.headerWrapper}>
          <Text style={styles.header}>Order Status</Text>
        </View>
        <View style={styles.animationWrapper}>
          <LottieView
            source={require("../assets/data/success2.json")}
            autoPlay
            loop={false} // Play once
            style={styles.animation}
          />
        </View>
        <View style={styles.detailsWrapper}>
          <Text style={styles.successText}>Order Successful</Text>
          <View style={styles.orderDetails}>
            <Text style={styles.orderDetail}>Order No: 14225226</Text>
            <Text style={styles.orderDetail}>Date: {currentDate}</Text>
          </View>
          <View style={styles.actionsWrapper}>
            <TouchableOpacity style={styles.button}>
              <Text style={styles.buttonText}>Track Order</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.button}>
              <Text style={styles.buttonText}>Back to Home</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
    width: "100%",
    height: "100%",
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.9)", // Dark overlay
  },
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16,
  },
  headerWrapper: {
    alignItems: "center",
    marginBottom: 20,
  },
  header: {
    fontSize: SIZES.xLarge,
    fontWeight: "bold",
    color: COLORS.textPrimary,
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
    backgroundColor: COLORS.themew,
    padding: 20,
    borderRadius: SIZES.medium,
    width: "100%",
    opacity: 0.9, // Slight transparency for the details container
  },
  successText: {
    fontSize: SIZES.large,
    fontWeight: "600",
    color: COLORS.textPrimary,
    marginBottom: 10,
  },
  orderDetails: {
    marginBottom: 20,
    alignItems: "center",
  },
  orderDetail: {
    fontSize: SIZES.medium,
    color: COLORS.textSecondary,
    marginBottom: 5,
  },
  actionsWrapper: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
  button: {
    backgroundColor: COLORS.primary,
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
});

export default OrderSuccess;
