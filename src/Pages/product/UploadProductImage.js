import { View, Text, TouchableOpacity, StyleSheet, Alert, Image, ScrollView } from 'react-native';
import React, { useEffect, useState } from 'react';
import ImagePicker from 'react-native-image-crop-picker';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { API } from '../../config/apiConfig';

const UploadProductImage = ({ route }) => {
  const [productStyle, setProductStyle] = useState({});
  const [allProductStyles, setAllProductStyles] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [saveBtn, setSaveBtn] = useState(false);
  const [selectedImages, setSelectedImages] = useState([]); // State to hold selected images

  const selectedCompany = useSelector(state => state.selectedCompany);
  const companyId = selectedCompany?.id;

  useEffect(() => {
    if (route.params && route?.params?.productStyle) {
      const styleDetails = route?.params?.productStyle;
      setProductStyle(styleDetails);
      console.log("route params from upload inside =======> ", styleDetails);
      setSaveBtn(true);
    }

    getStyleList();
  }, [route]);

  const getStyleList = () => {
    const apiUrl = `${global?.userData?.productURL}${API.GET_STYLE_LIST}${companyId}`;
    setIsLoading(true);
    console.log('GET_STYLE_LIST URL===>', apiUrl);
    axios
      .get(apiUrl, {
        headers: {
          Authorization: `Bearer ${global?.userData?.token?.access_token}`,
        },
      })
      .then(response => {
        setAllProductStyles(response?.data.response.customerLevelTypeList || []);
        setIsLoading(false);
      })
      .catch(error => {
        console.error('Error:', error);
        setIsLoading(false);
      });
  };

  const selectImages = () => {
    if (selectedImages.length >= 10) {
      Alert.alert('Image Limit Reached', 'You can only upload a maximum of 10 images.');
      return;
    }
  
    ImagePicker.openPicker({
      multiple: true,
      maxFiles: 10 - selectedImages.length,
      mediaType: 'photo',
      cropping: true, // Enable cropping
    }).then(images => {
      const imageArray = images.map(image => ({
        uri: image.path,
        width: image.width,
        height: image.height,
        mime: image.mime,
      }));
  
      if (selectedImages.length + imageArray.length > 10) {
        Alert.alert('Image Limit Exceeded', 'You can only upload a maximum of 10 images.');
      } else {
        setSelectedImages([...selectedImages, ...imageArray]); 
        console.log('Selected images: ', imageArray);
      }
    }).catch(error => {
      console.error('Error selecting images: ', error);
    });
  };
  

  const removeImage = (index) => {
    const updatedImages = selectedImages.filter((_, i) => i !== index);
    setSelectedImages(updatedImages);
  };

  const handleSave = () => {
    if (ValidateStyle()) {
      console.log("Validation true");
      handleSaving();
    } else {
      console.log("Validation false");
    }
  };

  const ValidateStyle = () => {
    if (allProductStyles && allProductStyles[0]) {
      const styleRecord = allProductStyles.find(
        (style) =>
          style.styleName.trim().toLowerCase() ===
          productStyle.styleName.trim().toLowerCase() &&
          (productStyle.myItems.some(
            (item) => style.colorId === item.colorId
          ) ||
            productStyle.colorId === style.colorId)
      );
      console.log(styleRecord ? "Already exist!" : "Validated ! , you can add this style");
      return styleRecord ? false : true;
    } else {
      return true;
    }
  };

  const handleSaving = () => {
    let formData = new FormData();
  
    formData.append("styleName", productStyle.styleName);
    formData.append("styleDesc", productStyle.styleDesc);
    formData.append("colorId", productStyle.colorId);
    formData.append("price", productStyle.price);
    formData.append("typeId", productStyle.typeId);
    formData.append("sizeGroupId", productStyle.sizeGroupId);
    formData.append("scaleId", productStyle.scaleId);
    formData.append("sizesListReq", productStyle.sizesListReq);
    formData.append("customerLevel", productStyle.customerLevel);
    formData.append("customerLevelPrice", productStyle.customerLevelPrice);
    formData.append("discount", 0);
    formData.append("retailerPrice", productStyle.retailerPrice);
    formData.append("mrp", productStyle.mrp);
    formData.append("myItems", productStyle.myItems);
    formData.append("categoryId", productStyle.categoryId);
    formData.append("locationId", productStyle.locationId);
    if (productStyle.fixDisc === null || productStyle.fixDisc === '') {
      productStyle.fixDisc = 0;
    }
    formData.append("fixDisc", productStyle.fixDisc);
    formData.append("companyId", productStyle.companyId);
    formData.append("processId", productStyle.processId);
    formData.append("cedgeStyle", productStyle.cedgeStyle);
    formData.append("compFlag", productStyle.compFlag);
    formData.append("companyName", productStyle.companyName);
  
    selectedImages.forEach((image, index) => {
      formData.append('files', {
        uri: image.uri,
        type: image.mime,
        name: `image_${index}.jpg`,
      });
    });
  
    console.log("formdata before saving ===========> ", formData);
  
    const apiUrl0 = `${global?.userData?.productURL}${API.ADD_NEW_STYLE}`;
    console.log("apiUrl0 ", apiUrl0);
  
    setIsLoading(true);
  
    axios
      .post(apiUrl0, formData, {
        headers: {
          'Content-Type': 'multipart/form-data', // Add Content-Type header
          Authorization: `Bearer ${global?.userData?.token?.access_token}`,
        },
      })
      .then(response => {
        Alert.alert('New style created successfully');
        console.log("Response===> ", response);
        setIsLoading(false);
      })
      .catch(error => {
        console.error('Error:', error);
        setIsLoading(false);
      });
  };
  

  return (
    <View>
     
      <TouchableOpacity style={styles.uploadimg} onPress={selectImages}>
        <Image style={{height:80,width:80}} source={require('../../../assets/uploadsel.png')} />

        <Text
        style={{textAlign:'center', marginVertical:20, fontWeight:'bold'}}
      >
        Upload Product Image
      </Text>
      </TouchableOpacity>

      <View style={{ marginVertical: 10,flexWrap:"wrap",flexDirection:"row",justifyContent:"space-evenly" }}>
        {selectedImages.map((image, index) => (
          <View key={index} style={{ position: 'relative',paddingVertical:10 }}>

            <Image
              source={{ uri: image.uri }}
              style={{ width: 65, height: 65, marginHorizontal: 5 }}
              resizeMode="cover"
            />
            <TouchableOpacity
              style={styles.removeButton}
              onPress={() => removeImage(index)}
            >
              <Text style={styles.removeButtonText}>X</Text>
            </TouchableOpacity>
          </View>
        ))}
      </View>

      <TouchableOpacity
        style={{
          backgroundColor: saveBtn ? '#1F74BA' : 'skyblue',
          padding: 10,
          borderRadius: 5,
          marginTop: 20,
          width: '90%',
          marginHorizontal: 20
        }}
        disabled={!saveBtn}
        onPress={handleSave}
      >
        <Text style={styles.saveButtonText}>Save</Text>
      </TouchableOpacity>
    </View>
  );
};

export default UploadProductImage;

const styles = StyleSheet.create({
  saveButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  removeButton: {
    position: 'absolute',
    top: 0, // Position the button at the top edge of the image
    right: 0, // Align the button to the right edge
    backgroundColor: 'gray',
    borderRadius: 15,
    width: 25,
    height: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  uploadimg:{
    justifyContent:"center",
    alignItems:"center",
    marginTop:20,
  }
});
