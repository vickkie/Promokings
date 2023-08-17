import { StyleSheet } from "react-native";
import { SIZES, COLORS } from "../constants";

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },

    upperRow: {
        marginHorizontal: 20,
        flexDirection: "row",
        justifyContent: 'space-between',
        alignItems: "center",
        position: "absolute",
        top: SIZES.xxLarge,
        width: SIZES.width -44,
        zIndex: 999
    },

    image: {
        aspectRatio: 1,
        resizeMode: "cover"
    }
});

export default styles;