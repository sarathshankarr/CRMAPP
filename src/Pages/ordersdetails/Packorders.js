import React, { useEffect, useState, useCallback } from 'react';
import {
    Text,
    View,
    FlatList,
    TouchableOpacity,
    ActivityIndicator,
    StyleSheet,
    Modal,
    TextInput,
    Image,
} from 'react-native';
import axios from 'axios';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API } from '../../config/apiConfig';

const Packorders = () => {
    const [orders, setOrders] = useState([]);
    const [pageNo, setPageNo] = useState(1);
    const [pageSize, setPageSize] = useState(20);
    const [initialSelectedCompany, setInitialSelectedCompany] = useState(null);
    const [loading, setLoading] = useState(false);
    const [firstLoad, setFirstLoad] = useState(true);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [refreshingOrders, setRefreshingOrders] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [showSearchInput, setShowSearchInput] = useState(false);
    const navigation = useNavigation();
    const selectedCompany = useSelector(state => state.selectedCompany);
    const handleGoBack = () => {
        navigation.goBack();
    };
    useEffect(() => {
        const unsubscribe = navigation.addListener('focus', () => {
            setSearchQuery('');
            setShowSearchInput(false);
        });
        return unsubscribe;
    }, [navigation]);
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
            getAllOrders();
        }
    }, [companyId]);

    const getAllOrders = () => {
        setLoading(true);
        const apiUrl = `${global?.userData?.productURL}${API.GET_ALL_ORDER
            }/${2}/${companyId}`;
        axios
            .get(apiUrl, {
                headers: {
                    Authorization: `Bearer ${global?.userData?.token?.access_token}`,
                },
            })
            .then(response => {
                setOrders(response.data.response.ordersList);
            })
            .catch(error => {
                console.error('Error:', error);
            })
            .finally(() => {
                setLoading(false);
            });
    };

    useEffect(() => {
        if (firstLoad) {
            getAllOrders();
            setFirstLoad(false);
        }
    }, [firstLoad, getAllOrders]);

    useFocusEffect(
        useCallback(() => {
            if (!firstLoad) {
                getAllOrders();
            }
        }, [firstLoad, getAllOrders]),
    );

    const loadMoreOrders = () => {
        if (!loading) {
            setPageNo(pageNo + 1);
            setLoading(true);
        }
    };

    const handleOrderPress = item => {
        if (item.packedStts === 'YET TO PACK') {
            setSelectedOrder(item);
        } else {
            navigation.navigate('PackingOrders', { orderId: item.orderId });
        }
    };

    const toggleSearchInput = () => {
        setShowSearchInput(!showSearchInput);
        if (showSearchInput) {
            setSearchQuery('');
        }
    };

    const renderItem = ({ item }) => {
        if (!item) return null;

        const customerTypeText =
            item.customerType === 1
                ? 'Retailer'
                : item.customerType === 2
                    ? 'Distributor'
                    : 'UNKNOWN';

        const getStatusColor = status => {
            switch (status.toLowerCase()) {
                case 'open':
                    return 'yellow';
                case 'partially confirmed':
                    return 'lightgreen';
                case 'confirmed':
                    return 'darkgreen';
                case 'partially cancelled':
                    return 'lightred';
                case 'cancelled':
                    return 'red';
                case 'partially confirmed and partially cancelled':
                    return 'orange';
                case 'fully returned':
                    return '#FFC0CB';
                case 'partially returned':
                    return '#FFD1DF';
                case 'delivered':
                    return '#B026FF';
                case 'partially delivered':
                    return '#CBC3E3';
                default:
                    return 'grey'; // default color for unknown statuses
            }
        };


        return (
            <View style={style.container}>
                <TouchableOpacity
                    style={style.header}
                    onPress={() => handleOrderPress(item)}>
                    <View style={style.ordheader}>
                        <View style={style.orderidd}>
                            <Text style={{ color: '#000' }}>Order No : {item.orderNum}</Text>
                            <Text style={{ color: '#000' }}>ShipQty : {item.shipQty}</Text>
                        </View>
                        <View style={style.ordshpheader}>
                            <Text style={{ color: '#000' }}>Order Date : {item.orderDate}</Text>
                            <Text style={{ color: '#000' }}>Ship Date : {item.shipDate}</Text>
                        </View>
                        <View style={style.custtlheader}>
                            <Text style={{ flex: 0.9, color: '#000' }}>
                                Customer Name : {item.customerName}
                            </Text>
                            <Text style={{ color: '#000' }}>
                                Customer Type: {customerTypeText}
                            </Text>
                        </View>
                        <View style={style.PackedStatus}>
                            <Text style={{ fontWeight: 'bold', color: '#000', flex: 0.9 }}>
                                Packing status : {item.packedStts}
                            </Text>
                            <Text style={{ color: '#000' }}>
                                Total Amount : {item.totalAmount}
                            </Text>
                        </View>
                        <View>
                            <Text
                                style={{
                                    textAlign: 'center',
                                    backgroundColor: getStatusColor(item.orderStatus),
                                    padding: 5,
                                    color: '#000',
                                    borderRadius: 5,
                                    marginHorizontal: 10,
                                    fontWeight: 'bold',
                                }}>
                                Order Status - {item.orderStatus}
                            </Text>
                        </View>
                    </View>
                </TouchableOpacity>
            </View>
        );
    };

    const filteredOrders =
        orders &&
        Array.isArray(orders) &&
        orders.filter(item => {
            if (!item) return false;
            const customerName = item.customerName
                ? item.customerName.toLowerCase()
                : '';
            const orderNum = item.orderNum
                ? item.orderNum.toString().toLowerCase()
                : '';
            const query = searchQuery.toLowerCase();
            return customerName.includes(query) || orderNum.includes(query);
        });

    return (
        <View style={{ backgroundColor: '#faf7f6', flex: 1 }}>
            <View style={{ flexDirection: "row",marginVertical:10}}>
            <TouchableOpacity onPress={handleGoBack} style={style.backButton }>
                <Image
                    style={{ height: 25, width: 25, marginRight: 8 }}
                    source={require('../../../assets/back_arrow.png')}
                />
                </TouchableOpacity>
                <View style={{ flex: 1, position: 'relative' }}>
                    <Text style={{
                        justifyContent: "center",
                        alignSelf: "center",
                        color: "#000",
                        fontWeight: "bold",

                        fontSize: 20
                    }}>
                        Packing Orders
                    </Text>
                </View>
                </View>
            <View style={style.searchContainer}>
                <TextInput
                    style={[
                        style.searchInput,
                        searchQuery.length > 0 && style.searchInputActive,
                    ]}
                    autoFocus={false}
                    value={searchQuery}
                    onChangeText={text => setSearchQuery(text)}
                    placeholder="Search"
                    placeholderTextColor="#000"
                />

                <TouchableOpacity
                    style={style.searchButton}
                    onPress={toggleSearchInput}>
                    <Image
                        style={style.image}
                        source={
                            showSearchInput
                                ? require('../../../assets/close.png')
                                : require('../../../assets/search.png')
                        }
                    />
                </TouchableOpacity>
            </View>
            {loading && orders.length === 0 ? (
                <ActivityIndicator
                    size="large"
                    color="#390050"
                    style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}
                />
            ) : filteredOrders.length === 0 ? (
                <Text style={style.noCategoriesText}>Sorry, no results found! </Text>
            ) : (
                <FlatList
                    data={filteredOrders}
                    renderItem={renderItem}
                    keyExtractor={(item, index) =>
                        item && item.orderId ? item.orderId.toString() : index.toString()
                    }
                    onEndReached={loadMoreOrders}
                    onEndReachedThreshold={0.1}
                    refreshing={refreshingOrders}
                    onRefresh={() => {
                        setRefreshingOrders(true);
                        setPageNo(1);
                        setRefreshingOrders(false);
                    }}
                    contentContainerStyle={{ paddingBottom: 70 }} // Add padding to ensure space at the bottom
                />
            )}
            {selectedOrder && (
                <Modal visible={true} transparent={true} animationType="fade">
                    <View style={style.modalContainer}>
                        <View style={style.modalContent}>
                            <View style={style.custtlheader}>
                                <Text style={{ color: '#000' }}>
                                    Order No : {selectedOrder.orderNum}
                                </Text>
                                <Text style={{ color: '#000' }}>
                                    TotalQty :{selectedOrder.totalQty}
                                </Text>
                            </View>
                            <View style={style.modelordshpheader}>
                                <Text style={{ color: '#000' }}>
                                    Order Date : {selectedOrder.orderDate}
                                </Text>
                                <Text style={{ color: '#000' }}>
                                    Ship Date : {selectedOrder.shipDate}
                                </Text>
                            </View>
                            <View style={style.custtlheader}>
                                <Text style={{ flex: 0.9, color: '#000' }}>
                                    Customer Name : {selectedOrder.customerName}
                                </Text>
                                <Text style={{ color: '#000' }}>
                                    Customer Type:{' '}
                                    {selectedOrder.customerType === 1
                                        ? 'Retailer'
                                        : selectedOrder.customerType === 2
                                            ? 'Distributor'
                                            : 'UNKNOWN'}
                                </Text>
                            </View>
                            <View style={style.custtlheader}>
                                <Text style={{ flex: 0.9, color: '#000' }}>
                                    Packing status : {selectedOrder.packedStts}
                                </Text>
                                <Text style={{ color: '#000' }}>
                                    Total Amount : {selectedOrder.totalAmount}
                                </Text>
                            </View>
                            <View style={{ marginLeft: 10 }}>
                                <Text style={{ marginTop: 5, color: '#000' }}>
                                    Order Status : {selectedOrder.orderStatus}{' '}
                                </Text>
                            </View>
                            <TouchableOpacity
                                style={style.closeButton}
                                onPress={() => setSelectedOrder(null)}>
                                <Text style={{ color: '#fff' }}>Close</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </Modal>
            )}
        </View>
    );
};

const style = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#ffffff',
        elevation: 5,
    },
    backButton: {
        marginLeft: 10
    },
    header: {
        marginBottom: 10,
        borderWidth: 1,
        marginHorizontal: 10,
        borderRadius: 10,
    },
    ordheader: {
        marginVertical: 5,
    },
    orderidd: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginHorizontal: 10,
    },
    PackedStatus: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginHorizontal: 10,
        marginVertical: 5,
    },
    ordshpheader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginHorizontal: 10,
        marginVertical: 5,
    },
    modelordshpheader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginHorizontal: 10,
        marginVertical: 5,
    },
    custtlheader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginHorizontal: 10,
        marginVertical: 5,
    },
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContent: {
        backgroundColor: '#fff',
        borderRadius: 10,
        elevation: 5,
        width: '95%',
        padding: 5,
    },
    closeButton: {
        marginTop: 10,
        alignSelf: 'center',
        backgroundColor: '#F09120',
        padding: 10,
        borderRadius: 5,
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
    noCategoriesText: {
        top: 40,
        textAlign: 'center',
        color: '#000000',
        fontSize: 20,
        fontWeight: 'bold',
        padding: 5,
    },
});

export default Packorders;
