import { View, Text, Image } from "react-native";
import { TouchableOpacity, TextInput } from "react-native";
import { SIZES, COLORS } from "../constants";
import { SafeAreaView } from "react-native-safe-area-context";
import styles from "./search.style";
import { Feather, Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import axios from "axios";
import { FlatList } from "react-native";
import SearchTile from "../components/products/SearchTile";
const Search = () => {
  
  const [searchKey, setSearchKey] = useState("");
  const [searchResult, setSearchResult] = useState([]);

  const handleSearch = async() => {
    try {
      const response = await axios.get(
        // `http://10.0.2.2:9000/api/products/search/${searchKey}`
        `https://furniture-backend-eta.vercel.app/api/products/search/${searchKey}`
      );
        setSearchResult(response.data)
    } catch (error) {
      console.log("failed to fetch products", error);
    }
  };

  return (
    <SafeAreaView >
      <View style={styles.searchContainer}>
        <TouchableOpacity>
          <Ionicons name="camera-outline" size={24} style={styles.searchIcon} />
        </TouchableOpacity>

        <View style={styles.searchWrapper}>
          <TextInput
            value={searchKey}
            style={styles.searchInput}
            placeholder="Search suitable options"
            onPressIn={() => {}}
            onChangeText={setSearchKey}
          />
        </View>

        <View>
          <TouchableOpacity
            style={styles.searchBtn}
            onPress={() => handleSearch()}
          >
            <Feather name="search" size={SIZES.xLarge} color={COLORS.white} />
          </TouchableOpacity>
        </View>
      </View>

      {
        searchResult.length === 0 ? (
          <View style={{flex: 1}}>
            <Image 
            source={require('../assets/images/Pose23.png')}
            style={styles.searchImage} />
          </View>
        ): (
          <FlatList keyExtractor={(item) => item._id}
          data={searchResult}
          renderItem={({item}) => (<SearchTile item = {item} />) }
          style={{marginHorizontal: 15}}
          />
        )
      }
    </SafeAreaView>
  );
};

export default Search;