import { View, Text, ScrollView, TouchableOpacity, TextInput, Alert, StyleSheet } from "react-native";
import React, { useEffect, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import BackBtn from "../components/BackBtn";
import { Image } from "react-native";
import Button from "../components/Button";
import { Formik, validateYupSchema } from "formik";
import * as Yup from "yup";
import { MaterialCommunityIcons, Ionicons } from "@expo/vector-icons";
import { COLORS, SIZES } from "../constants";
import axios from "axios";
import { BACKEND_PORT } from "@env";
import Toast from "react-native-toast-message";
import usePost2 from "../hook/usePost2";

const validationSchema = Yup.object().shape({
  password: Yup.string().min(8, "Password must be at least 8 characters").required("Required"),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref("password"), null], "Passwords must match")
    .required("Required"),
  email: Yup.string().email("Provide a valid email address").required("Required"),
  username: Yup.string().min(3, "Provide a valid username").required("Required"),
});

const Register = ({ navigation }) => {
  const [loader, setLoader] = useState(false);
  const [obsecureText, setObsecureText] = useState(true);
  const { responseData, setUpdateStatus, updateStatus, isLoading, error, errorMessage, postData } =
    usePost2("auth/register");

  const inValidForm = () => {
    Alert.alert("Invalid Form", "Please provide required fields", [
      {
        text: "Cancel",
        onPress: () => {},
      },
      {
        text: "Continue",
        onPress: () => {},
      },
      { defaultIndex: 1 },
    ]);
  };

  const successRegister = () => {
    Alert.alert(
      "Registration Successful",
      "You have successfully registered!",
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

  const registerUser = async (value) => {
    setLoader(true);

    try {
      const { email, password, username } = value;
      const newdata = { email, password, username };

      await postData(newdata);
    } catch (err) {
      // console.log(err);
      Alert.alert(
        "Sorry. An error occured",
        "Try again later",
        [
          {
            text: "OK",
            onPress: () => {
              // console.log("OK Pressed")
              setUpdateStatus(null);
            },
          },
        ],
        { cancelable: false }
      );
      setLoader(false);
    }
  };

  useEffect(() => {
    if (updateStatus === 201) {
      successRegister();
      navigation.replace("Login");
    } else {
      if (errorMessage !== null) {
        Alert.alert(
          "Sorry. An error occured",
          errorMessage,
          [
            {
              text: "I understand",
              onPress: () => {
                // console.log("OK Pressed")
                setUpdateStatus(null);
              },
            },
          ],
          { cancelable: false }
        );
      }

      setLoader(false);
    }
  }, [updateStatus, responseData, errorMessage]);

  return (
    <ScrollView>
      <SafeAreaView style={{ marginHorizontal: 20 }}>
        <View>
          <BackBtn onPress={() => navigation.goBack()} />
          <Image source={require("../assets/images/promoshop1.webp")} style={styles.cover} />

          <Text style={styles.title}>Promokings SignUp</Text>

          <Formik
            initialValues={{
              email: "",
              password: "",
              confirmPassword: "",
              username: "",
            }}
            validationSchema={validationSchema}
            onSubmit={(values) => registerUser(values)}
          >
            {({
              handleChange,
              handleBlur,
              handleSubmit,
              values,
              errors,
              isLoading,
              isValid,
              setFieldTouched,
              touched,
            }) => (
              <View>
                <View style={styles.wrapper}>
                  <Text style={styles.label}>UserName</Text>

                  <View style={styles.inputWrapper(touched.username ? COLORS.secondary : COLORS.offwhite)}>
                    <MaterialCommunityIcons
                      name="face-man-profile"
                      size={20}
                      style={styles.iconStyle}
                      color={COLORS.gray}
                    />
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

                  <View style={styles.inputWrapper(touched.email ? COLORS.secondary : COLORS.offwhite)}>
                    <MaterialCommunityIcons
                      name="email-outline"
                      size={20}
                      style={styles.iconStyle}
                      color={COLORS.gray}
                    />
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
                  <Text style={styles.label}>Password</Text>

                  <View style={styles.inputWrapper(touched.password ? COLORS.secondary : COLORS.offwhite)}>
                    <MaterialCommunityIcons
                      name="lock-outline"
                      size={20}
                      style={styles.iconStyle}
                      color={COLORS.gray}
                    />
                    <TextInput
                      secureTextEntry={obsecureText}
                      placeholder="Password"
                      onFocus={() => setFieldTouched("password")}
                      onBlur={() => setFieldTouched("password", "")}
                      autoCapitalize="none"
                      autoCorrect={false}
                      style={{ flex: 1 }}
                      value={values.password}
                      onChangeText={handleChange("password")}
                    />

                    <TouchableOpacity
                      onPress={() => {
                        setObsecureText(!obsecureText);
                      }}
                    >
                      <MaterialCommunityIcons size={18} name={obsecureText ? "eye-outline" : "eye-off-outline"} />
                    </TouchableOpacity>
                  </View>

                  {touched.password && errors.password && <Text style={styles.errorMessage}>{errors.password}</Text>}
                </View>

                <View style={styles.wrapper}>
                  <Text style={styles.label}>Confirm Password</Text>

                  <View style={styles.inputWrapper(touched.confirmPassword ? COLORS.secondary : COLORS.offwhite)}>
                    <MaterialCommunityIcons
                      name="lock-outline"
                      size={20}
                      style={styles.iconStyle}
                      color={COLORS.gray}
                    />
                    <TextInput
                      secureTextEntry={obsecureText}
                      placeholder="Confirm Password"
                      onFocus={() => setFieldTouched("confirmPassword")}
                      onBlur={() => setFieldTouched("confirmPassword", "")}
                      autoCapitalize="none"
                      autoCorrect={false}
                      style={{ flex: 1 }}
                      value={values.confirmPassword}
                      onChangeText={handleChange("confirmPassword")}
                    />

                    <TouchableOpacity
                      onPress={() => {
                        setObsecureText(!obsecureText);
                      }}
                    >
                      <MaterialCommunityIcons size={18} name={obsecureText ? "eye-outline" : "eye-off-outline"} />
                    </TouchableOpacity>
                  </View>

                  {touched.confirmPassword && errors.confirmPassword && (
                    <Text style={styles.errorMessage}>{errors.confirmPassword}</Text>
                  )}
                </View>

                <Button
                  title={"S I G N U P"}
                  onPress={isValid ? handleSubmit : inValidForm}
                  isValid={isValid}
                  loader={loader}
                />
              </View>
            )}
          </Formik>
        </View>
      </SafeAreaView>
    </ScrollView>
  );
};

export default Register;

const styles = StyleSheet.create({
  cover: {
    height: SIZES.height / 3.8,
    width: SIZES.width - 60,
    resizeMode: "contain",
    marginBottom: SIZES.medium,
  },

  title: {
    fontFamily: "bold",
    fontSize: SIZES.xLarge,
    color: COLORS.primary,
    alignItems: "center",
    textAlign: "center",
    marginBottom: SIZES.xLarge,
  },

  wrapper: {
    marginBottom: 10,
  },

  label: {
    fontFamily: "regular",
    fontSize: SIZES.xSmall,
    marginBottom: 5,
    textAlign: "right",
  },

  inputWrapper: (borderColor) => ({
    borderColor: borderColor,
    backgroundColor: COLORS.lightWhite,
    borderWidth: 1,
    height: 55,
    borderRadius: 12,
    flexDirection: "row",
    paddingHorizontal: 15,
    alignItems: "center",
  }),

  iconStyle: {
    marginRight: 10,
  },

  errorMessage: {
    color: COLORS.red,
    fontFamily: "regular",
    fontSize: SIZES.xSmall,
    marginLeft: 5,
    marginTop: 5,
  },

  registration: {
    marginTop: 2,
    textAlign: "center",
    marginBottom: 20,
  },
});
