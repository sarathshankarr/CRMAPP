import React, {useEffect, useState} from 'react';
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  ActivityIndicator,
  Image,
  TouchableOpacity,
  Alert,
  Platform,
  PermissionsAndroid,
} from 'react-native';
import axios from 'axios';
import {API} from '../../config/apiConfig';
import {useRoute} from '@react-navigation/native';
import ReactNativeBlobUtil from 'react-native-blob-util';
import Pdf from 'react-native-pdf';

// Define pdfPath outside the component
let pdfPath = null;

const PackingOrders = () => {
  const [packingOrders, setPackingOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const route = useRoute();
  const {orderId} = route.params;

  useEffect(() => {
    if (orderId) {
      getOrderPacking(orderId);
    }
  }, [orderId]);

  const getOrderPacking = orderId => {
    const apiUrl = `${global?.userData?.productURL}${API.GET_ORDER_PACKING}/${orderId}`;
    axios
      .get(apiUrl, {
        headers: {
          Authorization: `Bearer ${global?.userData?.token?.access_token}`,
        },
      })
      .then(response => {
        setPackingOrders(response.data);
        console.log(response.data)
        setLoading(false);
      })
      .catch(error => {
        console.error('Error:', error);
        setLoading(false);
      });
  };

  const requestStoragePermission = async () => {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
        {
          title: 'Storage Permission Required',
          message: 'This app needs access to your storage to download PDF',
          buttonNeutral: 'Ask Me Later',
          buttonNegative: 'Cancel',
          buttonPositive: 'OK',
        },
      );

      console.log('Permission granted:', granted);

      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        // Permission granted, return true
        console.log('Storage permission granted');
        return true;
      } else if (granted === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN) {
        // Permission denied and never ask again selected
        console.log('Permission denied and never ask again selected');
        Alert.alert(
          'Permission Denied',
          'Storage permission is required to save the PDF. Please enable it in the app settings.',
          [{text: 'OK', onPress: () => console.log('OK Pressed')}],
          {cancelable: false},
        );
        return false;
      } else {
        // Permission denied
        console.log('Permission denied');
        Alert.alert(
          'Permission Denied',
          'Storage permission is required to save the PDF. Please grant the permission.',
          [{text: 'OK', onPress: () => console.log('OK Pressed')}],
          {cancelable: false},
        );
        return false;
      }
    } catch (err) {
      console.warn('Error requesting storage permission:', err);
      return false;
    }
  };

  const getInvoice = async (orderId, pId) => {
    const apiUrl = `${global?.userData?.productURL}${API.ADD_GENERATED_PDF}/${orderId}/P/${pId}/I`;
    try {
      const response = await axios.post(
        apiUrl,
        {},
        {
          headers: {
            Authorization: `Bearer ${global?.userData?.token?.access_token}`,
            'Content-Type': 'application/json',
          },
        },
      );
      const pdfBase64 = response.data.body;
      console.log('Received PDF base64 data');

      if (Platform.OS === 'android') {
        const hasPermission = await requestStoragePermission();
        if (!hasPermission) {
          Alert.alert(
            'Permission Denied',
            'Storage permission is required to save the PDF.',
          );
          return;
        }
      }

      pdfPath = `${ReactNativeBlobUtil.fs.dirs.DownloadDir}/Invoice_${orderId}_${pId}.pdf`;
      console.log('Saving PDF to:', pdfPath);

      await ReactNativeBlobUtil.fs.writeFile(pdfPath, pdfBase64, 'base64');
      Alert.alert('PDF Downloaded', `PDF saved successfully at ${pdfPath}`);
      console.log('PDF saved successfully at', pdfPath);
    } catch (error) {
      console.error('Error generating or saving PDF:', error);
      Alert.alert('Error', `Failed to generate or save PDF: ${error.message}`);
    }
  };

  const getPackingList = async (orderId, pId) => {
    const apiUrl = `${global?.userData?.productURL}${API.ADD_GENERATED_PDF}/${orderId}/P/${pId}/P`;
    try {
      const response = await axios.post(
        apiUrl,
        {},
        {
          headers: {
            Authorization: `Bearer ${global?.userData?.token?.access_token}`,
            'Content-Type': 'application/json',
          },
        },
      );
      const pdfBase64 = response.data.body;
      console.log('Received PDF base64 data');

      if (Platform.OS === 'android') {
        const hasPermission = await requestStoragePermission();
        if (!hasPermission) {
          Alert.alert(
            'Permission Denied',
            'Storage permission is required to save the PDF.',
          );
          return;
        }
      }

      pdfPath = `${ReactNativeBlobUtil.fs.dirs.DownloadDir}/Pakinglist_${orderId}_${pId}.pdf`;
      console.log('Saving PDF to:', pdfPath);

      await ReactNativeBlobUtil.fs.writeFile(pdfPath, pdfBase64, 'base64');
      Alert.alert('PDF Downloaded', `PDF saved successfully at ${pdfPath}`);
      console.log('PDF saved successfully at', pdfPath);
    } catch (error) {
      console.error('Error generating or saving PDF:', error);
      Alert.alert('Error', `Failed to generate or save PDF: ${error.message}`);
    }
  };

  const renderOrder = ({item}) => (
    <View style={{borderBottomWidth: 1, borderBottomColor: '#ccc'}}>
      <View style={styles.orderContainer}>
        <Text style={styles.text}>{item.p_id}</Text>
        <Text style={styles.text1}>{item.totQty}</Text>
        <Text style={{textAlign: 'center',flex:0.4,color:"#000"}}>{item.shipQty}</Text>
        <Text style={styles.text2}>{item.totAmnt}</Text>
        <Text style={styles.text3}>{item.packNo}</Text>
        <Text style={styles.text4}>{item.packUserName}</Text>
        <Text style={styles.text5}>{item.shipUserName}</Text>
      </View>
      <View
        style={{
          flexDirection: 'row',
          marginHorizontal: 10,
          justifyContent: 'flex-end',
        }}>
        <TouchableOpacity onPress={() => getInvoice(orderId, item.p_id)}>
          <Image
            style={{height: 30, width: 30, alignSelf: 'center'}}
            source={require('../../../assets/packagelist.png')}
          />
          <Text style={{marginHorizontal: 10,color:"#000"}}>Invoice</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={()=> getPackingList (orderId, item.p_id)} style={{marginHorizontal: 10}}>
          <Image
            style={{height: 30, width: 30, alignSelf: 'center'}}
            source={require('../../../assets/invoice.png')}
          />
          <Text style={{color:"#000"}}>PackingList</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loading) {
    return <ActivityIndicator size="large" color="#0000ff" />;
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>ID</Text>
        <Text style={styles.headerText1}>Total Qty</Text>
        <Text style={{  textAlign: 'center',flex: 0.5,    color:"#000"}}>ship Qty</Text>
        <Text style={styles.headerText5}>Total Amnt</Text>
        <Text style={styles.headerText2}>Packing Slip No</Text>
        <Text style={styles.headerText3}>Pack By</Text>
        <Text style={styles.headerText4}>Ship By</Text>
      </View>
      <FlatList
        data={packingOrders}
        renderItem={renderOrder}
        keyExtractor={item => item.p_id.toString()}
      />
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
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    paddingVertical: 10,
    backgroundColor: '#f0f0f0',
  },
  headerText: {
    textAlign: 'center',
    flex: 0.4,
    color:"#000"
  },
  headerText1: {
    textAlign: 'center',
    flex: 0.5,
    color:"#000"
  },
  headerText5: {
    textAlign: 'center',
    flex: 0.6,
    color:"#000"
  },
  headerText2: {
    textAlign: 'center',
    flex: 0.8,
    marginLeft:5,
    color:"#000"
  },
  headerText3: {
    textAlign: 'center',
    flex: 1,
    color:"#000"
  },
  headerText4: {
    textAlign: 'center',
    flex: 0.8,
    color:"#000"
  },
  orderContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    paddingVertical: 10,
  },
  text: {
    textAlign: 'center',
    flex: 0.4,
    color:"#000"
  },
  text1: {
    textAlign: 'center',
    flex: 0.7,
    color:"#000"
  },
  text2: {
    textAlign: 'center',
    flex: 1,
    color:"#000"
  },
  text3: {
    textAlign: 'center',
    flex: 1,
    color:"#000"
  },
  text4: {
    textAlign: 'center',
    flex: 1,
    color:"#000"
  },
  text5: {
    textAlign: 'center',
    flex: 1,
    marginLeft: 3,
    color:"#000"
  },
  pdf: {
    flex: 8,
    width: '100%',
    height: '100%',
  },
});

export default PackingOrders;
