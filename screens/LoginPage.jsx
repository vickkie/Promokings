import React, { useState, useContext } from "react";
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

const validationSchema = Yup.object().shape({
  password: Yup.string().min(8, "Password must be at least 8 characters").required("Required"),
  email: Yup.string().email("Provide a valid email address").required("Required"),
  staffId: Yup.string().when("userType", {
    is: "staff",
    then: (schema) => schema.required("Staff ID is required"),
    otherwise: (schema) => schema.notRequired(),
  }),
});

const LoginPage = ({ navigation }) => {
  const { login } = useContext(AuthContext);
  const [loader, setLoader] = useState(false);
  const [userType, setUserType] = useState("customer");
  const [obsecureText, setObsecureText] = useState(false);

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
      const endpoint = `${BACKEND_PORT}/api/login`;
      const data = { ...values, userType };

      console.log(data);

      const response = await axios.post(endpoint, data);

      if (response.data && response.data.hasOwnProperty("_id")) {
        setLoader(false);
        await login(response.data);
        navigation.replace("Bottom Navigation");
      } else {
        Alert.alert("Error Logging", "Unexpected response. Please try again.", [
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
      }
    } catch (error) {
      console.log(error);
      Alert.alert("Error", "Oops! Error logging in. Please try again.", [
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
    } finally {
      setLoader(false);
    }
  };

  return (
    <ScrollView>
      <SafeAreaView style={{ marginHorizontal: 21 }}>
        <View>
          <BackBtn onPress={() => navigation.goBack()} />
          <Image source={require("../assets/images/promoshop1.webp")} style={styles.cover} />
          <Text style={styles.title}>Promokings Login</Text>

          <View style={styles.chooseWrapper}>
            <TouchableOpacity style={[styles.chooseUser, styles.chooseBox]} onPress={() => setUserType("customer")}>
              <View>
                <Text style={styles.choiceText}>Customer</Text>
              </View>
              <Icon name={userType === "customer" ? "check" : "checkempty"} size={18} />
            </TouchableOpacity>
            <TouchableOpacity style={[styles.chooseStaff, styles.chooseBox]} onPress={() => setUserType("staff")}>
              <View>
                <Text style={styles.choiceText}>Staff</Text>
              </View>
              <Icon name={userType === "staff" ? "check" : "checkempty"} size={18} />
            </TouchableOpacity>
          </View>

          <Formik
            initialValues={{ email: "", password: "", staffId: "" }}
            validationSchema={validationSchema}
            onSubmit={handleLogin}
          >
            {({ handleChange, handleBlur, handleSubmit, values, errors, isValid, setFieldTouched, touched }) => (
              <View>
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
