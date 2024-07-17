import { StyleSheet, Text, View } from "react-native";
import { COLORS, SIZES } from "../../constants";

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.medium,
    flexDirection: "row",
    paddingHorizontal: 4,
    paddingVertical: 20,
    justifyContent: "flex-start",
    alignItems: "center",
    gap: 6,
  },
  wrapper: {
    flex: 1,
    backgroundColor: COLORS.white,
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
  imageContainer: {
    height: 90,
    width: 90,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 200,
    borderColor: COLORS.themeg,
    borderWidth: 1,
  },
  image: {
    borderRadius: 200,
    height: "96%",
    width: "96%",
  },
  title: {
    fontFamily: "semibold",
    fontSize: SIZES.medium,
  },
  size: {
    fontFamily: "regular",
    fontSize: SIZES.medium - 2,
    paddingStart: 2,
  },
  details: {
    gap: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    width: SIZES.width / 2 + 20,
  },
  lovehate: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 3,
    alignItems: "center",
    width: 50,
  },
  addminus: {
    flexDirection: "row",
    justifyContent: "space-between",
    // alignSelf: "center",
    alignItems: "center",
    gap: 4,
    width: 60,
  },
  lovebuttons: {
    padding: 5,
    borderRadius: 20,
    backgroundColor: COLORS.themeg,
  },
  priceadd: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
});

export default styles;
