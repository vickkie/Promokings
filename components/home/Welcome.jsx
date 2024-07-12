import { View, Text, TouchableOpacity, TextInput } from "react-native";
import { Feather, Ionicons } from "@expo/vector-icons";
import React from "react";
import styles from "./welcome.style";
import { COLORS, SIZES } from "../../constants";

import { useNavigation } from "@react-navigation/native";
import Icon from "../../constants/icons";

const Welcome = () => {
  const navigation = useNavigation();
  return (
    <View>
      {/* <View style={styles.container}>
        <Text style={styles.welcomeTxt(COLORS.primary, SIZES.xSmall)}>For all of your promotional items</Text>
      </View> */}
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
