import { View, Text, TouchableOpacity, TextInput } from "react-native";
import { Feather, Ionicons } from "@expo/vector-icons";
import React from "react";
import styles from "./welcome.style";
import { COLORS, SIZES } from "../../constants";

import { useNavigation } from "@react-navigation/native";

const Welcome = () => {
  const navigation = useNavigation();
  return (
    <View>
      <View style={styles.container}>
        <Text style={styles.welcomeTxt(COLORS.black, SIZES.xSmall)}>For all of your</Text>
        <Text style={styles.welcomeTxt(COLORS.primary, SIZES.xSmall)}> promotional items</Text>
      </View>
      <View name="" style={styles.searchContainer}>
        <TouchableOpacity>
          <Feather name="search" style={styles.searchIcon}></Feather>
        </TouchableOpacity>
        <View style={styles.searchWrapper}>
          <TextInput
            value=""
            onPressIn={() => navigation.navigate("Search")}
            style={styles.searchInput}
            placeholder="what are you looking for"
          ></TextInput>
        </View>
        <View style={styles.searchBtn}>
          <TouchableOpacity>
            <Ionicons name="camera" color={COLORS.lightWhite} size={SIZES.medium + 10}></Ionicons>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

export default Welcome;
