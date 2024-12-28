import { StyleSheet, Text, View } from "react-native";
import React from "react";

const BrokenComponent = () => {
  throw new Error("This is a simulated error for testing purposes.");
  return <Text>You should not see this text.</Text>;
};

export default BrokenComponent;

const styles = StyleSheet.create({});
