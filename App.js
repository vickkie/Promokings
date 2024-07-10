import "react-native-gesture-handler";
import { enableScreens } from "react-native-screens";
import { enableLayoutAnimations } from "react-native-reanimated";

import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { StyleSheet, Text, View } from "react-native";
import { useFonts } from "expo-font";
import * as Splashscreen from "expo-splash-screen";
import { useCallback } from "react";
import BottomTabNavigation from "./navigation/BottomTabNavigation";
import { Cart, ProductDetails, NewRivals, LoginPage, Favourites, Orders, Register } from "./screens";

enableScreens();
enableLayoutAnimations(true);

const Stack = createNativeStackNavigator();

export default function App(params) {
  const [fontLoaded] = useFonts({
    bold: require("./assets/fonts/Poppins-Bold.ttf"),
    extrabold: require("./assets/fonts/Poppins-ExtraBold.ttf"),
    light: require("./assets/fonts/Poppins-Light.ttf"),
    medium: require("./assets/fonts/Poppins-Medium.ttf"),
    semibold: require("./assets/fonts/Poppins-SemiBold.ttf"),
    regular: require("./assets/fonts/Poppins-Regular.ttf"),
  });

  const onLayoutRootView = useCallback(async () => {
    if (fontLoaded) {
      await Splashscreen.hideAsync();
    }
  }, [fontLoaded]);

  if (!fontLoaded) {
    return null;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen
          name="Bottom Navigations"
          component={BottomTabNavigation}
          options={{ headerShown: false }}
        ></Stack.Screen>
        <Stack.Screen name="Login" component={LoginPage} options={{ headerShown: false }}></Stack.Screen>
        <Stack.Screen name="ProductDetails" component={ProductDetails} options={{ headerShown: false }}></Stack.Screen>
        <Stack.Screen name="ProductList" component={NewRivals} options={{ headerShown: false }}></Stack.Screen>
        <Stack.Screen name="Favourites" component={Favourites} options={{ headerShown: false }}></Stack.Screen>
        <Stack.Screen name="Cart" component={Cart} options={{ headerShown: false }}></Stack.Screen>
        <Stack.Screen name="Orders" component={Orders} options={{ headerShown: false }}></Stack.Screen>
        <Stack.Screen name="Register" component={Register} options={{ headerShown: false }}></Stack.Screen>
      </Stack.Navigator>
    </NavigationContainer>
  );
}
