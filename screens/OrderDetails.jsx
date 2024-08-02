import React, { useState, useEffect, useContext } from "react";
import { View, Text, Button, TextInput, StyleSheet, TouchableOpacity, ScrollView, Image } from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";
import Icon from "../constants/icons";
import { SIZES, COLORS } from "../constants";
import { useCart } from "../contexts/CartContext";
import { SafeAreaView } from "react-native-safe-area-context";
import { AuthContext } from "../components/auth/AuthContext";
import useDelete from "../hook/useDelete";
import { BACKEND_PORT } from "@env";
import axios from "axios";

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
            </View>
            <View style={styles.stepsheader}>
              <Text style={styles.stepstext}>You can track your order from here</Text>
            </View>
          </View>

          <View style={styles.lowerRow}>
            <ScrollView>
              <View style={styles.stepContainer}>
                <View style={styles.stepContainerInner}>
                  <Icon name="checkout" size={26} />
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
                        {console.log("products", product)}
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
    minHeight: 120,
  },
  topheading: {
    fontFamily: "bold",
    fontSize: SIZES.large,
  },
  lowerRow: {
    marginTop: 140,
    backgroundColor: COLORS.themew,
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
});
