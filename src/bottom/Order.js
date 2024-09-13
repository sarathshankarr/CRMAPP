import React, {useEffect, useState, useCallback} from 'react';
import {
  Text,
  View,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  Modal,
  TextInput,
  Image,
  ScrollView,
} from 'react-native';
import axios from 'axios';
import {useFocusEffect, useNavigation} from '@react-navigation/native';
import {API} from '../config/apiConfig';
import {useSelector} from 'react-redux';
import AsyncStorage from '@react-native-async-storage/async-storage';

const Order = () => {
  const [orders, setOrders] = useState([]);
  const [pageNo, setPageNo] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [initialSelectedCompany, setInitialSelectedCompany] = useState(null);
  const [loading, setLoading] = useState(false);
  const [firstLoad, setFirstLoad] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [refreshingOrders, setRefreshingOrders] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchInput, setShowSearchInput] = useState(false);
  const navigation = useNavigation();

  const [selectedSearchOption, setSelectedSearchOption] = useState(null);
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [searchKey, setSearchKey] = useState(1); // Default to "Type" or any other default
  const [page, setPage] = useState(1);
  const [hasMoreData, setHasMoreData] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const selectedCompany = useSelector(state => state.selectedCompany);
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      setSearchQuery('');
      setShowSearchInput(false);
    });
    return unsubscribe;
  }, [navigation]);
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

  useEffect(() => {
    if (companyId) {
      getAllOrders();
    }
  }, [companyId]);

  const getAllOrders = () => {
    setLoading(true);
    const apiUrl = `${global?.userData?.productURL}${
      API.GET_ALL_ORDER_LAZY
    }/${0}/${10000}/${companyId}/${0}`;

    axios
      .get(apiUrl, {
        headers: {
          Authorization: `Bearer ${global?.userData?.token?.access_token}`,
        },
      })
      .then(response => {
        setOrders(response.data.response.ordersList);
      })
      .catch(error => {
        console.error('Error:', error);
      })
      .finally(() => {
        setLoading(false);
      });
  };
  const getProductInventorySearch = async (initialLoad = false) => {
    if (loading || !hasMoreData) return;

    initialLoad ? setLoading(true) : setLoadingMore(true);

    const apiUrl = `${global?.userData?.productURL}${API.GET_ALL_ORDER_SEARCH}`;
    const requestBody = {
      dropdownId: searchKey,
      fieldvalue: searchQuery,
      from: 0,
      to: 10000,
      companyId: companyId,
      pdfFlag: 0,
    };

    try {
      const response = await axios.post(apiUrl, requestBody, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${global?.userData?.token?.access_token}`,
        },
      });
      const fetchedData = response.data.gsCodesList.filter(
        item => item !== null,
      );
      if (initialLoad) {
        setOrders(fetchedData);
      } else {
        setOrders(prevData => [...prevData, ...fetchedData]);
      }
      setHasMoreData(fetchedData.length >= 100);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const toggleDropdown = () => {
    setDropdownVisible(!dropdownVisible);
  };

  const handleDropdownSelect = option => {
    setSelectedSearchOption(option.label);
    setSearchKey(option.value);
    setDropdownVisible(false);
    setSearchQuery('');
    setPage(1);
    setHasMoreData(true);
    getAllOrders(true);
  };

  const searchOption = [
    {label: 'Order No', value: 5},
    {label: 'Retailer', value: 2},
    {label: 'Agent', value: 3},
    {label: 'Sub Agent', value: 4},
    {label: 'Distributor', value: 1},
    {label: 'Retailer', value: 5},
    {label: 'Order Date', value: 6},
    {label: 'Order status', value: 7},
    {label: 'Packing status', value: 8},
  ];
  //   const handleSearch = () => {
  //     console.log("handleSearch======>",handleSearch)
  //     setPage(1);
  //     setHasMoreData(true);
  //     getProductInventorySearch(true);
  // };
  const handleSearch = () => {
    console.log('handleSearch======>', searchQuery);
    setPage(1); // Reset page to 1 for fresh search
    setHasMoreData(true); // Reset data fetching status
    // Filter the orders based on the search query
    const filteredOrders = orders.filter(item => {
      if (!item) return false;
      const customerName = item.customerName
        ? item.customerName.toLowerCase()
        : '';
      const orderNum = item.orderNum
        ? item.orderNum.toString().toLowerCase()
        : '';
      const query = searchQuery.toLowerCase();
      return customerName.includes(query) || orderNum.includes(query);
    });
    setOrders(filteredOrders); // Update the state with filtered orders
  };

  useEffect(() => {
    if (firstLoad) {
      getAllOrders();
      setFirstLoad(false);
    }
  }, [firstLoad, getAllOrders]);

  useFocusEffect(
    useCallback(() => {
      if (!firstLoad) {
        getAllOrders();
      }
    }, [firstLoad, getAllOrders]),
  );

  const loadMoreOrders = () => {
    if (!loading) {
      setPageNo(pageNo + 1);
      setLoading(true);
    }
  };

  // const handleOrderPress = item => {
  //   if (item.packedStts === 'YET TO PACK') {
  //     setSelectedOrder(item);
  //   } else {
  //     navigation.navigate('PackingOrders', {orderId: item.orderNum});
  //   }
  // };

  const handleOrderPress = item => {
    navigation.navigate('PackingConformation', {orderId: item.orderId});
  };

  const toggleSearchInput = () => {
    setShowSearchInput(!showSearchInput);
    if (showSearchInput) {
      setSearchQuery('');
    }
  };

  const renderItem = ({item}) => {
    if (!item) return null;

    const customerTypeText =
      item.customerType === 1
        ? 'Retailer'
        : item.customerType === 2
        ? 'Distributor'
        : 'UNKNOWN';

    const getStatusColor = status => {
      switch (status.toLowerCase()) {
        case 'open':
          return 'yellow';
        case 'partially confirmed':
          return 'lightgreen';
        case 'confirmed':
          return 'darkgreen';
        case 'partially cancelled':
          return 'lightred';
        case 'cancelled':
          return 'red';
        case 'partially confirmed and partially cancelled':
          return 'orange';
        case 'fully returned':
          return '#FFC0CB';
        case 'partially returned':
          return '#FFD1DF';
        case 'delivered':
          return '#B026FF';
        case 'partially delivered':
          return '#CBC3E3';
        default:
          return 'grey'; // default color for unknown statuses
      }
    };

    return (
      <View style={style.container}>
        <TouchableOpacity
          style={style.header}
          onPress={() => handleOrderPress(item)}>
          <View style={style.ordheader}>
            <View style={style.orderidd}>
              <Text style={{color: '#000'}}>Order No : {item.orderNum}</Text>
              <Text style={{color: '#000'}}>ShipQty : {item.shipQty}</Text>
            </View>
            <View style={style.ordshpheader}>
              <Text style={{color: '#000'}}>Order Date : {item.orderDate}</Text>
              <Text style={{color: '#000'}}>Ship Date : {item.shipDate}</Text>
            </View>
            <View style={style.custtlheader}>
              <Text style={{flex: 0.9, color: '#000'}}>
                Customer Name : {item.customerName}
              </Text>
              <Text style={{color: '#000'}}>
                Customer Type: {customerTypeText}
              </Text>
            </View>
            <View style={style.PackedStatus}>
              <Text style={{fontWeight: 'bold', color: '#000', flex: 0.9}}>
                Packing status : {item.packedStts}
              </Text>
              <Text style={{color: '#000'}}>
                Total Amount : {item.totalAmount}
              </Text>
            </View>
            <View>
              <Text
                style={{
                  textAlign: 'center',
                  backgroundColor: getStatusColor(item.orderStatus),
                  padding: 5,
                  color: '#000',
                  borderRadius: 5,
                  marginHorizontal: 10,
                  fontWeight: 'bold',
                }}>
                Order Status - {item.orderStatus}
              </Text>
            </View>
          </View>
        </TouchableOpacity>
      </View>
    );
  };

  const filteredOrders =
    orders &&
    Array.isArray(orders) &&
    orders.filter(item => {
      if (!item) return false;
      const customerName = item.customerName
        ? item.customerName.toLowerCase()
        : '';
      const orderNum = item.orderNum
        ? item.orderNum.toString().toLowerCase()
        : '';
      const query = searchQuery.toLowerCase();
      return customerName.includes(query) || orderNum.includes(query);
    });

  return (
    <View style={style.container}>
      <View style={style.searchContainer}>
        <View style={style.searchInputContainer}>
          <TextInput
            style={[style.searchInput, {color: '#000'}]}
            value={searchQuery}
            onChangeText={text => {
              setSearchQuery(text);
              if (text.length === 0) {
                setHasMoreData(true);
                getAllOrders(true);
              }
            }}
            placeholder="Search"
            placeholderTextColor="#000"
          />

          <TouchableOpacity style={style.searchButton} onPress={toggleDropdown}>
            <Text style={{color: '#000'}}>
              {selectedSearchOption || 'Select'}
            </Text>
            <Image
              style={style.image}
              source={require('../../assets/dropdown.png')}
            />
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={style.searchIconContainer}
          onPress={handleSearch}>
          <Text
            style={{
              color: '#000',
              borderWidth: 1,
              paddingHorizontal: 10,
              paddingVertical: 4,
              borderRadius: 10,
            }}>
            Search
          </Text>
        </TouchableOpacity>
      </View>

      {dropdownVisible && (
        <View style={style.dropdownContent1}>
          <ScrollView>
            {searchOption.map((option, index) => (
              <TouchableOpacity
                style={style.dropdownOption}
                key={index}
                onPress={() => handleDropdownSelect(option)}>
                <Text style={{color: '#000'}}>{option.label}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}
      {loading && orders.length === 0 ? (
        <ActivityIndicator
          size="large"
          color="#390050"
          style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}
        />
      ) : filteredOrders.length === 0 ? (
        <Text style={style.noCategoriesText}>Sorry, no results found! </Text>
      ) : (
        <FlatList
          data={filteredOrders}
          renderItem={renderItem}
          keyExtractor={(item, index) =>
            item && item.orderId ? item.orderId.toString() : index.toString()
          }
          onEndReached={loadMoreOrders}
          onEndReachedThreshold={0.1}
          refreshing={refreshingOrders}
          onRefresh={() => {
            setRefreshingOrders(true);
            setPageNo(1);
            setRefreshingOrders(false);
          }}
          contentContainerStyle={{paddingBottom: 70}} // Add padding to ensure space at the bottom
        />
      )}
      {selectedOrder && (
        <Modal visible={true} transparent={true} animationType="fade">
          <View style={style.modalContainer}>
            <View style={style.modalContent}>
              <View style={style.custtlheader}>
                <Text style={{color: '#000'}}>
                  Order No : {selectedOrder.orderNum}
                </Text>
                <Text style={{color: '#000'}}>
                  TotalQty :{selectedOrder.totalQty}
                </Text>
              </View>
              <View style={style.modelordshpheader}>
                <Text style={{color: '#000'}}>
                  Order Date : {selectedOrder.orderDate}
                </Text>
                <Text style={{color: '#000'}}>
                  Ship Date : {selectedOrder.shipDate}
                </Text>
              </View>
              <View style={style.custtlheader}>
                <Text style={{flex: 0.9, color: '#000'}}>
                  Customer Name : {selectedOrder.customerName}
                </Text>
                <Text style={{color: '#000'}}>
                  Customer Type:{' '}
                  {selectedOrder.customerType === 1
                    ? 'Retailer'
                    : selectedOrder.customerType === 2
                    ? 'Distributor'
                    : 'UNKNOWN'}
                </Text>
              </View>
              <View style={style.custtlheader}>
                <Text style={{flex: 0.9, color: '#000'}}>
                  Packing status : {selectedOrder.packedStts}
                </Text>
                <Text style={{color: '#000'}}>
                  Total Amount : {selectedOrder.totalAmount}
                </Text>
              </View>
              <View style={{marginLeft: 10}}>
                <Text style={{marginTop: 5, color: '#000'}}>
                  Order Status : {selectedOrder.orderStatus}{' '}
                </Text>
              </View>
              <TouchableOpacity
                style={style.closeButton}
                onPress={() => setSelectedOrder(null)}>
                <Text style={{color: '#fff'}}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
};

const style = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
    elevation: 5,
  },
  header: {
    marginBottom: 10,
    borderWidth: 1,
    marginHorizontal: 10,
    borderRadius: 10,
  },
  ordheader: {
    marginVertical: 5,
  },
  orderidd: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: 10,
  },
  PackedStatus: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: 10,
    marginVertical: 5,
  },
  ordshpheader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: 10,
    marginVertical: 5,
  },
  modelordshpheader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: 10,
    marginVertical: 5,
  },
  custtlheader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: 10,
    marginVertical: 5,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 10,
    elevation: 5,
    width: '95%',
    padding: 5,
  },
  closeButton: {
    marginTop: 10,
    alignSelf: 'center',
    backgroundColor: '#F09120',
    padding: 10,
    borderRadius: 5,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    marginVertical: 10,
  },
  backIcon: {
    height: 25,
    width: 25,
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'lightgray',
    borderRadius: 15,
    marginHorizontal: 10,
  },
  searchInput: {
    flex: 1,
    height: 40,
    borderColor: 'gray',
    paddingHorizontal: 10,
    borderRadius: 5,
  },
  searchInputActive: {
    color: '#000',
  },
  searchButton: {
    marginLeft: 'auto',
    flexDirection: 'row',
  },
  image: {
    height: 20,
    width: 20,
    marginLeft: 10,
    marginRight: 10,
  },
  noCategoriesText: {
    top: 40,
    textAlign: 'center',
    color: '#000000',
    fontSize: 20,
    fontWeight: 'bold',
    padding: 5,
  },
  dropdownContent1: {
    elevation: 5,
    // height: 220,
    alignSelf: 'center',
    width: '90%',
    backgroundColor: '#fff',
    borderRadius: 10,
  },
  dropdownOption: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
});

export default Order;
