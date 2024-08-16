import {useNavigation} from '@react-navigation/native';
import axios from 'axios';
import React, {useState, useEffect} from 'react';
import {
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ActivityIndicator,
  FlatList,
  Modal,
  ScrollView,
  Alert,
  useColorScheme,
} from 'react-native';
import {RadioGroup} from 'react-native-radio-buttons-group';
import {API} from '../../config/apiConfig';
import CustomCheckBox from '../../components/CheckBox';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useSelector} from 'react-redux';

const ProductsStyles = () => {
  const navigation = useNavigation();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchQueryStylesData, setSearchQueryStylesData] = useState('');

  const [selectedId, setSelectedId] = useState('1');
  const [loading, setLoading] = useState(false);
  const [stylesData, setStylesData] = useState([]);
  const [checkedId, setCheckedId] = useState(null);
  const [initialSelectedCompany, setInitialSelectedCompany] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [distributors, setDistributors] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const selectedCompany = useSelector(state => state.selectedCompany);
  const [pageNo, setPageNo] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [isFetching, setIsFetching] = useState(false);
  const [scrollPosition, setScrollPosition] = useState(0); // Track scroll position
  const [checkedStyleIds, setCheckedStyleIds] = useState([]);
  const [checkedModalIds, setCheckedModalIds] = useState([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState(null);
  const [selectedDistributorId, setSelectedDistributorId] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const colorScheme = useColorScheme();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedCustomerDetails, setSelectedCustomerDetails] = useState(null);
  const [selectedDistributorDetails, setSelectedDistributorDetails] =
    useState(null);
  const [selectAll, setSelectAll] = useState(false);
  const [selectAllModel, setSelectAllModel] = useState(false);
  const userData=useSelector(state=>state.loggedInUser);
  const userId=userData?.userId;

  const toggleModal = () => {
    setIsModalVisible(!isModalVisible);
    // Reset error fields and input values when modal is closed
    if (isModalVisible) {
      setErrorFields([]);
      setInputValues({
        firstName: '',
        phoneNumber: '',
        cityOrTown: '',
        state: '',
        country: '',
        // Add other input fields if needed
      });
      setSearchQuery('');
      setSearchQueryStylesData('');
    }
  };

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

  const handleEndReached = () => {
    if (pageNo < totalPages && !isFetching) {
      setPageNo(prevPageNo => prevPageNo + 1);
    }
  };

  const handleScroll = event => {
    setScrollPosition(event.nativeEvent.contentOffset.y);
  };

  const radioButtons = [
    {
      id: '1',
      label: 'Distributor',
      value: 'distributor',
      labelStyle: {color: '#000'},
      color: '#1F74BA',
    },
    {
      id: '2',
      label: 'Retailer',
      value: 'retailer',
      labelStyle: {color: '#000'},
      color: '#1F74BA',
    },
  ];

  const handleGoBack = () => {
    navigation.goBack();
  };
  const getAllProducts = async companyId => {
    setLoading(true);
    const apiUrl = `${global?.userData?.productURL}${API.ALL_PRODUCTS_DATA_NEW}/${companyId}`;
    axios
      .get(apiUrl, {
        headers: {
          Authorization: `Bearer ${global?.userData?.token?.access_token}`,
        },
      })
      .then(response => {
        setStylesData(response?.data?.response?.stylesList || []);
        console.log('Styles List:', response.data?.response?.stylesList[0]);
      })
      .catch(error => {
        console.error('Error:', error);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const getDistributorsDetails = () => {
    const apiUrl = `${global?.userData?.productURL}${API.GET_DISTRIBUTORS_DETAILS}/${companyId}`;
    setIsLoading(true);
    console.log('Distributors API URL:', apiUrl);
    axios
      .get(apiUrl, {
        headers: {
          Authorization: `Bearer ${global.userData.token.access_token}`,
        },
      })
      .then(response => {
        setDistributors(response?.data?.response?.distributorList || []);
        setIsLoading(false);
        console.log(
          'Distributors response:',
          response?.data?.response?.distributorList,
        );
      })

      .catch(error => {
        console.error('Error:', error);
        setIsLoading(false);
      });
  };

  const getCustomersDetails = () => {
    const apiUrl = `${global?.userData?.productURL}${API.ADD_CUSTOMER_LIST}/${companyId}`;
    setIsLoading(true);
    console.log('Customers API URL:', apiUrl);
    axios
      .get(apiUrl, {
        headers: {
          Authorization: `Bearer ${global?.userData?.token?.access_token}`,
        },
      })
      .then(response => {
        setCustomers(response?.data?.response?.customerList || []);
        setIsLoading(false);
        console.log(
          'Customers response:',
          response?.data?.response?.customerList,
        );
      })
      .catch(error => {
        console.error('Error:', error);
        setIsLoading(false);
      });
  };

  const generateCatelog = async () => {
    if (isGenerating) return; // Prevent duplicate requests

    setIsGenerating(true); // Set loading state to true

    const customerIdOrDistributorId =
      selectedId === '2' ? selectedCustomerId : selectedDistributorId;

    const getWhatsappId = (id, isCustomer) => {
      if (isCustomer) {
        const customer = customers.find(cust => cust.customerId === id);
        return customer ? customer.whatsappId : '';
      } else {
        const distributor = distributors.find(dist => dist.id === id);
        return distributor ? distributor.whatsappId : '';
      }
    };
    const requestData = {
      stylesPublishList: checkedStyleIds.flatMap(styleId => 
        checkedModalIds.map(customerId => ({
          styleId: styleId,
          customerId: customerId,
          phoneNo: getWhatsappId(customerId, selectedId === '2'),
          messageStts: 'Pending',
          customerTypes: selectedId === '2' ? 1 : 2,
        }))
      ),
      loggedInUserWhatsappNumber: '', // Set this to the appropriate value if available
      companyId: companyId,
      userId:userId,
      linkType: 3,
    };
    console.log('stylesPublishList===>', checkedStyleIds);

    console.log('customerIdOrDistributorId', customerIdOrDistributorId);
    console.log('checkedModalIds:', checkedModalIds);
    console.log('requestData:', requestData);

    try {
      const apiUrl =`${global?.userData?.productURL}${API.GENERATE_CATE_LOG}`;
      const response = await axios.post(apiUrl, requestData, {
        headers: {
          Authorization: `Bearer ${global?.userData?.token?.access_token}`,
          'Content-Type': 'application/json',
        },
      });

      console.log('Catalog generation response:', response.data);

      // Show success alert and reset checkbox selection
      Alert.alert(
        'Success',
        'Styles published successfully!',
        [
          {
            text: 'OK',
            onPress: () => {
              console.log('OK Pressed');
              // Reset checkedStyleIds after alert confirmation
              setCheckedStyleIds([]);
            },
          },
        ],
        {cancelable: false},
      );
      handleCloseModal();
    } catch (error) {
      console.error('Error generating catalog:', error);
      // Optionally show an error alert here
      Alert.alert(
        'Error',
        'An error occurred while publishing styles. Please try again.',
        [{text: 'OK', onPress: () => console.log('OK Pressed')}],
        {cancelable: false},
      );
    } finally {
      setIsGenerating(false); // Set loading state to false
      setModalVisible(false); // Close the modal
    }
  };

  const handlePublish = () => {
    if (selectedId === '1') {
      getDistributorsDetails();
    } else if (selectedId === '2') {
      getCustomersDetails();
    }
    setModalVisible(true);
  };

  const fetchStyleById =(Id) => {
    // console.log("fetchStyleById ===> ", Id)
    setLoading(true);
    const end="/0";
    const apiUrl = `${global?.userData?.productURL}${API.GET_STYLE_BY_ID}${Id}${end}`;
    console.log("GET_STYLE_BY_ID", apiUrl);
    axios
      .get(apiUrl, {
        headers: {
          Authorization: `Bearer ${global?.userData?.token?.access_token}`,
        },
      })
      .then(response => {
        navigation.navigate('AddNewStyle', {Style: response.data.response.stylesList[0]});
      })
      .catch(error => {
        console.error('Error fetching Style by ID:', error);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    if (companyId) {
      getAllProducts(companyId);
    }
  }, [companyId, pageNo]);

  const isAnyCheckboxSelected = () => {
    return checkedStyleIds.length > 0 || checkedModalIds.length > 0;
  };

  const handleCheckBoxToggleStyle = styleId => {
    setCheckedStyleIds(
      prevIds =>
        prevIds.includes(styleId)
          ? prevIds.filter(id => id !== styleId) // Uncheck if already checked
          : [...prevIds, styleId], // Check if not checked
    );
  };

  const handleCheckBoxToggleModal = (id, item) => {
    setCheckedModalIds(prevIds =>
      prevIds.includes(id)
        ? prevIds.filter(item => item !== id)
        : [...prevIds, id],
    );
  };
  const handleSelectAllToggle = () => {
    if (selectAll) {
      // Uncheck all checkboxes
      setCheckedStyleIds([]);
    } else {
      // Check all checkboxes
      const allStyleIds = stylesData.map(item => item.styleId);
      setCheckedStyleIds(allStyleIds);
    }
    setSelectAll(!selectAll);
  };
  const handleCloseModal = () => {
    // Reset checkbox state
    setCheckedModalIds([]);
    setSelectAllModel(false);
    setSearchQuery(''); // Clear search query
    setSearchQueryStylesData(''); // Clear search query for styles data
    setModalVisible(false);
  };

  const handleCloseModalDisRet = () => {
    setIsModalVisible(false);
    setInputValues([]); // Assuming inputValues should be an array too
    setErrorFields([]); // Reset errorFields to an empty array
  };

  const handleAddNew = () => {
    navigation.navigate('AddNewStyle');
  };

  const handleSelectAllToggleModal = () => {
    setSelectAllModel(prevState => {
      const newState = !prevState; // Toggle selectAllModel

      if (newState) {
        // Determine which IDs to select based on selectedId
        if (selectedId === '1') {
          // Select all distributors
          const allDistributorsIds = distributors.map(item => item.id);
          setCheckedModalIds(prevIds => [
            ...new Set([...prevIds, ...allDistributorsIds]),
          ]); // Ensure no duplicates
        } else if (selectedId === '2') {
          // Select all customers
          const allCustomersIds = customers.map(item => item.customerId);
          setCheckedModalIds(prevIds => [
            ...new Set([...prevIds, ...allCustomersIds]),
          ]); // Ensure no duplicates
        }
      } else {
        // Uncheck all checkboxes
        setCheckedModalIds(prevIds => {
          if (selectedId === '1') {
            // Remove all distributors IDs
            return prevIds.filter(
              id => !distributors.map(item => item.id).includes(id),
            );
          } else if (selectedId === '2') {
            // Remove all customers IDs
            return prevIds.filter(
              id => !customers.map(item => item.customerId).includes(id),
            );
          }
          return prevIds;
        });
      }

      return newState; // Update the selectAllModel state
    });
  };

  const filteredStylesData = () => {
    if (!searchQueryStylesData) return stylesData;
    return stylesData.filter(item => {
      const styleNameMatch = item.styleName
        .toLowerCase()
        .includes(searchQueryStylesData.toLowerCase());
      const colorNameMatch = item.colorName
        .toLowerCase()
        .includes(searchQueryStylesData.toLowerCase());
      const styleNumMatch =
        item.styleNum &&
        item.styleNum
          .toString()
          .toLowerCase()
          .includes(searchQueryStylesData.toLowerCase());

      return styleNameMatch || colorNameMatch || styleNumMatch;
    });
  };

  const filteredModalData = data => {
    if (!searchQuery) return data;
    return data.filter(item => {
      const searchString = searchQuery.toLowerCase();
      const nameField =
        selectedId === '1' ? item.distributorName : item.firstName;
      return (
        nameField.toLowerCase().includes(searchString) ||
        (item.whatsappId &&
          item.whatsappId.toLowerCase().includes(searchString)) ||
        (item.emailId && item.emailId.toLowerCase().includes(searchString))
      );
    });
  };

  const renderItem = ({item}) => (
    <TouchableOpacity style={styles.row} onPress={() => fetchStyleById(item?.styleId)}>
    
    {item?.styleId && <CustomCheckBox
      isChecked={checkedStyleIds.includes(item?.styleId)}
      onToggle={() => handleCheckBoxToggleStyle(item?.styleId)}
    />}
    <Text style={styles.cell}>{item?.styleNum}</Text>
    <Text style={styles.cell1}>{item?.styleName}</Text>
    <Text style={styles.cell2}>{item?.colorName}</Text>
    <Text style={styles.cell3}>{item?.mrp}</Text>
    </TouchableOpacity>

  );

  const renderModalContent = () => {
    const modalData =
      selectedId === '1'
        ? filteredModalData(distributors)
        : filteredModalData(customers);

    return (
      <FlatList
        data={modalData}
        keyExtractor={item =>
          item?.id ? item?.id.toString() : Math.random().toString()
        }
        renderItem={({item}) => (
          <View style={styles.modalItem}>
            <View style={{marginLeft: 10}}>
              <CustomCheckBox
                isChecked={checkedModalIds.includes(
                  selectedId === '1' ? item?.id : item?.customerId,
                )}
                onToggle={() =>
                  handleCheckBoxToggleModal(
                    selectedId === '1' ? item?.id : item?.customerId,
                    item,
                  )
                }
              />
            </View>
            <Text style={{flex: 1, color: '#000', marginLeft: 5}}>
              {selectedId === '1' ? item?.distributorName : item?.firstName}
            </Text>
            <Text style={{flex: 0.8, color: '#000', marginRight: 3}}>
              {item?.emailId}
            </Text>
            <Text style={{flex: 0.9, color: '#000'}}>{item?.whatsappId}</Text>
          </View>
        )}
        ListEmptyComponent={
          <Text style={styles.noDataText}>Sorry, no results found!</Text>
        }
        ListFooterComponent={
          isLoading ? <ActivityIndicator size="large" color="#0000ff" /> : null
        }
      />
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.head1}>
        <TouchableOpacity onPress={handleGoBack}>
          <Image
            style={{height: 25, width: 25, marginLeft: 2}}
            source={require('../../../assets/back_arrow.png')}
          />
        </TouchableOpacity>
        <Text style={styles.txt1}>Product Style</Text>
        <View style={styles.flexSpacer} />
        <TouchableOpacity onPress={handleAddNew} style={styles.head2}>
          <Text style={styles.txt2}>Add New Style</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.head2,
            {
              backgroundColor: isAnyCheckboxSelected() ? '#1F74BA' : '#f0f0f0', // Example colors
              opacity: isAnyCheckboxSelected() ? 1 : 1,
            },
          ]}
          onPress={handlePublish}
          disabled={!isAnyCheckboxSelected()}>
          <Text style={styles.txt2}>Publish</Text>
        </TouchableOpacity>
      </View>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          marginLeft: 5,
          marginTop: 10,
        }}>
        <View style={styles.searchContainer}>
          <TextInput
            style={[
              styles.searchInput,
              {color: colorScheme === 'dark' ? '#000' : '#000'}, // Adjust text color based on theme
            ]}
            placeholder="Search"
            value={searchQueryStylesData}
            onChangeText={setSearchQueryStylesData}
            placeholderTextColor={colorScheme === 'dark' ? '#000' : '#000'} // Adjust placeholder color based on theme
          />
        </View>
        <RadioGroup
          radioButtons={radioButtons}
          onPress={setSelectedId}
          selectedId={selectedId}
          containerStyle={styles.radioGroup}
        />
      </View>
      <View style={styles.topheader}>
        <View style={{marginLeft: 10}}>
        </View>
        <Text style={styles.txtid}>ID</Text>
        <Text style={styles.txt4}>Style Name</Text>
        <Text style={styles.txt5}>Color</Text>
        <Text style={styles.txt6}>Price</Text>
      </View>
      {loading && pageNo === 1 ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : (stylesData?.length===1 && stylesData[0]===null) || stylesData?.length === 0 ? (
        <Text style={styles.noCategoriesText}>Sorry, no results found! </Text>
      ) : (
        <FlatList
          data={filteredStylesData()}
          keyExtractor={item => item?.styleId?.toString()} // Ensure styleId is unique
          renderItem={renderItem}
          onEndReached={handleEndReached}
          onEndReachedThreshold={0.1}
          onScroll={handleScroll}
          ListEmptyComponent={
            <Text style={styles.noDataText}>Sorry, no results found!</Text>
          }
          ListFooterComponent={
            loading ? <ActivityIndicator size="large" color="#0000ff" /> : null
          }
        />
      )}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => handleCloseModal}>
        <View style={styles.modalContainer1}>
          <View style={styles.modalContent1}>
            <View
              style={{
                backgroundColor: '#1F74BA',
                borderRadius: 10,
                marginHorizontal: 10,
                flexDirection: 'row',
                alignItems: 'center', // Ensure vertical alignment
                justifyContent: 'space-between', // Space between text and close button
                flexDirection: 'row',
                alignItems: 'center', // Ensure vertical alignment
                justifyContent: 'space-between', // Space between text and close button
                marginTop: 10,
                paddingVertical: 5,
                paddingVertical: 5,
              }}>
              {selectedId === '1' && (
                <Text style={[styles.txt3, {flex: 1, textAlign: 'center'}]}>
                  All Distributors
                </Text>
              )}
              {selectedId === '2' && (
                <Text style={[styles.txt3, {flex: 1, textAlign: 'center'}]}>
                  All Retailer
                </Text>
              )}
              <TouchableOpacity
                onPress={handleCloseModal}
                style={{paddingHorizontal: 10}}>
                <Image
                  style={{height: 30, width: 30}}
                  source={require('../../../assets/close.png')}
                />
              </TouchableOpacity>
            </View>

            <View style={styles.searchContainerone}>
              <TextInput
                style={[
                  styles.searchInput1,
                  {color: colorScheme === 'dark' ? '#000' : '#000'}, // Adjust text color based on theme
                ]}
                onChangeText={text => setSearchQuery(text)}
                placeholder="Search"
                placeholderTextColor={colorScheme === 'dark' ? '#000' : '#000'} // Adjust placeholder color based on theme
              />
            </View>
            <View
              style={{
                flexDirection: 'row',
                backgroundColor: '#f0f0f0',
                paddingVertical: 10, // Add padding if needed
                alignItems: 'center',
                justifyContent: 'space-between',
                borderRadius: 10,
              }}>
              <View style={{marginLeft: 10}}>
                <CustomCheckBox
                  isChecked={selectAllModel}
                  onToggle={handleSelectAllToggleModal}
                />
              </View>

              <Text style={{flex: 0.9, color: '#000', marginLeft: 3}}>
                Name
              </Text>
              <Text style={{flex: 0.7, color: '#000'}}>Email</Text>
              <Text style={{flex: 0.7, color: '#000'}}>Whatsapp Number</Text>
            </View>
            {renderModalContent()}
            <View
              style={{flexDirection: 'row', justifyContent: 'space-between'}}>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={handleCloseModal}>
                <Text style={styles.closeButtonText}>Close</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={generateCatelog}
                style={[
                  styles.closeButton,
                  isGenerating && styles.closeButtonDisabled,
                ]}
                disabled={isGenerating}>
                <Text style={styles.closeButtonText}>
                  {isGenerating ? 'Processing...' : 'ADD'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  txt1: {
    color: '#000',
    fontSize: 20,
    fontWeight: '500',
    marginHorizontal: 10,
  },
  head1: {
    marginVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  flexSpacer: {
    flex: 1,
  },
  head2: {
    alignItems: 'center',
    borderWidth: 1,
    padding: 6,
    borderRadius: 10,
    marginHorizontal: 5,
  },
  head3: {
    alignItems: 'center',
    borderWidth: 1,
    padding: 6,
    borderRadius: 10,
    marginLeft: 5,
    backgroundColor: '#1F74BA',
  },
  txt2: {
    color: '#000',
    fontWeight: '500',
  },
  txt3: {
    color: '#000',
    fontWeight: '500',
    alignSelf: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 10,
    flex: 1,
  },
  searchInput: {
    flex: 1,
    borderColor: 'gray',
    textAlign: 'left',
    paddingVertical: 5,
    paddingHorizontal: 1,
  },
  searchInput: {},
  image: {
    height: 20,
    width: 20,
  },
  radioGroup: {
    marginHorizontal: 10,
    flexDirection: 'row',
  },
  topheader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 10,
  },
  txtid: {
    flex: 0.5,
    textAlign: 'center',
    fontWeight: '500',
    color: '#000',
  },
  txt4: {
    flex: 1.3,
    textAlign: 'center',
    fontWeight: '500',
    color: '#000',
  },
  txt5: {
    flex: 1.2,
    textAlign: 'center',
    fontWeight: '500',
    color: '#000',
  },
  txt6: {
    flex: 0.8,
    textAlign: 'center',
    fontWeight: '500',
    color: '#000',
  },
  row: {
    flexDirection: 'row',
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderColor: '#ccc',
  },
  cell: {
    flex: 0.5,
    color: '#000',
  },
  cell1: {
    flex: 1.5,
    color: '#000',
  },
  cell2: {
    flex: 1,
    color: '#000',
  },
  cell3: {
    flex: 0.5,
    color: '#000',
  },
  modalContainer1: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent1: {
    backgroundColor: '#fff',
    borderRadius: 10,
    width: '90%',
    maxHeight: '80%',
  },
  modalItem: {
    paddingVertical: 10,
    flexDirection: 'row',
  },
  closeButton: {
    alignItems: 'center',
    backgroundColor: '#1F74BA',
    borderRadius: 5,
    marginHorizontal: 10,
    marginVertical: 10,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  closeButtonText: {
    color: '#000',
    fontWeight: '500',
  },
  searchContainerone: {
    borderWidth: 1,
    borderRadius: 10,
    marginVertical: 8,
    marginHorizontal: 10,
  },
  noDataText: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
  },
  modalContainerr: {
    flex: 1,
    alignItems: 'center',
    marginTop: 40,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContentt: {
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 10,
    width: '80%',
    alignItems: 'center',
    elevation: 5, // Add elevation for shadow on Android
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#000',
  },
  input: {
    borderWidth: 1,
    borderColor: 'gray',
    borderRadius: 5,
    padding: 10,
    marginBottom: 5,
    width: '100%',
  },
  errorBorder: {
    borderColor: 'red',
  },
  errorText: {
    color: 'red',
  },
  saveButton: {
    backgroundColor: '#1F74BA',
    padding: 10,
    borderRadius: 5,
    marginTop: 20,
    width: '100%',
  },
  saveButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  plusButton: {
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
  },
  noCategoriesText: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
    color: '#000',
    fontWeight: '600',
  },
  modalContainer: {
    flexGrow: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    maxHeight: '70%', // Adjust as needed
  },
  modalText: {
    fontSize: 16,
    marginBottom: 10,
    marginLeft: 10,
  },
});

export default ProductsStyles;
