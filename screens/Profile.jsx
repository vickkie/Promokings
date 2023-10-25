import { View, Text, Image } from "react-native";
import { useState, useEffect } from "react";
import styles from "./Profile.style";
import { StatusBar } from "expo-status-bar";
import { COLORS } from "../constants";
import { TouchableOpacity } from "react-native";
const Profile = ({ navigation }) => {
  const [userData, setUserData] = useState(null);
  const [userLogin, setUserLogin] = useState(true);

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

          <Text style={styles.name}>
            {" "}
            {userLogin === true
              ? "Maazscript"
              : "Please Login into your account"}{" "}
          </Text>

          {userLogin === false ? (
            <TouchableOpacity onPress={() => navigation.navigate("Login")}>
              <View style={styles.loginBtn}>
                <Text style={styles.menuText}>L O G I N</Text>
              </View>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity>
              <View style={styles.loginBtn}>
                <Text style={styles.menuText}>goalmaaz@gmail.com</Text>
              </View>
            </TouchableOpacity>
          )}

          {userLogin === false ? <View></View> : 
          <View style={styles.menuWrapper}>
            <TouchableOpacity onPress={() => {}}>

              <View style={styles.menuItem(0.2)}></View>

            </TouchableOpacity>
            </View>}
        </View>
      </View>
    </View>
  );
};

export default Profile;
