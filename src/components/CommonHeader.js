import React from 'react';
import {View, TouchableOpacity, Image, Text, StyleSheet} from 'react-native';
import {useSelector} from 'react-redux';
import {useNavigation} from '@react-navigation/native';

const CommonHeader = ({
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
      {showDrawerButton ? (
        <TouchableOpacity onPress={() => navigation.openDrawer()}>
          <Image
            resizeMode="contain"
            source={require('../../assets/menu.png')}
            style={styles.menuimg}
          />
        </TouchableOpacity>
      ) : (
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Image
            resizeMode="contain"
            source={require('../../assets/back_arrow.png')}
            style={styles.menuimg}
          />
        </TouchableOpacity>
      )}
      <Text style={styles.title}>{title}</Text>
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
// #1F74BA

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    paddingVertical: 10,
    backgroundColor: 'white',
    elevation:5,
  },
  rightContainer: {
    flexDirection: 'row',
    alignItems: 'left',
    justifyContent:'space-between',
  },
  iconWrapper: {
    marginHorizontal: 5,
  },
  locationimg: {
    height: 20,
    width: 20,
  },
  msgimg: {
    height: 20,
    width: 20,
    
  },
  cartContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
  },
  cartimg: {
    height: 23,
    width: 23,
  },
  cartItemCount: {
    position: 'absolute',
    bottom:15 ,
    left: 15,
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
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color:"#000"
    
  },
});

export default CommonHeader;
