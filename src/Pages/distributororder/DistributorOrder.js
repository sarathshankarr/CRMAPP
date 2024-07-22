import React, {useEffect, useState} from 'react';
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TextInput,
  Alert,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import axios from 'axios';
import {useSelector} from 'react-redux';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useNavigation, useRoute} from '@react-navigation/native';
import {API} from '../../config/apiConfig';
// import CheckBox from 'react-native-check-box';
import CustomCheckBox from '../../components/CheckBox';

const DistributorOrder = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const orderId = route.params?.orderId;
  const [initialSelectedCompany, setInitialSelectedCompany] = useState(null);
  const [order, setOrder] = useState(null);
  const [isChecked, setIsChecked] = useState(false);
  const [totals, setTotals] = useState({
    totalQty: 0,
    totalGst: 0,
    totalCost: 0,
  });
  const [inputValues, setInputValues] = useState({});
  const [loading, setLoading] = useState(true);
  const [addedOrderData, setAddedOrderData] = useState(null);
  const [isButtonDisabled, setIsButtonDisabled] = useState(false); // New state for button disabled

  const selectedCompany = useSelector(state => state.selectedCompany);

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

  useEffect(() => {
    if (companyId && orderId) {
      getDistributorOrder();
    }
  }, [companyId, orderId]);

  const getDistributorOrder = async () => {
    setLoading(true);
    const apiUrl = `${global?.userData?.productURL}${API.GET_DISTRIBUTOR_ORDER}/${orderId}`;
    try {
      const response = await axios.get(apiUrl, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${global?.userData?.token?.access_token}`,
        },
      });
      if (response.data.status.success) {
        setOrder(response.data.response.ordersList[0]);
        console.log('Order:', response.data.response.ordersList[0]);
      } else {
        console.error('Failed to fetch order:', response.data.status);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (order) {
      calculateTotals();
    }
  }, [isChecked, order, inputValues]);

  const calculateTotals = () => {
    let totalQty = 0;
    let totalGst = 0;
    let totalCost = 0;

    if (order && order.orderLineItems) {
      order.orderLineItems.forEach(item => {
        const shippedQty = parseInt(item.shipQty);
        const receivedQty = parseInt(item.grnQty);
        const inputQty = parseInt(inputValues[item.orderLineitemId]) || 0;
        const qty = isChecked ? shippedQty : receivedQty + inputQty;
        const unitPrice = parseFloat(item.unitPrice);
        const gst = parseFloat(item.gst);

        totalQty += qty;
        totalGst += ((unitPrice * gst) / 100) * qty;
        totalCost += unitPrice * qty + ((unitPrice * gst) / 100) * qty;
      });
    }

    setTotals({
      totalQty: Math.floor(totalQty),
      totalGst: Math.floor(totalGst),
      totalCost: Math.floor(totalCost),
    });
  };

  const handleCheckBoxToggle = () => {
    setIsChecked(prevChecked => {
      if (!prevChecked) {
        setInputValues({});
      }
      return !prevChecked;
    });
  };

  const handleQtyChange = (text, itemId) => {
    const qty = parseInt(text);
    const orderLineItem = order.orderLineItems.find(item => item.orderLineitemId === itemId);
    const remainingQty = orderLineItem.shipQty - orderLineItem.grnQty;

    if (qty > remainingQty) {
      Alert.alert('Alert', 'Quantity should be less. Please check.');
    } else {
      setInputValues(prevInputValues => ({
        ...prevInputValues,
        [itemId]: text,
      }));
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#0000ff" style={styles.activityIndicator} />
      </View>
    );
  }

  const addGrnOrder = async () => {
    if (isButtonDisabled) return; // Prevent further execution if button is disabled

    setIsButtonDisabled(true); // Disable button after click

    const requestData = {
      totalAmount: totals.totalCost,
      totalDiscount: 0,
      totalGst: totals.totalGst,
      totalQty: totals.totalQty,
      orderStatus: 'PENDING',
      orderId: order.orderId,
      shippingAddressId: order.shippingAddressId,
      customerLocation: order.customerLocation,
      customerId: order.customerId,
      tQty: order.tQty,
      orderLineItems: order.orderLineItems.map(item => {
        const shippedQty = parseInt(item.shipQty);
        const receivedQty = parseInt(item.grnQty);
        const inputQty = parseInt(inputValues[item.orderLineitemId] || 0);
        const qty = isChecked ? shippedQty : receivedQty + inputQty;
        const unitPrice = parseFloat(item.unitPrice);
        const gst = parseFloat(item.gst);
        const gross = qty * unitPrice + (qty * unitPrice * gst) / 100;
        const grossWithoutDecimals = Math.floor(gross);
        const enterQty = isChecked
          ? shippedQty
          : parseInt(inputValues[item.orderLineitemId] || 0);
        const grnQty = isChecked
          ? item.shipQty
          : parseInt(item.grnQty || 0) + parseInt(inputValues[item.orderLineitemId] || 0);
        return {
          qty: item.qty,
          orderLineitemId: item.orderLineitemId,
          styleId: item.styleId,
          colorId: item.colorId,
          gscodeMapId: item.gscodeMapId,
          styleId: item.styleId,
          styleName: item.styleName,
          size: item.size,
          sizeId: item.sizeId,
          gsCode: item.gsCode,
          availQty: item.shipQty,
          unitPrice: item.unitPrice,
          orderLineitemId: item.orderLineitemId,
          price: item.unitPrice,
          gross: grossWithoutDecimals,
          enterqty: enterQty,
          discountPercentage: item.discountPercentage,
          discountAmount: item.discountAmount,
          gst: item.gst,
          total: item.total,
          totQty: grnQty,
          grnQty: item.grnQty,
          tsiId: item.tsiId,
        };
      }),
    };

    console.log('Request Data:', requestData);
    axios
      .post(global?.userData?.productURL + API.ADD_GRN_ORDER, requestData, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${global?.userData?.token?.access_token}`,
        },
      })
      .then(response => {
        console.log('Response received:', response.data);
        navigation.navigate('Distributor GRN');
        getDistributorOrder();
      })
      .catch(error => {
        console.error('Error placing order:', error);
      })
      .finally(() => {
        setIsButtonDisabled(false); // Re-enable button after the process completes
      });
  };

  const renderOrderLineItem = ({item}) => {
    const shippedQty = parseInt(item.shipQty);
    const receivedQty = parseInt(item.grnQty);

    let inputQty = '0';

    if (isChecked) {
      inputQty = (shippedQty - receivedQty).toString();
    } else {
      if (inputValues[item.orderLineitemId] !== undefined) {
        inputQty = inputValues[item.orderLineitemId].toString();
      }
    }

    const qty = isChecked ? shippedQty : receivedQty + parseInt(inputQty || 0);
    const unitPrice = parseFloat(item.unitPrice);
    const gst = parseFloat(item.gst);

    const grnGross = qty * unitPrice + (qty * unitPrice * gst) / 100;
    const grossWithoutDecimals = Math.floor(grnGross);
    console.log('Size:', item.size);

    return (
      <View style={styles.orderItem}>
        <Text style={{marginRight: 1}}>{item.styleId}</Text>
        <Text style={[styles.orderText, {flex: 2.2}]}>{item.styleName}</Text>
        <Text style={[styles.orderText, {flex: 1.6}]}>{item.colorName}</Text>
        <Text style={[styles.orderText, {flex: 1}]}>{item.size}</Text>
        <Text style={[styles.orderText, {flex: 1}]}>{item.shipQty}</Text>
        <Text style={[styles.orderText, {flex: 1}]}>{item.grnQty}</Text>
        <TextInput
          style={[
            styles.orderText,
            {
              flex: 1,
              alignSelf: 'center',
              borderBottomWidth: 1,
              borderColor: 'gray',
              textAlign: 'center',
              color: '#000',
              justifyContent: 'center',
            },
          ]}
          value={inputQty}
          onChangeText={text => handleQtyChange(text, item.orderLineitemId)}
          keyboardType="numeric"
          onBlur={() => setInputValues({...inputValues})}
        />
        <Text style={[styles.orderText, {flex: 1}]}>{item.unitPrice}</Text>
        <Text style={[styles.orderText, {flex: 1}]}>{item.gst}</Text>
        <Text style={[styles.orderText, {flex: 1}]}>{grossWithoutDecimals}</Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={{flexDirection: 'row'}}>
          <Text style={[styles.headerText, {flex: 1}]}>
            Order ID: {order.orderId}
          </Text>
          <TouchableOpacity
            onPress={addGrnOrder}
            style={{borderWidth: 1, paddingHorizontal: 10, borderRadius: 5}}
            disabled={isButtonDisabled} // Disable button based on state
          >
            <Text style={styles.headerText}>Add</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.headerText}>
          Distributor Location: {order.customerName}
        </Text>
        <Text style={styles.headerText}>
          Company Location {order.companyName}
        </Text>
      </View>
      <View style={styles.orderDetailsHeader}>
        <Text style={{flex: 0.5}}>No</Text>
        <Text style={[styles.orderDetailsText, {flex: 2}]}>Name</Text>
        <Text style={[styles.orderDetailsText, {flex: 1.5}]}>Color</Text>
        <Text style={[styles.orderDetailsText, {flex: 1}]}>Size</Text>
        <Text style={[styles.orderDetailsText, {flex: 1}]}>Ship Qty</Text>
        <Text style={[styles.orderDetailsText, {flex: 1}]}>Rec Qty</Text>
        <View style={{flex: 1, alignItems: 'center'}}>
          <Text
            style={{
              textAlign: 'center',
              fontWeight: 'bold',
              marginBottom: 5,
            }}>
            Qty
          </Text>
          <CustomCheckBox isChecked={isChecked} onToggle={handleCheckBoxToggle} />
          {/* <CheckBox onClick={handleCheckBoxToggle} isChecked={isChecked} /> */}
        </View>
        <Text style={[styles.orderDetailsText, {flex: 1}]}>Price</Text>
        <Text style={[styles.orderDetailsText, {flex: 1}]}>GST</Text>
        <Text style={[styles.orderDetailsText, {flex: 1.1}]}>Gross</Text>
      </View>
      <FlatList
        data={order.orderLineItems}
        renderItem={renderOrderLineItem}
        keyExtractor={item => item.orderLineitemId.toString()}
      />
      <View style={styles.summary}>
        <Text style={styles.summaryText}>Total Qty: {totals.totalQty}</Text>
        <Text style={styles.summaryText}>Total GST: {totals.totalGst}</Text>
        <Text style={styles.summaryText}>Total Cost: {totals.totalCost}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    flex: 1,
  },
  header: {
    padding: 10,
    backgroundColor: '#f0f0f0',
  },
  headerText: {
    fontWeight: 'bold',
    marginVertical: 2,
  },
  orderDetailsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    paddingVertical: 10,
    backgroundColor: '#dcdcdc',
  },
  orderDetailsText: {
    flex: 1,
    textAlign: 'center',
    fontWeight: 'bold',
    marginBottom: 15,
  },
  orderItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    alignItems: 'center',
  },
  orderText: {
    flex: 1,
    textAlign: 'center',
  },
  summary: {
    padding: 10,
    backgroundColor: '#f0f0f0',
    marginTop: 20,
  },
  summaryText: {
    fontWeight: 'bold',
    marginVertical: 2,
    textAlign: 'right',
  },
  activityIndicator: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default DistributorOrder;
