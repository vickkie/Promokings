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

const CompanyProfile = () => {
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
  const [isEditing, setIsEditing] = useState(false);
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
      // console.log(userData);
    } else if (hasRole("supplier")) {
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

  const updateCompanyProfile = async (values) => {
    setLoader(true);
    try {
      let profilePictureUrl = null;

      const userUpdateData = {
        name: values.name || undefined,
        email: values.email || userData?.supplierProfile?.email,
        address: values.address || values.supplierProfile?.address || "",
        staffId: userData?.staffId,
        phoneNumber: values.phoneNumber || userData.supplierProfile?.phoneNumber,
      };
      // console.log(userUpdateData);

      const endpoint = `${BACKEND_PORT}/api/v2/supplier/${userData?.supplierProfile?._id}`;

      const response = await axios.put(endpoint, userUpdateData, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${userData?.TOKEN}`,
        },
      });

      // console.log("response", response.data);

      if (response.status === 200) {
        const updatedUserData = {
          ...userData,
          ...response.data?.supplier,
          TOKEN: userData.TOKEN,
        };

        console.log(updatedUserData);
        console.log(response.data);

        await updateUserData(updatedUserData);
        successUpdate();
        setLocalProfilePicture(null);
        setProfilePicture(userData?.profilePicture);
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
      // console.log(pickedUri);
    }
  };

  // Dynamic validation schema
  const getValidationSchema = (showPasswordFields) => {
    return Yup.object().shape({
      email: Yup.string().email("Provide a valid email address").required("Required"),
      address: Yup.string().min(3, "Provide your address").required("Required"),
      phoneNumber: Yup.string().min(3, "Provide your phoneNumber").required("Required"),
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
          {userLogin ? (
            <TouchableOpacity onPress={logout} style={styles.outWrap}>
              <Icon name="logout" size={26} />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              onPress={() => {
                navigation.navigate("Login");
              }}
              style={[styles.outWrap, styles.rotateMe]}
            >
              <Icon name="logout" size={26} />
            </TouchableOpacity>
          )}
          <View style={styles.lowerheader}>
            <Text style={[styles.heading, { alignSelf: "center", paddingBottom: 7 }]}>Profile settings</Text>

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
            <Text style={[styles.statement, { alignItems: "center", textAlign: "center", paddingTop: 15 }]}>
              You can view your company profile from here
            </Text>
          </View>
        </View>
      </View>
      <ProfileCompletion />
      <ScrollView>
        <View style={styles.detailsWrapper}>
          {userLogin && userData !== null ? (
            <Formik
              initialValues={{
                name: userData?.supplierProfile?.name || "",
                email: userData?.supplierProfile?.email || "",
                address: userData.supplierProfile?.address || "",
                phoneNumber: userData.supplierProfile?.phoneNumber || "",
                dateCreated: userData.supplierProfile?.createdAt || "",
              }}
              validationSchema={getValidationSchema(showPasswordFields)}
              onSubmit={(values) => {
                console.log(values);
                updateCompanyProfile(values);
              }}
            >
              {({ handleChange, handleBlur, handleSubmit, values, errors, isValid, setFieldTouched, touched }) => (
                <View style={styles.profileData}>
                  <View style={styles.wrapper}>
                    <View style={[styles.upperButtons, { marginBottom: 30 }]}>
                      <Text style={styles.topprofileheading}>Supplier Company</Text>
                    </View>
                    <Text style={styles.label}>Company Name</Text>
                    <View style={[styles.inputWrapper, touched.name && { borderColor: COLORS.secondary }]}>
                      <TextInput
                        placeholder="name"
                        editable={false}
                        autoCapitalize="none"
                        autoCorrect={false}
                        style={{ flex: 1 }}
                        value={values.name}
                      />
                    </View>
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
                    <Text style={styles.label}>address</Text>
                    <View style={[styles.inputWrapper, touched.address && { borderColor: COLORS.secondary }]}>
                      <TextInput
                        placeholder="Enter address"
                        onFocus={() => setFieldTouched("address")}
                        onBlur={() => setFieldTouched("address", "")}
                        autoCapitalize="none"
                        autoCorrect={false}
                        style={{ flex: 1 }}
                        value={values.address}
                        onChangeText={handleChange("address")}
                      />
                    </View>
                    {touched.address && errors.address && <Text style={styles.errorMessage}>{errors.address}</Text>}
                  </View>
                  <View style={styles.wrapper}>
                    <Text style={styles.label}>Phone Number</Text>
                    <View style={[styles.inputWrapper, touched.phoneNumber && { borderColor: COLORS.secondary }]}>
                      <TextInput
                        placeholder=" phone Number eg: +2547..."
                        onFocus={() => setFieldTouched("phoneNumber")}
                        onBlur={() => setFieldTouched("phoneNumber", "")}
                        autoCapitalize="none"
                        autoCorrect={false}
                        style={{ flex: 1 }}
                        value={values.phoneNumber}
                        onChangeText={handleChange("phoneNumber")}
                      />
                    </View>
                    {touched.phoneNumber && errors.phoneNumber && (
                      <Text style={styles.errorMessage}>{errors.phoneNumber}</Text>
                    )}
                  </View>
                  <View style={styles.wrapper}>
                    <Text style={styles.label}>Date Registered</Text>
                    <View style={[styles.inputWrapper, touched.address && { borderColor: COLORS.secondary }]}>
                      <TextInput
                        placeholder="Date registered"
                        editable={false}
                        autoCapitalize="none"
                        autoCorrect={false}
                        style={{ flex: 1 }}
                        value={values.dateCreated}
                      />
                    </View>
                  </View>

                  <ButtonMain
                    title={isEditing ? "Update Profile" : "Edit Profile"}
                    onPress={() => {
                      if (!isEditing) {
                        setIsEditing(true);
                      }
                      if (isEditing) {
                        console.log(isValid);
                        isValid ? handleSubmit() : inValidForm();
                      }
                    }}
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

export default CompanyProfile;

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
    minHeight: 140,
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
  address: {
    paddingVertical: 15,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderRadius: SIZES.medium,
    backgroundColor: COLORS.themew,
    width: SIZES.width - 40,
  },
  toggleaddress: {
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
  rightaddress: {
    flexDirection: "row",
    gap: 10,
    justifyContent: "space-between",
    alignItems: "center",
  },
  addressName: {
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
