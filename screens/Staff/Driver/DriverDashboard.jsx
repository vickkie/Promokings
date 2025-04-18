import React, { useState, useContext, useEffect, useCallback, useRef } from "react";
import { Text, TouchableOpacity, View, ScrollView, Image, StatusBar, StyleSheet, RefreshControl } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation, useFocusEffect, useRoute } from "@react-navigation/native";
import Icon from "../../../constants/icons";
import { AuthContext } from "../../../components/auth/AuthContext";
import HomeMenu from "../../../components/bottomsheets/HomeMenu";
import { COLORS, SIZES } from "../../../constants";
import LatestProducts from "./LatestProducts";
import useFetch from "../../../hook/useFetch";
import LatestOrders from "../Sales/LatestOrders";
import LatestShipments from "./LatestShipments";

const DriverDashboard = () => {
  const { userLogin, hasRole, userData, userLogout } = useContext(AuthContext);
  const navigation = useNavigation();
  const route = useRoute();

  const { data, isLoading, error, errorMessage, statusCode, refetch } = useFetch(
    `shipment/myDeliveries/${userData?._id}/status/pending`,
    true,
    userData?.TOKEN
  );

  const [userId, setUserId] = useState(null);
  const [quantities, setQuanties] = useState(null);
  const [deliveries, setDeliveries] = useState(null);
  const [refreshList, setRefreshList] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (!userLogin) {
      navigation.reset({
        index: 0,
        routes: [{ name: "Login" }],
      });
    } else if (hasRole("driver")) {
      setUserId(userData?._id);
      console.log(userData);
    } else {
      userLogout();
      navigation.reset({
        index: 0,
        routes: [{ name: "Login" }],
      });
    }
  }, [userLogin, navigation, hasRole]);

  useFocusEffect(
    useCallback(() => {
      if (route.params?.refreshList) {
        setRefreshList(true);
        refetch();
      }
    }, [route.params])
  );

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setRefreshList(true);
    //  reset the refreshing state after some delay
    setTimeout(() => {
      setRefreshing(false);
      setRefreshList(false); // Reset refreshList after refreshing
    }, 2000);
  }, []);

  useEffect(() => {
    refetch();
  }, [refreshing]);

  const renderProfilePicture = () => {
    if (!userLogin) {
      return <Icon name="user" size={24} color="#000" />;
    }
    if (userData && userData.profilePicture) {
      return <Image source={{ uri: `${userData.profilePicture}` }} style={styles.profilePicture} />;
    }

    return <Image source={require("../../../assets/images/userDefault.webp")} style={styles.profilePicture} />;
  };

  const BottomSheetRef = useRef(null);

  const openMenu = () => {
    // if (BottomSheetRef.current) {
    //   BottomSheetRef.current.present();
    // }
  };

  useEffect(() => {
    console.log(data);
    if (!isLoading && data) {
      setDeliveries(data[0]);
    }
  }, [isLoading, data]);

  const CurrentOrder = ({ deliveryData, isLoading }) => {
    const formatDateTime = (isoString) => {
      const date = new Date(isoString);
      const day = date.getDate();
      const month = date.getMonth() + 1; // Months are zero-based
      const year = date.getFullYear();
      const hours = date.getHours();
      const minutes = date.getMinutes().toString().padStart(2, "0");

      return `${day}-${month}-${year} ${hours}:${minutes}`;
    };

    // Dummy data if deliveryData is missing
    const dummyData = {
      deliveryId: "NO PENDING ORDER",
      orderId: {
        shippingInfo: { address: "Unknown", city: "Unknown" },
      },
      assignedAt: "2025-02-18T10:42:52.243Z",
      status: "pending",
    };

    // If deliveryData is missing, dummyData
    const data = !isLoading && deliveryData ? deliveryData : dummyData;
    const { deliveryId, orderId, assignedAt, status } = data;
    const givenDate = formatDateTime(assignedAt);

    return (
      <View style={styles.container}>
        <Text style={styles.header}>{status.charAt(0).toUpperCase() + status.slice(1)}</Text>
        <Text style={styles.deliveryId}>#{deliveryId}</Text>

        <View style={styles.statusContainer}>
          {/* Pending */}
          <View style={styles.statusWrapper}>
            <View style={[styles.statusCircle, status === "pending" && styles.active]} />
            <View style={[styles.dottedLine, status !== "pending" && styles.activeLine]} />
          </View>

          {/* In Transit */}
          <View style={styles.statusWrapper}>
            <View style={[styles.statusCircle, status === "transit" && styles.active]} />
            <View style={[styles.dottedLine, status === "completed" && styles.activeLine]} />
          </View>

          {/* Delivered */}
          <View style={[styles.statusCircle2, status === "completed" && styles.active]} />
        </View>

        <View style={styles.statusLabels}>
          <Text style={styles.statusText}>Pending</Text>
          <Text style={styles.statusText}>Delivery</Text>
          <Text style={styles.statusText}>Delivered</Text>
        </View>

        <View style={styles.locationContainer}>
          <Text style={styles.locationText}>Warehouse (assigned)</Text>
          <Text style={styles.dateText}>{givenDate}</Text>
        </View>
        <View style={styles.locationContainer}>
          <Text style={styles.locationText}>Shipping Address</Text>
          <Text style={styles.dateText}>
            {orderId?.shippingInfo?.address}, {orderId?.shippingInfo?.city}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.topSafeview}>
      <HomeMenu ref={BottomSheetRef} />
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.themey} />
      <View style={styles.topWelcomeWrapper}>
        <View style={styles.appBarWrapper}>
          <View style={styles.appBar}>
            <TouchableOpacity style={styles.buttonWrap2} onPress={openMenu}>
              <Image source={require("../../../assets/icon-home.png")} style={styles.profilePicture} />
            </TouchableOpacity>
            <View style={styles.greeting}>
              <Text style={styles.greetingMessage}>
                <Text style={styles.username}>
                  Hello {userData?.fullName ? userData.fullName.split(" ")[0] : "Driver"}
                </Text>
              </Text>
            </View>
            <View style={{ flexDirection: "row" }}>
              <TouchableOpacity onPress={() => navigation.navigate("DriverProfile")} style={styles.buttonWrap2}>
                {renderProfilePicture()}
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <View style={styles.sloganWrapper}>
          <Text style={styles.slogan}>Driver Shipments panel </Text>
        </View>
      </View>
      <ScrollView refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
        <View style={{ flex: 1, borderRadius: 45, marginTop: 6 }}>
          <View style={styles.lowerWelcomeWrapper}>
            <View style={styles.lowerWelcome}>
              <View style={styles.dashbboxWrapperp}>
                <View style={styles.dashbboxWrapper}>
                  <TouchableOpacity
                    onPress={() => {
                      // console.log(deliveries);
                      deliveries &&
                        navigation.navigate("ShipmentDetails", {
                          deliveryId: deliveries?.deliveryId,
                        });
                    }}
                  >
                    <CurrentOrder deliveryData={deliveries} isLoading={isLoading} />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>
          <View style={{ paddingTop: 10, width: SIZES.width - 20, paddingHorizontal: 22 }}>
            <Text style={{ fontFamily: "GtAlpine", fontSize: SIZES.medium + 4, fontWeight: "600" }}>
              Latest Assigned Deliveries
            </Text>
          </View>
          <View style={styles.latestProducts}>
            <LatestShipments
              refreshList={refreshList}
              setRefreshing={setRefreshing}
              limit={10}
              offset={0}
              status={"pending"}
              search={""}
            />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default DriverDashboard;

const styles = StyleSheet.create({
  textStyles: {
    fontFamily: "bold",
    fontSize: 19,
  },
  appBarWrapper: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.medium,
    marginTop: 10,
  },
  appBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginHorizontal: 10,
    width: SIZES.width - 20,
  },
  location: {
    fontFamily: "semibold",
    fontSize: SIZES.medium,
    color: COLORS.gray,
  },
  cartContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  cartNumber: {
    position: "absolute",
    fontFamily: "regular",
    fontWeight: "800",
    fontSize: 13,
    color: COLORS.lightWhite,
    borderRadius: 700,
    backgroundColor: COLORS.themey,
  },
  cartWrapper: {
    zIndex: 11,
    backgroundColor: COLORS.themey,
    justifyContent: "center",
    padding: 10,
    borderRadius: 100,
    position: "absolute",
    right: 40,
    top: 4,
    zIndex: 77,
    alignItems: "center",
  },
  buttonWrap: {
    backgroundColor: COLORS.hyperlight,
    padding: 15,
    borderRadius: 100,
    justifyContent: "center",
    alignItems: "center",
  },
  buttonWrap2: {
    backgroundColor: COLORS.hyperlight,
    borderRadius: 100,
    width: 50,
    justifyContent: "center",
    alignItems: "center",
    marginEnd: 4,
  },
  topWelcomeWrapper: {
    minHeight: 90,
    backgroundColor: COLORS.themew,
    marginHorizontal: 4,
    borderRadius: SIZES.medium,
    // ...SHADOWS.small,
    // marginBottom: 2,
    // shadowColor: COLORS.lightWhite,
  },
  greeting: {
    flex: 1,
    justifyContent: "center",
    // alignItems: "center",
    paddingHorizontal: 20,
  },
  greetingMessage: {
    fontFamily: "bold",
    fontSize: SIZES.xLarge,
  },
  hello: {
    fontFamily: "regular",
    color: "#BABDB6",
  },
  username: {
    fontFamily: "semibold",
    color: COLORS.themeb,
  },
  sloganWrapper: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 20,
    // alignItems: "center",
  },
  slogan: {
    fontFamily: "regular",
    color: "#BABDB6",
    fontSize: SIZES.medium,
  },
  lowerWelcome: {
    backgroundColor: COLORS.themew,
    marginHorizontal: 4,
    borderTopLeftRadius: SIZES.medium,
    borderTopRightRadius: SIZES.medium,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  lowerWelcomeWrapper: {
    backgroundColor: COLORS.themeg,
    borderRadius: SIZES.medium,
  },
  topSafeview: {
    flex: 1,
    backgroundColor: COLORS.themeg,
    borderRadius: SIZES.medium,
    marginTop: SIZES.xxSmall,
  },
  profilePicture: {
    height: 52,
    width: 52,
    borderRadius: 100,
  },
  closeButton: {
    position: "absolute",
    top: 40,
    right: 20,
    backgroundColor: "white",
    padding: 10,
    borderRadius: 20,
  },
  closeButtonText: {
    fontSize: 16,
    color: "black",
  },
  dashbboxWrapper: {
    width: SIZES.width - 20,
    display: "flex",
    flexDirection: "row",
    gap: 10,
    marginBottom: 10,
  },
  dashBox: {
    justifyContent: "center",
    width: SIZES.width - 20,
    backgroundColor: COLORS.primary,
    borderRadius: SIZES.medium,
    height: SIZES.width / 2,
    paddingStart: 40,
  },
  dashbboxWrapperp: {
    justifyContent: "center",
    alignItems: "center",
    marginTop: 7,
  },
  box1: {
    backgroundColor: "#00885A",
  },
  box2: {
    backgroundColor: "#04c28f",
  },
  box3: {
    backgroundColor: "304c28f",
  },
  box4: {
    backgroundColor: "#04c28f",
    // #04c28f
  },
  boxNUmber: {
    fontFamily: "bold",
    fontSize: SIZES.xxLarge - 8,
    color: COLORS.white,
  },
  boxText: {
    fontFamily: "bold",
    fontSize: SIZES.medium,
    marginLeft: -14,
    color: COLORS.themeb,
  },
  latestProducts: {
    backgroundColor: COLORS.white,
    marginTop: 10,
    borderRadius: SIZES.medium,
    width: SIZES.width - 10,
    alignSelf: "center",
    paddingVertical: SIZES.medium,
    paddingHorizontal: 3,
    minHeight: SIZES.height / 2.5,
    marginBottom: 20,
  },

  container: {
    padding: 20,
    backgroundColor: "#04c28f",
    borderRadius: 10,
    width: SIZES.width - 14,
  },
  header: {
    fontFamily: "semibold",
    color: "#000",
    marginBottom: 10,
    paddingHorizontal: 3,
    paddingVertical: 3,
    width: 90,
    borderRadius: 30,
    backgroundColor: COLORS.white,
    textAlign: "center",
  },
  deliveryId: {
    fontFamily: "bold",
    fontSize: SIZES.large,
    color: COLORS.themew,
    marginBottom: 10,
  },
  statusContainer: {
    fontFamily: "semibold",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  statusCircle: {
    width: 19,
    height: 19,
    borderRadius: 20,
    backgroundColor: "#04c28f",
    borderColor: "#fff",
    borderWidth: 4,
    borderStyle: "solid",
  },
  statusCircle2: {
    width: 19,
    height: 19,
    borderRadius: 20,
    backgroundColor: COLORS.white,
  },

  statusContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginVertical: 10,
    width: SIZES.width / 2.5,
  },
  statusWrapper: {
    flexDirection: "row",
    alignItems: "center",
  },
  dottedLine: {
    flex: 1,
    height: 2,
    borderBottomWidth: 2,
    borderStyle: "dashed",
    borderBottomColor: "#ccc",
    marginHorizontal: 5,
  },
  activeLine: {
    borderBottomColor: COLORS.themew,
  },

  active: {
    backgroundColor: COLORS.themey,
    fontFamily: "semibold",
  },
  statusLabels: {
    fontFamily: "bold",
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },
  statusText: {
    fontFamily: "bold",
    color: "#ffffff",
    fontSize: 14,
  },
  locationContainer: {
    marginTop: 10,
    display: "flex",
    justifyContent: "space-between",
    flexDirection: "row",
  },
  locationText: {
    color: "#ffffff",
  },
  dateText: {
    color: COLORS.themew,
  },
});
