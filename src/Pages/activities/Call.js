import React, {useState, useEffect} from 'react';
import {useFocusEffect, useNavigation} from '@react-navigation/native';
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Image,
  ActivityIndicator,
  FlatList,
} from 'react-native';
import axios from 'axios';
import {API} from '../../config/apiConfig';
import {formatDateIntoDMY} from '../../Helper/Helper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useSelector} from 'react-redux';

const Call = () => {
  const navigation = useNavigation();
  const [loading, setLoading] = useState(false);
  const [calls, setCalls] = useState([]);
  const [filteredCalls, setFilteredCalls] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [initialSelectedCompany, setInitialSelectedCompany] = useState(null);
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

  const handleSearch = text => {
    setSearchQuery(text);
    const filtered = calls.filter(call => {
      const customerName = call.customer ? call.customer.toLowerCase() : '';
      return customerName.includes(text.toLowerCase());
    });
    setFilteredCalls(filtered);
  };

  const handleAdd = () => {
    navigation.navigate('NewCall', {call: {}});
  };

  console.log('companyId', companyId);

  const getAllCalls = () => {
    setLoading(true);
    const apiUrl = `${global?.userData?.productURL}${API.GET_ALL_CALL}/${companyId}`;
    axios
      .get(apiUrl, {
        headers: {
          Authorization: `Bearer ${global?.userData?.token?.access_token}`,
        },
      })
      .then(response => {
        setCalls(response.data);
        setFilteredCalls(response.data);
        console.log('All calls ==>', response.data[0]);
      })
      .catch(error => {
        console.error('Error:', error);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useFocusEffect(
    React.useCallback(() => {
      if (companyId) {
        getAllCalls();
      }
    }, [companyId]),
  );

  const fetchCallById = callId => {
    setLoading(true);
    const apiUrl = `${global?.userData?.productURL}${API.GET_CALL_BY_ID}/${callId}`;
    axios
      .get(apiUrl, {
        headers: {
          Authorization: `Bearer ${global?.userData?.token?.access_token}`,
        },
      })
      .then(response => {
        navigation.navigate('NewCall', {call: response.data, callId: callId});
      })
      .catch(error => {
        console.error('Error fetching call by ID:', error);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const formatDate = date => {
    const formattedDate = date.toISOString().split('T')[0];
    formatDateIntoDMY(formattedDate);
  };

  const renderItem = ({item}) => (
    <TouchableOpacity
      style={styles.callItem}
      onPress={() => fetchCallById(item.id)}>
      <Text style={{flex: 1.3, marginLeft: 10,color:"#000"}}>{item.customer}</Text>
      <Text style={{flex: 1,color:"#000"}}>{item.relatedTo}</Text>
      <Text style={{flex: 0.7,color:"#000"}}>{item.status}</Text>
      <Text style={{flex: 0.8,marginRight:5,color:"#000"}}>{item.created_on}</Text>
      {/* <Text style={{ flex: 1 }}>{formatDateIntoDMY(item.startDate.split('T')[0])}</Text> */}
    </TouchableOpacity>
  );
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search"
            placeholderTextColor="#000"
            value={searchQuery}
            onChangeText={handleSearch}
          />
          <TouchableOpacity style={styles.searchButton}>
            <Image
              style={styles.searchIcon}
              source={require('../../../assets/search.png')}
            />
          </TouchableOpacity>
        </View>
        <TouchableOpacity style={styles.addButton} onPress={handleAdd}>
          <Text style={styles.addButtonText}>Add Call</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.header}>
        <Text style={styles.headerText}>Customer</Text>
        <Text style={styles.headerText1}>Related To</Text>
        <Text style={styles.headerText2}>Status</Text>
        <Text style={styles.headerText1}> Date</Text>
      </View>
      {loading ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : filteredCalls.length === 0 ? (
        <Text style={styles.noCategoriesText}>Sorry, no results found! </Text>
      ) : (
        <FlatList
          data={filteredCalls}
          renderItem={renderItem}
          keyExtractor={item => item.id.toString()}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    justifyContent: 'flex-start',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    width: '100%',
    paddingHorizontal: 10,
    marginVertical: 10,
    
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 5,
    flex: 1,
    borderRadius:30,
    backgroundColor:'white',
    paddingHorizontal: 10,
    elevation:5,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 10,
    fontSize: 16,
    color: '#000000',
  },
  searchButton: {
    padding: 10,
    borderRadius: 5,
    marginLeft: 5,
  },
  searchIcon: {
    width: 25,
    height: 25,
  },
  addButton: {
    paddingHorizontal: 30,
    marginLeft: 10,
    padding: 10,
    backgroundColor: '#1F74BA',
    borderRadius: 5,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 10,
  },
  headerText: {
    fontWeight: 'bold',
    fontSize: 16,
    marginLeft: 10,
    color:"#000"
  },
  headerText1: {
    fontWeight: 'bold',
    fontSize: 16,
    marginRight:10,
    color:"#000"
  },
  headerText2: {
    fontWeight: 'bold',
    fontSize: 16,
    color:"#000"
  
  },
  callItem: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  callText: {
    fontSize: 14,
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

export default Call;
