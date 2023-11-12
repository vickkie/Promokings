import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
} from "react-native";
import React, { useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import BackBtn from "../components/BackBtn";
import { Image } from "react-native";
import styles from "./Login.style";
import Button from "../components/Button";
import { Formik } from "formik";
import * as Yup from "yup";

const LoginPage = ({ navigation }) => {
  const [loader, setLoader] = useState(false);
  const [response, setResponse] = useState(null);

  const [input, setInput] = useState({
    email: "",
    password: "",
  });

  const [error, setError] = useState({});

  return (
    <ScrollView>
      <SafeAreaView style={{ marginHorizontal: 20 }}>
        <View>
          <BackBtn onPress={() => navigation.goBack()} />
          <Image
            source={require("../assets/images/bk.png")}
            style={styles.cover}
          />

          <Text style={styles.title}>Unlimited Luxurious Furniture</Text>

          <Button title={"L O G I N"} onPress={() => {}} />
        </View>
      </SafeAreaView>
    </ScrollView>
  );
};

export default LoginPage;
