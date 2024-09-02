import { StyleSheet, Text, View } from "react-native";
import { COLORS, SIZES } from "../../constants";

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    paddingTop: SIZES.xxLarge + 30,
    paddingLeft: SIZES.small / 2,
    width: SIZES.width,
  },

  flatlistContainer: {
    paddingTop: SIZES.xxLarge,
    paddingLeft: SIZES.small / 2,
    width: SIZES.width - SIZES.small,
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    height: SIZES.height,
  },

  separator: {
    height: 16,
  },
  errorContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    alignContent: "center",
    height: SIZES.height,
  },
  errorMessage: {
    fontFamily: "bold",
  },

  retryButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 14,
    marginTop: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  retryButtonText: {
    color: "#fff",
    fontSize: SIZES.medium,
    textAlign: "center",
  },
  toTopButton: {
    position: "absolute",
    bottom: 20,
    right: 20,
    backgroundColor: "black",
    padding: 10,
    borderRadius: 100,
  },
});

export default styles;
