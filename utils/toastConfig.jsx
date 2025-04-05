import React from "react";
import { View, Text } from "react-native";
import Toast, { BaseToast, ErrorToast } from "react-native-toast-message";
import { COLORS } from "../constants";

const toastConfig = {
  // Example for a custom toast type
  customToast: ({ text1, props }) => (
    <View
      style={{
        height: 60,
        width: "90%",
        backgroundColor: COLORS.themew,
        padding: 10,
        borderRadius: 8,
      }}
    >
      <Text style={{ fontSize: 16, fontWeight: "bold" }}>{text1}</Text>
    </View>
  ),
  // Overriding the default success toast
  success: (props) => (
    <BaseToast
      {...props}
      style={{ borderLeftColor: COLORS.green, borderLeftWidth: 10 }}
      contentContainerStyle={{ paddingHorizontal: 15 }}
      text1Style={{ fontSize: 17, fontWeight: "bold" }}
    />
  ),
  // Overriding the default error toast
  error: (props) => (
    <ErrorToast
      {...props}
      text1Style={{ fontSize: 17 }}
      text2Style={{ fontSize: 15 }}
      style={{ borderLeftColor: COLORS.tertiary }}
    />
  ),
};

export default toastConfig;
