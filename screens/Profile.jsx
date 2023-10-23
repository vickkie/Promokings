import { View, Text, Image } from "react-native";
import { useState, useEffect } from "react";
import styles from "./Profile.style";
import { StatusBar } from "expo-status-bar";
import { COLORS } from "../constants";
const Profile = () => {

  const [userData, setUserData] = useState(null);
  const [userLogin, setUserLogin] = useState(false);

  return (
    <View style={styles.container}>
      <View style={styles.container}>
        <StatusBar backgroundColor="transparent" />
        <View style={{ width: "100%" }}>
          <Image
            source={require("../assets/images/space.jpg")}
            style={styles.cover}
          />
        </View>

        <View style={styles.profileContainer}>
          <Image
            source={require("../assets/images/profile.jpeg")}
            style={styles.profile}
          />

          <Text style={styles.name}> {userData ? userData.name : "Please Login into your account"} </Text>
        </View>
      </View>
    </View>
  );
};

export default Profile;