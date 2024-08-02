import React, { useEffect, useState } from 'react';
import {
  Text,
  TouchableOpacity,
  View,
  PermissionsAndroid,
  StyleSheet,
  Alert,
  Linking,
  Platform,
} from 'react-native';
import Geolocation from 'react-native-geolocation-service';
import axios from 'axios';
import { useSelector } from 'react-redux';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { API } from '../../config/apiConfig';

const CustomerLocation = () => {
  const userData = useSelector(state => state.loggedInUser);
  const [mLat, setMLat] = useState(null);
  const [mLong, setMLong] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [filteredTasks, setFilteredTasks] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTask, setSelectedTask] = useState(null);
  const [clicked, setClicked] = useState(false);
  const [initialSelectedCompany, setInitialSelectedCompany] = useState(null);
  const selectedCompany = useSelector(state => state.selectedCompany);

  useFocusEffect(
    React.useCallback(() => {
      requestLocationPermission();
      getLocation();
      getTasksAccUser();
    }, [])
  );

  useEffect(() => {
    const fetchInitialSelectedCompany = async () => {
      try {
        const initialCompanyData = await AsyncStorage.getItem('initialSelectedCompany');
        if (initialCompanyData) {
          const initialCompany = JSON.parse(initialCompanyData);
          setInitialSelectedCompany(initialCompany);
          console.log('Initial Selected Company:', initialCompany);
        }
      } catch (error) {
        console.error('Error fetching initial selected company:', error);
      }
    };

    fetchInitialSelectedCompany();
  }, []);

  const companyId = selectedCompany ? selectedCompany.id : initialSelectedCompany?.id;

  const getTasksAccUser = () => {
    if (!userData) {
      console.error('User data is null');
      return;
    }
    const apiUrl = `${global?.userData?.productURL}${API.GET_TASKS_ACC_USER}/${userData.userId}/${companyId}`;
    axios
      .get(apiUrl, {
        headers: {
          Authorization: `Bearer ${global?.userData?.token?.access_token}`,
        },
      })
      .then(response => {
        console.log('API Response:', response.data);
        const taskOptions = response.data.map(task => ({
          label: task.taskName,
          value: task.id,
          locationName: task.locationName || '', // Default to empty string if not available
        }));
        setTasks(taskOptions);
        setFilteredTasks(taskOptions);
      })
      .catch(error => {
        console.error('Error fetching tasks:', error.response ? error.response.data : error.message);
      });
  };

  const requestLocationPermission = async () => {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        {
          title: 'Location Permission',
          message: 'We need access to your location to show it on the map.',
          buttonNeutral: 'Ask Me Later',
          buttonNegative: 'Cancel',
          buttonPositive: 'OK',
        },
      );
      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        console.log('Location permission granted');
      } else {
        console.log('Location permission denied');
      }
    } catch (err) {
      console.warn(err);
    }
  };

  const getLocation = (retryCount = 0) => {
    Geolocation.getCurrentPosition(
      position => {
        setMLat(position.coords.latitude);
        setMLong(position.coords.longitude);
        console.log('Current location:', position.coords.latitude, position.coords.longitude);
      },
      error => {
        console.error('Error getting location:', error);
        if (retryCount < 3) { // Retry up to 3 times
          setTimeout(() => getLocation(retryCount + 1), 1000); // Wait 1 second before retrying
        } else {
          Alert.alert('Error', 'Current location not available');
        }
      },
      { enableHighAccuracy: true, timeout: 30000, maximumAge: 1000 } // Increase timeout to 30 seconds
    );
  };

  const handleDropdownClick = () => {
    setClicked(!clicked);
  };

  const createAddressString = task => {
    console.log('Full Task Object:', task);

    const {
      locationName = ''
    } = task;

    const addressParts = [
      locationName,
    ];
    const address = addressParts.filter(part => part.trim()).join(', ');

    console.log('Constructed Address:', address);
    return address;
  };

  const handleTaskSelect = task => {
    console.log('Selected Task:', task);
    setSelectedTask(task);
    setSearchQuery(task.label);
    setClicked(false);

    if (!mLat || !mLong) {
      console.error('Current location not available');
      Alert.alert('Error', 'Current location not available');
      return;
    }

    const address = createAddressString(task);
    openGoogleMaps(mLat, mLong, address);
  };

  const openGoogleMaps = (startLat, startLong, destinationAddress) => {
    const url = Platform.select({
      ios: `maps://app?saddr=${startLat},${startLong}&daddr=${destinationAddress}`,
      android: `https://www.google.com/maps/dir/?api=1&origin=${startLat},${startLong}&destination=${encodeURIComponent(destinationAddress)}&travelmode=driving`,
    });

    Linking.canOpenURL(url)
      .then(supported => {
        if (!supported) {
          Alert.alert('Error', 'Google Maps is not installed');
        } else {
          return Linking.openURL(url);
        }
      })
      .catch(err => console.error('An error occurred', err));
  };

  return (
    <View style={styles.dropdownContainer}>
    <View style={styles.dropdownContent}>
      {filteredTasks.length === 0 ? (
        <Text style={styles.noResultsText}>Sorry, no results found!</Text>
      ) : (
        filteredTasks.map(task => (
          <TouchableOpacity
            key={task.value}
            style={styles.dropdownItem}
            onPress={() => handleTaskSelect(task)}>
            <View style={{borderWidth: 1, marginHorizontal: 1, paddingVertical: 20, marginVertical: 3, borderRadius: 10}}>
              <Text style={styles.dropdownItemText}>{task.label}</Text>
            </View>
          </TouchableOpacity>
        ))
      )}
    </View>
  </View>
  
  );
};

const styles = StyleSheet.create({
  dropdownContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  dropdownButton: {
    backgroundColor: '#ddd',
    padding: 10,
    borderRadius: 5,
    flexDirection: 'row',
    alignItems: 'center',
  },
  dropdownText: {
    flex: 1,
    fontSize: 16,
  },
  dropdownIcon: {
    width: 20,
    height: 20,
  },
  dropdownMenu: {
    backgroundColor: '#fff',
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 5,
    position: 'absolute',
    top: 50,
    width: '100%',
    maxHeight: 200,
    zIndex: 10,
  },
  searchInput: {
    padding: 10,
    borderBottomColor: '#ddd',
    borderBottomWidth: 1,
  },
  dropdownItem: {
  },
  optionText: {
    color: '#000',
  },
  dropdownItemText: {
    marginLeft:10,
    color: '#000',
  },
  noResultsText:{
    top: 40,
    textAlign: 'center',
    color: '#000000',
    fontSize: 20,
    fontWeight: 'bold',
    padding: 5,
  }
 
});

export default CustomerLocation;

