import { COLORS, SIZES} from '../../constants';
import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
    container: {
        width: 182,
        height: 350,
        marginEnd: SIZES.medium,
        backgroundColor: COLORS.secondary
    },

    imageContainer: {
        flex: 1,
        width: 170,
        marginLeft: SIZES.small/2,
        marginTop: SIZES.small/2,
        borderRadius: SIZES.small,
        overflow: "hidden",
    },

    image: {
        aspectRatio: 1,
        resizeMode: "cover"
    }
});

export default styles;