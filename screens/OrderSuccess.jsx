import React from "react";
import { StyleSheet, View, Text } from "react-native";
import LottieView from "lottie-react-native";
import { COLORS, SIZES } from "../constants";
import { SafeAreaView } from "react-native-safe-area-context";

const OrderSuccess = () => {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.container}>
        <View style={styles.lottieWrapper}>
          <LottieView
            source={require("../assets/data/success.json")} // Adjust the path as necessary
            autoPlay
            loop={true} // Set to true if you want the animation to repeat
            style={styles.animation}
          />
        </View>
        <Text>Order successful</Text>
      </View>
    </SafeAreaView>
  );
};

export default OrderSuccess;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    backgroundColor: COLORS.themew,
  },
  lottieWrapper: {
    minHeight: SIZES.height / 2,
    justifyContent: "center",
    alignItems: "center",
  },
  animation: {
    width: 200,
    height: 200,
  },
});
