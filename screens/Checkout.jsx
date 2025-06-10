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
  Modal,
  FlatList,
} from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";
import Icon from "../constants/icons";
import { SIZES, COLORS } from "../constants";
import { useCart } from "../contexts/CartContext";
import { SafeAreaView } from "react-native-safe-area-context";
import { AuthContext } from "../components/auth/AuthContext";
import * as Yup from "yup";
import IntlPhoneInput from "react-native-intl-phone-input";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { parsePhoneNumberFromString } from "libphonenumber-js/min";

import CheckoutStep3 from "./Payments";
import LottieView from "lottie-react-native";
import { BACKEND_PORT } from "@env";
import axios from "axios";

const Checkout = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { estimatedAmount, products, totals, additionalFees } = route.params;
  const { userData, userLogin } = useContext(AuthContext);
  const { clearCart } = useCart();

  const [isLoading, setIsLoading] = useState(false);
  const [errorState, setErrorState] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [success, setSuccess] = useState(null);
  const [orderId, setOrderId] = useState(null);
  const [stockData, setStockData] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  //user loggin chexks
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
  const [finalPhoneNumber, setfinalPhoneNumber] = useState("");
  const [city, setCity] = useState(userData ? userData.location : "");
  const [email, setEmail] = useState(userData ? userData.email : "");
  const [allcountries, setallCountries] = useState([]);
  const [filteredCountries, setFilteredCountries] = useState(allcountries);
  const [deliveryMethod, setDeliveryMethod] = useState(null);
  const [stores, setStores] = useState([]);
  const [pickupStore, setPickupStore] = useState([]);
  const [userId, setUserId] = useState(null);
  const [phoneError, setPhoneError] = useState("");

  //phone number check on checkout

  const checkoutSchema = Yup.object().shape({
    phoneNumber: Yup.string()
      .required("Phone number is required")
      .matches(/^[0-9]+$/, "Phone number must contain only digits"),
  });

  useEffect(() => {
    if (phoneNumber) {
      checkoutSchema
        .validate({ phoneNumber })
        .then(() => setPhoneError(""))
        .catch((err) => setPhoneError("Please fill phone Number field"));
    }
  }, [phoneNumber, address]);

  //fetch stock availability

  useEffect(() => {
    const fetchStock = async () => {
      try {
        const productIds = products.map((product) => product.id); // Extract product IDs

        const response = await axios.post(`${BACKEND_PORT}/api/products/stock`, {
          productIds,
        });
        // console.log(response.data.stock);
        setStockData(response.data.stock);
      } catch (err) {
        console.error("Error fetching stock:", err);
        setError("Failed to fetch stock data");
      } finally {
        setLoading(false);
      }
    };

    fetchStock();
  }, [products]);

  //fetch the pickup stores

  useEffect(() => {
    const fetchStores = async () => {
      try {
        const response = await axios.get(`${BACKEND_PORT}/api/store/all`);
        if (response.data.success) {
          setStores(response.data.stores);
        }
      } catch (error) {
        console.log("Error fetching stores:", error);
      }
    };

    fetchStores();
  }, []);

  const handleNext = () => {
    switch (step) {
      case 3:
        if (deliveryMethod === "shipping" && phoneError) {
          // Do nothing or handle error
        } else if (deliveryMethod === "shipping" && !phoneNumber) {
          setPhoneError("Please fill phone Number field");
        } else if (deliveryMethod === "shipping" && address === "") {
          setPhoneError("Please fill shipping address field");
        } else {
          try {
            const data = { city, address, phoneNumber, finalPhoneNumber };
            saveShipping(data);
          } catch (error) {
          } finally {
            setStep(step + 1);
          }
        }
        break;
      case 5:
        setStep(step);
        break;
      default:
        if (products && products.length > 0) {
          setStep(step + 1);
        } else {
          setStep(step + 1);
        }
    }
  };

  const getPhoneMeta = (number, defaultDialCode = "+254") => {
    if (!number) {
      return {
        dialCode: `+254`,
        country: "KE",
        nationalNumber: "",
        isValid: true,
      };
    }

    // If number doesn't start with +, clean + inject dial code
    const formattedNumber = number.startsWith("+") ? number : `${defaultDialCode}${number.replace(/^0/, "")}`;

    const parsed = parsePhoneNumberFromString(formattedNumber);

    if (!parsed) return null;

    return {
      dialCode: `+${parsed.countryCallingCode}`,
      country: parsed.country,
      nationalNumber: parsed.nationalNumber,
      isValid: parsed.isValid(),
    };
  };

  const saveShipping = async (data) => {
    await AsyncStorage.setItem("shippingdata", JSON.stringify(data));
  };

  //try geting stored saved data
  async function getShipping() {
    let shipping = {};

    shipping = await AsyncStorage.getItem("shippingdata");

    if (shipping) {
      const addressing = JSON.parse(shipping);
      // console.log(addressing, "shipping");
      let { address, finalPhoneNumber, city, phoneNumber } = addressing;

      setAddress(address || "");
      setfinalPhoneNumber(finalPhoneNumber || "");
      setPhoneNumber(phoneNumber || "");
      setCity(city || "");
    }
  }

  useEffect(() => {
    getShipping();
  }, [step === 3]);

  const handlePrevious = () => {
    if (step > 6) {
      setStep(step);
    } else if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleSubmitOrder = async (paymentInfo) => {
    // ✅ Replaced `id` with `_id` for every item in the array
    const formattedProducts = products.map(({ id: _id, ...rest }) => ({ _id, ...rest }));

    const orderData = {
      userId,
      products: formattedProducts,
      ...(deliveryMethod === "shipping" && {
        shippingInfo: {
          address,
          city,
          phoneNumber: finalPhoneNumber,
        },
      }),
      ...(deliveryMethod === "pickup" && {
        pickupInfo: {
          locationId: pickupStore?._id,
          locationName: pickupStore?.name,
          address: pickupStore?.address,
        },
      }),
      paymentInfo,
      totalAmount: estimatedAmount,
      additionalFees: 0,
      deliveryMethod,
      subtotal: estimatedAmount + additionalFees,
    };

    // console.log("orderDATA", orderData);

    handleNext(); // This moves to the next step in the UI

    // console.log(orderData);
    // return;

    try {
      setIsLoading(true);
      setErrorState(false);

      const response = await axios.post(`${BACKEND_PORT}/api/orders`, orderData);

      setOrderId(response.data.order.orderId);
      setSuccess(true);

      // Only proceed with next steps if the order creation was successful
      if (response.data.success) {
        clearCart();

        navigation.navigate("OrderSuccess", { orderId: response.data.order.orderId });
      } else {
        setErrorMessage(response.data.message || "Unknown error occurred");

        // console.log(response);
        setErrorState(true);
      }
    } catch (error) {
      setErrorMessage(error.message || "An error occurred");
      setErrorState(true);
      // console.error("Error submitting order:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const navigateWhere = (locate) => {
    if (step > 1) {
      handlePrevious();
    } else {
      navigation.goBack();
    }
  };

  const handleSearch = (query) => {
    const filtered = allcountries.filter((country) => {
      return country?.en?.toLowerCase().includes(query?.toLowerCase());
    });
    setFilteredCountries(filtered);
    // console.log(filtered);
  };

  const onChangeText = ({ dialCode, unmaskedPhoneNumber, phoneNumber, isVerified }) => {
    setPhoneNumber(unmaskedPhoneNumber);

    if (unmaskedPhoneNumber.length < 6) {
      setPhoneError(true);
    } else {
      setPhoneError(false);
      setfinalPhoneNumber(`${dialCode}${unmaskedPhoneNumber}`);
    }
  };

  const renderCustomModal = (modalVisible, countries, onCountryChange) => {
    // console.log(modalVisible);
    setallCountries(countries);
    countries.forEach((countr) => {
      // console.log(countr.code);
    });
    return (
      <Modal visible={modalVisible} animationType="slide" transparent={true}>
        <SafeAreaView style={{ flex: 1, backgroundColor: "rgba(0, 0, 0, 0.5)" }}>
          <View style={styles.modalContainer}>
            <View style={styles.searchContainer}>
              <TextInput style={styles.searchInput} placeholder="Search Country" onChangeText={handleSearch} />
              <Text style={styles.searchIcon}>🔍</Text>
            </View>

            {/* Country List */}
            <FlatList
              data={filteredCountries}
              keyExtractor={(item, index) => index.toString()}
              renderItem={({ item }) => (
                <TouchableOpacity
                  onPress={() => {
                    onCountryChange(item.code);
                    // console.log(item.code);
                  }}
                >
                  <View style={styles.countryItem}>
                    <Text style={styles.flag}>{item.flag}</Text>
                    <Text style={styles.countryName}>{item.en}</Text>
                    <Text style={styles.countryCode}>{item.dialCode}</Text>
                  </View>
                </TouchableOpacity>
              )}
            />

            {/* Close Button */}
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => {
                this.phoneInput.hideModal();
                setFilteredCountries(countries);
              }}
            >
              <Text style={styles.closeButtonText}>CLOSE</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </Modal>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.container}>
        <View style={styles.wrapper}>
          <View style={styles.upperRow}>
            <View style={styles.upperButtons}>
              <TouchableOpacity onPress={navigateWhere} style={[styles.backBtn, styles.buttonWrap]}>
                <Icon name="backbutton" size={26} />
              </TouchableOpacity>
              <Text style={styles.topheading}>Checkout</Text>
            </View>
            <View style={styles.paginationContainer}>
              <View style={styles.dot(step === 1 ? COLORS.themey : COLORS.themeg)} />
              <View style={styles.dot(step === 2 ? COLORS.themey : COLORS.themeg)} />
              <View style={styles.dot(step === 3 ? COLORS.themey : COLORS.themeg)} />
              <View style={styles.dot(step === 4 ? COLORS.themey : COLORS.themeg)} />
            </View>
            <View style={styles.stepsheader}>
              <Text style={styles.stepstext}>Just a couple of steps and you good to go</Text>
            </View>
          </View>

          <View style={styles.lowerRow}>
            <ScrollView>
              {step === 1 && (
                <View style={styles.stepContainer}>
                  <View style={styles.stepContainerInner}>
                    <Icon name="checkout" size={26} />
                  </View>

                  <View style={{ width: SIZES.width - 27 }}>
                    {products.map((item) => {
                      const availableStock = stockData[item.id] || 0; // Get stock from fetched data

                      return (
                        <View style={styles.containerx} key={item.id}>
                          <TouchableOpacity
                            style={styles.imageContainer}
                            onPress={() => {
                              navigation.navigate("ProductDetails", {
                                item: { ...item, _id: item.id },
                                itemid: item.id,
                              });
                              // console.log(item);
                            }}
                          >
                            <Image source={{ uri: item.imageUri || item.imageUrl }} style={styles.image} />
                          </TouchableOpacity>

                          <View style={{ gap: 12 }}>
                            <View style={styles.details}>
                              <Text style={styles.title} numberOfLines={1}>
                                {item.title}
                              </Text>
                            </View>

                            <View style={styles.rowitem}>
                              <View>
                                <Text style={styles.semititle}>Size: {item.size}</Text>
                              </View>
                            </View>

                            <View style={styles.rowitem}>
                              <Text style={styles.semititle}>
                                Quantity: {item.quantity}
                                {item.quantity > availableStock && availableStock !== 0 ? (
                                  <Text style={{ color: "red" }}> (Only {availableStock} left!)</Text>
                                ) : null}
                              </Text>
                            </View>

                            <View style={styles.priceadd}>
                              <Text style={styles.semititle}>
                                Total:{" "}
                                {new Intl.NumberFormat("en-US", { minimumFractionDigits: 2 }).format(
                                  item.price * item.quantity
                                )}
                              </Text>
                            </View>

                            {/* Show warning if product is out of stock */}
                            {availableStock === 0 && (
                              <Text style={{ color: "red", fontWeight: "bold" }}>Out of Stock</Text>
                            )}
                          </View>
                        </View>
                      );
                    })}
                  </View>

                  <View>
                    <Text style={styles.amount}>Checkout Amount: Ksh {Number(estimatedAmount).toLocaleString()}</Text>

                    {/* DISABLE BUTTON IF STOCK IS OUT */}
                    <TouchableOpacity
                      style={[
                        styles.button1,
                        (products.some((item) => item.quantity === 0) ||
                          products.some((item) => item.quantity > (stockData[item.id] || 0))) && {
                          backgroundColor: "gray",
                        },
                      ]}
                      onPress={handleNext}
                      disabled={
                        products.some((item) => item.quantity === 0) ||
                        products.some((item) => item.quantity > (stockData[item.id] || 0))
                      }
                    >
                      <Text style={styles.nextText}>
                        {products.some((item) => item.quantity === 0) ||
                        products.some((item) => item.quantity > (stockData[item.id] || 0))
                          ? "Out of Stock"
                          : "Next"}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
              {step === 2 && (
                <View style={styles.stepContainer}>
                  <View style={styles.deliveryMethod}>
                    <Text style={styles.deliveryHead}>Choose Delivery Method</Text>

                    {/* Delivery Options */}
                    <View style={styles.deliveryOptions}>
                      <TouchableOpacity
                        style={[styles.optionCard, deliveryMethod === "shipping" && styles.selectedCard]}
                        onPress={() => setDeliveryMethod("shipping")}
                      >
                        <View style={styles.flexme}>
                          <Icon name="truck" size={25} />

                          <Text style={[styles.optionTitle, deliveryMethod === "shipping" && styles.selectedText]}>
                            Shipping
                          </Text>
                          <Text style={styles.optionPrice}>{"(Price Per Distance)"}</Text>
                        </View>
                        <Text style={[styles.optionDescription, deliveryMethod === "shipping" && styles.selectedText]}>
                          Get your order delivered to your address within 3-5 business days.
                        </Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={[
                          styles.optionCard,
                          deliveryMethod === "pickup" && styles.selectedCard,
                          stores && stores.length === 0 && styles.disabledOption, // Disable if no stores
                        ]}
                        onPress={() => stores && stores.length > 0 && setDeliveryMethod("pickup")}
                        disabled={stores && stores.length === 0}
                      >
                        <View style={styles.flexme}>
                          <Icon name="shop" size={25} />
                          <Text style={[styles.optionTitle, deliveryMethod === "pickup" && styles.selectedText]}>
                            Pickup
                          </Text>
                          <Text style={styles.optionPrice}>{stores && stores.length > 0 ? "(Free)" : "N/A"}</Text>
                        </View>
                        <Text style={[styles.optionDescription, deliveryMethod === "pickup" && styles.selectedText]}>
                          {stores && stores.length > 0
                            ? "Pick up your order from our store or a designated location"
                            : "No pickup locations available."}
                        </Text>

                        <Text style={[styles.selectedText2, deliveryMethod === "pickup" && styles.selectedText2]}>
                          [{`${stores?.length || 0} locations available`}]
                        </Text>
                      </TouchableOpacity>
                    </View>

                    {/* Navigation Buttons */}
                    <View style={styles.next2wrapper}>
                      <TouchableOpacity onPress={handlePrevious} style={styles.previous}>
                        <Text>
                          <Icon name="backbutton" size={36} />
                        </Text>
                      </TouchableOpacity>
                      <TouchableOpacity onPress={handleNext} style={styles.next2} disabled={!deliveryMethod}>
                        <Text style={styles.buttonText}>Next step</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              )}

              {step === 3 && (
                <View style={styles.stepContainer}>
                  {phoneError && <Text style={styles.error}>{phoneError}</Text>}
                  {/* Shipping Form */}
                  {deliveryMethod === "shipping" && (
                    <>
                      <View style={styles.shippingContainer}>
                        <Text style={styles.label}>Shipping City Name</Text>
                        <TextInput
                          style={styles.input}
                          placeholder={userData.location}
                          value={city}
                          onChangeText={setCity}
                        />

                        <Text style={styles.label}>Shipping Address</Text>
                        <TextInput style={styles.input} value={address} onChangeText={setAddress} />

                        <Text style={styles.label}>Shipping Email</Text>
                        <TextInput
                          style={styles.input}
                          placeholder={userData.email}
                          value={email}
                          onChangeText={setEmail}
                        />

                        <Text style={styles.label}>Phone Number</Text>
                        <View style={[styles.input2, phoneError ? styles.errorb : styles.successb]}>
                          <IntlPhoneInput
                            placeholder={getPhoneMeta(finalPhoneNumber)?.nationalNumber || ""}
                            ref={(ref) => (phoneInput = ref)}
                            customModal={renderCustomModal}
                            defaultCountry={getPhoneMeta(finalPhoneNumber)?.country || ""}
                            lang="EN"
                            onChangeText={onChangeText}
                            flagStyle={styles.flagWidth}
                            containerStyle={styles.input22}
                          />
                        </View>
                      </View>
                      <View style={styles.next2wrapper}>
                        <TouchableOpacity
                          onPress={handlePrevious}
                          style={styles.previous}
                          disabled={(deliveryMethod === "shipping" && !city) || !address || !email}
                        >
                          <Text>
                            <Icon name="backbutton" size={36} />
                          </Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={handleNext} style={styles.next2}>
                          <Text style={styles.buttonText}>Next step</Text>
                        </TouchableOpacity>
                      </View>
                    </>
                  )}

                  {/* Pickup Form */}
                  {deliveryMethod === "pickup" && (
                    <>
                      <View style={styles.pickupContainer}>
                        <Text style={styles.deliveryHead}>Select Pickup Store</Text>

                        <View style={styles.storeList}>
                          {stores.map((store) => (
                            <TouchableOpacity
                              key={store._id}
                              style={[styles.storeCard, pickupStore === store && styles.selectedStore]}
                              onPress={() => setPickupStore(store)}
                            >
                              <View>
                                <Text style={[styles.storeTitle, pickupStore === store._id && styles.selectedStored]}>
                                  {store.name}
                                </Text>
                                <Text style={[styles.storeDetails, pickupStore === store._id && styles.selectedStored]}>
                                  {store.address}, {store.city}
                                </Text>
                                <Text style={[styles.storeDetails, pickupStore === store._id && styles.selectedStored]}>
                                  📞 {store.phoneNumber}
                                </Text>
                                <Text style={[styles.storeDetails, pickupStore === store._id && styles.selectedStored]}>
                                  🕒 {store.openHours}
                                </Text>
                              </View>
                            </TouchableOpacity>
                          ))}
                        </View>
                      </View>

                      {/* Navigation Buttons */}
                      <View style={styles.next2wrapper}>
                        <TouchableOpacity onPress={handlePrevious} style={styles.previous}>
                          <Text>
                            <Icon name="backbutton" size={36} />
                          </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          onPress={handleNext}
                          style={styles.next2}
                          disabled={deliveryMethod === "pickup" && !pickupStore}
                        >
                          <Text style={styles.buttonText}>Next step</Text>
                        </TouchableOpacity>
                      </View>
                    </>
                  )}
                </View>
              )}

              {step === 4 && (
                <>
                  <View style={styles.stepContainer}>
                    <CheckoutStep3
                      onPrevious={handlePrevious}
                      onNext={handleNext}
                      phoneNumber={finalPhoneNumber}
                      totalAmount={estimatedAmount}
                      handleSubmitOrder={handleSubmitOrder}
                      email={email}
                    />
                  </View>
                </>
              )}

              {step === 5 && !isLoading && errorState && (
                <View style={styles.containLottie}>
                  <View style={styles.animationWrapper}>
                    <LottieView
                      source={require("../assets/data/failed.json")}
                      autoPlay
                      loop={false}
                      style={styles.animation}
                    />
                    <Text style={styles.errorMessage}>{"Sorry request failed \n Please try again later"}</Text>
                    {console.log(errorMessage)}
                  </View>
                  <TouchableOpacity
                    style={styles.buttonHome}
                    onPress={() =>
                      navigation.navigate("Bottom Navigation", {
                        screen: "Home",
                        params: { refreshList: true },
                      })
                    }
                  >
                    <Text style={styles.buttonText}>Back to home</Text>
                  </TouchableOpacity>
                </View>
              )}
              {step === 5 && !errorState && isLoading && (
                <View style={styles.containLottie}>
                  <View style={styles.animationWrapper}>
                    <LottieView
                      source={require("../assets/data/loading.json")}
                      autoPlay
                      loop={true}
                      style={styles.animation}
                    />
                    <Text style={styles.errorMessage}>{"Submitting order"}</Text>
                  </View>
                </View>
              )}
            </ScrollView>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default Checkout;

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
    // minHeight: SIZES.height,
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
  header: {
    fontSize: 24,
    marginBottom: 20,
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
  stepContainerInner: { justifyContent: "center", alignItems: "center", padding: 20 },
  input: {
    height: 40,
    borderColor: "gray",
    borderWidth: 1,
    marginBottom: 10,
    paddingHorizontal: 10,
  },
  nextText: {
    fontFamily: "semibold",
    textAlign: "center",
    color: COLORS.white,
    fontSize: SIZES.medium,
  },
  button1: {
    height: 50,
    borderRadius: SIZES.medium,
    backgroundColor: COLORS.themey,
    justifyContent: "center",
    alignItems: "center",
  },

  imageContainer: {
    height: 100,
    width: 100,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: SIZES.medium,
    borderColor: COLORS.themeg,
    borderWidth: 1,
  },
  image: {
    borderRadius: SIZES.medium,
    height: "100%",
    width: "100%",
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
  size: {
    fontFamily: "regular",
    fontSize: SIZES.medium - 2,
    paddingStart: 2,
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
  uppDetail: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  containLottie: {
    justifyContent: "center",
    alignItems: "center",
    width: SIZES.width - 20,
    minHeight: SIZES.height - 150,
  },
  errorMessage: {
    fontFamily: "semibold",
    fontSize: SIZES.large,
    marginBottom: 30,
  },
  dot: (backgroundColor) => ({
    width: 50,
    height: 7,
    backgroundColor,
    borderRadius: 15,
  }),
  paginationContainer: {
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
    gap: 10,
    height: 30,
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
  previous: {
    height: 60,
    width: 60,
    backgroundColor: COLORS.themey,
    borderRadius: 100,
    justifyContent: "center",
    alignItems: "center",
  },
  next2wrapper: {
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
    gap: 10,
    marginTop: 20,
    // position: "absolute",
    // bottom: 20,
  },
  next2: {
    justifyContent: "center",
    alignItems: "center",
    width: SIZES.width - 100,
    backgroundColor: COLORS.themey,
    borderRadius: SIZES.medium,
    height: 60,
  },
  input: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.themeg,
    padding: 10,
    borderRadius: SIZES.medium,
    marginBottom: 10,
    width: SIZES.width - 40,
    marginStart: 5,
  },
  input2: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.themeg,
    borderRadius: SIZES.medium,
    width: SIZES.width - 40,
    marginStart: 5,
  },
  input22: {
    backgroundColor: COLORS.themeg,
    borderRadius: SIZES.medium,
  },
  label: {
    fontSize: SIZES.small,
    marginBottom: SIZES.xSmall,
    color: COLORS.gray,
    marginStart: SIZES.large,
  },
  shippingContainer: {
    minHeight: SIZES.height / 2,
    marginTop: SIZES.xxLarge,
  },
  buttonText: {
    color: COLORS.lightWhite,
    fontFamily: "semibold",
    fontSize: SIZES.medium,
  },
  error: { color: "red", marginBottom: 10, marginStart: 10, marginTop: 20 },
  errorb: {
    borderWidth: 0.54,
    borderColor: COLORS.red,
  },
  successb: {
    borderWidth: 0.54,
    borderColor: COLORS.green,
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
  buttonHome: {
    position: "absolute",
    bottom: 20,
    left: 10,
    right: 10,
    backgroundColor: COLORS.themey,
    height: SIZES.xxLarge + 20,
    borderRadius: SIZES.medium,
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "white",
    margin: 20,
    borderRadius: 10,
    padding: 20,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    paddingHorizontal: 10,
    height: 40,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
  },
  searchIcon: {
    fontSize: 20,
    marginLeft: 10,
  },
  countryItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  flag: {
    fontSize: 24,
    marginRight: 10,
  },
  flagWidth: {},
  countryName: {
    flex: 1,
    fontSize: 16,
    color: "#333",
  },
  countryCode: {
    fontSize: 16,
    color: "#888",
  },

  closeButton: {
    marginTop: 20,
    backgroundColor: "#007BFF",
    paddingVertical: 10,
    alignItems: "center",
    borderRadius: 5,
  },
  closeButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  deliveryMethod: {
    minHeight: 300,
  },

  deliveryHead: {
    fontSize: 18,
    fontWeight: "bold",

    padding: 15,
  },
  deliveryOptions: {
    borderRadius: 10,
    padding: 10,
  },
  optionCard: {
    backgroundColor: COLORS.themew,
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  selectedCard: {
    backgroundColor: COLORS.themeg,
    borderColor: "#00a478",
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: "bold",
  },
  optionPrice: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#333",
  },
  optionDescription: {
    fontSize: 14,

    marginTop: 5,
  },
  selectedText: {
    color: COLORS.themeb,
  },
  selectedText2: {
    color: COLORS.themeb,
    fontSize: 14,
    fontWeight: "bold",
    marginTop: 7,
  },
  pickupContainer: {
    marginTop: 10,
  },
  label: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 10,
    marginStart: 10,
  },
  storeList: {
    gap: 10,
  },
  storeCard: {
    backgroundColor: "#f9f9f9",
    padding: 15,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  selectedStore: {
    color: COLORS.themew,
    backgroundColor: "#34D399", // Green highlight
    borderColor: "#059669",
  },
  storeTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  storeDetails: {
    fontSize: 14,
  },
  selectedStored: {
    color: COLORS.themew,
  },
  flexme: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    gap: 15,
  },
});
