import React, { useState, useEffect, useContext } from "react";
import { View, Text, Button, TextInput, StyleSheet, TouchableOpacity, ScrollView, Image, Linking } from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";
import Icon from "../constants/icons";
import { SIZES, COLORS } from "../constants";
import { useCart } from "../contexts/CartContext";
import { SafeAreaView } from "react-native-safe-area-context";
import { AuthContext } from "../components/auth/AuthContext";
import useDelete from "../hook/useDelete";
import { BACKEND_PORT } from "@env";
import axios from "axios";

import Clipboard from "expo-clipboard";

const OrderDetails = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { products, totals, orderId, item } = route.params;
  const { userData, userLogin } = useContext(AuthContext);
  const { deleteStatus, errorStatus, redelete } = useDelete(`carts/user`);

  const [isLoading, setIsLoading] = useState(false);
  const [errorState, setErrorState] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [success, setSuccess] = useState(null);

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

  function calculateQuantity(priceString, total) {
    // Regex pattern to match numbers including decimal points and optional thousands separators
    const regex = /\d{1,3}(,\d{3})*(\.\d+)?/g;

    // Extract numeric part, considering potential thousands separators
    const numericValueMatch = priceString.match(regex)?.[0];
    if (!numericValueMatch) return "N/A";

    // Remove thousands separators if present
    const numericValue = numericValueMatch.replace(/,/g, "");

    // Convert to float and perform calculation, ensuring total is a number
    const quantity = isNaN(parseFloat(numericValue)) || isNaN(total) ? "N/A" : total / parseFloat(numericValue);

    return quantity;
  }

  useEffect(() => {
    // console.log(item.status);
  });

  const handleEmailPress = () => {
    Linking.openURL("mailto:support@promokings.co.ke");
  };

  const handleCallPress = () => {
    const phoneNumber = "1234567890";
    Linking.openURL(`tel:${phoneNumber}`);
  };

  const PaymentMethodComponent = ({ item }) => {
    const selectedPaymentMethod = item.paymentInfo.selectedPaymentMethod;

    // Define the icon name based on the selected payment method
    let iconName = "credit-card";
    let value = "";
    switch (selectedPaymentMethod) {
      case "MasterCard":
        iconName = "mastercard";
        value = "**** **** **** " + item.paymentInfo.cardNumber.slice(-4);
        break;
      case "Visa":
        iconName = "visa";
        value = "**** **** **** " + item.paymentInfo.cardNumber.slice(-4);
        break;
      case "Paypal":
        iconName = "paypal";
        value = item.paymentInfo.email;
        break;
      case "Mpesa":
        iconName = "mpesa";
        value = item.paymentInfo.phoneNumber;
        break;
      default:
        iconName = "question-circle"; // Fallback icon
        value = "Enter details";
    }

    return (
      <View>
        <View style={styles.selectedPayment}>
          <Text style={styles.selectedText}>Method selected : {`[ ${selectedPaymentMethod} ]`}</Text>
        </View>
        <View style={styles.inputWrapper}>
          <Icon
            name={iconName} // Dynamically set the icon name
            size={36}
            style={styles.iconStyle}
            color={COLORS.gray}
          />
          <TextInput
            style={{ flex: 1 }}
            value={value} // Use value to set the text
            editable={false} // Set the input field to non-editable
          />
        </View>
        <View style={styles.inputWrapper}>
          <Icon name="email" size={29} style={styles.iconStyle} color={COLORS.gray} />
          <TextInput placeholder="email" style={{ flex: 1 }} value={item.paymentInfo.email} editable={false} />
        </View>
        <View style={styles.inputWrapper}>
          <Icon name="location" size={29} style={styles.iconStyle} color={COLORS.gray} />
          <TextInput placeholder="email" style={{ flex: 1 }} value={item.shippingInfo.city} editable={false} />
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.container}>
        <View style={styles.wrapper}>
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
              <Text style={styles.topheading}>Order details</Text>

              <TouchableOpacity onPress={() => {}} style={styles.outWrap}>
                <Icon name="tracker" size={28} />
              </TouchableOpacity>
            </View>

            <Text style={{ fontFamily: "GtAlpine", color: COLORS.themeb, fontSize: SIZES.medium, marginVertical: 15 }}>
              Order id : {orderId}
            </Text>

            <TouchableOpacity
              style={{
                backgroundColor:
                  item.status === "pending"
                    ? "#ffedd2"
                    : item.status === "delivered"
                    ? "#CBFCCD"
                    : item.status === "delivery"
                    ? "#C0DAFF"
                    : item.status === "cancelled"
                    ? "#F3D0CE"
                    : COLORS.themey, // Default color
                paddingVertical: 4,
                paddingHorizontal: 8,
                borderRadius: SIZES.medium,
              }}
            >
              <Text
                style={{
                  color:
                    item.status === "pending"
                      ? "#D4641B"
                      : item.status === "delivered"
                      ? "#26A532"
                      : item.status === "delivery"
                      ? "#337DE7"
                      : item.status === "cancelled"
                      ? "#B65454"
                      : COLORS.primary,
                }}
              >
                {item.status}
              </Text>
            </TouchableOpacity>

            <View style={styles.stepsheader}>
              <Text style={styles.stepstext}>You can track your order from here</Text>
            </View>
          </View>

          <ScrollView>
            <View style={styles.lowerRow}>
              <ScrollView>
                <View style={styles.stepContainer}>
                  <View style={{ justifyContent: "center", marginVertical: 20 }}>
                    <Text style={styles.relatedHeader}>Ordered items</Text>
                  </View>

                  <View style={{ width: SIZES.width - 27 }}>
                    {products.map((product) => (
                      <View style={styles.containerx} key={product._id}>
                        <TouchableOpacity
                          style={styles.imageContainer}
                          onPress={() =>
                            navigation.navigate("ProductDetails", { item: product.cartItem._id, itemid: product._id })
                          }
                        >
                          {/* {console.log("products", item)} */}
                          <Image source={{ uri: product.cartItem._id.imageUrl }} style={styles.image} />
                        </TouchableOpacity>
                        <View style={{ gap: 12 }}>
                          <View style={styles.details}>
                            <Text style={styles.title} numberOfLines={1}>
                              {product.cartItem._id.title}
                            </Text>
                          </View>
                          <View style={styles.rowitem}>
                            <View style={styles.xp}>
                              <Text style={styles.semititle} numberOfLines={1}>
                                SIZE-{product.size}
                              </Text>
                            </View>
                          </View>
                          <View style={styles.rowitem}>
                            <View>
                              <Text style={styles.semititle}>Quantity: {product.quantity}</Text>
                            </View>
                            <View style={styles.priceadd}></View>
                          </View>
                        </View>
                      </View>
                    ))}
                  </View>

                  <View>
                    {/* Uncomment if you need to include the amount and button */}
                    {/* <Text style={styles.amount}>Estimated Amount: {item.totalAmount}</Text>
                  <TouchableOpacity style={styles.button1} onPress={handleNext}>
                    <Text style={styles.nextText}>Next</Text>
                  </TouchableOpacity> */}
                  </View>
                </View>
              </ScrollView>
            </View>
            <View style={[styles.relatedRow, { justifyContent: "center" }]}>
              <Text style={styles.relatedHeader}>Related information</Text>
              <View style={styles.wrapperRelated}>
                <View style={styles.leftRelated}>
                  <TouchableOpacity style={styles.supplierImage}>
                    <Image
                      source={require("../assets/images/promoking-logo.png")}
                      style={{ width: 40, height: 40, borderRadius: 1999 }}
                    />
                  </TouchableOpacity>
                  <View style={{ gap: 5, alignItems: "flex-start", paddingTop: 3, marginStart: 6 }}>
                    <Text style={styles.supplierHead}>Promokings limited</Text>
                    <Text style={styles.supplierwho}>Supplier</Text>
                  </View>
                </View>
                <View style={styles.reachIcons}>
                  <TouchableOpacity style={styles.reachWrapper} onPress={handleEmailPress}>
                    <Icon name="email" size={20} />
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.reachWrapper} onPress={handleCallPress}>
                    <Icon name="call" size={20} />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
            <View style={[styles.relatedRow, { marginBottom: 10 }]}>
              <View>
                <Text style={styles.relatedHeader}>Payment Information</Text>
              </View>

              <PaymentMethodComponent item={item} />
            </View>
          </ScrollView>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default OrderDetails;

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
    minHeight: 110,
  },
  topheading: {
    fontFamily: "bold",
    fontSize: SIZES.large,
  },
  lowerRow: {
    marginTop: 180,
    backgroundColor: COLORS.themew,
    width: SIZES.width - 20,
    marginStart: 10,
    borderRadius: SIZES.medium,
    paddingHorizontal: 3,
  },
  relatedRow: {
    backgroundColor: COLORS.themew,
    width: SIZES.width - 20,
    marginStart: 10,
    borderRadius: SIZES.medium,
    paddingHorizontal: 3,
    minHeight: SIZES.height / 5,
    marginTop: 10,
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
  stepContainerInner: {
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
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
  stepsheader: {
    paddingVertical: 10,
    textAlign: "left",
    justifyContent: "flex-start",
  },
  stepstext: {
    fontFamily: "regular",
    color: COLORS.gray2,
  },
  outWrap: {
    backgroundColor: COLORS.themeg,
    padding: 12,
    borderRadius: 100,
    justifyContent: "center",
    alignItems: "center",
    position: "absolute",
    top: 5,
    right: 10,
  },
  relatedHeader: {
    fontFamily: "bold",
    fontSize: SIZES.medium + 4,
    paddingVertical: 10,
    paddingHorizontal: 15,
    color: COLORS.gray,
  },
  supplierImage: {
    width: 50,
    height: 50,
    borderRadius: 199,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff2c2",
  },
  reachIcons: {
    justifyContent: "space-between",
    alignItems: "center",
    flexDirection: "row",
    gap: 15,
  },

  wrapperRelated: {
    justifyContent: "space-between",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
  },
  leftRelated: {
    flexDirection: "row",
    gap: 5,
  },
  supplierHead: {
    fontFamily: "semibold",
    fontSize: SIZES.medium,
  },
  supplierwho: {
    fontFamily: "regular",
    fontSize: SIZES.medium - 2,
    color: COLORS.gray2,
  },
  reachWrapper: {
    backgroundColor: COLORS.themeg,
    borderRadius: 100,
    justifyContent: "center",
    alignItems: "center",
    height: 36,
    width: 36,
  },
  inputWrapper: {
    backgroundColor: COLORS.lightWhite,
    borderWidth: 1,
    height: 55,
    borderRadius: 12,
    flexDirection: "row",
    paddingHorizontal: 15,
    alignItems: "center",
    borderColor: "#CCC",
    width: SIZES.width - 50,
    alignSelf: "center",
    marginVertical: 10,
  },
  iconStyle: {
    marginRight: 10,
  },

  selectedPayment: {
    marginHorizontal: 15,
    paddingVertical: 6,
  },
  selectedText: {
    fontFamily: "GtAlpine",
    fontSize: SIZES.medium,
  },
});