import { StyleSheet, Text, View } from "react-native";
import { COLORS, SIZES } from "../../constants";

const styles = StyleSheet.create({
  container: {
    marginTop: SIZES.small,
    marginBottom: 44,
    marginHorizontal: 12,
  },
  errorBox: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    height: "auto",
  },
  errorMessage: {
    fontFamily: "bold",
    textAlign: "center",
    fontSize: SIZES.medium,
  },
});

export default styles;
