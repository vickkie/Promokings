import React, { useState, useContext, useEffect } from "react";

import { COLORS, SIZES } from "../../../constants";

import { SafeAreaView } from "react-native-safe-area-context";
import { StyleSheet, View, Text, ScrollView, TouchableOpacity } from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import Icon from "../../../constants/icons";
import OrdersDispatchList from "./OrdersList";

const OrdersDispatch = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { refresh } = route.params || false;
  const { refreshin } = route.params || false;

  const [refreshList, setRefreshList] = useState(refresh);
  const [refreshing, setRefreshing] = useState(false);
  const [irefresh, setiRefresh] = useState(refresh);
  const [pending, setPending] = useState([]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.wrapper}>
        <View style={styles.upperRow}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={[styles.backBtn, styles.buttonWrap]}>
            <Icon name="backbutton" size={26} />
          </TouchableOpacity>
          <Text style={styles.heading}>Unassigned Dispatch</Text>
          <TouchableOpacity
            style={styles.buttonWrap}
            onPress={() => {
              pending.length > 0 && navigation.navigate("Dispatcher Navigation");
            }}
          >
            <View style={styles.numbers}>
              <Text>{pending.length}</Text>
            </View>
            <Icon name="pending" size={26} />
          </TouchableOpacity>
        </View>

        <OrdersDispatchList irefresh={irefresh} setiRefresh={setiRefresh} setPending={setPending} filter={"approved"} />
      </View>
    </SafeAreaView>
  );
};

export default OrdersDispatch;

const styles = StyleSheet.create({
  textStyles: {
    fontFamily: "bold",
    fontSize: 19,
  },
  heading: {
    fontFamily: "bold",
    textTransform: "uppercase",
    fontSize: SIZES.large - 4,
    textAlign: "center",
    color: COLORS.themeb,
  },
  container: {
    flex: 1,
    backgroundColor: COLORS.black,
  },
  wrapper: {
    flex: 1,
    backgroundColor: COLORS.white,
  },

  upperRow: {
    width: SIZES.width - 14,
    marginHorizontal: SIZES.xSmall - 4,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    position: "absolute",
    backgroundColor: COLORS.themeg,
    borderRadius: SIZES.large,
    top: SIZES.xxSmall,
    zIndex: 999,
    height: 80,
  },

  backBtn: {
    left: 10,
  },
  buttonWrap: {
    backgroundColor: COLORS.white,
    padding: 15,
    borderRadius: 100,
    justifyContent: "center",
    alignItems: "center",
    marginEnd: 10,
  },
  numbers: {
    // padding: 3,
    width: 20,
    height: 20,
    backgroundColor: COLORS.themey,
    color: COLORS.themew,
    borderRadius: 100,
    position: "absolute",
    top: "-6%",
    left: "-5%",
    justifyContent: "center",
    alignItems: "center",
  },
  number: {
    color: COLORS.white,
  },
});
