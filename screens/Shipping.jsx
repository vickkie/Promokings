import React from "react";
import { View, Text, Button, TextInput } from "react-native";

export default function ShippingScreen({ navigation }) {
  const handleNext = () => {
    navigation.navigate("Payment");
  };

  return (
    <View>
      <Text>Shipping Address</Text>
      <TextInput placeholder="Enter address" />
      <Text>Phone Number</Text>
      <TextInput placeholder="Enter phone number" />
      <Button title="Next" onPress={handleNext} />
    </View>
  );
}
