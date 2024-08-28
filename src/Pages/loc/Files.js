import React, {useEffect, useState} from 'react';
import {
  StyleSheet,
  Text,
  View,
  ActivityIndicator,
  ScrollView,
  Image,
  TouchableOpacity,
  Linking,
  Platform,
  PermissionsAndroid,
  Alert,
  Modal,
} from 'react-native';
import axios from 'axios';
import {API} from '../../config/apiConfig';
import {useNavigation} from '@react-navigation/native';
import ReactNativeBlobUtil from 'react-native-blob-util';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useSelector} from 'react-redux';

let pdfPath = null;

const Files = ({route}) => {
  const {id} = route.params;
  const [locationDetails, setLocationDetails] = useState(null);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const navigation = useNavigation();
  const selectedCompany = useSelector(state => state.selectedCompany);
  const [initialSelectedCompany, setInitialSelectedCompany] = useState(null);

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

  useEffect(() => {
    getDetails();
  }, []);

  const getDetails = async () => {
    setLoading(true);
    try {
      const apiUrl = `${global?.userData?.productURL}${API.GET_Location}/${id}/${companyId}`;
      console.log('apiUrl=====>', apiUrl);
      const response = await axios.get(apiUrl, {
        headers: {
          Authorization: `Bearer ${global?.userData?.token?.access_token}`,
        },
      });
      setLocationDetails(response.data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const requestStoragePermission = async () => {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
        {
          title: 'Storage Permission Required',
          message: 'This app needs access to your storage to download PDFs',
          buttonNeutral: 'Ask Me Later',
          buttonNegative: 'Cancel',
          buttonPositive: 'OK',
        },
      );

      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        return true;
      } else {
        Alert.alert(
          'Permission Denied',
          'Storage permission is required to save the PDF. Please grant the permission.',
        );
        return false;
      }
    } catch (err) {
      console.warn('Error requesting storage permission:', err);
      return false;
    }
  };

  const downloadPDF = async (url, fileName) => {
    try {
      if (Platform.OS === 'android') {
        const hasPermission = await requestStoragePermission();
        if (!hasPermission) return;
      }

      const {fs} = ReactNativeBlobUtil;
      const fileExtension = fileName.split('.').pop(); // Get the file extension
      const filePath = `${fs.dirs.DownloadDir}/${fileName}`;

      const res = await ReactNativeBlobUtil.config({
        path: filePath,
        fileCache: true,
        appendExt: fileExtension, // Use the correct file extension
      }).fetch('GET', url);

      console.log(`File downloaded to: ${filePath}`);

      // Open the file with the appropriate application
      if (Platform.OS === 'android' || Platform.OS === 'ios') {
        Linking.openURL(`file://${filePath}`);
      } else {
        Alert.alert(
          'Unsupported Platform',
          'File opening is not supported on this platform.',
        );
      }
    } catch (error) {
      console.error('Error downloading file:', error);
      Alert.alert('Error', `Failed to download file: ${error.message}`);
    }
  };

  const handleGoBack = () => {
    navigation.goBack();
  };

  const openImageModal = imageUrl => {
    setSelectedImage(imageUrl);
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setSelectedImage(null);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007bff" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleGoBack} style={styles.backButton}>
          <Image
            style={styles.backButtonImage}
            source={require('../../../assets/back_arrow.png')}
          />
        </TouchableOpacity>
        <Text style={styles.headerText}>Visited Files</Text>
      </View>
      <ScrollView>
        {locationDetails && (
          <>
            <View style={styles.detailsContainer}>
              <Text style={styles.text}>
                Task Name: {locationDetails.taskName}
              </Text>
              <Text style={styles.text}>
                Description: {locationDetails.desc}
              </Text>
              <Text style={styles.text}>
                Remarks: {locationDetails.remarks}
              </Text>
              <Text style={styles.text}>status: {locationDetails.status}</Text>
            </View>

            {/* Display Selfie Image */}
            {locationDetails.selfieImageName && (
              <TouchableOpacity
                onPress={() => openImageModal(locationDetails.selfieImageName)}>
                <Image
                  source={{uri: locationDetails.selfieImageName}}
                  style={styles.selfieImage}
                />
              </TouchableOpacity>
            )}

            {/* Display Other Images */}
            {locationDetails.imageUrls &&
              locationDetails.imageUrls.length > 0 && (
                <View style={styles.imageContainer}>
                  {locationDetails.imageUrls.map((url, index) => (
                    <TouchableOpacity
                      key={index}
                      onPress={() => openImageModal(url)}>
                      <Image source={{uri: url}} style={styles.image} />
                    </TouchableOpacity>
                  ))}
                </View>
              )}

            {/* Display PDF File Links */}
            {locationDetails.pdfUrls && locationDetails.pdfUrls.length > 0 && (
              <View style={styles.pdfContainer}>
                {locationDetails.pdfUrls.map((url, index) => (
                  <TouchableOpacity
                    key={index}
                    onPress={() =>
                      downloadPDF(url, `PDF_File_${index + 1}.pdf`)
                    }>
                    <Text style={styles.pdfText}>{`PDF File ${
                      index + 1
                    }: ${url}`}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {/* Display Additional PDF File Links */}
            {/* {locationDetails.pdfFileLink1 && (
              <TouchableOpacity
                style={styles.pdfLink}
                onPress={() =>
                  downloadPDF(locationDetails.pdfFileLink1, 'pdfFile1.pdf')
                }>
                <Text style={styles.pdfText}>
                  PDF File Link 1: {locationDetails.pdfFileLink1}
                </Text>
              </TouchableOpacity>
            )}
            {locationDetails.pdfFileLink2 && (
              <TouchableOpacity
                style={styles.pdfLink}
                onPress={() =>
                  downloadPDF(locationDetails.pdfFileLink2, 'pdfFile2.pdf')
                }>
                <Text style={styles.pdfText}>
                  PDF File Link 2: {locationDetails.pdfFileLink2}
                </Text>
              </TouchableOpacity>
            )}
            {locationDetails.pdfFileLink3 && (
              <TouchableOpacity
                style={styles.pdfLink}
                onPress={() =>
                  downloadPDF(locationDetails.pdfFileLink3, 'pdfFile3.pdf')
                }>
                <Text style={styles.pdfText}>
                  PDF File Link 3: {locationDetails.pdfFileLink3}
                </Text>
              </TouchableOpacity>
            )} */}
          </>
        )}

        {/* Image Preview Modal */}
        <Modal
          transparent={true}
          visible={modalVisible}
          onRequestClose={closeModal}
          animationType="fade">
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Image source={{uri: selectedImage}} style={styles.modalImage} />
              <TouchableOpacity onPress={closeModal} style={styles.closeButton}>
                <Text style={styles.closeButtonText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    paddingVertical: 15,
    paddingHorizontal: 10,
    elevation: 2,
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
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  detailsContainer: {
    margin: 15,
  },
  text: {
    fontSize: 16,
    marginVertical: 5,
    color: '#000',
  },
  imageContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    margin: 15,
  },
  image: {
    width: 100,
    height: 100,
    margin: 5,
    borderRadius: 5,
  },
  selfieImage: {
    width: 100,
    height: 100,
    margin: 15,
    borderRadius: 5,
  },
  pdfContainer: {
    margin: 15,
  },
  pdfText: {
    fontSize: 16,
    color: '#007bff',
    marginVertical: 5,
  },
  pdfLink: {
    marginVertical: 5,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  modalImage: {
    width: 300,
    height: 300,
    marginBottom: 15,
  },
  closeButton: {
    padding: 10,
    backgroundColor: '#007bff',
    borderRadius: 5,
  },
  closeButtonText: {
    color: '#fff',
    fontSize: 16,
  },
});

export default Files;
