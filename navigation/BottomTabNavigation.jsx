import { View, Text } from "react-native";
import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import {  Profile, Search } from "../screens";
import { Ionicons } from "@expo/vector-icons";
import { COLORS } from "../constants/index";
import HomePage from "../screens/HomePage";

const Tab = createBottomTabNavigator();

const screenOptions = {
  tabBarShowLabel: false,
  tabBarHideOnKeyboard: true,
  headerShown: false,

  tabBarStyle: {
    left: 0,
    right: 0,
    bottom: 0,
    elevation: 0,
    height: 60,
  },
};

const BottomTabNavigation = () => {
  return (
    <Tab.Navigator screenOptions={screenOptions}>
      <Tab.Screen
        name="Home"
        component={HomePage}
        options={{
          tabBarIcon: ({ focused }) => {
            return (
              <Ionicons
                name={focused ? "home" : "home-outline"}
                size={24}
                color={focused ? COLORS.primary : COLORS.gray}
              />
            );
          },
        }}
      />

      <Tab.Screen
        name="Search"
        component={Search}
        options={{
          tabBarIcon: ({ focused }) => {
            return (
              <Ionicons
                name={"search-sharp"}
                size={24}
                color={focused ? COLORS.primary : COLORS.gray}
              />
            );
          },
        }}
      />

      <Tab.Screen
        name="Profile"
        component={Profile}
        options={{
          tabBarIcon: ({ focused }) => {
            return (
              <Ionicons
                name={focused ? "person" : "person-outline"}
                size={24}
                color={focused ? COLORS.primary : COLORS.gray}
              />
            );
          },
        }}
      />
    </Tab.Navigator>
  );
};

export default BottomTabNavigation;
