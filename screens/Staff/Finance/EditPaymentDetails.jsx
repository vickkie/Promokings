import React, { useState, useEffect, useContext } from "react";
import { View, Text, Button, TextInput, StyleSheet, TouchableOpacity, ScrollView, Image, Alert } from "react-native";
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

const EditPaymentDetails = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { products, totals, orderId, item: order } = route.params;
  const { userData, userLogin } = useContext(AuthContext);

  const {
    data: alldrivers,
    isLoading: driverLoading,
    error,
    refetch,
    errorMessage: driverError,
  } = useFetch("staff/drivers");
  const {
    data: delivery,
    isLoading: deliveryLoading,
    error: deliveryError,
    refetch: deliveryRefetch,
    errorMessage: deliveryErrorMessage,
  } = useFetch(`orders/delivery/${orderId}`);

  const [isLoading, setIsLoading] = useState(false);
  const [drivers, setDrivers] = useState(null);
  const [item, setItem] = useState(order);
  const [deliveryData, setDeliveryData] = useState(null);
  const [assignedDriver, setAssignedDriver] = useState(null);
  const [isAssigning, setIsAssigning] = useState(false);
  const [isApproving, setIsApproving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploading2, setUploading2] = useState(false);

  useEffect(() => {
    if (!driverLoading && alldrivers && !driverError) {
      setDrivers(alldrivers);
      //   console.log(alldrivers);
    }
  }, [driverLoading, alldrivers]);

  useEffect(() => {
    if (!deliveryLoading && delivery && !deliveryErrorMessage) {
      setDeliveryData(Array.isArray(delivery) ? delivery[0] : delivery);
    }
  }, [deliveryLoading, delivery]);

  const handleCancelOrder = async () => {
    setUploading(true);
    const paymentStatus = "pending";

    if (!orderId) {
      Alert.alert("Error", "Order ID is required!");
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
            const response = await fetch(`${BACKEND_PORT}/api/order/paymentStatus/${orderId}`, {
              method: "PATCH",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ paymentStatus }),
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

  const handleApproveOrder = async () => {
    const paymentStatus = "paid";

    if (!orderId) {
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
            const response = await fetch(`${BACKEND_PORT}/api/order/paymentStatus/${orderId}`, {
              method: "PATCH",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ paymentStatus }),
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
  const handlePartialPayment = async () => {
    const paymentStatus = "partial";

    if (!orderId) {
      Alert.alert("Error", "Order ID is required!");
      setUploading(false);
      return;
    }

    Alert.alert("Confirm Partial Payment", "Are you sure you want to approve this payment?", [
      {
        text: "Cancel",
        style: "cancel",
        onPress: () => setUploading(false),
      },
      {
        text: "Approve Partial",
        style: "destructive",
        onPress: async () => {
          try {
            const response = await fetch(`${BACKEND_PORT}/api/order/paymentStatus/${orderId}`, {
              method: "PATCH",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ paymentStatus }),
            });

            const data = await response.json();

            if (!data.success) {
              throw new Error(data.message || "Failed to approve order");
            }

            Toast.show({
              type: "success",
              text1: "Partial Approval Completed",
              text2: "Partial Approval has been completed successfully",
            });
            // navigation.replace("OrdersSales", { refresh: true, refreshin: true });
            setTimeout(() => {
              navigation.navigate("Finance Navigation", {
                screen: "FinanceDashboard", // 👈 Specify the screen inside the navigator
                params: { refreshList: true }, // 👈 Pass params properly
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
              Order id : {orderId}
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
                paddingVertical: 4,
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
                <Text style={styles.relatedHeader}>Payment Actions</Text>
                <TouchableOpacity style={styles.completeBtn} onPress={handleApproveOrder}>
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
                    <Text style={styles.submitText}>Mark Payment Partial</Text>
                  )}
                </TouchableOpacity>
                <TouchableOpacity style={styles.deleteBtn} onPress={handleCancelOrder}>
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

export default EditPaymentDetails;

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
    backgroundColor: COLORS.themey,
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
});
