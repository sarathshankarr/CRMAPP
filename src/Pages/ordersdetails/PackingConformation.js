import {useNavigation} from '@react-navigation/native';
import React, {useState, useEffect} from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Image,
  ScrollView,
  TextInput,
  ActivityIndicator,
  Alert,
} from 'react-native';
import {API} from '../../config/apiConfig';
import axios from 'axios';
import CustomCheckBox from '../../components/CheckBox';
import {useSelector} from 'react-redux';
import AsyncStorage from '@react-native-async-storage/async-storage';
import CustomCheckBoxStatus from '../../components/CustomCheckBoxStatus';

const PackingConformation = ({route}) => {
  const navigation = useNavigation();
  const {orderId} = route.params;
  const [loading, setLoading] = useState(true);
  const [order, setOrder] = useState(null);
  const [statusOptions, setStatusOptions] = useState([]);
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedItems, setSelectedItems] = useState({});
  const [triggerUpdate, setTriggerUpdate] = useState(false);
  const loggedInUser = useSelector(state => state.loggedInUser);
  const [comments, setComments] = useState(''); // Add this state variable

  const orderApproval = loggedInUser?.role[0]?.orderApproval;
  const userData = useSelector(state => state.loggedInUser);
  const userId = userData?.userId;

  const [initialSelectedCompany, setInitialSelectedCompany] = useState(null);
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

  const getAllStatus = async () => {
    const apiUrl = `${global?.userData?.productURL}${API.GET_ALL_STATUS}`;
    try {
      const response = await axios.get(apiUrl, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${global?.userData?.token?.access_token}`,
        },
      });
      if (response.data.status.success) {
        setStatusOptions(response.data.response.statusList); // Update state with the status list
      } else {
        console.error('Failed to fetch status:', response.data.status);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

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
        const orderData = response.data.response.ordersList[0];
        setOrder(orderData);

        // Set the initial comments value
        setComments(orderData.appComments || '');

        // Check if any product is confirmed or canceled
        const hasConfirmedOrCanceled = orderData.orderLineItems.some(
          item => item.statusFlag === 1 || item.statusFlag === 2,
        );

        // Set status to "Select" if any product is confirmed or canceled
        setSelectedStatus(
          hasConfirmedOrCanceled ? 'Select' : orderData.orderStatus,
        );
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
    getDistributorOrder(); // Fetch the order when the component mounts
  }, []);

  const handleGoBack = () => {
    navigation.goBack();
  };

  const handleDropdownToggle = async () => {
    if (!dropdownVisible && statusOptions.length === 0) {
      await getAllStatus(); // Fetch status options if not already fetched
    }
    setDropdownVisible(!dropdownVisible); // Toggle dropdown visibility
  };

  const filteredStatusOptions = statusOptions.filter(option => {
    if (selectedStatus === 'Select') {
      // Include 'Open', 'Select', 'Confirmed', and 'Cancelled' when selectedStatus is 'Select'
      return ['Open', 'Select', 'Confirmed', 'Cancelled'].includes(option.stts);
    }

    // For other selectedStatus values, filter based on orderApproval
    return orderApproval === 1
      ? ['Open', 'Confirmed', 'Cancelled'].includes(option.stts)
      : ['Open', 'Cancelled'].includes(option.stts);
  });

  const handleDropdownSelectStatus = status => {
    setSelectedStatus(status.stts); // Update selected status
    setDropdownVisible(false); // Hide dropdown
  };

  const OrderDetailRow = ({label, value}) => (
    <View style={{flexDirection: 'row', justifyContent: 'flex-end'}}>
      <Text style={{width: 200, textAlign: 'right', color: '#000'}}>
        {label}
      </Text>
      <Text style={{width: 40, textAlign: 'center', color: '#000'}}>:</Text>
      <Text style={{flex: 1, textAlign: 'right', color: '#000'}}>{value}</Text>
    </View>
  );

  // Function to handle checkbox toggle

  const handleCheckboxToggle = itemId => {
    setSelectedItems(prevSelectedItems => {
      const updated = {
        ...prevSelectedItems,
        [itemId]: !prevSelectedItems[itemId],
      };
      return updated;
    });
  };

  const updateStatusForNonCanceledItems = status => {
    setSelectedItems(prevSelectedItems => {
      const updatedItems = {...prevSelectedItems};

      order?.orderLineItems.forEach(item => {
        // Only update items that are not manually canceled and are not already confirmed
        if (
          item.statusFlag !== 2 &&
          prevSelectedItems[item.orderLineitemId] !== false
        ) {
          updatedItems[item.orderLineitemId] = status === 'Confirmed';
        }
      });

      return updatedItems;
    });
  };

  const updateStatusForNonCanceledWhenCancelled = status => {
    setSelectedItems(prevSelectedItems => {
      const updatedItems = {...prevSelectedItems};

      order?.orderLineItems.forEach(item => {
        // Only update items that are not manually canceled and are not already canceled
        if (
          item.statusFlag !== 1 &&
          prevSelectedItems[item.orderLineitemId] !== true
        ) {
          updatedItems[item.orderLineitemId] = status === 'Cancelled';
        }
      });

      return updatedItems;
    });
  };

  const handleUpdateOrderStatus = () => {
    // If the status is 'Open', directly update without showing the alert
    if (selectedStatus === 'Open') {
      setTriggerUpdate(true);
      return;
    }
  
    // Check if any items are selected
    const anySelected = Object.values(selectedItems).some(item => item === true);
  
    // If no items are selected, show the alert
    if (!anySelected) {
      Alert.alert(
        'crm.codeverse.co says',
        `Since you haven't checked any styles, the ${selectedStatus.toLowerCase()} status will be assigned to all styles. If you are certain, please click on OK`,
        [
          {
            text: 'Cancel',
            onPress: () => ('Action Cancelled'),
            style: 'cancel',
          },
          {
            text: 'OK',
            onPress: () => {
              // Perform the update based on the selected status
              if (selectedStatus === 'Cancelled') {
                updateStatusForNonCanceledWhenCancelled(selectedStatus);
              } else {
                updateStatusForNonCanceledItems(selectedStatus);
              }
              setTriggerUpdate(true);
            },
          },
        ],
        { cancelable: false }
      );
    } else {
      // If items are selected, proceed to update without showing the alert
      setTriggerUpdate(true);
    }
  };
  

  // useEffect to handle order update when triggerUpdate changes
  useEffect(() => {
    if (triggerUpdate) {
      updateDisOrder();
      setTriggerUpdate(false); // Reset trigger
    }
  }, [triggerUpdate]);

  const updateDisOrder = () => {
    const requestData = {
      orderId: order?.orderId || 0,
      totalGst: order?.totalGst || 0,
      totalAmount: order?.totalAmount || 0,
      totalDiscount: order?.totalDiscount || 0,
      totalDiscountSec: order?.totalDiscountSec || 0,
      companyId: companyId || '',
      userId: userId || '',
      totalQty: order?.totalQty || 0,
      updateStatus: selectedStatus || '',
      appComments: comments,
      orderLineItems: order?.orderLineItems.map(item => {
        const isManuallyCanceled = item.statusFlag === 2;
        return {
          orderLineitemId: item.orderLineitemId,
          orderId: item.orderId,
          qty: item.qty,
          unitPrice: item.unitPrice,
          gross: item.gross,
          discountPercentage: item.discountPercentage,
          gst: item.gst,
          discountPercentageSec: item.discountPercentageSec,
          discAmnt: item.discAmnt,
          discAmntSec: item.discAmntSec,
          gstAmnt: item.gstAmnt,
          discountPercentageThird: item.discountPercentageThird,
          statusFlag: item.statusFlag,
          sttsFlag: isManuallyCanceled
            ? false
            : selectedItems[item.orderLineitemId] || false,
        };
      }),
    };

    axios
      .post(
        `${global?.userData?.productURL}${API.UPDATE_DIS_ORDERl}`,
        requestData,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${global?.userData?.token?.access_token}`,
          },
        },
      )
      .then(response => {
        if (response.data.status.success) {
          navigation.goBack();
        } else {
          console.error('Failed to update order:', response.data.status);
        }
      })
      .catch(error => {
        console.error('Error updating order:', error);
      });
  };

  const renderOrderLineItem = ({item}) => {
    // Function to determine the checkbox color based on statusFlag
    const getCheckboxColor = statusFlag => {
      if (statusFlag === 2) {
        return 'red'; // Red for cancel (statusFlag 2)
      } else if (statusFlag === 1) {
        return 'green'; // Green for confirmed (statusFlag 1)
      }
      return 'black'; // Default color for other statuses
    };

    const checkboxColor = getCheckboxColor(item.statusFlag);

    const grosss = item.qty * (item.unitPrice - item.discountPercentageThird);

    return (
      <View style={styles.orderItem}>
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            marginLeft: 8,
          }}>
          <CustomCheckBoxStatus
            isChecked={
              !!selectedItems[item.orderLineitemId] || checkboxColor === 'green'
            } // Check if either condition is true
            onToggle={() =>
              handleCheckboxToggle(item.orderLineitemId, item?.statusFlag)
            }
            disabled={item.statusFlag !== 0} // Disable if statusFlag is not 0
            borderColor={checkboxColor} // Pass the color to change the border color
          />

          <Text style={styles.orderstylenametxt}>{item?.styleName}</Text>
          <Text style={styles.orderqtytxt}>Qty: {item?.qty}</Text>
          <Text style={styles.ordertotaltxt}>Total: {item?.gross}</Text>
        </View>
        <View style={{flexDirection: 'row'}}>
          <View style={{marginVertical: 8,flex:1.3}}>
            <Text style={styles.sizetxt}>Size : {item?.size}</Text>
          </View>
          <View style={{marginVertical: 8,flex:1}}>
            <Text style={styles.colortxt}>Color : {item?.colorName}</Text>
          </View>
        </View>

        <View>
          <Text style={styles.sizetxt}>Price : {item?.unitPrice}</Text>
        </View>
        <View style={{flexDirection: 'row', marginTop: 3}}>
          <Text style={styles.sizedistxt}>Disc Amnt : {item?.discAmnt}</Text>
          <Text style={styles.Fixedtxt}>
            Disc 1 : {item.discountPercentage}
          </Text>
        </View>
        <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
          <Text style={styles.sizegrosstxt}>Gross : {grosss} </Text>
          <Text style={styles.sizegsttxt}>GST : {item?.gst}</Text>
          <Text style={styles.sizegstAmnttxt}>GST AMT : {item?.gstAmnt}</Text>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={{flexDirection: 'row', backgroundColor: '#f0f0f0'}}>
        <TouchableOpacity onPress={handleGoBack} style={styles.backButton}>
          <Image
            style={{height: 25, width: 25, marginRight: 8}}
            source={require('../../../assets/back_arrow.png')}
          />
        </TouchableOpacity>
        <View style={{flex: 1}}>
          <Text
            style={{
              justifyContent: 'center',
              alignSelf: 'center',
              color: '#000',
              fontWeight: 'bold',
              fontSize: 20,
              marginVertical: 10,
            }}>
            Order Details
          </Text>
        </View>
      </View>
      <ScrollView>
        <View style={styles.orderhead}>
          <Text style={styles.orderidtxt}>Order : {order?.orderNum}</Text>
          <Text style={styles.ordercusttxt}>{order?.customerName}</Text>
        </View>
        <View style={styles.orderhead}>
          <Text style={styles.orderDate}>Order Date : {order?.orderDate}</Text>
          <Text style={styles.ordertotalQty}>
            Total Qty : {order?.totalQty}
          </Text>
        </View>
        <View style={{marginVertical: 25, marginLeft: 10}}>
          <Text style={styles.Productdettext}>Product Details</Text>
        </View>

        {loading ? (
          <View
            style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
            <ActivityIndicator size="large" color="#000" />
          </View>
        ) : (
          <View>
            {order?.orderLineItems?.map(item => (
              <View key={item.orderLineitemId.toString()}>
                {renderOrderLineItem({item})}
              </View>
            ))}
            <View
              style={{
                marginHorizontal: 15,
                alignItems: 'flex-end',
                marginBottom: 15,
              }}>
              <OrderDetailRow label="Total Qty" value={order?.totalQty} />
              <OrderDetailRow label="Total Gst" value={order?.totalGst} />
              {/* <OrderDetailRow label="IGST" value={order?.igst} /> */}
              <OrderDetailRow
                label="Total Disc 1"
                value={order?.totalDiscount}
              />
              {/* <OrderDetailRow
              label="Total Disc 2"
              value={order?.totalDiscountSec}
            /> */}
              <OrderDetailRow label="Transport Exp" value={order?.gTranspExp} />
              <OrderDetailRow label="Other Exp" value={order?.gOtherExp} />
              <OrderDetailRow label="Total Cost" value={order?.totalAmount} />
            </View>
            {order?.completeFlag === 0 && (
              <>
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    marginTop: 20,
                  }}>
                  <Text
                    style={{color: '#000', marginLeft: 10, marginRight: 50}}>
                    Remarks:
                  </Text>
                  <View style={{flex: 1, marginLeft: 10, marginHorizontal: 30}}>
                    {/* <TextInput
                    style={{
                      color: '#000',
                      borderWidth: 1,
                      paddingVertical: 10,
                      borderRadius: 5,
                    }}
                    placeholder="Status Comments"
                    placeholderTextColor={'#000'}
                    value={comments} // Bind the input value to the state
                    onChangeText={text => setComments(text)} // Update the state on text change
                  /> */}
                    <TextInput
                      style={{
                        color: '#000',
                        borderWidth: 1,
                        paddingVertical: 10,
                        borderRadius: 5,
                      }}
                      placeholder="Status Comments"
                      placeholderTextColor={'#000'}
                      value={comments} // Bind the input value to the state
                      onChangeText={text => setComments(text)} // Update the state on text change
                    />
                  </View>
                </View>
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    marginTop: 20,
                  }}>
                  <View style={{}}>
                    <Text style={{color: '#000', marginLeft: 6}}>
                      Status :{' '}
                    </Text>
                  </View>
                  <View
                    style={{
                      alignItems: 'center',
                      marginLeft: 60,
                    }}>
                    <TouchableOpacity
                      style={styles.dropdownButton}
                      onPress={handleDropdownToggle}>
                      <Text style={styles.dropdownText}>
                        {selectedStatus || 'Select Status'}
                      </Text>
                      <Image
                        source={require('../../../assets/dropdown.png')}
                        style={styles.dropdownImage}
                      />
                    </TouchableOpacity>
                  </View>
                </View>

                {dropdownVisible && (
                  <View style={styles.dropdownContainer}>
                    <ScrollView
                      style={styles.scrollView}
                      nestedScrollEnabled={true}>
                      {filteredStatusOptions.map(option => (
                        <TouchableOpacity
                          key={option.id}
                          style={[
                            styles.dropdownOption,
                            selectedStatus === option.stts &&
                              styles.selectedOption,
                          ]}
                          onPress={() => handleDropdownSelectStatus(option)}>
                          <Text style={styles.dropdownOptionText}>
                            {option.stts}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  </View>
                )}

                <View>
                  <TouchableOpacity
                    onPress={handleUpdateOrderStatus}
                    style={{
                      borderWidth: 1,
                      marginTop: 50,
                      marginBottom: 50,
                      marginHorizontal: 20,
                      borderRadius: 10,
                      paddingVertical: 10,
                      backgroundColor: '#F09120',
                    }}>
                    <Text style={{color: '#000', alignSelf: 'center'}}>
                      Update Order Status
                    </Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  backButton: {
    padding: 8,
  },
  orderItem: {
    marginVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  orderDate: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#000',
  },
  orderhead: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: 10,
    marginTop: 10,
  },
  orderidtxt: {
    color: '#000',
    fontWeight: 'bold',
  },
  ordercusttxt: {
    color: '#000',
  },
  ordertotalQty: {
    color: '#000',
  },
  Productdettext: {
    color: '#000',
    fontWeight: 'bold',
    fontSize: 17,
  },
  orderstylenametxt: {
    color: '#000',
    flex: 1.4,
    marginLeft: 13,
  },
  orderqtytxt: {
    color: '#000',
    flex: 1.1,
  },
  ordertotaltxt: {
    color: '#000',
    flex: 1,
    marginLeft: 20,
  },
  sizetxt: {
    color: '#000',
    marginLeft: 40,
    flex: 1,
  },
  colortxt: {
    color: '#000',
    marginLeft: 78,
    flex: 2,
  },
  sizedistxt: {
    color: '#000',
    marginLeft: 40,
    flex: 1,
  },
  Fixedtxt: {
    color: '#000',
    marginLeft: 23,
    flex: 2,
  },
  sizegsttxt: {
    color: '#000',
    marginLeft: 27,
    flex: 0.8,
  },
  sizegstAmnttxt: {
    color: '#000',
    marginLeft: 40,
    marginRight: 10,
    flex: 0.8,
  },
  sizegrosstxt: {
    color: '#000',
    marginLeft: 40,
    flex: 1,
    marginTop: 3,
    marginBottom: 5,
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
  },
  dropdownText: {
    color: '#000',
  },
  dropdownImage: {
    width: 20,
    height: 20,
    marginRight: 5,
    marginLeft: 20,
  },
  dropdownContainer: {
    marginLeft: 15,
    marginTop: 5,
    width: '51%',
    backgroundColor: 'white',
    borderWidth: 0.5,
    borderRadius: 10,
    alignSelf: 'center',
  },
  dropdownOption: {
    padding: 10,
    borderBottomWidth: 0.5,
    borderBottomColor: '#ddd',
  },
  dropdownOptionText: {
    color: '#000',
  },
  selectedOption: {
    backgroundColor: '#ddd',
  },
  scrollView: {
    maxHeight: 100, // Adjust height as needed
  },
});

export default PackingConformation;
