import React from 'react';
import { Actions } from 'react-native-router-flux';
import { TextField } from 'react-native-material-textfield';
import {
    Platform, StyleSheet, Text, View, PermissionsAndroid, ScrollView, FlatList, NetInfo, TouchableOpacity,
    ToastAndroid, ImageBackground, ActivityIndicator, AsyncStorage, Image, Dimensions, StatusBar
} from 'react-native';
import {
    widthPercentageToDP as wp, heightPercentageToDP as hp, listenOrientationChange as loc,
    removeOrientationListener as rol
} from 'react-native-responsive-screen';
import { Dropdown as MaterialDropdown } from 'react-native-material-dropdown';
import { setParams } from '../common/common';
import Geolocation from 'react-native-geolocation-service';
import AppStyles from '../common/AppStyles';
import Textarea from 'react-native-textarea';
import LinearGradient from 'react-native-linear-gradient';
import RadioForm, { RadioButton, RadioButtonInput, RadioButtonLabel } from 'react-native-simple-radio-button';
import { color } from 'react-native-reanimated';

const { width, height } = Dimensions.get('window');
const TIMER = 120;
export default class Mobile extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            loading: false,
            password: '',
            mobile: '',
            otp: '',
            cpassword: '',
            passwordError: 'Enter Password ',
            mobileError: 'Enter Mobile No',
            otpError: 'Enter OTP',
            cpasswordError: 'Confirm Passoword',
            errorColor: '#142031',
            token: '',
            clientToken: 'feac64375e37fcf6a0def1c66225c27b',
            valid_mobile: false,
            mobile_otp: '',
            otp_disabled: false,
            disabled_color: "#2680eb",
        }


    }
    componentDidMount() {
        this.setState({ loading: false })

    }

    componentWillReceiveProps() {
        this.setState({ mobile: '', otp_disabled: false, disabled_color: '#2680eb' })
    }


    componentWillUnmount() {
        clearInterval(this.interval);
    }

    resendOtp() {
        this.setState({ otp_disabled: true, disabled_color: "#ccc" });
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

        if (this.state.mobile == '') {
            this.setState({ mobileError: 'Please Enter Mobile No.*', errorColor: '#e74c3c' })
            errorcount++;
        }
        else {
            this.setState({ mobileError: '', errorColor: '#142031' })
        }

        if (errorcount == 0) {
            this.setState({ otp_disabled: true, disabled_color: "#ccc" });
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
                    forgotPasswordSendOtp: 1,
                })
            }).then((response) => response.json())
                .then((responseJson) => {
                    console.log(responseJson);
                    if (responseJson.result == "success") {
                        this.setState({ mobile_otp: responseJson.otp, otp_disabled: true, disabled_color: "#ccc" });
                    } else {
                        this.setState({ otp_disabled: false, disabled_color: "#2680eb" });
                        this.setState({ loading: false, valid_mobile: false })
                        ToastAndroid.show(
                            responseJson.msg,
                            ToastAndroid.SHORT,
                        );
                    }
                }).catch((error) => {
                    ToastAndroid.TOP(
                        'Failed',
                        ToastAndroid.SHORT,
                    );
                });
        }
        else {
            this.setState({ otp_disabled: false, disabled_color: "#2680eb" });
        }
    }
    forgotPassword() {

        let errorcount = 0;
        if (this.state.mobile != '') {
            let reg_mob = /^\(?([6-9]{1})\)?[-. ]?([0-9]{9})$/;
            if (reg_mob.test(this.state.mobile) === false) {
                this.setState({ mobileError: 'Invalid Mobile No.', errorColor: '#e74c3c' })
                errorcount++;
            }
        }
        if (this.state.otp === '') {
            this.setState({ otpError: 'Please Enter Otp *', errorColor: '#e74c3c' })
            errorcount++;
        }
        else {
            this.setState({ otpError: '', errorColor: '#142031' })

        }
        if (this.state.password === '') {
            this.setState({ passwordError: 'Please Enter Password *', errorColor: '#e74c3c' })
            errorcount++;
        }
        else {
            this.setState({ passwordError: '', errorColor: '#142031' })

        }
        if (this.state.cpassword === '') {
            this.setState({ cpasswordError: 'Please Re Enter Password *', errorColor: '#e74c3c' })
            errorcount++;
        }
        else {
            this.setState({ cpasswordError: '', errorColor: '#142031' })
        }

        if (this.state.otp != this.state.mobile_otp) {
            ToastAndroid.show(
                "Invalid OTP",
                ToastAndroid.SHORT,
            );
        }

        if (errorcount === 0) {
            this.setState({ otp_disabled: true, disabled_color: '#eee' })
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
                    forgotPassword: 1,
                    otp: this.state.otp,
                    otpOriginal: this.state.mobile_otp,
                    password: this.state.password,
                    confirmpassword: this.state.cpassword
                })
            }).then((response) => response.json())
                .then((responseJson) => {
                    if (responseJson.result == "success") {
                        ToastAndroid.show(
                            "Password Updated Successfully",
                            ToastAndroid.SHORT,
                        );
                        Actions.Login();
                    } else {
                        this.setState({ loading: false, valid_mobile: false })
                        ToastAndroid.show(
                            responseJson.msg,
                            ToastAndroid.SHORT,
                        );
                    }
                }).catch((error) => {
                    ToastAndroid.TOP(
                        'Failed',
                        ToastAndroid.SHORT,
                    );
                });
        }
    }
    formatText = (text) => {
        return text.replace(/[^+\d]/g, '');
    };
    render() {
        if (this.state.loading) {
            return (
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#EEEEEE' }}>
                    <View style={{ height: 100, width: 100, backgroundColor: '#FFFFFF', borderRadius: 10, justifyContent: 'center', elevation: 2 }}>
                        <ActivityIndicator size="small" color='#338995' />
                    </View>
                </View>
            );
        }
        return (
            <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps='handled'>
                <StatusBar hidden />
                <View style={{ paddingHorizontal: 10, backgroundColor: '#FFFFFF', flex: 1, justifyContent: 'space-evenly' }}>
                    <Image source={require('../../../images/pcb_logo.png')} style={{ ...styles.imagestyle }} />
                    <Text style={{ ...AppStyles.oddXLMedium, color: '#142031', }}>Forgot Password</Text>
                    <TextField label='Mobile No.'
                        value={this.state.mobile}
                        onChangeText={(mobile) => this.setState({ mobile })}
                        error={this.state.mobileError}
                        style={[AppStyles.evenLRegular, { color: '#142031' }]}
                        titleTextStyle={[AppStyles.evenSRegular]}
                        keyboardType='numeric'
                        maxLength={10}
                        formatText={this.formatText}
                        returnKeyType="go"
                        textColor='#142031'
                        tintColor='#142031'
                        baseColor='#142031'
                        labelTextStyle={AppStyles.evenLRegular}
                        errorColor={this.state.errorColor}
                        autoCorrect={false}
                        ref={"mobile"}
                        autoCapitalize='none'
                    />
                    <View style={{ flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'flex-start' }}>
                        <TouchableOpacity style={{ height: 40, alignItems: 'center', justifyContent: 'center', backgroundColor: this.state.backgroundColor, flex: 0.3, borderRadius: 5, backgroundColor: this.state.disabled_color }} onPress={() => this.resendOtp()} disabled={this.state.otp_disabled}>
                            <Text style={[AppStyles.evenXLBold, { color: "#FFFFFF" }]}>
                                Get OTP</Text>
                        </TouchableOpacity>
                    </View>
                    <TextField label='Enter OTP'
                        value={this.state.otp}
                        onChangeText={(otp) => this.setState({ otp })}
                        error={this.state.otpError}
                        style={[AppStyles.evenLRegular, { color: '#142031' }]}
                        titleTextStyle={[AppStyles.evenSRegular]}
                        keyboardType='numeric'
                        maxLength={10}
                        formatText={this.formatText}
                        returnKeyType="go"
                        textColor='#142031'
                        tintColor='#142031'
                        baseColor='#142031'
                        labelTextStyle={AppStyles.evenLRegular}
                        errorColor={this.state.errorColor}
                        autoCorrect={false}
                        ref={"mobile"}
                        autoCapitalize='none'
                    />
                    <TextField label='Enter Password'
                        value={this.state.password}
                        onChangeText={(password) => this.setState({ password })}
                        error={this.state.passwordError}
                        style={[AppStyles.evenLRegular, { color: '#142031' }]}
                        titleTextStyle={[AppStyles.evenSRegular]}
                        maxLength={10}
                        returnKeyType="go"
                        textColor='#142031'
                        tintColor='#142031'
                        baseColor='#142031'
                        labelTextStyle={AppStyles.evenLRegular}
                        errorColor={'#142031'}
                        autoCorrect={false}
                        ref={"password"}
                        autoCapitalize='none'
                        secureTextEntry={true}
                        errorColor={this.state.errorColor}
                    />
                    <TextField label='Re Enter Password'
                        value={this.state.cpassword}
                        onChangeText={(cpassword) => this.setState({ cpassword })}
                        error={this.state.cpasswordError}
                        style={[AppStyles.evenLRegular, { color: '#142031' }]}
                        titleTextStyle={[AppStyles.evenSRegular]}
                        maxLength={10}
                        returnKeyType="go"
                        textColor='#142031'
                        tintColor='#142031'
                        baseColor='#142031'
                        labelTextStyle={AppStyles.evenLRegular}
                        errorColor={'#142031'}
                        autoCorrect={false}
                        ref={"mobile"}
                        autoCapitalize='none'
                        secureTextEntry={true}
                        errorColor={this.state.errorColor}
                    />
                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around' }}>
                        <TouchableOpacity style={{ height: 50, alignItems: 'center', justifyContent: 'center', flex: 0.8, borderRadius: 5, marginVertical: 5, backgroundColor: "#2680eb" }} onPress={() => this.forgotPassword()}>
                            <Text style={[AppStyles.evenXLBold, { paddingHorizontal: 10, color: "#fff" }]}>
                                Submit</Text>
                        </TouchableOpacity>
                    </View>
                </View>
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
        marginHorizontal: 15,
    },
    imagestyle: {
        width: width,
        height: height / 3,
        alignSelf: 'center'
    },
    textareaContainer: {
        height: 80,
        padding: 5,
        backgroundColor: '#FFF',
        borderRadius: 10,
        borderColor: '#000',
        borderWidth: 1
    }, textarea: {
        textAlignVertical: 'top',
        height: 100,
        letterSpacing: 0.3,
        paddingTop: 1,
    }
});