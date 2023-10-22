import {COLORS,SIZES} from '..//constants';
import { StyleSheet } from 'react-native';


const styles = StyleSheet.create({

    container: {
        backgroundColor: COLORS.lightWhite,
        flex: 1,
    },

    cover: {
        height: 290,
        width: "100%",
        resizeMode: "cover"
    },

    profileContainer: {
        flex: 1,
        alignItems: 'center'
    },

    profile: {
        height: 155,
        width: 155,
        borderRadius: 999,
        borderColor: COLORS.primary,
        borderWidth: 2,
        resizeMode: "cover",
        marginTop: -90
    },

    name: {
        fontFamily: "bold",
        color: COLORS.primary,
        marginVertical: 6
    }

});

export default styles;