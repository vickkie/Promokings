import React, { useRef, useEffect, useState } from "react";
import { View, Text, TouchableOpacity, TextInput } from "react-native";
import { Feather, Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";
import styles from "./search.styles";
import { COLORS, SIZES } from "../constants";

const Search = () => {
  const inputRef = useRef(null); // Create a ref for the TextInput
  const navigation = useNavigation();
  const [searchText, setSearchText] = useState("");

  useEffect(() => {
    // Check if the component has just been mounted the focus from home search
    if (!inputRef.current) return;
    inputRef.current.focus(); // Focus the TextInput
  }, [navigation]);

  return (
    <SafeAreaView>
      <View name="" style={styles.searchContainer}>
        <TouchableOpacity>
          <Feather name="search" style={styles.searchIcon}></Feather>
        </TouchableOpacity>
        <View style={styles.searchWrapper}>
          <TextInput
            ref={inputRef}
            value={searchText} // Control the value with state
            onChangeText={(text) => setSearchText(text)}
            style={styles.searchInput}
            placeholder="Search..."
          ></TextInput>
        </View>
        <View style={styles.searchBtn}>
          <TouchableOpacity>
            <Ionicons name="search-circle" size={SIZES.xxLarge - 10}></Ionicons>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default Search;
