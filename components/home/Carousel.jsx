import { View, Text } from 'react-native';
import React from 'react';
import { SliderBox } from 'react-native-image-slider-box';
import { StyleSheet } from 'react-native';
import { COLORS } from '../../constants';

const Carousel = () => {
    const slides = [
        'https://thumbs.dreamstime.com/b/furniture-store-interior-modern-home-office-china-asia-59188080.jpg',
        'https://img.freepik.com/free-photo/mid-century-modern-living-room-interior-design-with-monstera-tree_53876-129805.jpg?w=2000',
        'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTifJQa8kt7gvxotVes9NlQRxgteroUPtxj0A&usqp=CAU',
        'https://www.worldmarket.com/dw/image/v2/BJWT_PRD/on/demandware.static/-/Sites-World_Market-Library/default/dw3e77158c/Gateway-Folder/116715-Furniture/3col-1a-gateway-furniture-mobile.jpg?sw=425&sfrm=jpg',
        'https://stylesatlife.com/wp-content/uploads/2020/04/contemporary-italian-bedroom-furniture.jpg'
    ]
  return (
    <View style={styles.carouselContainer}>
      <SliderBox images={slides} 
      dotColor={COLORS.primary}
      inActiveColor={COLORS.secondary}
      autoplay
      circleLoop
      ImageComponentStyle={{borderRadius: 15,
        width: '93%', marginTop: 15
    }}
      />
    </View>
  )
}

const styles = StyleSheet.create({
    carouselContainer: {
        flex: 1,
        alignItems: "center"
    }
})

export default Carousel;