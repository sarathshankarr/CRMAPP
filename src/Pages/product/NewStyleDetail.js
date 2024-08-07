import { View, Text, ScrollView, TouchableOpacity, Image, ActivityIndicator, StyleSheet, TextInput, Modal, Alert } from 'react-native'
import React, { useState } from 'react'

const NewStyleDetail = () => {
  const [showCategoryList, setshowCategoryList] = useState('false');
  const [categoryList, setCategoryList] = useState([
    { id: 1, name: 'Technology' },
    { id: 2, name: 'Science' },
    { id: 3, name: 'Health' },
    { id: 4, name: 'Travel' },
    { id: 5, name: 'Food' },
    { id: 6, name: 'Education' },
    { id: 7, name: 'Entertainment' },
    { id: 8, name: 'Sports' }
  ]);
  const [filteredCategories, setFilteredCategories] = useState([
    { id: 1, name: 'Technology' },
    { id: 2, name: 'Science' },
    { id: 3, name: 'Health' },
    { id: 4, name: 'Travel' },
    { id: 5, name: 'Food' },
    { id: 6, name: 'Education' },
    { id: 7, name: 'Entertainment' },
    { id: 8, name: 'Sports' }
  ]);
  const [selectedCatgory, setSelectedCategory] = useState('');
  const [selectedCatgoryId, setSelectedCategoryId] = useState(0);

  const [categoryModel, setcategoryModel] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [searchQuery, setSearchQuery] = useState('');

  const [CategoryName, setCategoryName]=useState('');
  const [CategoryDesc, setCategoryDesc]=useState('');
  const [styleName, setStyleName]=useState('');
  const [styleDesc, setStyleDesc]=useState('');
  const [dealerPrice, setDealerPrice]=useState('');
  const [retailerPrice, setRetailerPrice]=useState('');
  const [mrp, setMrp]=useState('');
  const [fixedDiscount, setfixedDiscount]=useState('');
  const [color, setColor]=useState('');
  const [colorCode, setColorCode]=useState('');
  const [types, setTypes]=useState('');
  const [seasonGroups, setSeasonGroups]=useState('');
  const [styleQuantity, setStyleQuantity]=useState('');
  const [fabricQuantity, setFabricQuantity]=useState('');
  const [gsm, setGsm]=useState('');
  const [hsn, setHsn]=useState('');
  const [clousures, setClousures]=useState('');
  const [peak, setPeak]=useState('');
  const [logo, setlogo]=useState('');
  const [decoration, setDecoration]=useState('');
  const [trims, setTrims]=useState('');
  const [processWorkFlow, setProcessWorkFlow]=useState('');
  const [location, setLocation]=useState('');
  const [scales, setScales]=useState('');



  const handleCategoryDropDown = () => {
    setshowCategoryList(!showCategoryList);
  }
  const handleSelectCategory = (item) => {
    setSelectedCategory(item.name);
    setSelectedCategoryId(item.id);
  }

  const filtercategories = text => {
    const filtered = categoryList.filter((item) => item?.name?.toUpperCase().includes(text?.toUpperCase()));
    setFilteredCategories(filtered);
  }


  const toggleModal = () => {
    setcategoryModel(!categoryModel);
    // Reset error fields and input values when modal is closed
   
  };
  const handleCloseModalDisRet = () => {
    setcategoryModel(false);
    // setInputValues([]); // Assuming inputValues should be an array too
    // setErrorFields([]);
  };
  const handleSaveButtonPress = () => {
    Alert("Saved !!")
    setcategoryModel(false);

  };


  return (
    <ScrollView style={style.conatiner}>
      <View style={{ flexDirection: 'row', marginTop: 10, alignItems: 'center' }}>
        <View>
          <TouchableOpacity
            style={{
              width: '90%',
              height: 50,
              borderRadius: 10,
              borderWidth: 0.5,
              alignSelf: 'center',
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              paddingLeft: 15,
              paddingRight: 15,
            }}
            onPress={handleCategoryDropDown}>
            <Text style={{ fontWeight: '600', color: "#000" }}>
              {"Category *"}
            </Text>

            <Image
              source={require('../../../assets/dropdown.png')}
              style={{ width: 20, height: 20 }}
            />
          </TouchableOpacity>
          {isLoading && ( // Show ActivityIndicator if isLoading is true
            <ActivityIndicator
              style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                marginLeft: -20,
                marginTop: -20,
              }}
              size="large"
              color="#1F74BA"
            />
          )}
        </View>
        <View style={{ alignItems: 'center' }}>
          <TouchableOpacity
            onPress={toggleModal}
            style={style.plusButton}>
            <Image
              style={{
                height: 30,
                width: 30,
                justifyContent: 'center',
                alignItems: 'center',
              }}
              source={require('../../../assets/plus.png')}
            />
          </TouchableOpacity>
        </View>
      </View>
      {showCategoryList && (
        <View
          style={{
            elevation: 5,
            height: 300,
            alignSelf: 'center',
            width: '90%',
            backgroundColor: '#fff',
            borderRadius: 10,
          }}>
          <TextInput
            style={{
              marginTop: 10,
              borderRadius: 10,
              height: 40,
              borderColor: 'gray',
              borderWidth: 1,
              marginHorizontal: 10,
              paddingLeft: 10,
              marginBottom: 10,
              color: '#000000',
            }}
            placeholderTextColor="#000"
            placeholder="Search"
            onChangeText={filtercategories}
          />

          {filteredCategories.length === 0 && !isLoading ? (
            <Text style={style.noCategoriesText}>
              Sorry, no results found!
            </Text>
          ) : (
            <ScrollView  nestedScrollEnabled={true}>
              {filteredCategories?.map((item, index) => (
                <TouchableOpacity
                  key={index}
                  style={{
                    width: '100%',
                    height: 50,
                    justifyContent: 'center',
                    borderBottomWidth: 0.5,
                    borderColor: '#8e8e8e',
                  }}
                  onPress={() => handleSelectCategory(item)
                  }>
                  <Text
                    style={{
                      fontWeight: '600',
                      marginHorizontal: 15,
                      color: '#000',
                    }}>
                    {item?.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}
        </View>
      )}
      <Text style={{marginHorizontal: 10, marginVertical: 3,color:"#000"}}>{"Style Neme *"}</Text>
      <View style={style.inputContainer}>
        <TextInput
          style={style.txtinput}
          placeholder="Style name"
          placeholderTextColor="#000"
          value={styleName}
          onChangeText={(text)=>setStyleName(text)}
        />
      </View>
      <Text style={{marginHorizontal: 10, marginVertical: 3,color:"#000"}}>
        {"Style Description *"}
      </Text>

      <View style={style.inputContainer}>
        <TextInput
          style={style.txtinput}
          placeholder="style Description"
          placeholderTextColor="#000"
          value={styleDesc}
          onChangeText={(text)=>setStyleDesc(text)}
        />
      </View>
      <Text style={{marginHorizontal: 10, marginVertical: 3,color:"#000"}}>
        {"Dealer Price *"}
      </Text>

      <View style={style.inputContainer}>
        <TextInput
          style={style.txtinput}
          placeholder="Dealer Price"
          placeholderTextColor="#000"
          value={dealerPrice}
          onChangeText={(text)=>setDealerPrice(text)}
        />
      </View>
      <Text style={{marginHorizontal: 10, marginVertical: 3,color:"#000"}}>
        {"Retailer Price "}
      </Text>

      <View style={style.inputContainer}>
        <TextInput
          style={style.txtinput}
          placeholder="Retailer Price "
          placeholderTextColor="#000"
          value={retailerPrice}
          onChangeText={(text)=>setRetailerPrice(text)}
        />
      </View>
      <Text style={{marginHorizontal: 10, marginVertical: 3,color:"#000"}}>
        {"Mrp "}
      </Text>

      <View style={style.inputContainer}>
        <TextInput
          style={style.txtinput}
          placeholder="Mrp"
          placeholderTextColor="#000"
          value={retailerPrice}
          onChangeText={(text)=>setRetailerPrice(text)}
        />
      </View>
      <Text style={{marginHorizontal: 10, marginVertical: 3,color:"#000"}}>
        {"Fixed Discount "}
      </Text>

      <View style={style.inputContainer}>
        <TextInput
          style={style.txtinput}
          placeholder="Fixed Discount "
          placeholderTextColor="#000"
          value={fixedDiscount}
          onChangeText={(text)=>setfixedDiscount(text)}
        />
      </View>

        <View style={{ flexDirection: 'row', marginTop: 10 }}>
          <TouchableOpacity
            style={{
              width: '90%',
              height: 50,
              borderRadius: 10,
              borderWidth: 0.5,
              alignSelf: 'center',
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              paddingLeft: 15,
              paddingRight: 15,
              marginHorizontal:10,
            }}
            onPress={handleCategoryDropDown}>
            <Text style={{ fontWeight: '600', color: "#000" }}>
              {"Customer Level *"}
            </Text>

            <Image
              source={require('../../../assets/dropdown.png')}
              style={{ width: 20, height: 20 }}
            />
          </TouchableOpacity>
        </View>
        {showCategoryList && (
        <View
          style={{
            elevation: 5,
            height: 300,
            alignSelf: 'center',
            width: '90%',
            backgroundColor: '#fff',
            borderRadius: 10,
          }}>
          <TextInput
            style={{
              marginTop: 10,
              borderRadius: 10,
              height: 40,
              borderColor: 'gray',
              borderWidth: 1,
              marginHorizontal: 10,
              paddingLeft: 10,
              marginBottom: 10,
              color: '#000000',
            }}
            placeholderTextColor="#000"
            placeholder="Search"
            onChangeText={filtercategories}
          />

          {filteredCategories.length === 0 && !isLoading ? (
            <Text style={style.noCategoriesText}>
              Sorry, no results found!
            </Text>
          ) : (
            <ScrollView  nestedScrollEnabled={true}>
              {filteredCategories?.map((item, index) => (
                <TouchableOpacity
                  key={index}
                  style={{
                    width: '100%',
                    height: 50,
                    justifyContent: 'center',
                    borderBottomWidth: 0.5,
                    borderColor: '#8e8e8e',
                  }}
                  onPress={() => handleSelectCategory(item)
                  }>
                  <Text
                    style={{
                      fontWeight: '600',
                      marginHorizontal: 15,
                      color: '#000',
                    }}>
                    {item?.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}
        </View>
      )}
      <View style={{ flexDirection: 'row', marginTop: 10, alignItems: 'center' }}>
        <View>
          <TouchableOpacity
            style={{
              width: '90%',
              height: 50,
              borderRadius: 10,
              borderWidth: 0.5,
              alignSelf: 'center',
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              paddingLeft: 15,
              paddingRight: 15,
            }}
            onPress={handleCategoryDropDown}>
            <Text style={{ fontWeight: '600', color: "#000" }}>
              {"color *"}
            </Text>

            <Image
              source={require('../../../assets/dropdown.png')}
              style={{ width: 20, height: 20 }}
            />
          </TouchableOpacity>
        </View>
        <View style={{ alignItems: 'center' }}>
          <TouchableOpacity
            onPress={toggleModal}
            style={style.plusButton}>
            <Image
              style={{
                height: 30,
                width: 30,
                justifyContent: 'center',
                alignItems: 'center',
              }}
              source={require('../../../assets/plus.png')}
            />
          </TouchableOpacity>
        </View>
      </View>
      {showCategoryList && (
        <View
          style={{
            elevation: 5,
            height: 300,
            alignSelf: 'center',
            width: '90%',
            backgroundColor: '#fff',
            borderRadius: 10,
          }}>
          <TextInput
            style={{
              marginTop: 10,
              borderRadius: 10,
              height: 40,
              borderColor: 'gray',
              borderWidth: 1,
              marginHorizontal: 10,
              paddingLeft: 10,
              marginBottom: 10,
              color: '#000000',
            }}
            placeholderTextColor="#000"
            placeholder="Search"
            onChangeText={filtercategories}
          />

          {filteredCategories.length === 0 && !isLoading ? (
            <Text style={style.noCategoriesText}>
              Sorry, no results found!
            </Text>
          ) : (
            <ScrollView  nestedScrollEnabled={true}>
              {filteredCategories?.map((item, index) => (
                <TouchableOpacity
                  key={index}
                  style={{
                    width: '100%',
                    height: 50,
                    justifyContent: 'center',
                    borderBottomWidth: 0.5,
                    borderColor: '#8e8e8e',
                  }}
                  onPress={() => handleSelectCategory(item)
                  }>
                  <Text
                    style={{
                      fontWeight: '600',
                      marginHorizontal: 15,
                      color: '#000',
                    }}>
                    {item?.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}
        </View>
      )}

      <Text style={{marginHorizontal: 10, marginVertical: 3,color:"#000"}}>
        {"Color Code "}
      </Text>

      <View style={style.inputContainer}>
        <TextInput
          style={style.txtinput}
          placeholder="color code "
          placeholderTextColor="#000"
          value={colorCode}
          onChangeText={(text)=>setColorCode(text)}
        />
      </View>
      <View style={{ flexDirection: 'row', marginTop: 10, alignItems: 'center' }}>
        <View>
          <TouchableOpacity
            style={{
              width: '90%',
              height: 50,
              borderRadius: 10,
              borderWidth: 0.5,
              alignSelf: 'center',
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              paddingLeft: 15,
              paddingRight: 15,
            }}
            onPress={handleCategoryDropDown}>
            <Text style={{ fontWeight: '600', color: "#000" }}>
              {"Types *"}
            </Text>

            <Image
              source={require('../../../assets/dropdown.png')}
              style={{ width: 20, height: 20 }}
            />
          </TouchableOpacity>
        </View>
        <View style={{ alignItems: 'center' }}>
          <TouchableOpacity
            onPress={toggleModal}
            style={style.plusButton}>
            <Image
              style={{
                height: 30,
                width: 30,
                justifyContent: 'center',
                alignItems: 'center',
              }}
              source={require('../../../assets/plus.png')}
            />
          </TouchableOpacity>
        </View>
      </View>
      {showCategoryList && (
        <View
          style={{
            elevation: 5,
            height: 300,
            alignSelf: 'center',
            width: '90%',
            backgroundColor: '#fff',
            borderRadius: 10,
          }}>
          <TextInput
            style={{
              marginTop: 10,
              borderRadius: 10,
              height: 40,
              borderColor: 'gray',
              borderWidth: 1,
              marginHorizontal: 10,
              paddingLeft: 10,
              marginBottom: 10,
              color: '#000000',
            }}
            placeholderTextColor="#000"
            placeholder="Search"
            onChangeText={filtercategories}
          />

          {filteredCategories.length === 0 && !isLoading ? (
            <Text style={style.noCategoriesText}>
              Sorry, no results found!
            </Text>
          ) : (
            <ScrollView  nestedScrollEnabled={true}>
              {filteredCategories?.map((item, index) => (
                <TouchableOpacity
                  key={index}
                  style={{
                    width: '100%',
                    height: 50,
                    justifyContent: 'center',
                    borderBottomWidth: 0.5,
                    borderColor: '#8e8e8e',
                  }}
                  onPress={() => handleSelectCategory(item)
                  }>
                  <Text
                    style={{
                      fontWeight: '600',
                      marginHorizontal: 15,
                      color: '#000',
                    }}>
                    {item?.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}
        </View>
      )}

      <View style={{ flexDirection: 'row', marginTop: 10, alignItems: 'center' }}>
        <View>
          <TouchableOpacity
            style={{
              width: '90%',
              height: 50,
              borderRadius: 10,
              borderWidth: 0.5,
              alignSelf: 'center',
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              paddingLeft: 15,
              paddingRight: 15,
            }}
            onPress={handleCategoryDropDown}>
            <Text style={{ fontWeight: '600', color: "#000" }}>
              {"Season Groups *"}
            </Text>

            <Image
              source={require('../../../assets/dropdown.png')}
              style={{ width: 20, height: 20 }}
            />
          </TouchableOpacity>
        </View>
        <View style={{ alignItems: 'center' }}>
          <TouchableOpacity
            onPress={toggleModal}
            style={style.plusButton}>
            <Image
              style={{
                height: 30,
                width: 30,
                justifyContent: 'center',
                alignItems: 'center',
              }}
              source={require('../../../assets/plus.png')}
            />
          </TouchableOpacity>
        </View>
      </View>
      {showCategoryList && (
        <View
          style={{
            elevation: 5,
            height: 300,
            alignSelf: 'center',
            width: '90%',
            backgroundColor: '#fff',
            borderRadius: 10,
          }}>
          <TextInput
            style={{
              marginTop: 10,
              borderRadius: 10,
              height: 40,
              borderColor: 'gray',
              borderWidth: 1,
              marginHorizontal: 10,
              paddingLeft: 10,
              marginBottom: 10,
              color: '#000000',
            }}
            placeholderTextColor="#000"
            placeholder="Search"
            onChangeText={filtercategories}
          />

          {filteredCategories.length === 0 && !isLoading ? (
            <Text style={style.noCategoriesText}>
              Sorry, no results found!
            </Text>
          ) : (
            <ScrollView  nestedScrollEnabled={true}>
              {filteredCategories?.map((item, index) => (
                <TouchableOpacity
                  key={index}
                  style={{
                    width: '100%',
                    height: 50,
                    justifyContent: 'center',
                    borderBottomWidth: 0.5,
                    borderColor: '#8e8e8e',
                  }}
                  onPress={() => handleSelectCategory(item)
                  }>
                  <Text
                    style={{
                      fontWeight: '600',
                      marginHorizontal: 15,
                      color: '#000',
                    }}>
                    {item?.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}
        </View>
      )}
      <Text style={{marginHorizontal: 10, marginVertical: 3,color:"#000"}}>
        {"Style Quantity "}
      </Text>

      <View style={style.inputContainer}>
        <TextInput
          style={style.txtinput}
          placeholder="Style Quantity "
          placeholderTextColor="#000"
          value={styleQuantity}
          onChangeText={(text)=>setStyleQuantity(text)}
        />
      </View>
      <Text style={{marginHorizontal: 10, marginVertical: 3,color:"#000"}}>
        {"Fabric Quantity "}
      </Text>

      <View style={style.inputContainer}>
        <TextInput
          style={style.txtinput}
          placeholder="Fabric Quantity "
          placeholderTextColor="#000"
          value={fabricQuantity}
          onChangeText={(text)=>setFabricQuantity(text)}
        />
      </View>

      <Text style={{marginHorizontal: 10, marginVertical: 3,color:"#000"}}>
        {"GSM  "}
      </Text>

      <View style={style.inputContainer}>
        <TextInput
          style={style.txtinput}
          placeholder="GSM  "
          placeholderTextColor="#000"
          value={gsm}
          onChangeText={(text)=>setGsm(text)}
        />
      </View>
      <Text style={{marginHorizontal: 10, marginVertical: 3,color:"#000"}}>
        {"HSN  "}
      </Text>

      <View style={style.inputContainer}>
        <TextInput
          style={style.txtinput}
          placeholder="HSN  "
          placeholderTextColor="#000"
          value={hsn}
          onChangeText={(text)=>setHsn(text)}
        />
      </View>

      <View style={{ flexDirection: 'row', marginTop: 10, alignItems: 'center' }}>
        <View>
          <TouchableOpacity
            style={{
              width: '90%',
              height: 50,
              borderRadius: 10,
              borderWidth: 0.5,
              alignSelf: 'center',
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              paddingLeft: 15,
              paddingRight: 15,
            }}
            onPress={handleCategoryDropDown}>
            <Text style={{ fontWeight: '600', color: "#000" }}>
              {"Closures "}
            </Text>

            <Image
              source={require('../../../assets/dropdown.png')}
              style={{ width: 20, height: 20 }}
            />
          </TouchableOpacity>
        </View>
        <View style={{ alignItems: 'center' }}>
          <TouchableOpacity
            onPress={toggleModal}
            style={style.plusButton}>
            <Image
              style={{
                height: 30,
                width: 30,
                justifyContent: 'center',
                alignItems: 'center',
              }}
              source={require('../../../assets/plus.png')}
            />
          </TouchableOpacity>
        </View>
      </View>
      {showCategoryList && (
        <View
          style={{
            elevation: 5,
            height: 300,
            alignSelf: 'center',
            width: '90%',
            backgroundColor: '#fff',
            borderRadius: 10,
          }}>
          <TextInput
            style={{
              marginTop: 10,
              borderRadius: 10,
              height: 40,
              borderColor: 'gray',
              borderWidth: 1,
              marginHorizontal: 10,
              paddingLeft: 10,
              marginBottom: 10,
              color: '#000000',
            }}
            placeholderTextColor="#000"
            placeholder="Search"
            onChangeText={filtercategories}
          />

          {filteredCategories.length === 0 && !isLoading ? (
            <Text style={style.noCategoriesText}>
              Sorry, no results found!
            </Text>
          ) : (
            <ScrollView  nestedScrollEnabled={true}>
              {filteredCategories?.map((item, index) => (
                <TouchableOpacity
                  key={index}
                  style={{
                    width: '100%',
                    height: 50,
                    justifyContent: 'center',
                    borderBottomWidth: 0.5,
                    borderColor: '#8e8e8e',
                  }}
                  onPress={() => handleSelectCategory(item)
                  }>
                  <Text
                    style={{
                      fontWeight: '600',
                      marginHorizontal: 15,
                      color: '#000',
                    }}>
                    {item?.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}
        </View>
      )}

      <View style={{ flexDirection: 'row', marginTop: 10, alignItems: 'center' }}>
        <View>
          <TouchableOpacity
            style={{
              width: '90%',
              height: 50,
              borderRadius: 10,
              borderWidth: 0.5,
              alignSelf: 'center',
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              paddingLeft: 15,
              paddingRight: 15,
            }}
            onPress={handleCategoryDropDown}>
            <Text style={{ fontWeight: '600', color: "#000" }}>
              {"Peak "}
            </Text>

            <Image
              source={require('../../../assets/dropdown.png')}
              style={{ width: 20, height: 20 }}
            />
          </TouchableOpacity>
        </View>
        <View style={{ alignItems: 'center' }}>
          <TouchableOpacity
            onPress={toggleModal}
            style={style.plusButton}>
            <Image
              style={{
                height: 30,
                width: 30,
                justifyContent: 'center',
                alignItems: 'center',
              }}
              source={require('../../../assets/plus.png')}
            />
          </TouchableOpacity>
        </View>
      </View>
      {showCategoryList && (
        <View
          style={{
            elevation: 5,
            height: 300,
            alignSelf: 'center',
            width: '90%',
            backgroundColor: '#fff',
            borderRadius: 10,
          }}>
          <TextInput
            style={{
              marginTop: 10,
              borderRadius: 10,
              height: 40,
              borderColor: 'gray',
              borderWidth: 1,
              marginHorizontal: 10,
              paddingLeft: 10,
              marginBottom: 10,
              color: '#000000',
            }}
            placeholderTextColor="#000"
            placeholder="Search"
            onChangeText={filtercategories}
          />

          {filteredCategories.length === 0 && !isLoading ? (
            <Text style={style.noCategoriesText}>
              Sorry, no results found!
            </Text>
          ) : (
            <ScrollView  nestedScrollEnabled={true}>
              {filteredCategories?.map((item, index) => (
                <TouchableOpacity
                  key={index}
                  style={{
                    width: '100%',
                    height: 50,
                    justifyContent: 'center',
                    borderBottomWidth: 0.5,
                    borderColor: '#8e8e8e',
                  }}
                  onPress={() => handleSelectCategory(item)
                  }>
                  <Text
                    style={{
                      fontWeight: '600',
                      marginHorizontal: 15,
                      color: '#000',
                    }}>
                    {item?.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}
        </View>
      )}
      <View style={{ flexDirection: 'row', marginTop: 10, alignItems: 'center' }}>
        <View>
          <TouchableOpacity
            style={{
              width: '90%',
              height: 50,
              borderRadius: 10,
              borderWidth: 0.5,
              alignSelf: 'center',
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              paddingLeft: 15,
              paddingRight: 15,
            }}
            onPress={handleCategoryDropDown}>
            <Text style={{ fontWeight: '600', color: "#000" }}>
              {"Logo "}
            </Text>

            <Image
              source={require('../../../assets/dropdown.png')}
              style={{ width: 20, height: 20 }}
            />
          </TouchableOpacity>
        </View>
        <View style={{ alignItems: 'center' }}>
          <TouchableOpacity
            onPress={toggleModal}
            style={style.plusButton}>
            <Image
              style={{
                height: 30,
                width: 30,
                justifyContent: 'center',
                alignItems: 'center',
              }}
              source={require('../../../assets/plus.png')}
            />
          </TouchableOpacity>
        </View>
      </View>
      {showCategoryList && (
        <View
          style={{
            elevation: 5,
            height: 300,
            alignSelf: 'center',
            width: '90%',
            backgroundColor: '#fff',
            borderRadius: 10,
          }}>
          <TextInput
            style={{
              marginTop: 10,
              borderRadius: 10,
              height: 40,
              borderColor: 'gray',
              borderWidth: 1,
              marginHorizontal: 10,
              paddingLeft: 10,
              marginBottom: 10,
              color: '#000000',
            }}
            placeholderTextColor="#000"
            placeholder="Search"
            onChangeText={filtercategories}
          />

          {filteredCategories.length === 0 && !isLoading ? (
            <Text style={style.noCategoriesText}>
              Sorry, no results found!
            </Text>
          ) : (
            <ScrollView  nestedScrollEnabled={true}>
              {filteredCategories?.map((item, index) => (
                <TouchableOpacity
                  key={index}
                  style={{
                    width: '100%',
                    height: 50,
                    justifyContent: 'center',
                    borderBottomWidth: 0.5,
                    borderColor: '#8e8e8e',
                  }}
                  onPress={() => handleSelectCategory(item)
                  }>
                  <Text
                    style={{
                      fontWeight: '600',
                      marginHorizontal: 15,
                      color: '#000',
                    }}>
                    {item?.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}
        </View>
      )}
      <View style={{ flexDirection: 'row', marginTop: 10, alignItems: 'center' }}>
        <View>
          <TouchableOpacity
            style={{
              width: '90%',
              height: 50,
              borderRadius: 10,
              borderWidth: 0.5,
              alignSelf: 'center',
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              paddingLeft: 15,
              paddingRight: 15,
            }}
            onPress={handleCategoryDropDown}>
            <Text style={{ fontWeight: '600', color: "#000" }}>
              {"Decoration "}
            </Text>

            <Image
              source={require('../../../assets/dropdown.png')}
              style={{ width: 20, height: 20 }}
            />
          </TouchableOpacity>
        </View>
        <View style={{ alignItems: 'center' }}>
          <TouchableOpacity
            onPress={toggleModal}
            style={style.plusButton}>
            <Image
              style={{
                height: 30,
                width: 30,
                justifyContent: 'center',
                alignItems: 'center',
              }}
              source={require('../../../assets/plus.png')}
            />
          </TouchableOpacity>
        </View>
      </View>
      {showCategoryList && (
        <View
          style={{
            elevation: 5,
            height: 300,
            alignSelf: 'center',
            width: '90%',
            backgroundColor: '#fff',
            borderRadius: 10,
          }}>
          <TextInput
            style={{
              marginTop: 10,
              borderRadius: 10,
              height: 40,
              borderColor: 'gray',
              borderWidth: 1,
              marginHorizontal: 10,
              paddingLeft: 10,
              marginBottom: 10,
              color: '#000000',
            }}
            placeholderTextColor="#000"
            placeholder="Search"
            onChangeText={filtercategories}
          />

          {filteredCategories.length === 0 && !isLoading ? (
            <Text style={style.noCategoriesText}>
              Sorry, no results found!
            </Text>
          ) : (
            <ScrollView  nestedScrollEnabled={true}>
              {filteredCategories?.map((item, index) => (
                <TouchableOpacity
                  key={index}
                  style={{
                    width: '100%',
                    height: 50,
                    justifyContent: 'center',
                    borderBottomWidth: 0.5,
                    borderColor: '#8e8e8e',
                  }}
                  onPress={() => handleSelectCategory(item)
                  }>
                  <Text
                    style={{
                      fontWeight: '600',
                      marginHorizontal: 15,
                      color: '#000',
                    }}>
                    {item?.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}
        </View>
      )}
      <View style={{ flexDirection: 'row', marginTop: 10, alignItems: 'center' }}>
        <View>
          <TouchableOpacity
            style={{
              width: '90%',
              height: 50,
              borderRadius: 10,
              borderWidth: 0.5,
              alignSelf: 'center',
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              paddingLeft: 15,
              paddingRight: 15,
            }}
            onPress={handleCategoryDropDown}>
            <Text style={{ fontWeight: '600', color: "#000" }}>
              {"Trims "}
            </Text>

            <Image
              source={require('../../../assets/dropdown.png')}
              style={{ width: 20, height: 20 }}
            />
          </TouchableOpacity>
        </View>
        <View style={{ alignItems: 'center' }}>
          <TouchableOpacity
            onPress={toggleModal}
            style={style.plusButton}>
            <Image
              style={{
                height: 30,
                width: 30,
                justifyContent: 'center',
                alignItems: 'center',
              }}
              source={require('../../../assets/plus.png')}
            />
          </TouchableOpacity>
        </View>
      </View>
      {showCategoryList && (
        <View
          style={{
            elevation: 5,
            height: 300,
            alignSelf: 'center',
            width: '90%',
            backgroundColor: '#fff',
            borderRadius: 10,
          }}>
          <TextInput
            style={{
              marginTop: 10,
              borderRadius: 10,
              height: 40,
              borderColor: 'gray',
              borderWidth: 1,
              marginHorizontal: 10,
              paddingLeft: 10,
              marginBottom: 10,
              color: '#000000',
            }}
            placeholderTextColor="#000"
            placeholder="Search"
            onChangeText={filtercategories}
          />

          {filteredCategories.length === 0 && !isLoading ? (
            <Text style={style.noCategoriesText}>
              Sorry, no results found!
            </Text>
          ) : (
            <ScrollView  nestedScrollEnabled={true}>
              {filteredCategories?.map((item, index) => (
                <TouchableOpacity
                  key={index}
                  style={{
                    width: '100%',
                    height: 50,
                    justifyContent: 'center',
                    borderBottomWidth: 0.5,
                    borderColor: '#8e8e8e',
                  }}
                  onPress={() => handleSelectCategory(item)
                  }>
                  <Text
                    style={{
                      fontWeight: '600',
                      marginHorizontal: 15,
                      color: '#000',
                    }}>
                    {item?.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}
        </View>
      )}

       <View style={{ flexDirection: 'row', marginTop: 10 }}>
          <TouchableOpacity
            style={{
              width: '90%',
              height: 50,
              borderRadius: 10,
              borderWidth: 0.5,
              alignSelf: 'center',
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              paddingLeft: 15,
              paddingRight: 15,
              marginHorizontal:10,
            }}
            onPress={handleCategoryDropDown}>
            <Text style={{ fontWeight: '600', color: "#000" }}>
              {"Process Work Flow *"}
            </Text>

            <Image
              source={require('../../../assets/dropdown.png')}
              style={{ width: 20, height: 20 }}
            />
          </TouchableOpacity>
        </View>
        {showCategoryList && (
        <View
          style={{
            elevation: 5,
            height: 300,
            alignSelf: 'center',
            width: '90%',
            backgroundColor: '#fff',
            borderRadius: 10,
          }}>
          <TextInput
            style={{
              marginTop: 10,
              borderRadius: 10,
              height: 40,
              borderColor: 'gray',
              borderWidth: 1,
              marginHorizontal: 10,
              paddingLeft: 10,
              marginBottom: 10,
              color: '#000000',
            }}
            placeholderTextColor="#000"
            placeholder="Search"
            onChangeText={filtercategories}
          />

          {filteredCategories.length === 0 && !isLoading ? (
            <Text style={style.noCategoriesText}>
              Sorry, no results found!
            </Text>
          ) : (
            <ScrollView  nestedScrollEnabled={true}>
              {filteredCategories?.map((item, index) => (
                <TouchableOpacity
                  key={index}
                  style={{
                    width: '100%',
                    height: 50,
                    justifyContent: 'center',
                    borderBottomWidth: 0.5,
                    borderColor: '#8e8e8e',
                  }}
                  onPress={() => handleSelectCategory(item)
                  }>
                  <Text
                    style={{
                      fontWeight: '600',
                      marginHorizontal: 15,
                      color: '#000',
                    }}>
                    {item?.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}
        </View>
      )}
       <View style={{ flexDirection: 'row', marginTop: 10 }}>
          <TouchableOpacity
            style={{
              width: '90%',
              height: 50,
              borderRadius: 10,
              borderWidth: 0.5,
              alignSelf: 'center',
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              paddingLeft: 15,
              paddingRight: 15,
              marginHorizontal:10,
            }}
            onPress={handleCategoryDropDown}>
            <Text style={{ fontWeight: '600', color: "#000" }}>
              {" Location *"}
            </Text>

            <Image
              source={require('../../../assets/dropdown.png')}
              style={{ width: 20, height: 20 }}
            />
          </TouchableOpacity>
        </View>
        {showCategoryList && (
        <View
          style={{
            elevation: 5,
            height: 300,
            alignSelf: 'center',
            width: '90%',
            backgroundColor: '#fff',
            borderRadius: 10,
          }}>
          <TextInput
            style={{
              marginTop: 10,
              borderRadius: 10,
              height: 40,
              borderColor: 'gray',
              borderWidth: 1,
              marginHorizontal: 10,
              paddingLeft: 10,
              marginBottom: 10,
              color: '#000000',
            }}
            placeholderTextColor="#000"
            placeholder="Search"
            onChangeText={filtercategories}
          />

          {filteredCategories.length === 0 && !isLoading ? (
            <Text style={style.noCategoriesText}>
              Sorry, no results found!
            </Text>
          ) : (
            <ScrollView  nestedScrollEnabled={true}>
              {filteredCategories?.map((item, index) => (
                <TouchableOpacity
                  key={index}
                  style={{
                    width: '100%',
                    height: 50,
                    justifyContent: 'center',
                    borderBottomWidth: 0.5,
                    borderColor: '#8e8e8e',
                  }}
                  onPress={() => handleSelectCategory(item)
                  }>
                  <Text
                    style={{
                      fontWeight: '600',
                      marginHorizontal: 15,
                      color: '#000',
                    }}>
                    {item?.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}
        </View>
      )}

      <View style={{ flexDirection: 'row', marginTop: 10, alignItems: 'center' }}>
        <View>
          <TouchableOpacity
            style={{
              width: '90%',
              height: 50,
              borderRadius: 10,
              borderWidth: 0.5,
              alignSelf: 'center',
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              paddingLeft: 15,
              paddingRight: 15,
            }}
            onPress={handleCategoryDropDown}>
            <Text style={{ fontWeight: '600', color: "#000" }}>
              {"Scales * "}
            </Text>

            <Image
              source={require('../../../assets/dropdown.png')}
              style={{ width: 20, height: 20 }}
            />
          </TouchableOpacity>
        </View>
        <View style={{ alignItems: 'center' }}>
          <TouchableOpacity
            onPress={toggleModal}
            style={style.plusButton}>
            <Image
              style={{
                height: 30,
                width: 30,
                justifyContent: 'center',
                alignItems: 'center',
              }}
              source={require('../../../assets/plus.png')}
            />
          </TouchableOpacity>
        </View>
      </View>
      {showCategoryList && (
        <View
          style={{
            elevation: 5,
            height: 300,
            alignSelf: 'center',
            width: '90%',
            backgroundColor: '#fff',
            borderRadius: 10,
          }}>
          <TextInput
            style={{
              marginTop: 10,
              borderRadius: 10,
              height: 40,
              borderColor: 'gray',
              borderWidth: 1,
              marginHorizontal: 10,
              paddingLeft: 10,
              marginBottom: 10,
              color: '#000000',
            }}
            placeholderTextColor="#000"
            placeholder="Search"
            onChangeText={filtercategories}
          />

          {filteredCategories.length === 0 && !isLoading ? (
            <Text style={style.noCategoriesText}>
              Sorry, no results found!
            </Text>
          ) : (
            <ScrollView  nestedScrollEnabled={true}>
              {filteredCategories?.map((item, index) => (
                <TouchableOpacity
                  key={index}
                  style={{
                    width: '100%',
                    height: 50,
                    justifyContent: 'center',
                    borderBottomWidth: 0.5,
                    borderColor: '#8e8e8e',
                  }}
                  onPress={() => handleSelectCategory(item)
                  }>
                  <Text
                    style={{
                      fontWeight: '600',
                      marginHorizontal: 15,
                      color: '#000',
                    }}>
                    {item?.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}
        </View>
      )}
      

      <Modal
        animationType="fade"
        transparent={true}
        visible={categoryModel}
        onRequestClose={() => {
          toggleModal();
        }}>
        <View style={style.modalContainerr}>
          <View style={style.modalContentt}>
            <View style={{
              backgroundColor: '#1F74BA',
              borderRadius: 10,
              marginHorizontal: 10,
              flexDirection: 'row',
              alignItems: 'center',
              marginTop: 10,
              paddingVertical: 5,
              width: '100%',
              justifyContent: 'space-between',
              marginBottom: 15,
            }}>
              <Text style={[style.modalTitle, { textAlign: 'center', flex: 1 }]}>{"Add New Category"}</Text>
              <TouchableOpacity onPress={handleCloseModalDisRet} style={{ alignSelf: 'flex-end' }} >
                <Image
                  style={{ height: 30, width: 30, marginRight: 5 }}
                  source={require('../../../assets/close.png')}
                />
              </TouchableOpacity>
            </View>
            
              <Text style={{fontWeight:'bold'}}>{"Category Name * "}</Text>
              <TextInput
                style={[style.input, { color: '#000' }]}
                placeholder=""
                placeholderTextColor="#000"
                onChangeText={text => setCategoryName(text)}
              />
                 
              <Text style={{fontWeight:'bold'}}>{"Category Description * "}</Text>
              <TextInput
                style={[style.input, { color: '#000' }]}
                placeholder=""
                placeholderTextColor="#000"
                onChangeText={text => setCategoryDescription(text)}
              />
            
            <TouchableOpacity
              style={style.saveButton}
              onPress={handleSaveButtonPress}>
              <Text style={style.saveButtonText}>Save</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      <View style={{marginBottom:50}}/>

    </ScrollView>
  )
}


const style = StyleSheet.create({
  conatiner: {
    flex: 1,
    backgroundColor: '#fff'
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
  modalContainerr: {
    flex: 1,
    alignItems: 'center',
    marginTop: '45%',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContentt: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    width: '80%',
    alignItems: 'center',
    elevation: 5, // Add elevation for shadow on Android
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    // marginBottom: 20,
    color: '#000',
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
  input: {
    borderWidth: 1,
    borderColor: 'gray',
    borderRadius: 5,
    padding: 10,
    marginBottom: 5,
    width: '100%',
  },
  inputContainer: {
    borderWidth: 1,
    borderColor: '#000',
    borderRadius: 5,
    marginHorizontal: 10,
    marginBottom: 3,
    marginTop: 3,
  },
  txtinput: {
    fontSize: 16,
    paddingHorizontal: 10,
    color: '#000000',
  },

});

export default NewStyleDetail;