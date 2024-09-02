import { View, Text, FlatList, StyleSheet, Image, TouchableOpacity, ActivityIndicator } from 'react-native';
import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { API } from '../../config/apiConfig';
import axios from 'axios';
import { useNavigation } from '@react-navigation/native';

const Notifications = () => {

  const navigation = useNavigation();
  const [notifications, set_notifications] = useState([]);
  const companyId = useSelector(state => state.selectedCompany.id);
  // const userId = useSelector(state => state?.loggedInUser?.userId);
  const userId = 1;
  const roleId = useSelector(state => state?.loggedInUser?.roleId);
  console.log("user details=====> ", companyId, userId, roleId);
  const [latestId, setLatestId] = useState(0);
  const [isLoading, setIsLoading] = useState(false);


  useEffect(() => {
    getNotificationsList();
  }, [])

  const getNotificationsList = () => {
    const apiUrl = `${global?.userData?.productURL}${API.GET_NOTIFICATION_LIST}/${userId}/${roleId}/${companyId}`;
    setIsLoading(true);
    console.log('customer api===>', apiUrl);
    axios
      .get(apiUrl, {
        headers: {
          Authorization: `Bearer ${global?.userData?.token?.access_token}`,
        },
      })
      .then(response => {
        set_notifications(response?.data || []);
        setIsLoading(false);
        setLatestId(response?.data[0]?.id);
        console.log(
          'INSIDE CUSTOMERS ===> ',
          response.data,
        );
      })
      .catch(error => {
        console.error('Error:', error);
        setIsLoading(false);
      });
  };

  const updateRead = (Id) => {
    // const latestId = 10;
    const apiUrl = `${global?.userData?.productURL}${API.UPDATE_READ_MSG}/${Id}/${userId}/${roleId}/${companyId}`;
    setIsLoading(true);
    console.log('customer api===>', apiUrl);
    axios
      .get(apiUrl, {
        headers: {
          Authorization: `Bearer ${global?.userData?.token?.access_token}`,
        },
      })
      .then(response => {

        console.log(
          'INSIDE updateRead  ===> ',
          response.data,
        );


      })
      .catch(error => {
        console.error('Error:', error);
        setIsLoading(false);
      });
  };

  const handleBacktton = () => {
    navigation.goBack();
    updateRead(latestId);
  }

  const renderItem = ({ item }) => (
    <View style={styles.notificationItem}>
      <Text style={item.m_read === 0 ? styles.messageTextUnRead : styles.messageTextRead}>
        {item.m_msg}
      </Text>
      {item.m_read === 0 && <View style={styles.unreadDot} />}
    </View>
  );

  return (
    <>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => handleBacktton()}>
          <Image
            resizeMode="contain"
            source={require('../../../assets/back_arrow.png')}
            style={styles.menuimg}
          />
        </TouchableOpacity>
        <View style={{ alignItems: 'center' }}>
          <Text style={{ color: '#000', fontSize: 18, textAlign: 'center', fontWeight: 'bold' }}>Notifications</Text>
        </View>
      </View>

      {isLoading ? (
        <ActivityIndicator
          style={{
            position: 'absolute',
            top: 200,
            left: '50%',
            marginLeft: -20,
            marginTop: -20,
          }}
          size="large"
          color="#1F74BA"
        />
      ) :
        (<View style={styles.container}>
          <FlatList
            data={notifications}
            renderItem={renderItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.list}
          />
        </View>)

      }
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // padding: 16,
    backgroundColor: '#f8f8f8',
  },
  list: {
    paddingBottom: 16,
  },
  menuimg: {
    height: 30,
    width: 30,
    marginHorizontal: 5,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    // justifyContent: 'space-between',
    paddingHorizontal: 10,
    paddingVertical: 10,
    backgroundColor: 'white',
    elevation: 5,
    // flex:1,
    marginBottom: 20,
  },
  notificationItem: {
    flexDirection: 'row', // Arrange text and dot horizontally
    justifyContent: 'space-between', // Space between text and dot
    alignItems: 'center', // Vertically center items
    padding: 12,
    marginBottom: 10,
    borderRadius: 8,
    backgroundColor: '#fff',
    elevation: 2, // for shadow on Android
    shadowColor: '#000', // for shadow on iOS
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    width: '90%',
    marginHorizontal: 10
  },
  messageTextRead: {
    fontSize: 16,
    // color: '#888', // Lighter color for read messages
    color: '#000', // Lighter color for read messages
    fontWeight: 'normal',
  },
  messageTextUnRead: {
    fontSize: 16,
    color: '#000', // Darker color for unread messages
    fontWeight: 'bold', // Bold font for unread messages
  },
  unreadDot: {
    width: 10,
    height: 10,
    borderRadius: 5, // Make the dot circular
    backgroundColor: '#ff0000', // Red color for the dot
  },
});


export default Notifications;

