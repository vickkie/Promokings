import { View, Text, Image, ScrollView, Alert } from "react-native";
import { useState, useEffect } from "react";
import styles from "./Profile.style";
import { StatusBar } from "expo-status-bar";
import { COLORS } from "../constants";
import { TouchableOpacity } from "react-native";
import {
  AntDesign,
  MaterialCommunityIcons,
  SimpleLineIcons,
} from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";

const Profile = ({ navigation }) => {
  
  const [userData, setUserData] = useState(null);
  const [userLogin, setUserLogin] = useState(false);

  useEffect(() => {
    checkExistingUser();
  }, []);

  const checkExistingUser = async () => {
    const id = await AsyncStorage.getItem("id");
    const userId = `user${JSON.parse(id)}`;

    try {
      const currentUser = await AsyncStorage.getItem(userId);
      if (currentUser !== null) {
        const parsedData = JSON.parse(currentUser);
        setUserData(parsedData);
        setUserLogin(true);
      } else {
        navigation.navigate("Login");
      }
    } catch (error) {
      console.log("Error retrieving data:", error);
    }
  };

  const  userLogout = async () => {

    const id = await AsyncStorage.getItem("id");
    const userId = `user${JSON.parse(id)}`;

    try {

    await AsyncStorage.multiRemove([userId, "id"]);
    navigation.replace("Bottom Navigation");

    } catch(err) {
      console.log('Error loggin out the user:', err);
    }

  }

  const logout = () => {
    Alert.alert("Logout", "Are you sure you want to logout", [
      {
        text: "Cancel",
        onPress: () => console.log("cancel pressed"),
      },
      {
        text: "Continue",
        onPress: () => userLogout()
      },

    ]);
  };

  const clearCache = () => {
    Alert.alert(
      "Clear Cache",
      "Are you sure you want to delete all saved data on your account?", 
      [
        {
          text: "Cancel",
          onPress: () => console.log("cancel clear cache"),
        },
        {
          text: "Continue",
          onPress: () => console.log("clear cache Pressed"),
        },

      ]
    );
  };

  const deleteAccount = () => {
    Alert.alert(
      "Delete Account",
      "Are you sure you want to delete your account?",
      [
        {
          text: "Cancel",
          onPress: () => console.log("cancel pressed"),
        },
        {
          text: "Continue",
          onPress: () => console.log("Account Deleted"),
        },
        { defaultIndex: 1 },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView>
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

            {userLogin === false ? (
              <View></View>
            ) : (
              <View style={styles.menuWrapper}>
                <TouchableOpacity
                  onPress={() => navigation.navigate("Favourite")}
                >
                  <View style={styles.menuItem(0.2)}>
                    <MaterialCommunityIcons
                      size={24}
                      color={COLORS.primary}
                      name="heart-outline"
                    />
                    <Text style={styles.menuText}>Favourites</Text>
                  </View>
                </TouchableOpacity>

                <TouchableOpacity onPress={() => navigation.navigate("Orders")}>
                  <View style={styles.menuItem(0.2)}>
                    <MaterialCommunityIcons
                      size={24}
                      color={COLORS.primary}
                      name="truck-delivery-outline"
                    />
                    <Text style={styles.menuText}>Orders</Text>
                  </View>
                </TouchableOpacity>

                <TouchableOpacity onPress={() => navigation.navigate("Cart")}>
                  <View style={styles.menuItem(0.2)}>
                    <SimpleLineIcons
                      size={24}
                      color={COLORS.primary}
                      name="bag"
                    />
                    <Text style={styles.menuText}>Cart</Text>
                  </View>
                </TouchableOpacity>

                <TouchableOpacity onPress={() => clearCache()}>
                  <View style={styles.menuItem(0.2)}>
                    <MaterialCommunityIcons
                      size={24}
                      color={COLORS.primary}
                      name="cached"
                    />
                    <Text style={styles.menuText}>Clear Cache</Text>
                  </View>
                </TouchableOpacity>

                <TouchableOpacity onPress={() => deleteAccount()}>
                  <View style={styles.menuItem(0.2)}>
                    <AntDesign
                      size={24}
                      color={COLORS.primary}
                      name="deleteuser"
                    />
                    <Text style={styles.menuText}>Delete Account</Text>
                  </View>
                </TouchableOpacity>

                <TouchableOpacity onPress={() => logout()}>
                  <View style={styles.menuItem(0.2)}>
                    <AntDesign size={24} color={COLORS.primary} name="logout" />
                    <Text style={styles.menuText}>Logout</Text>
                  </View>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

export default Profile;
