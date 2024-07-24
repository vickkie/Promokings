import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import React from "react";
import Icon from "../constants/icons";
import { COLORS } from "../constants";

const BackBtn = ({ onPress }) => {
  return (
    <TouchableOpacity onPress={onPress} style={styles.backBtn}>
      <Icon name="backbutton" size={25} color={COLORS.primary} />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  backBtn: {
    backgroundColor: COLORS.white,
    borderRadius: 100,
    justifyContent: "center",
    alignItems: "center",
    padding: 15,
    maxWidth: 55,
    marginTop: 10,
  },
});

export default BackBtn;
