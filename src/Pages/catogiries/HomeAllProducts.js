import React, { useState, useEffect, useRef, useCallback, PureComponent } from 'react';
import {
  Text,
  View,
  Image,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { PRODUCT_DETAILS } from '../../components/ProductDetails';
import ModalComponent from '../../components/ModelComponent';
import { API } from '../../config/apiConfig';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { RefreshControl } from 'react-native';


class ProductItem extends PureComponent {
  render() {
    const { item, navigation, openModal } = this.props;
    return (
      <TouchableOpacity
        style={styles.productItem}
        onPress={() =>
          navigation.navigate(
            item.categoryId === PRODUCT_DETAILS ? 'AllCategoriesListed' : 'Details',
            {
              item,
            }
          )
        }>
        <View style={styles.productImageContainer}>
          {item.imageUrls && item.imageUrls.length > 0 ? (
            <Image style={styles.productImage} source={{ uri: item.imageUrls[0] }} />
            ) : (
            <Image style={styles.productImage} source={require('../../../assets/NewNoImage.jpg')} />
          )}
          <Text
            style={[
              styles.productName,
               { backgroundColor: 'rgba(0, 0, 0, 0.2)' },
            ]}>
            {item.styleName}
          </Text>
        </View>

        <View style={styles.additionalDetailsContainer}>
          <Text style={{color:'#000'}} numberOfLines={1} ellipsizeMode="tail">
            Color Name: {item.colorName}
          </Text>
          <View style={styles.notesContainer}>
            <Text style={{color:'#000'}} numberOfLines={1} ellipsizeMode="tail">
              Description: {item.styleDesc}
            </Text>
            <Text style={{color:'#000'}}>Price: {item.mrp}</Text>
            <TouchableOpacity onPress={() => openModal(item)} style={styles.buttonqty}>
              <Text style={{color:'#ffffff'}}>ADD QTY</Text>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    );
  }
}

const HomeAllProducts = ({ navigation }) => {
  const [showSearchInput, setShowSearchInput] = useState(false);
  const [selectedDetails, setSelectedDetails] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [pageNo, setPageNo] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0); // New state for total items
  const [isFetching, setIsFetching] = useState(false);
  const flatListRef = useRef(null);
  const [scrollPosition, setScrollPosition] = useState(0);
  const [initialSelectedCompany, setInitialSelectedCompany] = useState(null);

  const selectedCompany = useSelector((state) => state.selectedCompany);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    const fetchInitialSelectedCompany = async () => {
      try {
        const initialCompanyData = await AsyncStorage.getItem('initialSelectedCompany');
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

  const companyId = selectedCompany ? selectedCompany.id : initialSelectedCompany?.id;

  useEffect(() => {
    if (companyId) {
      getAllProducts(companyId);
    }
  }, [companyId]);

  const onRefresh = async () => {
    setRefreshing(true);
    setPageNo(1); // Reset the page number to 1
    await getAllProducts(companyId); // Refetch the first page of data
    setRefreshing(false);
  };
  

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      // Reset search when component is focused
      setSearchQuery('');
      setShowSearchInput(false); // Hide search input when component is focused
    });
    return unsubscribe;
  }, [navigation]);



  useEffect(() => {
    setFilteredProducts(
      selectedDetails.filter(item =>
        item.styleName.toLowerCase().includes(searchQuery.toLowerCase())
      )
    );
  }, [searchQuery, selectedDetails]);

  const getAllProducts = async (categoryId) => {
    setIsLoading(true);
    const apiUrl = `${global?.userData?.productURL}${API.ALL_PRODUCTS_DATA}`;
    console.log("apiurll", apiUrl);
    
    try {
      const userData = await AsyncStorage.getItem('userdata');
      const userDetails = JSON.parse(userData);
  
      const requestData = {
        pageNo: String(pageNo),
        pageSize: "20",
        categoryId: "",
        companyId:companyId
      };
  
      const response = await axios.post(apiUrl, requestData, {
        headers: {
          Authorization: `Bearer ${global?.userData?.token?.access_token}`,
          'Content-Type': 'application/json'
        },
      });
  
      const data = response.data.content;
      if (pageNo === 1) {
        setSelectedDetails(data);
        setTotalItems(response.data.totalItems);
      } else {
        setSelectedDetails(prev => [...prev, ...data]);
      }
      setTotalPages(response.data.totalPages);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };
  

  const toggleSearchInput = () => {
    setShowSearchInput(!showSearchInput);
    if (showSearchInput) {
      setSearchQuery('');
    }
  };

  const openModal = item => {
    setSelectedItem(item);
    setModalVisible(true);
  };

  const renderProductItem = useCallback(
    ({ item }) => (
      <ProductItem
        item={item}
        navigation={navigation}
        openModal={openModal}
      />
    ),
    [navigation]
  );

  const handleEndReached = () => {
    if (pageNo < totalPages && !isFetching) {
      setPageNo(pageNo + 1);
    }
  };

  useEffect(() => {
    if (pageNo > 1) {
      getAllProducts();
    }
  }, [pageNo]);

  const handleScroll = event => {
    setScrollPosition(event.nativeEvent.contentOffset.y);
  };

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        {showSearchInput ? (
          <TextInput
            style={[styles.searchInput, searchQuery.length > 0 && styles.searchInputActive]}
            autoFocus={true}
            value={searchQuery}
            onChangeText={text => setSearchQuery(text)}
            placeholder="Search"
            placeholderTextColor="#000"
          />
        ) : (
          <Text style={styles.text}>
            {searchQuery ? searchQuery : (totalItems ? totalItems + ' Products Listed' : '')}
          </Text>
        )}
        <TouchableOpacity style={styles.searchButton} onPress={toggleSearchInput}>
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

      {isLoading ? (
        <ActivityIndicator
          style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}
          size="large"
          color="#390050"
        />
      )  : (searchQuery && filteredProducts.length === 0) || (!searchQuery && selectedDetails.length === 0) ? (
        <Text style={styles.noCategoriesText}>Sorry, no results found!</Text>
      ) : (
        <FlatList
          ref={flatListRef}
          data={searchQuery ? filteredProducts : selectedDetails}
          renderItem={renderProductItem}
          keyExtractor={item => item.styleId.toString()}
          numColumns={2}
          contentContainerStyle={styles.productList}
          removeClippedSubviews={true}
          initialNumToRender={10}
          maxToRenderPerBatch={10}
          updateCellsBatchingPeriod={100}
          windowSize={7}
          onEndReached={handleEndReached}
          onEndReachedThreshold={0.1}
          onScroll={handleScroll}
          scrollEventThrottle={16}
          getItemLayout={(data, index) => ({ length: 350, offset: 350 * index, index })}
          onContentSizeChange={() => {
            if (scrollPosition !== 0) {
              flatListRef.current.scrollToOffset({ offset: scrollPosition, animated: false });
            }
          }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={['#000', '#689F38']}
            />
          }
        />
      )}

      <ModalComponent
        modalVisible={modalVisible}
        closeModal={() => setModalVisible(false)}
        selectedItem={selectedItem}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#faf7f6',
  },
  searchContainer: {
    // flexDirection: 'row',
    // alignItems: 'center',
    // paddingHorizontal: 20,
    // marginTop: 5,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical:7,
    marginTop: 10,
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
  },
  productItem: {
    flex: 1,
    marginHorizontal: 2,
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
  additionalDetailsContainer: {
    paddingTop: 5,
  },
  notesContainer: {
  },
  buttonqty: {
    marginHorizontal:3,
    marginVertical:3,
    borderWidth: 1,
    paddingVertical: 10,
    borderRadius: 5,
    flexDirection: 'row',
    justifyContent: 'center',
    backgroundColor:'#F09120',
    // backgroundColor:'#fc9c04',
  },
  noCategoriesText:{
    top: 40,
    textAlign:"center",
    color: '#000000',
    fontSize: 20,
    fontWeight: 'bold',
    padding: 5,
  }
});

export default HomeAllProducts;