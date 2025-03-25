import React, { useState, useContext } from "react";

import { Buffer } from "buffer";

global.atob = (input) => Buffer.from(input, "base64").toString("utf-8");
global.btoa = (input) => Buffer.from(input, "utf-8").toString("base64");

import { View, Text, ScrollView, TouchableOpacity, TextInput, Alert, Image, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Formik } from "formik";
import * as Yup from "yup";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import axios from "axios";
import { AuthContext } from "../components/auth/AuthContext";
import BackBtn from "../components/BackBtn";
import CustomButton from "../components/Button";

import { COLORS, SIZES } from "../constants";
import { BACKEND_PORT } from "@env";
import Icon from "../constants/icons";
import { StatusBar } from "react-native";
import Toast from "react-native-toast-message";

const validationSchema = Yup.object().shape({
  password: Yup.string()
    .min(8, "Password must be at least 8 characters")
    .transform((value) => (value ? value.trim() : value))
    .required("Required"),
  email: Yup.string().email("Provide a valid email address").required("Required"),
  staffId: Yup.string().when("userType", {
    is: "staff",
    then: (schema) => schema.required("Staff ID is required"),
    otherwise: (schema) => schema.notRequired(),
  }),
});

const LoginPage = ({ navigation }) => {
  const { login, getRole, hasRole } = useContext(AuthContext);
  const [loader, setLoader] = useState(false);
  const [userType, setUserType] = useState("customer");
  const [obsecureText, setObsecureText] = useState(false);

  React.useEffect(() => {
    console.log("Navigated to LoginPage");
  }, []);

  const inValidForm = () => {
    Alert.alert("Invalid Form", "Please provide required fields", [
      {
        text: "Cancel",
        onPress: () => {},
      },
      {
        text: "Retry",
        onPress: () => {},
      },
      { defaultIndex: 1 },
    ]);
  };

  const handleLogin = async (values) => {
    setLoader(true);
    try {
      const endpoint = `${BACKEND_PORT}/auth/login`;
      const data = { ...values, userType };

      const response = await axios.post(endpoint, data);

      // Check response status and token first
      if (response.status !== 200 || !response.data || !response.data.TOKEN) {
        Alert.alert("Error Logging", "Unexpected response. Please try again.");
        return;
      }

      // Store login data
      await login(response.data);

      // Get role from AuthContext
      const role = getRole(response.data);

      // Role-based navigation
      const roleRoutes = {
        admin: "Admin Navigation",
        inventory: "Inventory Navigation",
        sales: "Sales Navigation",
        finance: "Finance Navigation",
        customer: "Bottom Navigation",
        driver: "Driver Navigation",
        dispatcher: "Dispatch Navigation",
        supplier: "Supplier Navigation",
      };

      if (role in roleRoutes) {
        console.log("Navigating to:", roleRoutes[role]);
        navigation.replace(roleRoutes[role]);
      } else {
        navigation.replace("Bottom Navigation");
      }
    } catch (error) {
      // Pull the error message from the response
      const errorMsg = error.response?.data?.message || "Oops! Error logging in. Please try again.";
      Alert.alert("Login Failure", errorMsg);
    } finally {
      setLoader(false);
    }
  };

  return (
    <ScrollView>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.themey} />

      <SafeAreaView style={{ marginHorizontal: 21 }}>
        <View>
          <BackBtn
            onPress={() => {
              console.log("going home");
              if (navigation.canGoBack()) {
                navigation.goBack();
              } else {
                navigation.reset({
                  index: 0,
                  routes: [{ name: "Bottom Navigation", params: { screen: "Home" } }],
                });
              }
            }}
          />

          <Image source={require("../assets/images/promoshop1.webp")} style={styles.cover} />
          <Text style={styles.title}>Promokings Login</Text>

          <Formik
            initialValues={{ email: "", password: "", staffId: "" }}
            validationSchema={validationSchema}
            onSubmit={handleLogin}
          >
            {({
              handleChange,
              handleBlur,
              handleSubmit,
              handleReset,
              values,
              errors,
              isValid,
              setFieldTouched,
              touched,
              setFieldValue,
            }) => (
              <View>
                <View style={styles.chooseWrapper}>
                  <TouchableOpacity
                    style={[styles.chooseUser, styles.chooseBox]}
                    onPress={() => {
                      setUserType("customer");
                      handleReset();
                    }}
                  >
                    <View>
                      <Text style={styles.choiceText}>Customer</Text>
                    </View>
                    <Icon name={userType === "customer" ? "check" : "checkempty"} size={18} />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.chooseStaff, styles.chooseBox]}
                    onPress={() => {
                      setUserType("staff");
                      handleReset();
                    }}
                  >
                    <View>
                      <Text style={styles.choiceText}>Staff</Text>
                    </View>
                    <Icon name={userType === "staff" ? "check" : "checkempty"} size={18} />
                  </TouchableOpacity>
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
                      onChangeText={(text) => setFieldValue("email", text.trim())}
                    />
                  </View>
                  {touched.email && errors.email && <Text style={styles.errorMessage}>{errors.email}</Text>}
                </View>

                {userType === "staff" && (
                  <View style={styles.wrapper}>
                    <Text style={styles.label}>Staff ID</Text>
                    <View style={styles.inputWrapper(touched.staffId ? COLORS.secondary : COLORS.offwhite)}>
                      <MaterialCommunityIcons
                        name="identifier"
                        size={20}
                        style={styles.iconStyle}
                        color={COLORS.gray}
                      />
                      <TextInput
                        placeholder="Enter Staff ID"
                        onFocus={() => setFieldTouched("staffId")}
                        onBlur={() => setFieldTouched("staffId", "")}
                        autoCapitalize="none"
                        autoCorrect={false}
                        style={{ flex: 1 }}
                        value={values.staffId}
                        onChangeText={handleChange("staffId")}
                      />
                    </View>
                    {touched.staffId && errors.staffId && <Text style={styles.errorMessage}>{errors.staffId}</Text>}
                  </View>
                )}

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

                <CustomButton
                  loader={loader}
                  title={"L O G I N"}
                  onPress={isValid ? handleSubmit : inValidForm}
                  isValid={isValid}
                />

                <Text style={styles.registration} onPress={() => navigation.navigate("Register")}>
                  Create an Account
                </Text>
              </View>
            )}
          </Formik>
        </View>
      </SafeAreaView>
    </ScrollView>
  );
};

export default LoginPage;

const styles = StyleSheet.create({
  cover: {
    height: SIZES.height / 3.8,
    width: SIZES.width - 60,
    resizeMode: "contain",
    marginBottom: SIZES.medium,
    marginTop: -35,
  },

  title: {
    fontFamily: "bold",
    fontSize: SIZES.xLarge,
    color: COLORS.primary,
    alignItems: "center",
    textAlign: "center",
    marginBottom: SIZES.xLarge,
    marginTop: -13,
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
  chooseWrapper: {
    flexDirection: "row",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
    gap: SIZES.xLarge,
  },
  chooseBox: {
    borderBlockColor: COLORS.black,
    borderWidth: 0.2,
    backgroundColor: COLORS.lightWhite,
    width: SIZES.width / 2 - 40,
    borderRadius: SIZES.medium,
    alignItems: "center",
    justifyContent: "space-between",
    height: SIZES.xxLarge - 5,
    flexDirection: "row",
    paddingHorizontal: SIZES.small,
    marginTop: -10,
  },
  choiceText: {
    color: COLORS.black,
    fontFamily: "bold",
  },
});
