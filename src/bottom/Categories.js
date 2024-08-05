import React, {useState, useEffect, useCallback} from 'react';
import {
  Text,
  View,
  Image,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useSelector} from 'react-redux';
import axios from 'axios';
import {API} from '../config/apiConfig';

const Categories = ({navigation}) => {
  const [selectedDetails, setSelectedDetails] = useState([]);
  const [showSearchInput, setShowSearchInput] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [initialSelectedCompany, setInitialSelectedCompany] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
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
          console.log('Initial Selected Company:', initialCompany);
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
      fetchCategories(companyId);
    }
  }, [companyId]);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      setSearchQuery('');
      setShowSearchInput(false);
    });
    return unsubscribe;
  }, [navigation]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchCategories(companyId);
    setRefreshing(false);
  }, [companyId]);

  const fetchCategories = () => {
    setLoading(true);
    const apiUrl = `${global?.userData?.productURL}${API.ALL_CATEGORIES_DATA}/${companyId}`;
    axios
      .get(apiUrl, {
        headers: {
          Authorization: `Bearer ${global?.userData?.token?.access_token}`,
        },
      })
      .then(response => {
        setSelectedDetails(response?.data || []);
        console.log('Styles List:', response.data);
      })
      .catch(error => {
        console.error('Error:', error);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const toggleSearchInput = () => {
    setShowSearchInput(!showSearchInput);
    if (showSearchInput) {
      setSearchQuery('');
    }
  };

  const onChangeText = text => {
    setSearchQuery(text);
  };

  const renderProductItem = ({item}) => {
    const {category, imageUrls} = item;

    return (
      <TouchableOpacity
        style={styles.productItem}
        onPress={() => {
          navigation.navigate('AllCategoriesListed', {
            item,
            categoryId: item.categoryId,
            categoryDesc: category,
          });
        }}>
        <View style={styles.productImageContainer}>
          {imageUrls && imageUrls.length > 0 ? (
            <Image style={styles.productImage} source={{uri: imageUrls[0]}} />
          ) : (
            <Image
              style={styles.productImage}
              resizeMode="contain"
              source={require('../../assets/NewNoImage.jpg')}
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

  const filteredCategories =
    selectedDetails &&
    Array.isArray(selectedDetails) &&
    selectedDetails.filter(item =>
      item.category.toLowerCase().includes(searchQuery.toLowerCase()),
    );

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
            onChangeText={onChangeText}
            placeholder={searchQuery
              ? searchQuery
              : selectedDetails
              ? selectedDetails.length + ' Categories Listed'
              : ''}
            placeholderTextColor="#000"
          />
  
        <View
          style={styles.searchButton}>
          <Image
            style={styles.image}
            source={ require('../../assets/search.png')}
          />
        </View>
      </View>

      {loading ? (
        <ActivityIndicator
          style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}
          size="large"
          color="#390050"
        />
      ) : filteredCategories.length === 0 ? (
        <Text style={styles.noCategoriesText}>Sorry, no results found! </Text>
      ) : (
        <FlatList
          data={filteredCategories}
          renderItem={renderProductItem}
          keyExtractor={(item, index) => index.toString()}
          numColumns={2}
          contentContainerStyle={styles.productList}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={['#000', '#689F38']}
            />
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
  searchContainer: {
  
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    // paddingVertical:7,
    marginTop: 5,
    borderRadius:30,
    marginHorizontal:10,
    // backgroundColor:'#f1e8e6',
    backgroundColor:'white',
    elevation:5
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
  text: {
    fontSize: 16,
    marginRight: 'auto',
    color: '#000',
  },
  searchButton: {
    marginLeft: 'auto',
  },
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
  productImagee: {
    width: '100%',
    height: 300,
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  noCategoriesText: {
    top: 40,
    textAlign: 'center',
    color: '#000000',
    fontSize: 20,
    fontWeight: 'bold',
    padding: 5,
  },
});

export default Categories;
