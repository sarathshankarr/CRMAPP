import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native'
import React, { useEffect, useState } from 'react';
import { API } from '../../config/apiConfig';
import axios from 'axios';
import { useSelector } from 'react-redux';


const UploadProductImage = ({route}) => {

  const [productStyle, setProductStyle]=useState({});
  const [allProductStyles, setAllProductStyles]=useState([]);
  const [isloading, setIsLoading]=useState(false);

    const selectedCompany = useSelector(state => state.selectedCompany);

    const companyId = selectedCompany?.id;


  useEffect(()=>{
    if (route.params && route?.params?.productStyle) {
      const styleDetails = route?.params?.productStyle;
      setProductStyle(styleDetails);
      console.log("route params =======> ", styleDetails);
    }

    getStyleList();
  }, []);




const getStyleList=()=>{
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
}

const handleSave=()=>{
  if(ValidateStyle()){
    console.log("Validation true")
    handleSaving();
  }else{
    console.log("Validation false")
  }
}

  const ValidateStyle=()=>{
    if(allProductStyles && allProductStyles[0]){
      const styleRecord = allProductStyles.find(
          (style) =>
              style.styleName.trim().toLowerCase() ===
          productStyle.styleName.trim().toLowerCase() &&
              (productStyle.myItems.some(
                  (item) => style.colorId === item.colorId
              ) ||
              productStyle.colorId === style.colorId)
      );
      console.log(styleRecord ? "Already exist!" : "Validated ! , you can add this style")
      return styleRecord ? false : true;
  }else{
      return true;
  }
  }

  const handleSaving=()=>{

    let formData = new FormData();

    formData.append("styleId", "0");
    formData.append("styleName", productStyle.styleName);
    formData.append("styleDesc", productStyle.styleDesc);
    formData.append("colorId", productStyle.colorId);
    formData.append("price", productStyle.price);
    formData.append("typeId", productStyle.typeId);
    formData.append("retailerPrice", productStyle.retailerPrice);
    formData.append("mrp", productStyle.mrp);
    // formData.append("files", []);
    formData.append("scaleId",productStyle.scaleId);
    formData.append("sizeGroupId",productStyle.sizeGroupId);

    formData.append("styleQuality","");
    formData.append("fabricQuality","");

    formData.append("gsm",productStyle.gsm);

    formData.append("gst","");

    formData.append("customerLevel",productStyle.customerLevel);
    formData.append("customerLevelPrice",productStyle.customerLevelPrice);
    formData.append("hsn",productStyle.hsn);
    formData.append("discount",0);
    formData.append("publishType","");
    formData.append("categoryId",productStyle.categoryId);
    formData.append("locationId",productStyle.locationId);
    if(productStyle.fixDisc===null || productStyle.fixDisc===''){
        productStyle.fixDisc=0;
    }
    formData.append("fixDisc",productStyle.fixDisc);
    formData.append("companyId",productStyle.companyId);
    formData.append("pub_to_jakya",0);
    formData.append("styleNum",0);
    formData.append("closureId",0);
    formData.append("peakId",0);
    formData.append("logoId",0);
    formData.append("decId",0);
    formData.append("trimId",0);
    formData.append("processId",productStyle.processId);
    formData.append("cedgeStyle",productStyle.cedgeStyle);
    formData.append("compFlag",productStyle.compFlag);
    formData.append("companyName",productStyle.companyName);
    formData.append("sizesListReq",productStyle.sizesListReq);
    formData.append("myItems",productStyle.myItems);

    console.log("formdata before saving ===========> ", formData);


    const apiUrl0 = `${global?.userData?.productURL}${API.ADD_NEW_STYLE}`;
    console.log("apiUrl0 ", apiUrl0)

    setIsLoading(true);

    console.log('ADD_NEW_STYLE', apiUrl0);
    axios
      .post(apiUrl0, formData, {
        headers: {
          'Content-Type': 'multipart/form-data', // Add Content-Type header
          Authorization: `Bearer ${global?.userData?.token?.access_token}`,
        },
      })
      .then(response => {
        Alert.alert(`NeW style Created Successfully `);
        getCategoriesList();
        console.log("Response===> ", response);
        setIsLoading(false);
      })
      .catch(error => {
        console.error('Error:', error);
        // Alert.alert('Error', error);
        setIsLoading(false);
      });
  }
 


  return (
    <View>
      <Text style={{textAlign:'center',marginVertical:20, fontWeight:'bold'}}>UploadProductImage</Text>
      <TouchableOpacity
        style={{
          backgroundColor: '#1F74BA',
          padding: 10,
          borderRadius: 5,
          marginTop: 20,
          width: '90%',
          marginHorizontal: 20
        }}
        onPress={handleSave}>
        <Text style={style.saveButtonText}>Save</Text>
      </TouchableOpacity>
    </View>
  )
}

export default UploadProductImage;


const style = StyleSheet.create({
  saveButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    textAlign: 'center',
  },
})