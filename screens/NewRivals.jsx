import { View, Text, TouchableOpacity } from 'react-native';
import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import styles from './NewRivals.style';
import {Ionicons} from '@expo/vector-icons';
import { COLORS } from '../constants';
import ProductList from '../components/products/ProductList';


const NewRivals = ({navigation}) => {
  return (
    <SafeAreaView style={styles.container}>
    <View style={styles.wrapper}>
      <View style={styles.upperRow}>
      <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons size={30} name="chevron-back-circle" color={COLORS.lightWhite} />
        </TouchableOpacity>
        <Text style={styles.heading}>
          Products
        </Text>
      </View>
      <ProductList />
    </View>

    </SafeAreaView>
  )
}

export default NewRivals;