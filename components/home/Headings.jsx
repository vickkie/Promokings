import { View, Text } from 'react-native'
import React from 'react';
import styles from './headings.style';
import { TouchableOpacity } from 'react-native-gesture-handler';
import {Ionicons} from '@expo/vector-icons';
import { COLORS } from '../../constants';

const Headings = () => {

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>New Rivals</Text>
        <TouchableOpacity>
            <Ionicons name='ios-grid' size={24} color={COLORS.primary} />
        </TouchableOpacity>
      </View>
    </View>
  )

}

export default Headings;