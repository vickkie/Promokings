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
import { MaterialCommunityIcons, Ionicons } from "@expo/vector-icons";
import { COLORS, SIZES } from "../constants";
import axios from "axios";

const validationSchema = Yup.object().shape({
  password: Yup.string()
    .min(8, "Password must be at least 8 character")
    .required("Required"),

  email: Yup.string()
    .email("Provide a valid email address")
    .required("Required"),

  location: Yup.string().min(3, "Provide your location").required("Required"),

  username: Yup.string()
    .min(3, "Provide a valid username")
    .required("Required"),
});

const SignUp = ({ navigation }) => {
  const [loader, setLoader] = useState(false);
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


  const registerUser = async (value) => {
    setLoader(true);
   
    // `http://10.0.2.2:9000/api
    try {
      const endpoint = "https://furniture-backend-eta.vercel.app/api/register";
      const data = value;
      const response = await axios.post(endpoint, data);

      if (response.status === 201) {
        navigation.replace("Login");
      }
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <ScrollView>
      <SafeAreaView style={{ marginHorizontal: 20 }}>
        <View>
          <BackBtn onPress={() => navigation.goBack()} />
          <Image
            source={require("../assets/images/bk.png")}
            style={{
              height: SIZES.height / 3,
              width: SIZES.width - 60,
              resizeMode: "contain",
              marginBottom: SIZES.xxLarge,
            }}
          />

          <Text style={styles.title}>Unlimited Luxurious Furniture</Text>

          <Formik
            initialValues={{
              email: "",
              password: "",
              location: "",
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

                  <View
                    style={styles.inputWrapper(
                      touched.email ? COLORS.secondary : COLORS.offwhite
                    )}
                  >
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

                  {touched.username && errors.username && (
                    <Text style={styles.errorMessage}>{errors.username}</Text>
                  )}
                </View>

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
                  <Text style={styles.label}>Location</Text>

                  <View
                    style={styles.inputWrapper(
                      touched.location ? COLORS.secondary : COLORS.offwhite
                    )}
                  >
                    <Ionicons
                      name="location-outline"
                      size={20}
                      style={styles.iconStyle}
                      color={COLORS.gray}
                    />
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
                  title={"S I G N U P"}
                  onPress={isValid ? handleSubmit : inValidForm}
                  isValid={isValid}
                  loader={loader}
                />

                {/* <Text style={styles.registration} onPress={() => {}}>Create an Account</Text> */}
              </View>
            )}
          </Formik>
        </View>
      </SafeAreaView>
    </ScrollView>
  );
};

export default SignUp;
