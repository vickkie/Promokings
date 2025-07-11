import React, { useState, useEffect, useContext } from "react";
import { View, Text, Button, TextInput, StyleSheet, TouchableOpacity, ScrollView, Image, Linking } from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";
import Icon from "../../../constants/icons";
import { SIZES, COLORS } from "../../../constants";
import LottieView from "lottie-react-native";

import { SafeAreaView } from "react-native-safe-area-context";
import useFetch from "../../../hook/useFetch";
import { ErrorMessage } from "formik";

const DeliveryDispatchDetails = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { deliveryId } = route.params;
  //   console.log("id", deliveryId);

  const { data, isLoading: dataLoading, refetch } = useFetch(`shipment/delivery/${deliveryId}`);

  const [products, setProducts] = useState([]);
  const [orderId, setOrderId] = useState(null);
  const [item, setItem] = useState(null);
  const [delivery, setDelivery] = useState(null);
  const [driverDetails, setdriverDetails] = useState(null);

  useEffect(() => {
    if (!dataLoading && data) {
      //   console.log(data);
      //   console.log(ErrorMessage);
      setDelivery(data);
      setOrderId(data?.orderId?._id);
      setItem(data?.orderId);
      setdriverDetails(data?.driverId);
      setProducts(data?.orderId?.products);
    }
  }, [data, dataLoading, ErrorMessage]);

  const handleEmailPress = (email) => {
    Linking.openURL(`mailto:${email}`);
  };

  const handleCallPress = (phoneNumber) => {
    Linking.openURL(`tel:${phoneNumber}`);
  };

  const PaymentMethodComponent = ({ item }) => {
    return (
      <View>
        <View style={styles.selectedPayment}>
          <Text style={styles.selectedText}>CUSTOMER INFO </Text>
        </View>

        <View style={styles.inputWrapper}>
          <Icon name="call" size={29} style={styles.iconStyle} color={COLORS.gray} />
          <TextInput
            placeholder="phone number"
            style={{ flex: 1 }}
            value={item?.paymentInfo?.phoneNumber}
            editable={false}
          />
        </View>
        <View style={styles.inputWrapper}>
          <Icon name="email" size={29} style={styles.iconStyle} color={COLORS.gray} />
          <TextInput placeholder="email" style={{ flex: 1 }} value={item?.paymentInfo?.email} editable={false} />
        </View>
        <View style={styles.inputWrapper}>
          <Icon name="location" size={29} style={styles.iconStyle} color={COLORS.gray} />
          <TextInput placeholder="email" style={{ flex: 1 }} value={item?.shippingInfo?.city} editable={false} />
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
              <Text style={styles.topheading}>Delivery details</Text>

              <TouchableOpacity onPress={() => {}} style={styles.outWrap}>
                <Icon name="pencil" size={28} />
              </TouchableOpacity>
            </View>

            <Text style={{ fontFamily: "GtAlpine", color: COLORS.themeb, fontSize: SIZES.medium, marginVertical: 15 }}>
              Delivery id : {deliveryId}
            </Text>

            <TouchableOpacity
              style={{
                backgroundColor:
                  delivery?.status === "pending"
                    ? "#ffedd2"
                    : delivery?.status === "delivered"
                    ? "#CBFCCD"
                    : delivery?.status === "transit"
                    ? "#C0DAFF"
                    : delivery?.status === "failed"
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
                    delivery?.status === "pending"
                      ? "#D4641B"
                      : delivery?.status === "delivered"
                      ? "#26A532"
                      : delivery?.status === "transit"
                      ? "#337DE7"
                      : delivery?.status === "failed"
                      ? "#B65454"
                      : COLORS.primary,
                }}
              >
                {/* {console.log(item)} */}
                {delivery?.status === "failed" ? "cancelled" : delivery?.status}
              </Text>
            </TouchableOpacity>

            <View style={styles.stepsheader}>
              <Text style={styles.stepstext}>You can track your order from here</Text>
            </View>
          </View>
          <ScrollView>
            {!dataLoading && data ? (
              <>
                <View style={styles.lowerRow}>
                  <ScrollView>
                    <View style={styles.stepContainer}>
                      <View style={{ justifyContent: "center", marginTop: 20 }}>
                        <Text style={styles.relatedHeader}>Ordered items</Text>
                      </View>
                      <Text
                        style={{
                          fontFamily: "GtAlpine",
                          color: COLORS.themeb,
                          fontSize: SIZES.medium,
                          padding: 10,
                        }}
                      >
                        Order id : {item?.orderId}
                      </Text>

                      <View style={{ width: SIZES.width - 27 }}>
                        {Array.isArray(products) &&
                          products.map((product) => (
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
                          item?.paymentStatus === "pending"
                            ? "#C0DAFF"
                            : item?.paymentStatus === "paid"
                            ? "#CBFCCD"
                            : item?.paymentStatus === "partial"
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
                    <Text style={styles.paymentDetails}>Total Amount</Text>
                    <Text style={styles.paymentDetails}>
                      {new Intl.NumberFormat("en-KE", { style: "currency", currency: "KES" })
                        .format(item?.subtotal)
                        .replace("Ksh", "")}
                    </Text>
                  </View>
                </View>

                <View style={[styles.relatedRow, { justifyContent: "center" }]}>
                  <Text style={styles.relatedHeader}>Driver information</Text>
                  <View style={styles.wrapperRelated}>
                    <View style={styles.leftRelated}>
                      <TouchableOpacity style={styles.supplierImage}>
                        <Image
                          source={
                            driverDetails?.profileImage
                              ? { uri: driverDetails.profileImage }
                              : require("../../../assets/images/userDefault.webp")
                          }
                          style={{ width: 40, height: 40, borderRadius: 1999 }}
                        />
                      </TouchableOpacity>
                      <View style={{ gap: 5, alignItems: "flex-start", paddingTop: 3, marginStart: 6 }}>
                        <Text style={styles.supplierHead}>{driverDetails?.fullName}</Text>
                        <Text style={styles.supplierwho}>{driverDetails?.numberPlate}</Text>
                      </View>
                    </View>
                    <View style={styles.reachIcons}>
                      <TouchableOpacity
                        style={styles.reachWrapper}
                        onPress={() => {
                          driverDetails ? handleEmailPress(driverDetails?.email) : "";
                        }}
                      >
                        <Icon name="email" size={20} />
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.reachWrapper}
                        onPress={() => {
                          driverDetails ? handleCallPress(driverDetails?.phoneNumber) : "";
                        }}
                      >
                        <Icon name="call" size={20} />
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>

                <View style={[styles.relatedRow, { marginBottom: 10 }]}>
                  <View>
                    <Text style={styles.relatedHeader}>Customer Information</Text>
                  </View>

                  <PaymentMethodComponent item={item} />
                </View>
              </>
            ) : (
              <View style={styles.containLottie}>
                <View style={styles.animationWrapper}>
                  <LottieView
                    source={require("../../../assets/data/loading.json")}
                    autoPlay
                    loop
                    style={styles.animation}
                  />
                </View>
              </View>
            )}
          </ScrollView>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default DeliveryDispatchDetails;

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
  containLottie: {
    justifyContent: "center",
    alignItems: "center",
    width: SIZES.width - 20,
    minHeight: SIZES.height - 150,
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
});
