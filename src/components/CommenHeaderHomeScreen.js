import React from 'react';
import {View, TouchableOpacity, Image, Text, StyleSheet} from 'react-native';
import {useSelector} from 'react-redux';
import {useNavigation} from '@react-navigation/native';

const CommenHeaderHomeScreen = ({
  title,
  showDrawerButton,
  showMessageIcon,
  showLocationIcon,
  showCartIcon,
}) => {
  const navigation = useNavigation();
  const cartItems = useSelector(state => state.cartItems);

  const goToCart = () => {
    navigation.navigate('Cart');
  };

  const cartItemCount = cartItems.length;

  return (
    <View style={styles.header}>
      {showDrawerButton && (
        <TouchableOpacity onPress={() => navigation.openDrawer()}>
          <Image
            resizeMode="contain"
            source={require('../../assets/menu.png')}
            style={styles.menuimg}
          />
        </TouchableOpacity>
      )}
      <View style={styles.rightContainer}>
        {showLocationIcon && (
          <TouchableOpacity style={styles.iconWrapper}>
            <Image
              resizeMode="contain"
              style={styles.locationimg}
              source={require('../../assets/location-pin.png')}
            />
          </TouchableOpacity>
        )}
        {showMessageIcon && (
          <TouchableOpacity style={styles.iconWrapper}>
            <Image
              style={styles.msgimg}
              source={require('../../assets/chat.png')}
            />
          </TouchableOpacity>
        )}
        {showCartIcon && (
          <TouchableOpacity style={styles.iconWrapper} onPress={goToCart}>
            <View style={styles.cartContainer}>
              <Image
                resizeMode="contain"
                style={styles.cartimg}
                source={require('../../assets/grocery-store.png')}
              />
              {cartItemCount > 0 && (
                <Text style={styles.cartItemCount}>{cartItemCount}</Text>
              )}
            </View>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    paddingVertical: 10,
    backgroundColor: '#fff',
  },
  rightContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight:5,
  },
  iconWrapper: {
    marginHorizontal: 5,
  },
  locationimg: {
    height: 22,
    width: 22,
    // tintColor:'#1F74BA'
  },
  msgimg: {
    height: 22,
    width: 22,
    // tintColor:'#1F74BA'
  },
  cartContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
  },
  cartimg: {
    height: 25,
    width: 25,
    // tintColor:'#1F74BA'
  },
  cartItemCount: {
    position: 'absolute',
    bottom: 14,
    left: 19,
    backgroundColor: '#E12948',
    color: 'white',
    borderRadius: 10,
    paddingHorizontal: 5,
    fontSize: 12,
  },
  menuimg: {
    height: 30,
    width: 30,
    marginHorizontal: 5,
    // tintColor:'#1F74BA',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color:'#000000'
  },
});

export default CommenHeaderHomeScreen;
