import {useFocusEffect, useNavigation} from '@react-navigation/native';
import React, {useEffect, useState} from 'react';
import {
  Image,
  PermissionsAndroid,
  ScrollView,
  StyleSheet,
  Switch,
  Linking,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Alert,
} from 'react-native';
import {RadioButton} from 'react-native-radio-buttons-group';
import {API} from '../../config/apiConfig';
import axios from 'axios';
import Geolocation from 'react-native-geolocation-service';
import {useSelector} from 'react-redux';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ImagePicker from 'react-native-image-crop-picker';
import DocumentPicker from 'react-native-document-picker';

const TaskDetails = ({route}) => {
  const {locationName, state, status, dueDateStr, label, id, desc, task} =
    route.params;
  const navigation = useNavigation();
  const [selectedRadioButtonId, setSelectedRadioButtonId] = useState(null);
  const [isSwitchOn, setIsSwitchOn] = useState(false);
  const [description, setDescription] = useState(desc);
  const [shipFromToClickedStatus, setShipFromToClickedStatus] = useState(false);
  const [selectedStatusOption, setSelectedStatusOption] = useState('');
  const userData = useSelector(state => state.loggedInUser);
  const userId = userData?.userId;
  const [mLat, setMLat] = useState(null);
  const [mLong, setMLong] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [filteredTasks, setFilteredTasks] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTask, setSelectedTask] = useState(null);
  const [clicked, setClicked] = useState(false);
  const [loading, setLoading] = useState(true);
  const [initialSelectedCompany, setInitialSelectedCompany] = useState(null);
  const [selectedId, setSelectedId] = useState(null);
  const [selectedImages, setSelectedImages] = useState([]);
  const [imageToUpload, setImageToUpload] = useState(null);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [selfieImages, setSelfieImages] = useState([]); // State for captured images
  const [galleryImages, setGalleryImages] = useState([]); // State for picked images
  const [documents, setDocuments] = useState([]); // State for selected documents
  const [remark, setRemark] = useState('');
  const [loadingg, setLoadingg] = useState(false);

  const selectedCompany = useSelector(state => state.selectedCompany);

  const goToFiles = id => {
    navigation.navigate('Files', {id}); // Pass the id as a parameter
  };

  useFocusEffect(
    React.useCallback(() => {
      const initialize = async () => {
        await requestLocationPermission();
        await getLocation();
        getTasksAccUser();
      };

      initialize();
    }, []),
  );

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

  const handleGoBack = () => {
    navigation.goBack();
  };

  const getTasksAccUser = () => {
    setLoading(true);
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
        // console.log('API Response:', response.data);
        const taskOptions = response.data.map(task => ({
          id: task.id,
          label: task.taskName,
          value: task.id,
          locationName: task.locationName || '', // Default to empty string if not available
          state: task.state || '',
          houseNo: task.houseNo || '',
          street: task.street || '',
          locality: task.locality || '',
          cityOrTown: task.cityOrTown || '',
          country: task.country || '',
          pincode: task.pincode || '',
          status: task.status || '',
          dueDateStr: task.dueDateStr || '',
          desc: task.desc || '',
        }));
        setTasks(taskOptions);
        setFilteredTasks(taskOptions);
      })
      .catch(error => {
        console.error(
          'Error fetching tasks:',
          error.response ? error.response.data : error.message,
        );
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const requestLocationPermission = async () => {
    if (Platform.OS === 'ios') {
      Geolocation.requestAuthorization('whenInUse');
      return;
    }

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

  const getLocation = async (retryCount = 0) => {
    return new Promise((resolve, reject) => {
      Geolocation.getCurrentPosition(
        position => {
          setMLat(position.coords.latitude);
          setMLong(position.coords.longitude);
          console.log(
            'Current location:',
            position.coords.latitude,
            position.coords.longitude,
          );
          resolve();
        },
        error => {
          console.error('Error getting location:', error);
          if (retryCount < 3) {
            // Retry up to 3 times
            setTimeout(
              () =>
                getLocation(retryCount + 1)
                  .then(resolve)
                  .catch(reject),
              1000,
            ); // Wait 1 second before retrying
          } else {
            Alert.alert('Error', 'Current location not available');
            reject(error);
          }
        },
        {enableHighAccuracy: true, timeout: 30000, maximumAge: 1000}, // Increase timeout to 30 seconds
      );
    });
  };

  const createAddressString = task => {
    console.log('Full Task Object:', task);

    const {
      houseNo = '',
      street = '',
      locationName = '',
      locality = '',
      cityOrTown = '',
      state = '',
      country = '',
      pincode = '',
    } = task;

    const addressParts = [
      houseNo,
      street,
      locationName,
      locality,
      cityOrTown,
      state,
      country,
      pincode,
    ];
    const address = addressParts.filter(part => part.trim()).join(', ');

    console.log('Constructed Address:', address);
    return address;
  };

  const geocodeAddress = async address => {
    const apiKey = 'AIzaSyBSKRShklVy5gBNSQzNSTwpXu6l2h8415M';
    const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
      address,
    )}&key=${apiKey}`;

    try {
      const response = await axios.get(url);
      const data = response.data;

      if (data.status === 'OK') {
        const location = data.results[0].geometry.location;
        console.log('Geocoded Location:', location);
        return location;
      } else {
        console.error('Geocoding error:', data.status);
        Alert.alert('Error', 'Unable to geocode address');
        return null;
      }
    } catch (error) {
      console.error('Geocoding request error:', error);
      Alert.alert('Error', 'Unable to geocode address');
      return null;
    }
  };

  const handleTaskSelect = async task => {
    console.log('Selected Task:', task);
    setSelectedTask(task);

    if (!mLat || !mLong) {
      console.error('Current location not available');
      Alert.alert('Error', 'Current location not available');
      return;
    }

    const address = createAddressString(task);
    const location = await geocodeAddress(address);

    if (location) {
      openGoogleMaps(mLat, mLong, location.lat, location.lng);
    }
  };

  const openGoogleMaps = (
    startLat,
    startLong,
    destinationLat,
    destinationLong,
  ) => {
    const url = Platform.select({
      ios: `maps://app?saddr=${startLat},${startLong}&daddr=${destinationLat},${destinationLong}`,
      android: `https://www.google.com/maps/dir/?api=1&origin=${startLat},${startLong}&destination=${destinationLat},${destinationLong}&travelmode=driving`,
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

  const handleRadioButtonPress = radioButtonId => {
    setSelectedRadioButtonId(
      selectedRadioButtonId === radioButtonId ? null : radioButtonId,
    );
  };

  const handleSwitchToggle = () => {
    setIsSwitchOn(!isSwitchOn);
  };

  const statusOptions = [
    'Open',
    'Pending',
    'Assigned',
    'In Progress',
    'Completed',
  ];

  const handleShipDropdownClickStatus = () => {
    setShipFromToClickedStatus(!shipFromToClickedStatus);
  };

  const handleDropdownSelectStatus = option => {
    setSelectedStatusOption(option);
    setShipFromToClickedStatus(false);
  };

  const handleTakeSelfie = () => {
    const MAX_SELFIES = 1;

    if (selfieImages.length >= MAX_SELFIES) {
      Alert.alert(
        'Limit Reached',
        `You can only upload up to ${MAX_SELFIES} selfies.`,
      );
      return;
    }

    ImagePicker.openCamera({
      cropping: true,
      mediaType: 'photo',
      compressImageQuality: 0.8,
    })
      .then(image => {
        const newSelfie = {
          uri: image.path,
          width: image.width,
          height: image.height,
          mime: image.mime,
        };

        if (selfieImages.length + 1 > MAX_SELFIES) {
          Alert.alert(
            'Limit Exceeded',
            `You can only upload up to ${MAX_SELFIES} selfies.`,
          );
          return;
        }

        setSelfieImages(prevImages => [...prevImages, newSelfie]);
      })
      .catch(error => {
        if (error.code === 'E_PICKER_CANCELLED') {
          console.log('User canceled the camera');
        } else {
          console.error('Image capture error:', error);
          Alert.alert('Error', 'Failed to capture image.');
        }
      });
  };

  const removeImage = (index, imageType) => {
    if (imageType === 'selfie') {
      setSelfieImages(selfieImages.filter((_, i) => i !== index));
    } else if (imageType === 'gallery') {
      setGalleryImages(galleryImages.filter((_, i) => i !== index));
    } else if (imageType === 'document') {
      setDocuments(documents.filter((_, i) => i !== index));
    }
  };

  const handleSave = async () => {
    if (loading) return; // Prevent further actions if already loading
    setLoadingg(true); // Set loading state to true

    let formData = new FormData();

    formData.append('id', id || '');
    formData.append('taskName', label || '');
    formData.append('desc', description || '');
    formData.append('userId', userId || '');
    formData.append('comanyId', companyId || '');
    formData.append('remark', remark || '');
    formData.append('status', selectedStatusOption ||status|| '');

    if (selfieImages.length > 0) {
      formData.append('selfieImgs', {
        uri: selfieImages[0].uri,
        type: selfieImages[0].mime || 'image/jpeg', // Default MIME type
        name: `selfie_${Date.now()}.jpg`,
      });
    }

    galleryImages.forEach((image, index) => {
      formData.append('Imgfiles', {
        uri: image.uri,
        type: image.mime || 'image/jpeg', // Default MIME type
        name: `image_${index}_${Date.now()}.jpg`,
      });
    });

    documents.forEach((document, index) => {
      formData.append('PDFfiles', {
        uri: document.uri,
        type: document.type || 'application/pdf', // Default MIME type for PDFs
        name:
          document.name ||
          `document_${index}_${Date.now()}.${document.name.split('.').pop()}`,
      });
    });
    console.log('formData==================>', formData);

    const apiUrl0 = `${global?.userData?.productURL}${API.ADD_LOCATION_IMAGES}`;
    console.log('ADD_LOCATION_IMAGES', apiUrl0);

    axios
      .post(apiUrl0, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${global?.userData?.token?.access_token}`,
        },
      })
      .then(response => {
        console.log('response.data=======>', response.data);
        Alert.alert('Success', 'added successfully.', [
          {text: 'OK', onPress: () => navigation.navigate('CustomerLocation')}, // Navigate to Location screen on OK
        ]);
      })
      .catch(error => {
        console.error(
          'Error:',
          error.response ? error.response.data : error.message,
        );
        Alert.alert('Error', 'Failed to add location.');
      });
  };

  const handleDocumentPicker = async () => {
    const MAX_DOCUMENT = 3;

    if (documents.length >= MAX_DOCUMENT) {
      Alert.alert(
        'Limit Reached',
        `You can only upload up to ${MAX_DOCUMENT} documents.`,
      );
      return;
    }

    try {
      const res = await DocumentPicker.pick({
        type: [
          DocumentPicker.types.pdf,
          DocumentPicker.types.doc,
          DocumentPicker.types.docx,
          DocumentPicker.types.allFiles,
        ],
      });

      // Handle multiple document selections if res is an array
      if (Array.isArray(res)) {
        const newDocuments = [...documents, ...res];

        if (newDocuments.length > MAX_DOCUMENT) {
          Alert.alert(
            'Limit Exceeded',
            `You can only upload up to ${MAX_DOCUMENT} documents.`,
          );
          return;
        }

        setDocuments(newDocuments);
      } else {
        // Handle single document selection
        if (documents.length + 1 > MAX_DOCUMENT) {
          Alert.alert(
            'Limit Exceeded',
            `You can only upload up to ${MAX_DOCUMENT} documents.`,
          );
          return;
        }

        setDocuments(prevDocuments => [...prevDocuments, res]);
      }
    } catch (error) {
      if (DocumentPicker.isCancel(error)) {
        console.log('User canceled the picker');
      } else {
        console.error('Error picking document:', error);
      }
    }
  };

  const handleImagePicker = () => {
    const MAX_IMAGES = 3;

    if (galleryImages.length >= MAX_IMAGES) {
      Alert.alert(
        'Limit Reached',
        `You can only upload up to ${MAX_IMAGES} images.`,
      );
      return;
    }
    ImagePicker.openPicker({
      multiple: true,
      mediaType: 'photo',
    })
      .then(images => {
        const newImages = images.map(image => ({
          uri: image.path,
          width: image.width,
          height: image.height,
          mime: image.mime,
        }));

        // Check if adding these images would exceed the limit
        if (galleryImages.length + newImages.length > MAX_IMAGES) {
          Alert.alert(
            'Limit Exceeded',
            `You can only upload up to ${MAX_IMAGES} images in total.`,
          );
        } else {
          setGalleryImages(prevImages => [...prevImages, ...newImages]);
        }
      })
      .catch(error => {
        console.error('Error picking images:', error);
      });
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleGoBack} style={styles.backButton}>
          <Image
            style={styles.backButtonImage}
            source={require('../../../assets/back_arrow.png')}
          />
        </TouchableOpacity>
        <Text style={styles.headerText}>Location</Text>
      </View>
      <ScrollView>
        <View style={styles.navTabs}>
          <Text style={styles.txt}>Visits</Text>
          <TouchableOpacity onPress={() => goToFiles(id)}>
            <Text style={styles.txt}>Visited Files</Text>
          </TouchableOpacity>
        </View>
        {/* <View style={styles.sectionHeader}>
          <Text style={styles.sectionHeaderText}>Visits</Text>
        </View> */}
        <View style={styles.dateContainer}>
          <Text style={styles.dateText}>{dueDateStr}</Text>
        </View>
        <View style={styles.taskContainer}>
          <TouchableOpacity onPress={() => handleRadioButtonPress(id)}>
            <RadioButton
              selected={selectedRadioButtonId === id}
              onPress={() => handleRadioButtonPress(id)}
            />
          </TouchableOpacity>
          <View style={styles.taskDetails}>
            <Text style={styles.dropdownItemText}>{label}</Text>
            <Text style={styles.loctxt}>{locationName}</Text>
            <Text style={styles.statetxt}>{state}</Text>
          </View>
          <TouchableOpacity onPress={() => handleTaskSelect(task)}>
            <Image
              style={styles.locationImg}
              source={require('../../../assets/location-pin.png')}
            />
          </TouchableOpacity>
        </View>
        <View style={styles.taskDescription}>
          <Text style={styles.boldText}>Task Description</Text>
          <Text style={styles.boldText}>Due Date: {dueDateStr}</Text>
        </View>
        <View style={styles.textInputContainer}>
          <TextInput
            style={styles.textInput}
            placeholder="Task Description"
            placeholderTextColor="#000"
            value={description}
            onChangeText={text => setDescription(text)}
          />
        </View>
        <View>
          <Text style={styles.remarksText}>Remarks</Text>
        </View>
        <View style={styles.textInputContainerremarks}>
          <TextInput
            style={styles.textInput}
            placeholder="Remarks"
            placeholderTextColor="#000"
            value={remark}
            onChangeText={text => setRemark(text)}
          />
        </View>
        <View style={styles.switchContainer}>
          <TouchableOpacity
            onPress={handleShipDropdownClickStatus}
            style={styles.dropdownButton}>
            <Text style={styles.dropdownText}>
              {selectedStatusOption || status || 'Status'}
            </Text>
            <Image
              source={require('../../../assets/dropdown.png')}
              style={styles.dropdownImage}
            />
          </TouchableOpacity>

          {shipFromToClickedStatus && (
            <View style={styles.dropdownContainer}>
              <ScrollView style={styles.scrollView} nestedScrollEnabled={true}>
                {statusOptions.map((option, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.dropdownOption,
                      selectedStatusOption === option && styles.selectedOption,
                    ]}
                    onPress={() => handleDropdownSelectStatus(option)}>
                    <Text style={styles.dropdownOptionText}>{option}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}
          {/* <Switch
          trackColor={{false: '#767577', true: '#81b0ff'}}
          ios_backgroundColor="#3e3e3e"
          value={isSwitchOn}
          onValueChange={handleSwitchToggle}
        /> */}
        </View>
        <View style={styles.imgheader}>
          <TouchableOpacity style={styles.uploadimg} onPress={handleTakeSelfie}>
            <Image
              style={{height: 80, width: 80}}
              source={require('../../../assets/uploadsel.png')}
            />
            <Text
              style={{
                textAlign: 'center',
                marginVertical: 20,
                fontWeight: 'bold',
                color: '#000',
              }}>
              Upload Selfie
            </Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={handleImagePicker}>
            <Image
              style={styles.uploadanyimg}
              source={require('../../../assets/uploadany.png')}
            />
            <Text
              style={{
                textAlign: 'center',
                marginVertical: 20,
                fontWeight: 'bold',
                color: '#000',
              }}>
              Upload Images
            </Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={handleDocumentPicker}>
            <Image
              style={styles.uploadanyimg}
              source={require('../../../assets/file.png')}
            />
            <Text
              style={{
                textAlign: 'center',
                marginVertical: 20,
                fontWeight: 'bold',
                color: '#000',
              }}>
              Upload Files
            </Text>
          </TouchableOpacity>
        </View>
        {selfieImages.length > 0 && (
          <ScrollView horizontal style={styles.imagePreviewContainer}>
            {selfieImages.map((image, index) => (
              <View key={index} style={styles.imageContainer}>
                <Image source={{uri: image.uri}} style={styles.imagePreview} />
                <TouchableOpacity
                  style={styles.removeButton}
                  onPress={() => removeImage(index, 'selfie')}>
                  <Text style={styles.removeButtonText}>x</Text>
                </TouchableOpacity>
              </View>
            ))}
          </ScrollView>
        )}
        {galleryImages.length > 0 && (
          <ScrollView horizontal style={styles.imagePreviewContainer}>
            {galleryImages.map((image, index) => (
              <View key={index} style={styles.imageContainer}>
                <Image source={{uri: image.uri}} style={styles.imagePreview} />
                <TouchableOpacity
                  style={styles.removeButton}
                  onPress={() => removeImage(index, 'gallery')}>
                  <Text style={styles.removeButtonText}>x</Text>
                </TouchableOpacity>
              </View>
            ))}
          </ScrollView>
        )}
        <View style={styles.uploadSection}>
          {documents.length > 0 && (
            <View>
              {documents.map((doc, index) => (
                <View key={index} style={styles.documentItem}>
                  <Text
                    style={{
                      color: '#000',
                      fontSize: 20,
                      fontWeight: 'bold',
                      marginHorizontal: 10,
                    }}>
                    {doc.name}
                  </Text>
                  <TouchableOpacity
                    style={styles.removeButton1}
                    onPress={() => removeImage(index, 'document')}>
                    <Text>x</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}
        </View>
        <TouchableOpacity
          onPress={handleSave}
          style={{
            borderWidth: 1,
            marginTop: 15,
            marginBottom: 50,
            marginHorizontal: 20,
            borderRadius: 10,
            paddingVertical: 10,
            backgroundColor: '#F09120',
            opacity: loadingg ? 0.6 : 1, // Adjust opacity based on loading state
          }}
          disabled={loadingg} // Disable button when loading
        >
          <Text style={{color: '#000', alignSelf: 'center'}}>Update</Text>
        </TouchableOpacity>
        {/* <View style={styles.uploadedFilesContainer}>
        {selectedFiles.length > 0 &&
          selectedFiles.map((file, index) => (
            <View key={index} style={styles.filePreview}>
              <Text>{file.name}</Text>
            </View>
          ))}
      </View> */}
      </ScrollView>
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
    marginHorizontal: 10,
    marginVertical: 10,
  },
  backButton: {
    height: 25,
    width: 25,
  },
  backButtonImage: {
    height: 25,
    width: 25,
  },
  headerText: {
    marginLeft: 10,
    fontSize: 19,
    fontWeight: 'bold',
    color: '#000',
  },
  navTabs: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    backgroundColor: '#f0f0f0',
    marginVertical: 5,
  },
  txt: {
    color: '#000',
    fontWeight: 'bold',
    fontSize: 18,
    marginHorizontal: 10,
  },
  sectionHeader: {
    paddingVertical: 10,
    backgroundColor: '#1F74BA',
    marginVertical: 5,
  },
  sectionHeaderText: {
    color: '#000',
    fontWeight: 'bold',
    marginLeft: 10,
    fontSize: 17,
  },
  dateContainer: {
    marginHorizontal: 10,
    marginVertical: 5,
  },
  dateText: {
    color: '#000',
    fontWeight: 'bold',
  },
  taskContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    marginHorizontal: 5,
    paddingVertical: 20,
    marginVertical: 3,
    borderRadius: 10,
  },
  taskDetails: {
    flexDirection: 'column',
    marginLeft: 10,
    flex: 1,
  },
  dropdownItemText: {
    color: '#000',
    fontWeight: 'bold',
  },
  loctxt: {
    color: '#000',
    fontWeight: 'bold',
  },
  statetxt: {
    color: '#000',
    fontWeight: 'bold',
  },
  locationImg: {
    width: 30,
    height: 30,
    marginRight: 40,
  },
  taskDescription: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: 10,
    marginVertical: 10,
  },
  boldText: {
    color: '#000',
    fontWeight: 'bold',
  },
  textInputContainer: {
    borderWidth: 1,
    marginHorizontal: 5,
    borderRadius: 10,
    paddingVertical: 10,
  },
  textInputContainerremarks: {
    borderWidth: 1,
    marginHorizontal: 5,
    borderRadius: 10,
    paddingVertical: 14,
  },
  remarksText: {
    color: '#000',
    fontWeight: 'bold',
    marginHorizontal: 10,
    marginVertical: 10,
  },
  switchContainer: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginHorizontal: 10,
    marginVertical: 10,
  },
  dropdownButton: {
    height: 35,
    borderRadius: 10,
    borderWidth: 0.5,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingLeft: 15,
    paddingRight: 15,
    marginHorizontal: 10,
    marginVertical: 1,
    position: 'relative', // Important for dropdown positioning
  },
  dropdownText: {
    color: '#000',
  },
  dropdownImage: {
    width: 20,
    height: 20,
    marginRight: 10,
    marginLeft: 20,
  },
  dropdownContainer: {
    position: 'absolute',
    top: 45, // Adjust this value based on the height of your dropdown button
    right: 0,
    marginRight: 8,
    width: '51%',
    backgroundColor: 'white',
    borderWidth: 0.5,
    borderRadius: 10,
    zIndex: 10, // Ensure the dropdown appears above other elements
  },
  scrollView: {
    minHeight: 70,
    maxHeight: 150,
  },
  dropdownOption: {
    paddingHorizontal: 10,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  selectedOption: {
    backgroundColor: '#f0f0f0',
  },
  dropdownOptionText: {
    color: '#000',
  },
  imgheader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: 30,
    marginTop: 20,
  },
  uploadselimg: {
    height: 60,
    width: 60,
  },

  uploadTextContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: 20,
  },
  uploadText: {
    color: '#000',
    fontWeight: 'bold',
  },
  textInput: {
    color: '#000',
  },
  uploadimg: {
    alignItems: 'center',
  },
  imagePreviewContainer: {
    flexDirection: 'row',
    marginVertical: 5,
  },
  imagePreview: {
    width: 70,
    height: 70,
    marginHorizontal: 5,
    borderRadius: 10,
    backgroundColor: '#f0f0f0',
  },
  uploadButton: {
    backgroundColor: '#1F74BA',
    paddingHorizontal: 20,
    borderRadius: 10,
  },
  uploadButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  removeButton: {
    position: 'absolute',
    top: 0, // Position the button at the top edge of the image
    right: 0, // Align the button to the right edge
    backgroundColor: 'gray',
    borderRadius: 15,
    width: 25,
    height: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeButton1: {
    position: 'absolute',
    top: 0, // Position the button at the top edge of the image
    right: 5, // Align the button to the right edge
    backgroundColor: 'gray',
    borderRadius: 15,
    width: 25,
    height: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  uploadSection: {
    marginTop: 16,
    marginBottom: 20,
    marginHorizontal: 10,
  },
  uploadButton: {
    backgroundColor: '#007bff',
    padding: 12,
    borderRadius: 4,
    color: '#fff',
    textAlign: 'center',
  },
  uploadButtonText: {
    color: '#fff',
    textAlign: 'center',
  },
  uploadimg: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  uploadanyimg: {
    width: 70,
    height: 70,
    marginLeft:10
  },
  documentItem: {
    justifyContent: 'center',
  },
});

export default TaskDetails;
