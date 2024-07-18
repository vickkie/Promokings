import React from "react";
import { TouchableOpacity, Text, ActivityIndicator, StyleSheet } from "react-native";
import { COLORS, SIZES } from "../constants/index";
const ButtonMain = ({ title, onPress, isValid, loader }) => {
  return (
    <TouchableOpacity
      style={[styles.button, !isValid && styles.buttonDisabled]}
      onPress={onPress}
      disabled={!isValid || loader}
    >
      {loader ? <ActivityIndicator size="small" color="#ffffff" /> : <Text style={styles.buttonText}>{title}</Text>}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    backgroundColor: COLORS.primary,
    padding: 15,
    borderRadius: SIZES.medium,
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 10,
    marginHorizontal: 10,
    marginBottom: 30,
    height: 60,
  },
  buttonDisabled: {
    backgroundColor: COLORS.gray,
  },
  buttonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default ButtonMain;
