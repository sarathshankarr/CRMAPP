import React from 'react';
import {StyleSheet, Text, View} from 'react-native';

const AddNewStyle = () => {
  return (
    <View
      style={styles.container}>
      <Text>AddNewStyle</Text>
    </View>
  );
};

const styles=StyleSheet.create({
    container:{
        flex:1,
        backgroundColor:"#fff"
    }
})
export default AddNewStyle;