import React, { useState, useEffect, useContext } from "react";
import { View, Text, Button, TextInput, StyleSheet, TouchableOpacity, ScrollView, Image } from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";
import Icon from "../constants/icons";
import { SIZES, COLORS } from "../constants";
import { useCart } from "../contexts/CartContext";
import { SafeAreaView } from "react-native-safe-area-context";
import { AuthContext } from "../components/auth/AuthContext";
import * as Yup from "yup";
import useDelete from "../hook/useDelete";

import CheckoutStep3 from "./Payments";
import LottieView from "lottie-react-native";
import { BACKEND_PORT } from "@env";
import axios from "axios";

const Checkout = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { estimatedAmount, products, totals, additionalFees } = route.params;
  const { userData, userLogin } = useContext(AuthContext);
  const { deleteStatus, errorStatus, redelete } = useDelete(`carts/user`);

  const [isLoading, setIsLoading] = useState(false);
  const [errorState, setErrorState] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [success, setSuccess] = useState(null);
  const [orderId, setOrderId] = useState(null);

  useEffect(() => {
    if (!userLogin) {
      setUserId(1);
      navigation.navigate("Login");
      return;
    } else if (userData && userData._id) {
      setUserId(userData._id);
    }
  }, [userLogin, userData]);

  const [step, setStep] = useState(1);
  const [address, setAddress] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [city, setCity] = useState(userData ? userData.location : "");
  const [email, setEmail] = useState(userData ? userData.email : "");

  const [userId, setUserId] = useState(null);
  const [phoneError, setPhoneError] = useState("");

  const checkoutSchema = Yup.object().shape({
    phoneNumber: Yup.string()
      .required("Phone number is required")
      .matches(/^[0-9]+$/, "Phone number must contain only digits"),
  });

  useEffect(() => {
    if (phoneNumber) {
      checkoutSchema
        .validate({ phoneNumber })
        .then(() => setPhoneError(""))
        .catch((err) => setPhoneError(err.errors[0]));
    }
  }, [phoneNumber]);

  const handleNext = () => {
    switch (step) {
      case 2:
        if (phoneError) {
          // Do nothing or handle error
        } else if (phoneNumber === "") {
          setPhoneError("Please fill this field");
        } else if (address === "") {
          setPhoneError("Please fill shipping address field");
        } else {
          setStep(step + 1);
        }
        break;
      case 4:
        setStep(step);
        break;
      default:
        if (products && products.length > 0) {
          setStep(step + 1);
        } else {
          setStep(step + 1);
        }
    }
  };

  const handlePrevious = () => {
    if (step > 1) {
      setStep(step - 1);
    } else if (step > 3) {
      setStep(step);
    }
  };

  const handleSubmitOrder = async (paymentInfo) => {
    const orderData = {
      userId: userId,
      products: products,
      shippingInfo: { address, city, phoneNumber },
      paymentInfo,
      totalAmount: estimatedAmount,
      additionalFees: 0,
      subtotal: estimatedAmount + additionalFees,
    };

    handleNext(); // This moves to the next step in the UI

    try {
      setIsLoading(true);
      setErrorState(false);

      const response = await axios.post(`${BACKEND_PORT}/api/orders`, orderData);
      setOrderId(response.data.order.orderId);
      setSuccess(true);

      // Only proceed with next steps if the order creation was successful
      if (response.data.success) {
        console.log("Order created successfully:", response.data.order.orderId);
        redelete(userId); // Delete cart items as they are now orders
        navigation.navigate("OrderSuccess", { orderId: response.data.order.orderId });
      } else {
        setErrorMessage(response.data.message || "Unknown error occurred");
        setErrorState(true);
      }
    } catch (error) {
      setErrorMessage(error.message || "An error occurred");
      setErrorState(true);
      console.error("Error submitting order:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const navigateWhere = (locate) => {
    if (step > 1) {
      handlePrevious();
    } else {
      navigation.goBack();
    }
  };

  function calculateQuantity(priceString, totals) {
    // Regex to match numbers with optional thousands separators and decimal points
    const regex = /(\d+)(,\d{3})*(\.\d+)?/g;

    // Extract the numeric part from the price string
    const numericValueMatch = priceString.match(regex)?.[0];
    if (!numericValueMatch) return "N/A";

    // Remove commas to convert the string to a pure number format
    const numericValue = numericValueMatch.replace(/,/g, "");

    // Convert the numeric value to a float and check if totals is a valid number
    const parsedNumericValue = parseFloat(numericValue);
    const quantity = isNaN(parsedNumericValue) || isNaN(totals) ? "N/A" : totals / parsedNumericValue;

    return quantity;
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.container}>
        <View style={styles.wrapper}>
          <View style={styles.upperRow}>
            <View style={styles.upperButtons}>
              <TouchableOpacity onPress={navigateWhere} style={[styles.backBtn, styles.buttonWrap]}>
                <Icon name="backbutton" size={26} />
              </TouchableOpacity>
              <Text style={styles.topheading}>Checkout</Text>
            </View>
            <View style={styles.paginationContainer}>
              <View style={styles.dot(step === 1 ? COLORS.themey : COLORS.themeg)} />
              <View style={styles.dot(step === 2 ? COLORS.themey : COLORS.themeg)} />
              <View style={styles.dot(step === 3 ? COLORS.themey : COLORS.themeg)} />
            </View>
            <View style={styles.stepsheader}>
              <Text style={styles.stepstext}>Just a couple of steps and you good to go</Text>
            </View>
          </View>

          <View style={styles.lowerRow}>
            <ScrollView>
              {step === 1 && (
                <View style={styles.stepContainer}>
                  <View style={styles.stepContainerInner}>
                    <Icon name="checkout" size={26} />
                  </View>

                  <View style={{ width: SIZES.width - 27 }}>
                    {products.map((item) => (
                      <View style={styles.containerx} key={item._id}>
                        <TouchableOpacity
                          style={styles.imageContainer}
                          onPress={() => navigation.navigate("ProductDetails", { item, itemid: item._id })}
                        >
                          <Image source={{ uri: item.cartItem.imageUrl }} style={styles.image} />
                        </TouchableOpacity>
                        <View style={{ gap: 12 }}>
                          <View style={styles.details}>
                            <Text style={styles.title} numberOfLines={1}>
                              {item.cartItem.title}
                            </Text>
                          </View>
                          <View style={styles.rowitem}>
                            <View style={styles.xp}>
                              <Text style={styles.semititle} numberOfLines={1}>
                                SIZE-{item.size}
                              </Text>
                            </View>
                          </View>
                          <View style={styles.rowitem}>
                            <View>
                              <Text style={styles.semititle}>
                                <Text style={styles.semititle}>
                                  Quantity : {calculateQuantity(item.cartItem.price, totals[item._id])}
                                </Text>
                              </Text>
                            </View>

                            <View style={styles.priceadd}>
                              <Text style={styles.semititle}>
                                Totals :
                                {`KES ${new Intl.NumberFormat("en-US", { style: "currency", currency: "KES" })
                                  .format(totals[item._id])
                                  .replace("KES", "")
                                  .trim()}`}
                              </Text>
                            </View>
                          </View>
                        </View>
                      </View>
                    ))}
                  </View>

                  <View>
                    <Text style={styles.amount}>Checkout Amount: Ksh {Number(estimatedAmount).toLocaleString()}</Text>
                    <TouchableOpacity style={styles.button1} onPress={handleNext}>
                      <Text style={styles.nextText}>Next</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
              {step === 2 && (
                <View style={styles.stepContainer}>
                  <View style={styles.shippingContainer}>
                    <Text style={styles.label}>Shipping City Name</Text>
                    <TextInput
                      style={[styles.input]}
                      placeholder={userData.location}
                      value={userData.location}
                      onChangeText={setCity}
                    />
                    <Text style={styles.label}>Shipping Address</Text>
                    <TextInput style={styles.input} value={address} onChangeText={setAddress} />
                    <Text style={styles.label}>Shipping email</Text>
                    <TextInput
                      style={styles.input}
                      placeholder={userData.email}
                      value={email}
                      onChangeText={setEmail}
                    />

                    {phoneError ? <Text style={styles.error}>{phoneError}</Text> : null}

                    <Text style={styles.label}>Phone Number</Text>
                    <TextInput
                      style={[styles.input, phoneError ? styles.errorb : styles.successb]}
                      value={phoneNumber}
                      onChangeText={(text) => setPhoneNumber(text)}
                      keyboardType="phone-pad"
                    />

                    <View style={styles.next2wrapper}>
                      <TouchableOpacity onPress={handlePrevious} style={styles.previous}>
                        <Text>
                          <Icon name="backbutton" size={36} />
                        </Text>
                      </TouchableOpacity>
                      <TouchableOpacity onPress={handleNext} style={styles.next2}>
                        <Text style={styles.buttonText}>Next step</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              )}

              {step === 3 && (
                <>
                  <View style={styles.stepContainer}>
                    <CheckoutStep3
                      onPrevious={handlePrevious}
                      onNext={handleNext}
                      phoneNumber={phoneNumber}
                      totalAmount={estimatedAmount}
                      handleSubmitOrder={handleSubmitOrder}
                      email={email}
                    />
                  </View>
                </>
              )}

              {step === 4 && isLoading && (
                <View style={styles.containLottie}>
                  <View style={styles.animationWrapper}>
                    <LottieView
                      source={require("../assets/data/loading.json")}
                      autoPlay
                      loop
                      style={styles.animation}
                    />
                  </View>
                </View>
              )}

              {step === 4 && errorState && (
                <View style={styles.containLottie}>
                  <View style={styles.animationWrapper}>
                    <LottieView
                      source={require("../assets/data/failed.json")}
                      autoPlay
                      loop={false}
                      style={styles.animation}
                    />
                    <Text style={styles.errorMessage}>{"Sorry request failed \n Please try again later"}</Text>
                  </View>
                  <TouchableOpacity style={styles.buttonHome} onPress={() => navigation.navigate("Home")}>
                    <Text style={styles.buttonText}>Back to home</Text>
                  </TouchableOpacity>
                </View>
              )}
            </ScrollView>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default Checkout;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  wrapper: {
    flex: 1,
    backgroundColor: COLORS.themeg,
    flexDirection: "column",
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
    // minHeight: SIZES.height,
    width: SIZES.width - 20,
    marginStart: 10,
    borderRadius: SIZES.medium,
    paddingHorizontal: 3,
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
  header: {
    fontSize: 24,
    marginBottom: 20,
  },
  amount: {
    fontSize: 20,
    marginBottom: 20,
    fontFamily: "semibold",
    textAlign: "center",
  },
  stepContainer: {
    width: "100%",
    marginBottom: 20,
  },
  stepContainerInner: { justifyContent: "center", alignItems: "center", padding: 20 },
  input: {
    height: 40,
    borderColor: "gray",
    borderWidth: 1,
    marginBottom: 10,
    paddingHorizontal: 10,
  },
  nextText: {
    fontFamily: "semibold",
    textAlign: "center",
    color: COLORS.white,
    fontSize: SIZES.medium,
  },
  button1: {
    height: 50,
    borderRadius: SIZES.medium,
    backgroundColor: COLORS.themey,
    justifyContent: "center",
    alignItems: "center",
  },

  imageContainer: {
    height: 80,
    width: 80,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: SIZES.medium,
    borderColor: COLORS.themeg,
    borderWidth: 1,
  },
  image: {
    borderRadius: SIZES.medium,
    height: "96%",
    width: "96%",
  },
  rowitem: {
    flexDirection: "row",
    overflow: "hidden",
    justifyContent: "space-between",
    width: SIZES.width / 2 + 30,
  },
  title: {
    fontFamily: "semibold",
    fontSize: SIZES.medium,
  },
  semititle: {
    fontFamily: "regular",
    fontSize: SIZES.medium - 3,
  },
  size: {
    fontFamily: "regular",
    fontSize: SIZES.medium - 2,
    paddingStart: 2,
  },
  details: {
    gap: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    width: SIZES.width / 2,
  },
  containerx: {
    flexDirection: "row",
    marginBottom: SIZES.small,
    backgroundColor: COLORS.themeg,
    padding: 10,
    gap: 10,
    borderRadius: SIZES.medium,
  },
  uppDetail: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  containLottie: {
    justifyContent: "center",
    alignItems: "center",
    width: SIZES.width - 20,
    minHeight: SIZES.height - 150,
  },
  errorMessage: {
    fontFamily: "semibold",
    fontSize: SIZES.large,
    marginBottom: 30,
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
  stepsheader: {
    paddingVertical: 10,
    textAlign: "left",
    justifyContent: "flex-start",
  },
  stepstext: {
    fontFamily: "regular",
    color: COLORS.gray2,
  },
  previous: {
    height: 60,
    width: 60,
    backgroundColor: COLORS.themey,
    borderRadius: 100,
    justifyContent: "center",
    alignItems: "center",
  },
  next2wrapper: {
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
    gap: 10,
    position: "absolute",
    bottom: 20,
  },
  next2: {
    justifyContent: "center",
    alignItems: "center",
    width: SIZES.width - 100,
    backgroundColor: COLORS.themey,
    borderRadius: SIZES.medium,
    height: 60,
  },
  input: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.themeg,
    padding: 10,
    borderRadius: SIZES.medium,
    marginBottom: 10,
    width: SIZES.width - 40,
    marginStart: 5,
  },
  label: {
    fontSize: SIZES.small,
    marginBottom: SIZES.xSmall,
    color: COLORS.gray,
    marginStart: SIZES.large,
  },
  shippingContainer: {
    minHeight: SIZES.height - 220,
    marginTop: SIZES.xxLarge,
  },
  buttonText: {
    color: COLORS.lightWhite,
    fontFamily: "semibold",
    fontSize: SIZES.medium,
  },
  error: { color: "red", marginBottom: 10, marginStart: 10, marginTop: 20 },
  errorb: {
    borderWidth: 0.54,
    borderColor: COLORS.red,
  },
  successb: {
    borderWidth: 0.54,
    borderColor: COLORS.green,
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
  buttonHome: {
    position: "absolute",
    bottom: 20,
    left: 10,
    right: 10,
    backgroundColor: COLORS.themey,
    height: SIZES.xxLarge + 20,
    borderRadius: SIZES.medium,
    justifyContent: "center",
    alignItems: "center",
  },
});
