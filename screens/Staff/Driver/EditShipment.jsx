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

const EditShipmentDriver = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { shipmentId, order, shipment } = route.params;
  const { userData, userLogin } = useContext(AuthContext);

  const {
    data: delivery,
    isLoading: deliveryLoading,
    error: deliveryError,
    refetch: deliveryRefetch,
    errorMessage: deliveryErrorMessage,
  } = useFetch(`orders/${shipment?.orderId?._id}`);
  //   console.log(shipment?.orderId?._id);

  const [isLoading, setIsLoading] = useState(false);

  const [item, setItem] = useState(shipment);
  const [deliveryData, setDeliveryData] = useState(null);
  const [assignedDriver, setAssignedDriver] = useState(null);
  const [isAssigning, setIsAssigning] = useState(false);
  const [isApproving, setIsApproving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploading2, setUploading2] = useState(false);
  const [driverNotes, setDriverNotes] = useState(shipment?.driverNotes);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    // console.log(delivery?.order);
    if (!deliveryLoading && delivery && delivery?.status === "success") {
      setDeliveryData(Array.isArray(delivery?.order) ? delivery?.order[0] : delivery?.order);
    }
  }, [deliveryLoading, delivery]);

  const handleCancelOrder = async () => {
    setUploading(true);
    const status = "cancelled";

    if (!shipmentId || !driverNotes) {
      Alert.alert("Error", "shipment ID and driver notes is required!");
      setUploading(false);
      return;
    }

    Alert.alert("Confirm cancelling", "Are you sure you want to cancel this delivery?", [
      {
        text: "Cancel",
        style: "cancel",
        onPress: () => setUploading(false),
      },
      {
        text: "Confirm",
        style: "destructive",
        onPress: async () => {
          try {
            const response = await fetch(`${BACKEND_PORT}/api/shipment/${shipmentId}`, {
              method: "PUT",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ status, driverNotes }),
            });

            const data = await response.json();

            // console.log(shipmentId);
            // console.log(data);

            if (response.status !== 200) {
              throw new Error(data.message || "Failed to cancel order");
            }

            // When delivery is cancelled
            Toast.show({
              type: "success",
              text1: "Delivery Cancelled",
              text2: "The delivery has been cancelled successfully",
            });
          } catch (error) {
            console.warn("Error cancelling Delivery:", error);
            alert(error);
          } finally {
            setTimeout(() => {
              setUploading(false);
            }, 2000);
          }
        },
      },
    ]);
  };
  const handleCompleteOrder = async () => {
    setUploading2(true);
    const status = "delivered";

    if (!shipmentId || !driverNotes) {
      Alert.alert("Error", "Order ID and driver notes are required!");
      setUploading2(false);
      return;
    }

    Alert.alert("Confirm completing", "Are you sure you want to complete this delivery?", [
      {
        text: "Cancel",
        style: "cancel",
        onPress: () => setUploading2(false),
      },
      {
        text: "Confirm",
        style: "destructive",
        onPress: async () => {
          try {
            const response = await fetch(`${BACKEND_PORT}/api/shipment/${shipmentId}`, {
              method: "PUT",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ status, driverNotes }),
            });

            const data = await response.json();
            setItem(data);

            if (response.status === 200) {
              // When delivery is cancelled
              Toast.show({
                type: "success",
                text1: "Delivery Completed",
                text2: "The delivery has been completed successfully",
              });

              setTimeout(() => {
                navigation.navigate("Driver Navigation", {});
              }, 3000);
            } else {
              Toast.show({
                type: "error",
                text1: "Completion update failed",
                text2: "The delivery update Failed. Please contact Admin",
              });
            }
          } catch (error) {
            console.warn("Error completting Delivery:", error);
            alert(error);
          } finally {
            setTimeout(() => {
              setAssignedDriver(null);
              setUploading2(false);
            }, 2000);
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
              <Text style={styles.topheading}>Order Actions</Text>

              <TouchableOpacity
                onPress={() => {
                  //   console.log(delivery);
                  //   navigation.navigate("InvoiceScreen", {
                  //     order: deliveryData,
                  //   });
                }}
                style={styles.outWrap}
              >
                <Icon name="receipt" size={28} />
              </TouchableOpacity>
            </View>

            <Text style={{ fontFamily: "GtAlpine", color: COLORS.themeb, fontSize: SIZES.medium, marginVertical: 15 }}>
              Shipment No : {shipment?.deliveryId}
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
                      : item.status === "transit"
                      ? "#337DE7"
                      : item.status === "cancelled"
                      ? "#B65454"
                      : COLORS.primary,
                }}
              >
                {item.deliveryStatus === "transit" ? "in delivery" : item.status}
              </Text>
            </TouchableOpacity>

            <View style={styles.stepsheader}>
              <Text style={styles.stepstext}>You can update your shipment from here</Text>
            </View>
          </View>

          <ScrollView>
            <View style={styles.lowerRow}>
              <ScrollView>
                <View style={styles.stepContainer}>
                  <View style={{ justifyContent: "space-between", marginVertical: 6 }}>
                    <View style={styles.actionFlex}>
                      <Text style={styles.relatedHeader}>ADD NOTES</Text>
                      <TouchableOpacity
                        style={styles.buttonWrap}
                        onPress={() => {
                          setIsEditing(!isEditing);
                        }}
                      >
                        <Icon name="pencil" size={26} />
                      </TouchableOpacity>
                    </View>
                  </View>

                  <View style={styles.inputWrapper2}>
                    <TextInput
                      style={{ flex: 1, minHeight: 100, textAlignVertical: "top" }}
                      onChangeText={setDriverNotes}
                      value={driverNotes}
                      editable={isEditing}
                      multiline={true}
                      numberOfLines={4} // Adjust as needed
                    />
                  </View>
                </View>
              </ScrollView>
            </View>

            <View style={[styles.relatedRow, { marginBottom: 10 }]}>
              <View>
                <Text style={styles.relatedHeader}> Actions</Text>
                <TouchableOpacity style={styles.completeBtn} onPress={handleCompleteOrder}>
                  {uploading2 ? (
                    <ActivityIndicator size={30} color={COLORS.themew} />
                  ) : (
                    <Text style={styles.submitText}>Mark Order Complete</Text>
                  )}
                </TouchableOpacity>

                <TouchableOpacity style={styles.deleteBtn} onPress={handleCancelOrder}>
                  {uploading ? (
                    <ActivityIndicator size={30} color={COLORS.themew} />
                  ) : (
                    <Text style={styles.submitText}>Cancel Order</Text>
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

export default EditShipmentDriver;

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
    justifyContent: "space-between",
  },
});
