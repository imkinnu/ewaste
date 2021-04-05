import React from 'react';
import { Actions } from 'react-native-router-flux';
import { TextField } from 'react-native-material-textfield';
import {
    Platform, StyleSheet, Text, View, TextInput, ScrollView, FlatList, NetInfo, TouchableOpacity,
    ToastAndroid, ImageBackground, ActivityIndicator, AsyncStorage, Image, Dimensions, StatusBar
} from 'react-native';
import {
    widthPercentageToDP as wp, heightPercentageToDP as hp, listenOrientationChange as loc,
    removeOrientationListener as rol
} from 'react-native-responsive-screen';
import { setParams } from '../common/common';
import AppStyles from '../common/AppStyles';
import LinearGradient from 'react-native-linear-gradient';
import firebase from 'react-native-firebase';

const { width, height } = Dimensions.get('window');

export default class Login extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            data: [],
            loading: true,
            username: '',
            password: '',
            mobile: '',
            usernameError: 'Enter Username',
            passwordError: 'Enter Password ',
            mobileError: 'Enter Mobile No',
            errorColor: '#ffffff',
            usernameFocused: false,
            passwordFocused: false,
            token: '',
            clientToken: 'feac64375e37fcf6a0def1c66225c27b',
            status: 0,
            pageindex: 0,
            errorColor: '#142031',
        }

        this.handleusernameFocused = this.handleusernameFocused.bind(this);
        this.handlepasswordFocused = this.handlepasswordFocused.bind(this);

    }
    handleusernameFocused() {
        this.setState({ usernameFocused: true, usernameError: '' });
    }


    checkPermission = async () => {
        const enabled = await firebase.messaging().hasPermission();
        // alert(enabled);
        // If Premission granted proceed towards token fetch
        if (enabled) {
            this.getToken();
        } else {
            // If permission hasn’t been granted to our app, request user in requestPermission method.
            this.requestPermission();
        }
    };

    requestPermission = async () => {
        try {
            await firebase.messaging().requestPermission();
            // User has authorised
            getToken();
        } catch (error) {
            // User has rejected permissions
        }
    };

    getToken = async () => {
        let fcmToken = await AsyncStorage.getItem('testapp_fcmToken');
        if (!fcmToken) {
            await firebase.messaging().subscribeToTopic('entroewaste');
            fcmToken = await firebase.messaging().getToken();
            console.log('fcmToken', fcmToken);
            if (fcmToken) {
                // user has a device token
                await AsyncStorage.setItem('testapp_fcmToken', fcmToken);
            }
        }
    };

    handlepasswordFocused() {
        this.setState({ passwordFocused: true, passwordError: '' });
    }
    checkLogin = async () => {
        let errorcount = 0;
        if (this.state.mobile != '') {
            let reg_mob = /^\(?([6-9]{1})\)?[-. ]?([0-9]{9})$/;
            if (reg_mob.test(this.state.mobile) === false) {
                this.setState({ mobileError: 'Invalid Mobile No.', errorColor: '#e74c3c' })
                errorcount++;
            }
        }
        else {
            this.setState({ mobileError: '', errorColor: '#142031' })
        }

        if (this.state.mobile === '') {
            this.setState({ mobileError: 'Please Enter Mobile No.*', errorColor: '#e74c3c' })
            errorcount++;
        }
        else {
            this.setState({ mobileError: '', errorColor: '#142031' })
        }
        if (this.state.password === '') {
            this.setState({ passwordError: 'Please Enter Your Password *', errorColor: '#e74c3c' })
            errorcount++;
        }
        else {
            this.setState({ passwordError: '', errorColor: '#142031' })
        }

        if (errorcount == 0) {
            //get the fcm(firebase cloud messaging token);
            let fcmToken = await AsyncStorage.getItem('testapp_fcmToken');
            if (!fcmToken) {
                this.getToken();
                let fcmToken = await AsyncStorage.getItem('testapp_fcmToken');
            }
            fetch(global.PATH, {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'apikey': 'feac64375e37fcf6a0def1c66225c27b',
                    'Cache-Control': 'no-cache, no-store, must-revalidate',
                    'Pragma': 'no-cache',
                    'Expires': 0
                },
                body: JSON.stringify({
                    type: 'seller',
                    username: this.state.mobile,
                    password: this.state.password,
                    login: 1,
                    token: fcmToken
                })
            }).then((response) => response.json())
                .then((responseJson) => {
                    if (responseJson.result == "success") {
                        AsyncStorage.setItem('username', this.state.mobile);
                        AsyncStorage.setItem('user', responseJson.user);
                        AsyncStorage.setItem('userlevel', responseJson.userlevel);
                        AsyncStorage.setItem('uid', responseJson.uid);
                        ToastAndroid.show(
                            'Success',
                            ToastAndroid.SHORT,
                        );
                        Actions.Home();
                    } else {
                        ToastAndroid.show(
                            responseJson.result,
                            ToastAndroid.SHORT,
                        );
                    }
                }).catch((error) => {
                    ToastAndroid.show(
                        'Failed',
                        ToastAndroid.SHORT,
                    );
                    console.error(error);
                });
        }
    }
    handleOnScroll(event) {
        //calculate screenIndex by contentOffset and screen width
        let pageindex = parseInt(event.nativeEvent.contentOffset.x / Dimensions.get('window').width);
        this.setState({ pageindex: pageindex })
    }
    formatText = (text) => {
        return text.replace(/[^+\d]/g, '');
    };
    render() {
        console.disableYellowBox = true;
        return (
            <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps='handled'>
                <StatusBar hidden />
                <View style={{ backgroundColor: '#FFFFFF', flex: 1, paddingTop: 20, justifyContent: 'center' }}>

                    {
                        this.state.status == 0 &&
                        <View >
                            <ScrollView
                                style={{ flex: 1 }}
                                horizontal={true}
                                pagingEnabled={true}
                                onScroll={(e) => this.handleOnScroll(e)}
                                showsHorizontalScrollIndicator={false}
                                scrollEventThrottle={5}
                            >
                                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>

                                    <Image source={require('../../../images/waste.png')} style={{ height: height / 2, width: width }} resizeMethod="auto" resizeMode="contain" />
                                    <Text style={[AppStyles.oddLBold, { color: "#1B2430", textAlign: 'center', fontSize: 20 }]}>Be E-Responsible </Text>
                                    <Text style={[AppStyles.oddMRegular, { color: "#1B2430", textAlign: 'center', paddingVertical: 2 }]}>{`If it can’t be reduced, reused, repaired, \n then it  should be restricted.`} </Text>
                                    <View style={styles.rowStyle}>
                                        <TouchableOpacity style={{ height: 50, alignItems: 'center', justifyContent: 'center', backgroundColor: '#2680eb', width: wp('45%'), borderRadius: 5 }} onPress={() => this.setState({ status: 1 })}>
                                            <Text style={[AppStyles.evenXLBold, { paddingHorizontal: 10, color: "#FFFFFF" }]}>Login</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity style={{ height: 50, alignItems: 'center', justifyContent: 'center', backgroundColor: '#ff2e7a', width: wp('45%'), borderRadius: 5, marginLeft: 5 }} onPress={() => Actions.Mobile()}>
                                            <Text style={[AppStyles.evenXLBold, { paddingHorizontal: 10, color: "#FFFFFF" }]}>Register</Text>
                                        </TouchableOpacity>
                                    </View>

                                </View>
                                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>

                                    <Image source={require('../../../images/earn_money.jpg')} style={{ height: height / 2, width: width }} resizeMethod="auto" resizeMode="contain" />
                                    <Text style={[AppStyles.oddLBold, { color: "#1B2430", textAlign: 'center', fontSize: 20 }]}>Earn Money </Text>
                                    <Text style={[AppStyles.oddMRegular, { color: "#1B2430", textAlign: 'center', paddingVertical: 2 }]}>{`Help keep the earth clean and \n earn money on the side`} </Text>

                                </View>
                                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>

                                    <Image source={require('../../../images/reduce.png')} style={{ height: height / 2, width: width }} resizeMethod="auto" resizeMode="contain" />
                                    <Text style={[AppStyles.oddLBold, { color: "#1B2430", textAlign: 'center', fontSize: 20 }]}>Reduce,Reuse,Recycle </Text>
                                    <Text style={[AppStyles.oddMRegular, { color: "#1B2430", textAlign: 'center', paddingVertical: 2 }]}>{`Think before you trash Recycle`} </Text>

                                </View>
                            </ScrollView>

                            <View style={styles.paginationWrapper}>
                                {Array.from(Array(3).keys()).map((key, index) => (
                                    <View style={this.state.pageindex == index ? styles.paginationDots1 : styles.paginationDots} key={index} />
                                ))}
                            </View>
                        </View>
                    }
                </View>
                {
                    this.state.status == 1 &&
                    <View style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
                        {/* <ImageBackground source={require('../../../images/slider_background.png')} style={{height:height,width:width,padding:15}} resizeMode="cover"  > */}
                        {/* <ImageBackground source={require('../../../images/polygon.png')} style={{height:300,width:300,alignSelf:'center',justifyContent:'center'}}  resizeMode='contain' resizeMethod="auto" > */}
                        <Image source={require('../../../images/pcb_logo.png')} style={{ ...styles.imagestyle }} resizeMode='contain' />
                        {/* </ImageBackground> */}
                        <View style={{ paddingHorizontal: 10 }}>
                            <Text style={{ ...AppStyles.oddXLMedium, color: '#142031' }}>Welcome User :)</Text>
                            <TextField label='Mobile No.'
                                value={this.state.mobile}
                                onChangeText={(mobile) => this.setState({ mobile })}
                                error={this.state.mobileError}
                                style={[AppStyles.evenLRegular, { color: '#000' }]}
                                titleTextStyle={[AppStyles.evenSRegular]}
                                keyboardType='numeric'
                                maxLength={10}
                                formatText={this.formatText}
                                returnKeyType="next"
                                textColor='#142031'
                                tintColor='#142031'
                                baseColor='#142031'
                                labelTextStyle={AppStyles.evenLRegular}
                                autoCorrect={false}
                                ref={"mobile"}
                                blurOnSubmit={false}
                                autoCapitalize='none'
                                onSubmitEditing={() => { this.refs.passwordtext.focus(); }}
                                errorColor={this.state.errorColor}
                            />

                            <TextField label='Password'
                                value={this.state.password}
                                onChangeText={(password) => this.setState({ password })}
                                error={this.state.passwordError}
                                onFocus={this.handlepasswordFocused}
                                style={[AppStyles.evenLRegular, { color: '#142031' }]}
                                titleTextStyle={[AppStyles.evenSRegular]}
                                returnKeyType="go"
                                textColor='#142031'
                                tintColor='#142031'
                                baseColor='#142031'
                                labelTextStyle={[AppStyles.evenLRegular]}
                                errorColor={'#142031'}
                                secureTextEntry={true}
                                autoCorrect={false}
                                ref={"passwordtext"}
                                errorColor={this.state.errorColor}
                            />
                            <View style={{ paddingVertical: 15 }}>
                                <Text style={[AppStyles.oddMRegular, { color: "#999999", textAlign: 'center' }]}>Don't have an account? </Text>
                                <TouchableOpacity onPress={() => Actions.Mobile()}>
                                    <Text style={[AppStyles.oddLBold, { color: "#142031", textAlign: 'center', paddingTop: 2, textDecorationLine: 'underline', textDecorationColor: '#1B2430' }]}>Create Account </Text>
                                </TouchableOpacity>
                            </View>
                            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 10 }}>
                                <TouchableOpacity style={{ height: 50, alignItems: 'center', justifyContent: 'center', backgroundColor: '#2680eb', width: width - 100, borderRadius: 5 }} onPress={() => this.checkLogin()}>
                                    <Text style={[AppStyles.evenLBold, { paddingHorizontal: 10, color: "#FFFFFF" }]}>
                                        LOGIN</Text>
                                </TouchableOpacity>
                            </View>
                            <View style={{ paddingVertical: 15 }}>
                                <TouchableOpacity onPress={() => Actions.ForgotPassword()}>
                                    <Text style={[AppStyles.oddLBold, { color: "#142031", textAlign: 'center', paddingTop: 2, textDecorationLine: 'underline', textDecorationColor: '#1B2430' }]}>Forgot Password ?  </Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                        {/* </ImageBackground> */}
                    </View>

                }
                {/* <Text style={[AppStyles.evenLBold,{color:"#1B2430",textAlign:'center',top:-10}]}>{`ANDHRA PRADESH ENVIRONMENT\nMANAGEMENT CORPORATION`}</Text> */}

            </ScrollView>
        );
    }
}

const styles = StyleSheet.create({

    container: {
        flex: 1,
        flexDirection: 'column',
        justifyContent: 'flex-start',
        alignItems: 'center',
        marginTop: 50,
    },
    imagestyle: {
        width: width,
        height: height / 3,
        alignSelf: 'center'
    }, form: {
        flex: 1, justifyContent: 'center', backgroundColor: '#FFFFFF', top: -30, borderTopLeftRadius: 30, borderTopRightRadius: 30, paddingHorizontal: 15
    },
    iconStyle: {
        width: 100, height: 100, borderRadius: 50, borderWidth: 2, borderColor: '#0072bb', justifyContent: 'center'
    },
    iconText: {
        width: 70, height: 70, alignSelf: 'center'
    }, rowStyle: {
        flexDirection: 'row', alignItems: 'center', flex: 1, marginTop: 30
    }, paginationWrapper: {
        top: 50,
        left: 0,
        right: 0,
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'row',
    },
    paginationDots: {
        height: 5,
        width: 25,
        borderRadius: 10 / 2,
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: '#2680eb',
        marginLeft: 10,
    },
    paginationDots1: {
        height: 5,
        width: 25,
        borderRadius: 10 / 2,
        backgroundColor: '#2680eb',
        borderWidth: 1,
        borderColor: '#2680eb',
        marginLeft: 10,
    }


});