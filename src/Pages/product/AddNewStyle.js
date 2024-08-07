import React from 'react';
import {
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { useNavigation } from '@react-navigation/native';
import NewStyleDetail from './NewStyleDetail';
import UploadProductImage from './UploadProductImage';

const Tab = createMaterialTopTabNavigator();

const CustomTabBar = ({ state, descriptors, navigation }) => {

  return (
    <View style={styles.tabContainer}>
      {state.routes.map((route, index) => {
        const label = route.name;
        const isFocused = route.key === state.routes[state.index].key;
        return (
          <TouchableOpacity
            key={index}
            onPress={() => navigation.navigate(route.name)}
            style={[styles.tabButton, isFocused && styles.activeTabButton]}>
            <Text style={[styles.tabText, isFocused && styles.activeTabText]}>
              {label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const AddNewStyle = () => {
    const navigation = useNavigation();

  return (
    <View style={styles.container}>
      <Tab.Navigator tabBar={props => <CustomTabBar {...props}  navigation={navigation}/>}>
        <Tab.Screen name="Basic Info" component={NewStyleDetail} />
        <Tab.Screen name="Product Images" component={UploadProductImage} />
      </Tab.Navigator>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1, 
    backgroundColor: '#fff', 
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingTop: 10,
  },
 
  activeTabText: {
    fontWeight: 'bold',
    color: '#000',
  },
  tabContainer: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    backgroundColor: '#ffffff',
    marginTop: 10,
    marginHorizontal: 7,
    borderRadius: 30,
    borderColor: '#000',
    borderWidth: 1,
    elevation: 5,
    zIndex: 1,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  activeTabButton: {
    backgroundColor: '#1F74BA',
    borderBottomColor: '#000',
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    borderBottomRightRadius: 25,
    borderBottomLeftRadius: 25,
    elevation: 2,
  },
  tabText: {
    fontSize: 16,
    color: '#000000',
  },
  activeTabText: {
    fontWeight: 'bold',
    color: '#fff',
  },
});

export default AddNewStyle;
