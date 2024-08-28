import { View, Text, FlatList, StyleSheet } from 'react-native';
import React from 'react';

const Notifications = () => {
  const messages = [
    { id: '1', message: 'Your order has been shipped!' },
    { id: '2', message: 'New product arrivals are here!' },
    { id: '3', message: 'Your profile was updated successfully.' },
    { id: '4', message: 'You have a new message from support.' },
    { id: '5', message: 'Reminder: Your subscription renews tomorrow.' },
  ];

  const renderItem = ({ item }) => (
    <View style={styles.notificationItem}>
      <Text style={styles.messageText}>{item.message}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={messages}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f8f8f8',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  list: {
    paddingBottom: 16,
  },
  notificationItem: {
    padding: 12,
    marginBottom: 10,
    borderRadius: 8,
    backgroundColor: '#fff',
    elevation: 2, // for shadow on Android
    shadowColor: '#000', // for shadow on iOS
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  messageText: {
    fontSize: 16,
    color: '#333',
  },
});

export default Notifications;


// import { View, Text, ScrollView, StyleSheet } from 'react-native';
// import React from 'react';

// const Notifications = () => {
//   const messages = [
//     'Your order has been shipped!',
//     'New product arrivals are here!',
//     'Your profile was updated successfully.',
//     'You have a new message from support.',
//     'Reminder: Your subscription renews tomorrow.',
//   ];

//   return (
//     <View style={styles.container}>
//       <ScrollView contentContainerStyle={styles.list}>
//         {messages.map((message, index) => (
//           <View key={index} style={styles.notificationItem}>
//             <Text style={styles.messageText}>{message}</Text>
//           </View>
//         ))}
//       </ScrollView>
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     padding: 16,
//     backgroundColor: '#e5e5e5',
//   },
//   title: {
//     fontSize: 24,
//     fontWeight: 'bold',
//     color: '#333',
//     marginBottom: 12,
//     borderBottomWidth: 2,
//     borderBottomColor: '#ddd',
//     paddingBottom: 8,
//   },
//   list: {
//     paddingBottom: 16,
//   },
//   notificationItem: {
//     padding: 16,
//     marginBottom: 12,
//     borderRadius: 12,
//     backgroundColor: '#fff',
//     borderColor: '#ddd',
//     borderWidth: 1,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 4 },
//     shadowOpacity: 0.2,
//     shadowRadius: 6,
//     elevation: 3,
//   },
//   messageText: {
//     fontSize: 16,
//     color: '#333',
//   },
// });

// export default Notifications;

