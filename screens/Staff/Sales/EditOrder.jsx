import React, { useState, useEffect, useContext } from "react";
import { View, Text, Button, TextInput, StyleSheet, TouchableOpacity, ScrollView, Image, Alert } from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";
import Icon from "../../../constants/icons";
import { SIZES, COLORS } from "../../../constants";
import { Picker } from "@react-native-picker/picker";
import { ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { BACKEND_PORT } from "@env";
import axios from "axios";
import { AuthContext } from "../../../components/auth/AuthContext";
import useFetch from "../../../hook/useFetch";

const EditSalesOrder = () => {
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

  const handleAssignDriver = async () => {
    if (assignedDriver && orderId) {
      setUploading(true);
      try {
        const response = await fetch(`${BACKEND_PORT}/api/orders/assignDriver`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ orderId, driverId: assignedDriver, assignee: userData._id }),
        });

        const data = await response.json();

        if (!data.success) {
          throw new Error(data.message || "Failed to assign driver");
        }
        setDeliveryData(data.delivery);

        alert("Driver assigned successfully!");
      } catch (error) {
        console.warn("Error assigning driver:", error);
        alert(error);
      } finally {
        setTimeout(() => {
          setIsAssigning(false);
          setAssignedDriver(null);
          setUploading(false);
        }, 2000);
      }
    }
  };
  const handleCancelOrder = async () => {
    setUploading(true);
    const status = "cancelled";

    if (!orderId) {
      Alert.alert("Error", "Order ID is required!");
      setUploading(false);
      return;
    }

    Alert.alert("Confirm cancelling", "Are you sure you want to cancel this order?", [
      {
        text: "Cancel",
        style: "cancel",
        onPress: () => setUploading(false),
      },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            const response = await fetch(`${BACKEND_PORT}/api/order/${orderId}`, {
              method: "PATCH",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ status }),
            });

            const data = await response.json();

            if (!data.success) {
              throw new Error(data.message || "Failed to cancel order");
            }

            alert("Order cancelled");
            navigation.replace("OrdersSales", { refresh: true, refreshin: true });
            setTimeout(() => {
              navigation.navigate("Sales Navigation");
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
  const handleCompleteOrder = async () => {
    setUploading2(true);
    const status = "completed";

    if (!orderId) {
      Alert.alert("Error", "Order ID is required!");
      setUploading(false);
      return;
    }

    Alert.alert("Confirm completing", "Are you sure you want to complete this order?", [
      {
        text: "Cancel",
        style: "cancel",
        onPress: () => setUploading2(false),
      },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            const response = await fetch(`${BACKEND_PORT}/api/order/${orderId}`, {
              method: "PATCH",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ status }),
            });

            const data = await response.json();

            if (!data.success) {
              throw new Error(data.message || "Failed to complete order");
            }

            alert("Order completed");
            navigation.replace("OrdersSales", { refresh: true, refreshin: true });
            setTimeout(() => {
              navigation.navigate("Sales Navigation");
            }, 500);
          } catch (error) {
            console.warn("Error completting Order:", error);
            alert(error);
          } finally {
            setTimeout(() => {
              setIsAssigning(false);
              setAssignedDriver(null);
              setUploading2(false);
            }, 2000);
          }
        },
      },
    ]);
  };
  const handleApproveOrder = async () => {
    const status = "approved";

    if (!orderId) {
      Alert.alert("Error", "Order ID is required!");
      setUploading(false);
      return;
    }

    Alert.alert("Confirm Approving", "Are you sure you want to approve this order?", [
      {
        text: "Cancel",
        style: "cancel",
        onPress: () => setUploading(false),
      },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            const response = await fetch(`${BACKEND_PORT}/api/order/${orderId}`, {
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

            alert("Order approved");
            navigation.replace("OrdersSales", { refresh: true, refreshin: true });
            setTimeout(() => {
              navigation.navigate("Sales Navigation");
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

  const handleDeleteOrder = async () => {
    setIsLoading(true);

    if (!orderId) {
      Alert.alert("Error", "Order ID is required!");
      setUploading(false);
      return;
    }

    Alert.alert("Confirm Deletion", "Are you sure you want to delete this order?", [
      {
        text: "Cancel",
        style: "cancel",
        onPress: () => setUploading(false),
      },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            const response = await axios.delete(`${BACKEND_PORT}/api/orders/${orderId}`);

            if (response.data.success) {
              Alert.alert("Success", "Order deleted successfully!");
              navigation.navigate("OrdersSales");
            } else {
              throw new Error(response.data.message || "Failed to delete order");
            }
          } catch (error) {
            console.error("Error deleting order:", error);
            Alert.alert("Error", "Failed to delete order. Please try again.");
          } finally {
            setIsLoading(false);
          }
        },
      },
    ]);
  };

  const DriverDetails = () => {
    if (!(isApproving || isAssigning || deliveryLoading)) {
      return (
        <View>
          <View style={{ paddingHorizontal: 10 }}>
            <Text>Assigned Driver : {deliveryData ? deliveryData?.driver?.fullName : "Unassigned"}</Text>
          </View>
          <View style={{ paddingHorizontal: 10 }}>
            <Text>Assigned Time : {deliveryData ? deliveryData?.assignedAt : "Unassigned"}</Text>
          </View>
          <View style={{ paddingHorizontal: 10 }}>
            <Text>Vehicle Registration: {deliveryData ? deliveryData?.driver?.numberPlate : "Unassigned"}</Text>
          </View>
          <View style={{ paddingHorizontal: 10 }}>
            <Text>Phone Number: {deliveryData ? deliveryData?.driver?.phoneNumber : "Unassigned"}</Text>
          </View>
        </View>
      );
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
              <Text style={styles.topheading}>Order Actions</Text>

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
                {item.deliveryStatus === "transit" ? "in delivery" : item.status}
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

            <View style={[styles.relatedRow, { marginBottom: 1 }]}>
              <View style={styles.stepContainer}>
                <View style={{ justifyContent: "space-between", marginTop: 10, display: "flex", flexDirection: "row" }}>
                  <Text style={styles.relatedHeader}>Actions</Text>
                  <View style={styles.actionFlex}>
                    <TouchableOpacity
                      style={styles.buttonWrap}
                      onPress={() => {
                        setIsAssigning(!isAssigning);
                        setIsApproving(false);
                      }}
                    >
                      <Icon name="delivery" size={26} />
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.buttonWrap}
                      onPress={() => {
                        handleApproveOrder();
                      }}
                    >
                      <Icon name="pencil" size={26} />
                    </TouchableOpacity>
                  </View>
                </View>
                <DriverDetails />
                <View style={styles.pickerWrapper}>
                  {isAssigning && (
                    <View>
                      <View>
                        <Text style={styles.pickerLabel}>Assign Driver</Text>
                      </View>
                      <View style={styles.pickerBox}>
                        <Picker
                          selectedValue={assignedDriver}
                          onValueChange={(itemValue) => {
                            setAssignedDriver(itemValue);
                          }}
                          style={styles.picker}
                        >
                          <Picker.Item label="Select a driver" value={""} style={styles.pickerBox} />
                          {drivers &&
                            drivers.map((sup) => <Picker.Item key={sup._id} label={sup.fullName} value={sup._id} />)}
                        </Picker>
                      </View>

                      <TouchableOpacity style={styles.submitBtn} onPress={handleAssignDriver}>
                        {uploading ? (
                          <ActivityIndicator size={30} color={COLORS.themew} />
                        ) : (
                          <Text style={styles.submitText}>Assign Driver</Text>
                        )}
                      </TouchableOpacity>
                    </View>
                  )}

                  {isApproving && (
                    <>
                      <Text style={styles.pickerLabel}>Assign Driver</Text>
                      <View style={styles.pickerBox}>
                        <Picker
                          selectedValue={assignedDriver}
                          onValueChange={(itemValue, itemIndex) => {
                            setAssignedDriver(itemValue);
                          }}
                          style={styles.picker}
                        >
                          <Picker.Item label="Select a driver" value={""} style={styles.pickerBox} />
                          {drivers &&
                            drivers.map((sup) => {
                              return <Picker.Item key={sup._id} label={sup.fullName} value={sup.name} />;
                            })}
                        </Picker>
                      </View>
                    </>
                  )}
                </View>
              </View>
            </View>

            <View style={[styles.relatedRow, { marginBottom: 10 }]}>
              <View>
                <Text style={styles.relatedHeader}>Critical Actions</Text>
                <TouchableOpacity style={styles.completeBtn} onPress={handleCompleteOrder}>
                  {uploading2 ? (
                    <ActivityIndicator size={30} color={COLORS.themew} />
                  ) : (
                    <Text style={styles.submitText}>Mark Order Complete</Text>
                  )}
                </TouchableOpacity>
                <TouchableOpacity style={styles.cancelBtn} onPress={handleCancelOrder}>
                  {uploading ? (
                    <ActivityIndicator size={30} color={COLORS.themew} />
                  ) : (
                    <Text style={styles.submitText}>Cancel Order</Text>
                  )}
                </TouchableOpacity>
                <TouchableOpacity style={styles.deleteBtn} onPress={handleDeleteOrder}>
                  {isLoading ? (
                    <ActivityIndicator size={30} color={COLORS.themew} />
                  ) : (
                    <Text style={styles.submitText}>Delete Order</Text>
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

export default EditSalesOrder;

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
  },
});
