import React from 'react';
import { Actions } from 'react-native-router-flux';
import {
    AsyncStorage, StyleSheet, Text, View, ScrollView, TouchableOpacity,
    ToastAndroid, ImageBackground, StatusBar, ActivityIndicator, KeyboardAvoidingView, Image, Dimensions, PermissionsAndroid, Alert
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
import RNFetchBlob from 'rn-fetch-blob';
import ImagePicker from 'react-native-image-picker';
import RadioForm, { RadioButton, RadioButtonInput, RadioButtonLabel } from 'react-native-simple-radio-button';
import CheckBox from 'react-native-check-box'
import BottomSheet from 'react-native-bottomsheet-reanimated';
import Geolocation from 'react-native-geolocation-service';
import Pending from './Pending'
import DatePicker from 'react-native-datepicker'
import getDirections from 'react-native-google-maps-directions';
import LinearGradient from 'react-native-linear-gradient';

const { width, height } = Dimensions.get('window');

var options = {
    title: 'Select Photo',
    customButtons: [{ name: 'Product', title: 'Remove Photo' }],
    maxWidth: 600,
    maxHeight: 600,
    quality: 0.5,
    mediaType: 'photo',
    allowsEditing: true,
    storageOptions: {
        cameraRoll: true,
        waitUntilSaved: true,
        skipBackup: true,
        path: 'images'
    }
};

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
            heading: '',
            category: '',
            subcategory: '',
            description: '',
            isChecked: false,
            cod: '',
            ecs: '',
            radio: '',
            catg: [],
            scatg: [],
            amount: 0,
            pending: 0,
            approved: 0,
            rejected: 0,
            user: '',
        }
    }
    UNSAFE_componentWillMount() {
        rol();
    }
    async componentWillReceiveProps(props) {
        this.updateCount();
        this.setState({ loading: true })
        this.setState({ loading: false })
        this.GetCategory();
        const userlevel = await AsyncStorage.getItem('userlevel');
        alert();
        this.setState({ userlevel: userlevel });
    }

    async componentDidMount() {
        loc(this);
        const username = await AsyncStorage.getItem('username');
        const userlevel = await AsyncStorage.getItem('userlevel');
        const user = await AsyncStorage.getItem('user');
        const uid = await AsyncStorage.getItem('uid')
        this.setState({ username: username, loading: true, userlevel: userlevel, uid: uid, user: user });
        this.GetCategory();
        this.updateCount();

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

    updateCount() {
        this.setState({ loading: true })
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
                postsCount: 1,
                username: this.state.username

            })
        }).then((response) => response.json())
            .then((responseJson) => {
                this.setState({ loading: false })
                if (responseJson.result == 'success') {
                    this.setState({ pending: responseJson.pending, approved: responseJson.approved, rejected: responseJson.rejected })
                }
            })
    }
    callLocation(that) {
        Geolocation.getCurrentPosition(
            (position) => {
                this.setState({
                    lat: position.coords.latitude,
                    lon: position.coords.longitude
                })
                global.LAT = position.coords.latitude;
                global.LON = position.coords.longitude;
                const apiUrl = 'https://maps.googleapis.com/maps/api/geocode/json?address=' + this.state.lat + ',' + this.state.lon + '&key=' + global.API_KEY;
                fetch(apiUrl).then((response) => response.json())
                    .then((responseJson) => {
                        for (let i = 0; i < responseJson.results[0].address_components.length; i++) {
                            const addressType = responseJson.results[0].address_components[i].types[0];
                            if (addressType === 'locality') {
                                var city = responseJson.results[0].address_components[i].long_name;
                                this.setState({ city: city })
                                global.CITY = city;
                            }
                            this.setState({ loading: false })
                        }
                    }).catch((error) => {
                        // Alert.alert("Please Check Your Internet Connection")
                        this.setState({ loading: false })
                    });
            },
            (error) => {
                alert(error.message);
            },
            { enableHighAccuracy: true, timeout: 5000, maximumAge: 10000 }
        );
        that.watchID = Geolocation.watchPosition((position) => {
            //   console.log('position changed',position);
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
    setiModalVisible(modalimage) {
        this.setState({ imodalVisible: true, modalimage: modalimage });
    }

    //Get Category Data
    GetCategory = () => {
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
                myposts: 1,
                uid: this.state.username
            })
        }).then((response) => response.json())
            .then((responseJson) => {
                if (responseJson.result == "success") {
                    this.setState({ loading: false, catg: responseJson.posts, amount: responseJson.amount })
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
        console.disableYellowBox = true;
        let approved = this.state.catg.filter(data => data.status == 0);
        let rejected = this.state.catg.filter(data => data.status == 2);

        if (this.state.loading) {
            return (
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#EEEEEE' }}>
                    <View style={{ height: 100, width: 100, backgroundColor: '#FFFFFF', borderRadius: 10, justifyContent: 'center', elevation: 2 }}>
                        <ActivityIndicator size="small" color='#6e78f7' />
                    </View>
                </View>
            );
        }
        return (
            // <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps='handled'>
            <View style={styles.page} >
                <StatusBar hidden />
                {
                    this.state.userlevel == '1' &&
                    <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps='handled'>
                        <View style={{ height: height / 4, width: width, justifyContent: 'center', borderBottomLeftRadius: 60, borderBottomRightRadius: 60, backgroundColor: '#6e78f7' }} >
                            <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 10, paddingTop: 30 }}>
                                <View style={{ flex: 0.65 }}>
                                    <Text style={[AppStyles.oddLMedium, { letterSpacing: 0.5, color: '#FFFFFF', }]}>Hello, {this.state.user.charAt(0).toUpperCase() + this.state.user.slice(1)} </Text>
                                </View>
                                <View style={{ flex: 0.35 }}>
                                    <MaterialDropdown
                                        label='City'
                                        value={this.state.city}
                                        baseColor='#ffffff'
                                        itemTextStyle={[AppStyles.oddLMedium]}
                                        labelTextStyle={[AppStyles.oddLMedium, { justifyContent: 'center' }]}
                                        titleTextStyle={[AppStyles.oddLMedium, { color: '#FFFFFF' }]}
                                        style={[AppStyles.oddMRegular, { color: '#FFFFFF' }]}
                                        // data={cities}
                                        textColor='#000000'
                                        tintColor='#FFFFFF'
                                        baseColor='#FFFFFF'
                                        itemCount={4}
                                        overlayStyle={{ top: 80 }}
                                        dropdownPosition={1}
                                        onChangeText={(value) => { this.setState({ city: value }) }}
                                        inputContainerStyle={{ borderBottomColor: 'transparent' }}
                                    />
                                </View>
                            </View>
                        </View>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', top: -40 }}>
                            <TouchableOpacity style={styles.roundImage} onPress={() => Actions.AddPost()}>
                                <Image source={require('../../../images/add_post.png')} style={{ width: 40, height: 40 }} resizeMode='center' />
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.roundImage} onPress={() => Actions.Pending()}>
                                <Image source={require('../../../images/my_post.png')} style={{ width: 40, height: 40 }} resizeMode='center' />
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.roundImage} onPress={() => Actions.NearVendors()}>
                                <Image source={require('../../../images/seller.png')} style={{ width: 40, height: 40 }} resizeMode='center' />
                            </TouchableOpacity>
                        </View>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', marginTop: -40 }}>

                            <Text style={[AppStyles.oddSRegular, { color: '#1B2430', textAlign: 'center', letterSpacing: 0.5 }]}>Add Post</Text>

                            <Text style={[AppStyles.oddSRegular, { color: '#1B2430', textAlign: 'center', letterSpacing: 0.5 }]}>My Posts</Text>

                            <Text style={[AppStyles.oddSRegular, { color: '#1B2430', textAlign: 'center', letterSpacing: 0.5 }]}>Near By</Text>
                        </View>
                        <LinearGradient
                            locations={[0, 1]}
                            // colors={["#d7e5fc", "#e9e1f5"]}
                            colors={["#e9e1f5", "#d7e5fc"]}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 0, y: 1 }}
                            style={{ height: 150, backgroundColor: '#FFFFFF', borderRadius: 20, marginHorizontal: 10, marginVertical: 20, padding: 10 }}
                        >
                            <View style={{ flexDirection: 'row', justifyContent: 'space-around' }}>
                                <View style={{ flex: 0.3 }}>
                                    <Text style={[AppStyles.oddLMedium, { textAlign: 'center', letterSpacing: 0.5, paddingTop: 5 }]}>Total Posts</Text>
                                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around', marginTop: 20 }}>
                                        <Text style={{ fontSize: 30 }}>{parseInt(this.state.pending) + parseInt(this.state.approved) + parseInt(this.state.rejected)}</Text>
                                    </View>
                                </View>
                                <View style={styles.verticleLine}></View>
                                <View style={{ flex: 0.3 }}>
                                    <Text style={[AppStyles.oddLMedium, { textAlign: 'center', letterSpacing: 0.5, paddingTop: 5 }]}>Approved</Text>
                                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around', marginTop: 20 }}>
                                        <Text style={{ fontSize: 30 }}>{this.state.approved}</Text>
                                    </View>
                                </View>
                                <View style={styles.verticleLine}></View>
                                <View style={{ flex: 0.3 }}>
                                    <Text style={[AppStyles.oddLMedium, { textAlign: 'center', letterSpacing: 0.5, paddingTop: 5 }]}>Rejected</Text>
                                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around', marginTop: 20 }}>
                                        <Text style={{ fontSize: 30 }}>{this.state.rejected}</Text>
                                    </View>
                                </View>
                            </View>
                        </LinearGradient>
                        <Text style={[AppStyles.oddXLMedium, { padding: 15 }]}>Categories</Text>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-around' }}>
                            <TouchableOpacity style={styles.category} onPress={() => Actions.Subcat({ data: { name: 'Computer Accessories', id: 1 } })}>
                                <Image source={require('../../../images/desktop.png')} style={{ width: 50, height: 50 }} resizeMode='center' />
                                <Text style={[AppStyles.oddSRegular, { color: '#1B2430', textAlign: 'center', letterSpacing: 0.5, paddingTop: 5 }]}>Computer Accessories</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.category} onPress={() => Actions.Subcat({ data: { name: 'Mobile Accessories', id: 2 } })}>
                                <Image source={require('../../../images/mobile-phone.png')} style={{ width: 50, height: 50 }} resizeMode='center' />
                                <Text style={[AppStyles.oddSRegular, { color: '#1B2430', textAlign: 'center', letterSpacing: 0.5, paddingTop: 5 }]}>Mobile Accessories</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.category} onPress={() => Actions.Subcat({ data: { name: 'ICT Products', id: 3 } })}>
                                <Image source={require('../../../images/blender-appliance.png')} style={{ width: 50, height: 50 }} resizeMode='center' />
                                <Text style={[AppStyles.oddSRegular, { color: '#1B2430', textAlign: 'center', letterSpacing: 0.5, paddingTop: 5 }]}>ICT Products</Text>
                            </TouchableOpacity>
                        </View>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-around', marginVertical: 10 }}>
                            <TouchableOpacity style={styles.category} onPress={() => Actions.Subcat({ data: { name: 'Home Appliances', id: 4 } })}>
                                <Image source={require('../../../images/workstations.png')} style={{ width: 50, height: 50 }} resizeMode='center' />
                                <Text style={[AppStyles.oddSRegular, { color: '#1B2430', textAlign: 'center', letterSpacing: 0.5, paddingTop: 5 }]}>Home Appliances</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.category} onPress={() => Actions.Subcat({ data: { name: 'Consumer Electronics', id: 5 } })}>
                                <Image source={require('../../../images/plug.png')} style={{ width: 50, height: 50 }} resizeMode='center' />
                                <Text style={[AppStyles.oddSRegular, { color: '#1B2430', textAlign: 'center', letterSpacing: 0.5, }]}>Consumer Electronics</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.category} onPress={() => Actions.Subcat({ data: { name: 'Electronic Devices', id: 6 } })}>
                                <Image source={require('../../../images/earbuds.png')} style={{ width: 50, height: 50 }} resizeMode='center' />
                                <Text style={[AppStyles.oddSRegular, { color: '#1B2430', textAlign: 'center', letterSpacing: 0.5, paddingTop: 5 }]}>Electronic Devices</Text>
                            </TouchableOpacity>
                        </View>
                    </ScrollView>
                }
                {
                    this.state.userlevel == 2 &&
                    <View style={{ flex: 1 }}>
                        <View style={{ height: height / 4, width: width, justifyContent: 'center', borderBottomLeftRadius: 60, borderBottomRightRadius: 60, backgroundColor: '#6e78f7' }} >
                            <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 10, paddingTop: 30 }}>
                                <View style={{ flex: 0.65 }}>
                                    <Text style={[AppStyles.oddLMedium, { letterSpacing: 0.5, color: '#FFFFFF', }]}>Hello, {this.state.user.charAt(0).toUpperCase() + this.state.user.slice(1)} </Text>
                                </View>
                                <View style={{ flex: 0.35 }}>
                                    <MaterialDropdown
                                        label='City'
                                        value={this.state.city}
                                        baseColor='#ffffff'
                                        itemTextStyle={[AppStyles.oddLMedium]}
                                        labelTextStyle={[AppStyles.oddLMedium, { justifyContent: 'center' }]}
                                        titleTextStyle={[AppStyles.oddLMedium, { color: '#FFFFFF' }]}
                                        style={[AppStyles.oddMRegular, { color: '#FFFFFF' }]}
                                        // data={cities}
                                        textColor='#000000'
                                        tintColor='#FFFFFF'
                                        baseColor='#FFFFFF'
                                        itemCount={4}
                                        overlayStyle={{ top: 80 }}
                                        dropdownPosition={1}
                                        onChangeText={(value) => { this.setState({ city: value }) }}
                                        inputContainerStyle={{ borderBottomColor: 'transparent' }}
                                    />
                                </View>
                            </View>
                        </View>
                        <Pending data={this.state.userlevel} />
                    </View>
                }
            </View>
            // </ScrollView>
        );
    }
}

const styles = StyleSheet.create({
    page: {
        flex: 1,
        flexDirection: 'column',
        backgroundColor: '#EEEEEE',
        // padding:10
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
    },
    roundImage: {
        backgroundColor: '#FFFFFF', height: 80, width: 80, borderRadius: 40, alignItems: 'center', justifyContent: 'center'
    },
    verticleLine: {
        height: 120,
        width: 1,
        backgroundColor: '#909090',
    }, category: {
        backgroundColor: '#FFFFFF', height: 100, width: width / 3.5, borderRadius: 10, alignItems: 'center', justifyContent: 'center'
    }
});