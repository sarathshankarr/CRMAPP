import React, {useEffect, useState} from 'react';
import {
  Text,
  TouchableOpacity,
  View,
  PermissionsAndroid,
  StyleSheet,
  TextInput,
  ScrollView,
  Image,
} from 'react-native';
import MapView, {Marker, Polyline} from 'react-native-maps';
import Geolocation from 'react-native-geolocation-service';
import axios from 'axios';
import {useSelector} from 'react-redux';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Function to decode polyline from Here Maps Directions API
const decodePolyline = encoded => {
  const points = [];
  let index = 0,
    lat = 0,
    lng = 0;
  while (index < encoded.length) {
    let b,
      shift = 0,
      result = 0;
    do {
      b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);
    const dlat = (result & 1) !== 0 ? ~(result >> 1) : result >> 1;
    lat += dlat;
    shift = 0;
    result = 0;
    do {
      b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);
    const dlng = (result & 1) !== 0 ? ~(result >> 1) : result >> 1;
    lng += dlng;
    points.push([lat / 1e5, lng / 1e5]);
  }
  return points;
};

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
  const [routePath, setRoutePath] = useState([]);
  const selectedCompany = useSelector(state => state.selectedCompany);

  useEffect(() => {
    const fetchInitialSelectedCompany = async () => {
      try {
        const initialCompanyData = await AsyncStorage.getItem(
          'initialSelectedCompany',
        );
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

  const companyId = selectedCompany
    ? selectedCompany.id
    : initialSelectedCompany?.id;

  const getTasksAccUser = () => {
    if (!userData) {
        console.error('User data is null');
        return;
      }
    const apiUrl = `https://crm.codeverse.co/erpportal/api/master/getTasksAccUser/${userData.userId}/${companyId}`;
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
          latitude: task.latitude || null, // Default to null if not available
          longitude: task.longitude || null, // Default to null if not available
          locationName: task.locationName || '', // Default to empty string if not available
          houseNo: task.houseNo || '', // Default to empty string if not available
          street: task.street || '', // Default to empty string if not available
          locality: task.locality || '', // Default to empty string if not available
          cityOrTown: task.cityOrTown || '', // Default to empty string if not available
          state: task.state || '', // Default to empty string if not available
          country: task.country || '', // Default to empty string if not available
          pincode: task.pincode || '', // Default to empty string if not available
        }));
        setTasks(taskOptions);
        setFilteredTasks(taskOptions);
      })
      .catch(error => {
        console.error(
          'Error fetching tasks:',
          error.response ? error.response.data : error.message,
        );
      });
  };

  const createAddressString = task => {
    console.log('Full Task Object:', task);

    const {
      houseNo = '',
      street = '',
      locality = '',
      cityOrTown = '',
      state = '',
      country = '',
      pincode = '',
    } = task;

    const addressParts = [
      houseNo,
      street,
      locality,
      cityOrTown,
      state,
      country,
      pincode,
    ];
    const address = addressParts.filter(part => part.trim()).join(', ');

    console.log('House No:', houseNo);
    console.log('Street:', street);
    console.log('Locality:', locality);
    console.log('City/Town:', cityOrTown);
    console.log('State:', state);
    console.log('Country:', country);
    console.log('Pincode:', pincode);
    console.log('Constructed Address:', address);

    return address;
  };

  useEffect(() => {
    requestLocationPermission();
    getLocation();
    getTasksAccUser();
  }, []);

  useEffect(() => {
    if (searchQuery) {
      const filtered = tasks.filter(task =>
        task.label.toLowerCase().includes(searchQuery.toLowerCase()),
      );
      setFilteredTasks(filtered);
    } else {
      setFilteredTasks(tasks);
    }
  }, [searchQuery, tasks]);

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

  const getLocation = () => {
    Geolocation.getCurrentPosition(
      position => {
        setMLat(position.coords.latitude);
        setMLong(position.coords.longitude);
      },
      error => {
        console.error('Error getting location:', error);
      },
      {enableHighAccuracy: true, timeout: 20000, maximumAge: 1000},
    );
  };

  const handleDropdownClick = () => {
    setClicked(!clicked);
  };

  const getCoordinatesFromAddress = async address => {
    if (!address) {
      console.error('Address is empty or null');
      return null;
    }

    console.log('Requesting coordinates for address:', address);
    const geocodingUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
      address,
    )}&key=AIzaSyABAt-YLOZXJGPN-6X33p_NkH1NiFCGVx8`;

    try {
      const response = await axios.get(geocodingUrl);
      console.log('Geocoding API Response:', response.data);
      const {status, results} = response.data;

      if (status === 'OK' && results.length > 0) {
        const {lat, lng} = results[0].geometry.location;
        console.log('Coordinates:', lat, lng);
        return {lat, lng};
      } else {
        console.error(
          'Geocoding API Error:',
          status,
          response.data.error_message,
        );
        return null;
      }
    } catch (error) {
      console.error(
        'Error fetching coordinates:',
        error.response ? error.response.data : error.message,
      );
      return null;
    }
  };
  const getRoute = async (startCoords, endCoords) => {
    if (!startCoords || !endCoords) {
      console.error('Start or end coordinates are missing');
      return null;
    }

    const routeUrl = `https://maps.googleapis.com/maps/api/directions/json?origin=${startCoords.latitude},${startCoords.longitude}&destination=${endCoords.latitude},${endCoords.longitude}&key=AIzaSyABAt-YLOZXJGPN-6X33p_NkH1NiFCGVx8`;

    try {
      const response = await axios.get(routeUrl);
      console.log('Directions API Response:', response.data);
      const {status, routes} = response.data;

      if (status === 'OK' && routes.length > 0) {
        const encodedPolyline = routes[0].overview_polyline.points;
        const decodedPath = decodePolyline(encodedPolyline);
        setRoutePath(decodedPath);
      } else {
        console.error(
          'Directions API Error:',
          status,
          response.data.error_message,
        );
      }
    } catch (error) {
      console.error(
        'Error fetching route:',
        error.response ? error.response.data : error.message,
      );
    }
  };

  const handleTaskSelection = async task => {
    if (!task || !task.value || !userData.userId || !companyId) {
      console.error('Missing parameters for API request');
      return;
    }

    console.log('Selected Task:', task);

    // Set the selected task
    setSelectedTask(task);

    // Close the dropdown
    setClicked(false);

    const address = createAddressString(task);
    console.log('Address String:', address);

    if (address) {
      const coordinates = await getCoordinatesFromAddress(address);

      if (coordinates) {
        setMLat(coordinates.lat);
        setMLong(coordinates.lng);

        if (mLat && mLong) {
          await getRoute({latitude: mLat, longitude: mLong}, coordinates);
        } else {
          console.error('Current location coordinates are not available');
        }
      } else {
        console.error('Failed to get coordinates for the selected task');
      }
    } else {
      console.error('Address is empty or null');
    }
  };

  return (
    <View style={{flex: 1}}>
      <View style={styles.dropdownContainer}>
        <TouchableOpacity
          style={styles.dropdownButton}
          onPress={handleDropdownClick} // This should toggle the dropdown visibility
        >
          <Text style={styles.dropdownText}>
            {selectedTask ? selectedTask.label : 'Select Task'}
          </Text>
          <Image
            source={require('../../../assets/dropdown.png')}
            style={styles.dropdownIcon}
          />
        </TouchableOpacity>
      </View>
      {clicked && (
        <View style={styles.dropdownMenu}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search..."
            placeholderTextColor="#000"
            value={searchQuery}
            onChangeText={text => setSearchQuery(text)}
          />
          {filteredTasks.length === 0 ? (
            <Text style={styles.noResultsText}>Sorry, no results found!</Text>
          ) : (
            <ScrollView>
              {filteredTasks.map((item, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.option}
                  onPress={() => handleTaskSelection(item)}>
                  <Text style={styles.optionText}>{item.label}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}
        </View>
      )}
      <MapView
        style={{width: '100%', height: '100%'}}
        initialRegion={{
          latitude: mLat || 28.634609355596226,
          longitude: mLong || 77.23047288679989,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        }}>
        {mLat && mLong && (
          <Marker
            coordinate={{latitude: mLat, longitude: mLong}}
            title="Current Location"
          />
        )}
        {selectedTask && selectedTask.latitude && selectedTask.longitude && (
          <Marker
            coordinate={{
              latitude: selectedTask.latitude,
              longitude: selectedTask.longitude,
            }}
            title="Task Location"
          />
        )}
        {routePath.length > 0 && (
          <Polyline
            coordinates={routePath.map(coord => ({
              latitude: coord[0],
              longitude: coord[1],
            }))}
            strokeColor="#FF0000"
            strokeWidth={4}
          />
        )}
      </MapView>
    </View>
  );
};

const styles = StyleSheet.create({
  dropdownContainer: {
    padding: 10,
    backgroundColor: '#f8f8f8',
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
    padding: 10,
  },
  optionText:{
    color:"#000"
  }
});

export default CustomerLocation;
