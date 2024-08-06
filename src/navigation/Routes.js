import * as React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import Login from '../Pages/Login/Login';
import Splash from '../Pages/Splash';
import Details from '../Pages/details/Details';
import Main from '../Pages/main/Main';
import Cart from '../Pages/cart/Cart';
import Profile from '../Pages/editprofile/EditProfile';
import AllCategoriesListed from '../Pages/allcategorieslisted/AllCategoriesListed';
import CommonHeader from '../components/CommonHeader';
import AddNote from '../Pages/notes/AddNote';
import LoaderComponent from '../utils/loaderComponent/loaderComponent';
import CustomDropDown from '../components/CustomDropDown';
import ProductInventory from '../Pages/inventory/ProductInventory';
import LocationInventory from '../Pages/inventory/LocationInventory';
import SignUp from '../Pages/signup/SignUp';
import ImageSlider from '../components/ImageSlider';
import CommenHeaderHomeScreen from '../components/CommenHeaderHomeScreen';
import PackingOrders from '../Pages/Packingorders/PackingOrders';
import DistributorGrn from '../Pages/distributorgrn/DistributorGrn';
import DistributorOrder from '../Pages/distributororder/DistributorOrder';
import ModalScreen from '../components/ModalScreen';
import Activities from '../Pages/activities/Activities';
import NewTask from '../Pages/activities/NewTask';
import NewCall from '../Pages/activities/NewCall';
import CustomCheckBox from '../components/CheckBox';
import CustomerLocation from '../Pages/loc/CustomerLocation';
import ProductPackagePublish from '../Pages/publish/ProductPackagePublish';
import ProductsStyles from '../Pages/product/ProductsStyles';
import AddNewStyle from '../Pages/product/AddNewStyle';

const Stack = createNativeStackNavigator();

const Routes = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="Splash"
        component={Splash}
        options={{headerShown: false}}
      />
      <Stack.Screen
        name="Login"
        component={Login}
        options={{headerShown: false}}
      />
      <Stack.Screen
        name="Main"
        component={Main}
        options={{headerShown: false}}
      />
      <Stack.Screen
        name="Details"
        component={Details}
        options={({navigation}) => ({
          header: () => (
            <CommonHeader
              navigation={navigation}
              title="Product Details"
              showMessageIcon={true}
              showCartIcon={true}
              showLocationIcon={true}
            />
          ),
          headerBackVisible: true,
        })}
      />
      <Stack.Screen
        name="Cart"
        component={Cart}
        options={({navigation}) => ({
          header: () => (
            <CommonHeader
              navigation={navigation}
              title="Order Preview"
              showMessageIcon={true}
            />
          ),
          headerBackVisible: true,
        })}
      />
      <Stack.Screen
        name="Profile"
        component={Profile}
        options={{headerShown: true}}
      />
      <Stack.Screen
        name="AllCategoriesListed"
        component={AllCategoriesListed}
        options={({route, navigation}) => ({
          header: () => (
            <CommonHeader
              navigation={navigation}
              title={route.params.categoryDesc} // Set the header title dynamically
              showMessageIcon={true}
              showCartIcon={true}
              showLocationIcon={true}
            />
          ),
          headerBackVisible: true,
        })}
      />
      <Stack.Screen
        name="Add Note"
        component={AddNote}
        options={{headerShown: true}}
      />
      <Stack.Screen
        name="LoaderComponent"
        component={LoaderComponent}
        options={{headerShown: true}}
      />
      <Stack.Screen
        name="CustomDropDown"
        component={CustomDropDown}
        options={{headerShown: true}}
      />
      <Stack.Screen
        name="ProductInventory"
        component={ProductInventory}
        options={{headerShown: false}}
      />
      <Stack.Screen
        name="LocationInventory"
        component={LocationInventory}
        options={{headerShown: false}}
      />
      <Stack.Screen
        name="SignUp"
        component={SignUp}
        options={{headerShown: false}}
      />
      <Stack.Screen
        name="ImageSlider"
        component={ImageSlider}
        options={{headerShown: false}}
      />
      <Stack.Screen
        name="CommenHeaderHomeScreen"
        component={CommenHeaderHomeScreen}
        options={{headerShown: false}}
      />
      <Stack.Screen
        name="PackingOrders"
        component={PackingOrders}
        options={{headerShown: false}}
      />
      <Stack.Screen
        name="Distributor GRN"
        component={DistributorGrn}
        options={{headerShown: true}}
      />
      <Stack.Screen
        name="DistributorOrder"
        component={DistributorOrder}
        options={{headerShown: false}}
      />
      <Stack.Screen
        name="ModalScreen"
        component={ModalScreen}
        options={{headerShown: false}}
      />
      <Stack.Screen
        name="Activities"
        component={Activities}
        options={{headerShown: false}}
      />
       <Stack.Screen
        name="NewTask"
        component={NewTask}
        options={{headerShown: false}}
      />
       <Stack.Screen
        name="NewCall"
        component={NewCall}
        options={{headerShown: false}}
      />
       <Stack.Screen
        name="CustomCheckBox"
        component={CustomCheckBox}
        options={{headerShown: false}}
      />
        <Stack.Screen
        name="CustomerLocation"
        component={CustomerLocation}
        options={{headerShown: false}}
      />
        <Stack.Screen
        name="ProductPackagePublish"
        component={ProductPackagePublish}
        options={{headerShown: false}}
      />
        <Stack.Screen
        name="ProductsStyles"
        component={ProductsStyles}
        options={{headerShown: false}}
      />
        <Stack.Screen
        name="AddNewStyle"
        component={AddNewStyle}
        options={{headerShown: false}}
      />



    </Stack.Navigator>
  );
};

export default Routes;
