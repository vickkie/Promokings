import React, { useRef, useEffect, useState, useContext } from "react";
import { View, FlatList, Text, TouchableOpacity, TextInput, Image, StyleSheet } from "react-native";
import { Feather, Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";
import { COLORS, SIZES } from "../../../constants";

import axios from "axios";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import SearchTile from "../../../components/products/SearchTile";
import { AuthContext } from "../../../components/auth/AuthContext";

import { BACKEND_PORT } from "@env";
import LatestShipments from "./LatestShipments";

const ShipmentSearch = () => {
  const { userLogin, hasRole, userData, userLogout } = useContext(AuthContext);
  const inputRef = useRef(null); // Create a ref for the TextInput
  const navigation = useNavigation();
  const [searchText, setSearchText] = useState("");
  const [searchResults, setSearchResults] = useState("");
  const [noData, setNodata] = useState(false);
  const [refreshList, setRefreshList] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    // Check if the component has just been mounted then focus from home search
    if (!inputRef.current) return;
    inputRef.current.focus(); // Focus the TextInput
  }, [navigation]);

  const handleSearch = async () => {
    setRefreshList(true); // Trigger re-fetch

    setTimeout(() => {
      setRefreshList(false);
    }, 1000);
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
                handleSearch();
              }}
              onSubmitEditing={handleSearch}
              style={styles.searchInput}
              placeholder="Search here..."
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

        {!searchText ? (
          <>
            <View style={{ flex: 1 }}>
              <Image source={require("../../../assets/images/no-found.png")} style={styles.noFoundImage} />
            </View>
          </>
        ) : (
          <View style={{ backgroundColor: "white", flex: 1, minHeight: SIZES.height - 100, padding: 15 }}>
            <LatestShipments
              refreshList={refreshList}
              setRefreshing={setRefreshing}
              limit={1000}
              offset={0}
              status={""}
              search={searchText}
            />
          </View>
        )}
      </SafeAreaView>
    </GestureHandlerRootView>
  );
};

export default ShipmentSearch;

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
