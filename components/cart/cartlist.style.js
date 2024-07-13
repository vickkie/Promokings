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
});

export default styles;
