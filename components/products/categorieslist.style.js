import { StyleSheet, Text, View } from "react-native";
import { COLORS, SIZES } from "../../constants";

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    paddingTop: SIZES.xxSmall,
    width: SIZES.width,
    paddingTop: 67,
    paddingHorizontal: 2,
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    alignContent: "center",
    height: SIZES.height,
  },

  separator: {
    height: 3,
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
  containLottie: {
    justifyContent: "center",
    alignItems: "center",
    width: SIZES.width - 20,
    flex: 1,
  },
  animationWrapper: {
    width: 200,
    height: 200,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  animation: {
    width: "100%",
    height: "100%",
  },
  containerx: {
    minHeight: SIZES.height - 100,
    backgroundColor: COLORS.themeg,
    marginTop: 135,
    width: SIZES.width - 20,
    marginHorizontal: 10,
    borderRadius: SIZES.medium,
  },
});

export default styles;
