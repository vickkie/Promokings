import React, { useState } from "react";
import { View, Text, TextInput, Button, StyleSheet, TouchableOpacity, Image } from "react-native";
import { useFormik } from "formik";
import * as Yup from "yup";
import { COLORS, SIZES } from "../constants";
import Icon from "../constants/icons";

const paymentMethods = {
  Mpesa: { label: "Mpesa", imagePath: require("../assets/images/logos/Mpesa.png") },
  Visa: { label: "Visa", imagePath: require("../assets/images/logos/visa.png") },
  MasterCard: { label: "MasterCard", imagePath: require("../assets/images/logos/mastercard.png") },
  PayPal: { label: "PayPal", imagePath: require("../assets/images/logos/paypal.png") },
};

const CheckoutStep3 = ({ phoneNumber, email, totalAmount, handleSubmitOrder }) => {
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("MasterCard");

  const paymentValidationSchema = Yup.object().shape({
    selectedPaymentMethod: Yup.string()
      .required("Select a payment method")
      .test("hasValidPaymentDetails", "Please fill all required fields for selected payment method", function (value) {
        const { parent } = this;
        console.log("parent", parent.selectedPaymentMethod);

        switch (value) {
          case "MasterCard":
            return parent.cardNumber && parent.email && parent.cvv && parent.cardNumber && parent.expiryDate;
          case "Visa":
            return parent.cardNumber && parent.email && parent.cvv && parent.cardNumber && parent.expiryDate;
          case "PayPal":
            return parent.email;
          case "Mpesa":
            return parent.email && parent.phoneNumber;
          default:
            return false;
        }
      }),
    email: Yup.string().email("Invalid email").required("Required"),
    nameOnCard: Yup.string().when("selectedPaymentMethod", (selectedPaymentMethod, schema) =>
      ["Visa", "MasterCard"].includes(selectedPaymentMethod) ? schema.required("Required") : schema.notRequired()
    ),
    cardNumber: Yup.string().when("selectedPaymentMethod", (selectedPaymentMethod, schema) =>
      ["Visa", "MasterCard"].includes(selectedPaymentMethod)
        ? schema.matches(/^\d{10,16}$/, "Card number must be 16 digits").required("Required")
        : schema.notRequired()
    ),
    expiryDate: Yup.string().when("selectedPaymentMethod", (selectedPaymentMethod, schema) =>
      ["Visa", "MasterCard"].includes(selectedPaymentMethod)
        ? schema.matches(/^(0[1-9]|1[0-2])\/\d{2}$/, "Invalid expiry date").required("Required")
        : schema.notRequired()
    ),
    cvv: Yup.string().when("selectedPaymentMethod", (selectedPaymentMethod, schema) =>
      ["Visa", "MasterCard"].includes(selectedPaymentMethod)
        ? schema.matches(/^\d{3,4}$/, "Invalid CVV").required("Required")
        : schema.notRequired()
    ),
  });

  const formik = useFormik({
    initialValues: {
      phoneNumber: phoneNumber,
      email: email,
      nameOnCard: convertToLowerCase(selectedPaymentMethod),
      cardNumber: "",
      expiryDate: "",
      cvv: "",
      selectedPaymentMethod: selectedPaymentMethod,
    },
    validationSchema: paymentValidationSchema,

    onSubmit: (values) => {
      // handleSubmitOrder(values);
      // console.log("sub", values);
      validatePayment(values);
    },
    validateOnMount: true,
  });

  // const validatePayment => {

  // }
  const validatePayment = async (values) => {
    let formErrors = await formik.validateForm();

    console.log("errors", formErrors);
    console.log("form valid", formik.isValid);
    if (formik.isValid) {
      handleSubmitOrder(values);
    }
  };

  function convertToLowerCase(str) {
    return str.toLowerCase();
  }
  const handlePaymentMethodChange = (method) => {
    setSelectedPaymentMethod(method);
    formik.setFieldValue("selectedPaymentMethod", method);
    setTimeout(() => {
      console.log(formik.isValid);
    }, 2000);
  };

  const formatCardNumber = (value) => {
    const digits = value.replace(/\D/g, "").slice(0, 16);
    return digits.replace(/(\d{4})(?=\d)/g, "$1 ");
  };

  const formatExpiryDate = (value) => {
    // Remove all non-digits
    const digits = value.replace(/\D/g, "");

    // Extract month and year parts
    const month = digits.slice(0, 2);
    const year = digits.slice(2, 4);
    // Limit month to range 01-12
    const validMonth = month.length === 2 && parseInt(month, 10) > 12 ? "12" : month;

    // Format as MM/YY
    return `${validMonth}/${year}`;
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Payment Method</Text>
      <View style={styles.paymentMethods}>
        {Object.entries(paymentMethods).map(([method, { label, imagePath }]) => (
          <TouchableOpacity
            key={method}
            style={[styles.paymentMethodButton, selectedPaymentMethod === method && styles.selectedPaymentMethod]}
            onPress={() => handlePaymentMethodChange(method)}
          >
            <Image source={imagePath} style={{ height: 24, width: 48 }} />
          </TouchableOpacity>
        ))}
      </View>

      {/* Form Inputs */}
      {!["Mpesa"].includes(selectedPaymentMethod) ? (
        <>
          {formik.touched.email && formik.errors.email ? <Text style={styles.error}>{formik.errors.email}</Text> : null}
          <TextInput
            style={styles.input}
            placeholder="Email Address"
            value={formik.values.email}
            onChangeText={formik.handleChange("email")}
            onBlur={formik.handleBlur("email")}
          />

          {/* Conditional inputs for Visa/MasterCard */}
          {["Visa", "MasterCard"].includes(selectedPaymentMethod) && (
            <>
              <Text style={styles.label}> Name of card </Text>

              <TextInput
                style={styles.input}
                placeholder={selectedPaymentMethod}
                value={selectedPaymentMethod}
                onChangeText={formik.handleChange("nameOnCard")}
                editable={false}
                onBlur={formik.handleBlur("nameOnCard")}
              />
              {formik.touched.nameOnCard && formik.errors.nameOnCard ? (
                <Text style={styles.error}>{formik.errors.nameOnCard}</Text>
              ) : null}

              {formik.touched.cardNumber && formik.errors.cardNumber ? (
                <Text style={styles.error}>{formik.errors.cardNumber}</Text>
              ) : (
                <Text style={styles.label}> Card Number </Text>
              )}

              <TextInput
                style={styles.input}
                placeholder="Card Number"
                keyboardType="numeric"
                value={formatCardNumber(formik.values.cardNumber)}
                onChangeText={(text) => formik.setFieldValue("cardNumber", text.replace(/\D/g, ""))}
                onBlur={formik.handleBlur("cardNumber")}
                maxLength={19}
              />

              <Text style={styles.label}>Expiry Date</Text>

              <View style={styles.row}>
                <TextInput
                  style={[styles.input, styles.halfInput]}
                  placeholder="MM/YY"
                  value={formatExpiryDate(formik.values.expiryDate)}
                  keyboardType="numeric"
                  onChangeText={(text) => formik.setFieldValue("expiryDate", text.replace(/\D/g, ""))}
                  onBlur={formik.handleBlur("expiryDate")}
                />

                <TextInput
                  style={[styles.input, styles.halfInput]}
                  placeholder="CVV"
                  keyboardType="numeric"
                  maxLength={4}
                  value={formik.values.cvv}
                  onChangeText={(text) => formik.setFieldValue("cvv", text.replace(/\D/g, ""))}
                  onBlur={formik.handleBlur("cvv")}
                />
              </View>
            </>
          )}
        </>
      ) : (
        <>
          <Text style={styles.label}>Phone number</Text>
          <TextInput
            style={styles.input}
            placeholder="phone number"
            keyboardType="numeric"
            value={formik.values.phoneNumber}
            onChangeText={(text) => formik.setFieldValue("phoneNumber", text)}
            onBlur={formik.handleBlur("phoneNumber")}
          />

          {formik.touched.email && formik.errors.email ? <Text style={styles.error}>{formik.errors.email}</Text> : null}
          <TextInput
            style={styles.input}
            placeholder="Email Address"
            value={formik.values.email}
            onChangeText={formik.handleChange("email")}
            onBlur={formik.handleBlur("email")}
          />
        </>
      )}

      <View style={styles.navRow}>
        <View style={styles.totalsRow}>
          <Text style={styles.totalhead}>Total Price </Text>
          <Text style={styles.totalAmount}>
            {`Ksh ${new Intl.NumberFormat("en-US", { style: "currency", currency: "KES" })
              .format(totalAmount)
              .replace("KES", "")
              .trim()}`}
          </Text>
        </View>
        <View style={styles.navigationButtons}>
          <TouchableOpacity onPress={formik.handleSubmit} style={styles.submitOrder}>
            <View>
              <Text style={styles.submitText}>Submit Order</Text>
            </View>
          </TouchableOpacity>

          <View style={styles.submitIconWrapper}>
            <Icon name="cartcheck" size={29} />
          </View>
        </View>
      </View>
    </View>
  );
};

export default CheckoutStep3;

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: "white",
    borderRadius: SIZES.medium,
  },
  label: {
    fontSize: SIZES.small + 2,
    marginBottom: 8,
    fontFamily: "semibold",
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
  input: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.themeg,
    padding: 10,
    borderRadius: SIZES.medium,
    marginBottom: 10,
    width: SIZES.width - 50,
  },
  row: {
    flexDirection: "row",
  },
  halfInput: {
    flex: 1,
    marginRight: 8,
  },
  error: {
    color: "red",
    marginBottom: 8,
    marginStart: 5,
  },
  navigationButtons: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
  },
  navRow: {
    // flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    marginTop: 30,
  },
  totalsRow: {
    gap: 6,
    flexDirection: "row",
    width: SIZES.width - 50,
    justifyContent: "space-between",
    marginBottom: SIZES.medium,
  },
  totalhead: {
    fontFamily: "medium",
    fontSize: SIZES.medium,
  },
  totalAmount: {
    fontFamily: "medium",
    fontSize: SIZES.xLarge,
  },
  submitOrder: {
    height: 65,
    justifyContent: "center",
    alignItems: "flex-start",
    width: SIZES.width - 50,
    backgroundColor: COLORS.primary,
    borderRadius: SIZES.medium,
  },
  submitText: {
    fontFamily: "medium",
    fontSize: SIZES.large,
    color: COLORS.white,
    paddingLeft: 30,
  },
  submitIconWrapper: {
    height: 50,
    width: 50,
    borderRadius: SIZES.medium,
    backgroundColor: COLORS.themew,
    justifyContent: "center",

    position: "absolute",
    right: 1,
    alignItems: "center",
  },
});
