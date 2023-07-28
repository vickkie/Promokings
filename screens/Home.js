import { StyleSheet } from "react-native";
import {COLORS, SIZES} from "../constants/index";

const styles = StyleSheet.create({
    appBarWrapper: {
        marginHorizontal: 22,
        marginTop: SIZES.small
    },

    appBar: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",   
    },

    location: {
        fontFamily: "semibold",
        fontSize: SIZES.medium,
        color: COLORS.gray
    }

});

export default styles;