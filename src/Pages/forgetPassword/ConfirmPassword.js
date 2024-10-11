import React, { useEffect, useRef, useState } from 'react';
import {
    Alert,
    Image,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
    ActivityIndicator,
    Keyboard,
    ScrollView,
    KeyboardAvoidingView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';

import useOnlineStatus from '../../utils/hooks/online/useOnlineStatus';

const ConfirmPassword = () => {
    const navigation = useNavigation();
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmNewPassword, setConfirmNewPassword] = useState('')
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const inputRefs = useRef([]);

    // const onlineStatus = useOnlineStatus();


    const handleGetOtp = () => {
        // Alert.alert("Clicked handleGetOtp");
        setLoading(true);
        let i = 0;
        while (i < 10000000) i++;

        setLoading(false);

        navigation.navigate('Login');
    }

    const handleChange = (text, index) => {
        let newOtp = [...otp];
        newOtp[index] = text;

        if (text && index < 5) {
            inputRefs.current[index + 1].focus();
        }

        setOtp(newOtp);
    };

    const handleKeyPress = (e, index) => {
        if (e.nativeEvent.key === 'Backspace' && otp[index] === '' && index > 0) {
            inputRefs.current[index - 1].focus();
        }
    };

    return (
        <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'} // Adjust behavior based on the platform
            keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0} // Adjust this offset if necessary
        >
            <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
                <View style={styles.container}>
                    <View style={styles.imageContainer}>
                        <Image
                            style={{ height: 103, width: 103, marginTop: 30 }}
                            source={require('../../../assets/loginbg.png')}
                        />
                    </View>
                    <View style={styles.formContainer}>
                        <Text style={styles.title}>Set New Password</Text>
                        {/* <Text style={styles.title1}>Enter OTP</Text>
                        <View style={styles.otpContainer}>
                            {otp.map((value, index) => (
                                <TextInput
                                    key={index}
                                    style={styles.otpInput1}
                                    keyboardType="numeric"
                                    maxLength={1}
                                    value={value}
                                    onChangeText={(text) => handleChange(text, index)}
                                    onKeyPress={(e) => handleKeyPress(e, index)}
                                    ref={(ref) => (inputRefs.current[index] = ref)} // Store each input reference
                                />
                            ))}
                        </View> */}
                        <View
                            style={[
                                styles.inputContainer,
                            ]}>
                            <TextInput
                                style={styles.input}
                                placeholder="Enter New Password"
                                placeholderTextColor="#000"
                                onChangeText={text => setNewPassword(text)}
                                value={newPassword}
                            />
                            <Image
                                source={require('../../../assets/lock.png')}
                                style={styles.inputImage}
                            />
                        </View>
                        <View
                            style={[
                                styles.inputContainer,
                            ]}>
                            <TextInput
                                style={styles.input}
                                placeholder="Confirm New Password"
                                placeholderTextColor="#000"
                                onChangeText={text => setConfirmNewPassword(text)}
                                value={confirmNewPassword}
                            />
                            <Image
                                source={require('../../../assets/lock.png')}
                                style={styles.inputImage}
                            />
                        </View>



                        <TouchableOpacity
                            style={styles.button}
                            onPress={handleGetOtp}
                            disabled={loading}>
                            {loading ? (
                                <ActivityIndicator color="#fff" />
                            ) : (
                                <Text style={styles.buttonText}>Save</Text>
                            )}
                        </TouchableOpacity>
                        <View style={styles.line} />

                    </View>
                    <View style={{ justifyContent: 'flex-end', flex: 1, marginVertical: 10 }}>

                        <Text style={{ textAlign: 'center', color: "#000" }}>
                            All rights with Codeverse Technologies
                        </Text>
                    </View>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingHorizontal: 20,
        backgroundColor: '#fff',
    },
    title: {
        fontSize: 25,
        marginBottom: 30,
        color: '#390050',
        alignItems: 'center',
        justifyContent: 'center',
    },
    title1: {
        fontSize: 17,
        marginBottom: 30,
        color: '#390050',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign:'center'
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 6,
        borderRadius: 5,
        paddingHorizontal: 10,
        marginVertical: 10,
        // backgroundColor: '#D9D9D947',
        borderWidth: 2,
        borderColor: '#D9D9D9',
    },
    inputContainerError: {
        borderColor: 'red',
    },

    formContainer: {
        width: '100%',
        marginTop: 30,
    },
    inputImage: {
        width: 24,
        height: 24,
        marginRight: 10,
    },
    input: {
        flex: 1,
        height: '100%',
        color: 'black',
        fontSize: 16,
    },
    rowContainer: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        width: '100%',
        marginBottom: 10,
    },
    forgotPasswordText: {
        fontSize: 16,
        color: '#390050',
    },
    button: {
        width: '100%',
        height: 50,
        backgroundColor: '#1F74BA',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 5,
        marginTop:10
    },
    buttonText: {
        fontSize: 18,
        color: '#fff',
    },
    line: {
        borderBottomColor: '#615858C7',
        borderBottomWidth: 1,
        marginVertical: 30,
        marginHorizontal: 30,
    },

    errorText: {
        color: 'red',
        marginBottom: 13,
    },
    otpContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginVertical: 20,
    },
    otpInput: {
        borderBottomWidth: 2,
        borderBottomColor: 'gray',
        textAlign: 'center',
        fontSize: 18,
        width: 40,
        marginHorizontal: 5,
    },
    otpInput1: {
        borderWidth: 2,
        borderColor: 'gray',
        textAlign: 'center',
        fontSize: 18,
        width: 40,
        marginHorizontal: 5,
        borderRadius:10
    },
});

export default ConfirmPassword;


