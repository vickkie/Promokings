import { StyleSheet } from "react-native";
import { COLORS, SIZES } from '../../constants/index'

const styles = StyleSheet.create({
    container: {
        width: '100%',
    },

    welcomeTxt: (color, top) => ({
        fontFamily: "bold",
        fontSize: SIZES.xxLarge - 6,
        marginTop: top,
        color: color,
        marginHorizontal: 12
    }),

    searchContainer: {
        flexDirection: 'row',
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: COLORS.secondary,
        borderRadius: SIZES.medium,
        marginVertical: SIZES.medium,
        height: 50,
        marginHorizontal: SIZES.small
    },

    searchIcon: {
        marginHorizontal: 10,
        color: COLORS.gray
    },

    searchWrapper: {
        flex: 1,
        backgroundColor: COLORS.secondary,
        marginRight: SIZES.small,
        borderRadius: SIZES.small
    },

    searchInput: {
        fontFamily: 'regular',
        width: "100%",
        height: '100%',
        paddingHorizontal: SIZES.small
    },

    searchBtn: {
        width: 50,
        height: "100%",
        borderRadius: SIZES.medium,
        backgroundColor: COLORS.primary,
        justifyContent: "center",
        alignItems: "center",
    
    }
});

export default styles;