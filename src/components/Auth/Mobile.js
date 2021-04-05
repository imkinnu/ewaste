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
            data: [],
            loading: false,
            name: '',
            password: '',
            mobile: '',
            otp: '',
            cpassword: '',
            vmobile: '',
            nameError: 'Enter Username',
            passwordError: 'Enter Password ',
            mobileError: 'Enter Mobile No',
            vmobileError: 'Enter Vendor Mobile No',
            otpError: 'Enter OTP',
            cpasswordError: 'Confirm Passowrd',
            userlevelError: 'Please Select User Type',
            errorColor: '#142031',
            nameFocused: false,
            passwordFocused: false,
            token: '',
            clientToken: 'feac64375e37fcf6a0def1c66225c27b',
            timer: TIMER,
            valid_mobile: false,
            mobile_otp: '',
            userlevel: '',
            vendor_data: [],
            vendor: '',
            vendorError: 'Please Select Vendor',
            vendorStatus: 0,
            editable: true,
            districts: [],
            mandals: [],
            district: '',
            mandal: '',
            districtError: 'Select District Name',
            mandalError: 'Select Mandal Name',
            landmark: '',
            landmarkError: 'Enter Landmark',
            address: '',
            addressError: 'Enter Address',
            pincode: '',
            pincodeError: 'Enter Pincode',
            city: '',
            lat: '0.00',
            lon: '0.00',
            radio: '',
            otp_disabled: false,
            disabled_color: "#2680eb",
            errorColor: '#142031',
        }


    }
    componentDidMount() {
        this.setCounter();
        this.setState({ loading: false })

    }

    setCounter() {
        this.interval = setInterval(
            () => this.setState((prevState) => ({ timer: prevState.timer - 1 })),
            1000
        );
    }
    componentDidUpdate() {
        if (this.state.timer === 0) {
            clearInterval(this.interval);
        }
    }

    componentWillReceiveProps() {
        this.setState({ mobile: '', otp_disabled: false, disabled_color: '#2680eb' })
    }


    componentWillUnmount() {
        clearInterval(this.interval);
    }
    resendOtp() {
        let errorcount = 0;
        if (this.state.mobile != '') {
            let reg_mob = /^\(?([6-9]{1})\)?[-. ]?([0-9]{9})$/;
            if (reg_mob.test(this.state.mobile) === false) {
                this.setState({ mobileError: 'Invalid Mobile No.', errorColor: '#e74c3c' })
                errorcount++;
            }
        } if (this.state.mobile === '') {
            this.setState({ mobileError: 'Please Enter Mobile No.*', errorColor: '#e74c3c' })
            errorcount++;
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
                    sendOtp: 1
                })
            }).then((response) => response.json())
                .then((responseJson) => {
                    if (responseJson.result == "success") {
                        this.setState({ mobile_otp: responseJson.otp });
                        Actions.Otp({ mobile_otp: responseJson.otp, mobile: this.state.mobile })
                    } else {
                        this.setState({ otp_disabled: false, disabled_color: '#2680eb' })
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
    // getVendorIndex= (value) =>{   
    //     var index = this.state.vendor_data.findIndex(obj => obj.value === value);
    //     var mobile = this.state.vendor_data[index].mobile;
    //     var username = this.state.vendor_data[index].label;
    //     this.setState({loading:true})
    //     this.setState({vendor:value,mobile:mobile,loading:false,editable:false,name:username});
    //     this.resendOtp();
    // }
    formatText = (text) => {
        return text.replace(/[^+\d]/g, '');
    };
    render() {
        console.disableYellowBox = true;
        var userlevel = [
            { label: 'Buyer', value: 'buyer' },
            { label: 'Seller', value: 'seller' },
        ];

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
                {/* <ImageBackground source={require('../../../images/slider_background.png')} style={{flex:1,width:width,paddingHorizontal:10,justifyContent:'center'}} resizeMode="cover"  > */}

                <View style={{ paddingHorizontal: 10, backgroundColor: '#FFFFFF', flex: 1, justifyContent: 'space-evenly' }}>
                    <Image source={require('../../../images/pcb_logo.png')} style={{ ...styles.imagestyle }} />
                    <Text style={{ ...AppStyles.oddXLMedium, color: '#142031' }}>Welcome User :)</Text>
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
                    // onBlur={()=>{this.resendOtp()}}
                    />
                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around' }}>
                        {
                            (this.state.mobile.length == 10 && this.state.valid_mobile) &&

                            <View>
                                {
                                    this.state.timer === 0 ?
                                        <TouchableOpacity onPress={this.resendOtp}>
                                            <Text style={[AppStyles.evenLRegular, { color: '#142031' }]}> RESEND OTP </Text>
                                        </TouchableOpacity>
                                        :
                                        <Text style={[AppStyles.evenLRegular, { color: '#142031' }]}> RESEND OTP IN {this.state.timer} Sec</Text>
                                }
                            </View>
                        }
                        <TouchableOpacity style={{ height: 50, alignItems: 'center', justifyContent: 'center', backgroundColor: this.state.backgroundColor, flex: 0.8, borderRadius: 5, marginVertical: 5, backgroundColor: this.state.disabled_color }} onPress={() => this.resendOtp()}>
                            <Text style={[AppStyles.evenXLBold, { paddingHorizontal: 10, color: "#FFFFFF" }]}>
                                Get OTP</Text>
                        </TouchableOpacity>
                    </View>
                </View>
                {/* </ImageBackground> */}

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