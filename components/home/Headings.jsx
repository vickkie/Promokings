import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { COLORS, SIZES } from "../../constants";
import React from "react";
import { Ionicons } from "@expo/vector-icons";
import styles from "./headings.style";

const Headings = () => {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Top products</Text>
        <TouchableOpacity>
          <Ionicons name="ios-grid" size={24} color={COLORS.primary}></Ionicons>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default Headings;
