import { StyleSheet, Text, View } from "react-native";
import React from "react";
import { useRoute } from "@react-navigation/native";

const Checkout = () => {
  const route = useRoute();
  const { estimatedAmount } = route.params;

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Checkout</Text>
      <Text style={styles.amount}>Estimated Amount: {estimatedAmount}</Text>
    </View>
  );
};

export default Checkout;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    fontSize: 24,
    marginBottom: 20,
  },
  amount: {
    fontSize: 20,
  },
});
