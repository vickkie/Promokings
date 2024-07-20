import { View, TouchableOpacity, TextInput } from "react-native";
import React from "react";
import styles from "./welcome.style";

import { useNavigation } from "@react-navigation/native";
import Icon from "../../constants/icons";

const Welcome = () => {
  const navigation = useNavigation();
  return (
    <View>
      <View name="" style={styles.searchContainer}>
        <TouchableOpacity>
          <Icon name="search" size={24} style={styles.searchIcon} />
        </TouchableOpacity>
        <View style={styles.searchWrapper}>
          <TextInput
            value=""
            onPressIn={() => navigation.navigate("Search")}
            style={styles.searchInput}
            placeholder="Search for cloths, watches, etc "
          ></TextInput>
        </View>
        <View style={styles.searchBtn}>
          <TouchableOpacity>
            <Icon name="tuning" size={24} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

export default Welcome;
