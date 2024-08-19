// import React, { useEffect, useState } from 'react';
// import { View, Text, Image, TouchableOpacity, StyleSheet, ScrollView, FlatList } from 'react-native';
// import { useSelector } from 'react-redux';
// import axios from 'axios';
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import { API } from '../../config/apiConfig';

// const NewCategoryUi = () => {
//   const [selectedCategory, setSelectedCategory] = useState('');
//   const [initialSelectedCompany, setInitialSelectedCompany] = useState(null);
//   const [selectedDetails, setSelectedDetails] = useState([]);
//   const [productsList, setProductsList] = useState([]);

//   const selectedCompany = useSelector(state => state.selectedCompany);
//   const companyId = selectedCompany ? selectedCompany.id : initialSelectedCompany?.id;

//   useEffect(() => {
//     const fetchInitialSelectedCompany = async () => {
//       try {
//         const initialCompanyData = await AsyncStorage.getItem('initialSelectedCompany');
//         if (initialCompanyData) {
//           const initialCompany = JSON.parse(initialCompanyData);
//           setInitialSelectedCompany(initialCompany);
//         }
//       } catch (error) {
//         console.error('Error fetching initial selected company:', error);
//       }
//     };

//     fetchInitialSelectedCompany();
//   }, []);

//   useEffect(() => {
//     if (companyId) {
//       fetchCategories(companyId);
//     }
//   }, [companyId]);

//   const fetchCategories = (companyId) => {
//     const apiUrl = `${global?.userData?.productURL}${API.ALL_CATEGORIES_DATA}/${companyId}`;
//     axios
//       .get(apiUrl, {
//         headers: {
//           Authorization: `Bearer ${global?.userData?.token?.access_token}`,
//         },
//       })
//       .then(response => {
//         setSelectedDetails(response?.data || []);
//         handleCategory(response?.data[0]);
//       })
//       .catch(error => {
//         console.error('Error:', error);
//       });
//   };

//   const handleCategory = (category) => {
//     setSelectedCategory(category.category);
//     getAllCategories(category.categoryId, category.companyId);
//   };

//   const getAllCategories = async (categoryId, companyId) => {
//     const apiUrl = `${global?.userData?.productURL}${API.ALL_PRODUCTS_DATA}`;
//     try {
//       const userData = await AsyncStorage.getItem('userdata');
//       const userDetails = JSON.parse(userData);

//       const requestData = {
//         pageNo: "1",
//         pageSize: "20",
//         categoryId: categoryId,
//         companyId: companyId,
//       };

//       const response = await axios.post(apiUrl, requestData, {
//         headers: {
//           Authorization: `Bearer ${global?.userData?.token?.access_token}`,
//           'Content-Type': 'application/json',
//         },
//       });

//       const data = response.data.content;
//       setProductsList(data);
//     } catch (error) {
//       console.error('Error:', error);
//     }
//   };

//   const renderProductItem = ({ item }) => (
//     <View style={styles.productCard}>
//       <Image
//         style={styles.productImage}
//         source={item.imageUrls && item.imageUrls.length > 0 ? { uri: item.imageUrls[0] } : require('../../../assets/NewNoImage.jpg')}
//       />
//       <View style={styles.productDetails}>
//         <Text style={styles.productTitle}>{item.styleName}</Text>
//         <View style={styles.priceContainer}>
//           <Text style={styles.productPrice}>₹{item.mrp}</Text>
//         </View>
//         <TouchableOpacity style={styles.addButton}>
//           <Text style={styles.addButtonText}>ADD</Text>
//         </TouchableOpacity>
//       </View>
//     </View>
//   );

//   return (
//     <View style={styles.container}>
//       <ScrollView style={styles.sidebar} nestedScrollEnabled={true}>
//         {selectedDetails.map(category => (
//           <TouchableOpacity
//             key={category.categoryId}
//             style={styles.categoryButton}
//             onPress={() => handleCategory(category)}
//           >
//             <Image source={require('../../../assets/img5.jpg')} style={styles.categoryImage} />
//             <Text style={styles.categoryText}>{category.category}</Text>
//           </TouchableOpacity>
//         ))}
//       </ScrollView>
//       <View style={styles.content}>
//         <Text style={styles.title}> {selectedCategory}</Text>
//         <FlatList
//           data={productsList}
//           renderItem={renderProductItem}
//           keyExtractor={(item, index) => index.toString()}
//           contentContainerStyle={styles.flatListContainer}
//         />
//       </View>
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     flexDirection: 'row',
//   },
//   sidebar: {
//     width: '27%',
//     backgroundColor: '#f4f4f4',
//     padding: 10,
//   },
//   categoryButton: {
//     alignItems: 'center',
//     marginBottom: 15,
//   },
//   categoryImage: {
//     width: 50,
//     height: 50,
//     marginBottom: 5,
//   },
//   categoryText: {
//     fontSize: 14,
//     textAlign: 'center',
//   },
//   content: {
//     width: '73%',
//     padding: 20,
//     backgroundColor: '#fff',
//   },
//   title: {
//     fontSize: 20,
//     fontWeight: 'bold',
//     marginBottom: 15,
//   },
//   flatListContainer: {
//     paddingHorizontal: 8,
//   },
//   productCard: {
//     flex: 1,
//     margin: 8,
//     padding: 10,
//     borderRadius: 10,
//     backgroundColor: '#fff',
//     elevation: 3,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.2,
//     shadowRadius: 5,
//   },
//   productImage: {
//     width: '100%',
//     height: 120,
//     resizeMode: 'contain',
//     marginBottom: 10,
//   },
//   productDetails: {
//     justifyContent: 'center',
//   },
//   productTitle: {
//     fontSize: 16,
//     fontWeight: 'bold',
//     color: '#000',
//   },
//   productSize: {
//     fontSize: 14,
//     color: '#555',
//     marginVertical: 5,
//   },
//   priceContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginVertical: 5,
//   },
//   productPrice: {
//     fontSize: 16,
//     fontWeight: 'bold',
//     color: '#000',
//   },
//   productOldPrice: {
//     fontSize: 14,
//     color: '#888',
//     textDecorationLine: 'line-through',
//     marginLeft: 8,
//   },
//   addButton: {
//     backgroundColor: '#F09120',
//     borderRadius: 5,
//     paddingVertical: 8,
//     paddingHorizontal: 16,
//     marginTop: 10,
//   },
//   addButtonText: {
//     color: '#fff',
//     fontWeight: 'bold',
//     textAlign: 'center',
//   },
// });

// export default NewCategoryUi;


import React, { useEffect, useState } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, ScrollView, FlatList, TextInput } from 'react-native';
import { useSelector } from 'react-redux';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API } from '../../config/apiConfig';

const NewCategoryUi = () => {
  const [selectedCategory, setSelectedCategory] = useState('');
  const [initialSelectedCompany, setInitialSelectedCompany] = useState(null);
  const [selectedDetails, setSelectedDetails] = useState([]);
  const [productsList, setProductsList] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  const selectedCompany = useSelector(state => state.selectedCompany);
  const companyId = selectedCompany ? selectedCompany.id : initialSelectedCompany?.id;

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

  useEffect(() => {
    if (companyId) {
      fetchCategories(companyId);
    }
  }, [companyId]);

  const fetchCategories = (companyId) => {
    const apiUrl = `${global?.userData?.productURL}${API.ALL_CATEGORIES_DATA}/${companyId}`;
    axios
      .get(apiUrl, {
        headers: {
          Authorization: `Bearer ${global?.userData?.token?.access_token}`,
        },
      })
      .then(response => {
        setSelectedDetails(response?.data || []);
        handleCategory(response?.data[0]);
      })
      .catch(error => {
        console.error('Error:', error);
      });
  };

  const handleCategory = (category) => {
    setSelectedCategory(category.category);
    getAllCategories(category.categoryId, category.companyId);
  };

  const getAllCategories = async (categoryId, companyId) => {
    const apiUrl = `${global?.userData?.productURL}${API.ALL_PRODUCTS_DATA}`;
    try {
      const userData = await AsyncStorage.getItem('userdata');
      const userDetails = JSON.parse(userData);

      const requestData = {
        pageNo: "1",
        pageSize: "20",
        categoryId: categoryId,
        companyId: companyId,
      };

      const response = await axios.post(apiUrl, requestData, {
        headers: {
          Authorization: `Bearer ${global?.userData?.token?.access_token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = response.data.content;
      setProductsList(data);
      console.log("Products list ",data)
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const renderProductItem = ({ item }) => (
    <View style={styles.productCard}>
      {/* Product Image */}
      <Image
        style={styles.productImage}
        source={item.imageUrls && item.imageUrls.length > 0 ? { uri: item.imageUrls[0] } : require('../../../assets/NewNoImage.jpg')}
      />
      {/* Product Details */}
      <View style={styles.productDetails}>
        <Text style={styles.productTitle}>{item.styleName}</Text>
        <Text style={styles.productTitle}>{item.styleDesc}</Text>
        {/* <Text style={styles.productSize}>450 ml</Text> */}
        <View style={styles.priceContainer}>
          <Text style={styles.productPrice}>₹{item.mrp}</Text>
        </View>
        <TouchableOpacity style={styles.addButton}>
          <Text style={styles.addButtonText}>ADD</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <ScrollView style={styles.sidebar} nestedScrollEnabled={true}>
        {selectedDetails.map(category => (
          <TouchableOpacity
            key={category.categoryId}
            style={styles.categoryButton}
            onPress={() => handleCategory(category)}
          >
            <Image source={require('../../../assets/img5.jpg')} style={styles.categoryImage} />
            <Text style={styles.categoryText}>{category.category}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
      <View style={styles.content}>
        <Text style={styles.title}>{selectedCategory}</Text>
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
          style={styles.searchButton}>
          {/* onPress={toggleSearchInput}> */}
          <Image
            style={styles.image}
            source={require('../../../assets/search.png')}
          />
        </TouchableOpacity>
      </View>
        {productsList.length === 0 ? (
        <View style={styles.noProductsContainer}>
          <Text style={styles.noProductsText}>There are no products available.</Text>
        </View>) :
        <FlatList
          data={productsList}
          renderItem={renderProductItem}
          keyExtractor={(item, index) => index.toString()}
          contentContainerStyle={styles.flatListContainer}
        />}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
  },
  sidebar: {
    width: '27%',
    backgroundColor: '#f4f4f4',
    padding: 10,
  },
  categoryButton: {
    alignItems: 'center',
    marginBottom: 15,
  },
  categoryImage: {
    width: 50,
    height: 50,
    marginBottom: 5,
  },
  categoryText: {
    fontSize: 14,
    textAlign: 'center',
  },
  content: {
    width: '73%',
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  flatListContainer: {
    paddingHorizontal: 8,
  },
  productCard: {
    flexDirection: 'row',
    marginVertical: 8,
    padding: 10,
    borderRadius: 10,
    backgroundColor: '#fff',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
  },
  productImage: {
    width: 100,
    height: 100,
    resizeMode: 'contain',
    marginRight: 10,
  },
  productDetails: {
    flex: 1,
    justifyContent: 'center',
  },
  productTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 5,
  },
  productSize: {
    fontSize: 14,
    color: '#555',
    marginBottom: 5,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  productPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
  },
  addButton: {
    backgroundColor: '#F09120',
    borderRadius: 5,
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginTop: 10,
  },
  addButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  noProductsContainer: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: "flex-start",
    marginTop:20,
  },
  noProductsText: {
    fontSize: 18,
    color: '#000',
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


export default NewCategoryUi;
