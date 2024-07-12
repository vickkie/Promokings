import { View, Text, ScrollView, TouchableOpacity, TextInput, Alert } from "react-native";
import React, { useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import BackBtn from "../components/BackBtn";
import { Image } from "react-native";
import styles from "./loginpage.style";
import { Formik, validateYupSchema } from "formik";
import * as Yup from "yup";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { COLORS } from "../constants";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import CustomButton from "../components/Button";
import { BACKEND_PORT } from "@env";

const validationSchema = Yup.object().shape({
  password: Yup.string().min(8, "Password must be at least 8 character").required("Required"),
  email: Yup.string().email("Provide a valid email address").required("Required"),
});

const LoginPage = ({ navigation }) => {
  const [loader, setLoader] = useState(false);
  // const [response, setResponse] = useState(null);
  const [responseData, setResponseData] = useState(null);
  const [obsecureText, setObsecureText] = useState(false);

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

  const login = async (values) => {
    setLoader(true);
    try {
      const endpoint = `${BACKEND_PORT}/api/login`;
      const data = values;

      const response = await axios.post(endpoint, data);

      // Check if the response has a 'data' property and if it contains expected fields
      if (response.data && response.data.hasOwnProperty("_id")) {
        setLoader(false);
        setResponseData(response.data);
        try {
          await AsyncStorage.setItem("id", JSON.stringify(response.data._id));
          await AsyncStorage.setItem(`user${response.data._id}`, JSON.stringify(response.data));
        } catch (error) {
          console.error("Failed to save user data:", error);
          // Display an error message if saving data fails
          Alert.alert("Error Saving Data", "There was an error saving your data. Please try again.");
          return;
        }

        navigation.replace("Bottom Navigation");
      } else {
        // Display an error message if the response does not meet expectations
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
      Alert.alert("Error ", "Oops! Error logging in. Please try again.", [
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
    } finally {
      setLoader(false);
    }
  };

  return (
    <ScrollView>
      <SafeAreaView style={{ marginHorizontal: 21 }}>
        <View>
          <BackBtn onPress={() => navigation.goBack()} />
          <Image source={require("../assets/images/promoshop.png")} style={styles.cover} />

          <Text style={styles.title}>Promokings Login</Text>

          <Formik
            initialValues={{ email: "", password: "" }}
            validationSchema={validationSchema}
            onSubmit={(values) => login(values)}
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