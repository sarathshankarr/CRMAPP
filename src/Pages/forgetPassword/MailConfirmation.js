import React, { useEffect, useState } from 'react';
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

const MailConfirmation = () => {
    const navigation = useNavigation();
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState('');
    const onlineStatus = useOnlineStatus();


    const handleGetOtp = () => {
        // Alert.alert("Clicked handleGetOtp");
        setLoading(true);
        let i = 0;
        while (i < 1000000) i++;

        setLoading(false);

        navigation.navigate('EnterOtp');
    }

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
                        <Text style={styles.title}>Forget your Password</Text>
                        <View
                            style={[
                                styles.inputContainer,
                            ]}>
                            <TextInput
                                style={styles.input}
                                placeholder="Email"
                                placeholderTextColor="#000"
                                onChangeText={text => setEmail(text)}
                                value={email}
                            />
                            <Image
                                source={require('../../../assets/email.png')}
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
                                <Text style={styles.buttonText}>Send OTP</Text>
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
    signintext: {
        textAlign: 'center',
        fontWeight: 'bold',
        fontSize: 15,
    },
    googleimg: {
        height: 34,
        width: 34,
    },
    facebookimg: {
        height: 38,
        width: 38,
    },
    infoText: {
        marginTop: 20,
        fontSize: 16,
        fontWeight: 'bold',
    },
    errorText: {
        color: 'red',
        marginBottom: 13,
    },
    suggestionsContainer: {
        top: 20,
        position: 'absolute',
        left: 20,
        right: 20,
        backgroundColor: '#fff',
        borderColor: '#ccc',
        borderRadius: 5,
    },
    suggestionItem: {
        padding: 10,
        borderBottomColor: '#ccc',
        borderBottomWidth: 1,
    },
});

export default MailConfirmation;

