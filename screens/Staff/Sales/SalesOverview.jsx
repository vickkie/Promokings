import React, { useState, useContext, useEffect, useCallback, useRef } from "react";
import { Text, TouchableOpacity, View, ScrollView, Image, StatusBar, StyleSheet, RefreshControl } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation, useFocusEffect, useRoute } from "@react-navigation/native";
import Icon from "../../../constants/icons";
import { AuthContext } from "../../../components/auth/AuthContext";
import HomeMenu from "../../../components/bottomsheets/HomeMenu";
import { COLORS, SIZES } from "../../../constants";
import useFetch from "../../../hook/useFetch";
import LatestOrders from "./LatestOrders";
import SalesChart from "./SalesChart";

const zeroData = {
  totalProducts: 0,
  outOfStock: 0,
  lowStock: 0,
  availableStock: 0,
};

const SalesOverview = () => {
  const { userLogin, hasRole, userData, userLogout } = useContext(AuthContext);
  const navigation = useNavigation();
  const route = useRoute();

  const { data, isLoading, error, errorMessage, statusCode, refetch } = useFetch("orders/summary");

  const [userId, setUserId] = useState(null);
  const [quantities, setQuanties] = useState(zeroData);
  const [refreshList, setRefreshList] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (!userLogin) {
      navigation.replace("Login");
    } else if (hasRole("sales")) {
      setUserId(userData._id);
    } else {
      userLogout();
      navigation.replace("Login");
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
    setRefreshList(true); // This will trigger the refresh in LatestProducts

    // Optionally reset the refreshing state after some delay
    setTimeout(() => {
      setRefreshing(false);
      setRefreshList(false); // Reset refreshList after refreshing
    }, 2000);
  }, []);

  useEffect(() => {
    refetch();
  }, [refreshing]);

  const BottomSheetRef = useRef(null);

  useEffect(() => {
    if (!isLoading && data) {
      setQuanties(data);
    } else if (!isLoading && !data) {
      setQuanties(zeroData);
    }
  }, [isLoading, data]);

  const products = [
    {
      id: "1",
      title: "Sales Report",
      detail: "Get detailed sales information",
      route: "SalesData",
      image: require("../../../assets/images/isometric.webp"),
    },
    {
      id: "2",
      title: "Sales Interactions",
      detail: "Track your stock interactions",
      route: "BestProductList",
      image: require("../../../assets/images/baggift.webp"),
    },
  ];

  return (
    <SafeAreaView style={styles.topSafeview}>
      <HomeMenu ref={BottomSheetRef} />
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.themey} />
      <View style={styles.topWelcomeWrapper}>
        <View style={styles.appBarWrapper}>
          <View style={styles.appBar}>
            <TouchableOpacity style={styles.buttonWrap} nPress={() => navigation.goBack()}>
              <Icon name="backbutton" size={24} />
            </TouchableOpacity>
            <View style={{ flexDirection: "row" }}>
              <TouchableOpacity
                onPress={() => navigation.navigate("SalesShipments")}
                style={[styles.backBtn, styles.buttonWrap]}
              >
                <Icon name="truckfilled" size={26} />
              </TouchableOpacity>
            </View>
          </View>
        </View>
        <View style={styles.greeting}>
          <Text style={styles.greetingMessage}>
            <Text style={styles.username}>Sales & Management</Text>
          </Text>
        </View>
        <View style={styles.sloganWrapper}>
          <Text style={styles.slogan}>{`Manage all you statistics here `}</Text>
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
                      // navigation.navigate("EditProductList", {
                      //   products: "products",
                      //   refreshList: true,
                      // });
                    }}
                  >
                    <View style={[styles.dashBox, styles.box1]}>
                      <Text style={styles.boxNUmber}>{quantities?.totalOrders}</Text>
                      <Text style={styles.boxText}>Total Orders</Text>
                    </View>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => {
                      // navigation.navigate("EditProductList", {
                      //   products: "products/stock-summary/out-of-stock",
                      //   refreshList: true,
                      // });
                    }}
                  >
                    <View style={[styles.dashBox, styles.box2]}>
                      <Text style={styles.boxNUmber}>{quantities?.pendingOrders}</Text>
                      <Text style={styles.boxText}>Pending Orders</Text>
                    </View>
                  </TouchableOpacity>
                </View>
                <View style={styles.dashbboxWrapper}>
                  <TouchableOpacity
                    onPress={() => {
                      // navigation.navigate("EditProductList", {
                      //   products: "products/stock-summary/low-stock",
                      //   refreshList: true,
                      // });
                    }}
                  >
                    <View style={[styles.dashBox, styles.box3]}>
                      <Text style={styles.boxNUmber}>{quantities?.todayOrders}</Text>
                      <Text style={styles.boxText}>Today Orders</Text>
                    </View>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => {
                      // navigation.navigate("EditProductList", {
                      //   products: "products/stock-summary/available",
                      //   refreshList: true,
                      // });
                    }}
                  >
                    <View style={[styles.dashBox, styles.box4]}>
                      <Text style={styles.boxNUmber}>{quantities?.processingOrders}</Text>
                      <Text style={styles.boxText}>Processing orders</Text>
                    </View>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>
          <View style={{ paddingTop: 10, width: SIZES.width - 20, paddingHorizontal: 22 }}>
            <Text style={{ fontFamily: "GtAlpine", fontSize: SIZES.medium + 4, fontWeight: "600" }}>Management</Text>
          </View>

          <View style={styles.latestProducts}>
            {products.map((product) => (
              <TouchableOpacity
                key={product.id}
                style={styles.latestProductCards}
                onPress={() => navigation.navigate(product.route, { product })}
              >
                <View
                  style={{
                    borderRadius: 100,
                    backgroundColor: COLORS.themey,
                    width: 36,
                    height: 36,
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <Image source={product.image} style={styles.productImage} />
                </View>

                <View style={styles.orderDetails}>
                  <Text style={styles.latestProductTitle}>{product.title}</Text>
                  <Text style={styles.latestProductdetail}>{product.detail}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default SalesOverview;

const styles = StyleSheet.create({
  carouselContainer: {
    flex: 1,
    alignItems: "center",
    backgroundColor: COLORS.themey,
    height: 100,
  },
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
    minHeight: 140,
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
    width: SIZES.width / 2 - 14,
    backgroundColor: COLORS.primary,
    borderRadius: SIZES.medium,
    height: SIZES.width / 2 - 50,
    paddingStart: 40,
  },
  dashbboxWrapperp: {
    justifyContent: "center",
    alignItems: "center",
    marginTop: 7,
  },
  box1: {
    backgroundColor: "#e3bdf4",
  },
  box2: {
    backgroundColor: "#aed7f5",
  },
  box3: {
    backgroundColor: COLORS.themey,
  },
  box4: {
    backgroundColor: "#04c28f",
    // #04c28f
  },
  boxNUmber: {
    fontFamily: "bold",
    fontSize: SIZES.xLarge,
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
  latestProductCards: {
    paddingHorizontal: 10,
    backgroundColor: COLORS.themeg,
    borderRadius: SIZES.medium,
    flexDirection: "row",
    alignorders: "center",
    gap: 6,
    paddingVertical: 3,
    backgroundColor: COLORS.lightWhite,
    borderRadius: SIZES.medium,
    minHeight: 70,
    marginBottom: 10,
    marginHorizontal: 4,
  },
  flexEnd: {
    position: "absolute",
    right: 10,
  },
  buttonView: {
    display: "flex",
    alignItems: "center",
    // backgroundColor: "red",
    alignItems: "center",
    height: "100%",
  },
  latestProductTitle: {
    fontSize: 16,
    paddingStart: SIZES.small,
    fontWeight: "bold",
    marginBottom: 8,
  },
  latestProductdetail: {
    fontSize: SIZES.small,
    fontWeight: "regular",
    color: COLORS.gray,
    marginBottom: 5,
  },
  productImage: {
    width: 35,
    height: 35,
    borderRadius: 100,
    borderWidth: 2,
    alignSelf: "center",
    top: "auto",
  },
  productTitle: {
    fontSize: SIZES.medium,
    fontWeight: "bold",
    color: COLORS.primary,
  },
});
