import {useNavigation} from '@react-navigation/native';
import React, {useEffect, useState} from 'react';
import {
  StyleSheet,
  Text,
  View,
  Image,
  TextInput,
  TouchableOpacity,
  FlatList,
  Keyboard,
  ActivityIndicator,
  RefreshControl,
  ScrollView,
} from 'react-native';
import {API} from '../../config/apiConfig';
import axios from 'axios';
import { useSelector } from 'react-redux';
import AsyncStorage from '@react-native-async-storage/async-storage';

const LocationInventory = () => {
  const navigation = useNavigation();
  const [searchQuery, setSearchQuery] = useState('');
  const [inventoryData, setInventoryData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [initialSelectedCompany, setInitialSelectedCompany] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const [searchOptions, setSearchOptions] = useState([]);
  const [selectedSearchOption, setSelectedSearchOption] = useState(null);
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [searchKey, setSearchKey] = useState(1); // Default to "Type" or any other default
  const [page, setPage] = useState(1);
  const [hasMoreData, setHasMoreData] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const [loading, setLoading] = useState(false); // Loading state for initial fetch
  const [hasMoreInventory, setHasMoreInventory] = useState(true); // To track if more inventory data is available
  const [from, setFrom] = useState(0); // Starting index for pagination
  const [to, setTo] = useState(15); // Ending index for pagination
  const [hasMoreTasks, setHasMoreTasks] = useState(true);


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

  useEffect(() => {
    getLocationInventory();
  }, []);



  const getLocationInventory = async (reset = false) => {
    if (loading || loadingMore) return; // Prevent fetching if already loading
    setLoading(reset); // Set loading state

    const fetchFrom = reset ? 0 : from; // Determine starting index based on reset
    const fetchTo = reset ? 15 : to; // Determine ending index based on reset

    const apiUrl = `${global?.userData?.productURL}${API.ADD_LOCATION_INVENTORY_LAZY}`;

    try {
      const response = await axios.post(
        apiUrl,
        {
          companyId: companyId,
          styleName: '',
          from: fetchFrom,
          to: fetchTo,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${global?.userData?.token?.access_token}`,
          },
        },
      );

      console.log('API Response:', response.data);

      // Check if the response contains an array
      const newTasks = response.data.gsCodesList;
  
      if (reset) {
        // If it's a reset (like on refresh), replace tasks
        setInventoryData(newTasks);
        setFrom(0);  // Reset 'from' to 0 after refresh
        setTo(15);   // Reset 'to' to 15 after refresh
      } else {
        // If not resetting, append new tasks to existing ones
        setInventoryData(prevTasks => [...prevTasks, ...newTasks]);
      }
  
      // If fewer than 15 items are fetched, assume no more tasks are available
      if (newTasks.length < 15) {
        setHasMoreInventory(false); // No more tasks to load
      } else {
        setHasMoreInventory(true); // There are more tasks to load
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const gettasksearch = async () => {
    const apiUrl = `${global?.userData?.productURL}${API.GET_ALL_LOCATION_INVENTORY_SEARCH}`;
    const requestBody = {
      dropdownId: searchKey,
      fieldvalue: searchQuery,
      from: 0,
      to: inventoryData.length,
      companyId: companyId,
    };

    try {
      const response = await axios.post(apiUrl, requestBody, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${global?.userData?.token?.access_token}`,
        },
      });

      if (response.data.gsCodesList) {
        setInventoryData(response.data.gsCodesList);
        setHasMoreData(false);
      } else {
        setInventoryData([]);
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
      Alert.alert(
        'Alert',
        'Please select an option from the dropdown before searching',
      );
      return; // Exit the function if no search key is selected
    }

    if (!searchQuery.trim()) {
      Alert.alert(
        'Alert',
        'Please select an option from the dropdown before searching',
      );
      return; // Exit if the search query is empty
    }

    gettasksearch(); // Call the search function if the dropdown and query are valid
  };

  const handleSearchInputChange = query => {
    setSearchQuery(query);
    if (query.trim() === '') {
      getLocationInventory(true);
    }
  };
  
  const searchOption = [
    { label: 'Location Name', value: 3 },
    { label: 'Style Name', value: 4 },
    { label: 'Size', value: 5 },
    { label: 'Type', value: 1 },
    { label: 'Customer Level', value: 2 },
    { label: 'Sku', value: 6 },

  ];
  const onRefresh = async () => {
    setRefreshing(true);
    setHasMoreInventory(true); // Reset to indicate more inventory may be available
    await getLocationInventory(true); // Fetch inventory with reset flag
    setRefreshing(false);
  };

  const loadMoreTasks = () => {
    if (!hasMoreData || loadingMore) return; 
  
    setLoadingMore(true);
    
    setFrom(prevFrom => prevFrom + 1);
    setTo(prevTo => prevTo + 15);
  
    getProductInventory(false); 
  };


  const renderItem = ({item}) => (
    <View>
      <View style={styles.inventoryItem}>
        <Text style={styles.itemText}> {item.locationName}</Text>
        <Text style={styles.itemText1}>{item.styleName}</Text>
        <Text style={styles.itemText2}>{item.sizeCode}</Text>
        <Text style={styles.itemText3}>{item.availQty}</Text>
        {/* <Text style={styles.itemText4}>{item.holdQty}</Text> */}
      </View>
      <View
        style={{borderBottomWidth: 1, borderBottomColor: 'lightgray'}}></View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
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
        <TouchableOpacity style={styles.searchIconContainer} onPress={handleSearch}>
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
      <Text style={styles.headerText}>Location Name</Text>
        <Text style={styles.headerText1}>Style Name</Text>
        <Text style={styles.headerText2}>Size</Text>
        <Text style={styles.headerText3}>Avail Qty</Text>
        {/* <Text style={styles.headerText4}>Hold Qty</Text> */}
      </View>
      {loading && !inventoryData.length ? (
        <ActivityIndicator size="large" color="#000" />
      ) : inventoryData.length === 0 ? (
        <Text style={styles.noResultsText}>No results found!</Text>
      ) : (
        <FlatList
          data={inventoryData}
          renderItem={renderItem}
          keyExtractor={(item, index) => `${item.id}-${index}`}
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
      )}
    </View>
  );
  
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
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
    paddingHorizontal: 10,
  },
  searchIconContainer: {
    padding: 10,
  },
  searchIcon: {
    height: 20,
    width: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    paddingVertical: 10,
    backgroundColor: '#f0f0f0',
  },
  headerText: {
    flex: 1.2,
    textAlign: 'center',
    color:"#000"
  },
  headerText1: {
    flex: 2,
    textAlign: 'center',
    color:"#000"
  },
  headerText2: {
    flex: 1,
    textAlign: 'center',
    color:"#000"
  },
  headerText3: {
    flex: 1,
    textAlign: 'center',
    color:"#000"
  },
  noResultsText: {
    top: 40,
    textAlign: 'center',
    color: '#000000',
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
    padding: 5,
  },
  headerText4: {
    flex: 1,
    textAlign: 'center',
  },
  listContainer: {
    paddingHorizontal: 20,
  },
  inventoryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
  },
  itemText: {
    flex: 1.2,
    textAlign: 'center',
    color:"#000"
  },
  itemText1: {
    flex: 2,
    textAlign: 'center',
    marginLeft:10,
    color:"#000"
  },
  itemText2: {
    flex: 1,
    textAlign: 'center',
    color:"#000"
  },
  itemText3: {
    flex: 1,
    textAlign: 'center',
    color:"#000"
  },
  itemText4: {
    flex: 1,
    textAlign: 'center',
    color:"#000"
  },
  noCategoriesText:{
    top: 40,
    textAlign:"center",
    color: '#000000',
    fontSize: 20,
    fontWeight: 'bold',
    padding: 5,
  },
  searchButton: {
    marginLeft: 'auto',
    flexDirection: 'row',
  },
  image: {
    height: 20,
    width: 20,
    marginLeft: 10,
    marginRight:10
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

export default LocationInventory;
