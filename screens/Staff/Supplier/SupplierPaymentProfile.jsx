import { View, Text, ScrollView, TouchableOpacity, TextInput, Alert, StyleSheet } from "react-native";
import React, { useContext, useEffect, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import BackBtn from "../../../components/BackBtn";
import { Image } from "react-native";
import Button from "../../../components/Button";
import { Formik } from "formik";
import * as Yup from "yup";
import { MaterialCommunityIcons, Ionicons } from "@expo/vector-icons";
import { COLORS, SIZES } from "../../../constants";
import axios from "axios";
import { BACKEND_PORT } from "@env";
import Toast from "react-native-toast-message";
import usePost2 from "../../../hook/usePost2";
import IntlPhoneInput from "react-native-intl-phone-input";
import { Modal } from "react-native";
import { FlatList } from "react-native-gesture-handler";
import Icon from "../../../constants/icons";

import LottieView from "lottie-react-native";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { AuthContext } from "../../../components/auth/AuthContext";
import { parsePhoneNumberFromString } from "libphonenumber-js/min";

const SupplierPaymentProfile = () => {
  const [loader, setLoader] = useState(false);
  const [Rsuccess, setRsuccess] = useState(false);
  const [obsecureText, setObsecureText] = useState(true);
  const [step, setStep] = useState(1);

  const navigation = useNavigation();
  const { userData } = useContext(AuthContext);

  const [finalPhoneNumber, setfinalPhoneNumber] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [allcountries, setallCountries] = useState([]);
  // Mode states: view vs. edit
  const [isEditing, setIsEditing] = useState(false);

  const [filteredCountries, setFilteredCountries] = useState(allcountries);

  const getPhoneMeta = (number, defaultDialCode = "+254") => {
    if (!number) {
      return {
        dialCode: `+254`,
        country: "KE",
        nationalNumber: "712345678",
        isValid: true,
      };
    }

    // If number doesn't start with +, clean + inject dial code
    const formattedNumber = number.startsWith("+") ? number : `${defaultDialCode}${number.replace(/^0/, "")}`;

    const parsed = parsePhoneNumberFromString(formattedNumber);

    if (!parsed) return null;

    return {
      dialCode: `+${parsed.countryCallingCode}`,
      country: parsed.country,
      nationalNumber: parsed.nationalNumber,
      isValid: parsed.isValid(),
    };
  };

  const phonevalidationSchema = Yup.object().shape({
    finalPhoneNumber: Yup.string()
      .min(7)
      .required("Phone number is required")
      .matches(/^\+?[0-9]+$/, "Phone number must contain only digits"),
  });

  const validationSchema = Yup.object().shape({
    preferredMethod: Yup.string().required("Select a payment method"),

    mobileMoney: Yup.object().when("preferredMethod", {
      is: "mobileMoney",
      then: () =>
        Yup.object().shape({
          mpesaName: Yup.string().required("Mpesa Name is required"),
          idNumber: Yup.string().min(6, "ID must be at least 6 digits").required("ID Number is required"),
        }),
      otherwise: () => Yup.object().notRequired(),
    }),

    bank: Yup.object().when("preferredMethod", {
      is: "bank",
      then: () =>
        Yup.object().shape({
          bankName: Yup.string().required("Bank Name is required"),
          bankBranch: Yup.string().required("Bank Branch is required"),
          accountName: Yup.string().required("Account Name is required"),
          accountNumber: Yup.string()
            .matches(/^[0-9]+$/, "Account Number must be digits only")
            .required("Account Number is required"),
          swiftCode: Yup.string().required("SWIFT Code is required"),
          bankCode: Yup.string().required("Bank Code is required"),
        }),
      otherwise: () => Yup.object().notRequired(),
    }),

    paypal: Yup.object().when("preferredMethod", {
      is: "paypal",
      then: () =>
        Yup.object().shape({
          email: Yup.string().email("Enter a valid email").required("PayPal Email is required"),
        }),
      otherwise: () => Yup.object().notRequired(),
    }),
  });

  const handleUpdatePayment = async (values) => {
    // console.log("submitting", values);

    setLoader(true);
    try {
      const endpoint = `${BACKEND_PORT}/api/v2/supplier/v4/accountpay/${userData?.supplierProfile?._id}`;

      const methodMap = {
        paypal: "PayPal",
        mobileMoney: "MobileMoney",
        bank: "BankTransfer",
      };

      // console.log("values", values);

      const data = {
        paymentDetails: {
          ...values,
          preferredMethod: methodMap[values.preferredMethod] || values.preferredMethod,
        },
      };

      // console.log("values2", data);
      const response = await axios.patch(endpoint, data);
      // console.log(response.data.paymentDetails);

      // Check response status and token first
      if (response.status !== 200 || !response.data.success) {
        Alert.alert("Error Updating", "Unexpected response. Please try again.");
        return;
      } else if (response.status === 200 && response.data.success) {
        Toast.show({
          type: "success",
          text1: "Success!",
          text2: "Your payment method was saved 🎉",
          position: "top",
          visibilityTime: 5000,
        });

        setRsuccess(true);
      }
    } catch (error) {
      // Pull the error message from the response
      const errorMsg = error.response?.data?.message || "Oops! Error Updating details. Please try again.";
      Alert.alert("Update Failure", errorMsg);
    } finally {
      setIsEditing(false);
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
      phonevalidationSchema
        .validate({ finalPhoneNumber })
        .then(() => setPhoneError(""))
        .catch((err) => {
          // console.log("fn", finalPhoneNumber);
          // console.log("f", err.errors[0]);
          setPhoneError(err.errors[0]);
        });
    }
  }, [finalPhoneNumber]);

  const PaymentDetailsScreen = () => {
    const defaultInitialValues = {
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
    };

    const [paymentDetails, setPaymentDetails] = useState(userData?.supplierProfile?.paymentDetails || {});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("");

    // Fetching payment details from API
    useEffect(() => {
      const fetchPaymentDetails = async () => {
        let routeport = `${BACKEND_PORT}/api/V2/supplier/V4/accountpay/${userData?.supplierProfile?._id}`;

        try {
          const response = await axios.get(routeport, {
            headers: { Authorization: `Bearer ${userData.TOKEN}` },
          });

          const fetchedData = response.data.paymentDetails || {};
          setPaymentDetails(fetchedData);
          if (!fetchedData || Object.keys(fetchedData).length === 0) {
            setIsEditing(true);
          }
        } catch (err) {
          setError(err.response?.data?.message || "Failed to fetch payment details");
        } finally {
          setLoading(false);
        }
      };

      if (userData && userData.TOKEN) {
        fetchPaymentDetails();
      } else {
        setLoading(false);
      }
    }, [userData?.supplierProfile?._id, userData?.TOKEN, Rsuccess]);

    // Merge fetched data with defaults (fetched values take precedence)
    const mergedInitialValues = {
      ...defaultInitialValues,
      ...paymentDetails,
    };

    // Render the form
    const renderForm = () => {
      // Payment methods options
      const paymentMethods = {
        mobileMoney: { label: "Mpesa", imagePath: require("../../../assets/images/logos/Mpesa.png") },
        bank: { label: "BankTransfer", imagePath: require("../../../assets/images/logos/bank.png") },
        paypal: { label: "PayPal", imagePath: require("../../../assets/images/logos/paypal.png") },
      };

      const handlePaymentMethodChange = (method, setFieldValue) => {
        setSelectedPaymentMethod(method);
        const preferredMethod = method;

        setFieldValue("preferredMethod", preferredMethod);
      };

      return (
        <Formik
          enableReinitialize // so when mergedInitialValues updates, form updates too.
          initialValues={mergedInitialValues}
          validationSchema={validationSchema}
          onSubmit={(values) => {
            // console.log("Submitted values:", values);

            handleUpdatePayment(values);
          }}
        >
          {({
            handleChange,
            handleBlur,
            handleSubmit,
            values,
            errors,
            isValid,
            setFieldTouched,
            setFieldValue,
            touched,
            validateForm,
          }) => (
            <View>
              <Text style={[styles.topheading, { textAlign: "center" }]}>Payment Details</Text>

              {/* Payment Method Selection */}
              <Text style={styles.label}>Payment Method</Text>
              <View style={styles.paymentMethods}>
                {Object.entries(paymentMethods).map(([method, { label, imagePath }]) => (
                  <TouchableOpacity
                    key={method}
                    style={[
                      styles.paymentMethodButton,
                      selectedPaymentMethod === method && styles.selectedPaymentMethod,
                    ]}
                    onPress={() => handlePaymentMethodChange(method, setFieldValue)}
                  >
                    <Image source={imagePath} style={{ height: 24, width: 48 }} />
                  </TouchableOpacity>
                ))}
              </View>
              {/* Field rendering for specific payment methods */}
              {selectedPaymentMethod === "mobileMoney" && (
                <>
                  <View style={styles.wrapper}>
                    <Text style={styles.label}>Mpesa Name</Text>
                    <TextInput
                      style={styles.inputWrapper(touched.mobileMoney?.mpesaName ? COLORS.secondary : COLORS.offwhite)}
                      onFocus={() => setFieldTouched("mobileMoney.mpesaName")}
                      onBlur={() => setFieldTouched("mobileMoney.mpesaName", "")}
                      placeholder="Mpesa Name"
                      value={values.mobileMoney.mpesaName}
                      onChangeText={(text) => setFieldValue("mobileMoney.mpesaName", text)}
                    />

                    {touched.mobileMoney?.mpesaName && errors.mobileMoney?.mpesaName && (
                      <Text style={styles.errorMessage}>{errors.mobileMoney?.mpesaName}</Text>
                    )}
                  </View>

                  <View style={styles.wrapper}>
                    <Text style={styles.label}>Mpesa Number</Text>

                    {phoneError && <Text style={styles.errorMessage}>{phoneError}</Text>}

                    <View style={!phoneError ? styles.noError : styles.focused}>
                      <IntlPhoneInput
                        placeholder={getPhoneMeta(values?.mobileMoney?.mpesaNumber)?.nationalNumber || ""}
                        ref={(ref) => (phoneInput = ref)}
                        customModal={renderCustomModal}
                        defaultCountry={getPhoneMeta(values?.mobileMoney.mpesaNumber)?.country || ""}
                        lang="EN"
                        value={values.mobileMoney.mpesaNumber}
                        onChangeText={({ dialCode, unmaskedPhoneNumber }) => {
                          setFieldValue("mobileMoney.mpesaNumber", `${dialCode}${unmaskedPhoneNumber}`);

                          setfinalPhoneNumber(`${dialCode}${unmaskedPhoneNumber}`);

                          if (phoneError) {
                            setFieldTouched("mobileMoney.mpesaNumber");
                          }
                        }}
                        flagStyle={styles.flagWidth}
                        containerStyle={styles.input22}
                      />
                    </View>

                    {touched.mobileMoney?.mpesaNumber && errors.mobileMoney?.mpesaNumber && (
                      <Text style={styles.errorMessage}>{errors.mobileMoney?.mpesaNumber}</Text>
                    )}
                  </View>
                  <View style={styles.wrapper}>
                    <Text style={styles.label}>ID Number</Text>
                    <TextInput
                      style={styles.inputWrapper(touched.mobileMoney?.idNumber ? COLORS.secondary : COLORS.offwhite)}
                      placeholder="ID Number"
                      keyboardType="numeric"
                      value={values.mobileMoney.idNumber}
                      onChangeText={(text) => setFieldValue("mobileMoney.idNumber", text)}
                    />
                    {touched.mobileMoney?.idNumber && errors.mobileMoney?.idNumber && (
                      <Text style={styles.errorMessage}>{errors.mobileMoney?.idNumber}</Text>
                    )}
                  </View>
                </>
              )}
              {selectedPaymentMethod === "bank" && (
                <>
                  <View style={styles.wrapper}>
                    <Text style={styles.label}>Bank Name</Text>
                    <TextInput
                      style={styles.inputWrapper(touched?.bank?.bankName ? COLORS.secondary : COLORS.offwhite)}
                      placeholder="Bank Name"
                      value={values.bank?.bankName}
                      onChangeText={(text) => setFieldValue("bank.bankName", text)}
                    />

                    {touched.bank?.bankName && errors.bank?.bankName && (
                      <Text style={styles.errorMessage}>{errors.bank?.bankName}</Text>
                    )}
                  </View>
                  <View style={styles.wrapper}>
                    <Text style={styles.label}>Branch</Text>
                    <TextInput
                      style={styles.inputWrapper(touched?.bank?.bankBranch ? COLORS.secondary : COLORS.offwhite)}
                      placeholder="Bank Branch"
                      value={values.bank.bankBranch}
                      onChangeText={(text) => setFieldValue("bank.bankBranch", text)}
                    />

                    {touched.bank?.bankBranch && errors.bank?.bankBranch && (
                      <Text style={styles.errorMessage}>{errors.bank?.bankBranch}</Text>
                    )}
                  </View>
                  <View style={styles.wrapper}>
                    <Text style={styles.label}>Account Name</Text>
                    <TextInput
                      style={styles.inputWrapper(touched.bank?.accountName ? COLORS.secondary : COLORS.offwhite)}
                      placeholder="Account Name"
                      value={values?.bank?.accountName}
                      onChangeText={(text) => setFieldValue("bank.accountName", text)}
                      onFocus={() => setFieldTouched("bank.accountName")}
                      onBlur={() => setFieldTouched("bank.accountName", "")}
                    />
                    {touched.bank?.accountName && errors.bank?.accountName && (
                      <Text style={styles.errorMessage}>{errors.bank?.accountName}</Text>
                    )}
                  </View>
                  <View style={styles.wrapper}>
                    <Text style={styles.label}>Account Number</Text>
                    <TextInput
                      style={styles.inputWrapper(touched.bank?.accountNumber ? COLORS.secondary : COLORS.offwhite)}
                      placeholder="Account Number"
                      keyboardType="numeric"
                      value={values.bank.accountNumber}
                      onChangeText={(text) => setFieldValue("bank.accountNumber", text)}
                      onFocus={() => setFieldTouched("bank.accountNumber")}
                      onBlur={() => setFieldTouched("bank.accountNumber", "")}
                    />
                    {touched.bank?.accountNumber && errors.bank?.accountNumber && (
                      <Text style={styles.errorMessage}>{errors.bank?.accountNumber}</Text>
                    )}
                  </View>
                  <View style={styles.wrapper}>
                    <Text style={styles.label}>Swift Code</Text>
                    <TextInput
                      style={styles.inputWrapper(touched.bank?.swiftCode ? COLORS.secondary : COLORS.offwhite)}
                      placeholder="Swift Code"
                      value={values.bank.swiftCode}
                      onChangeText={(text) => setFieldValue("bank.swiftCode", text)}
                      onFocus={() => setFieldTouched("bank.swiftCode")}
                      onBlur={() => setFieldTouched("bank.swiftCode", "")}
                    />
                    {touched.bank?.swiftCode && errors.bank?.swiftCode && (
                      <Text style={styles.errorMessage}>{errors.bank?.swiftCode}</Text>
                    )}
                  </View>
                  <View style={styles.wrapper}>
                    <Text style={styles.label}>Bank Code</Text>
                    <TextInput
                      style={styles.inputWrapper(touched.bank?.bankCode ? COLORS.secondary : COLORS.offwhite)}
                      placeholder="Bank Code"
                      value={values.bank.bankCode}
                      onChangeText={(text) => setFieldValue("bank.bankCode", text)}
                      onFocus={() => setFieldTouched("bank.bankCode")}
                      onBlur={() => setFieldTouched("bank.bankCode", "")}
                    />
                    {touched.bank?.bankCode && errors.bank?.bankCode && (
                      <Text style={styles.errorMessage}>{errors.bank?.bankCode}</Text>
                    )}
                  </View>
                </>
              )}
              {selectedPaymentMethod === "paypal" && (
                <>
                  <View style={styles.wrapper}>
                    <Text style={styles.label}>PayPal Email</Text>
                    <TextInput
                      style={styles.inputWrapper(touched?.paypal?.email ? COLORS.secondary : COLORS.offwhite)}
                      placeholder="PayPal Email"
                      keyboardType="email-address"
                      value={values.paypal.email}
                      onChangeText={(text) => setFieldValue("paypal.email", text)}
                    />

                    {touched.paypal?.email && errors.paypal?.email && (
                      <Text style={styles.errorMessage}>{errors.paypal?.email}</Text>
                    )}
                  </View>
                </>
              )}

              <Button
                title="SUBMIT"
                onPress={async () => {
                  // console.log("submit values", values);
                  // console.log("initial values", mergedInitialValues);

                  const mergedValues = {
                    ...mergedInitialValues,
                    [values.preferredMethod]: values[values.preferredMethod],
                    preferredMethod: values.preferredMethod,
                  };

                  // console.log("Merged values:", mergedValues);

                  try {
                    // Validate merged values
                    await validationSchema.validate(mergedValues, { abortEarly: false });

                    if (values.preferredMethod === "mobileMoney" && phoneError) {
                    } else {
                      handleSubmit(mergedValues);
                    }

                    // If valid, submit

                    // console.log("passed");
                  } catch (validationError) {
                    // Show form-level errors (can be shown using Formik's setErrors too if you're using Formik)
                    console.log("Validation failed:", validationError);

                    if (validationError.inner) {
                      validationError.inner.forEach((err) => {
                        console.log(`Field: ${err.path}, Error: ${err.message}`);

                        setFieldTouched(err.path);
                      });
                    }
                  }
                }}
                isValid={isValid}
                loader={false}
              />
            </View>
          )}
        </Formik>
      );
    };

    // Render a read-only summary view when not editing
    const renderViewMode = () => {
      // console.log(paymentDetails);
      const paymentMethods = {
        MobileMoney: { label: "Mpesa", imagePath: require("../../../assets/images/logos/Mpesa.png") },
        BankTransfer: { label: "BankTransfer", imagePath: require("../../../assets/images/logos/bank.png") },
        PayPal: { label: "PayPal", imagePath: require("../../../assets/images/logos/paypal.png") },
      };
      return (
        <View style={styles.viewContainer}>
          <Text style={styles.topheading}>Payment Details Summary</Text>
          {paymentDetails?.preferredMethod ? (
            <>
              <View style={styles.paymentMethods}>
                {(() => {
                  const selected = Object.entries(paymentMethods).find(
                    ([method]) => method.toLowerCase() === paymentDetails.preferredMethod.toLowerCase()
                  );

                  if (!selected) return null;

                  const [method, { label, imagePath }] = selected;

                  return (
                    <TouchableOpacity style={[styles.paymentMethodButton, styles.selectedPaymentMethod]}>
                      <Image source={imagePath} style={{ height: 24, width: 48 }} />
                    </TouchableOpacity>
                  );
                })()}
              </View>
              {paymentDetails.preferredMethod === "MobileMoney" && (
                <>
                  <View style={styles.wrapper}>
                    <Text style={styles.label}>Mpesa Name</Text>
                    <TextInput
                      style={styles.inputWrapper(COLORS.offwhite)}
                      placeholder="Mpesa Name"
                      value={paymentDetails?.mobileMoney?.mpesaName || ""}
                      editable={false}
                    />
                  </View>

                  <View style={styles.wrapper}>
                    <Text style={styles.label}>Mpesa Number</Text>
                    <TextInput
                      style={styles.inputWrapper(COLORS.offwhite)}
                      placeholder="Mpesa Number"
                      keyboardType="numeric"
                      value={paymentDetails?.mobileMoney?.mpesaNumber || ""}
                      editable={false}
                    />
                  </View>

                  <View style={styles.wrapper}>
                    <Text style={styles.label}>ID Number</Text>
                    <TextInput
                      style={styles.inputWrapper(COLORS.offwhite)}
                      placeholder="ID Number"
                      keyboardType="numeric"
                      value={paymentDetails?.mobileMoney?.idNumber}
                      editable={false}
                    />
                  </View>
                </>
              )}
              {paymentDetails.preferredMethod === "BankTransfer" && (
                <>
                  <View style={styles.wrapper}>
                    <Text style={styles.label}>Bank Name</Text>
                    <TextInput
                      style={styles.inputWrapper(COLORS.offwhite)}
                      placeholder="Bank Name"
                      value={paymentDetails?.bank?.bankName}
                      editable={false}
                    />
                  </View>
                  <View style={styles.wrapper}>
                    <Text style={styles.label}>Branch</Text>
                    <TextInput
                      style={styles.inputWrapper(COLORS.offwhite)}
                      placeholder="Bank Branch"
                      value={paymentDetails?.bank?.bankBranch}
                      editable={false}
                    />
                  </View>
                  <View style={styles.wrapper}>
                    <Text style={styles.label}>Account Name</Text>
                    <TextInput
                      style={styles.inputWrapper(COLORS.offwhite)}
                      placeholder="Account Name"
                      value={paymentDetails?.bank?.accountName}
                      editable={false}
                    />
                  </View>
                  <View style={styles.wrapper}>
                    <Text style={styles.label}>Account Number</Text>
                    <TextInput
                      style={styles.inputWrapper(COLORS.offwhite)}
                      placeholder="Account Number"
                      keyboardType="numeric"
                      value={paymentDetails?.bank?.accountNumber}
                      editable={false}
                    />
                  </View>
                  <View style={styles.wrapper}>
                    <Text style={styles.label}>Swift Code</Text>
                    <TextInput
                      style={styles.inputWrapper(COLORS.offwhite)}
                      placeholder="Swift Code"
                      value={paymentDetails?.bank?.swiftCode}
                      editable={false}
                    />
                  </View>
                  <View style={styles.wrapper}>
                    <Text style={styles.label}>Bank Code</Text>
                    <TextInput
                      style={styles.inputWrapper(COLORS.offwhite)}
                      placeholder="Bank Code"
                      value={paymentDetails?.bank?.bankCode}
                      editable={false}
                    />
                  </View>
                </>
              )}
              {paymentDetails.preferredMethod === "PayPal" && (
                <>
                  <View style={styles.wrapper}>
                    <Text style={styles.label}>PayPal Email</Text>
                    <TextInput
                      style={styles.inputWrapper(COLORS.offwhite)}
                      placeholder="PayPal Email"
                      keyboardType="email-address"
                      value={paymentDetails?.paypal?.email}
                      editable={false}
                    />
                  </View>
                </>
              )}
            </>
          ) : (
            <Text>No payment details provided.</Text>
          )}
        </View>
      );
    };

    if (loading)
      return (
        <View style={styles.containLottie}>
          <View style={styles.animationWrapper}>
            <LottieView source={require("../../../assets/data/loading.json")} autoPlay loop style={styles.animation} />
          </View>
          <View style={{ marginTop: -20, paddingBottom: 10 }}>
            <Text style={{ fontFamily: "GtAlpine", fontSize: SIZES.medium }}> Nothing to see here</Text>
          </View>
        </View>
      );
    if (error)
      return (
        <View style={styles.containLottie}>
          <View style={styles.animationWrapper}>
            <LottieView
              source={require("../../../assets/data/failed.json")}
              autoPlay
              loop={false}
              style={styles.animation}
            />
          </View>
          <View style={{ marginTop: -20, paddingBottom: 10 }}>
            <Text style={{ fontFamily: "GtAlpine", fontSize: SIZES.medium }}>{error}</Text>
          </View>
        </View>
      );

    // If there is data and user is not editing, show summary; otherwise, show form
    return (
      <ScrollView>
        <SafeAreaView>
          <View style={styles.container}>{isEditing ? renderForm() : renderViewMode()}</View>
        </SafeAreaView>
      </ScrollView>
    );
  };

  return (
    <ScrollView>
      <SafeAreaView>
        <View>
          <View style={styles.upperRow}>
            <View style={styles.upperButtons}>
              <TouchableOpacity
                onPress={() => {
                  navigation.goBack();
                }}
                style={[styles.backBtn, styles.buttonWrap]}
              >
                <Icon name="backbutton" size={26} />
              </TouchableOpacity>
              <Text style={styles.topheading}>Payment Details</Text>
            </View>

            <View style={styles.stepsheader}>
              <Text style={styles.stepstext}>Manage payment details below</Text>
            </View>
          </View>
          <View style={styles.lowerRow}>
            <TouchableOpacity
              onPress={() => setIsEditing(!isEditing)}
              style={[styles.backBtn2, styles.buttonWrap, styles.editButton2]}
            >
              <Icon name="pencil" size={27} />
            </TouchableOpacity>
            {PaymentDetailsScreen()}
          </View>
        </View>
      </SafeAreaView>
    </ScrollView>
  );
};

export default SupplierPaymentProfile;

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
  backBtn2: {
    // left: 10,
    // position: "absolute",
    // top: 3,
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
  editButton2: {
    width: 60,
    left: SIZES.width - 100,
  },
  containLottie: {
    justifyContent: "center",
    alignItems: "center",
    width: SIZES.width - 20,
    flex: 1,
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
  containerx: {
    flex: 1,
    paddingTop: 26,
  },
  focused: {
    borderWidth: 1,
    borderColor: COLORS.red,
    borderRadius: 10,
  },
  noError: {
    borderWidth: 1,
    borderColor: COLORS.green,
    borderRadius: 10,
  },
});
