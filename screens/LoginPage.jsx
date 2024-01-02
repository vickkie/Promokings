import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
} from "react-native";
import React, { useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import BackBtn from "../components/BackBtn";
import { Image } from "react-native";
import styles from "./Login.style";
import Button from "../components/Button";
import { Formik, validateYupSchema } from "formik";
import * as Yup from "yup";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { COLORS } from "../constants";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

const validationSchema = Yup.object().shape({
  password: Yup.string()
    .min(8, "Password must be at least 8 character")
    .required("Required"),
  email: Yup.string()
    .email("Provide a valid email address")
    .required("Required"),
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

  const login = async (value) => {
    setLoader(true);
    try {
      const endpoint = "https://furniture-backend-eta.vercel.app/api/login";
      const data = value;
      const response = await axios.post(endpoint, data);

      if (response.status === 200) {
        setLoader(false);
        setResponseData(response.data);
        await AsyncStorage.setItem(
          `user${responseData._id}`,
          JSON.stringify(responseData)
        );
        await AsyncStorage.setItem("id", JSON.stringify(responseData._id));
        navigation.replace("Bottom Navigation");
        // const newUser = await AsyncStorage.getItem(`user${responseData._id}`);
        // console.log((newUser));

        console.log(`user${responseData._id}`);
      } else {
        Alert.alert("Error Logging", "Please provide valid user info", [
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
      Alert.alert("Error ", "Opps Error Logging in try again", [
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
          <Image
            source={require("../assets/images/bk.png")}
            style={styles.cover}
          />

          <Text style={styles.title}>Unlimited Luxurious Furniture</Text>

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

                  <View
                    style={styles.inputWrapper(
                      touched.email ? COLORS.secondary : COLORS.offwhite
                    )}
                  >
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
                  {touched.email && errors.email && (
                    <Text style={styles.errorMessage}>{errors.email}</Text>
                  )}
                </View>

                <View style={styles.wrapper}>
                  <Text style={styles.label}>Password</Text>

                  <View
                    style={styles.inputWrapper(
                      touched.password ? COLORS.secondary : COLORS.offwhite
                    )}
                  >
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
                      <MaterialCommunityIcons
                        size={18}
                        name={obsecureText ? "eye-outline" : "eye-off-outline"}
                      />
                    </TouchableOpacity>
                  </View>

                  {touched.password && errors.password && (
                    <Text style={styles.errorMessage}>{errors.password}</Text>
                  )}
                </View>

                <Button
                  loader={loader}
                  title={"L O G I N"}
                  onPress={isValid ? handleSubmit : inValidForm}
                  isValid={isValid}
                />

                <Text
                  style={styles.registration}
                  onPress={() => navigation.navigate("Register")}
                >
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