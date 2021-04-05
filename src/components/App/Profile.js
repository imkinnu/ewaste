import React from 'react';
import { Actions } from 'react-native-router-flux';
import {
    AsyncStorage, StyleSheet, Text, View, ScrollView, TouchableOpacity,
    ToastAndroid, ImageBackground, StatusBar, ActivityIndicator, FlatList, Image, Dimensions, PermissionsAndroid, Alert
} from 'react-native';
import { setParams } from '../common/common';
import { TextField } from 'react-native-material-textfield';
import Header from './Header';
import DetailsModal from "../common/DetailsModal";
import {
    widthPercentageToDP as wp, heightPercentageToDP as hp, listenOrientationChange as loc,
    removeOrientationListener as rol
} from 'react-native-responsive-screen';
import { Dropdown as MaterialDropdown } from 'react-native-material-dropdown';
import AppStyles from '../common/AppStyles';
import Textarea from 'react-native-textarea';

import LinearGradient from 'react-native-linear-gradient';

const { width, height } = Dimensions.get('window');

export default class HomeScreen extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            loading: false,
            userlevel: '',
            uid: '',
            name: '',
            data: [],
            token: '',
            username: '',
            vendorData: [],
            firstname: '',
            lastname: '',
            mobile: '',
            email: '',
            district: '',
            landmark: '',
            pincode: '',
            address: '',
            districts: [],
        }
    }
    async UNSAFE_componentWillMount() {
        rol();
        const userlevel = await AsyncStorage.getItem('userlevel')
        if (userlevel == 1) {
            this.viewProfile('seller');
        }
        else {
            // alert(1);
            this.viewProfile('buyyer');
        }
    }

    async componentDidMount() {
        loc(this);
        this.GetDistricts();
        const username = await AsyncStorage.getItem('username')
        const userlevel = await AsyncStorage.getItem('userlevel')
        const uid = await AsyncStorage.getItem('uid')
        this.setState({ username: username, loading: true, userlevel: userlevel, uid: uid });
        if (this.state.userlevel == 1) {
            this.viewProfile('seller');
        }
        else {
            this.viewProfile('buyyer');
        }

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

    //Get Vendor Profile Data
    viewProfile = (datatype) => {
        if (datatype == 'buyyer') {
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
                    viewProfile: 1,
                    uid: this.state.uid
                })
            }).then((response) => response.json())
                .then((responseJson) => {
                    if (responseJson.result == "success") {
                        this.setState({ loading: false, vendorData: responseJson })
                    }
                }).catch((error) => {
                    ToastAndroid.show(
                        'Failed',
                        ToastAndroid.SHORT,
                    );
                    console.error(error);
                });
        } else {
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
                    userProfile: 1,
                    uid: this.state.uid
                })
            }).then((response) => response.json())
                .then((responseJson) => {
                    if (responseJson.result == "success") {
                        // alert(JSON.stringify(responseJson));
                        this.setState({ loading: false, vendorData: responseJson })
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
    updateProfile = () => {
        const { firstname, lastname, mobile, email, district, landmark, pincode, address } = this.state;

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
                updateProfile: 1,
                uid: this.state.uid,
                firstname,
                lastname,
                mobile,
                email,
                district,
                landmark,
                pincode,
                address
            })
        }).then((response) => response.json())
            .then((responseJson) => {
                if (responseJson.result == "success") {
                    ToastAndroid.show('Profile Updated Succesfully', ToastAndroid.SHORT);
                    this.setState({ loading: false })
                }
                else {
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
    render() {
        // alert(JSON.stringify(this.state.vendorData))
        console.disableYellowBox = true;
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
            <View style={{ flex: 1 }}>
                <StatusBar hidden />
                <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps='handled' ref={(c) => { this.scroll = c }} >
                    <ImageBackground source={require('../../../images/dashboard.png')} style={{ height: height - 300, width: width, paddingHorizontal: 10, paddingTop: 20, position: 'absolute' }} resizeMode="cover" imageStyle={{ borderBottomLeftRadius: 60, borderBottomRightRadius: 60 }} >
                        <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center' }} onPress={() => Actions.pop()}>
                            <View style={{ width: 30, height: 30, borderRadius: 4, elevation: 5, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FFFFFF' }}>
                                <Image source={require('../../../images/leftarrow.png')} resizeMode='contain' style={{ width: 20, height: 20 }} />
                            </View>
                        </TouchableOpacity>
                    </ImageBackground>
                    <View style={{ justifyContent: 'flex-start', marginTop: 80, marginHorizontal: 15 }}>
                        <LinearGradient
                            locations={[0, 1]}
                            colors={["#F30000", "#FDAE1E"]}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            style={{ height: 30, justifyContent: 'center', width: 200, alignItems: 'center' }}
                        >
                            <Text style={{ ...AppStyles.evenXLRegular, fontSize: 20, color: '#FAFAFA' }}># User Profile</Text>
                        </LinearGradient>
                    </View>
                    {
                        this.state.userlevel == 2 &&

                        <View style={styles.page}>

                            <TextField label='Vendor Name'
                                value={this.state.vendorData.vendor_name}
                                error="Vendor Name"
                                style={[AppStyles.evenLRegular, { color: '#000000' }]}
                                titleTextStyle={[AppStyles.evenSRegular]}
                                returnKeyType="next"
                                textColor='#000000'
                                tintColor='#000000'
                                baseColor='#000000'
                                labelTextStyle={AppStyles.evenLRegular}
                                errorColor={'#000000'}
                                autoCorrect={false}
                                editable={true}
                                autoCapitalize='none'
                            />
                            <TextField label='Vendor Mobile'
                                value={this.state.vendorData.mobile}
                                error="Vendor Mobile Number"
                                style={[AppStyles.evenLRegular, { color: '#000000' }]}
                                titleTextStyle={[AppStyles.evenSRegular]}
                                keyboardType='numeric'
                                returnKeyType="next"
                                textColor='#000000'
                                tintColor='#000000'
                                baseColor='#000000'
                                labelTextStyle={AppStyles.evenLRegular}
                                errorColor={'#000000'}
                                autoCorrect={false}
                                editable={true}
                                autoCapitalize='none'
                            />
                            <TextField label='Vendor Auth. No.'
                                value={this.state.vendorData.vendor_authno}
                                error="Vendor Auth. No."
                                style={[AppStyles.evenLRegular, { color: '#000000' }]}
                                titleTextStyle={[AppStyles.evenSRegular]}
                                returnKeyType="next"
                                textColor='#000000'
                                tintColor='#000000'
                                baseColor='#000000'
                                labelTextStyle={AppStyles.evenLRegular}
                                errorColor={'#000000'}
                                autoCorrect={false}
                                editable={true}
                                autoCapitalize='none'
                            />
                            <View style={{ flexDirection: 'column', justifyContent: 'space-between' }}>
                                <Text style={{ ...AppStyles.evenMRegular, paddingVertical: 10 }}>Vendor Address</Text>
                                <Textarea
                                    containerStyle={styles.textareaContainer}
                                    value={this.state.vendorData.vendor_address}
                                    style={{ ...styles.textarea, ...AppStyles.evenLRegular }}
                                    // onChangeText={(description) => this.setState({ description })}
                                    editable={true}
                                    placeholderTextColor={'#D3D3D3'}
                                    underlineColorAndroid={'transparent'}
                                    autoCorrect={false}
                                />
                            </View>
                            <TextField label='Collection Center Name'
                                value={this.state.vendorData.collection_center_name}
                                error="Vendor Collection Center Name"
                                style={[AppStyles.evenLRegular, { color: '#000000' }]}
                                titleTextStyle={[AppStyles.evenSRegular]}
                                returnKeyType="next"
                                textColor='#000000'
                                tintColor='#000000'
                                baseColor='#000000'
                                labelTextStyle={AppStyles.evenLRegular}
                                errorColor={'#000000'}
                                autoCorrect={false}
                                editable={true}
                                autoCapitalize='none'
                            />
                            <View style={{ flexDirection: 'column', justifyContent: 'space-between' }}>
                                <Text style={{ ...AppStyles.evenMRegular, paddingVertical: 10 }}>Collection Center Address</Text>
                                <Textarea
                                    containerStyle={styles.textareaContainer}
                                    value={this.state.vendorData.collection_center_address}
                                    style={{ ...styles.textarea, ...AppStyles.evenLRegular }}
                                    // onChangeText={(description) => this.setState({ description })}
                                    editable={true}
                                    placeholderTextColor={'#D3D3D3'}
                                    underlineColorAndroid={'transparent'}
                                    autoCorrect={false}
                                />
                            </View>
                            <TextField label='Operational Status'
                                value={this.state.vendorData.operational_status}
                                error="Vendor Operational Status"
                                style={[AppStyles.evenLRegular, { color: '#000000' }]}
                                titleTextStyle={[AppStyles.evenSRegular]}
                                returnKeyType="next"
                                textColor='#000000'
                                tintColor='#000000'
                                baseColor='#000000'
                                labelTextStyle={AppStyles.evenLRegular}
                                errorColor={'#000000'}
                                autoCorrect={false}
                                editable={true}
                                autoCapitalize='none'
                            />
                        </View>
                    }
                    {
                        this.state.userlevel == 1 &&
                        <View style={styles.page}>
                            <TextField label='First Name'
                                value={this.state.vendorData.firstname}
                                style={[AppStyles.evenLRegular, { color: '#000000' }]}
                                titleTextStyle={[AppStyles.evenSRegular]}
                                returnKeyType="next"
                                textColor='#000000'
                                tintColor='#000000'
                                baseColor='#000000'
                                labelTextStyle={AppStyles.evenLRegular}
                                errorColor={'#000000'}
                                autoCorrect={false}
                                editable={true}
                                lineWidth={2}
                                autoCapitalize='none'
                                onChangeText={firstname => this.setState({ firstname })}
                            />
                            <TextField label='Last Name'
                                value={this.state.vendorData.lastname}
                                style={[AppStyles.evenLRegular, { color: '#000000' }]}
                                titleTextStyle={[AppStyles.evenSRegular]}
                                returnKeyType="next"
                                textColor='#000000'
                                tintColor='#000000'
                                baseColor='#000000'
                                labelTextStyle={AppStyles.evenLRegular}
                                errorColor={'#000000'}
                                autoCorrect={false}
                                editable={true}
                                lineWidth={2}
                                autoCapitalize='none'
                                onChangeText={lastname => this.setState({ lastname })}
                            />
                            <TextField label='Mobile'
                                value={this.state.vendorData.mobile}
                                style={[AppStyles.evenLRegular, { color: '#000000' }]}
                                titleTextStyle={[AppStyles.evenSRegular]}
                                returnKeyType="next"
                                textColor='#000000'
                                tintColor='#000000'
                                baseColor='#000000'
                                labelTextStyle={AppStyles.evenLRegular}
                                errorColor={'#000000'}
                                autoCorrect={false}
                                editable={true}
                                lineWidth={2}
                                autoCapitalize='none'
                                onChangeText={mobile => this.setState({ mobile })}
                            />
                            <TextField label='E-Mail'
                                value={this.state.vendorData.email}
                                style={[AppStyles.evenLRegular, { color: '#000000' }]}
                                titleTextStyle={[AppStyles.evenSRegular]}
                                returnKeyType="next"
                                textColor='#000000'
                                tintColor='#000000'
                                baseColor='#000000'
                                labelTextStyle={AppStyles.evenLRegular}
                                errorColor={'#000000'}
                                autoCorrect={false}
                                editable={true}
                                lineWidth={2}
                                autoCapitalize='none'
                                onChangeText={email => this.setState({ email })}
                            />
                            <MaterialDropdown
                                label='Select District'
                                value={this.state.vendorData.district}
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
                                value={this.state.vendorData.landmark}
                                style={[AppStyles.evenLRegular, { color: '#000000' }]}
                                titleTextStyle={[AppStyles.evenSRegular]}
                                returnKeyType="next"
                                textColor='#000000'
                                tintColor='#000000'
                                baseColor='#000000'
                                labelTextStyle={AppStyles.evenLRegular}
                                errorColor={'#000000'}
                                autoCorrect={false}
                                editable={true}
                                lineWidth={2}
                                autoCapitalize='none'
                                onChangeText={landmark => this.setState({ landmark })}
                            />
                            <TextField label='Pincode'
                                value={this.state.vendorData.pincode}
                                style={[AppStyles.evenLRegular, { color: '#000000' }]}
                                titleTextStyle={[AppStyles.evenSRegular]}
                                returnKeyType="next"
                                textColor='#000000'
                                tintColor='#000000'
                                baseColor='#000000'
                                labelTextStyle={AppStyles.evenLRegular}
                                errorColor={'#000000'}
                                autoCorrect={false}
                                editable={true}
                                lineWidth={2}
                                autoCapitalize='none'
                                onChangeText={pincode => this.setState({ pincode })}
                            />

                            <TextField label='Address'
                                value={this.state.vendorData.address}
                                style={[AppStyles.evenLRegular, { color: '#000000' }]}
                                titleTextStyle={[AppStyles.evenSRegular]}
                                returnKeyType="next"
                                textColor='#000000'
                                tintColor='#000000'
                                baseColor='#000000'
                                labelTextStyle={AppStyles.evenLRegular}
                                errorColor={'#000000'}
                                autoCorrect={false}
                                editable={true}
                                lineWidth={2}
                                autoCapitalize='none'
                                onChangeText={address => this.setState({ address })}
                            />
                            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 0 }}>
                                <TouchableOpacity style={{ height: 50, alignItems: 'center', justifyContent: 'center', backgroundColor: '#0072bb', width: 180, borderRadius: 20 }} onPress={() => this.updateProfile()}>
                                    <Text style={[AppStyles.evenLBold, { paddingHorizontal: 10, color: "#ffffff" }]}>
                                        Update Profile</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    }
                </ScrollView>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    page: {
        flex: 1,
        // backgroundColor:'#FFFFFF',
        justifyContent: 'flex-start',
        paddingHorizontal: 10,
        paddingVertical: 5,
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
        height: 150,
        letterSpacing: 0.3,
        paddingTop: 1,
    }, camera: {
        flex: 0.16, backgroundColor: '#F6F6F6', borderRadius: 5, borderWidth: 1, height: 50, borderColor: '#C4C4C4', justifyContent: 'center', alignItems: 'center'
    }, camera1: {
        flex: 0.16, height: 50
    }
});