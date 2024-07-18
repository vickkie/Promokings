import React, { useContext, useState, useEffect } from "react";
import { View, Text, ScrollView, TouchableOpacity, TextInput, Alert, Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import styles from "./userdetails.style";
import { COLORS } from "../constants/index";
import Icon from "../constants/icons";
import { useNavigation } from "@react-navigation/native";
import { AuthContext } from "../components/auth/AuthContext";
import { Formik } from "formik";
import * as Yup from "yup";
import axios from "axios";
import { BACKEND_PORT } from "@env";
import Button from "../components/Button";

const validationSchema = Yup.object().shape({
  email: Yup.string().email("Provide a valid email address").required("Required"),
  location: Yup.string().min(3, "Provide your location").required("Required"),
  username: Yup.string().min(3, "Provide a valid username").required("Required"),
});

const UserDetails = () => {
  const navigation = useNavigation();
  const [loader, setLoader] = useState(false);

  const [userId, setUserId] = useState(null);
  const { userData, userLogin, updateUserData } = useContext(AuthContext);

  useEffect(() => {
    if (!userLogin) {
      setUserId(1);
      navigation.navigate("Login");
      return;
    } else if (userData && userData._id) {
      setUserId(userData._id);
    }
  }, [userLogin, userData]);

  const inValidForm = () => {
    Alert.alert("Invalid Form", "Please provide required fields", [
      { text: "Cancel", onPress: () => {} },
      { text: "Continue", onPress: () => {} },
    ]);
  };

  const successUpdate = () => {
    Alert.alert(
      "Update Successful",
      "Your profile has been updated!",
      [{ text: "OK", onPress: () => console.log("OK Pressed") }],
      { cancelable: false }
    );
  };

  const updateUserProfile = async (values) => {
    setLoader(true);
    try {
      const endpoint = `${BACKEND_PORT}/api/user/updateProfile`;
      const response = await axios.put(endpoint, { ...values, userId: userId });

      if (response.status === 200) {
        updateUserData(response.data); // Update user data in context with response data
        successUpdate();
      }
    } catch (err) {
      console.log(err);
    }
    setLoader(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.wrapper}>
        <View style={styles.upperRow}>
          <View style={styles.upperButtons}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={[styles.backBtn, styles.buttonWrap]}>
              <Icon name="backbutton" size={26} />
            </TouchableOpacity>
            <Text style={styles.topprofileheading}>Profile settings</Text>
          </View>
          <View style={styles.lowerheader}>
            <Text style={styles.heading}>Edit your profile</Text>
            <Text style={styles.statement}>You can edit your profile from here</Text>
          </View>
        </View>
      </View>
      <ScrollView>
        <View style={styles.detailsWrapper}>
          <View style={styles.imageWrapper}>
            {userLogin && userData.profilePicture ? (
              <Image source={{ uri: userData.profilePicture }} style={styles.profileImage} />
            ) : (
              <Image source={require("../assets/images/profile.webp")} style={styles.profileImage} />
            )}
            <TouchableOpacity style={styles.editpencil}>
              <View styles={styles.pencilWrapper}>
                <Icon name="pencil" size={25} />
              </View>
            </TouchableOpacity>
          </View>
          {userLogin ? (
            <Formik
              initialValues={{
                email: userData.email || "",
                location: userData.location || "",
                username: userData.username || "",
              }}
              validationSchema={validationSchema}
              onSubmit={(values) => updateUserProfile(values)}
            >
              {({ handleChange, handleBlur, handleSubmit, values, errors, isValid, setFieldTouched, touched }) => (
                <View style={styles.profileData}>
                  <View style={styles.wrapper}>
                    <Text style={styles.label}>UserName</Text>
                    <View style={[styles.inputWrapper, touched.username && { borderColor: COLORS.secondary }]}>
                      <TextInput
                        placeholder="Username"
                        onFocus={() => setFieldTouched("username")}
                        onBlur={() => setFieldTouched("username", "")}
                        autoCapitalize="none"
                        autoCorrect={false}
                        style={{ flex: 1 }}
                        value={values.username}
                        onChangeText={handleChange("username")}
                      />
                    </View>
                    {touched.username && errors.username && <Text style={styles.errorMessage}>{errors.username}</Text>}
                  </View>
                  <View style={styles.wrapper}>
                    <Text style={styles.label}>Email</Text>
                    <View style={[styles.inputWrapper, touched.email && { borderColor: COLORS.secondary }]}>
                      <TextInput
                        placeholder="Enter email"
                        onFocus={() => setFieldTouched("email")}
                        onBlur={() => setFieldTouched("email", "")}
                        autoCapitalize="none"
                        autoCorrect={false}
                        style={{ flex: 1 }}
                        value={values.email}
                        onChangeText={handleChange("email")}
                      />
                    </View>
                    {touched.email && errors.email && <Text style={styles.errorMessage}>{errors.email}</Text>}
                  </View>
                  <View style={styles.wrapper}>
                    <Text style={styles.label}>Location</Text>
                    <View style={[styles.inputWrapper, touched.location && { borderColor: COLORS.secondary }]}>
                      <TextInput
                        placeholder="Enter location"
                        onFocus={() => setFieldTouched("location")}
                        onBlur={() => setFieldTouched("location", "")}
                        autoCapitalize="none"
                        autoCorrect={false}
                        style={{ flex: 1 }}
                        value={values.location}
                        onChangeText={handleChange("location")}
                      />
                    </View>
                    {touched.location && errors.location && <Text style={styles.errorMessage}>{errors.location}</Text>}
                  </View>
                  <Button
                    title={"Update Profile"}
                    onPress={isValid ? handleSubmit : inValidForm}
                    isValid={isValid}
                    loader={loader}
                  />
                </View>
              )}
            </Formik>
          ) : (
            <TouchableOpacity onPress={() => navigation.navigate("Login")}>
              <View style={styles.loginBtn}>
                <Text style={styles.menuText}>LOGIN</Text>
              </View>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default UserDetails;
