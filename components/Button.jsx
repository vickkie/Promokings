import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import React from "react";
import { COLORS } from "../constants";

const Button = ({ onPress, title, isValid }) => {
  return (
    <TouchableOpacity onPress={onPress} style={styles.btnStyle(isValid  === false ? COLORS.gray : COLORS.primary)}>
      <Text style={styles.btnText}>{title}</Text>
    </TouchableOpacity>
  );
};

export default Button;

const styles = StyleSheet.create({
  btnText: {
    fontFamily: "bold",
    color: COLORS.white,
    fontSize: 18,
  },

  btnStyle: (backgroundColor) => (
    {
      height: 60,
      width: "100%",
      marginVertical: 20,
      backgroundColor:  backgroundColor,
      justifyContent: "center",
      alignItems: "center",
      borderRadius: 12,
    }
  )
});
