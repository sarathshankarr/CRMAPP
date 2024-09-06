import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, FlatList, TouchableOpacity, ActivityIndicator, RefreshControl, Image, TextInput } from 'react-native';
import { API } from '../../config/apiConfig';
import axios from 'axios';
import { useSelector } from 'react-redux';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';

const DistributorGrn = () => {
  const navigation = useNavigation();
  const [initialSelectedCompany, setInitialSelectedCompany] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchInput, setShowSearchInput] = useState(false);



  const selectedCompany = useSelector(state => state.selectedCompany);

  useEffect(() => {
    const fetchInitialSelectedCompany = async () => {
      try {
        const initialCompanyData = await AsyncStorage.getItem('initialSelectedCompany');
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

  const companyId = selectedCompany ? selectedCompany.id : initialSelectedCompany?.id;

  useEffect(() => {
    if (companyId) {
      getDistributorGrn();
    }
  }, [companyId]);

  const getDistributorGrn = async () => {
    setLoading(true);
    const apiUrl = `${global?.userData?.productURL}${API.GET_DISTRIBUTOR_GRN}/${companyId}`;
    try {
      const response = await axios.get(apiUrl, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${global?.userData?.token?.access_token}`,
        },
      });
      if (response.data.status.success) {
        const filteredOrders = response.data.response.ordersList.filter(order => order !== null);
        setOrders(filteredOrders);
      } else {
        // console.error('Failed to fetch orders:', response.data.status);
      }
    } catch (error) {
      // console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await getDistributorGrn();
    setRefreshing(false);
  };

  const gotoDistributorOrder = (orderId) => {
    navigation.navigate("DistributorOrder", { orderId });
  };

  const renderOrderItem = ({ item }) => {
    if (!item) return null;

    return (
      <TouchableOpacity onPress={() => gotoDistributorOrder(item.orderId)} style={styles.orderItem}>
        <Text style={styles.orderIdText}>{item.orderNum}</Text>
        <Text style={styles.customerText}>{item.customerName}</Text>
        <Text style={styles.qtyText}>{item.shipQty || 0}</Text>
        <Text style={styles.statusText}>{item.orderStatus}</Text>
        <Text style={styles.dateText}>{item.orderDate}</Text>
      </TouchableOpacity>
    );
  };

  const toggleSearchInput = () => {
    setShowSearchInput(!showSearchInput);
    if (showSearchInput) {
      setSearchQuery('');
    }
  };

  const filteredOrdersList=orders.filter(item => {
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
    <View style={styles.container}>
       <View style={styles.searchContainer}>
        <TextInput
          style={[
            styles.searchInput,
            searchQuery.length > 0 && styles.searchInputActive,
          ]}
          autoFocus={false}
          value={searchQuery}
          onChangeText={text => setSearchQuery(text)}
          placeholder="Search"
          placeholderTextColor="#000"
        />

        <TouchableOpacity
          style={styles.searchButton}
          onPress={toggleSearchInput}>
          <Image
            style={styles.image}
            source={
              showSearchInput
                ? require('../../../assets/close.png')
                : require('../../../assets/search.png')
            }
          />
        </TouchableOpacity>
      </View>
     
      <View style={styles.header}>
        <Text style={styles.orderIdText}>Id</Text>
        <Text style={styles.customerText}>Customer</Text>
        <Text style={styles.qtyText}>Total Qty</Text>
        <Text style={styles.statusText}>Status</Text>
        <Text style={styles.dateText}>Order Date</Text>
      </View>
      {loading ? (
        <ActivityIndicator size="large" color="#0000ff" style={styles.activityIndicator} />
      ) : filteredOrdersList.length === 0 ? (
        <Text style={styles.noResultsText}>Sorry, no results found!</Text>
      ) : (
        <FlatList
          data={filteredOrdersList}
          renderItem={renderOrderItem}
          keyExtractor={(item, index) => item ? item.orderId.toString() : index.toString()}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    paddingVertical: 10,
    backgroundColor: '#f0f0f0',
  },
  orderItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  orderIdText: {
    flex: 0.8,
    color:"#000"
  },
  customerText: {
    flex: 1.5,
    color:"#000"
  },
  qtyText: {
    flex: 0.9,
    textAlign: 'center',
    color:"#000"
  },
  statusText: {
    flex: 1.4,
    marginLeft: 10,
    color:"#000"
  },
  dateText: {
    flex: 1.5,
    textAlign: 'center',
    color:"#000"
  },
  activityIndicator: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noResultsText: {
    textAlign: 'center',
    color: '#000000',
    fontSize: 20,
    fontWeight: 'bold',
    padding: 20,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginTop: 5,
    marginBottom: 10,
    // borderWidth:1,
    borderRadius: 30,
    marginHorizontal: 10,
    // backgroundColor:'#f1e8e6',
    backgroundColor: 'white',
    elevation: 5,
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
  },
  image: {
    height: 30,
    width: 30,
  },
});

export default DistributorGrn;
