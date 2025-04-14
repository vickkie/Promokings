import { View, Text, ScrollView, TouchableOpacity, TextInput, Alert, StyleSheet } from "react-native";
import React, { useEffect, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import BackBtn from "../../../components/BackBtn";
import { Image } from "react-native";
import Button from "../../../components/Button";
import { Formik, useFormik, validateYupSchema } from "formik";
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
import { useFocusEffect } from "@react-navigation/native";
import { BackHandler } from "react-native";
import { useCallback } from "react";

const SupplierPaymentProfile = ({ navigation }) => {
  const [loader, setLoader] = useState(false);
  const [obsecureText, setObsecureText] = useState(true);
  const [step, setStep] = useState(1);
  const [Rsuccess, setRsuccess] = useState(false);

  const [finalPhoneNumber, setfinalPhoneNumber] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [allcountries, setallCountries] = useState([]);

  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("BankTransfer");

  const [filteredCountries, setFilteredCountries] = useState(allcountries);

  const validationSchema = Yup.object().shape({
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
      mpesaNumber: Yup.string().matches(/^[0-9]{10}$/, "Mpesa Number must be 10 digits"),
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

  const handleSignUp = async (values) => {
    setLoader(true);
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
      validationSchema
        .validate({ finalPhoneNumber })
        .then(() => setPhoneError(""))
        .catch((err) => setPhoneError(err.errors[0]));
    }
  }, [finalPhoneNumber]);

  const initialValues = {
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

  const PaymentDetailsScreen = ({ navigation, userData }) => {
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

    // Mode states: view vs. edit
    const [isEditing, setIsEditing] = useState(false);
    const [paymentDetails, setPaymentDetails] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    // For handling current payment method (e.g., "Mpesa", "BankTransfer", "PayPal")
    const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("");

    // Fetching payment details from API
    useEffect(() => {
      const fetchPaymentDetails = async () => {
        let routeport = `${BACKEND_PORT}/api/V2/supplier/V4/accountpay/${userData?.supplierProfile?._id}`;
        try {
          const response = await axios.get(routeport, {
            headers: { Authorization: `Bearer ${userData.token}` },
          });
          // Use fetched details or default object
          const fetchedData = response.data.paymentDetails || {};
          setPaymentDetails(fetchedData);
          // If there's no data, we already want to show the form
          if (!fetchedData || Object.keys(fetchedData).length === 0) {
            setIsEditing(true);
          }
        } catch (err) {
          setError(err.response?.data?.message || "Failed to fetch payment details");
        } finally {
          setLoading(false);
        }
      };

      if (userData && userData.token) {
        fetchPaymentDetails();
      } else {
        setLoading(false);
      }
    }, [userData?.supplierProfile?._id, userData?.token]);

    // Merge fetched data with defaults (fetched values take precedence)
    const mergedInitialValues = {
      ...defaultInitialValues,
      ...paymentDetails,
    };

    // Render the form
    const renderForm = () => {
      // Payment methods options
      const paymentMethods = {
        Mpesa: { label: "Mpesa", imagePath: require("../../../assets/images/logos/Mpesa.png") },
        BankTransfer: { label: "BankTransfer", imagePath: require("../../../assets/images/logos/bank.png") },
        PayPal: { label: "PayPal", imagePath: require("../../../assets/images/logos/paypal.png") },
      };

      const handlePaymentMethodChange = (method, setFieldValue) => {
        setSelectedPaymentMethod(method);
        const preferredMethod = method === "Mpesa" ? "mobileMoney" : method === "BankTransfer" ? "bank" : "paypal";
        // Reset payment details based on preferred method. This lets you clear the other sections.
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
        <Formik
          enableReinitialize // so when mergedInitialValues updates, form updates too.
          initialValues={mergedInitialValues}
          validationSchema={validationSchema}
          onSubmit={(values) => {
            // handleSignUp or update logic here
            console.log("Submitted values:", values);
          }}
        >
          {({ handleChange, handleBlur, handleSubmit, values, errors, isValid, setFieldTouched, setFieldValue }) => (
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
              {selectedPaymentMethod === "Mpesa" && (
                <>
                  <View style={styles.wrapper}>
                    <Text style={styles.label}>Mpesa Name</Text>
                    <TextInput
                      style={styles.inputWrapper(errors?.mobileMoney?.mpesaName ? COLORS.secondary : COLORS.offwhite)}
                      onFocus={() => setFieldTouched("mobileMoney.mpesaName")}
                      onBlur={() => setFieldTouched("mobileMoney.mpesaName", "")}
                      placeholder="Mpesa Name"
                      value={values.mobileMoney.mpesaName}
                      onChangeText={(text) => setFieldValue("mobileMoney.mpesaName", text)}
                    />
                  </View>
                  <View style={styles.wrapper}>
                    <Text style={styles.label}>Mpesa Number</Text>
                    <TextInput
                      style={styles.inputWrapper(errors?.mobileMoney?.mpesaNumber ? COLORS.secondary : COLORS.offwhite)}
                      placeholder="Mpesa Number"
                      keyboardType="numeric"
                      value={values.mobileMoney.mpesaNumber}
                      onChangeText={(text) => setFieldValue("mobileMoney.mpesaNumber", text)}
                    />
                  </View>
                  <View style={styles.wrapper}>
                    <Text style={styles.label}>ID Number</Text>
                    <TextInput
                      style={styles.inputWrapper(errors?.mobileMoney?.idNumber ? COLORS.secondary : COLORS.offwhite)}
                      placeholder="ID Number"
                      keyboardType="numeric"
                      value={values.mobileMoney.idNumber}
                      onChangeText={(text) => setFieldValue("mobileMoney.idNumber", text)}
                    />
                  </View>
                </>
              )}
              {selectedPaymentMethod === "BankTransfer" && (
                <>
                  <View style={styles.wrapper}>
                    <Text style={styles.label}>Bank Name</Text>
                    <TextInput
                      style={styles.inputWrapper(errors?.bank?.bankName ? COLORS.secondary : COLORS.offwhite)}
                      placeholder="Bank Name"
                      value={values.bank.bankName}
                      onChangeText={(text) => setFieldValue("bank.bankName", text)}
                    />
                  </View>
                  <View style={styles.wrapper}>
                    <Text style={styles.label}>Branch</Text>
                    <TextInput
                      style={styles.inputWrapper(errors?.bank?.bankBranch ? COLORS.secondary : COLORS.offwhite)}
                      placeholder="Bank Branch"
                      value={values.bank.bankBranch}
                      onChangeText={(text) => setFieldValue("bank.bankBranch", text)}
                    />
                  </View>
                  {/* Continue with remaining bank fields */}
                </>
              )}
              {selectedPaymentMethod === "PayPal" && (
                <>
                  <View style={styles.wrapper}>
                    <Text style={styles.label}>PayPal Email</Text>
                    <TextInput
                      style={styles.inputWrapper(errors?.paypal?.email ? COLORS.secondary : COLORS.offwhite)}
                      placeholder="PayPal Email"
                      keyboardType="email-address"
                      value={values.paypal.email}
                      onChangeText={(text) => setFieldValue("paypal.email", text)}
                    />
                  </View>
                </>
              )}

              <Button title="SUBMIT" onPress={handleSubmit} isValid={isValid} loader={false} />
            </View>
          )}
        </Formik>
      );
    };

    // Render a read-only summary view when not editing
    const renderViewMode = () => {
      return (
        <View style={styles.viewContainer}>
          <Text style={styles.topheading}>Payment Details Summary</Text>
          {paymentDetails?.preferredMethod ? (
            <>
              <Text style={styles.detailText}>Preferred Method: {paymentDetails.preferredMethod}</Text>
              {/* Customize and display based on the selected method */}
              {paymentDetails.preferredMethod === "mobileMoney" && (
                <>
                  <Text style={styles.detailText}>Mpesa Name: {paymentDetails.mobileMoney?.mpesaName}</Text>
                  <Text style={styles.detailText}>Mpesa Number: {paymentDetails.mobileMoney?.mpesaNumber}</Text>
                </>
              )}
              {paymentDetails.preferredMethod === "bank" && (
                <>
                  <Text style={styles.detailText}>Bank Name: {paymentDetails.bank?.bankName}</Text>
                  <Text style={styles.detailText}>Account Number: {paymentDetails.bank?.accountNumber}</Text>
                </>
              )}
              {paymentDetails.preferredMethod === "paypal" && (
                <Text style={styles.detailText}>PayPal Email: {paymentDetails.paypal?.email}</Text>
              )}
            </>
          ) : (
            <Text>No payment details provided.</Text>
          )}

          <TouchableOpacity onPress={() => setIsEditing(true)} style={styles.editButton}>
            <Text style={styles.editButtonText}>Edit</Text>
          </TouchableOpacity>
        </View>
      );
    };

    if (loading) return <Text>Loading...</Text>;
    if (error) return <Text>{error}</Text>;

    // If there is data and user is not editing, show summary; otherwise, show form
    return (
      <ScrollView>
        <SafeAreaView>
          <View style={styles.container}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={[styles.backBtn, styles.buttonWrap]}>
              <Icon name="backbutton" size={26} />
            </TouchableOpacity>
            {isEditing ? renderForm() : renderViewMode()}
          </View>
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

          <Formik initialValues={initialValues} validationSchema={validationSchema}>
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
              const renderStepThree = () => {
                const paymentMethods = {
                  Mpesa: { label: "Mpesa", imagePath: require("../../../assets/images/logos/Mpesa.png") },
                  BankTransfer: { label: "BankTransfer", imagePath: require("../../../assets/images/logos/bank.png") },
                  PayPal: { label: "PayPal", imagePath: require("../../../assets/images/logos/paypal.png") },
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
                      {touched.preferredMethod && errors.preferredMethod && (
                        <Text style={styles.errorMessage}>{errors.preferredMethod}</Text>
                      )}
                    </View>

                    {/* Mpesa Fields */}
                    {selectedPaymentMethod === "Mpesa" && (
                      <>
                        <View style={styles.wrapper}>
                          <Text style={styles.label}>Mpesa Name</Text>
                          <TextInput
                            style={styles.inputWrapper(
                              touched.mobileMoney?.mpesaName ? COLORS.secondary : COLORS.offwhite
                            )}
                            onFocus={() => setFieldTouched("mobileMoney.mpesaName")}
                            onBlur={() => setFieldTouched("mobileMoney.mpesaName", "")}
                            placeholder="Mpesa Name"
                            value={values.mobileMoney.mpesaName || ""}
                            onChangeText={(text) => setFieldValue("mobileMoney.mpesaName", text)}
                          />

                          {touched.mobileMoney?.mpesaName && errors.mobileMoney?.mpesaName && (
                            <Text style={styles.errorMessage}>{errors.mobileMoney?.mpesaName}</Text>
                          )}
                        </View>
                        <View style={styles.wrapper}>
                          <Text style={styles.label}>Mpesa Number</Text>
                          <TextInput
                            style={styles.inputWrapper(
                              touched.mobileMoney?.mpesaNumber ? COLORS.secondary : COLORS.offwhite
                            )}
                            placeholder="Mpesa Number"
                            keyboardType="numeric"
                            value={values.mobileMoney.mpesaNumber || ""}
                            onChangeText={(text) => setFieldValue("mobileMoney.mpesaNumber", text)}
                            onFocus={() => setFieldTouched("mobileMoney.mpesaNumber")}
                            onBlur={() => setFieldTouched("mobileMoney.mpesaNumber", "")}
                          />
                          {touched.mobileMoney?.mpesaNumber && errors.mobileMoney?.mpesaNumber && (
                            <Text style={styles.errorMessage}>{errors.mobileMoney?.mpesaNumber}</Text>
                          )}
                        </View>

                        <View style={styles.wrapper}>
                          <Text style={styles.label}>ID Number</Text>
                          <TextInput
                            style={styles.inputWrapper(
                              touched.mobileMoney?.idNumber ? COLORS.secondary : COLORS.offwhite
                            )}
                            placeholder="ID Number"
                            keyboardType="numeric"
                            value={values.mobileMoney.idNumber}
                            onChangeText={(text) => {
                              setFieldValue("mobileMoney.idNumber", text);
                            }}
                            onFocus={() => setFieldTouched("mobileMoney.idNumber")}
                            onBlur={() => setFieldTouched("mobileMoney.idNumber", "")}
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
                            style={styles.inputWrapper(touched.bank?.bankName ? COLORS.secondary : COLORS.offwhite)}
                            placeholder="Bank Name"
                            value={values.bank.bankName}
                            onChangeText={(text) => setFieldValue("bank.bankName", text)}
                            onFocus={() => setFieldTouched("bank.bankName")}
                            onBlur={() => setFieldTouched("bank.bankName", "")}
                          />
                        </View>
                        <View style={styles.wrapper}>
                          <Text style={styles.label}>Branch</Text>
                          <TextInput
                            style={styles.inputWrapper(touched.bank?.bankBranch ? COLORS.secondary : COLORS.offwhite)}
                            placeholder="Bank Branch"
                            value={values.bank.bankBranch}
                            onChangeText={(text) => setFieldValue("bank.bankBranch", text)}
                            onFocus={() => setFieldTouched("bank.bankBranch")}
                            onBlur={() => setFieldTouched("bank.bankBranch", "")}
                          />
                        </View>
                        <View style={styles.wrapper}>
                          <Text style={styles.label}>Account Name</Text>
                          <TextInput
                            style={styles.inputWrapper(touched.bank?.accountName ? COLORS.secondary : COLORS.offwhite)}
                            placeholder="Account Name"
                            value={values.bank.accountName}
                            onChangeText={(text) => setFieldValue("bank.accountName", text)}
                            onFocus={() => setFieldTouched("bank.accountName")}
                            onBlur={() => setFieldTouched("bank.accountName", "")}
                          />
                        </View>
                        <View style={styles.wrapper}>
                          <Text style={styles.label}>Account Number</Text>
                          <TextInput
                            style={styles.inputWrapper(
                              touched.bank?.accountNumber ? COLORS.secondary : COLORS.offwhite
                            )}
                            placeholder="Account Number"
                            keyboardType="numeric"
                            value={values.bank.accountNumber}
                            onChangeText={(text) => setFieldValue("bank.accountNumber", text)}
                            onFocus={() => setFieldTouched("bank.accountNumber")}
                            onBlur={() => setFieldTouched("bank.accountNumber", "")}
                          />
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
                        </View>
                      </>
                    )}

                    {/* PayPal Fields */}
                    {selectedPaymentMethod === "PayPal" && (
                      <>
                        <View style={styles.wrapper}>
                          <Text style={styles.label}>PayPal Email</Text>
                          <TextInput
                            style={styles.inputWrapper(touched.paypal?.email ? COLORS.secondary : COLORS.offwhite)}
                            placeholder="PayPal Email"
                            keyboardType="email-address"
                            value={values.paypal.email}
                            onChangeText={(text) => setFieldValue("paypal.email", text)}
                            onFocus={() => setFieldTouched("paypal.email")}
                            onBlur={() => setFieldTouched("paypal.email", "")}
                          />
                        </View>
                      </>
                    )}

                    <Button
                      title={"S U B M I T"}
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

              return <View style={styles.lowerRow}>{renderStepThree()}</View>;
            }}
          </Formik>
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
