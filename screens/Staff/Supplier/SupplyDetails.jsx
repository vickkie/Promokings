import React, { useState, useEffect, useContext, useRef } from "react";
import { View, Text, Button, TextInput, StyleSheet, TouchableOpacity, ScrollView, Image, Linking } from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";
import Icon from "../../../constants/icons";
import { SIZES, COLORS } from "../../../constants";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import { SafeAreaView } from "react-native-safe-area-context";
import useFetch from "../../../hook/useFetch";

import { BACKEND_PORT } from "@env";
import axios from "axios";
import { AuthContext } from "../../../components/auth/AuthContext";
import BidToInventory from "../../../components/bottomsheets/BidToInventory";
import { Alert } from "react-native";
import SupplierPaymentTracker from "./SupplierPaymentTracker";

const SupplyDetails = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { bid, bidId, item } = route.params;
  const { userData, userLogin } = useContext(AuthContext);

  useEffect(() => {
    if (!userLogin) {
      setUserId(1);
      navigation.navigate("Login");
      return;
    } else if (userData && userData._id) {
      setUserId(userData._id);
    }
  }, [userLogin, userData]);

  const datapath = `v2/supplier/${bid?.selectedSupplier}`;

  const {
    data,
    isLoading: supplierLoading,
    error,
    errorMessage: supplierError,
    refetch,
  } = useFetch(datapath, true, userData?.TOKEN);

  const [step, setStep] = useState(1);
  const [address, setAddress] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [city, setCity] = useState(userData ? userData.location : "");
  const [email, setEmail] = useState(userData ? userData.email : "");
  const [supplierData, setSupplierData] = useState("");

  const [userId, setUserId] = useState(null);
  const [phoneError, setPhoneError] = useState("");

  useEffect(() => {
    if (!supplierLoading && data?.success) {
      //   console.log(data?.supplier);
      setSupplierData(data?.supplier);
    }
  }, [data, supplierLoading]);

  const BottomSheetRef = useRef(null);

  const openMenu = () => BottomSheetRef.current?.present();

  const handleEmailPress = () => {
    Linking.openURL("mailto:inventory@promokings.co.ke");
  };

  const handleCallPress = () => {
    const phoneNumber = "+254706676569";
    Linking.openURL(`tel:${phoneNumber}`);
  };
  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-GB"); // Formats as DD/MM/YYYY
  };

  const PaymentMethodComponent = ({ item }) => {
    const [paymentDetails, setPaymentDetails] = useState(item?.supplier?.paymentDetails || {});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
      const fetchPaymentDetails = async () => {
        let routeport = `${BACKEND_PORT}/api/V2/supplier/V4/accountpay/${item?.inventoryRequest?.selectedSupplier}`;

        // console.log("port ", routeport);
        try {
          const response = await axios.get(routeport, {
            headers: {
              Authorization: `Bearer ${userData.TOKEN}`,
            },
          });
          setPaymentDetails(response.data.paymentDetails || {});
        } catch (err) {
          setError(err.response?.data?.message || "Failed to fetch payment details");
        } finally {
          setLoading(false);
        }
      };
      fetchPaymentDetails();
      // console.log(item?.inventoryRequest?.selectedSupplier);

      if (item?.inventoryRequest?.selectedSupplier && userData?.TOKEN) {
      } else {
        setLoading(false);
      }
    }, [item?.inventoryRequest?.selectedSupplier, userData?.token]);

    const payment = paymentDetails;
    const preferred = payment?.preferredMethod;

    const isEmpty = (obj) => obj && Object.values(obj).every((val) => !val);

    const renderBank = () => {
      const { accountName, accountNumber, bankName, bankBranch, bankCode, swiftCode } = payment.bank || {};
      const isBankEmpty = isEmpty(payment.bank);

      return (
        <View>
          <View style={styles.selectedPayment}>
            <Text style={styles.selectedText}>Payment Method: [ Bank Transfer ]</Text>
          </View>
          {isBankEmpty ? (
            <Text style={{ textAlign: "center", padding: 10, color: COLORS.gray }}>No bank details provided.</Text>
          ) : (
            <>
              <InputField icon="account" value={accountName} placeholder="Account Name" />
              <InputField icon="bank" value={bankName} placeholder="Bank Name" />
              <InputField icon="credit-card" value={accountNumber} placeholder="Account Number" />
              <InputField icon="source-branch" value={bankBranch} placeholder="Branch" />
              <InputField icon="numeric-1-box" value={bankCode} placeholder="Bank Code" />
              <InputField icon="codepen" value={swiftCode} placeholder="SWIFT Code" />
            </>
          )}
        </View>
      );
    };

    const renderMpesa = () => {
      const { mpesaName, mpesaNumber, idNumber } = payment.mobileMoney || {};
      const isMpesaEmpty = isEmpty(payment.mobileMoney);

      return (
        <View>
          <View style={styles.selectedPayment}>
            <Text style={styles.selectedText}>Payment Method: [ M-Pesa ]</Text>
          </View>
          {isMpesaEmpty ? (
            <Text style={{ textAlign: "center", padding: 10, color: COLORS.gray }}>No M-Pesa details provided.</Text>
          ) : (
            <>
              <InputField icon="account" value={mpesaName} placeholder="Mpesa Name" />
              <InputField icon="cellphone" value={mpesaNumber} placeholder="Mpesa Number" />
              <InputField icon="card-account-details" value={idNumber} placeholder="ID Number" />
            </>
          )}
        </View>
      );
    };

    const renderPaypal = () => {
      const { email } = payment.paypal || {};
      const isPaypalEmpty = isEmpty(payment.paypal);

      return (
        <View>
          <View style={styles.selectedPayment}>
            <Text style={styles.selectedText}>Payment Method: [ PayPal ]</Text>
          </View>
          {isPaypalEmpty ? (
            <Text style={{ textAlign: "center", padding: 10, color: COLORS.gray }}>No PayPal email provided.</Text>
          ) : (
            <InputField icon="email" value={email} placeholder="PayPal Email" />
          )}
        </View>
      );
    };

    const renderFallback = () => (
      <Text style={{ textAlign: "center", color: COLORS.gray, padding: 10 }}>
        No payment method selected or details provided.
      </Text>
    );

    if (loading) return <Text style={{ textAlign: "center", color: COLORS.gray }}>Loading payment info...</Text>;
    if (error) return <Text style={{ textAlign: "center", color: COLORS.red }}>{error}</Text>;

    return (
      <View>
        {preferred === "BankTransfer" && renderBank()}
        {preferred === "MobileMoney" && renderMpesa()}
        {preferred === "PayPal" && renderPaypal()}
        {!preferred && renderFallback()}

        {item?.paidAt && <InputField icon="calendar" value={formatDate(item?.paidAt)} placeholder="Date Paid" />}
      </View>
    );
  };

  // helper input component
  const InputField = ({ icon, value, placeholder }) => (
    <View style={styles.inputWrapper}>
      <MaterialCommunityIcons name={icon} size={28} style={styles.iconStyle} color={COLORS.gray} />
      <TextInput style={{ flex: 1 }} value={value} editable={false} placeholder={placeholder} />
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <BidToInventory ref={BottomSheetRef} item={bid} refetch={refetch} />
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
              <Text style={styles.topheading}>Supply details</Text>

              <TouchableOpacity
                onPress={() => {
                  navigation.navigate("SupplyReceiptScreen", {
                    transaction: item,
                  });
                }}
                style={styles.outWrap}
              >
                <Icon name="receipt" size={28} />
              </TouchableOpacity>
            </View>

            <Text style={{ fontFamily: "GtAlpine", color: COLORS.themeb, fontSize: SIZES.medium, marginVertical: 15 }}>
              Supply id : {bidId}
            </Text>

            <TouchableOpacity
              style={{
                backgroundColor:
                  bid?.status === "Pending"
                    ? "#ffedd2"
                    : bid?.status === "Completed"
                    ? "#CBFCCD"
                    : bid?.status === "Closed"
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
                    bid?.status === "Pending"
                      ? "#D4641B"
                      : bid?.status === "Completed"
                      ? "#26A532"
                      : bid?.status === "delivery"
                      ? "#337DE7"
                      : bid?.status === "Closed"
                      ? "#B65454"
                      : COLORS.primary,
                }}
              >
                {bid?.status === "Completed" ? "Delivered" : bid?.status}
              </Text>
            </TouchableOpacity>

            <View style={styles.stepsheader}>
              <Text style={styles.stepstext}>View your supply details from here</Text>
            </View>
          </View>

          <ScrollView>
            <View style={styles.lowerRow}>
              <ScrollView>
                <View style={styles.stepContainer}>
                  <View style={{ justifyContent: "center", marginVertical: 20 }}>
                    <Text style={styles.relatedHeader}>Supply items</Text>
                  </View>

                  <View style={{ width: SIZES.width - 27 }}>
                    <View style={styles.containerx} key={bid?._id}>
                      <TouchableOpacity style={styles.imageContainer}>
                        <Image source={{ uri: bid?.imageUrl }} style={styles.image} />
                      </TouchableOpacity>
                      <View style={{ gap: 12 }}>
                        <View style={styles.details}>
                          <Text style={styles.title} numberOfLines={1}>
                            {bid?.productName}
                          </Text>
                        </View>
                        <View style={styles.rowitem}>
                          <View style={styles.xp}>
                            <Text style={styles.semititle} numberOfLines={1}>
                              Bid price : {bid?.expectedPrice ?? 0}
                            </Text>
                          </View>
                        </View>
                        <View style={styles.rowitem}>
                          <View>
                            <Text style={styles.semititle}>Quantity: {bid?.quantity}</Text>
                          </View>
                          <View style={styles.priceadd}></View>
                        </View>
                      </View>
                    </View>
                  </View>
                </View>
              </ScrollView>
            </View>

            <View style={[styles.paymentRow, { justifyContent: "center" }]}>
              <View style={styles.payFlex}>
                <Text style={styles.paymentDetails}>Payment status</Text>
                <Text
                  style={{
                    paddingVertical: 2,
                    paddingHorizontal: 8,
                    borderRadius: SIZES.medium,
                  }}
                >
                  {item?.status}
                </Text>
              </View>
              <View style={styles.payFlex}>
                <Text style={styles.paymentDetails}>Supply Amount</Text>
                <Text style={styles.paymentDetails}>
                  {new Intl.NumberFormat("en-KE", { style: "currency", currency: "KES" })
                    .format(item?.amount)
                    .replace("Ksh", "")}
                </Text>
              </View>
              <View style={styles.payFlex}>
                <Text style={styles.paymentDetails}>Additional Payments</Text>
                <Text style={styles.paymentDetails}>
                  {new Intl.NumberFormat("en-KE", { style: "currency", currency: "KES" })
                    .format(item?.additionalFees)
                    .replace("Ksh", "")}
                </Text>
              </View>
              <View style={styles.divider}></View>
              <View style={styles.payFlex}>
                <Text style={styles.paymentDetails}>Payout Amount</Text>
                <Text style={styles.paymentDetails}>
                  {new Intl.NumberFormat("en-KE", { style: "currency", currency: "KES" })
                    .format(item?.amount + item?.additionalFees)
                    .replace("Ksh", "")}
                </Text>
              </View>
              <View style={styles.payFlex}>
                <Text style={styles.paymentDetails}>Balance Amount</Text>
                <Text style={styles.paymentDetails}>
                  {new Intl.NumberFormat("en-KE", { style: "currency", currency: "KES" })
                    .format(item?.amount + item?.additionalFees - item?.amountPaid)
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
              <Text style={styles.relatedHeader}>Payment Tracker </Text>
              <View style={styles.wrapperRelated}>
                <SupplierPaymentTracker userData={userData} paymentId={item?._id} />
              </View>
            </View>

            <View style={[styles.relatedRow, { justifyContent: "center" }]}>
              <Text style={styles.relatedHeader}>Related information</Text>
              <View style={styles.wrapperRelated}>
                <View style={styles.leftRelated}>
                  <TouchableOpacity style={styles.supplierImage}>
                    <Image
                      source={require("../../../assets/images/promoking-logo.png")}
                      style={{ width: 40, height: 40, borderRadius: 1999 }}
                    />
                  </TouchableOpacity>
                  <View style={{ gap: 5, alignItems: "flex-start", paddingTop: 3, marginStart: 6 }}>
                    <Text style={styles.supplierHead}>Promokings limited</Text>
                    <Text style={styles.supplierwho}> Manager</Text>
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
          </ScrollView>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default SupplyDetails;

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
  lowerRow2: {
    marginTop: 7,
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
  inputWrapper2: {
    backgroundColor: COLORS.lightWhite,
    borderWidth: 1,
    height: 100,
    borderRadius: 12,
    flexDirection: "row",
    paddingHorizontal: 15,
    alignItems: "center",
    borderColor: "#CCC",
    width: SIZES.width - 50,
    alignSelf: "center",
    // marginVertical: 10,
  },
  submitBtn: {
    backgroundColor: COLORS.primary,
    padding: 6,
    marginVertical: 10,
    borderRadius: SIZES.medium,
    alignItems: "center",
    height: 60,
    // marginBottom: -60,
    justifyContent: "center",
  },
  deleteBtn: {
    backgroundColor: COLORS.red,
    padding: 6,
    marginVertical: 10,
    borderRadius: SIZES.medium,
    alignItems: "center",
    height: 60,
    // marginBottom: -60,
    justifyContent: "center",
  },
  cancelBtn: {
    backgroundColor: COLORS.gray2,
    padding: 6,
    marginVertical: 10,
    borderRadius: SIZES.medium,
    alignItems: "center",
    height: 60,
    // marginBottom: -60,
    justifyContent: "center",
  },
  completeBtn: {
    backgroundColor: COLORS.green,
    padding: 6,
    marginVertical: 10,
    borderRadius: SIZES.medium,
    alignItems: "center",
    height: 60,
    // marginBottom: -60,
    justifyContent: "center",
  },
  submitText: {
    color: COLORS.white,
    fontWeight: "bold",
  },
  actionFlex: {
    display: "flex",
    flexDirection: "row",
  },
  divider: {
    backgroundColor: COLORS.themey,
    height: 4,
    marginHorizontal: 5,
    borderRadius: 10,
  },
});
