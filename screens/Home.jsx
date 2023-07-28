import { View, Text } from 'react-native';
import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import styles from './home';
import {Ionicons} from '@expo/vector-icons';



const Home = () => {
  return (
    <SafeAreaView>

     <View style={styles.appBarWrapper}>
      <View style={styles.appBar}>
        <Ionicons name='location-outline' size={24} />
        <Text style={styles.location}>Abuja, Nigeria</Text>
      </View>
     </View>

    </SafeAreaView>
  )
}

export default Home;