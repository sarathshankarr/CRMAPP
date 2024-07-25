import React, {useEffect, useState} from 'react';
import {
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Modal,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ImagePicker from 'react-native-image-crop-picker';
import {API} from './config/apiConfig';
import axios from 'axios';

const Sidebar = ({navigation, route}) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [image, setImage] = useState(require('../assets/profile.png'));
  const [userData, setUserData] = useState(null);
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [dropdownVisiblee, setDropdownVisiblee] = useState(false); // Add state for second dropdown if needed
  const [dropdownVisiblePublish, setDropdownVisiblePublish] = useState(false); // Add state for second dropdown if needed
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);

  useEffect(() => {
    const {params} = route ?? {};
    if (params && params.userData) {
      setUserData(params.userData);
    } else {
      // If userData is not passed as prop, retrieve from AsyncStorage
      getUserDataFromStorage();
    }
  }, [route]);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      getUserDataFromStorage();
    });
    return unsubscribe;
  }, [navigation]);

  const getUserDataFromStorage = async () => {
    const userToken = await AsyncStorage.getItem('userdata');
    if (userToken) {
      setUserData(JSON.parse(userToken));
    }
  };

  const getUserInActive = () => {
    if (!userData) return;

    const apiUrl = `${userData.productURL}${API.GET_USER_IN_ACTIVE}/${userData.token.userId}`;
    axios
      .get(apiUrl, {
        headers: {
          Authorization: `Bearer ${userData.token.access_token}`,
        },
      })
      .then(response => {
        console.log('Get Inactive User Response:', response.data);
        if (response.data === true) {
          // Navigate to login screen
          navigation.reset({
            index: 0,
            routes: [{name: 'Login'}],
          });
        } else {
          console.error('Account not inactive. Could not delete.');
        }
      })
      .catch(error => {
        console.error('Error:', error);
      });
  };

  const toggleDropdown = () => {
    setDropdownVisible(!dropdownVisible);
  };

  const toggleDropdownSecond = () => {
    setDropdownVisiblee(!dropdownVisiblee);
  };

  const toggleDropdownthird = () => {
    setDropdownVisiblePublish(!dropdownVisiblePublish);
  };

  const goToHome = () => {
    navigation.navigate('Home');
  };

  const goToCategories = () => {
    navigation.navigate('Categories');
  };

  const goToOrder = () => {
    navigation.navigate('Order');
  };

  const goToProductInventory = () => {
    navigation.navigate('ProductInventory');
  };

  const goToLocationInventory = () => {
    navigation.navigate('LocationInventory');
  };

  const goToDistributorGrn = () => {
    navigation.navigate('Distributor GRN');
  };

  const goToEditProfile = () => {
    navigation.navigate('Profile');
  };

  const goToActivities = () => {
    navigation.navigate('Activities');
  };
  const goToPublish = () => {
    navigation.navigate('ProductPackagePublish');
  };
  const goToCustomerLocation = () => {
    navigation.navigate('CustomerLocation');
  };

  const takePhotoFromCamera = () => {
    ImagePicker.openCamera({
      width: 300,
      height: 400,
      cropping: true,
      compressImageQuality: 0.7,
    })
      .then(image => {
        console.log('Camera Image Path:', image.path);
        setImage({ uri: image.path });
        setModalVisible(false);
      })
      .catch(error => {
        console.log('Error taking photo from camera:', error);
        setModalVisible(false);
      });
  };
  
  const choosePhotoFromLibrary = () => {
    ImagePicker.openPicker({
      width: 300,
      height: 300,
      cropping: true,
      compressImageQuality: 0.7,
    })
      .then(image => {
        console.log('Library Image Path:', image.path);
        setImage({ uri: image.path });
        setModalVisible(false);
      })
      .catch(error => {
        console.log('Error choosing photo from library:', error);
        setModalVisible(false);
      });
  };
  

  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem('userdata'); // Remove the user data from AsyncStorage
      await AsyncStorage.removeItem('userRole'); // Remove the user role from AsyncStorage
      await AsyncStorage.removeItem('userRoleId'); // Remove the user role ID from AsyncStorage
      await AsyncStorage.removeItem('loggedInUser'); // Remove the logged-in user data from AsyncStorage
      await AsyncStorage.removeItem('selectedCompany'); // Remove the logged-in user data from AsyncStorage
      navigation.closeDrawer(); // Close the drawer
      navigation.reset({
        index: 0,
        routes: [{name: 'Login'}],
      });
    } catch (error) {
      console.error('Error clearing user data:', error);
    }
  };

  return (
    <View style={styles.container}>
      <View style={{backgroundColor: '#1F74BA'}}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => setModalVisible(true)}>
            <Image
              style={[styles.img, {borderRadius: 30,}]}
              source={image}
            />
          </TouchableOpacity>
          <Text style={{color: '#fff', fontSize: 20}}>Profile</Text>
        </View>
        <View>
          {userData && (
            <Text style={styles.usertxt}>
              Name : {userData.token.firstName} {userData.token.lastName}
            </Text>
          )}
        </View>
      </View>

      <TouchableOpacity onPress={goToHome} style={styles.homeheader}>
        <Image style={styles.homeimg} source={require('../assets/store.png')} />
        <Text style={styles.hometxt}>Home</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={goToCategories} style={styles.categorieshead}>
        <Image
          style={styles.categoriesimg}
          source={require('../assets/menu-1.png')}
        />
        <Text style={styles.categoriestxt}>Categories</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={goToOrder} style={styles.orderhead}>
        <Image
          style={styles.orderimg}
          source={require('../assets/orderr.png')}
        />
        <Text style={styles.ordertxt}>Order</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.inventoryhead} onPress={toggleDropdown}>
        <Image
          style={styles.orderimg}
          source={require('../assets/inventory.png')}
        />
        <Text style={styles.ordertxt}>Inventory</Text>
        <View style={{marginLeft: 'auto'}}>
          <Image
            source={require('../assets/dropdown.png')}
            style={{width: 20, height: 20}}
          />
        </View>
      </TouchableOpacity>

      {dropdownVisible && (
        <View style={styles.dropdown}>
          <TouchableOpacity
            style={styles.inventoryhead}
            onPress={() => goToProductInventory('Product Inventory')}>
            <Image
              style={styles.prodimg}
              source={require('../assets/product-management.png')}
            />
            <Text style={styles.dropdownItem}>Product Inventory</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.inventoryhead}
            onPress={() => goToLocationInventory('Location Wise Inventory')}>
            <Image
              style={styles.prodimg}
              source={require('../assets/locationinv.png')}
            />
            <Text style={styles.dropdownItemm}>Location Wise Inventory</Text>
          </TouchableOpacity>
          {/* Add more dropdown items here */}
        </View>
      )}
      <TouchableOpacity
        onPress={goToDistributorGrn}
        style={styles.distributorhead}>
        <Image
          style={styles.distributorimg}
          source={require('../assets/distributor.png')}
        />
        <Text style={styles.ordertxt}>Distributor GRN</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.inventoryhead}
        onPress={toggleDropdownSecond}>
        <Image
          style={styles.orderimg}
          source={require('../assets/activity.png')}
        />
        <Text style={styles.ordertxt}>Campaign Management</Text>
        <View style={{marginLeft: 'auto'}}>
          <Image
            source={require('../assets/dropdown.png')}
            style={{width: 20, height: 20}}
          />
        </View>
      </TouchableOpacity>
      {dropdownVisiblee && (
        <View style={styles.dropdown}>
          <TouchableOpacity
            style={styles.inventoryhead}
            onPress={goToActivities}>
            <Image
              style={styles.prodimg}
              source={require('../assets/acticityone.png')}
            />
            <Text style={styles.dropdownItem}>Activities</Text>
          </TouchableOpacity>
          {/* Add more dropdown items here */}
        </View>
      )}
       <TouchableOpacity
        style={styles.inventoryhead}
        onPress={toggleDropdownthird}>
        <Image
          style={styles.orderimg}
          source={require('../assets/publish.png')}
        />
        <Text style={styles.ordertxt}>Publish</Text>
        <View style={{marginLeft: 'auto'}}>
          <Image
            source={require('../assets/dropdown.png')}
            style={{width: 20, height: 20}}
          />
        </View>
      </TouchableOpacity>
      {dropdownVisiblePublish && (
        <View style={styles.dropdown}>
          <TouchableOpacity
            style={styles.inventoryhead}
            onPress={goToPublish}>
            <Image
              style={styles.prodimg}
              source={require('../assets/publish.png')}
            />
            <Text style={styles.dropdownItem}>Product/Package Publish</Text>
          </TouchableOpacity>
          {/* Add more dropdown items here */}
        </View>
      )}
      <TouchableOpacity
        onPress={goToCustomerLocation}
        style={styles.inventoryhead}>
        <Text style={styles.ordertxt}>Location</Text>
      </TouchableOpacity>
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          setModalVisible(!modalVisible);
        }}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <TouchableOpacity
              style={styles.modalButton}
              onPress={takePhotoFromCamera}>
              <Text style={styles.modalButtonText}>Take Photo</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.modalButton}
              onPress={choosePhotoFromLibrary}>
              <Text style={styles.modalButtonText}>Choose from Gallery</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.modalCancelButton}
              onPress={() => setModalVisible(false)}>
              <Text style={{color: 'white'}}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <View style={styles.logoutContainer}>
        <TouchableOpacity onPress={handleLogout} style={styles.logoutbox}>
          <Image
            resizeMode="contain"
            style={[
              styles.logoutimg,
              {tintColor: '#fff', height: 20, width: 20},
            ]}
            source={require('../assets/logout.png')}
          />
          <Text style={styles.logouttxt}>Logout</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.orderhead1}
          onPress={() => setDeleteModalVisible(true)}>
          <Image
            style={{height: 25, width: 25, tintColor: 'red'}}
            source={require('../assets/delete.png')}
          />
          <Text
            style={{
              fontSize: 16,
              fontWeight: '800',
              marginLeft: 8,
              color: 'red',
            }}>
            Delete Account
          </Text>
        </TouchableOpacity>
      </View>
      <Modal
        animationType="slide"
        transparent={true}
        visible={deleteModalVisible}
        onRequestClose={() => setDeleteModalVisible(false)}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Are you sure?</Text>
            <Text style={styles.modalMessage}>
              User information will be deleted.
            </Text>
            <View style={styles.modalButtonContainer}>
              <TouchableOpacity
                style={styles.modalButton1}
                onPress={() => setDeleteModalVisible(false)}>
                <Text style={styles.modalButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton1, styles.modalDeleteButton]}
                onPress={() => {
                  getUserInActive();
                  setDeleteModalVisible(false);
                }}>
                <Text style={styles.modalButtonText}>Delete</Text>
              </TouchableOpacity>
            </View>
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
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  img: {
    height: 60,
    width: 60,
    marginHorizontal: 20,
    marginVertical: 10,
  },
  usertxt: {
    marginLeft: 20,
    fontSize: 20,
    marginHorizontal: 10,
    marginVertical: 10,
    color: '#fff',
  },
  homeheader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 10,
    marginVertical: 25,
  },
  homeimg: {
    height: 30,
    width: 30,
    // tintColor:'#1F74BA',
    tintColor: '#5177c0',
  },
  hometxt: {
    fontSize: 16,
    marginLeft: 10,
    color: '#000',
  },
  categorieshead: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 10,
  },
  categoriesimg: {
    height: 25,
    width: 25,
    tintColor: '#5177c0',
  },
  categoriestxt: {
    fontSize: 16,
    marginLeft: 10,
    color: '#000',
  },
  orderhead: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 10,
    marginTop: 20,
  },
  orderhead1: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 10,
    marginBottom: 7,
    justifyContent: 'center',
  },
  inventoryhead: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 10,
    marginTop: 20,
  },
  distributorhead: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 10,
    marginTop: 20,
  },
  orderimg: {
    height: 30,
    width: 30,
    tintColor: '#5177c0',
  },
  prodimg: {
    height: 30,
    width: 30,
    marginLeft: 40,
    tintColor: '#5177c0',
  },
  distributorimg: {
    height: 35,
    width: 35,
    tintColor: '#5177c0',
  },
  ordertxt: {
    fontSize: 16,
    marginLeft: 10,
    color: '#000',
  },
  dropdownItem: {
    fontSize: 16,
    marginHorizontal: 10,
    marginTop: 10,
    color: '#000',
  },
  dropdownItemm: {
    fontSize: 16,
    marginHorizontal: 10,
    marginTop: 15,
    color: '#000',
  },
  logoutContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  logoutbox: {
    borderWidth: 1,
    borderColor: '#f55951',
    backgroundColor: '#1F74BA',
    // backgroundColor: '#543c52',
    borderRadius: 15,
    paddingVertical: 12,
    flexDirection: 'row',
    marginHorizontal: 30,
    justifyContent: 'center',
    marginBottom: 10,
  },
  logoutbox1: {
    borderWidth: 1,
    borderColor: '#f55951',
    backgroundColor: '#f55951',
    borderRadius: 15,
    paddingVertical: 5,
    flexDirection: 'row',
    marginHorizontal: 30,
    justifyContent: 'center',
    marginBottom: 10,
  },
  logoutimg: {
    height: 20,
    width: 15,
    marginRight: 8,
  },
  logouttxt: {
    textAlign: 'center',
    color: '#fff',
    fontSize: 15,
    fontWeight: 'bold',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#fff',
    padding: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  modalButton: {
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  modalCancelButton: {
    paddingVertical: 15,
    alignItems: 'center',
    backgroundColor: 'red',
    borderRadius: 10,
    marginTop: 10,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#000',
  },
  modalMessage: {
    fontSize: 16,
    marginBottom: 20,
    color: '#000',
  },
  modalButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    color: '#000',
  },
  modalButton1: {
    flex: 1,
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  modalButtonText: {
    color: '#000',
  },

  modalDeleteButton: {
    backgroundColor: 'red',
  },
});

export default Sidebar;
