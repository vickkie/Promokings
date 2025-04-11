import React, { useState, useEffect, useContext } from "react";
import {
  View,
  Text,
  Button,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert,
  Modal,
} from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";
import Icon from "../../../constants/icons";
import { SIZES, COLORS } from "../../../constants";

import { ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";

import { BACKEND_PORT } from "@env";
import axios from "axios";
import { AuthContext } from "../../../components/auth/AuthContext";
import useFetch from "../../../hook/useFetch";

const EditSupplierPaymentDetails = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { bidId, item: order } = route.params;
  const { userData, userLogin } = useContext(AuthContext);

  const [partialAmount, setPartialAmount] = useState("");
  const [AdditionalAmount, setAdditionalAmount] = useState("");
  const [showPartialModal, setShowPartialModal] = useState(false);
  const [showAdditionalModal, setShowAdditionalModal] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [drivers, setDrivers] = useState(null);
  const [item, setItem] = useState(order);
  const [deliveryData, setDeliveryData] = useState(null);
  const [assignedDriver, setAssignedDriver] = useState(null);
  const [isAssigning, setIsAssigning] = useState(false);
  const [isApproving, setIsApproving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploading2, setUploading2] = useState(false);

  console.log(bidId);

  const handleCancelPayment = async () => {
    setUploading(true);
    const status = "Pending";

    if (!bidId) {
      Alert.alert("Error", "Payment ID is required!");
      setUploading(false);
      return;
    }

    Alert.alert("Confirm cancelling", "Are you sure you want to cancel this payment?\n\n\nWill be set to (pending)", [
      {
        text: "Cancel",
        style: "cancel",
        onPress: () => setUploading(false),
      },
      {
        text: "Cancel",
        style: "destructive",
        onPress: async () => {
          try {
            const response = await fetch(`${BACKEND_PORT}/api/v3/payments/${bidId}`, {
              method: "PATCH",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ status }),
            });

            const data = await response.json();

            if (!data.success) {
              throw new Error(data.message || "Failed to cancel order");
            } else {
              Toast.show({
                type: "success",
                text1: "Cancelling Completed",
                text2: "Cancelling has been completed successfully",
              });
            }
            // navigation.replace("OrderPaymentDetails", { refresh: true, refreshing: true });
            setTimeout(() => {
              navigation.navigate("Finance Navigation", {
                screen: "FinanceDashboard", // 👈 Specify the screen inside the navigator
                params: { refreshList: true }, // 👈 Pass params properly
              });
            }, 500);
          } catch (error) {
            console.warn("Error cancelling Order:", error);
            alert(error);
          } finally {
            setTimeout(() => {
              setIsAssigning(false);
              setAssignedDriver(null);
              setUploading(false);
            }, 2000);
          }
        },
      },
    ]);
  };

  const handleApprovePayment = async () => {
    const status = "Paid";

    if (!bidId) {
      Alert.alert("Error", "Order ID is required!");
      setUploading(false);
      return;
    }

    Alert.alert("Confirm Approving Payment", "Are you sure you want to approve this payment?", [
      {
        text: "Cancel",
        style: "cancel",
        onPress: () => setUploading(false),
      },
      {
        text: "Approve",
        style: "destructive",
        onPress: async () => {
          try {
            const response = await fetch(`${BACKEND_PORT}/api/v3/payments/${bidId}`, {
              method: "PATCH",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ status }),
            });

            const data = await response.json();

            if (!data.success) {
              throw new Error(data.message || "Failed to approve order");
            }

            Toast.show({
              type: "success",
              text1: "Approval Completed",
              text2: "Approval has been completed successfully",
            });

            // navigation.replace("OrdersSales", { refresh: true, refreshin: true });
            setTimeout(() => {
              navigation.navigate("Finance Navigation", {
                screen: "Payments",
                params: { refreshList: true, refresh: true },
              });
            }, 500);
          } catch (error) {
            console.warn("Error approving Order:", error);
            alert(error);
          } finally {
            setTimeout(() => {}, 2000);
          }
        },
      },
    ]);
  };

  const handlePartialPayment = () => {
    if (!bidId) {
      Alert.alert("Error", "Order ID is required!");
      return;
    }

    // First ask for amount
    Alert.prompt?.(
      // iOS only
      "Enter Partial Amount",
      "Input the amount to approve for this partial payment",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Approve",
          onPress: (amount) => {
            if (!amount || isNaN(amount)) {
              Alert.alert("Invalid Input", "Please enter a valid number");
              return;
            }

            approvePartial(amount);
          },
        },
      ],
      "plain-text",
      ""
    ) || setShowPartialModal(true);
  };
  const handleAdditionalPayment = () => {
    if (!bidId) {
      Alert.alert("Error", "Order ID is required!");
      return;
    }

    // First ask for amount
    Alert.prompt?.(
      // iOS only
      "Enter additional Fees Amount",
      "Input the amount to approve for this additional payment",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Approve",
          onPress: (amount) => {
            if (!amount || isNaN(amount)) {
              Alert.alert("Invalid Input", "Please enter a valid number");
              return;
            }

            approveAdditional(amount);
          },
        },
      ],
      "plain-text",
      ""
    ) || setShowAdditionalModal(true);
  };

  const approvePartial = async (amount) => {
    try {
      const response = await fetch(`${BACKEND_PORT}/api/v3/payments/${bidId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status: "Partial",
          amountPaid: Number(amount),
        }),
      });
      console.log(response);

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.message || "Failed to approve order");
      }

      Toast.show({
        type: "success",
        text1: "Partial Approval Completed",
        text2: "Partial payment of " + amount + " approved successfully",
      });

      setTimeout(() => {
        navigation.navigate("Finance Navigation", {
          screen: "SupplierPayments",
          params: { refreshList: true },
        });
      }, 500);
    } catch (error) {
      console.warn("Error approving Order:", error);
      Alert.alert("Error", error.message);
    }
  };
  const approveAdditional = async (amount) => {
    try {
      const response = await fetch(`${BACKEND_PORT}/api/v3/payments/additional/${bidId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          additionalFees: Number(amount),
        }),
      });
      console.log(response);

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.message || "Failed to approve order");
      }

      Toast.show({
        type: "success",
        text1: "Additional Amount Completed",
        text2: "Additional payment of " + amount + " approved successfully",
      });

      setTimeout(() => {
        navigation.navigate("Finance Navigation", {
          screen: "SupplierPayments",
          params: { refreshList: true },
        });
      }, 500);
    } catch (error) {
      console.warn("Error approving Order:", error);
      Alert.alert("Error", error.message);
    }
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
              <Text style={styles.topheading}>Payment Actions</Text>

              <TouchableOpacity
                onPress={() => {
                  navigation.navigate("InvoiceScreen", {
                    order: item,
                  });
                }}
                style={styles.outWrap}
              >
                <Icon name="receipt" size={28} />
              </TouchableOpacity>
            </View>

            <Text style={{ fontFamily: "GtAlpine", color: COLORS.themeb, fontSize: SIZES.medium, marginVertical: 15 }}>
              Transaction id : {item?.TransactionId ?? bidId}
            </Text>

            <TouchableOpacity
              style={{
                backgroundColor:
                  item?.status === "Pending"
                    ? "#ffedd2"
                    : item?.status === "Paid"
                    ? "#CBFCCD"
                    : item?.status === "Partial"
                    ? "#C0DAFF"
                    : item?.status === "Failed"
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
                    item?.status === "Pending"
                      ? "#D4641B"
                      : item?.status === "Paid"
                      ? "#26A532"
                      : item?.status === "Partial"
                      ? "#337DE7"
                      : item?.status === "Failed"
                      ? "#B65454"
                      : COLORS.primary,
                }}
              >
                {item?.status}
              </Text>
            </TouchableOpacity>

            <View style={styles.stepsheader}>
              <Text style={styles.stepstext}>You can edit payment details from here</Text>
            </View>
          </View>

          <ScrollView>
            <View style={styles.lowerRow}>
              <ScrollView>
                <View style={styles.stepContainer}>
                  <View style={{ justifyContent: "center", marginVertical: 6 }}>
                    <Text style={styles.relatedHeader}>NOTES</Text>
                  </View>
                  <View style={styles.inputWrapper2}>
                    <TextInput style={{ flex: 1 }} value={item?.notes} editable={false} />
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
                    .format(item?.amount - item?.amountPaid)
                    .replace("Ksh", "")}
                </Text>
              </View>
            </View>
            <Modal visible={showPartialModal} transparent animationType="slide">
              <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#00000099" }}>
                <View style={{ backgroundColor: "#fff", padding: 20, borderRadius: 10, width: "80%" }}>
                  <Text style={{ fontSize: 18, marginBottom: 10 }}>Enter Partial Payment Amount</Text>
                  <TextInput
                    placeholder="Amount"
                    keyboardType="numeric"
                    value={partialAmount}
                    onChangeText={setPartialAmount}
                    style={{
                      borderWidth: 1,
                      borderColor: "#ccc",
                      padding: 10,
                      marginBottom: 10,
                      borderRadius: 5,
                    }}
                  />
                  <View style={{ flexDirection: "row", justifyContent: "flex-end" }}>
                    <Button title="Cancel" onPress={() => setShowPartialModal(false)} />
                    <View style={{ width: 10 }} />
                    <Button
                      title="Approve"
                      onPress={() => {
                        if (!partialAmount || isNaN(partialAmount)) {
                          Alert.alert("Invalid amount");
                          return;
                        }
                        approvePartial(partialAmount);
                        setShowPartialModal(false);
                      }}
                    />
                  </View>
                </View>
              </View>
            </Modal>
            <Modal visible={showAdditionalModal} transparent animationType="slide">
              <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#00000099" }}>
                <View style={{ backgroundColor: "#fff", padding: 20, borderRadius: 10, width: "80%" }}>
                  <Text style={{ fontSize: 18, marginBottom: 10 }}>Enter Additional Payment Amount</Text>
                  <TextInput
                    placeholder="Amount"
                    keyboardType="numeric"
                    value={AdditionalAmount}
                    onChangeText={setAdditionalAmount}
                    style={{
                      borderWidth: 1,
                      borderColor: "#ccc",
                      padding: 10,
                      marginBottom: 10,
                      borderRadius: 5,
                    }}
                  />
                  <View style={{ flexDirection: "row", justifyContent: "flex-end" }}>
                    <Button title="Cancel" onPress={() => setShowAdditionalModal(false)} />
                    <View style={{ width: 10 }} />
                    <Button
                      title="Approve"
                      onPress={() => {
                        if (!AdditionalAmount || isNaN(AdditionalAmount)) {
                          Alert.alert("Invalid amount");
                          return;
                        }
                        approveAdditional(AdditionalAmount);
                        setShowAdditionalModal(false);
                      }}
                    />
                  </View>
                </View>
              </View>
            </Modal>

            <View style={[styles.relatedRow, { marginBottom: 10 }]}>
              <View>
                <Text style={styles.relatedHeader}>Payment Actions</Text>
                <TouchableOpacity style={styles.completeBtn} onPress={handleApprovePayment}>
                  {uploading2 ? (
                    <ActivityIndicator size={30} color={COLORS.themew} />
                  ) : (
                    <Text style={styles.submitText}>Mark Payment Complete</Text>
                  )}
                </TouchableOpacity>
                <TouchableOpacity style={styles.partialBtn} onPress={handlePartialPayment}>
                  {uploading ? (
                    <ActivityIndicator size={30} color={COLORS.themew} />
                  ) : (
                    <Text style={[styles.submitText]}>Mark Partial Payment</Text>
                  )}
                </TouchableOpacity>
                <TouchableOpacity style={styles.additionalFeesBtn} onPress={handleAdditionalPayment}>
                  {isLoading ? (
                    <ActivityIndicator size={30} color={COLORS.themew} />
                  ) : (
                    <Text style={styles.submitText}>Add Additional Payment</Text>
                  )}
                </TouchableOpacity>
                <TouchableOpacity style={styles.deleteBtn} onPress={handleCancelPayment}>
                  {isLoading ? (
                    <ActivityIndicator size={30} color={COLORS.themew} />
                  ) : (
                    <Text style={styles.submitText}>Cancel Payment</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default EditSupplierPaymentDetails;

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
    // minHeight: SIZES.height / 4,
    marginTop: 10,
    height: "auto",
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
  driverImage: {
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
  driverHead: {
    fontFamily: "semibold",
    fontSize: SIZES.medium,
  },
  driverwho: {
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
  pickerWrapper: {
    marginBottom: 10,
    marginstart: 10,
    paddingLeft: 10,
  },
  pickerLabel: {
    fontFamily: "regular",
    fontSize: SIZES.medium,
    marginBottom: 5,
    textAlign: "left",
  },

  label: {
    fontFamily: "regular",
    fontSize: SIZES.medium,
    marginBottom: 5,
    textAlign: "right",
  },
  picker: {
    height: 40,
    borderColor: "gray",
    borderWidth: 1,
    color: COLORS.black,
    backgroundColor: COLORS.themeg,
    borderRadius: SIZES.medium,
  },
  pickerBox: {
    borderRadius: 20,
    overflow: "hidden",
    // backgroundColor: "red",
    height: 50,
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
  partialBtn: {
    backgroundColor: COLORS.info,
    padding: 6,
    marginVertical: 10,
    borderRadius: SIZES.medium,
    alignItems: "center",
    height: 60,
    // marginBottom: -60,
    justifyContent: "center",
  },
  additionalFeesBtn: {
    backgroundColor: "blue",
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
