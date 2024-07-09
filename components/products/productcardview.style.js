import { StyleSheet, Text, View } from "react-native";
import { COLORS, SIZES } from "../../constants";

const styles = StyleSheet.create({
  container: {
    width: 162,
    height: 240,
    marginEnd: 10,
    borderRadius: SIZES.medium,
    backgroundColor: COLORS.secondary,
    marginBottom: SIZES.medium,
  },
  imageContainer: {
    flex: 1,
    width: 150,
    marginTop: SIZES.small / 2,
    marginLeft: SIZES.small / 2,
    overflow: "hidden",
    borderRadius: SIZES.small,
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
  },
  addBtn: {
    position: "absolute",
    bottom: SIZES.small,
    right: SIZES.small,
  },
});

export default styles;
