import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Home, Search, Profile, Categories } from "../screens";
import { COLORS } from "../constants/index";
import Icon from "../constants/icons";

const Tab = createBottomTabNavigator();

const screenOptions = {
  toBarShowLabel: false,
  tabBarHideOnKeyboard: true,
  headerShown: false,
  tabBarStyles: {
    position: "absolute",
    bottom: 0,
    right: 0,
    left: 0,
    elevation: 0,
    height: 90,
    borderRadius: 100,
  },
};

const BottomTabNavigation = () => {
  return (
    <Tab.Navigator screenOptions={screenOptions}>
      <Tab.Screen
        name="Home"
        component={Home}
        options={{
          tabBarIcon: ({ focused }) => {
            return (
              <Icon name={focused ? "homefilled" : "home"} size={24} color={focused ? COLORS.themey : COLORS.gray2} />
            );
          },
        }}
      ></Tab.Screen>

      <Tab.Screen
        name="Categories"
        component={Categories}
        options={{
          tabBarIcon: ({ focused }) => {
            return (
              <Icon
                name={focused ? "menu2filled" : "menu2"}
                size={24}
                color={focused ? COLORS.primary : COLORS.gray2}
              />
            );
          },
        }}
      ></Tab.Screen>
      <Tab.Screen
        name="Search"
        component={Search}
        options={{
          tabBarIcon: ({ focused }) => {
            return (
              <Icon
                name={focused ? "searchcirclefilled" : "searchcircle"}
                size={24}
                color={focused ? COLORS.primary : COLORS.gray2}
              />
            );
          },
        }}
      ></Tab.Screen>

      <Tab.Screen
        name="Profile"
        component={Profile}
        options={{
          tabBarIcon: ({ focused }) => {
            return (
              <Icon
                name={focused ? "usercirclefilled" : "usercircle"}
                size={24}
                color={focused ? COLORS.primary : COLORS.gray2}
              />
            );
          },
        }}
      ></Tab.Screen>
    </Tab.Navigator>
  );
};

export default BottomTabNavigation;
