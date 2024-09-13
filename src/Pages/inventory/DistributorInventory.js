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
  const [loadingMore, setLoadingMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchInput, setShowSearchInput] = useState(false);
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState(null);
  const [dropdownId, setDropdownId] = useState(null);

  const selectedCompany = useSelector(state => state.selectedCompany);
  const [from, setFrom] = useState(1);
  const [to, setTo] = useState(100);
  const [hasMoreData, setHasMoreData] = useState(true);

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
    if (companyId) {
      getDistributorInventory(1, to, true);
    }
  }, [companyId]);

  const getDistributorInventory = async (
    startPage,
    pageSize,
    initialLoad = false,
  ) => {
    if (loading || loadingMore || !hasMoreData) return;

    initialLoad ? setLoading(true) : setLoadingMore(true);
    const apiUrl = `${global?.userData?.productURL}${API.GET_DISTRIBUTOR_INVENTORY}/${startPage}/${pageSize}/${companyId}`;

    try {
      const response = await axios.get(apiUrl, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${global?.userData?.token?.access_token}`,
        },
      });

      if (response.data.status.success) {
        const fetchedOrders = response.data.response.ordersList.filter(
          order => order !== null,
        );
        if (initialLoad) {
          setOrders(fetchedOrders);
        } else {
          setOrders(prevOrders => [...prevOrders, ...fetchedOrders]);
        }
        setHasMoreData(fetchedOrders.length >= pageSize);
      } else {
        console.error('Failed to fetch orders:', response.data.status);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const getDistributorInventorySearch = async (
    startPage,
    pageSize,
    initialLoad = false,
    dropdownId,
  ) => {
    if (loading || loadingMore || !hasMoreData) return;

    initialLoad ? setLoading(true) : setLoadingMore(true);

    const apiUrl = `${global?.userData?.productURL}${API.GET_DISTRIBUTOR_INVENTORY_SEARCH}`;
    const requestBody = {
      dropdownId: dropdownId,
      fieldvalue: searchQuery,
      from: startPage,
      to: pageSize,
      companyId: companyId,
    };

    try {
      const response = await axios.post(apiUrl, requestBody, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${global?.userData?.token?.access_token}`,
        },
      });

      if (response.data.status.success) {
        const fetchedOrders = response.data.response.ordersList.filter(
          order => order !== null,
        );
        if (initialLoad) {
          setOrders(fetchedOrders);
        } else {
          setOrders(prevOrders => [...prevOrders, ...fetchedOrders]);
        }
        setHasMoreData(fetchedOrders.length >= pageSize);
      } else {
        console.error('Failed to fetch orders:', response.data.status);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    setFrom(1);
    setHasMoreData(true);
    await getDistributorInventory(1, to, true);
    await getDistributorInventorySearch(1, to, true, dropdownId);
    setRefreshing(false);
  };

  const loadMoreData = () => {
    if (!loadingMore && hasMoreData) {
      const nextPage = from + 1;
      setFrom(nextPage);
      getDistributorInventory(nextPage, to);
      getDistributorInventorySearch(nextPage, to, false, dropdownId);
    }
  };

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

  const toggleDropdown = () => {
    setDropdownVisible(!dropdownVisible);
  };

  const handleDropdownSelectStatus = option => {
    setSelectedStatus(option.label);
    setDropdownId(option.value);
    setDropdownVisible(false);
    setSearchQuery(''); // Reset search query if needed
    setFrom(1); // Reset pagination
    setHasMoreData(true); // Reset data availability flag

    // Call getDistributorInventory and getDistributorInventorySearch
    getDistributorInventory(1, to, true); // Fetch data based on new dropdown selection
    getDistributorInventorySearch(1, to, true, option.value); // Fetch data based on search criteria
  };

  const statusOptions = [
    {label: 'Distributor Name', value: 3},
    {label: 'Location', value: 4},
    {label: 'Style', value: 5},
    {label: 'Size', value: 6},
    {label: 'Type', value: 1},
    {label: 'Customer Level', value: 2},
  ];

  const handleSearch = () => {
    console.log('Handling search with query:', searchQuery);
    getDistributorInventorySearch(1, to, true, dropdownId);
    setFrom(1);
    setHasMoreData(true);
  };

  const filteredOrdersList = orders.filter(item => {
    if (!item) return false;
    const distributorName = item.distributorName
      ? item.distributorName.toLowerCase()
      : '';
    const shippingLocality = item.shippingLocality
      ? item.shippingLocality.toString().toLowerCase()
      : '';
    const styleName = item.styleName
      ? item.styleName.toString().toLowerCase()
      : '';
    const size = item.size ? item.size.toString().toLowerCase() : '';
    const query = searchQuery.toLowerCase();
    return (
      distributorName.includes(query) ||
      shippingLocality.includes(query) ||
      styleName.includes(query) ||
      size.includes(query)
    );
  });


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
            style={[
              styles.searchInput,
              searchQuery.length > 0 && styles.searchInputActive,
            ]}
            value={searchQuery}
            onChangeText={text => {
              setSearchQuery(text);
              if (text.length === 0) {
                // Call getDistributorInventory when searchQuery is cleared
                setFrom(1);
                setHasMoreData(true);
                getDistributorInventory(1, to, true);
              }
            }}
            placeholder="Search"
            placeholderTextColor="#000"
          />

          <TouchableOpacity
            style={styles.searchButton}
            onPress={toggleDropdown}>
            <Text style={{color: '#000'}}>{selectedStatus || 'Select'}</Text>
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
          <ScrollView style={styles.scrollView} nestedScrollEnabled={true}>
            {statusOptions.map((option, index) => (
              <TouchableOpacity
                key={index}
                style={styles.dropdownOption}
                onPress={() => handleDropdownSelectStatus(option)}>
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

      {loading && !orders.length ? (
        <ActivityIndicator size="large" color="#000" />
      ) : orders.length === 0 && filteredOrdersList === 0 ? (
        <Text style={styles.noResultsText}>Sorry, no results found!</Text>
      ) : (
        <FlatList
          data={orders && filteredOrdersList}
          renderItem={renderOrderItem}
          keyExtractor={(item, index) => index.toString()}
          onEndReached={loadMoreData}
          onEndReachedThreshold={0.5}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        />
      )}

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
