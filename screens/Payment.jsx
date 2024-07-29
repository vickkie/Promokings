import React from "react";
import { View, Text, Button } from "react-native";

export default function PaymentScreen() {
  const handlePayment = () => {
    // Handle payment process
  };

  return (
    <View>
      <Text>Payment Information</Text>
      {/* Display payment options */}
      <Button title="Pay" onPress={handlePayment} />
    </View>
  );
}
