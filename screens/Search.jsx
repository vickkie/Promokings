import { View, Text } from "react-native";
import React from "react";
import { SafeAreaView, TouchableOpacity, TextInput } from "react-native";
import { SIZES, COLORS } from "../constants";
import styles from "./search.style";
import { Feather, Ionicons } from "@expo/vector-icons";
const Search = () => {
  return (
    <SafeAreaView style={{ marginTop: 40 }}>
      <View style={styles.searchContainer}>
        <TouchableOpacity>
          <Ionicons name="camera-outline" size={24} style={styles.searchIcon} />
        </TouchableOpacity>

        <View style={styles.searchWrapper}>
          <TextInput
            value=""
            style={styles.searchInput}
            placeholder="Search suitable options"
            onPressIn={() => {} }
          />
        </View>

        <View>
          <TouchableOpacity style={styles.searchBtn}>
            <Feather name="search" size={SIZES.xLarge} color={COLORS.white} />
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default Search;
