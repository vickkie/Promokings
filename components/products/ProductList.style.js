import { StyleSheet } from "react-native";
import { COLORS, SIZES } from "../../constants";

const styles = StyleSheet.create({
    loadingContainer: {
        flex: 1,
        alignContent: "center",
        justifyContent: "center",
        alignItems: "center"
    },

    container: {
        alignItems: "center",
        paddingTop: SIZES.xxLarge,
        paddingLeft: SIZES.small/2
    },

    separator: {
        height: 20
    }
});

export default styles;