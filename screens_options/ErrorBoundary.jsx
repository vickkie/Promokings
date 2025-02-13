import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import ErrorBoundary from "react-native-error-boundary";
import { SIZES, COLORS } from "../constants";

const ErrorFallback = ({ error, resetError }) => (
  <View style={styles.container}>
    <View style={styles.innerContainer}>
      <Text style={styles.title}>Oops!</Text>
      <Text style={styles.subtitle}>There's an error</Text>
      <Text style={styles.errorText}>{error.toString()}</Text>

      <TouchableOpacity onPress={resetError} style={styles.button}>
        <Text style={styles.buttonText}>Try again</Text>
      </TouchableOpacity>
    </View>
  </View>
);

const ErrorBoundary2 = ({ children }) => {
  return <ErrorBoundary FallbackComponent={ErrorFallback}>{children}</ErrorBoundary>;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: SIZES.small,
    backgroundColor: "#fff",
    padding: 16,
    textAlign: "center",
  },
  innerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: SIZES.small,
    backgroundColor: COLORS.themeg,
    borderRadius: SIZES.small,
    height: SIZES.height - 16,
    width: SIZES.width - 16,
    textAlign: "center",
  },
  title: {
    fontSize: 48,
    fontWeight: "bold",
    color: "#333",
  },
  subtitle: {
    fontSize: 24,
    fontWeight: "bold",

    paddingHorizontal: 10,
    paddingVertical: 5,
    marginVertical: 8,
  },
  errorText: {
    fontSize: 14,
    color: "#555",
    padding: 8,
    borderRadius: 5,
    textAlign: "center",
    maxWidth: "80%",
    marginBottom: 20,
  },
  button: {
    backgroundColor: COLORS.themey,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 25,
    width: SIZES.width - 62,
    height: 50,
    display: "flex",
    justifyContent: "center",
    alignContent: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
  },
});

export default ErrorBoundary2;
