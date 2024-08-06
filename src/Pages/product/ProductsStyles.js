import React from 'react';
import {
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

const ProductsStyles = ({navigation}) => {
  const handleGoBack = () => {
    navigation.goBack();
  };
  const handleAddNew = () => {
    navigation.navigate('AddNewStyle');
  };
  return (
    <View style={styles.container}>
      <View style={styles.head1}>
        <TouchableOpacity onPress={handleGoBack}>
          <Image
            style={{height: 25, width: 25, marginLeft: 2}}
            source={require('../../../assets/back_arrow.png')}
          />
        </TouchableOpacity>
        <Text style={styles.txt1}>Product Publish</Text>
        <View style={styles.flexSpacer} />
        <TouchableOpacity style={styles.head2}>
          <Text style={styles.txt2}>Upload</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={handleAddNew} style={styles.head2}>
          <Text style={styles.txt2}>Add New Style</Text>
        </TouchableOpacity>
      </View>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          marginLeft: 5,
          marginTop: 10,
        }}>
        <View style={styles.searchContainer}>
          <TextInput style={styles.searchInput} placeholder="Search" />
        </View>
        <TouchableOpacity style={styles.head2}>
          <Text style={styles.txt2}>PUBLISH</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  txt1: {
    color: '#000',
    fontSize: 20,
    fontWeight: '500',
    marginHorizontal: 10,
  },
  head1: {
    marginVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  flexSpacer: {
    flex: 1,
  },
  head2: {
    alignItems: 'center',
    borderWidth: 1,
    padding: 6,
    borderRadius: 10,
    marginHorizontal: 5,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 10,
    flex: 1,
  },
});
export default ProductsStyles;
