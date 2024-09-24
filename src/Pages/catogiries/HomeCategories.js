import React, { useState, useEffect, useCallback } from 'react';
import {
  Text,
  View,
  Image,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  BackHandler,
  Alert,
  RefreshControl,
  ScrollView,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSelector } from 'react-redux';
import { API } from '../../config/apiConfig';
import axios from 'axios';

const HomeCategories = ({ navigation }) => {
  const [selectedDetails, setSelectedDetails] = useState([]);
  const [showSearchInput, setShowSearchInput] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [initialSelectedCompany, setInitialSelectedCompany] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  // const [from, setFrom] = useState(1);
  // const [to, setTo] = useState(15);
  const [pageFrom, setPageFrom] = useState(0);
  const [pageTo, setPageTo] = useState(15);
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [selectedSearchOption, setSelectedSearchOption] = useState('');
  const [searchKey, setSearchKey] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [categories, setCategories] = useState([]);
  const [searchFlag, setsearchFlag] = useState(false);

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
    if (companyId) {
      fetchCategories(companyId, 0, 15, true);
    }
  }, [companyId]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setSearchQuery("");
    fetchCategories(companyId, 0, 15, true);
    setSelectedSearchOption('');
    setPageFrom(0);
    setPageTo(15);
    setsearchFlag(false);
    setSearchKey(0);
  }, [companyId]);

  const fetchCategories = (companyId, from, to, reset = false) => {
    if (!companyId || !hasMore) return;

    console.log("fetchCategories", from, to);


    setLoading(true);
    const apiUrl = `${global?.userData?.productURL}${API.ALL_CATEGORIES_LL_LIST}/${from}/${to}/${companyId}`;
    axios
      .get(apiUrl, {
        headers: {
          Authorization: `Bearer ${global?.userData?.token?.access_token}`,
        },
      })
      .then((response) => {
        const fetchedData = response?.data || [];
        setCategories((prevDetails) =>
          reset ? fetchedData : [...prevDetails, ...fetchedData]
        );
        setHasMore(fetchedData.length > 0); // Set hasMore based on returned data
      })
      .catch((error) => {
        console.error('Error:', error);
      })
      .finally(() => {
        setLoading(false);
        setRefreshing(false);
      });
  };

  const searchAPI = async (from = 0, to = 15, reset = false) => {
    if (!companyId || searchQuery.trim().length === 0) {
      return;
    }

    const apiUrl = `${global?.userData?.productURL}${API.SEARCH_ALL_CATEGORIES_LL}`;
    const requestBody = {
      fieldvalue: searchQuery,
      from: from,
      to: to,
      dropdownId :searchKey,
      companyId: companyId,
    };

    console.log("searchAPI", requestBody);
    try {
      setLoading(true);
      const response = await axios.post(apiUrl, requestBody, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${global?.userData?.token?.access_token}`,
        },
      });

      console.log("response data==> ", response?.data);
      const fetchedData = response?.data || [];
      setCategories((prevDetails) =>
        reset ? fetchedData : [...prevDetails, ...fetchedData]
      );
      setHasMore(fetchedData.length > 0);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    if(searchKey === 0){
      Alert.alert('Please select an option from the dropdown before searching.');
      return;
    }

    if(searchQuery?.trim()?.length===0) {
      console.log("empty string");
      return;
    }

    setPageFrom(0);
    setPageTo(15);
    setsearchFlag(true);
    searchAPI(0, 15, true);
  };

  const handleLoadMore = () => {
    if (!loading && hasMore) {
      const newFrom = pageTo + 1;
      const newTo = pageTo + 15;

      console.log("handleLoadMore", newFrom, newTo);

      if (searchFlag) {
        searchAPI(newFrom, newTo);
      } else {
        fetchCategories(companyId, newFrom, newTo);
      }
      setPageFrom(newFrom);
      setPageTo(newTo);
    }
  };


  const onChangeText = text => {
    setSearchQuery(text);
  };

  const renderProductItem = ({ item }) => {
    const { category, imageUrls } = item;

    return (
      <TouchableOpacity
        style={styles.productItem}
        onPress={() => {
          navigation.navigate('AllCategoriesListed', {
            item,
            categoryId: item.categoryId,
            categoryDesc: category, // Pass the category description
          });
        }}>
        <View style={styles.productImageContainer}>
          {imageUrls && imageUrls.length > 0 ? (
            <Image style={styles.productImage} source={{ uri: imageUrls[0] }} />
          ) : (
            <Image
              style={styles.productImage}
              resizeMode="contain"
              source={require('../../../assets/NewNoImage.jpg')}
            />
          )}
          <View
            style={{
              borderColor: '#000',
              backgroundColor: '#fff',
            }}>
            <Text
              style={[
                styles.productName,
                {
                  backgroundColor: 'rgba(0, 0, 0, 0.3)',
                },
              ]}>
              {category}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };


  const searchOption = [
    { label: 'Select', value: 0 },
    { label: 'Category', value: 1 },
    { label: 'Category Desc.', value: 2 },
  ];

  const toggleDropdown = () => {
    setDropdownVisible(!dropdownVisible);
  };

  const handleDropdownSelect = option => {
    setSelectedSearchOption(option.label);
    setSearchKey(option.value);
    setDropdownVisible(false);
    console.log("handleDropdownSelect");
  };

  const handleSearchInputChange = query => {
    setSearchQuery(query);
      if (query.trim() === '') {
      onRefresh(); 
    }
  };

  return (
    <View style={styles.container}>


      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 10, marginVertical: 10 }}>
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            value={searchQuery}
            onChangeText={handleSearchInputChange}
            placeholder="Search"
            placeholderTextColor="#888"
          />
          <TouchableOpacity style={styles.dropdownButton} onPress={toggleDropdown}>
            <Text style={{ color: "#000", marginRight: 5 }}>
              {searchKey ? selectedSearchOption : 'Select'}
            </Text>
            <Image
              style={styles.dropdownIcon}
              source={require('../../../assets/dropdown.png')}
            />
          </TouchableOpacity>
        </View>
        <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
          <Text style={styles.searchButtonText}>Search</Text>
        </TouchableOpacity>
      </View>

      {dropdownVisible && (
        <View style={styles.dropdownContent1}>
          <ScrollView>
            {searchOption.map((option, index) => (
              <TouchableOpacity style={styles.dropdownOption} key={`${option.value}_${index}`} onPress={() => handleDropdownSelect(option)}>
                <Text style={{ color: '#000' }}>{option.label}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      {loading && !refreshing ? (
        <ActivityIndicator size="large" color="#390050" />
      ) : categories.length === 0 ? (
        <Text style={styles.noCategoriesText}>Sorry, no results found!</Text>
      ) : (
        <FlatList
          data={categories}
          renderItem={renderProductItem}
          keyExtractor={(item, index) => index.toString()}
          numColumns={2}
          contentContainerStyle={styles.productList}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.2}
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
    flex: 1,
    backgroundColor: '#faf7f6',
  },
  // searchContainer: {
  //   // flexDirection: 'row',
  //   // alignItems: 'center',
  //   // paddingHorizontal: 20,
  //   // marginTop: 5,
  //   // borderWidth:1,
  //   // flexDirection: 'row',
  //   // alignItems: 'center',
  //   // paddingHorizontal: 20,
  //   // paddingVertical:4,
  //   // marginTop: 10,
  //   // borderRadius:30,
  //   // marginHorizontal:10,
  //   // // backgroundColor:'#f1e8e6',
  //   // backgroundColor:'white',
  //   // elevation:5
  //   flexDirection: 'row',
  //   alignItems: 'center',
  //   paddingHorizontal: 20,
  //   marginTop: 10,
  //   // marginBottom: 10,
  //   // borderWidth:1,
  //   borderRadius: 30,
  //   marginHorizontal: 10,
  //   // backgroundColor:'#f1e8e6',
  //   backgroundColor: 'white',
  //   elevation: 5,


  // },
  // searchInput: {
  //   flex: 1,
  //   height: 40,
  //   borderColor: 'gray',
  //   paddingHorizontal: 10,
  //   borderRadius: 5,
  // },
  // searchInputActive: {
  //   color: '#000',
  // },

  text: {
    fontSize: 16,
    marginRight: 'auto',
    color: '#000',
  },
  // searchButton: {
  //   marginLeft: 'auto',
  // },
  image: {
    height: 30,
    width: 30,
  },
  productList: {
    paddingTop: 10,
    paddingBottom: 70
  },
  productItem: {
    flex: 1,
    marginHorizontal: 4,
    marginVertical: 5,
    backgroundColor: '#fff',
    borderRadius: 10,
    elevation: 3,
    overflow: 'hidden',
  },
  productImageContainer: {
    position: 'relative',
    overflow: 'hidden',
  },
  productImage: {
    width: '100%',
    height: 200,
    resizeMode: 'cover',
  },
  productName: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    color: '#fff',
    fontSize: 13,
    fontWeight: 'bold',
    padding: 5,
  },
  noCategoriesText: {
    top: 40,
    textAlign: 'center',
    color: '#000000',
    fontSize: 20,
    fontWeight: 'bold',
    padding: 5,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 25,
    paddingLeft: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 4,
    flex: 1,
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    height: 40,
    borderRadius: 25,
    paddingHorizontal: 15,
    color: '#000',
    // backgroundColor: '#f1f1f1',
    marginRight: 10,
  },
  dropdownButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 10,
    backgroundColor: '#e6e6e6',
    borderRadius: 15,
  },
  dropdownIcon: {
    width: 15,
    height: 15,
    tintColor: '#000',
  },
  searchButton: {
    backgroundColor: '#1F74BA',
    borderRadius: 25,
    paddingHorizontal: 20,
    paddingVertical: 10,
    elevation: 3,
  },
  searchButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  dropdownContent1: {
    position: 'absolute',
    top: 60,
    width: '90%',
    backgroundColor: '#fff',
    borderRadius: 10,
    elevation: 5,
    paddingVertical: 10,
    paddingHorizontal: 5,
    zIndex: 1,
    alignSelf: 'center',
  },
  dropdownOption: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f1f1',
  },
});

export default HomeCategories;
