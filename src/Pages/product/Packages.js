import React, {useEffect, useState} from 'react';
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  Image,
  ActivityIndicator,
  TextInput,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import {API} from '../../config/apiConfig';
import {useSelector} from 'react-redux';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import {debounce} from 'lodash';

const Packages = ({navigation}) => {
  const selectedCompany = useSelector(state => state.selectedCompany);
  const [initialSelectedCompany, setInitialSelectedCompany] = useState(null);
  const [packagesList, setPackagesList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [stylesData, setStylesData] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchOptions, setSearchOptions] = useState([]);
  const [selectedSearchOption, setSelectedSearchOption] = useState(null);
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [searchKey, setSearchKey] = useState(1); // Default to "Type" or any other default
  const [page, setPage] = useState(1);
  const [hasMoreData, setHasMoreData] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const companyId = selectedCompany
    ? selectedCompany.id
    : initialSelectedCompany?.id;

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

  useEffect(() => {
    if (companyId) {
      getAllPackages(companyId);
    }
  }, [companyId]);

  const getAllPackages = async (companyId, page = 0, limit = 100) => {
    setLoading(true);
    const apiUrl = `${global?.userData?.productURL}${API.GET_PACKAGES}/${page}/${limit}/${companyId}`;
    try {
      const response = await axios.get(apiUrl, {
        headers: {
          Authorization: `Bearer ${global?.userData?.token?.access_token}`,
        },
      });
      if (response.data?.status?.success) {
        setStylesData(prevData => [
          ...prevData, 
          ...(response.data?.response?.packagesList || [])
        ]);
        // Handle pagination if fewer items were fetched than limit
        setHasMoreData(response.data?.response?.packagesList.length >= limit);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const getProductLocationInventorySearch = async (initialLoad = false) => {
    if (loading || !hasMoreData) return;

    initialLoad ? setLoading(true) : setLoadingMore(true);

    const apiUrl = `${global?.userData?.productURL}${API.GET_PACKAGES_SERACH}`;
    const requestBody = {
      dropdownId: searchKey,
      fieldvalue: searchQuery,
      from: 0,
      to: 1000,
      companyId: companyId,
    };

    try {
      const response = await axios.post(apiUrl, requestBody, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${global?.userData?.token?.access_token}`,
        },
      });

      if (
        response.data &&
        Array.isArray(response.data.response?.packagesList) &&
        response.data.response.packagesList.length > 0
      ) {
        const fetchedData = response.data.response.packagesList.filter(
          item => item !== null,
        );

        if (initialLoad) {
          setStylesData(fetchedData);
        } else {
          setStylesData(prevData => [...prevData, ...fetchedData]);
        }

        setHasMoreData(fetchedData.length >= 100);
      } else {
        console.error('No valid data received from API or stylesList is empty');
      }
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
    getAllPackages(companyId);
  };

  const searchOption = [
    {label: 'Package Name', value: 1},
    {label: 'Dealer Price', value: 2},
    {label: 'Retailer Price', value: 3},
    {label: 'MRP', value: 4},
  ];

  const handleSearch = () => {
    setPage(1);
    setHasMoreData(true);
    getProductLocationInventorySearch(true);
  };

  const debouncedSearch = debounce(() => {
    setPage(1);
    setHasMoreData(true);
    getProductLocationInventorySearch(true);
  }, 300); // Adjust the debounce delay as needed

  useEffect(() => {
    debouncedSearch();
  }, [searchQuery, searchKey]);

  const renderProductItem = ({item}) => {
    const {packageName, imageUrls, packageId} = item;
  
    return (
      <TouchableOpacity
        style={styles.productItem}
        onPress={() => {
          navigation.navigate('PackageDetail', {
            packageId: packageId,
            packageDetails: item, // Pass package details
          });
        }}>
        <View style={styles.productImageContainer}>
          {imageUrls && imageUrls.length > 0 ? (
            <Image style={styles.productImage} source={{uri: imageUrls[0]}} />
          ) : (
            <Image
              style={styles.productImage}
              resizeMode="contain"
              source={require('../../../assets/NewNoImage.jpg')}
            />
          )}
          {/* Overlay Text */}
          <View style={styles.packageNameOverlay}>
            <Text style={styles.packageNameText}>{packageName}</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };
  

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <TextInput
          style={[styles.searchInput, {color: '#000'}]}
          value={searchQuery}
          onChangeText={text => {
            setSearchQuery(text);
            if (text.length === 0) {
              setHasMoreData(true);
              getAllPackages(companyId);
            }
          }}
          placeholder="Search"
          placeholderTextColor="#000"
        />
        <TouchableOpacity style={styles.searchButton} onPress={toggleDropdown}>
          <Text style={{color: '#000'}}>
            {selectedSearchOption || 'Select'}
          </Text>
          <Image
            style={styles.image}
            source={require('../../../assets/dropdown.png')}
          />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.searchIconContainer}
          onPress={handleSearch}>
          <Image
            style={styles.imagee}
            source={require('../../../assets/search.png')}
          />
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
      {loading ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : (
        <FlatList
        data={stylesData}
        renderItem={renderProductItem}
        keyExtractor={item => item.packageId.toString()}
        numColumns={2}
        columnWrapperStyle={styles.row}
        onEndReachedThreshold={0.5}
        onEndReached={() => {
          if (hasMoreData && !loadingMore) {
            setPage(prevPage => prevPage + 1);
            getAllPackages(companyId, page + 1);
          }
        }}
        initialNumToRender={10}
        windowSize={5}
        maxToRenderPerBatch={10}
      />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: 10,
  },
  row: {
    justifyContent: 'space-around',
  },
  productItem: {
    flex: 1,
    margin: 5,
    alignItems: 'center',
  },
  productImageContainer: {
    width: '100%',
    height: 200,
    resizeMode: 'cover',
    position: 'relative', // Add relative positioning for the overlay
  },
  productImage: {
    width: '100%',
    height: '100%',
  },
  packageNameOverlay: {
    position: 'absolute', // Position the text overlay
    bottom: 0, // Align to the bottom of the image
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // Semi-transparent background
    padding: 5,
  },
  packageNameText: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 10,
    marginVertical: 10,
    backgroundColor: '#f9f9f9',
  },
  searchInput: {
    flex: 1,
    borderColor: 'gray',
    textAlign: 'left',
    paddingVertical: 5,
  },
  searchButton: {
    padding: 5,
    alignItems: 'center',
    flexDirection: 'row',
    alignItems: 'center',
  },
  image: {
    height: 18,
    width: 18,
    marginLeft: 5,
  },
  imagee: {
    height: 25,
    width: 25,
    marginLeft: 10,
  },
  dropdownContent1: {
    elevation: 5,
    alignSelf: 'center',
    width: '90%',
    backgroundColor: '#fff',
    borderRadius: 10,
    marginTop: 5,
  },
  dropdownOption: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
});

export default Packages;
