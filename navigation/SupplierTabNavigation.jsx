import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { InventoryRequests, SupplierDashboard, SupplierSettings } from "../screens";

import { COLORS } from "../constants/index";
import Icon from "../constants/icons";
import { TouchableOpacity } from "react-native-gesture-handler";

const Tab = createBottomTabNavigator();
import { StyleSheet, View } from "react-native";

const screenOptions = {
  tabBarShowLabel: true,
  tabBarHideOnKeyboard: true,
  headerShown: false,
  tabBarStyle: {
    position: "absolute",
    bottom: 0,
    right: 0,
    left: 0,
    elevation: 0,
    height: 50,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    borderWidth: 1,
    borderColor: COLORS.themey,
  },
  tabBarLabelStyle: {
    fontSize: 12,
    fontWeight: "bold",
    fontFamily: "medium",
  },
  tabBarActiveTintColor: COLORS.themeb,
  tabBarInactiveTintColor: COLORS.gray2,
};

const shadowStyle = {
  shadowColor: "#000",
  shadowOffset: {
    width: 0,
    height: -1,
  },
  shadowOpacity: 0.08,
  shadowRadius: 6,

  elevation: 12, // Android elevation
};

const SupplierTabNavigation = () => {
  return (
    <Tab.Navigator screenOptions={screenOptions}>
      <Tab.Screen
        name="SupplierDashboard"
        component={SupplierDashboard}
        options={{
          tabBarIcon: ({ focused }) => (
            <Icon name={focused ? "homefilled" : "home"} size={24} color={focused ? COLORS.primary : COLORS.gray2} />
          ),
          tabBarLabel: "Home",
        }}
      />
      <Tab.Screen
        name="InventoryRequests"
        component={InventoryRequests}
        options={{
          tabBarIcon: ({ focused }) => (
            <Icon name={focused ? "menu2filled" : "menu2"} size={24} color={focused ? COLORS.primary : COLORS.gray2} />
          ),
          tabBarLabel: "Bids",
        }}
      />
      {/*
      
      <Tab.Screen
        name="SalesOverviews"
        component={SalesOverview}
        options={{
          tabBarIcon: ({ focused }) => (
            <TouchableOpacity
              style={{
                height: 70,
                width: 70,
                borderRadius: 100,
                marginTop: -10,
                backgroundColor: COLORS.themew,
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <View style={shadowStyle}>
                <Icon
                  name={focused ? "invoicefilled" : "invoice"}
                  size={34}
                  color={focused ? COLORS.primary : COLORS.gray2}
                />
              </View>
            </TouchableOpacity>
          ),
          tabBarLabel: "",
        }}
      />
      <Tab.Screen
        name="SalesShipment"
        component={SalesShipments}
        options={{
          tabBarIcon: ({ focused }) => (
            <Icon name={focused ? "truckfilled" : "truck"} size={32} color={focused ? COLORS.primary : COLORS.gray2} />
          ),
          tabBarLabel: "Shipments",
        }}
      /> */}
      <Tab.Screen
        name="SupplierSettings"
        component={SupplierSettings}
        options={{
          tabBarIcon: ({ focused }) => (
            <Icon name={focused ? "settings" : "settings"} size={26} color={focused ? COLORS.primary : COLORS.gray2} />
          ),
          tabBarLabel: "Profile",
        }}
      />
    </Tab.Navigator>
  );
};

export default SupplierTabNavigation;

const styles = StyleSheet.create({});
