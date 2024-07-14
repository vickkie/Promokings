import { StyleSheet, Text, View } from "react-native";
import { COLORS, SIZES } from "../../constants";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.themeg,
    marginTop: 260,
    width: SIZES.width - 20,
    marginHorizontal: 10,
    borderRadius: SIZES.medium,
  },
  wrapper: {
    marginHorizontal: 10,
    borderRadius: SIZES.medium,
    marginTop: 5,
    backgroundColor: COLORS.themeg,
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
});

export default styles;
