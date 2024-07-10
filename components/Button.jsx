import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import React from "react";
import { COLORS, SIZES } from "../constants";

const CustomButton = ({ title, onPress }) => {
  return (
    <TouchableOpacity onPress={onPress} style={styles.btnStyle}>
      <Text style={styles.btnText}>{title}</Text>
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
