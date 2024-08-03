import { StyleSheet, Text, View } from "react-native";
import { COLORS, SIZES } from "../../constants";

const styles = StyleSheet.create({
  container: {
    // flex: 1,
    backgroundColor: COLORS.themeg,
    marginTop: 260,
    width: SIZES.width - 20,
    marginHorizontal: 10,
    borderRadius: SIZES.medium,
  },

  none: {
    display: "none",
  },
  wrapper: {
    marginHorizontal: 10,
    borderRadius: SIZES.medium,
    marginTop: 5,
    backgroundColor: COLORS.themeg,
    paddingBottom: 5,
  },
  separator: {
    marginTop: 4,
  },
  backBtn: {
    left: 10,
  },
  buttonWrap: {
    backgroundColor: COLORS.white,
    padding: 15,
    borderRadius: 100,
    justifyContent: "center",
    alignItems: "center",
    marginEnd: 10,
  },
  errorMessage: {
    fontFamily: "semibold",
    fontSize: SIZES.medium,
    textAlign: "center",
  },
  errorcontainer: {
    backgroundColor: COLORS.themew,
    marginTop: 260,
    width: SIZES.width - 20,
    marginHorizontal: 10,
    borderRadius: SIZES.medium,
    justifyContent: "center",
    alignItems: "center",
    height: SIZES.height / 2,
  },
  retryButton: {
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.themeg,
    borderRadius: SIZES.medium,
    padding: 20,
  },
  retryButtonText: {
    paddingTop: 10,
  },
  subtotalWrapper: {
    backgroundColor: COLORS.themeg,
    width: SIZES.width - 20,
    marginHorizontal: 10,
    borderRadius: SIZES.medium,
    marginTop: 20,
    flexDirection: "column",
  },
  topSubtotal: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 15,
    paddingVertical: 13,
  },
  centerSubtotal: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 15,
    paddingVertical: 13,
  },
  subtotalHeader: {
    fontFamily: "bold",
    fontSize: SIZES.medium,
  },
  additionalHeader: {
    fontFamily: "semibold",
  },
  totalAmount: {
    fontFamily: "bold",
  },
  checkoutBtn: {
    marginHorizontal: 10,
    backgroundColor: COLORS.green,
    height: SIZES.xxLarge + 10,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: SIZES.medium,
    borderRadius: SIZES.large,
    marginTop: SIZES.small,
  },
  checkoutTxt: {
    color: COLORS.white,
    fontFamily: "semibold",
    fontSize: SIZES.large,
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
    minHeight: SIZES.height - 300,
    backgroundColor: COLORS.themeg,
    marginTop: 260,
    width: SIZES.width - 20,
    marginHorizontal: 10,
    borderRadius: SIZES.medium,
  },
});

export default styles;
