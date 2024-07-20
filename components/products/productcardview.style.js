import { StyleSheet, Text, View } from "react-native";
import { COLORS, SIZES } from "../../constants";

const styles = StyleSheet.create({
  container: {
    width: 162,
    height: 240,
    marginEnd: 10,
    borderRadius: SIZES.medium,
    backgroundColor: COLORS.themeg,
    // marginBottom: SIZES.medium,
  },
  imageContainer: {
    flex: 1,
    width: 157,
    marginTop: SIZES.small / 2 - 4,
    marginLeft: SIZES.small / 2 - 4,
    overflow: "hidden",
    borderRadius: SIZES.small,
    backgroundColor: COLORS.themew,
  },
  image: {
    aspectRatio: 1,
    resizeMode: "cover",
  },
  details: {
    padding: SIZES.small,
  },
  title: {
    fontFamily: "bold",
    fontSize: SIZES.medium,
    marginBottom: 2,
  },
  price: {
    fontFamily: "bold",
  },
  supplier: {
    fontSize: SIZES.medium,
    paddingVertical: SIZES.small - 7,
  },
  addBtn: {
    position: "absolute",
    bottom: SIZES.small,
    right: SIZES.small,
  },
});

export default styles;
