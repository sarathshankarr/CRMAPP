import React, {useEffect, useState} from 'react';
import {useNavigation, useFocusEffect} from '@react-navigation/native';
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Image,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  Alert,
} from 'react-native';
import axios from 'axios';
import {API} from '../../config/apiConfig';
import {formatDateIntoDMY} from '../../Helper/Helper';
import {useSelector} from 'react-redux';
import AsyncStorage from '@react-native-async-storage/async-storage';

const Tasks = () => {
  const navigation = useNavigation();
  const [tasks, setTasks] = useState([]);
  const [filteredTasks, setFilteredTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [initialSelectedCompany, setInitialSelectedCompany] = useState(null);
  const [from, setFrom] = useState(0);
  const [to, setTo] = useState(15);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMoreTasks, setHasMoreTasks] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const [selectedSearchOption, setSelectedSearchOption] = useState(null);
  const [searchKey, setSearchKey] = useState(null);
  const [dropdownVisible, setDropdownVisible] = useState(false);

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

  const gettasksearch = async () => {
    const apiUrl = `${global?.userData?.productURL}${API.GET_ALL_TASK__SEARCH}`;
    const requestBody = {
      searchKey: searchKey,
      searchValue: searchQuery,
      from: 0,
      to: tasks.length,
      t_company_id: companyId,
      customerId: 0,
      customerType: 0,
    };

    try {
      const response = await axios.post(apiUrl, requestBody, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${global?.userData?.token?.access_token}`,
        },
      });

      if (response.data) {
        setTasks(response.data); 
        setHasMoreTasks(false); 
      } else {
        setTasks([]);
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
  
    // If query is cleared, reset tasks and fetch all
    if (query.trim() === '') {
      fetchTasks(true); // Call the fetchTasks function to load all tasks
    }
  };

  const searchOption = [
    {label: 'Task Name', value: 1},
    {label: 'Date', value: 2},
    {label: 'Rel To', value: 3},
    {label: 'Status', value: 4},
    {label: 'Desc', value: 1},
  ];

  useFocusEffect(
    React.useCallback(() => {
      if (companyId) {
        fetchTasks(true);
      }
    }, [companyId]),
  );

  const fetchTasks = async (reset = false) => {
    if (loading || loadingMore) return; 
    setLoading(reset); 

    const apiUrl = `${global?.userData?.productURL}${
      API.GET_ALL_TASK_LAZY
    }/${from}/${to}/${companyId}/${0}/${0}`;

    try {
      const response = await axios.get(apiUrl, {
        headers: {
          Authorization: `Bearer ${global?.userData?.token?.access_token}`,
        },
      });

      const newTasks = response.data; 
      if (reset) {
        setTasks(newTasks);
      } else {
        setTasks(prevTasks => [...prevTasks, ...newTasks]);
      }

      if (newTasks.length < 15) {
        setHasMoreTasks(false); 
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const loadMoreTasks = () => {
    if (!hasMoreTasks || loadingMore) return; 

    setLoadingMore(true);
    const newFrom = from + 15;
    const newTo = to + 15;
    setFrom(newFrom);
    setTo(newTo);

    fetchTasks(false); 
  };

  const onRefresh = async () => {
    setRefreshing(true);
    setFrom(0);
    setTo(15);
    setHasMoreTasks(true);
    await fetchTasks(true); 
    setRefreshing(false);
  };

  const fetchTaskById = taskId => {
    navigation.navigate('NewTask', {
      task: tasks.find(task => task.id === taskId),
    });
  };

  const handleAdd = () => {
    navigation.navigate('NewTask', {task: {}});
  };

  const renderItem = ({item}) => (
    <TouchableOpacity
      style={styles.taskItem}
      onPress={() => fetchTaskById(item.id)}>
      <Text style={styles.taskText}>{item.taskName}</Text>
      <Text style={styles.taskText1}>{item.relatedTo}</Text>
      <Text style={styles.taskText3}>{item.status}</Text>
      <Text style={styles.taskText3}>{item.created_on}</Text>
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

        <TouchableOpacity onPress={handleSearch}>
          <Image
            style={styles.searchIcon}
            source={require('../../../assets/search.png')}
          />
        </TouchableOpacity>

        <TouchableOpacity style={styles.addButton} onPress={handleAdd}>
          <Text style={styles.addButtonText}>Add Task</Text>
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
      <View style={styles.listHeader}>
        <Text style={styles.headerText}>Task Name</Text>
        <Text style={styles.headerText}>Related To</Text>
        <Text style={styles.headerText}>Status</Text>
        <Text style={styles.headerText}>Date</Text>
      </View>
      {loading ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : tasks.length === 0 ? (
        <Text style={styles.noCategoriesText}>Sorry, no results found!</Text>
      ) : (
        <FlatList
          data={tasks}
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
    justifyContent: 'flex-start',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    marginVertical: 10,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    // borderWidth: 1,
    borderRadius: 5,
    flex: 1,
    marginRight: 10,
    borderRadius: 30,
    backgroundColor: 'white',
    elevation: 5,
    paddingHorizontal: 15,
  },
  searchButton: {
    marginLeft: 'auto',
    flexDirection: 'row',
  },
  searchInput: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 10,
    fontSize: 16,
    color: '#000000',
  },
  image: {
    height: 20,
    width: 20,
    marginLeft: 10,
    marginRight: 10,
  },
  searchIcon: {
    width: 25,
    height: 25,
    marginHorizontal: 5, // Add margin to properly separate icon from input
  },
  addButton: {
    paddingHorizontal: 30,
    padding: 10,
    backgroundColor: '#1F74BA',
    borderRadius: 5,
    marginLeft: 10,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  listHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    paddingVertical: 10,
    backgroundColor: '#f0f0f0',
  },
  headerText: {
    fontSize: 16,
    fontWeight: 'bold',
    flex: 1,
    paddingHorizontal: 5,
    color: '#000',
  },
  taskItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  taskText: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 5,
    paddingHorizontal: 5,
    color: '#000',
  },
  taskText1: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 5,
    paddingHorizontal: 5,
    color: '#000',
  },
  taskText3: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 5,
    paddingHorizontal: 5,
    color: '#000',
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

export default Tasks;
