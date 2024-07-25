import React, { useState } from 'react';
import {
  Text,
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { useDispatch } from 'react-redux';
import { addItemToCart } from '../../redux/actions/Actions';
import ModalComponent from '../../components/ModelComponent';
import ImageSlider from '../../components/ImageSlider';  // Adjust the import path as necessary

const Details = ({ route }) => {
  const {
    item,
    name,
    image,
    image2,
    image3,
    image4,
    image5,
    category,
    disription,
    tags,
    set,
  } = route.params;

  const images = [image, image2, image3, image4, image5];
  const dispatch = useDispatch();
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  const openModal = item => {
    if (item && item.styleId) {
      setSelectedItem(item);
      setModalVisible(true);
    } else {
      console.error('Invalid item format:', item);
    }
  };
  
  const toggleModal = () => {
    setModalVisible(!modalVisible);
  };

  const addItem = item => {
    dispatch(addItemToCart(item));
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollView}>
        <ImageSlider imageUrls={item && item.imageUrls ? item.imageUrls : []} />
        <View style={styles.tagsContainer}>
          <Text style={styles.detailLabel}>Style Name</Text>
          <Text style={styles.detailValue}>{item.styleName}</Text>
        </View>
        <View style={styles.priceContainer}>
          <Text style={styles.priceText}>Price: {item.mrp}</Text>
        </View>
        <View style={styles.setContainer}>
          <Text style={styles.detailLabel}>Color Name:</Text>
          <Text style={styles.detailValue}>{item.colorName}</Text>
        </View>
        <View style={styles.notesContainer}>
          <Text style={styles.notesLabel}>Description:</Text>
          <Text style={styles.txt}>{item.styleDesc}</Text>
        </View>
      </ScrollView>
      <TouchableOpacity onPress={() => openModal(item)} style={styles.buttonContainer}>
        <Text style={styles.buttonText}>ADD QUANTITY</Text>
      </TouchableOpacity>

      <ModalComponent
        modalVisible={modalVisible}
        closeModal={() => setModalVisible(false)}
        selectedItem={selectedItem}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollView: {
    flexGrow: 1,
    paddingBottom: 60, // Ensure space for the button
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 20,
    paddingHorizontal: 10,
    width: '100%',
    borderBottomWidth: 1,
    borderBottomColor: '#000',
    marginVertical: 10,
  },
  tagsContainer: {
    marginHorizontal: 10,
    width: '100%',
    borderBottomWidth: 1,
    borderBottomColor: '#000',
    marginVertical: 10,
  },
  setContainer: {
    flexDirection: 'row',
    paddingHorizontal: 10,
    width: '100%',
    borderBottomWidth: 1,
    borderBottomColor: '#000',
    marginVertical: 10,
    alignItems: "center"
  },
  notesContainer: {
    marginHorizontal: 10,
    width: '100%',
    borderBottomWidth: 1,
    borderBottomColor: '#000',
    marginBottom: 10,
  },
  priceText: {
    marginVertical: 10,
    fontSize: 20,
    color: '#000',
    fontWeight: 'bold',
  },
  detailLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    marginVertical: 10,
    marginRight: 10,
    color:"#000"
  },
  detailValue: {
    fontSize: 18,
    marginHorizontal:5,
    color:"#000"
  },
  notesLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color:"#000"
  },
  txt: {
    fontSize: 20,
    color: '#000',
    marginHorizontal: 5,
  },
  buttonContainer: {
    borderWidth: 1,
    // backgroundColor: '#f55951',
    backgroundColor: '#F09120',
    width: '100%',
    paddingVertical: 13,
  },
  buttonText: {
    textAlign: 'center',
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
});

export default Details;
