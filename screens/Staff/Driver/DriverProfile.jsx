import React, { useContext, useState, useEffect } from "react";
import { View, Text, ScrollView, TouchableOpacity, TextInput, Alert, Image, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { COLORS, SIZES } from "../../../constants";
import Icon from "../../../constants/icons";
import { useNavigation } from "@react-navigation/native";
import { AuthContext } from "../../../components/auth/AuthContext";
import { Formik } from "formik";
import * as Yup from "yup";
import axios from "axios";
import axiosRetry from "axios-retry";

import { BACKEND_PORT } from "@env";
import * as ImagePicker from "expo-image-picker";
import ButtonMain from "../../../components/ButtonMain";
import Toast from "react-native-toast-message";
import ProfileCompletion from "../ProfileCompletion";
import { ProfileCompletionContext } from "../../../components/auth/ProfileCompletionContext";

// Global axios-retry
axiosRetry(axios, { retries: 3 });

const DriverProfile = () => {
  const { userData, userLogin, updateUserData, userLogout, hasRole } = useContext(AuthContext);

  const {
    completionPercentage,
    missingFields,
    message,
    isComplete,
    refreshProfileCompletion,
    syncProfileCompletionFromServer,
  } = useContext(ProfileCompletionContext);

  const navigation = useNavigation();
  const [loader, setLoader] = useState(false);
  const [profilePicture, setProfilePicture] = useState(userData?.profilePicture || null);
  const [localProfilePicture, setLocalProfilePicture] = useState(null); // New state variable for local image URI
  const [userId, setUserId] = useState(null);
  const [showPasswordFields, setShowPasswordFields] = useState(false); // State for toggling password fields
  useEffect(() => {
    if (!userData) {
      navigation.reset({
        index: 0,
        routes: [{ name: "Login" }],
      });
    } else if (hasRole("driver")) {
      setUserId(userData._id);
    } else {
      userLogout();
      navigation.reset({
        index: 0,
        routes: [{ name: "Login" }],
      });
    }
  }, [userData, navigation, hasRole]);

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
      [
        {
          text: "OK",
          onPress: () => {
            // console.log("OK Pressed")
          },
        },
      ],
      { cancelable: false }
    );
  };
  // console.log();

  const updateUserProfile = async (values) => {
    setLoader(true);
    try {
      const formData = new FormData();

      formData.append("email", values.email);
      formData.append("location", values.location);
      formData.append("username", values.username);
      formData.append("staffId", userId);
      formData.append("numberPlate", values.numberPlate);
      formData.append("vehicle", values.vehicle);
      if (values.name) formData.append("name", values.name);
      // If a profile picture is selected, append it to formData
      if (localProfilePicture) {
        const fileType = localProfilePicture.split(".").pop();
        formData.append("profilePicture", {
          uri: localProfilePicture,
          name: `profilePicture.${fileType}`,
          type: `image/${fileType}`,
        });
      }

      // Append password fields if provided
      if (showPasswordFields) {
        formData.append("currentPassword", values.currentPassword);
        formData.append("newPassword", values.newPassword);
      }
      console.log(formData);

      const endpoint = `${BACKEND_PORT}/api/staff/updateProfile`;

      const response = await axios.put(endpoint, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      console.log(response.data);
      if (response.status === 200) {
        await updateUserData(response.data); // Update user data in context with response data
        successUpdate();
        setLocalProfilePicture(null); // Clear the local URI
      }
    } catch (err) {
      console.log(err);
    }
    setLoader(false);
  };

  const pickImage = async () => {
    let result = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (result.granted === false) {
      alert("Permission to access gallery is required!");
      return;
    }

    let pickerResult = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!pickerResult.canceled && pickerResult.assets && pickerResult.assets.length > 0) {
      const pickedUri = pickerResult.assets[0].uri;
      setLocalProfilePicture(pickedUri);
      console.log(pickedUri);
    } else {
      console.log("wtf");
    }
  };

  // Dynamic validation schema
  const getValidationSchema = (showPasswordFields) => {
    return Yup.object().shape({
      email: Yup.string().email("Provide a valid email address").required("Required"),
      location: Yup.string().min(3, "Provide your location").required("Required"),
      username: Yup.string().min(3, "Provide a valid username").required("Required"),
      numberPlate: Yup.string().min(3, "Provide a valid vehicle number plate").required("Required"),
      vehicle: Yup.string().min(3, "Provide a valid vehicle type").required("Required"),
      currentPassword: showPasswordFields
        ? Yup.string().min(6, "Password must be at least 6 characters").required("Required")
        : Yup.string(),
      newPassword: showPasswordFields
        ? Yup.string().min(6, "Password must be at least 6 characters").required("Required")
        : Yup.string(),
      confirmPassword: showPasswordFields
        ? Yup.string()
            .oneOf([Yup.ref("newPassword"), null], "Passwords must match")
            .required("Required")
        : Yup.string(),
    });
  };

  const showToast = (type, text1, text2) => {
    Toast.show({
      type: type,
      text1: text1,
      text2: text2 ? text2 : "",
      visibilityTime: 3000,
    });
  };
  const logout = () => {
    Alert.alert(
      "Logout",
      "Are you sure you want to logout?",
      [
        {
          text: "Cancel",
          onPress: () => {},
          style: "cancel",
        },
        {
          text: "Continue",
          onPress: () => {
            showToast("success", "You have been logged out", "Thank you for being with us");

            // Reset the navigation stack
            navigation.reset({
              index: 0,
              routes: [{ name: "Bottom Navigation" }],
            });
            userLogout();
          },
        },
      ],
      { cancelable: true }
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.wrapper}>
        <TouchableOpacity
          onPress={() => {
            navigation.goBack();
          }}
          style={[styles.backBtn, styles.buttonWrap]}
        >
          <Icon name="backbutton" size={26} />
        </TouchableOpacity>
        <View style={styles.upperRow}>
          <View style={styles.upperButtons}>
            {/* <Text style={styles.topprofileheading}>Profile settings</Text> */}
          </View>
          {userLogin ? (
            <TouchableOpacity onPress={logout} style={styles.outWrap}>
              <Icon name="logout" size={26} />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              onPress={() => {
                userLogout();
                navigation.reset({
                  index: 0,
                  routes: [{ name: "Login" }],
                });
              }}
              style={[styles.outWrap, styles.rotateMe]}
            >
              <Icon name="logout" size={26} />
            </TouchableOpacity>
          )}
          <View style={styles.lowerheader}>
            <Text style={[styles.heading, { alignSelf: "center" }]}>Profile settings</Text>

            <View>
              {isComplete && completionPercentage === 100 && (
                <TouchableOpacity
                  style={{
                    backgroundColor: "#CBFCCD",
                    paddingVertical: 4,
                    paddingHorizontal: 8,
                    borderRadius: SIZES.medium,
                    width: 120,
                    alignSelf: "center",
                  }}
                >
                  <Text
                    style={{
                      color: "#26A532",
                    }}
                  >
                    Profile completed
                  </Text>
                </TouchableOpacity>
              )}
            </View>
            <Text style={[styles.statement, { alignItems: "center", textAlign: "center" }]}>
              You can edit your profile from here
            </Text>
          </View>
        </View>
      </View>
      <ProfileCompletion></ProfileCompletion>

      <ScrollView>
        <View style={styles.detailsWrapper}>
          <View style={styles.imageWrapper}>
            {localProfilePicture ? (
              <Image source={{ uri: localProfilePicture }} style={styles.profileImage} />
            ) : profilePicture ? (
              <Image source={{ uri: `${profilePicture}` }} style={styles.profileImage} />
            ) : (
              <Image source={require("../../../assets/images/userDefault.webp")} style={styles.profileImage} />
            )}
            <TouchableOpacity style={styles.editpencil} onPress={pickImage}>
              <View styles={styles.pencilWrapper}>
                <Icon name="pencil" size={25} />
              </View>
            </TouchableOpacity>
          </View>
          {userLogin && userData !== null ? (
            <Formik
              initialValues={{
                email: userData.email || "",
                location: userData.location || "",
                username: userData.username || "",
                numberPlate: userData.numberPlate || "",
                vehicle: userData.vehicle || "",
                currentPassword: "",
                newPassword: "",
                confirmPassword: "",
              }}
              validationSchema={getValidationSchema(showPasswordFields)}
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
                  <View style={styles.wrapper}>
                    <Text style={styles.label}>Vehicle Type</Text>
                    <View style={[styles.inputWrapper, touched.location && { borderColor: COLORS.secondary }]}>
                      <TextInput
                        placeholder="Enter Vehicle type"
                        onFocus={() => setFieldTouched("vehicle")}
                        onBlur={() => setFieldTouched("vehicle", "")}
                        autoCapitalize="none"
                        autoCorrect={false}
                        style={{ flex: 1 }}
                        value={values.vehicle}
                        onChangeText={handleChange("vehicle")}
                      />
                    </View>
                    {touched.vehicle && errors.vehicle && <Text style={styles.errorMessage}>{errors.vehicle}</Text>}
                  </View>
                  <View style={styles.wrapper}>
                    <Text style={styles.label}>Number Plate</Text>
                    <View style={[styles.inputWrapper, touched.location && { borderColor: COLORS.secondary }]}>
                      <TextInput
                        placeholder="Enter Number plate"
                        onFocus={() => setFieldTouched("numberPlate")}
                        onBlur={() => setFieldTouched("numberPlate", "")}
                        autoCapitalize="none"
                        autoCorrect={false}
                        style={{ flex: 1 }}
                        value={values.numberPlate}
                        onChangeText={handleChange("numberPlate")}
                      />
                    </View>
                    {touched.numberPlate && errors.numberPlate && (
                      <Text style={styles.errorMessage}>{errors.numberPlate}</Text>
                    )}
                  </View>
                  <TouchableOpacity
                    style={styles.changePasswordButton}
                    onPress={() => setShowPasswordFields(!showPasswordFields)}
                  >
                    <Text style={styles.changePasswordButtonText}>
                      {showPasswordFields ? "Cancel Change Password" : "Change Password ?"}
                    </Text>
                  </TouchableOpacity>
                  {showPasswordFields && (
                    <>
                      <View style={styles.wrapper}>
                        <Text style={styles.label}>Current Password</Text>
                        <View
                          style={[styles.inputWrapper, touched.currentPassword && { borderColor: COLORS.secondary }]}
                        >
                          <TextInput
                            placeholder="Enter current password"
                            onFocus={() => setFieldTouched("currentPassword")}
                            onBlur={() => setFieldTouched("currentPassword", "")}
                            autoCapitalize="none"
                            autoCorrect={false}
                            secureTextEntry
                            style={{ flex: 1 }}
                            value={values.currentPassword}
                            onChangeText={handleChange("currentPassword")}
                          />
                        </View>
                        {touched.currentPassword && errors.currentPassword && (
                          <Text style={styles.errorMessage}>{errors.currentPassword}</Text>
                        )}
                      </View>
                      <View style={styles.wrapper}>
                        <Text style={styles.label}>New Password</Text>
                        <View style={[styles.inputWrapper, touched.newPassword && { borderColor: COLORS.secondary }]}>
                          <TextInput
                            placeholder="Enter new password"
                            onFocus={() => setFieldTouched("newPassword")}
                            onBlur={() => setFieldTouched("newPassword", "")}
                            autoCapitalize="none"
                            autoCorrect={false}
                            secureTextEntry
                            style={{ flex: 1 }}
                            value={values.newPassword}
                            onChangeText={handleChange("newPassword")}
                          />
                        </View>
                        {touched.newPassword && errors.newPassword && (
                          <Text style={styles.errorMessage}>{errors.newPassword}</Text>
                        )}
                      </View>
                      <View style={styles.wrapper}>
                        <Text style={styles.label}>Confirm New Password</Text>
                        <View
                          style={[styles.inputWrapper, touched.confirmPassword && { borderColor: COLORS.secondary }]}
                        >
                          <TextInput
                            placeholder="Confirm new password"
                            onFocus={() => setFieldTouched("confirmPassword")}
                            onBlur={() => setFieldTouched("confirmPassword", "")}
                            autoCapitalize="none"
                            autoCorrect={false}
                            secureTextEntry
                            style={{ flex: 1 }}
                            value={values.confirmPassword}
                            onChangeText={handleChange("confirmPassword")}
                          />
                        </View>
                        {touched.confirmPassword && errors.confirmPassword && (
                          <Text style={styles.errorMessage}>{errors.confirmPassword}</Text>
                        )}
                      </View>
                    </>
                  )}
                  <ButtonMain
                    title={"Update Profile"}
                    onPress={isValid ? handleSubmit : inValidForm}
                    isValid={isValid}
                    loader={loader}
                  />
                </View>
              )}
            </Formik>
          ) : (
            <Text style={styles.pleaseLogin}>Please login to edit your profile.</Text>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default DriverProfile;

const styles = StyleSheet.create({
  textStyles: {
    fontFamily: "bold",
    fontSize: 19,
  },
  heading: {
    fontFamily: "bold",
    textTransform: "capitalize",
    fontSize: SIZES.xLarge + 3,
    textAlign: "left",
    color: COLORS.themeb,
    marginStart: 20,
  },
  topheading: {
    fontSize: SIZES.medium,
    textAlign: "center",
    color: COLORS.themeb,
    fontFamily: "semibold",
  },
  container: {
    flex: 1,
    backgroundColor: COLORS.themeg,
  },
  wrapper: {
    flexDirection: "column",
  },

  upperRow: {
    width: SIZES.width - 12,
    marginHorizontal: 6,
    flexDirection: "column",
    justifyContent: "space-between",
    alignItems: "center",
    // position: "absolute",
    backgroundColor: COLORS.themew,
    borderRadius: SIZES.large,
    top: SIZES.xxSmall,
    zIndex: 2,
    minHeight: 150,
  },
  upperButtons: {
    width: SIZES.width - 20,
    marginHorizontal: SIZES.xSmall,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: SIZES.xSmall,
    top: SIZES.medium,
  },
  backBtn: {
    left: 10,
  },
  buttonWrap: {
    backgroundColor: COLORS.themeg,
    padding: 15,
    borderRadius: 100,
    justifyContent: "center",
    alignItems: "center",
    marginEnd: 10,
    position: "absolute",
    zIndex: 9,
    top: 10,
    left: 10,
  },
  topprofileheading: {
    fontSize: SIZES.medium,
    textAlign: "center",
    color: COLORS.themeb,
    fontFamily: "semibold",
    // paddingTop: 20,
  },

  lowerheader: {
    flexDirection: "column",
    justifyContent: "flex-start",
    width: SIZES.width - 20,
    paddingTop: 20,
    paddingBottom: 20,
  },
  statement: {
    fontFamily: "regular",
    paddingLeft: 20,
    paddingVertical: 5,
    color: COLORS.gray2,
  },
  location: {
    paddingVertical: 15,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderRadius: SIZES.medium,
    backgroundColor: COLORS.themew,
    width: SIZES.width - 40,
  },
  toggleLocation: {
    right: 10,
    padding: 7,
    backgroundColor: COLORS.white,
    borderRadius: 100,
  },
  homeheading: {
    fontFamily: "regular",
    textTransform: "capitalize",
    fontSize: SIZES.medium,
    textAlign: "left",
    color: COLORS.themeb,
    marginStart: 10,
  },
  rightLocation: {
    flexDirection: "row",
    gap: 10,
    justifyContent: "space-between",
    alignItems: "center",
  },
  locationName: {
    paddingLeft: 10,
    flexDirection: "row",
    alignItems: "center",
  },
  rotateMe: {
    transform: [{ rotate: "180deg" }],
  },

  numbers: {
    padding: 3,
    width: 20,
    height: 20,
    backgroundColor: COLORS.themey,
    color: COLORS.themew,
    borderRadius: 100,
    position: "absolute",
    top: "-10%",
    left: "-10%",
    justifyContent: "center",
    alignItems: "center",
  },
  number: {
    color: COLORS.white,
  },
  detailsWrapper: {
    width: SIZES.width - 12,
    marginHorizontal: 6,
    marginTop: SIZES.xSmall,
    backgroundColor: COLORS.themew,
    borderRadius: SIZES.medium,
    minHeight: SIZES.height - 200,
  },
  profileImage: {
    position: "relative",
    height: 180,
    width: 180,
    borderRadius: 200,
  },
  imageWrapper: {
    width: SIZES.width - 20,
    justifyContent: "center",
    justifyContent: "center",
    alignItems: "center",
    padding: SIZES.medium,
  },
  editpencil: {
    position: "absolute",
    height: 50,
    width: 50,
    bottom: "10%",
    right: "30%",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 4,
    borderColor: COLORS.white,
    borderRadius: 100,
    backgroundColor: COLORS.themey,
  },
  pencilWrapper: {
    borderWidth: 4,
    borderColor: COLORS.black,
  },

  label: {
    fontSize: SIZES.xSmall,
    marginBottom: SIZES.xSmall,
    color: COLORS.gray,
    marginStart: SIZES.large,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.themeg,
    padding: 10,
    borderRadius: SIZES.medium,
    marginBottom: 10,
    width: SIZES.width - 30,
    marginStart: 10,
  },
  errorMessage: {
    color: COLORS.red,
    fontSize: 12,
    marginBottom: 10,
    marginStart: SIZES.large,
  },
  loginBtn: {
    backgroundColor: COLORS.secondary,
    padding: 4,
    borderWidth: 0.4,
    borderColor: COLORS.primary,
    borderRadius: SIZES.xxLarge,
    margin: 30,
    width: SIZES.large * 3,
    textAlign: "center",
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "center",
  },
  changePasswordButton: {
    alignSelf: "center",
    paddingVertical: SIZES.xxSmall,
  },
  submitBtn: {
    backgroundColor: COLORS.themey,
  },
  changePasswordButtonText: {
    fontFamily: "medium",
  },
  pleaseLogin: {
    fontFamily: "regular",
    textAlign: "center",
    marginVertical: SIZES.xxLarge,
    fontSize: SIZES.medium,
  },
  outWrap: {
    backgroundColor: COLORS.secondary,
    padding: 15,
    borderRadius: 100,
    justifyContent: "center",
    alignItems: "center",
    position: "absolute",
    top: 10,
    right: 10,
  },
});
