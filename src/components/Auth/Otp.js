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
import { setParams } from '../common/common';
import AppStyles from '../common/AppStyles';
import OtpInputs from "react-native-otp-inputs";

const { width, height } = Dimensions.get('window');
const TIMER = 120;
export default class Otp extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            data: [],
            loading: false,
            code: '',
            codeError: 'Enter OTP'
        }


    }
    register = () => {
        const mobile = this.props.mobile;
        const mobile_otp = this.props.mobile_otp;
        const { code } = this.state;
        let errorcount = 0;
        if (code == '' || code.length != '4') {
            ToastAndroid.show(
                'Please Enter Otp',
                ToastAndroid.SHORT,
            );
            errorcount++;
            return;
        }
        if (code != mobile_otp) {
            ToastAndroid.show(
                'Please Enter Valid Otp',
                ToastAndroid.SHORT,
            );
            errorcount++;
            return;
        }
        if (errorcount == 0) {
            Actions.Register({ mobile: mobile, mobile_otp: mobile_otp })
        }


    }
    componentDidMount() {
        this.setState({ loading: false })
    }


    componentWillUnmount() {
        // clearInterval(this.interval);
    }
    formatText = (text) => {
        return text.replace(/[^+\d]/g, '');
    };
    render() {
        console.disableYellowBox = true;
        let mobile = this.props.mobile;
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
                <View style={{ padding: 10, backgroundColor: '#FFFFFF', flex: 1, justifyContent: 'space-evenly' }}>
                    <Image source={require('../../../images/pcb_logo.png')} style={{ ...styles.imagestyle }} />
                    <Text style={{ ...AppStyles.oddLMedium, color: '#142031' }}>Enter the 4 digit SMS sent to your mobile {mobile}</Text>
                    <TextField label='OTP'
                        value={this.state.code}
                        onChangeText={(code) => this.setState({ code })}
                        error={this.state.codeError}
                        style={[AppStyles.evenLRegular, { color: '#142031' }]}
                        titleTextStyle={[AppStyles.evenSRegular]}
                        keyboardType='numeric'
                        maxLength={4}
                        formatText={this.formatText}
                        returnKeyType="go"
                        textColor='#142031'
                        tintColor='#142031'
                        baseColor='#142031'
                        labelTextStyle={AppStyles.evenLRegular}
                        errorColor={'#142031'}
                        autoCorrect={false}
                        ref={"mobile"}
                        autoCapitalize='none'
                    // onBlur={()=>{this.resendOtp()}}
                    />
                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around' }}>

                        <TouchableOpacity style={{ height: 50, alignItems: 'center', justifyContent: 'center', backgroundColor: '#2680eb', flex: 0.8, borderRadius: 5, }} onPress={() => this.register()}>
                            <Text style={[AppStyles.evenLBold, { paddingHorizontal: 10, color: "#FFFFFF" }]}>
                                Register</Text>
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