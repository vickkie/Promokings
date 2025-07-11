import React, { useState, useEffect, useContext } from "react";
import { View, Text, Button, TextInput, StyleSheet, TouchableOpacity, ScrollView, Image, Linking } from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";
import Icon from "../../../constants/icons";
import { SIZES, COLORS } from "../../../constants";

import { SafeAreaView } from "react-native-safe-area-context";

import { AuthContext } from "../../../components/auth/AuthContext";

const OrderPaymentDetails = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { products, totals, orderId, item } = route.params;
  const { userData, userLogin } = useContext(AuthContext);

  // console.log(item);

  const [isLoading, setIsLoading] = useState(false);
  const [errorState, setErrorState] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [success, setSuccess] = useState(null);
  const [customerDetails, setcustomerDetails] = useState(item?.userId);

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

  useEffect(() => {
    // console.log(item.status);
  });

  const handleEmailPress = () => {
    Linking.openURL("mailto:support@promokings.co.ke");
  };

  const handleCallPress = (phoneNumber) => {
    // console.log(phoneNumber);

    Linking.openURL(`tel:${phoneNumber}`);
  };

  const formatCardNumber = (cardNumber) => {
    return cardNumber.replace(/\d{4}(?=\d)/g, "$& "); // Adds space every 4 digits
  };
  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-GB"); // Formats as DD/MM/YYYY
  };

  const PaymentMethodComponent = ({ item }) => {
    const selectedPaymentMethod = item.paymentInfo.selectedPaymentMethod?.toLowerCase(); // Convert to lowercase

    // Define the icon name based on the selected payment method
    let iconName = "credit-card";
    let value = "";

    switch (selectedPaymentMethod) {
      case "mastercard":
        iconName = "mastercard";
        value = formatCardNumber(item.paymentInfo.cardNumber);
        break;
      case "visa":
        iconName = "visa";
        value = formatCardNumber(item.paymentInfo.cardNumber);
        break;
      case "paypal":
        iconName = "paypal";
        value = "**** " + item.paymentInfo.email;
        break;
      case "mpesa":
        iconName = "mpesa";
        value = item.paymentInfo.phoneNumber;
        break;
      default:
        iconName = "question"; // Fallback icon
        value = "Details empty";
    }

    return (
      <View>
        <View style={styles.selectedPayment}>
          <Text style={styles.selectedText}>Method selected : {`[ ${selectedPaymentMethod} ]`}</Text>
        </View>
        <View style={styles.inputWrapper}>
          <Icon name={iconName} size={36} style={styles.iconStyle} color={COLORS.gray} />
          <TextInput style={{ flex: 1 }} value={value} editable={false} />
        </View>
        <View style={styles.inputWrapper}>
          <Icon name="email" size={29} style={styles.iconStyle} color={COLORS.gray} />
          <TextInput placeholder="email" style={{ flex: 1 }} value={item.paymentInfo?.email} editable={false} />
        </View>
        <View style={styles.inputWrapper}>
          <Icon name="call" size={29} style={styles.iconStyle} color={COLORS.gray} />
          <TextInput
            placeholder="phone Number"
            style={{ flex: 1 }}
            value={item.paymentInfo?.phoneNumber}
            editable={false}
          />
        </View>
        <View style={styles.inputWrapper}>
          <Icon name="calendar" size={29} style={styles.iconStyle} color={COLORS.gray} />
          <TextInput
            placeholder="phone Number"
            style={{ flex: 1 }}
            value={formatDate(item?.createdAt)}
            editable={false}
          />
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
              <Text style={styles.topheading}>Payment details</Text>

              <TouchableOpacity
                onPress={() => {
                  navigation.navigate("EditPaymentDetails", {
                    products: products,
                    orderId: orderId,
                    item: item,
                  });
                }}
                style={styles.outWrap}
              >
                <Icon name="pencil" size={28} />
              </TouchableOpacity>
            </View>

            <Text style={{ color: COLORS.themeb, fontSize: SIZES.medium, marginVertical: 10 }}>
              Transaction id : {item?.transactionId}
            </Text>

            <TouchableOpacity
              style={{
                backgroundColor:
                  item?.paymentStatus === "pending"
                    ? "#ffedd2"
                    : item?.paymentStatus === "paid"
                    ? "#CBFCCD"
                    : item?.paymentStatus === "partial"
                    ? "#C0DAFF"
                    : item?.paymentStatus === "cancelled"
                    ? "#F3D0CE"
                    : COLORS.themey, // Default color
                paddingVertical: 2,
                paddingHorizontal: 8,
                borderRadius: SIZES.medium,
              }}
            >
              <Text
                style={{
                  color:
                    item?.paymentStatus === "pending"
                      ? "#D4641B"
                      : item?.paymentStatus === "paid"
                      ? "#26A532"
                      : item?.paymentStatus === "partial"
                      ? "#337DE7"
                      : item?.paymentStatus === "cancelled"
                      ? "#B65454"
                      : COLORS.primary,
                }}
              >
                {item?.paymentStatus}
              </Text>
            </TouchableOpacity>

            <View style={styles.stepsheader}>
              <Text style={styles.stepstext}>You can track order payment from here</Text>
            </View>
          </View>

          <ScrollView>
            <View style={styles.lowerRow}>
              <ScrollView>
                <View style={styles.stepContainer}>
                  <View style={{ justifyContent: "center", marginVertical: 20 }}>
                    <Text style={styles.relatedHeader}>Ordered items</Text>
                    <Text style={styles.relatedHeader2}>Order id : {item?.orderId}</Text>
                  </View>

                  <View style={{ width: SIZES.width - 27 }}>
                    {products.map((product) => (
                      <View style={styles.containerx} key={product._id?._id}>
                        <TouchableOpacity style={styles.imageContainer}>
                          {/* {console.log("products", item)} */}
                          <Image source={{ uri: product._id?.imageUrl }} style={styles.image} />
                        </TouchableOpacity>
                        <View style={{ gap: 12 }}>
                          <View style={styles.details}>
                            <Text style={styles.title} numberOfLines={1}>
                              {product._id?.title}
                            </Text>
                          </View>
                          <View style={styles.rowitem}>
                            <View style={styles.xp}>
                              <Text style={styles.semititle} numberOfLines={1}>
                                {product?._id && typeof product._id === "object" && "price" in product._id
                                  ? product._id.price
                                  : 0}
                              </Text>
                            </View>
                          </View>
                          <View style={styles.rowitem}>
                            <View>
                              <Text style={styles.semititle}>Quantity: {product?.quantity}</Text>
                            </View>
                            <View style={styles.priceadd}></View>
                          </View>
                        </View>
                      </View>
                    ))}
                  </View>
                </View>
              </ScrollView>
            </View>

            <View style={[styles.paymentRow, { justifyContent: "center" }]}>
              <View style={styles.payFlex}>
                <Text style={styles.paymentDetails}>Payment status</Text>
                <Text
                  style={{
                    backgroundColor:
                      item.paymentStatus === "pending"
                        ? "#C0DAFF"
                        : item.paymentStatus === "paid"
                        ? "#CBFCCD"
                        : item.paymentStatus === "partial"
                        ? "#F3D0CE"
                        : COLORS.themey, // Default color
                    paddingVertical: 4,
                    paddingHorizontal: 8,
                    borderRadius: SIZES.medium,
                  }}
                >
                  {item?.paymentStatus}
                </Text>
              </View>
              <View style={styles.payFlex}>
                <Text style={styles.paymentDetails}>Delivery Fees</Text>
                <Text style={styles.paymentDetails}>
                  {new Intl.NumberFormat("en-KE", { style: "currency", currency: "KES" })
                    .format(item?.deliveryAmount)
                    .replace("Ksh", "")}
                </Text>
              </View>
              <View style={styles.payFlex}>
                <Text style={styles.paymentDetails}>Additional Fees</Text>
                <Text style={styles.paymentDetails}>
                  {new Intl.NumberFormat("en-KE", { style: "currency", currency: "KES" })
                    .format(item?.additionalFees)
                    .replace("Ksh", "")}
                </Text>
              </View>
              <View style={styles.payFlex}>
                <Text style={styles.paymentDetails}>Total Amount</Text>
                <Text style={styles.paymentDetails}>
                  {new Intl.NumberFormat("en-KE", { style: "currency", currency: "KES" })
                    .format(item.subtotal)
                    .replace("Ksh", "")}
                </Text>
              </View>
            </View>

            <View style={[styles.relatedRow, { marginBottom: 10 }]}>
              <View>
                <Text style={styles.relatedHeader}>Payment Information</Text>
              </View>

              <PaymentMethodComponent item={item} />
            </View>

            <View style={[styles.relatedRow, { justifyContent: "center" }]}>
              <Text style={styles.relatedHeader}>Customer information</Text>
              <View style={styles.wrapperRelated}>
                <View style={styles.leftRelated}>
                  <TouchableOpacity style={styles.supplierImage}>
                    <Image
                      source={
                        customerDetails?.profilePicture
                          ? { uri: customerDetails.profilePicture }
                          : require("../../../assets/images/userDefault.webp")
                      }
                      style={{ width: 40, height: 40, borderRadius: 1999 }}
                    />
                  </TouchableOpacity>
                  <View style={{ gap: 5, alignItems: "flex-start", paddingTop: 3, marginStart: 6 }}>
                    <Text style={styles.supplierHead}>{customerDetails?.fullName || customerDetails?.username}</Text>
                    <Text style={styles.supplierwho}>{customerDetails?.location}</Text>
                  </View>
                </View>
                <View style={styles.reachIcons}>
                  <TouchableOpacity
                    style={styles.reachWrapper}
                    onPress={() => {
                      customerDetails ? handleEmailPress(customerDetails?.email) : "";
                    }}
                  >
                    <Icon name="email" size={20} />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.reachWrapper}
                    onPress={() => {
                      const phoneNumber = customerDetails?.phoneNumber || item?.paymentInfo?.phoneNumber;
                      if (phoneNumber) {
                        handleCallPress(phoneNumber);
                      }
                    }}
                  >
                    <Icon name="call" size={20} />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </ScrollView>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default OrderPaymentDetails;

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
  paymentRow: {
    backgroundColor: COLORS.themew,
    width: SIZES.width - 20,
    marginStart: 10,
    borderRadius: SIZES.medium,
    paddingHorizontal: 3,
    minHeight: SIZES.height / 8,
    marginTop: 10,
    paddingTop: 5,
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
  relatedHeader2: {
    fontFamily: "bold",
    fontSize: SIZES.small,
    paddingVertical: 2,
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
    height: 45,
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
  paymentDetails: {
    marginHorizontal: 10,
    paddingVertical: 6,
    fontWeight: "700",
  },
  selectedText: {
    fontFamily: "GtAlpine",
    fontSize: SIZES.medium,
  },
  payFlex: {
    display: "flex",
    flexDirection: "row",
    gap: 5,
    justifyContent: "space-between",
  },
  smallTop: {
    marginTop: 5,
  },
});
