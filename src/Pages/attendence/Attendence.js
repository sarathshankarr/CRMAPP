import React, {useState, useEffect} from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Platform,
  PermissionsAndroid,
  Alert,
  Modal,
  Pressable,
} from 'react-native';
import Geolocation from 'react-native-geolocation-service';
import {useSelector} from 'react-redux';
import {API} from '../../config/apiConfig';
import axios from 'axios';

const Attendance = () => {
  const userData = useSelector(state => state.loggedInUser);
  const userId = userData?.userId;

  const [isSignedIn, setIsSignedIn] = useState(false);
  const [signInTime, setSignInTime] = useState('');
  const [signInDay, setSignInDay] = useState('');
  const [signInDate, setSignInDate] = useState('');
  const [signInLocation, setSignInLocation] = useState({lat: null, long: null});

  const [signOutTime, setSignOutTime] = useState('');
  const [signOutDay, setSignOutDay] = useState('');
  const [signOutDate, setSignOutDate] = useState('');
  const [signOutLocation, setSignOutLocation] = useState({
    lat: null,
    long: null,
  });

  const [modalVisible, setModalVisible] = useState(false);
  const [latestRecord, setLatestRecord] = useState({});

  useEffect(() => {
    requestLocationPermission();
    getPunchInPunchOut();
  }, []);

  // Function to request location permission
  const requestLocationPermission = async () => {
    if (Platform.OS === 'ios') {
      Geolocation.requestAuthorization('whenInUse');
    } else {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          {
            title: 'Location Permission',
            message: 'We need access to your location to display it.',
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
    }
  };

  // Function to get the current location
  const getLocation = async () => {
    return new Promise((resolve, reject) => {
      Geolocation.getCurrentPosition(
        position => {
          const {latitude, longitude} = position.coords;
          resolve({lat: latitude, long: longitude});
        },
        error => {
          console.error('Error getting location:', error);
          Alert.alert('Error', 'Could not get current location.');
          reject(error);
        },
        {enableHighAccuracy: true, timeout: 20000, maximumAge: 1000},
      );
    });
  };

  const getCurrentDate = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = (now.getMonth() + 1).toString().padStart(2, '0'); // Months are zero-based
    const day = now.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`; // Format YYYY-MM-DD
  };

  const extractTime = dateTimeString => {
    return new Date(dateTimeString).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };
  const extractDate = dateTimeString => {
    return new Date(dateTimeString).toLocaleDateString([], {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  };
  const formatDateTime = date => {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const seconds = date.getSeconds().toString().padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`; // Format YYYY-MM-DDTHH:MM:SS
  };

  const handleSignToggle = async () => {
    const now = new Date();
    const currentDateTime = formatDateTime(now);
    const day = now.toLocaleDateString('en-US', {weekday: 'long'});
    const location = await getLocation();

    if (!isSignedIn) {
      setSignInTime(extractTime(currentDateTime)); // Display only time
      setSignInDay(day);
      setSignInDate(currentDateTime.split('T')[0]);
      setSignInLocation(location);
    } else {
      setSignOutTime(extractTime(currentDateTime)); // Display only time
      setSignOutDay(day);
      setSignOutDate(currentDateTime.split('T')[0]);
      setSignOutLocation(location);
    }

    PunchInPunchOut();
    setIsSignedIn(prevState => !prevState);
  };

  const PunchInPunchOut = async () => {
    const now = new Date();
    const formattedDateTime = formatDateTime(now);
    const formattedDate = formattedDateTime.split('T')[0];
    const location = isSignedIn ? signInLocation : signOutLocation;

    const apiUrl = `${global?.userData?.productURL}${API.PUNCH_IN_PUNCH_OUT}`;

    const payload = isSignedIn
      ? {
          employeeId: userId,
          punchOut: formattedDateTime,
          punch_out_latitude: location.lat,
          punch_out_longitude: location.long,
          date: formattedDate,
        }
      : {
          employeeId: userId,
          punchIn: formattedDateTime,
          punch_in_latitude: location.lat,
          punch_in_longitude: location.long,
          date: formattedDate,
        };

    console.log('payload========>', payload);

    try {
      const response = await axios.put(apiUrl, payload, {
        headers: {
          Authorization: `Bearer ${global?.userData?.token?.access_token}`,
          'Content-Type': 'application/json',
        },
      });

      console.log('Response:', response.data);
    } catch (error) {
      console.error('Error:', error);
      Alert.alert('Error', 'Failed to punch in/out. Please try again.');
    }
  };
  const getPunchInPunchOut = async () => {
    const formattedDate = getCurrentDate();
    const apiUrl = `${global?.userData?.productURL}${API.GET_PUNCH_IN_PUNCH_OUT}/${userId}/${formattedDate}`;

    try {
      const response = await axios.get(apiUrl, {
        headers: {
          Authorization: `Bearer ${global?.userData?.token?.access_token}`,
        },
      });

      console.log('response.data', response.data);

      const latestRecord = response.data[0];
      setLatestRecord(latestRecord);

      setIsSignedIn(latestRecord?.loggedStts === 0);
      setSignInTime(
        latestRecord.punchIn ? extractTime(latestRecord.punchIn) : '',
      );
      setSignInDay(
        new Date(latestRecord?.punchIn).toLocaleDateString('en-US', {
          weekday: 'long',
        }) || '',
      );
      setSignInDate(
        new Date(latestRecord.punchIn).toISOString().split('T')[0] || '',
      );
      setSignInLocation({
        lat: latestRecord.punch_in_latitude,
        long: latestRecord.punch_in_longitude,
      });
      setSignOutTime(
        latestRecord.punchOut ? extractTime(latestRecord.punchOut) : '',
      );
      setSignOutDay(
        new Date(latestRecord.punchOut).toLocaleDateString('en-US', {
          weekday: 'long',
        }) || '',
      );
      setSignOutDate(
        new Date(latestRecord.punchOut).toISOString().split('T')[0] || '',
      );
      setSignOutLocation({
        lat: latestRecord.punch_out_latitude,
        long: latestRecord.punch_out_longitude,
      });
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const openModal = () => {
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}></View>

      <View style={styles.greetingContainer}>
        <Text style={styles.greetingText}>Hello 👋</Text>
      </View>

      <View style={styles.shiftCard}>
        <View style={styles.rowContainer}>
          <View style={styles.shiftTime}>
            <Text style={styles.timeText}>
              {isSignedIn ? signInTime : signOutTime}
            </Text>
          </View>
          <View style={styles.shiftDetails}>
            <Text style={styles.shiftText}>
              {isSignedIn ? signInDay : signOutDay}
            </Text>
            <Text style={styles.dateText}>
              {isSignedIn ? signInDate : signOutDate}
            </Text>
            {/* {isSignedIn
              ? signInLocation.lat &&
                signInLocation.long && (
                  <Text style={styles.locationText}>
                    Location: {signInLocation.lat}, {signInLocation.long}
                  </Text>
                )
              : signOutLocation.lat &&
                signOutLocation.long && (
                  <Text style={styles.locationText}>
                    Location: {signOutLocation.lat}, {signOutLocation.long}
                  </Text>
                )} */}
          </View>
        </View>

        <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
          <TouchableOpacity style={styles.SwipesButton} onPress={openModal}>
            <Text style={{color: '#fff', fontSize: 15}}>View Swipes</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.signOutButton}
            onPress={handleSignToggle}>
            <Text style={{color: '#fff', fontSize: 15}}>
              {isSignedIn ? 'Punch Out' : 'Punch In'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={closeModal}
      >
        <View style={styles.modalBackground}>
          <View style={styles.modalContainer}>
            <View>
            <Text style={styles.modalTitle}>Swipes</Text>

            </View>
            <View style={{flexDirection:"row",justifyContent:"space-between"}}>
            <Text style={styles.modalTitle}>Shift Time : 09:30 to 18.30</Text>
            <Text style={styles.modalTitle}>Shift Type : Gs</Text>

            </View>
            <Text style={styles.modalContent}>Punch In Time: {latestRecord?.punchIn ? extractTime(latestRecord.punchIn) : 'N/A'}</Text>
            <Text style={styles.modalContent}>Punch Out Time: {latestRecord?.punchOut ? extractTime(latestRecord.punchOut) : 'N/A'}</Text>
            <Text style={styles.modalContent}>Punch In Date: {latestRecord?.punchIn ? extractDate(latestRecord.punchIn) : 'N/A'}</Text>
            <Text style={styles.modalContent}>Punch Out Date: {latestRecord?.punchOut ? extractDate(latestRecord.punchOut) : 'N/A'}</Text>
            <Pressable style={styles.closeButton} onPress={closeModal}>
              <Text style={styles.closeButtonText}>Close</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  greetingContainer: {
    marginTop: 20,
  },
  greetingText: {
    fontSize: 24,
    fontWeight: 'bold',
    color:"#000"
  },
  shiftCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    marginVertical: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2,
    borderWidth: 1,
  },
  rowContainer: {
    flexDirection: 'row', // Display items in a row
    justifyContent: 'space-between', // Add space between time and details
    alignItems: 'center',
    marginBottom: 10, // Add space between row and button
  },
  shiftTime: {
    flex: 1.4,
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 75,
    paddingVertical: 55,
    paddingHorizontal: 5,
  },
  shiftDetails: {
    flex: 1.8,
    alignItems: 'flex-end',
    marginRight: 12,
  },
  signOutButton: {
    backgroundColor: '#3578e5',
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 8,
    alignSelf: 'flex-end', // Center the button
  },
  shiftText: {
    color: '#000',
    fontWeight: 'bold',
    alignItems: 'flex-end',
  },
  SwipesButton: {
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 8,
    marginLeft: 15,
    alignSelf: 'flex-end', // Center the button
    backgroundColor: '#3578e5',
  },
  signOutText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  timeText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFA500',
  },
  dateText: {
    fontSize: 14,
    color: '#000',
    fontWeight: 'bold',
  },
  locationText: {
    fontSize: 14,
    color: '#000',
    marginTop: 5,
  },
  modalBackground: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContainer: {
    width: '98%',
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    elevation: 10,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color:'#000'
  },
  modalContent: {
    fontSize: 16,
    marginVertical: 5,
    color:"#000"
  },
  closeButton: {
    backgroundColor: '#dc3545',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 20,
  },
  closeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default Attendance;
