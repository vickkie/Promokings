import { View, Text, ScrollView, TouchableOpacity, TextInput, Alert, StyleSheet } from "react-native";
import React, { useEffect, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import BackBtn from "../components/BackBtn";
import { Image } from "react-native";
import Button from "../components/Button";
import { Formik, useFormik, validateYupSchema } from "formik";
import * as Yup from "yup";
import { MaterialCommunityIcons, Ionicons } from "@expo/vector-icons";
import { COLORS, SIZES } from "../constants";
import axios from "axios";
import { BACKEND_PORT } from "@env";
import Toast from "react-native-toast-message";
import usePost2 from "../hook/usePost2";
import IntlPhoneInput from "react-native-intl-phone-input";
import { Modal } from "react-native";
import { FlatList } from "react-native-gesture-handler";
import Icon from "../constants/icons";

import LottieView from "lottie-react-native";
import { useFocusEffect } from "@react-navigation/native";
import { BackHandler } from "react-native";
import { useCallback } from "react";

const SupplierRegister = ({ navigation }) => {
  const [loader, setLoader] = useState(false);
  const [obsecureText, setObsecureText] = useState(true);
  const [step, setStep] = useState(1);
  const [Rsuccess, setRsuccess] = useState(false);

  const [finalPhoneNumber, setfinalPhoneNumber] = useState("");
  const [finalMpesaNumber, setfinalMpesaNumber] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [phoneError2, setPhoneError2] = useState("");
  const [allcountries, setallCountries] = useState([]);

  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("BankTransfer");

  const [filteredCountries, setFilteredCountries] = useState(allcountries);

  const phoneNumbervalidation = Yup.object().shape({
    finalMpesaNumber: Yup.string()
      .min(8, "Payment phone number must be atleast 6 digits")
      .required("Phone number is required")
      .matches(/^\+?[0-9]+$/, "Phone number must contain only digits"),
  });

  const validationSchema1 = Yup.object().shape({
    password: Yup.string().min(8, "Password must be at least 8 characters").required("Required"),
    confirmPassword: Yup.string()
      .oneOf([Yup.ref("password"), null], "Passwords must match")
      .required("Required"),
    email: Yup.string().email("Provide a valid email address").required("Required"),
    username: Yup.string().min(3, "Provide a valid username").required("Required"),
    phoneNumber: Yup.string()
      .min(7)
      .required("Phone number is required")
      .matches(/^\+?[0-9]+$/, "Phone number must contain only digits"),
  });
  const validationSchema2 = Yup.object().shape({
    companyEmail: Yup.string().email("Provide a valid email address").required("Required"),
    companyName: Yup.string().min(3, "Provide full company name").required("Required"),
    address: Yup.string().min(3, "Provide a valid location address").required("Required"),
    businessId: Yup.string().min(3, "Provide a valid business Permit No."),
  });

  const paymentDetailsSchema = Yup.object().shape({
    preferredMethod: Yup.string()
      .required("Select a payment method")
      .test("hasValidPaymentDetails", "Please fill all required fields for selected payment method", function (value) {
        const { parent } = this;
        switch (value) {
          case "mobileMoney":
            return parent.mobileMoney.mpesaName && parent.mobileMoney.mpesaNumber && parent.mobileMoney.idNumber;
          case "bank":
            return (
              parent.bank.bankName &&
              parent.bank.bankBranch &&
              parent.bank.accountName &&
              parent.bank.accountNumber &&
              parent.bank.swiftCode &&
              parent.bank.bankCode
            );
          case "paypal":
            return parent.paypal.email;
          default:
            return false;
        }
      }),
    mobileMoney: Yup.object().shape({
      mpesaName: Yup.string(),
      mpesaNumber: Yup.string()
        .min(4)
        .required("Phone number is required")
        .matches(/^\+?[0-9]+$/, "Phone number must contain only digits"),
      idNumber: Yup.string().min(6, "ID must be at least 6 digits"),
    }),
    bank: Yup.object().shape({
      bankName: Yup.string(),
      bankBranch: Yup.string(),
      accountName: Yup.string(),
      accountNumber: Yup.string().matches(/^[0-9]+$/, "Account Number must be digits only"),
      swiftCode: Yup.string(),
      bankCode: Yup.string(),
    }),
    paypal: Yup.object().shape({
      email: Yup.string().email("Enter a valid email"),
    }),
  });

  const validationSchema3 = Yup.object().shape({
    paymentDetails: paymentDetailsSchema,
  });

  const validationSchemas = [validationSchema1, validationSchema2, validationSchema3];

  const touchAllFields = (errors, setFieldTouched, path = "") => {
    Object.keys(errors).forEach((key) => {
      const fieldPath = path ? `${path}.${key}` : key;
      if (typeof errors[key] === "string") {
        setFieldTouched(fieldPath, true, false);
      } else if (typeof errors[key] === "object" && errors[key] !== null) {
        touchAllFields(errors[key], setFieldTouched, fieldPath);
      }
    });
  };

  const handleNext = async (validateForm, values, errors, setStep, step, setFieldTouched) => {
    const formErrors = await validateForm();

    // Guard clause for Step 4 access
    if (step === 3) {
      if (Rsuccess && !loader) {
        setStep((prev) => prev + 1);
        console.log("Processed, success");
      } else {
        console.log("Hold up, still processing registration...");
        return;
      }
    }

    // Normal validation for steps 1-2
    if (step < 3) {
      if (Object.keys(formErrors).length === 0) {
        setStep((prev) => prev + 1);
      } else {
        touchAllFields(formErrors, setFieldTouched);
      }
    }
  };

  useEffect(() => {
    if (step === 3 && Rsuccess && !loader) {
      setStep(4);
      console.log("Auto-advanced to step 4 after success");
    }
  }, [Rsuccess, loader, step]);
  const handlePrevious = () => {
    if (step > 1 && step !== 4) {
      setStep(step - 1);
    } else if (step === 4) {
      setStep(4);
      navigation.navigate("Login");
    }
  };

  const handleSignUp = async (values) => {
    setLoader(true);
    // console.log(values);

    if (phoneError2) {
      setLoader(false);
      return;
    }

    try {
      const endpoint = `${BACKEND_PORT}/api/v2/supplier/v2/new`;
      const data = { ...values };

      const response = await axios.post(endpoint, data);

      // Check response status and token first
      if (response.status !== 201 || !response.data.success) {
        Alert.alert("Error Logging", "Unexpected response. Please try again.");
        return;
      } else if (response.status === 201 && response.data.success) {
        setRsuccess(true);
      }
    } catch (error) {
      // Pull the error message from the response
      const errorMsg = error.response?.data?.message || "Oops! Error logging in. Please try again.";
      Alert.alert("SignUp Failure", errorMsg);
    } finally {
      setLoader(false);
    }
  };

  const handleSearch = (query) => {
    const filtered = allcountries.filter((country) => {
      return country?.en?.toLowerCase().includes(query?.toLowerCase());
    });
    setFilteredCountries(filtered);
  };

  const renderCustomModal = (modalVisible, countries, onCountryChange) => {
    setallCountries(countries);

    return (
      <Modal visible={modalVisible} animationType="slide" transparent={true}>
        <SafeAreaView style={{ flex: 1, backgroundColor: "rgba(0, 0, 0, 0.5)" }}>
          <View style={styles.modalContainer}>
            <View style={styles.searchContainer}>
              <TextInput style={styles.searchInput} placeholder="Search Country here" onChangeText={handleSearch} />
              <Text style={styles.searchIcon}>🔍</Text>
            </View>

            {/* Country List */}
            <FlatList
              data={filteredCountries}
              keyExtractor={(item, index) => index.toString()}
              renderItem={({ item }) => (
                <TouchableOpacity
                  onPress={() => {
                    onCountryChange(item.code);
                    // console.log(item.code);
                  }}
                >
                  <View style={styles.countryItem}>
                    <Text style={styles.flag}>{item.flag}</Text>
                    <Text style={styles.countryName}>{item.en}</Text>
                    <Text style={styles.countryCode}>{item.dialCode}</Text>
                  </View>
                </TouchableOpacity>
              )}
            />

            {/* Close Button */}
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => {
                this.phoneInput.hideModal();
                setFilteredCountries(countries);
              }}
            >
              <Text style={styles.closeButtonText}>CLOSE</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </Modal>
    );
  };

  useEffect(() => {
    if (finalPhoneNumber) {
      validationSchema1
        .validate({ finalPhoneNumber })
        .then(() => setPhoneError(""))
        .catch((err) => setPhoneError(err.errors[0]));
    }
  }, [finalPhoneNumber]);

  useEffect(() => {
    if (finalMpesaNumber) {
      phoneNumbervalidation
        .validate({ finalMpesaNumber })
        .then(() => {
          setPhoneError2("");
        })
        .catch((err) => {
          setPhoneError2(err.errors[0]);
          console.log(err);
        });
    }
  }, [finalMpesaNumber]);

  const initialValues = {
    email: "",
    password: "",
    confirmPassword: "",
    username: "",
    phoneNumber: "",
    companyName: "",
    companyEmail: "",
    businessId: "",
    selectedPaymentMethod: "",
    paymentDetails: {
      preferredMethod: "",
      mobileMoney: {
        mpesaName: "",
        mpesaNumber: "",
        idNumber: "",
      },
      bank: {
        bankName: "",
        bankBranch: "",
        accountName: "",
        accountNumber: "",
        swiftCode: "",
        bankCode: "",
      },
      paypal: {
        email: "",
      },
    },
  };
  const stepText = {
    1: "Let’s begin your registration",
    2: "We just need a bit more info",
    3: "Almost there, final details",
    4: "Registration complete. You're all set!",
  };

  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        if (step > 1 && step !== 4) {
          handlePrevious();
        } else if (step === 4) {
          navigation.navigate("Login");
        } else {
          navigation.goBack();
        }
        return true;
      };

      BackHandler.addEventListener("hardwareBackPress", onBackPress);

      return () => {
        BackHandler.removeEventListener("hardwareBackPress", onBackPress);
      };
    }, [step, handlePrevious, navigation])
  );

  return (
    <ScrollView>
      <SafeAreaView>
        <View>
          <View style={styles.upperRow}>
            <View style={styles.upperButtons}>
              <TouchableOpacity
                onPress={() => {
                  if (step > 1) {
                    handlePrevious();
                  } else if (step === 4) {
                    navigation.navigate("Login");
                  } else {
                    navigation.goBack();
                  }
                }}
                style={[styles.backBtn, styles.buttonWrap]}
              >
                <Icon name="backbutton" size={26} />
              </TouchableOpacity>
              <Text style={styles.topheading}>Supplier SignUp</Text>
            </View>
            <View style={styles.paginationContainer}>
              <View style={styles.dot(step === 1 ? COLORS.themey : COLORS.themeg)} />
              <View style={styles.dot(step === 2 ? COLORS.themey : COLORS.themeg)} />
              <View style={styles.dot(step === 3 ? COLORS.themey : COLORS.themeg)} />
              <View style={styles.dot(step === 4 ? COLORS.themey : COLORS.themeg)} />
            </View>
            <View style={styles.stepsheader}>
              <Text style={styles.stepstext}>{stepText[step]}</Text>
            </View>
          </View>

          <Formik initialValues={initialValues} validationSchema={validationSchemas[step - 1] || validationSchemas[0]}>
            {({
              handleChange,
              handleBlur,
              handleSubmit,
              values,
              errors,
              isValid,
              setFieldTouched,
              touched,
              setFieldValue,
              validateForm,
            }) => {
              const renderStepFour = () => (
                <View style={styles.content}>
                  <SafeAreaView style={styles.contentContainer}>
                    <View style={styles.headerWrapper}>
                      <Text style={styles.header}>Registration Success</Text>
                    </View>

                    <View style={styles.animationWrapper}>
                      <LottieView
                        source={require("../assets/data/success2.json")}
                        autoPlay
                        loop={true}
                        style={styles.animation}
                      />
                    </View>

                    <View style={styles.detailsWrapper}>
                      <Text style={styles.successText}>Welcome, Please wait approval.</Text>
                    </View>
                  </SafeAreaView>
                </View>
              );
              const renderStepOne = () => (
                <View>
                  <Text style={[styles.topheading, { textAlign: "center" }]}>Account Details</Text>
                  {/* Username */}
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
                        placeholder="Account username"
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

                  {/* Email */}
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
                        placeholder="Account email"
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

                  {/* Phone */}
                  <Text style={styles.label}>Phone Number</Text>
                  <View style={[styles.input2, phoneError ? styles.errorb : styles.successb]}>
                    <IntlPhoneInput
                      ref={(ref) => (phoneInput = ref)}
                      customModal={renderCustomModal}
                      defaultCountry="KE"
                      lang="EN"
                      onChangeText={({ dialCode, unmaskedPhoneNumber }) => {
                        setFieldValue("phoneNumber", `${dialCode}${unmaskedPhoneNumber}`);
                        setfinalPhoneNumber(unmaskedPhoneNumber);
                      }}
                      flagStyle={styles.flagWidth}
                      containerStyle={styles.input22}
                    />
                  </View>

                  {/* Password */}
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
                      <TouchableOpacity onPress={() => setObsecureText(!obsecureText)}>
                        <MaterialCommunityIcons size={18} name={obsecureText ? "eye-outline" : "eye-off-outline"} />
                      </TouchableOpacity>
                    </View>
                    {touched.password && errors.password && <Text style={styles.errorMessage}>{errors.password}</Text>}
                  </View>

                  {/* Confirm Password */}
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
                      <TouchableOpacity onPress={() => setObsecureText(!obsecureText)}>
                        <MaterialCommunityIcons size={18} name={obsecureText ? "eye-outline" : "eye-off-outline"} />
                      </TouchableOpacity>
                    </View>
                    {touched.confirmPassword && errors.confirmPassword && (
                      <Text style={styles.errorMessage}>{errors.confirmPassword}</Text>
                    )}
                  </View>

                  <Button
                    title={"CONTINUE"}
                    onPress={() => handleNext(validateForm, values, errors, setStep, step, setFieldTouched)}
                    isValid={isValid}
                    loader={loader}
                  />
                  <Text style={styles.helperText}>Step {step} of 3</Text>
                </View>
              );

              const renderStepTwo = () => (
                <View>
                  <Text style={[styles.topheading, { textAlign: "center" }]}>Organization Details</Text>
                  {/* Username */}
                  <View style={styles.wrapper}>
                    <Text style={styles.label}>Company Name</Text>
                    <View style={styles.inputWrapper(touched.username ? COLORS.secondary : COLORS.offwhite)}>
                      <MaterialCommunityIcons
                        name="face-man-profile"
                        size={20}
                        style={styles.iconStyle}
                        color={COLORS.gray}
                      />
                      <TextInput
                        placeholder="Name"
                        onFocus={() => setFieldTouched("companyName")}
                        onBlur={() => setFieldTouched("companyName", "")}
                        autoCapitalize="none"
                        autoCorrect={false}
                        style={{ flex: 1 }}
                        value={values.companyName}
                        onChangeText={handleChange("companyName")}
                      />
                    </View>
                    {touched.companyName && errors.companyName && (
                      <Text style={styles.errorMessage}>{errors.companyName}</Text>
                    )}
                  </View>
                  {/* Email */}
                  <View style={styles.wrapper}>
                    <Text style={styles.label}>Company Email</Text>
                    <View style={styles.inputWrapper(touched.email ? COLORS.secondary : COLORS.offwhite)}>
                      <MaterialCommunityIcons
                        name="email-outline"
                        size={20}
                        style={styles.iconStyle}
                        color={COLORS.gray}
                      />
                      <TextInput
                        placeholder=" Email"
                        onFocus={() => setFieldTouched("companyEmail")}
                        onBlur={() => setFieldTouched("companyEmail", "")}
                        autoCapitalize="none"
                        autoCorrect={false}
                        style={{ flex: 1 }}
                        value={values.companyEmail}
                        onChangeText={handleChange("companyEmail")}
                        keyboardType="email-address"
                      />
                    </View>
                    {touched.companyEmail && errors.companyEmail && (
                      <Text style={styles.errorMessage}>{errors.companyEmail}</Text>
                    )}
                  </View>
                  {/* Address */}
                  <View style={styles.wrapper}>
                    <Text style={styles.label}>Company Address</Text>
                    <View style={styles.inputWrapper(touched.username ? COLORS.secondary : COLORS.offwhite)}>
                      <MaterialCommunityIcons name="city" size={20} style={styles.iconStyle} color={COLORS.gray} />
                      <TextInput
                        placeholder=" Address"
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
                  <Text style={styles.label}>Business Permit No </Text>
                  <View style={styles.inputWrapper(touched.businessId ? COLORS.secondary : COLORS.offwhite)}>
                    <MaterialCommunityIcons
                      name="file-document-outline"
                      size={20}
                      style={styles.iconStyle}
                      color={COLORS.gray}
                    />
                    <TextInput
                      placeholder="Enter your Tax ID"
                      onFocus={() => setFieldTouched("businessId")}
                      onBlur={() => setFieldTouched("businessId", "")}
                      autoCapitalize="characters"
                      autoCorrect={false}
                      style={{ flex: 1 }}
                      value={values.businessId}
                      onChangeText={handleChange("businessId")}
                    />
                  </View>
                  {touched.businessId && errors.businessId && (
                    <Text style={styles.errorMessage}>{errors.businessId}</Text>
                  )}

                  <Button
                    title={"N E X T   S T E P"}
                    onPress={() => handleNext(validateForm, errors, values, setStep, step, setFieldTouched)}
                    isValid={isValid}
                    loader={loader}
                  />
                  <Text style={styles.helperText}>Step {step} of 3</Text>
                </View>
              );
              const renderStepThree = () => {
                const paymentMethods = {
                  Mpesa: { label: "Mpesa", imagePath: require("../assets/images/logos/Mpesa.png") },
                  BankTransfer: { label: "BankTransfer", imagePath: require("../assets/images/logos/bank.png") },
                  PayPal: { label: "PayPal", imagePath: require("../assets/images/logos/paypal.png") },
                };

                const handlePaymentMethodChange = (method) => {
                  setSelectedPaymentMethod(method);

                  const preferredMethod =
                    method === "Mpesa" ? "mobileMoney" : method === "BankTransfer" ? "bank" : "paypal";

                  // Reset and set at once with preferredMethod baked in
                  const resetPaymentDetails = {
                    preferredMethod,
                    mobileMoney: { mpesaName: "", mpesaNumber: "", idNumber: "" },
                    bank: {
                      bankName: "",
                      bankBranch: "",
                      accountName: "",
                      accountNumber: "",
                      swiftCode: "",
                      bankCode: "",
                    },
                    paypal: { email: "" },
                  };

                  setFieldValue("paymentDetails", resetPaymentDetails);
                };

                return (
                  <View>
                    <Text style={[styles.topheading, { textAlign: "center" }]}>Payment Details</Text>

                    <Text style={styles.label}>Payment Method</Text>
                    <View style={styles.paymentMethods}>
                      {Object.entries(paymentMethods).map(([method, { label, imagePath }]) => (
                        <TouchableOpacity
                          key={method}
                          style={[
                            styles.paymentMethodButton,
                            selectedPaymentMethod === method && styles.selectedPaymentMethod,
                          ]}
                          onPress={() => handlePaymentMethodChange(method)}
                        >
                          <Image source={imagePath} style={{ height: 24, width: 48 }} />
                        </TouchableOpacity>
                      ))}
                    </View>

                    <View>
                      {touched.paymentDetails?.preferredMethod && errors.paymentDetails?.preferredMethod && (
                        <Text style={styles.errorMessage}>{errors.paymentDetails?.preferredMethod}</Text>
                      )}
                    </View>

                    {/* Mpesa Fields */}
                    {selectedPaymentMethod === "Mpesa" && (
                      <>
                        <View style={styles.wrapper}>
                          <Text style={styles.label}>Mpesa Name</Text>
                          <TextInput
                            style={styles.inputWrapper(
                              touched.paymentDetails?.mobileMoney?.mpesaName ? COLORS.secondary : COLORS.offwhite
                            )}
                            onFocus={() => setFieldTouched("paymentDetails.mobileMoney.mpesaName")}
                            onBlur={() => setFieldTouched("paymentDetails.mobileMoney.mpesaName", "")}
                            placeholder="Mpesa Name"
                            value={values.paymentDetails.mobileMoney.mpesaName || ""}
                            onChangeText={(text) => setFieldValue("paymentDetails.mobileMoney.mpesaName", text)}
                          />

                          {touched.paymentDetails?.mobileMoney?.mpesaName &&
                            errors.paymentDetails?.mobileMoney?.mpesaName && (
                              <Text style={styles.errorMessage}>{errors.paymentDetails?.mobileMoney?.mpesaName}</Text>
                            )}
                        </View>
                        <View style={styles.wrapper}>
                          <Text style={styles.label}>Mpesa Number</Text>

                          <IntlPhoneInput
                            ref={(ref) => (phoneInput = ref)}
                            customModal={renderCustomModal}
                            defaultCountry="KE"
                            lang="EN"
                            onChangeText={({ dialCode, unmaskedPhoneNumber, isVerified, phoneNumber }) => {
                              setFieldValue(
                                "paymentDetails.mobileMoney.mpesaNumber",
                                `${dialCode}${unmaskedPhoneNumber}`
                              );
                              setfinalMpesaNumber(unmaskedPhoneNumber);

                              console.log(isVerified);
                              console.log(phoneNumber);
                              console.log(unmaskedPhoneNumber);
                            }}
                            placeholder={finalMpesaNumber}
                            flagStyle={styles.flagWidth}
                            containerStyle={styles.input22}
                          />
                          {phoneError2 && <Text style={styles.errorMessage}>{phoneError2}</Text>}
                        </View>

                        <View style={styles.wrapper}>
                          <Text style={styles.label}>ID Number</Text>
                          <TextInput
                            style={styles.inputWrapper(
                              touched.paymentDetails?.mobileMoney?.idNumber ? COLORS.secondary : COLORS.offwhite
                            )}
                            placeholder="ID Number"
                            keyboardType="numeric"
                            value={values.paymentDetails.mobileMoney.idNumber}
                            onChangeText={(text) => {
                              setFieldValue("paymentDetails.mobileMoney.idNumber", text);
                            }}
                            onFocus={() => setFieldTouched("paymentDetails.mobileMoney.idNumber")}
                            onBlur={() => setFieldTouched("paymentDetails.mobileMoney.idNumber", "")}
                          />
                        </View>
                      </>
                    )}

                    {/* Bank Fields */}
                    {selectedPaymentMethod === "BankTransfer" && (
                      <>
                        <View style={styles.wrapper}>
                          <Text style={styles.label}>Bank Name</Text>
                          <TextInput
                            style={styles.inputWrapper(
                              touched.paymentDetails?.bank?.bankName ? COLORS.secondary : COLORS.offwhite
                            )}
                            placeholder="Bank Name"
                            value={values.paymentDetails.bank.bankName}
                            onChangeText={(text) => setFieldValue("paymentDetails.bank.bankName", text)}
                            onFocus={() => setFieldTouched("paymentDetails.bank.bankName")}
                            onBlur={() => setFieldTouched("paymentDetails.bank.bankName", "")}
                          />
                        </View>
                        <View style={styles.wrapper}>
                          <Text style={styles.label}>Branch</Text>
                          <TextInput
                            style={styles.inputWrapper(
                              touched.paymentDetails?.bank?.bankBranch ? COLORS.secondary : COLORS.offwhite
                            )}
                            placeholder="Bank Branch"
                            value={values.paymentDetails.bank.bankBranch}
                            onChangeText={(text) => setFieldValue("paymentDetails.bank.bankBranch", text)}
                            onFocus={() => setFieldTouched("paymentDetails.bank.bankBranch")}
                            onBlur={() => setFieldTouched("paymentDetails.bank.bankBranch", "")}
                          />
                        </View>
                        <View style={styles.wrapper}>
                          <Text style={styles.label}>Account Name</Text>
                          <TextInput
                            style={styles.inputWrapper(
                              touched.paymentDetails?.bank?.accountName ? COLORS.secondary : COLORS.offwhite
                            )}
                            placeholder="Account Name"
                            value={values.paymentDetails.bank.accountName}
                            onChangeText={(text) => setFieldValue("paymentDetails.bank.accountName", text)}
                            onFocus={() => setFieldTouched("paymentDetails.bank.accountName")}
                            onBlur={() => setFieldTouched("paymentDetails.bank.accountName", "")}
                          />
                        </View>
                        <View style={styles.wrapper}>
                          <Text style={styles.label}>Account Number</Text>
                          <TextInput
                            style={styles.inputWrapper(
                              touched.paymentDetails?.bank?.accountNumber ? COLORS.secondary : COLORS.offwhite
                            )}
                            placeholder="Account Number"
                            keyboardType="numeric"
                            value={values.paymentDetails.bank.accountNumber}
                            onChangeText={(text) => setFieldValue("paymentDetails.bank.accountNumber", text)}
                            onFocus={() => setFieldTouched("paymentDetails.bank.accountNumber")}
                            onBlur={() => setFieldTouched("paymentDetails.bank.accountNumber", "")}
                          />
                        </View>
                        <View style={styles.wrapper}>
                          <Text style={styles.label}>Swift Code</Text>
                          <TextInput
                            style={styles.inputWrapper(
                              touched.paymentDetails?.bank?.swiftCode ? COLORS.secondary : COLORS.offwhite
                            )}
                            placeholder="Swift Code"
                            value={values.paymentDetails.bank.swiftCode}
                            onChangeText={(text) => setFieldValue("paymentDetails.bank.swiftCode", text)}
                            onFocus={() => setFieldTouched("paymentDetails.bank.swiftCode")}
                            onBlur={() => setFieldTouched("paymentDetails.bank.swiftCode", "")}
                          />
                        </View>
                        <View style={styles.wrapper}>
                          <Text style={styles.label}>Bank Code</Text>
                          <TextInput
                            style={styles.inputWrapper(
                              touched.paymentDetails?.bank?.bankCode ? COLORS.secondary : COLORS.offwhite
                            )}
                            placeholder="Bank Code"
                            value={values.paymentDetails.bank.bankCode}
                            onChangeText={(text) => setFieldValue("paymentDetails.bank.bankCode", text)}
                            onFocus={() => setFieldTouched("paymentDetails.bank.bankCode")}
                            onBlur={() => setFieldTouched("paymentDetails.bank.bankCode", "")}
                          />
                        </View>
                      </>
                    )}

                    {/* PayPal Fields */}
                    {selectedPaymentMethod === "PayPal" && (
                      <>
                        <View style={styles.wrapper}>
                          <Text style={styles.label}>PayPal Email</Text>
                          <TextInput
                            style={styles.inputWrapper(
                              touched.paymentDetails?.paypal?.email ? COLORS.secondary : COLORS.offwhite
                            )}
                            placeholder="PayPal Email"
                            keyboardType="email-address"
                            value={values.paymentDetails.paypal.email}
                            onChangeText={(text) => setFieldValue("paymentDetails.paypal.email", text)}
                            onFocus={() => setFieldTouched("paymentDetails.paypal.email")}
                            onBlur={() => setFieldTouched("paymentDetails.paypal.email", "")}
                          />
                        </View>
                      </>
                    )}

                    <Button
                      title={"S I G N U P"}
                      //   onPress={isValid ? handleSubmit : inValidForm}
                      onPress={() => {
                        handleNext(validateForm, values, errors, setStep, step, setFieldTouched);

                        handleSignUp(values);
                      }}
                      isValid={isValid}
                      loader={loader}
                    />
                  </View>
                );
              };

              return (
                <View style={styles.lowerRow}>
                  {step === 1 && renderStepOne()}
                  {step === 2 && renderStepTwo()}
                  {step === 3 && renderStepThree()}
                  {step === 4 && renderStepFour()}
                </View>
              );
            }}
          </Formik>
        </View>
      </SafeAreaView>
    </ScrollView>
  );
};

export default SupplierRegister;

const styles = StyleSheet.create({
  cover: {
    height: SIZES.height / 4.8,
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
  modalContainer: {
    flex: 1,
    backgroundColor: "white",
    margin: 20,
    borderRadius: 10,
    padding: 20,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    paddingHorizontal: 10,
    height: 40,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
  },
  searchIcon: {
    fontSize: 20,
    marginLeft: 10,
  },
  countryItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  flag: {
    fontSize: 24,
    marginRight: 10,
  },
  // flagWidth: {
  //   height: 40,
  //   width: 50,
  // },
  countryName: {
    flex: 1,
    fontSize: 16,
    color: "#333",
  },
  countryCode: {
    fontSize: 16,
    color: "#888",
  },

  closeButton: {
    marginTop: 20,
    backgroundColor: "#007BFF",
    paddingVertical: 10,
    alignItems: "center",
    borderRadius: 5,
  },
  closeButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  dot: (backgroundColor) => ({
    width: 50,
    height: 7,
    backgroundColor,
    borderRadius: 15,
  }),
  paginationContainer: {
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
    gap: 10,
    height: 30,
  },
  upperRow: {
    width: SIZES.width - 20,
    marginHorizontal: SIZES.xSmall,
    flexDirection: "column",
    justifyContent: "space-between",
    alignItems: "center",
    position: "absolute",
    backgroundColor: COLORS.themew,
    borderRadius: SIZES.large,
    top: SIZES.xxSmall,
    zIndex: 999,
    minHeight: 120,
  },
  topheading: {
    fontFamily: "bold",
    fontSize: SIZES.large,
  },
  lowerRow: {
    marginTop: 140,
    backgroundColor: COLORS.themew,
    // minHeight: SIZES.height - 180,
    width: SIZES.width - 20,
    marginStart: 10,
    borderRadius: SIZES.medium,
    paddingHorizontal: 10,
    paddingVertical: 20,
  },
  upperButtons: {
    width: SIZES.width - 20,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: SIZES.xSmall,
    top: SIZES.xxSmall,
    height: SIZES.xxLarge * 1.4,
  },
  backBtn: {
    left: 10,
    position: "absolute",
    top: 3,
  },
  buttonWrap: {
    backgroundColor: COLORS.themeg,
    padding: 15,
    borderRadius: 100,
    justifyContent: "center",
    alignItems: "center",
    marginEnd: 10,
  },
  stepsheader: {
    paddingVertical: 10,
    textAlign: "left",
    justifyContent: "flex-start",
  },
  stepstext: {
    fontFamily: "regular",
    color: COLORS.gray,
  },
  paymentMethods: {
    flexDirection: "row",
    marginBottom: 16,
  },
  paymentMethodButton: {
    padding: 8,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 4,
    marginRight: 8,
  },
  selectedPaymentMethod: {
    borderColor: "#000",
  },
  content: {
    // ...StyleSheet.absoluteFillObject,
    minHeight: SIZES.height - 220,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 0,
  },
  contentContainer: {
    alignItems: "center",
    justifyContent: "center",

    borderRadius: SIZES.medium,
    padding: 20,
    width: "90%",
  },
  headerWrapper: {
    alignItems: "center",
    marginBottom: 20,
  },
  header: {
    fontSize: SIZES.xLarge,
    fontWeight: "bold",
    color: COLORS.themeb,
  },
  animationWrapper: {
    width: 200,
    height: 200,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  animation: {
    width: "100%",
    height: "100%",
  },
  detailsWrapper: {
    alignItems: "center",
  },
  successText: {
    fontSize: SIZES.medium,
    fontWeight: "600",
    color: COLORS.themeb,
    marginBottom: 10,
  },
  helperText: {
    textAlign: "center",
  },
});
