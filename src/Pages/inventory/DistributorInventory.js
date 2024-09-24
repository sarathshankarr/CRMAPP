import React, {useEffect, useState} from 'react';
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Image,
  TextInput,
  ScrollView,
  Alert,
} from 'react-native';
import {API} from '../../config/apiConfig';
import axios from 'axios';
import {useSelector} from 'react-redux';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useNavigation} from '@react-navigation/native';

const DistributorInventory = () => {
  const navigation = useNavigation();
  const [initialSelectedCompany, setInitialSelectedCompany] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchInput, setShowSearchInput] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState(null);
  const [dropdownId, setDropdownId] = useState(null);

  const selectedCompany = useSelector(state => state.selectedCompany);

  const [hasMoreData, setHasMoreData] = useState(true);

  const [from, setFrom] = useState(0);
  const [to, setTo] = useState(15);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMoreTasks, setHasMoreTasks] = useState(true);

  const [searchKey, setSearchKey] = useState(null);
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [selectedSearchOption, setSelectedSearchOption] = useState(null);

  useEffect(() => {
    const fetchInitialSelectedCompany = async () => {
      try {
        const initialCompanyData = await AsyncStorage.getItem(
          'initialSelectedCompany',
        );
        if (initialCompanyData) {
          setInitialSelectedCompany(JSON.parse(initialCompanyData));
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
    getDistributorInventory();
  }, []);

  const getDistributorInventory = async (reset = false) => {
    if (loading || loadingMore) return;
    setLoading(reset);

    const fetchFrom = reset ? 0 : from;
    const fetchTo = reset ? 15 : to;

    const apiUrl = `${global?.userData?.productURL}${API.GET_DISTRIBUTOR_INVENTORY}/${fetchFrom}/${fetchTo}/${companyId}`;

    try {
      const response = await axios.get(apiUrl, {
        headers: {
          Authorization: `Bearer ${global?.userData?.token?.access_token}`,
        },
      });

      const newTasks = response.data.response.ordersList;

      if (reset) {
        // If it's a reset (like on refresh), replace tasks
        setOrders(newTasks);
        setFrom(0); // Reset 'from' to 0 after refresh
        setTo(15); // Reset 'to' to 15 after refresh
      } else {
        // If not resetting, append new tasks to existing ones
        setOrders(prevTasks => [...prevTasks, ...newTasks]);
      }

      // If fewer than 15 items are fetched, assume no more tasks are available
      if (newTasks.length < 15) {
        setHasMoreData(false); // No more tasks to load
      } else {
        setHasMoreData(true); // There are more tasks to load
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const loadMoreTasks = () => {
    if (!hasMoreData || loadingMore) return;

    setLoadingMore(true);

    setFrom(prevFrom => prevFrom + 1);
    setTo(prevTo => prevTo + 15);

    getDistributorInventory(false);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    setHasMoreData(true);
    await fetchTasks(true);
    setRefreshing(false);
  };

  const gettasksearch = async () => {
    const apiUrl = `${global?.userData?.productURL}${API.GET_DISTRIBUTOR_INVENTORY_SEARCH}`;
    const requestBody = {
      dropdownId: searchKey,
      fieldvalue: searchQuery,
      from: 0,
      to: orders.length,
      companyId: companyId,
    };
    console.log(requestBody);
    try {
      const response = await axios.post(apiUrl, requestBody, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${global?.userData?.token?.access_token}`,
        },
      });

      if (response.data.response.ordersList) {
        setOrders(response.data.response.ordersList);
        setHasMoreData(false);
      } else {
        setOrders([]);
      }
    } catch (error) {
      console.error('Error fetching tasks:', error);
    }
  };

  const handleDropdownSelect = option => {
    setSelectedSearchOption(option.label);
    setSearchKey(option.value);
    setDropdownVisible(false);
  };

  const toggleDropdown = () => {
    setDropdownVisible(!dropdownVisible);
  };

  const handleSearch = () => {
    if (!searchKey) {
      Alert.alert('Alert', 'Please select an option from the dropdown before searching');
      return; // Exit the function if no search key is selected
    }
    
    if (!searchQuery.trim()) {
      Alert.alert('Alert', 'Please select an option from the dropdown before searching');
      return; // Exit if the search query is empty
    }
  
    gettasksearch(); // Call the search function if the dropdown and query are valid
  };
  
  const handleSearchInputChange = query => {
    setSearchQuery(query);
      if (query.trim() === '') {
      getDistributorInventory(true); 
    }
  };

  const searchOption = [
    {label: 'Distributor Name', value: 3},
    {label: 'Location', value: 4},
    {label: 'Style', value: 5},
    {label: 'Size', value: 6},
    {label: 'Type', value: 1},
    {label: 'Customer Level', value: 2},
  ];

  const renderOrderItem = ({item}) => {
    if (!item) return null;
    return (
      <TouchableOpacity style={styles.orderItem}>
        <Text style={styles.orderIdText}>{item.distributorName}</Text>
        <Text style={styles.customerText}>{item.shippingLocality}</Text>
        <Text style={styles.qtyText}>{item.styleName}</Text>
        <Text style={styles.dateText}>{item.size}</Text>
        <Text style={styles.dateText}>{item.availQty}</Text>
      </TouchableOpacity>
    );
  };


  return (
    <View style={styles.container}>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginHorizontal: 10,
        }}>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            flex: 1, // Ensures this view takes up available space
            paddingHorizontal: 20,
            marginTop: 5,
            marginBottom: 10,
            borderRadius: 30,
            backgroundColor: 'white',
            elevation: 5,
            marginRight: 10, // Adds space between the input and button
          }}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search"
            placeholderTextColor="#000"
            value={searchQuery}
            onChangeText={handleSearchInputChange}
          />
          <TouchableOpacity
            style={styles.searchButton}
            onPress={toggleDropdown}>
            <Text style={{color: '#000'}}>
              {selectedSearchOption || 'Select'}
            </Text>
            <Image
              style={styles.image}
              source={require('../../../assets/dropdown.png')}
            />
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
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
        <View style={styles.dropdownContent1}>
          <ScrollView>
            {searchOption.map((option, index) => (
              <TouchableOpacity
                style={styles.dropdownOption}
                key={index}
                onPress={() => handleDropdownSelect(option)}>
                <Text style={{color: '#000'}}>{option.label}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}
      <View style={styles.header}>
        <Text style={styles.orderIdText}>Distributor Name</Text>
        <Text style={styles.customerText}>Location</Text>
        <Text style={styles.qtyText}>Style</Text>
        <Text style={styles.dateText}>Size</Text>
        <Text style={styles.dateText}>Avail Qty</Text>
      </View>

    
        <FlatList
          data={orders}
          renderItem={renderOrderItem}
          keyExtractor={(item, index) => index.toString()}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          onEndReached={loadMoreTasks} // Load more when scrolled to the end
          onEndReachedThreshold={0.2} // Adjust this value to control when to load more
          ListFooterComponent={
            loadingMore ? (
              <ActivityIndicator size="small" color="#0000ff" />
            ) : null
          }
        />


      {loadingMore && !hasMoreData && (
        <ActivityIndicator size="large" color="#000" />
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
    flex: 1.8,
    color: '#000',
  },
  customerText: {
    flex: 1.3,
    color: '#000',
  },
  qtyText: {
    flex: 1.5,
    textAlign: 'center',
    color: '#000',
  },
  statusText: {
    flex: 1,
    marginLeft: 10,
    color: '#000',
  },
  dateText: {
    flex: 1,
    textAlign: 'center',
    color: '#000',
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
  noCategoriesText: {
    top: 40,
    textAlign: 'center',
    color: '#000000',
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
    padding: 5,
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
    flexDirection: 'row',
  },
  image: {
    height: 20,
    width: 20,
    marginLeft: 10,
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

export default DistributorInventory;
