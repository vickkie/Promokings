import React, { useState, useEffect, useContext, useRef } from "react";
import {
  View,
  Text,
  Button,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  ActivityIndicator,
  Linking,
} from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";
import Icon from "../../../constants/icons";
import { SIZES, COLORS } from "../../../constants";

import { SafeAreaView } from "react-native-safe-area-context";
import useFetch from "../../../hook/useFetch";

import useDelete from "../../../hook/useDelete2";
import { BACKEND_PORT } from "@env";
import axios from "axios";
import { AuthContext } from "../../../components/auth/AuthContext";
import BidToInventory from "../../../components/bottomsheets/BidToInventory";
import { Alert } from "react-native";

const BidDetails = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { bid, bidId } = route.params;
  const { userData, userLogin } = useContext(AuthContext);

  const [isLoading, setIsLoading] = useState(false);
  const [isLoading2, setIsLoading2] = useState(false);

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

  const handleEmailPress = (supplierEmail) => {
    Linking.openURL(`mailto:${supplierEmail}`);
  };

  const handleCallPress = (supplierPhone) => {
    const phoneNumber = supplierPhone;
    Linking.openURL(`tel:${phoneNumber}`);
  };

  const handleCompleteOrder = async () => {
    setIsLoading2(true);

    const status = "Completed";

    if (!bidId || !bid?.selectedSupplier) {
      Alert.alert("Error", "Bid ID and supplier are required!");
      setIsLoading2(false);
      return;
    }

    const selectedSupplier = bid?.selectedSupplier;

    Alert.alert("Confirm supply completion", "Are you sure you want to complete this order?", [
      {
        text: "Cancel",
        style: "cancel",
        onPress: () => setIsLoading2(false),
      },
      {
        text: "Confirm",
        style: "destructive",
        onPress: async () => {
          try {
            const response = await fetch(`${BACKEND_PORT}/api/inventory-requests/status/${bidId}`, {
              method: "PATCH",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ status, selectedSupplier }),
            });

            const data = await response.json();

            if (!data.success) {
              throw new Error(data.message || "Failed to complete order");
            }

            Alert.alert("Order completed");

            navigation.replace("BidList", { refresh: true, refreshin: true });
            setTimeout(() => {
              navigation.navigate("Inventory Navigation");
            }, 500);
          } catch (error) {
            console.warn("Error completting Order:", error);
            alert(error);
          } finally {
            setTimeout(() => {
              setIsLoading2(false);
            }, 2000);
          }
        },
      },
    ]);
  };

  const handleDeleteOrder = async () => {
    setIsLoading(true);

    if (!bidId) {
      Alert.alert("Error", "Bid ID is required!");
      setIsLoading(false);
      return;
    }

    Alert.alert("Confirm Deletion", "Are you sure you want to delete this bid?", [
      {
        text: "Cancel",
        style: "cancel",
        onPress: () => setIsLoading(false),
      },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            const response = await axios.delete(`${BACKEND_PORT}/api/inventory-requests/${bidId}/delete`);

            if (response.data.success) {
              Alert.alert("Success", "Supply Bid deleted successfully!");
              navigation.navigate("BidList");
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
                  //   navigation.navigate("EditSalesOrder", {
                  //     products: products,
                  //     bidId: bidId,
                  //     item: item,
                  //   });
                }}
                style={styles.outWrap}
              >
                <Icon name="receipt" size={28} />
              </TouchableOpacity>
            </View>

            <Text style={{ fontFamily: "GtAlpine", color: COLORS.themeb, fontSize: SIZES.medium, marginVertical: 15 }}>
              Bid id : {bidId}
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
              <Text style={styles.stepstext}>View & edit your bid details from here</Text>
            </View>
          </View>

          <ScrollView>
            <View style={styles.lowerRow}>
              <ScrollView>
                <View style={styles.stepContainer}>
                  <View style={{ justifyContent: "center", marginVertical: 20 }}>
                    <Text style={styles.relatedHeader}>Supply Bid items</Text>
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
            <View style={styles.lowerRow2}>
              <View style={styles.stepContainer}>
                <View style={{ justifyContent: "center", marginVertical: 6 }}>
                  <Text style={styles.relatedHeader}>SUPPLY NOTES</Text>
                </View>
                <View style={styles.inputWrapper2}>
                  <TextInput style={{ flex: 1 }} value={bid?.bidDescription} editable={false} />
                </View>
              </View>
            </View>

            <View style={[styles.relatedRow, { justifyContent: "center" }]}>
              <Text style={styles.relatedHeader}>Selected Supplier</Text>
              <View style={styles.wrapperRelated}>
                <View style={styles.leftRelated}>
                  <TouchableOpacity style={styles.supplierImage}>
                    <Image
                      source={require("../../../assets/images/promoking-logo.png")}
                      style={{ width: 40, height: 40, borderRadius: 1999 }}
                    />
                  </TouchableOpacity>
                  <View style={{ gap: 5, alignItems: "flex-start", paddingTop: 3, marginStart: 6 }}>
                    <Text style={styles.supplierHead}>{supplierData ? supplierData?.name : "UNASSIGNED"}</Text>
                    <Text style={styles.supplierwho}>{supplierData?.address}</Text>
                  </View>
                </View>
                <View style={styles.reachIcons}>
                  <TouchableOpacity
                    style={styles.reachWrapper}
                    onPress={() => {
                      if (supplierData) {
                        handleEmailPress(supplierData?.email);
                      }
                    }}
                  >
                    <Icon name="email" size={20} />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.reachWrapper}
                    onPress={() => {
                      if (supplierData) {
                        handleCallPress(supplierData?.phoneNumber);
                      }
                    }}
                  >
                    <Icon name="call" size={20} />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
            <View style={[styles.relatedRow, { marginBottom: 1 }]}>
              <View style={styles.stepContainer}>
                <View style={{ justifyContent: "space-between", marginTop: 10, display: "flex", flexDirection: "row" }}>
                  <Text style={styles.relatedHeader}>Edit / View Action</Text>
                  <View style={styles.actionFlex}>
                    <TouchableOpacity
                      style={styles.buttonWrap}
                      onPress={() =>
                        navigation.navigate("EditBid", {
                          product: bid,
                        })
                      }
                    >
                      <Icon name="pencil" size={26} />
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.buttonWrap}
                      onPress={() => {
                        openMenu();
                      }}
                    >
                      <Icon name="tracker" size={26} />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </View>

            <View style={[styles.relatedRow, { marginBottom: 10 }]}>
              <View>
                <Text style={styles.relatedHeader}>Critical Actions</Text>
                <TouchableOpacity style={styles.completeBtn} onPress={handleCompleteOrder}>
                  {isLoading2 ? (
                    <ActivityIndicator size={30} color={COLORS.themew} />
                  ) : (
                    <Text style={styles.submitText}>Mark Supply Complete</Text>
                  )}
                </TouchableOpacity>

                <TouchableOpacity style={styles.deleteBtn} onPress={handleDeleteOrder}>
                  {isLoading ? (
                    <ActivityIndicator size={30} color={COLORS.themew} />
                  ) : (
                    <Text style={styles.submitText}>Delete Supply Bid</Text>
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

export default BidDetails;

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
});
