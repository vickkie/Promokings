import { StyleSheet } from "react-native";
import { SIZES, COLORS } from "../constants";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.lightWhite,
  },

  wrapper: {
    flex: 1,
    backgroundColor: COLORS.themeg,
    alignItems: "center",
    justifyContent: "center",
  },

  upperRow: {
    width: SIZES.width - 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    position: "absolute",
    backgroundColor: COLORS.themew,
    borderRadius: SIZES.large,
    top: SIZES.small,
    minHeight: 100,
    zIndex: 999,
  },

  heading: {
    color: COLORS.themeb,
    marginLeft: 5,
    fontFamily: "semibold",
    fontSize: SIZES.large,
  },
  buttonWrap: {
    backgroundColor: COLORS.hyperlight,
    padding: 15,
    borderRadius: 100,
    justifyContent: "center",
    alignItems: "center",
    marginEnd: 10,
    marginStart: 10,
  },
});

export default styles;
