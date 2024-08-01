import React, { useEffect, useState } from 'react';
import { Text, TouchableOpacity, View, PermissionsAndroid, StyleSheet, TextInput, ScrollView, Image, Alert } from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';
import Geolocation from 'react-native-geolocation-service';
import axios from 'axios';
import { useSelector } from 'react-redux';
import AsyncStorage from '@react-native-async-storage/async-storage';

const decodePolyline = encoded => {
  const points = [];
  let index = 0, lat = 0, lng = 0;
  while (index < encoded.length) {
    let b, shift = 0, result = 0;
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
  const [routePath, setRoutePath] = useState([]);
  const selectedCompany = useSelector(state => state.selectedCompany);

  const customerLocation = {
    latitude:  11.400407297515569,
    longitude: 76.68483706930725
  };
  useEffect(() => {
    requestLocationPermission();
    getLocation();
    getTasksAccUser();
  }, []);

  useEffect(() => {
    if (searchQuery) {
      const filtered = tasks.filter(task =>
        task.label.toLowerCase().includes(searchQuery.toLowerCase())
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
        }
      );
      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        console.log('Location permission granted');
      } else {
        console.log('Location permission denied');
        Alert.alert('Location permission denied');
      }
    } catch (err) {
      console.warn(err);
      Alert.alert('Error requesting location permission', err.message);
    }
  };

  const getLocation = () => {
    Geolocation.getCurrentPosition(
      position => {
        setMLat(position.coords.latitude);
        setMLong(position.coords.longitude);
        console.log('Current location:', position.coords.latitude, position.coords.longitude);
      },
      error => {
        console.error('Error getting location:', error);
        Alert.alert('Error getting location', error.message);
      },
      { enableHighAccuracy: true, timeout: 20000, maximumAge: 1000 }
    );
  };

  const getTasksAccUser = () => {
    const apiUrl = `https://crm.codeverse.co/erpportal/api/master/getTasksAccUser/${userData.userId}/${selectedCompany?.id}`;
    axios
      .get(apiUrl, {
        headers: {
          Authorization: `Bearer ${global?.userData?.token?.access_token}`,
        }
      })
      .then(response => {
        const taskOptions = response.data.map(task => ({
          label: task.taskName,
          value: task.id,
          latitude: task.latitude || null,
          longitude: task.longitude || null,
        }));
        setTasks(taskOptions);
        setFilteredTasks(taskOptions);
      })
      .catch(error => {
        console.error('Error fetching tasks:', error);
        Alert.alert('Error fetching tasks', error.message);
      });
  };

  const getRoute = async (startCoords, endCoords) => {
    if (!startCoords || !endCoords) {
      console.error('Start or end coordinates are missing');
      return;
    }

    const routeUrl = `https://maps.googleapis.com/maps/api/directions/json?origin=${startCoords.latitude},${startCoords.longitude}&destination=${endCoords.latitude},${endCoords.longitude}&key=AIzaSyABAt-YLOZXJGPN-6X33p_NkH1NiFCGVx8`;

    try {
      const response = await axios.get(routeUrl);
      const { status, routes } = response.data;

      if (status === 'OK' && routes.length > 0) {
        const encodedPolyline = routes[0].overview_polyline.points;
        const decodedPath = decodePolyline(encodedPolyline);
        setRoutePath(decodedPath);
      } else {
        console.error('Directions API Error:', status, response.data.error_message);
        Alert.alert('Directions API Error', response.data.error_message);
      }
    } catch (error) {
      console.error('Error fetching route:', error);
      Alert.alert('Error fetching route', error.message);
    }
  };

  const handleTaskSelection = async task => {
    if (!task) return;

    setSelectedTask(task);
    setClicked(false);

    const taskCoords = {
      latitude: task.latitude,
      longitude: task.longitude,
    };

    if (mLat && mLong) {
      await getRoute({ latitude: mLat, longitude: mLong }, taskCoords);
    } else {
      console.error('Current location coordinates are not available');
      Alert.alert('Current location coordinates are not available');
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <View style={styles.dropdownContainer}>
        <TouchableOpacity
          style={styles.dropdownButton}
          onPress={() => setClicked(!clicked)}
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
                  onPress={() => handleTaskSelection(item)}
                >
                  <Text style={styles.optionText}>{item.label}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}
        </View>
      )}
      <MapView
        style={{ width: '100%', height: '100%' }}
        initialRegion={{
          latitude: mLat || 11.40680165484803,
          longitude: mLong ||  76.70114490043404,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        }}
      >
        {mLat && mLong && (
          <Marker
            coordinate={{ latitude: mLat, longitude: mLong }}
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
        {customerLocation && mLat && mLong && (
          <Polyline
            coordinates={[
              { latitude: customerLocation.latitude, longitude: customerLocation.longitude },
              { latitude: mLat, longitude: mLong },
            ]}
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
    width: '100%',
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  dropdownButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 10,
    backgroundColor: '#fff',
    borderRadius: 5,
    elevation: 2,
  },
  dropdownText: {
    fontSize: 16,
    color: '#000',
  },
  dropdownIcon: {
    width: 20,
    height: 20,
  },
  dropdownMenu: {
    width: '100%',
    paddingHorizontal: 10,
    paddingVertical: 5,
    backgroundColor: '#fff',
    borderRadius: 5,
    elevation: 2,
  },
  searchInput: {
    width: '100%',
    padding: 10,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    marginBottom: 10,
  },
  noResultsText: {
    textAlign: 'center',
    color: '#000',
  },
  option: {
    padding: 10,
  },
  optionText: {
    fontSize: 16,
    color: '#000',
  },
});

export default CustomerLocation;
