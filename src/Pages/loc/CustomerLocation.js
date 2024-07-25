import React, { useEffect, useState } from 'react';
import { Text, TouchableOpacity, View, PermissionsAndroid } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import Geolocation from 'react-native-geolocation-service';

const CustomerLocation = () => {
    const [mLat, setMLat] = useState(null);
    const [mLong, setMLong] = useState(null);

    useEffect(() => {
        requestLocationPermission();
    }, []);

    const requestLocationPermission = async () => {
        try {
            const granted = await PermissionsAndroid.request(
                PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
                {
                    title: 'Location Permission',
                    message: 'We need access to your location to show it on the map.',
                    buttonNeutral: 'Ask Me Later',
                    buttonNegative: 'Cancel',
                    buttonPositive: 'OK',
                }
            );
            if (granted === PermissionsAndroid.RESULTS.GRANTED) {
                console.log('Location permission granted');
            } else {
                console.log('Location permission denied');
            }
        } catch (err) {
            console.warn(err);
        }
    };

    const getLocation = () => {
        Geolocation.getCurrentPosition(
            (position) => {
                console.log(position);
                setMLat(position.coords.latitude);
                setMLong(position.coords.longitude);
            },
            (error) => {
                console.log(error.code, error.message);
            },
            { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
        );
    };

    return (
        <View style={{ flex: 1 }}>
            <MapView
                style={{ width: '100%', height: '100%' }}
                initialRegion={{
                    latitude: 28.634609355596226,
                    longitude: 77.23047288679989,
                    latitudeDelta: 0.01,
                    longitudeDelta: 0.01,
                }}
                region={
                    mLat && mLong
                        ? {
                              latitude: mLat,
                              longitude: mLong,
                              latitudeDelta: 0.01,
                              longitudeDelta: 0.01,
                          }
                        : undefined
                }
            >
                {mLat && mLong && (
                    <Marker coordinate={{ latitude: mLat, longitude: mLong }} />
                )}
            </MapView>
            {/* <TouchableOpacity
                onPress={getLocation}
                style={{
                    width: '90%',
                    height: 50,
                    alignSelf: 'center',
                    position: 'absolute',
                    bottom: 20,
                    backgroundColor: 'gray',
                    justifyContent: 'center',
                    alignItems: 'center',
                }}
            >
                <Text style={{ color: '#fff' }}>Get Current Location</Text>
            </TouchableOpacity> */}
        </View>
    );
};

export default CustomerLocation;
