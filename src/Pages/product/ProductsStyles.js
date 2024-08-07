import React, {useEffect, useState} from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {useSelector} from 'react-redux';
import CustomCheckBox from '../../components/CheckBox';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import {API} from '../../config/apiConfig';

const ProductsStyles = ({navigation}) => {
  const [loading, setLoading] = useState(false);
  const [initialSelectedCompany, setInitialSelectedCompany] = useState(null);
  const selectedCompany = useSelector(state => state.selectedCompany);
  const [stylesData, setStylesData] = useState([]);
  const [searchQueryStylesData, setSearchQueryStylesData] = useState('');
  const [pageNo, setPageNo] = useState(1);
  const [totalPages, setTotalPages] = useState(1); // Assuming 1 as default total pages
  const [checkedStyleIds, setCheckedStyleIds] = useState([]);
  const [scrollPosition, setScrollPosition] = useState(0); // Added missing state
  const [isDarkTheme, setIsDarkTheme] = useState(false);
  const [checkedModalIds, setCheckedModalIds] = useState([]);

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

  const handleEndReached = () => {
    if (pageNo < totalPages && !loading) {
      setPageNo(prevPageNo => prevPageNo + 1);
    }
  };

  const handleScroll = event => {
    setScrollPosition(event.nativeEvent.contentOffset.y);
  };
  const isAnyCheckboxSelected = () => {
    return checkedStyleIds.length > 0 || checkedModalIds.length > 0;
  };
  useEffect(() => {
    if (companyId) {
      getAllProducts(companyId);
    }
  }, [companyId, pageNo]);

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
        setStylesData(prevData => [
          ...prevData,
          ...(response?.data?.response?.stylesList || []),
        ]);
        setTotalPages(response?.data?.response?.totalPages || 1); // Update total pages if available
      })
      .catch(error => {
        console.error('Error:', error);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const handleGoBack = () => {
    navigation.goBack();
  };

  const handleAddNew = () => {
    navigation.navigate('AddNewStyle');
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

  const handleCheckBoxToggleStyle = styleId => {
    setCheckedStyleIds(
      prevIds =>
        prevIds.includes(styleId)
          ? prevIds.filter(id => id !== styleId) // Uncheck if already checked
          : [...prevIds, styleId], // Check if not checked
    );
  };

  const renderItem = ({item}) => (
    <View style={styles.row}>
      <CustomCheckBox
        isChecked={checkedStyleIds.includes(item.styleId)}
        onToggle={() => handleCheckBoxToggleStyle(item.styleId)}
      />
      <Text style={styles.cell}>{item?.styleNum}</Text>
      <Text style={styles.cell1}>{item?.styleName}</Text>
      <Text style={styles.cell2}>{item?.colorName}</Text>
      <Text style={styles.cell3}>{item?.mrp}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.head1}>
        <TouchableOpacity onPress={handleGoBack}>
          <Image
            style={{height: 25, width: 25, marginLeft: 2}}
            source={require('../../../assets/back_arrow.png')}
          />
        </TouchableOpacity>
        <Text style={styles.txt1}>Product Publish</Text>
        <View style={styles.flexSpacer} />
        <TouchableOpacity style={styles.head2}>
          <Text style={styles.txt2}>Upload</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={handleAddNew} style={styles.head2}>
          <Text style={styles.txt2}>Add New Style</Text>
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
            style={{
              marginLeft: 10,
              color: isDarkTheme ? '#fff' : 'black', // Change text color based on theme
            }}
            placeholder="Search"
            placeholderTextColor={isDarkTheme ? '#fff' : '#000'} // Placeholder color
            value={searchQueryStylesData}
            onChangeText={text => setSearchQueryStylesData(text)}
          />
        </View>
        <TouchableOpacity
          style={[
            styles.head2,
            {
              backgroundColor: isAnyCheckboxSelected() ? '#1F74BA' : '#f0f0f0', // Example colors
              opacity: isAnyCheckboxSelected() ? 1 : 1,
            },
          ]}
          //   onPress={handlePublish}
          disabled={!isAnyCheckboxSelected()}>
          <Text style={styles.txt2}>Publish</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.topheader}>
        <Text style={styles.txtid}>ID</Text>
        <Text style={styles.txt4}>Style Name</Text>
        <Text style={styles.txt5}>Color</Text>
        <Text style={styles.txt6}>Price</Text>
      </View>
      {loading && pageNo === 1 ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : (
        <FlatList
          data={filteredStylesData()}
          keyExtractor={item => `${item.styleId}-${item.colorName}`} // Ensure styleId is unique
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
  txt2: {
    color: '#000',
    fontWeight: '500',
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
    alignItems: 'center',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
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
  noDataText: {
    textAlign: 'center',
    marginVertical: 20,
    fontSize: 16,
    color: '#000',
  },
});

export default ProductsStyles;
