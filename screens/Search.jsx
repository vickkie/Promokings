import React, { useRef, useEffect, useState } from "react";
import { View, FlatList, Text, TouchableOpacity, TextInput, Image, StyleSheet } from "react-native";
import { Feather, Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";
import { COLORS, SIZES } from "../constants";

import axios from "axios";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import SearchTile from "../components/products/SearchTile";

import { BACKEND_PORT } from "@env";

const Search = () => {
  const inputRef = useRef(null); // Create a ref for the TextInput
  const navigation = useNavigation();
  const [searchText, setSearchText] = useState("");
  const [searchResults, setSearchResults] = useState("");
  const [noData, setNodata] = useState(false);

  useEffect(() => {
    // Check if the component has just been mounted then focus from home search
    if (!inputRef.current) return;
    inputRef.current.focus(); // Focus the TextInput
  }, [navigation]);

  const handleSearch = async () => {
    try {
      const response = await axios.get(`${BACKEND_PORT}/api/products/search/${searchText}`);

      // Check if response.data is empty and set setNodata(true) if it is
      if (!response.data || response.data.length === 0) {
        setNodata(true);
      } else {
        setNodata(false);
      }

      setSearchResults(response.data);
    } catch (error) {
      // console.log("Failed to get products");
    }
  };

  return (
    <GestureHandlerRootView style={styles.searchRoot}>
      <SafeAreaView>
        <View name="" style={styles.searchContainer}>
          <TouchableOpacity>
            <Feather name="search" style={styles.searchIcon}></Feather>
          </TouchableOpacity>
          <View style={styles.searchWrapper}>
            <TextInput
              ref={inputRef}
              value={searchText}
              onChangeText={(text) => {
                setSearchText(text);
                setNodata(false);
                // handleSearch();
              }}
              onSubmitEditing={handleSearch}
              style={styles.searchInput}
              placeholder="Search items..."
              onFocus={() => inputRef.current.focus()}
            ></TextInput>
          </View>
          <View style={styles.searchBtn}>
            <TouchableOpacity
              onPress={() => {
                handleSearch();
              }}
            >
              <Ionicons name="search-circle-outline" size={SIZES.xxLarge - 6} color={COLORS.white}></Ionicons>
            </TouchableOpacity>
          </View>
        </View>

        {noData === true ? (
          <View style={styles.noresult}>
            <Text style={styles.nodataText}>No results found</Text>
          </View>
        ) : (
          <></>
        )}
        {searchResults.length === 0 ? (
          <View style={{ flex: 1 }}>
            <Image source={require("../assets/images/no-found.png")} style={styles.noFoundImage} />
          </View>
        ) : (
          <FlatList
            keyExtractor={(item) => item._id}
            data={searchResults}
            renderItem={({ item }) => <SearchTile item={item} />}
            style={styles.flatlist}
          />
        )}
      </SafeAreaView>
    </GestureHandlerRootView>
  );
};

export default Search;

const styles = StyleSheet.create({
  container: {
    width: "100%",
  },
  searchContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.themeg,
    borderRadius: SIZES.medium,
    marginVertical: SIZES.medium,
    marginHorizontal: SIZES.medium,
    height: 50,
  },
  searchIcon: {
    marginHorizontal: 10,
    color: COLORS.gray,
  },
  searchWrapper: {
    flex: 1,
    backgroundColor: COLORS.themeg,
    marginRight: 10,
    borderRadius: SIZES.medium,
  },
  searchInput: {
    fontFamily: "regular",
    width: "100%",
  },
  searchBtn: {
    width: 50,
    height: "100%",
    borderRadius: SIZES.medium,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.themey,
  },

  searchNone: {
    // flex: 1,
    alignItems: "center",
    justifyContent: "center",
    height: SIZES.height - 100,
  },
  noFoundImage: {
    // flex: 1,
    width: 300,
    height: 300,
    aspectRatio: 1,
    margin: "auto",
    alignSelf: "center",
  },
  flatlist: {
    marginHorizontal: 3,
    marginBottom: 79,
  },
  searchRoot: { flex: 1, backgroundColor: "white" },
  noresult: {
    justifyContent: "center",
    alignItems: "center",
  },
  nodataText: {
    fontFamily: "semibold",
    fontSize: SIZES.medium,
  },
});
