import { StyleSheet, Text, View } from "react-native";
import React from "react";
import styles from "./newRivals.style";
import { SafeAreaView, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { useNavigation } from "@react-navigation/native";
import { COLORS } from "../constants";

const NewRivals = () => {
  const navigation = useNavigation();

  return (
    <SafeAreaView>
      <View style={styles.container}>
        <View style={styles.wrapper}>
          <View style={styles.upperRow}>
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Ionicons name="chevron-back-circle" size={24} color={COLORS.lightWhite}></Ionicons>
            </TouchableOpacity>

            <Text style={styles.heading}>Products</Text>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default NewRivals;
