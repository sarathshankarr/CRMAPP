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
  const [loading, setLoading] = useState(true);
  const [initialSelectedCompany, setInitialSelectedCompany] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const [searchOptions, setSearchOptions] = useState([]);
  const [selectedSearchOption, setSelectedSearchOption] = useState(null);
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [searchKey, setSearchKey] = useState(1); // Default to "Type" or any other default
  const [page, setPage] = useState(1);
  const [hasMoreData, setHasMoreData] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);


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

  const getLocationInventory = async () => {
    const apiUrl = `${global?.userData?.productURL}${API.ADD_LOCATION_INVENTORY_LAZY}`;
    try {
      setLoading(true);
      const response = await axios.post(
        apiUrl,
        {
            companyId: companyId,
          styleName:"",
          from:(page - 1) * 100,
          to:100
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${global?.userData?.token?.access_token}`,
          },
        },
      );
      setInventoryData(response.data.gsCodesList);
      setFilteredData(response.data.gsCodesList); // Initialize filtered data
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const getProductLocationInventorySearch = async (initialLoad = false) => {
    if (loading || !hasMoreData) return;
  
    initialLoad ? setLoading(true) : setLoadingMore(true);
    
    const apiUrl = `${global?.userData?.productURL}${API.GET_ALL_LOCATION_INVENTORY_SEARCH}`;
    const requestBody = {
      dropdownId: searchKey,
      fieldvalue: searchQuery,
      from: (page - 1) * 100,
      to: 100,
      companyId: companyId,
    };
  
    try {
      const response = await axios.post(apiUrl, requestBody, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${global?.userData?.token?.access_token}`,
        },
      });
      const fetchedData = response.data.gsCodesList.filter(item => item !== null);
      if (initialLoad) {
        setInventoryData(fetchedData);
      } else {
        setInventoryData(prevData => [...prevData, ...fetchedData]);
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
    getProductLocationInventorySearch(true);
  };
  
  const searchOption = [
    { label: 'Location Name', value: 3 },
    { label: 'Style Name', value: 4 },
    { label: 'Size', value: 5 },
    { label: 'Type', value: 1 },
    { label: 'Customer Level', value: 2 },
    { label: 'Sku', value: 5 },

  ];

  
  const handleSearch = () => {
    setPage(1);
    setHasMoreData(true);
    getProductLocationInventorySearch(true);
  };
  

  const onChangeText = text => {
    setSearchQuery(text);
    if (text) {
      const newData = inventoryData.filter(item => {
        const itemData = `${item.locationName.toUpperCase()} ${item.styleName.toUpperCase()} ${item.sizeCode.toUpperCase()}`;
        const textData = text.toUpperCase();
        return itemData.indexOf(textData) > -1;
      });
      setFilteredData(newData);
    } else {
      setFilteredData(inventoryData);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await getLocationInventory();
    setRefreshing(false);
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
            style={[styles.searchInput, { color: '#000' }]}
            value={searchQuery}
            onChangeText={text => {
              setSearchQuery(text);
              if (text.length === 0) {
                setHasMoreData(true);
                getLocationInventory(true);
              }
            }}
            placeholder="Search"
            placeholderTextColor="#000"
          />
           <TouchableOpacity
            style={styles.searchButton}
            onPress={toggleDropdown}>
          <Text style={{color:"#000"}}>{selectedSearchOption || 'Select'}</Text>
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
              <TouchableOpacity style={styles.dropdownOption} key={index} onPress={() => handleDropdownSelect(option)}>
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
          keyExtractor={(item, index) => index.toString()}
          onEndReached={() => {
            if (hasMoreData) {
              setPage(prevPage => prevPage + 1);
              getProductLocationInventorySearch();
            }
          }}
          onEndReachedThreshold={0.5}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
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
