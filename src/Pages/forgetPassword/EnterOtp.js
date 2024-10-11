// import React, { useEffect, useRef, useState } from 'react';
// import {
//     Alert,
//     Image,
//     StyleSheet,
//     Text,
//     TextInput,
//     TouchableOpacity,
//     View,
//     ActivityIndicator,
//     Keyboard,
//     ScrollView,
//     KeyboardAvoidingView,
// } from 'react-native';
// import { useNavigation } from '@react-navigation/native';
// import axios from 'axios';

// import useOnlineStatus from '../../utils/hooks/online/useOnlineStatus';

// const EnterOtp = () => {
//     const navigation = useNavigation();
//     const [loading, setLoading] = useState(false);
//     const [email, setEmail] = useState('');
//     const onlineStatus = useOnlineStatus();
//     const [otp, setOtp] = useState(['', '', '', '', '', '']);
//     const inputRefs = useRef([]);

//     // const onlineStatus = useOnlineStatus();


//     const handleSetPassword = () => {
//         setLoading(true);
//         let i = 0;
//         while (i < 10000000) i++;

//         setLoading(false);

//         navigation.navigate('ConfirmPassword');
//     }

//     const handleChange = (text, index) => {
//         let newOtp = [...otp];
//         newOtp[index] = text;

//         if (text && index < 5) {
//             inputRefs.current[index + 1].focus();
//         }

//         setOtp(newOtp);
//     };

//     const handleKeyPress = (e, index) => {
//         if (e.nativeEvent.key === 'Backspace' && otp[index] === '' && index > 0) {
//             inputRefs.current[index - 1].focus();
//         }
//     };

//     return (
//         <KeyboardAvoidingView
//             style={{ flex: 1 }}
//             behavior={Platform.OS === 'ios' ? 'padding' : 'height'} // Adjust behavior based on the platform
//             keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0} // Adjust this offset if necessary
//         >
//             <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
//                 <View style={styles.container}>
//                     <View style={styles.imageContainer}>
//                         <Image
//                             style={{ height: 103, width: 103, marginTop: 30 }}
//                             source={require('../../../assets/loginbg.png')}
//                         />
//                     </View>
//                     <View style={styles.formContainer}>
//                         <Text style={styles.title}>Please enter the verification code sent to your email</Text>

//                         <View style={styles.otpContainer}>
//                             {otp.map((value, index) => (
//                                 <TextInput
//                                     key={index}
//                                     style={styles.otpInput1}
//                                     keyboardType="numeric"
//                                     maxLength={1}
//                                     value={value}
//                                     onChangeText={(text) => handleChange(text, index)}
//                                     onKeyPress={(e) => handleKeyPress(e, index)}
//                                     ref={(ref) => (inputRefs.current[index] = ref)} 
//                                 />
//                             ))}
//                         </View>


//                         <TouchableOpacity
//                             style={styles.button}
//                             onPress={handleSetPassword}
//                             disabled={loading}>
//                             {loading ? (
//                                 <ActivityIndicator color="#fff" />
//                             ) : (
//                                 <Text style={styles.buttonText}>Confirm</Text>
//                             )}
//                         </TouchableOpacity>
//                         <View style={styles.line} />

//                     </View>
//                     <View style={{ justifyContent: 'flex-end', flex: 1, marginVertical: 10 }}>

//                         <Text style={{ textAlign: 'center', color: "#000" }}>
//                             All rights with Codeverse Technologies
//                         </Text>
//                     </View>
//                 </View>
//             </ScrollView>
//         </KeyboardAvoidingView>
//     );
// };

// const styles = StyleSheet.create({
//     container: {
//         flex: 1,
//         paddingHorizontal: 20,
//         backgroundColor: '#fff',
//     },
//     title: {
//         fontSize: 20,
//         marginBottom: 30,
//         color: '#390050',
//         alignItems: 'center',
//         justifyContent: 'center',
//         textAlign:'center'
//     },
//     inputContainer: {
//         flexDirection: 'row',
//         alignItems: 'center',
//         marginBottom: 6,
//         borderRadius: 5,
//         paddingHorizontal: 10,
//         marginVertical: 10,
//         borderWidth: 2,
//         borderColor: '#D9D9D9',
//     },
//     inputContainerError: {
//         borderColor: 'red',
//     },

//     formContainer: {
//         width: '100%',
//         marginTop: 30,
//     },
//     inputImage: {
//         width: 24,
//         height: 24,
//         marginRight: 10,
//     },
//     input: {
//         flex: 1,
//         height: '100%',
//         color: 'black',
//         fontSize: 16,
//     },
//     rowContainer: {
//         flexDirection: 'row',
//         justifyContent: 'flex-end',
//         width: '100%',
//         marginBottom: 10,
//     },
//     forgotPasswordText: {
//         fontSize: 16,
//         color: '#390050',
//     },
//     button: {
//         width: '100%',
//         height: 50,
//         backgroundColor: '#1F74BA',
//         justifyContent: 'center',
//         alignItems: 'center',
//         borderRadius: 5,
//     },
//     buttonText: {
//         fontSize: 18,
//         color: '#fff',
//     },
//     line: {
//         borderBottomColor: '#615858C7',
//         borderBottomWidth: 1,
//         marginVertical: 30,
//         marginHorizontal: 30,
//     },
//     signintext: {
//         textAlign: 'center',
//         fontWeight: 'bold',
//         fontSize: 15,
//     },
//     googleimg: {
//         height: 34,
//         width: 34,
//     },
//     facebookimg: {
//         height: 38,
//         width: 38,
//     },
//     infoText: {
//         marginTop: 20,
//         fontSize: 16,
//         fontWeight: 'bold',
//     },
//     errorText: {
//         color: 'red',
//         marginBottom: 13,
//     },
//     suggestionsContainer: {
//         top: 20,
//         position: 'absolute',
//         left: 20,
//         right: 20,
//         backgroundColor: '#fff',
//         borderColor: '#ccc',
//         borderRadius: 5,
//     },
//     suggestionItem: {
//         padding: 10,
//         borderBottomColor: '#ccc',
//         borderBottomWidth: 1,
//     },
//     otpContainer: {
//         flexDirection: 'row',
//         justifyContent: 'space-between',
//         marginVertical: 20,
//     },
//     otpInput1: {
//         borderWidth: 2,
//         borderColor: 'gray',
//         textAlign: 'center',
//         fontSize: 18,
//         width: 40,
//         marginHorizontal: 5,
//         borderRadius: 10
//     },
// });

// export default EnterOtp;

// import React, { useEffect, useRef, useState } from 'react';
// import {
//     Alert,
//     Image,
//     StyleSheet,
//     Text,
//     TextInput,
//     TouchableOpacity,
//     View,
//     ActivityIndicator,
//     Keyboard,
//     ScrollView,
//     KeyboardAvoidingView,
// } from 'react-native';
// import { useNavigation } from '@react-navigation/native';
// import axios from 'axios';

// import useOnlineStatus from '../../utils/hooks/online/useOnlineStatus';

// const EnterOtp = () => {
//     const navigation = useNavigation();
//     const [loading, setLoading] = useState(false);
//     const [email, setEmail] = useState('');
//     const onlineStatus = useOnlineStatus();
//     const [otp, setOtp] = useState(['', '', '', '', '', '']);
//     const [resendDisabled, setResendDisabled] = useState(false);
//     const inputRefs = useRef([]);

//     const handleSetPassword = () => {
//         setLoading(true);
//         // Simulating network call
//         setTimeout(() => {
//             setLoading(false);
//             navigation.navigate('ConfirmPassword');
//         }, 2000);
//     };

//     const handleResendOtp = () => {
//         setResendDisabled(true);
//         // Simulate OTP resend logic
//         setTimeout(() => {
//             Alert.alert('OTP Resent', 'A new OTP has been sent to your email.');
//             setResendDisabled(false);
//         }, 30000); // Simulate delay
//     };

//     const handleChange = (text, index) => {
//         let newOtp = [...otp];
//         newOtp[index] = text;

//         if (text && index < 5) {
//             inputRefs.current[index + 1].focus();
//         }

//         setOtp(newOtp);
//     };

//     const handleKeyPress = (e, index) => {
//         if (e.nativeEvent.key === 'Backspace' && otp[index] === '' && index > 0) {
//             inputRefs.current[index - 1].focus();
//         }
//     };

//     return (
//         <KeyboardAvoidingView
//             style={{ flex: 1 }}
//             behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
//             keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0} 
//         >
//             <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
//                 <View style={styles.container}>
//                     <View style={styles.imageContainer}>
//                         <Image
//                             style={{ height: 103, width: 103, marginTop: 30 }}
//                             source={require('../../../assets/loginbg.png')}
//                         />
//                     </View>
//                     <View style={styles.formContainer}>
//                         <Text style={styles.title}>Please enter the verification code sent to your email</Text>

//                         <View style={styles.otpContainer}>
//                             {otp.map((value, index) => (
//                                 <TextInput
//                                     key={index}
//                                     style={styles.otpInput1}
//                                     keyboardType="numeric"
//                                     maxLength={1}
//                                     value={value}
//                                     onChangeText={(text) => handleChange(text, index)}
//                                     onKeyPress={(e) => handleKeyPress(e, index)}
//                                     ref={(ref) => (inputRefs.current[index] = ref)} 
//                                 />
//                             ))}
//                         </View>

//                         {/* Resend Button */}
//                         <TouchableOpacity
//                             style={[styles.resendButton, resendDisabled && styles.disabledButton]}
//                             onPress={handleResendOtp}
//                             disabled={resendDisabled}
//                         >
//                             <Text style={styles.resendText}>
//                                 {resendDisabled ? 'Resend in 30s' : 'Resend Code'}
//                             </Text>
//                         </TouchableOpacity>

//                         <TouchableOpacity
//                             style={styles.button}
//                             onPress={handleSetPassword}
//                             disabled={loading}
//                         >
//                             {loading ? (
//                                 <ActivityIndicator color="#fff" />
//                             ) : (
//                                 <Text style={styles.buttonText}>Confirm</Text>
//                             )}
//                         </TouchableOpacity>

//                         <View style={styles.line} />

//                     </View>
//                     <View style={{ justifyContent: 'flex-end', flex: 1, marginVertical: 10 }}>
//                         <Text style={{ textAlign: 'center', color: "#000" }}>
//                             All rights with Codeverse Technologies
//                         </Text>
//                     </View>
//                 </View>
//             </ScrollView>
//         </KeyboardAvoidingView>
//     );
// };

// const styles = StyleSheet.create({
//     container: {
//         flex: 1,
//         paddingHorizontal: 20,
//         backgroundColor: '#fff',
//     },
//     title: {
//         fontSize: 20,
//         marginBottom: 30,
//         color: '#390050',
//         textAlign: 'center',
//     },
//     formContainer: {
//         width: '100%',
//         marginTop: 30,
//     },
//     otpContainer: {
//         flexDirection: 'row',
//         justifyContent: 'space-between',
//         marginVertical: 20,
//     },
//     otpInput1: {
//         borderWidth: 2,
//         borderColor: 'gray',
//         textAlign: 'center',
//         fontSize: 18,
//         width: 40,
//         marginHorizontal: 5,
//         borderRadius: 10,
//     },
//     resendButton: {
//         marginVertical: 10,
//         alignItems: 'center',
//     },
//     resendText: {
//         color: '#1F74BA',
//         fontSize: 16,
//         fontWeight: 'bold',
//     },
//     disabledButton: {
//         opacity: 0.5,
//     },
//     button: {
//         width: '100%',
//         height: 50,
//         backgroundColor: '#1F74BA',
//         justifyContent: 'center',
//         alignItems: 'center',
//         borderRadius: 5,
//     },
//     buttonText: {
//         fontSize: 18,
//         color: '#fff',
//     },
//     line: {
//         borderBottomColor: '#615858C7',
//         borderBottomWidth: 1,
//         marginVertical: 30,
//         marginHorizontal: 30,
//     },
// });

// export default EnterOtp;



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

const EnterOtp = () => {
    const navigation = useNavigation();
    const [loading, setLoading] = useState(false);
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [resendDisabled, setResendDisabled] = useState(false);
    const [timer, setTimer] = useState(30); 
    const inputRefs = useRef([]);

    const handleSetPassword = () => {
        setLoading(true);
        setTimeout(() => {
            setLoading(false);
            navigation.navigate('ConfirmPassword');
        }, 2000);
    };

    const handleResendOtp = () => {
        setResendDisabled(true);
        setTimer(60); 
        setTimeout(() => {
            Alert.alert('OTP Resent', 'A new OTP has been sent to your email.');
        }, 1000); 
    };

    useEffect(() => {
        let interval;
        if (resendDisabled) {
            interval = setInterval(() => {
                setTimer((prevTimer) => {
                    if (prevTimer <= 1) {
                        clearInterval(interval);
                        setResendDisabled(false);
                        return 0;
                    }
                    return prevTimer - 1;
                });
            }, 1000);
        }
        return () => clearInterval(interval); 
    }, [resendDisabled]);

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

    const handleTest=()=>{
        Alert.alert("Clicked Resend");
    }

    return (
        <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
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
                        <Text style={styles.title}>Please enter the verification code sent to your email</Text>

                        <View style={styles.otpContainer}>
                            {otp.map((value, index) => (
                                <TextInput
                                    key={index}
                                    style={styles.otpInput}
                                    keyboardType="numeric"
                                    maxLength={1}
                                    value={value}
                                    onChangeText={(text) => handleChange(text, index)}
                                    onKeyPress={(e) => handleKeyPress(e, index)}
                                    ref={(ref) => (inputRefs.current[index] = ref)}
                                />
                            ))}
                        </View>

                        {/* Resend Button with Countdown */}
                        <TouchableOpacity
                            style={[styles.resendButton, resendDisabled && styles.disabledButton]}
                            onPress={handleResendOtp}
                            // onPress={handleTest}
                            disabled={resendDisabled}
                        >
                            <Text style={styles.resendText}>
                                {resendDisabled ? `Resend in ${timer}s` : 'Resend Code'}
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.button}
                            onPress={handleSetPassword}
                            disabled={loading}
                        >
                            {loading ? (
                                <ActivityIndicator color="#fff" />
                            ) : (
                                <Text style={styles.buttonText}>Confirm</Text>
                            )}
                        </TouchableOpacity>

                        <View style={styles.line} />
                    </View>
                    <View style={{ justifyContent: 'flex-end', flex: 1, marginVertical: 10 }}>
                        <Text style={{ textAlign: 'center', color: '#000' }}>
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
        fontSize: 20,
        marginBottom: 30,
        color: '#390050',
        textAlign: 'center',
    },
    formContainer: {
        width: '100%',
        marginTop: 30,
    },
    otpContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginVertical: 20,
    },
    otpInput: {
        borderWidth: 2,
        borderColor: 'gray',
        textAlign: 'center',
        fontSize: 18,
        width: 40,
        marginHorizontal: 5,
        borderRadius: 10,
    },
    resendButton: {
        marginVertical: 10,
        alignItems: 'center',
    },
    resendText: {
        color: '#1F74BA',
        fontSize: 16,
        fontWeight: 'bold',
    },
    disabledButton: {
        opacity: 0.5,
    },
    button: {
        width: '100%',
        height: 50,
        backgroundColor: '#1F74BA',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 5,
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
});

export default EnterOtp;
