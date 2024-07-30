import React, { useState, useEffect, useContext } from "react";
import { View, Text, Button, TextInput, StyleSheet, TouchableOpacity, ScrollView, Image } from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";
import Icon from "../constants/icons";
import { SIZES, COLORS } from "../constants";
import { useCart } from "../contexts/CartContext";
import { SafeAreaView } from "react-native-safe-area-context";
import { AuthContext } from "../components/auth/AuthContext";
import * as Yup from "yup";
import usePost from "../hook/usePost";
import useDelete from "../hook/useDelete";

import CheckoutStep3 from "./Payments";

const Checkout = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { estimatedAmount, products, totals, additionalFees } = route.params;
  const { userData, userLogin } = useContext(AuthContext);
  const { updateStatus, isLoading, error, errorMessage, postData } = usePost("orders");
  const { deleteStatus, errorStatus, redelete } = useDelete(`carts/user`);

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
    if (step == 2 && phoneError) {
      setStep(step);
    } else if (step == 2 && phoneNumber === "") {
      setPhoneError("Please fill this field");
      setStep(step);
    } else if (step == 2 && address === "") {
      setPhoneError("Please fill shipping address field");
      setStep(step);
    } else if (products && products.length > 0) {
      setStep(step + 1);
    }
  };

  const handlePrevious = () => {
    if (step > 1) {
      setStep(step - 1);
    } else if (step > 3) {
      setStep(step);
    }
  };

  const handleSubmitOrder = (paymentInfo) => {
    const orderData = {
      userId: userId,
      products: products,
      shippingInfo: { address, city, phoneNumber },
      paymentInfo,
      totalAmount: estimatedAmount,
      additionalFees: 0,
      subtotal: estimatedAmount + additionalFees,
    };

    // Submiting orderData to  backend or API here

    postData(orderData);

    //delete cart items as they are now orders
    redelete(userId);

    navigation.navigate("OrderSuccess");
  };

  const navigateWhere = (locate) => {
    if (step > 1) {
      handlePrevious();
    } else {
      navigation.goBack();
    }
  };

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
                              <Text style={styles.semititle}>Quantity : {item.quantity}</Text>
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
                    <Text style={styles.amount}>Estimated Amount: {estimatedAmount}</Text>
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
                    />
                  </View>
                </>
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
    height: 40,
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
});
