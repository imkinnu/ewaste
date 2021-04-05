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
export default class Register extends React.Component {

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
            cpasswordError: 'Confirm Password',
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
            districtError: 'Please Select District',
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
            radio: ''
        }


    }
    componentDidMount() {
        this.setCounter();
        this.GetDistricts();
        this.setState({ loading: true })
        var that = this;
        async function requestLocationPermission() {
            try {
                const granted = await PermissionsAndroid.request(
                    PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION, {
                    'title': 'Location Access Required',
                    'message': 'This App needs to Access your location'
                }
                )
                if (granted === PermissionsAndroid.RESULTS.GRANTED) {
                    that.callLocation(that);
                } else {
                    alert("Permission Denied");
                }
            } catch (err) {
                console.warn(err)
            }
        }
        requestLocationPermission();
    }
    callLocation(that) {
        if (this.state.userlevel == 'doctor') {
            var parms = {
                doctor_data: true,
                mobile: this.state.username
            }
            const url_params = setParams(parms);
            const url = global.PATH + url_params;
            // console.log(url);
            fetch(url).then((response) => response.json())
                .then((responseJson) => {
                    if (responseJson.result == 'success') {
                        this.setState({ loading: false, data: responseJson })
                    }
                }).catch((error) => {
                    ToastAndroid.show(
                        'Failed',
                        ToastAndroid.SHORT,
                    );
                    console.error(error);
                });
        }
        Geolocation.getCurrentPosition(
            (position) => {
                // console.log(position.coords.latitude);
                // console.log(position.coords.longitude);
                this.setState({
                    lat: position.coords.latitude,
                    lon: position.coords.longitude
                })

                const apiUrl = 'https://maps.googleapis.com/maps/api/geocode/json?address=' + this.state.lat + ',' + this.state.lon + '&key=' + global.API_KEY;
                // console.log(apiUrl);
                fetch(apiUrl).then((response) => response.json())
                    .then((responseJson) => {
                        for (let i = 0; i < responseJson.results[0].address_components.length; i++) {
                            const addressType = responseJson.results[0].address_components[i].types[0];
                            // if (addressType === 'sublocality_level_1') {                                   
                            //     var city = responseJson.results[0].address_components[i].long_name;
                            //     this.setState({mandal : city})
                            // }
                            // if (addressType === 'administrative_area_level_2') {                                   
                            //     var district = responseJson.results[0].address_components[i].long_name;
                            //     this.setState({district : district})
                            // }
                            if (addressType === 'postal_code') {
                                var pincode = responseJson.results[0].address_components[i].long_name;
                                // console.log("Pincode",pincode)
                                this.setState({ pincode: pincode })
                            }
                        }
                        this.setState({ loading: false, address: responseJson.results[0].formatted_address })
                    }).catch((error) => {
                        // Alert.alert("Please Check Your Internet Connection")
                    });
            },
            (error) => {
                alert(error.message);
            },
            { enableHighAccuracy: true, timeout: 5000, maximumAge: 10000 }
        );
        that.watchID = Geolocation.watchPosition((position) => {
            // console.log('position changed',position);
            this.setState({
                lat: position.coords.latitude,
                lon: position.coords.longitude,
            })
        },
            (error) => {
                console.log(error.message);
            },
            { enableHighAccuracy: true, distanceFilter: 1 }
        );

    }
    //Get Districts Data
    GetDistricts = () => {
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
                type: 'buyyer',
                districts: 1
            })
        }).then((response) => response.json())
            .then((responseJson) => {
                if (responseJson.result == "success") {
                    this.setState({ loading: false, districts: responseJson.districtsData })
                }
            }).catch((error) => {
                ToastAndroid.show(
                    'Failed',
                    ToastAndroid.SHORT,
                );
                console.error(error);
            });
    }
    //Get Mandals Data
    GetTowns = (value) => {
        this.setState({ district: value })
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
                type: 'buyyer',
                mandals: 1,
                district: value
            })
        }).then((response) => response.json())
            .then((responseJson) => {
                if (responseJson.result == "success") {
                    this.setState({ loading: false, mandals: responseJson.mandalsData })
                }
            }).catch((error) => {
                ToastAndroid.show(
                    'Failed',
                    ToastAndroid.SHORT,
                );
                console.error(error);
            });
    }
    //Get Vendor Data
    GetVendorData = (value) => {
        if (value == 'buyer') {
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
                    type: 'buyyer',
                    getVendors: 1
                })
            }).then((response) => response.json())
                .then((responseJson) => {
                    if (responseJson.result == "success") {
                        this.setState({ loading: false, vendor_data: responseJson.sellerData, vendorStatus: 1 })
                    }
                }).catch((error) => {
                    ToastAndroid.show(
                        'Failed',
                        ToastAndroid.SHORT,
                    );
                    console.error(error);
                });
        } else {
            this.setState({ loading: false, vendor_data: [], vendorStatus: 0 })
        }
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

    componentWillUnmount() {
        clearInterval(this.interval);
    }
    Register = () => {
        let errorcount = 0;
        let mobile = this.props.mobile;
        let mobile_otp = this.props.mobile_otp;
        // if(this.state.userlevel === ''){
        //     this.setState({userlevelError: 'Please Select Userlevel *',errorColor: '#142031'})
        //     errorcount++;
        // }
        if (this.state.name === '') {
            this.setState({ nameError: 'Please Enter Username *', errorColor: '#e74c3c' })
            errorcount++;
        }
        else {
            this.setState({ nameError: '', errorColor: '#000' })
        }
        if (this.state.password === '') {
            this.setState({ passwordError: 'Please Enter Your Password *', errorColor: '#e74c3c' })
            errorcount++;
        }
        else {
            this.setState({ passwordError: '', errorColor: '#000' })
        }
        if (this.state.cpassword === '') {
            this.setState({ cpasswordError: 'Please Enter Confirm Password *', errorColor: '#e74c3c' })
            errorcount++;
        }
        else {
            this.setState({ cpasswordError: '', errorColor: '#000' })
        }

        // if(this.state.otp === ''){
        //     this.setState({otpError:'Please Enter OTP *',errorColor: '#142031'})
        //     errorcount++;
        // }
        if (this.state.password != this.state.cpassword) {
            ToastAndroid.show(
                'Passwords do not match',
                ToastAndroid.SHORT,
            );
            errorcount++;
        }
        if (this.state.district === '') {
            this.setState({ districtError: 'Please Select District *', errorColor: '#e74c3c' })
        }
        // if(this.state.mobile_otp != this.state.otp){
        //     this.setState({otpError:'Incorrect OTP *',errorColor: '#142031'})
        //     errorcount++;
        // }


        if (this.state.pincode === '') {
            this.setState({ pincodeError: 'Please Enter Pincode *', errorColor: '#e74c3c' })
            errorcount++;
        }
        else {
            this.setState({ pincodeError: '', errorColor: '#000' })
        }

        if (this.state.landmark === '') {
            this.setState({ landmarkError: 'Please Enter Landmark *', errorColor: '#e74c3c' })
            errorcount++;
        }
        else {
            this.setState({ landmarkError: '', errorColor: '#000' })
        }
        if (this.state.address === '') {
            this.setState({ addressError: 'Please Enter Address *', errorColor: '#e74c3c' })
            errorcount++;
        }
        if (errorcount == 0) {
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
                    username: mobile,
                    password: this.state.password,
                    district: this.state.district,
                    register: 1,
                    name: this.state.name,
                    otp: mobile_otp,
                    address: this.state.address,
                    landmark: this.state.landmark,
                    pincode: this.state.pincode,
                    latitude: this.state.lat,
                    longitude: this.state.lon

                })
            }).then((response) => response.json())
                .then((responseJson) => {
                    if (responseJson.result == "success") {
                        ToastAndroid.show(
                            'Success',
                            ToastAndroid.SHORT,
                        );
                        Actions.Login();
                    } else {
                        ToastAndroid.show(
                            responseJson.msg,
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
                {/* <ImageBackground source={require('../../../images/slider_background.png')} style={{flex:1,width:width,paddingHorizontal:10,justifyContent:'center'}} resizeMode="cover"  > */}

                <View style={{ paddingHorizontal: 10, backgroundColor: '#FFFFFF' }}>
                    <Image source={require('../../../images/pcb_logo.png')} style={{ ...styles.imagestyle }} resizeMode='contain' />

                    {/* <View style={{flexDirection:'row',alignItems:'center',paddingTop:15}}>
                        {
                            userlevel.map((obj, i) => (
                                <RadioButton labelHorizontal={true} key={i} >
                                    <RadioButtonInput
                                    obj={obj}
                                    index={i}
                                    isSelected={this.state.userlevel === i}
                                    onPress={(value) => {this.setState({userlevel:value,loading:true}),this.GetVendorData(value)}}
                                    borderWidth={1}
                                    buttonInnerColor={'#142031'}
                                    buttonOuterColor={'#142031'}
                                    buttonSize={10}
                                    buttonOuterSize={15}
                                    buttonStyle={{}}
                                    buttonWrapStyle={{marginLeft: 10}}
                                    />
                                    <RadioButtonLabel
                                    obj={obj}
                                    index={i}
                                    labelHorizontal={true}
                                    onPress={(value) => {this.setState({userlevel:value,loading:true}),this.GetVendorData(value)}}
                                    labelStyle={{...AppStyles.evenLRegular,color:'#142031'}}
                                    labelWrapStyle={{}}
                                    />
                                </RadioButton>
                                ))
                        }  
                        </View> */}

                    {
                        this.state.vendorStatus == 1 &&
                        <View>
                            <MaterialDropdown
                                label='Vendor'
                                value={this.state.vendor}
                                error={this.state.vendorError}
                                errorColor={this.state.errorColor}
                                itemTextStyle={[AppStyles.evenLRegular]}
                                labelTextStyle={[AppStyles.evenLRegular, { justifyContent: 'center' }]}
                                titleTextStyle={[AppStyles.evenSRegular, { color: '#000' }]}
                                style={[AppStyles.evenLRegular, { color: '#142031' }]}
                                data={this.state.vendor_data}
                                textColor='#1B2430'
                                tintColor='#142031'
                                baseColor='#142031'
                                itemCount={4}
                                overlayStyle={{ top: 85 }}
                                dropdownPosition={1}
                                ref={"vendor"}
                                errorColor={'#142031'}
                                onChangeText={(value) => { this.getVendorIndex(value) }}
                            />
                        </View>
                    }
                    <TextField label='Username'
                        value={this.state.name}
                        onChangeText={(name) => this.setState({ name })}
                        error={this.state.nameError}
                        errorColor={this.state.errorColor}
                        style={[AppStyles.evenLRegular, { color: '#000' }]}
                        titleTextStyle={[AppStyles.evenSRegular]}
                        keyboardType='default'
                        returnKeyType="next"
                        textColor='#e74c3c'
                        tintColor='#142031'
                        baseColor='#142031'
                        labelTextStyle={AppStyles.evenLRegular}
                        autoCorrect={false}
                        ref={"usernametext"}
                        blurOnSubmit={false}
                        autoCapitalize='none'
                        editable={this.state.editable ? true : false}
                        onSubmitEditing={() => { this.refs.mobile.focus(); }}
                    />
                    <TextField label='Mobile No.'
                        value={mobile}
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
                        errorColor={this.state.errorColor}
                        autoCorrect={false}
                        ref={"mobile"}
                        blurOnSubmit={false}
                        autoCapitalize='none'
                        onSubmitEditing={() => { this.refs.passwordtext.focus(); }}
                        editable={false}
                    // onBlur={()=>{this.resendOtp()}}
                    />

                    <TextField label='Password'
                        value={this.state.password}
                        onChangeText={(password) => this.setState({ password })}
                        error={this.state.passwordError}
                        style={[AppStyles.evenLRegular, { color: '#000' }]}
                        titleTextStyle={[AppStyles.evenSRegular]}
                        returnKeyType="go"
                        textColor='#142031'
                        tintColor='#142031'
                        baseColor='#142031'
                        labelTextStyle={[AppStyles.evenLRegular]}
                        errorColor={this.state.errorColor}
                        secureTextEntry={true}
                        autoCorrect={false}
                        ref={"passwordtext"}
                        onSubmitEditing={() => { }}
                    />
                    <TextField label='Confirm Password'
                        value={this.state.cpassword}
                        onChangeText={(cpassword) => this.setState({ cpassword })}
                        error={this.state.cpasswordError}
                        style={[AppStyles.evenLRegular, { color: '#000' }]}
                        titleTextStyle={[AppStyles.evenSRegular]}
                        returnKeyType="go"
                        textColor='#142031'
                        tintColor='#142031'
                        baseColor='#142031'
                        labelTextStyle={[AppStyles.evenLRegular]}
                        errorColor={this.state.errorColor}
                        secureTextEntry={true}
                        autoCorrect={false}
                        ref={"cpasswordtext"}
                        onSubmitEditing={() => { }}
                    />
                    {
                        this.state.vendorStatus != 1 &&
                        <View>
                            <View style={{ flexDirection: 'column', justifyContent: 'space-between' }}>
                                <Text style={{ ...AppStyles.evenLRegular, paddingVertical: 5, color: '#142031' }}>Address</Text>
                                <Textarea
                                    containerStyle={styles.textareaContainer}
                                    value={this.state.address}
                                    style={{ ...styles.textarea, ...AppStyles.evenLRegular }}
                                    onChangeText={(address) => this.setState({ address })}
                                    maxLength={150}
                                    ref={"address"}
                                    placeholderTextColor={'#D3D3D3'}
                                    underlineColorAndroid={'transparent'}
                                    autoCorrect={false}
                                    errorColor={this.state.errorColor}
                                />
                                <Text style={{ ...AppStyles.evenSRegular, paddingLeft: 5, color: '#142031' }}>{this.state.addressError}</Text>
                            </View>
                            <MaterialDropdown
                                label='Select District'
                                value={this.state.district}
                                baseColor='#ffffff'
                                itemTextStyle={[AppStyles.evenSRegular]}
                                labelTextStyle={[AppStyles.evenSRegular, { justifyContent: 'center' }]}
                                titleTextStyle={[AppStyles.evenSRegular, { color: '#000' }]}
                                style={[AppStyles.evenSRegular, { color: '#000' }]}
                                data={this.state.districts}
                                onChangeText={(district) => this.setState({ district })}
                                textColor='#142031'
                                tintColor='#142031'
                                baseColor='#142031'
                                itemCount={4}
                                overlayStyle={{ top: 80 }}
                                dropdownPosition={1}
                                error={this.state.districtError}
                                inputContainerStyle={{ borderBottomColor: '#000' }}
                                errorColor={this.state.errorColor}
                            />

                            <TextField label='Landmark'
                                value={this.state.landmark}
                                onChangeText={(landmark) => this.setState({ landmark })}
                                error={this.state.landmarkError}
                                style={[AppStyles.evenLRegular, { color: '#000' }]}
                                titleTextStyle={[AppStyles.evenSRegular]}
                                keyboardType='default'
                                returnKeyType="next"
                                textColor='#142031'
                                tintColor='#142031'
                                baseColor='#142031'
                                labelTextStyle={AppStyles.evenLRegular}
                                errorColor={'#142031'}
                                autoCorrect={false}
                                ref={"landmark"}
                                blurOnSubmit={false}
                                autoCapitalize='none'
                                onSubmitEditing={() => { this.refs.pincode.focus(); }}
                                errorColor={this.state.errorColor}
                            />
                            <TextField label='Pincode'
                                value={this.state.pincode}
                                onChangeText={(pincode) => this.setState({ pincode })}
                                error={this.state.pincodeError}
                                style={[AppStyles.evenLRegular, { color: '#000' }]}
                                titleTextStyle={[AppStyles.evenSRegular]}
                                keyboardType='numeric'
                                formatText={this.formatText}
                                returnKeyType="go"
                                textColor='#142031'
                                tintColor='#142031'
                                baseColor='#142031'
                                labelTextStyle={AppStyles.evenLRegular}
                                errorColor={'#142031'}
                                maxLength={6}
                                autoCorrect={false}
                                ref={"pincode"}
                                blurOnSubmit={false}
                                autoCapitalize='none'
                                errorColor={this.state.errorColor}
                            />
                        </View>
                    }

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
                        <TouchableOpacity style={{ height: 50, alignItems: 'center', justifyContent: 'center', backgroundColor: '#2680eb', flex: 0.8, borderRadius: 5, marginVertical: 5 }} onPress={() => this.Register()}>
                            <Text style={[AppStyles.evenLBold, { paddingHorizontal: 10, color: "#FFFFFF" }]}>
                                Register</Text>
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
        height: height / 4,
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