import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import React from "react";
import { COLORS, SIZES } from "../constants";

const CustomButton = ({ title, onPress, isValid, loader }) => {
  return (
    <TouchableOpacity onPress={onPress} style={styles.btnStyle}>
      {loader === false ? <Text style={styles.btnText}>{title}</Text> : <ActivityIndicator />}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  btnText: {
    color: COLORS.white,
    fontSize: 18,
  },
  btnStyle: {
    backgroundColor: COLORS.primary,
    height: 50,
    width: "100%",
    marginVertical: 20,
    color: COLORS.primary,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: SIZES.large,
  },
});

export default CustomButton;
