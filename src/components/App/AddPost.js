import React from 'react';
import { Actions } from 'react-native-router-flux';
import {
    AsyncStorage, StyleSheet, Text, View, ScrollView, TouchableOpacity,
    ToastAndroid, ImageBackground, StatusBar, ActivityIndicator, KeyboardAvoidingView, Image, Dimensions, PermissionsAndroid
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

const { width, height } = Dimensions.get('window');

var options = {
    title: 'Select Photo',
    customButtons: [{ name: 'Product', title: 'Remove Photo' }],
    takePhotoButtonTitle: "Capture Photo...",
    chooseFromLibraryButtonTitle: "Choose from Library...",
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

export default class AddPost extends React.Component {

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
            image: '',
            imageLoading: false,
            avatarSource: ['', '', '', '', '', ''],
            images: '',
            ImageStatus: false,
            modalVisible: false,
            imodalVisible: false,
            modaldata: [],
            modalimage: '',
            categoryError: '',
            subcategoryError: '',
            qError: '',
            wError: '',
            descriptionError: '',
            quantity: '',
            weight: '',
            imageEmpty: false,
            imageError: '',
            vendorData: [],
            isBottom: 0,
            landmark: '',
            landmarkError: '',
            address: '',
            addressError: '',
            lat: '0.00',
            lon: '0.00',
            adstatus: 0,
            condition: '',
            conditionError: 'Select working condition',
            date: '',
            offer_price: '',
            year: '',
            yearError: 'Select Year',
            month: 'Select Month',
            monthError: '',
            years: [],
            navigationModal: false,
            errorColor: '#000',
        }
    }
    UNSAFE_componentWillMount() {
        rol();

    }
    componentWillReceiveProps(props) {
        // console.log(props);
        this.setState({ loading: true })
        this.GetCategory();
    }

    async componentDidMount() {
        loc(this);
        const username = await AsyncStorage.getItem('username')
        const userlevel = await AsyncStorage.getItem('userlevel')
        const uid = await AsyncStorage.getItem('uid')
        this.setState({ username: username, loading: true, userlevel: userlevel, uid: uid });

        this.GetCategory();
        this.getYears();

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
        Geolocation.getCurrentPosition(
            (position) => {
                this.setState({
                    lat: position.coords.latitude,
                    lon: position.coords.longitude
                })
                global.LAT = position.coords.latitude;
                global.LON = position.coords.longitude;
            },
            (error) => {
                alert(error.message);
            },
            { enableHighAccuracy: true, timeout: 5000, maximumAge: 10000 }
        );
        that.watchID = Geolocation.watchPosition((position) => {
            console.log('position changed', position);
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
                category: 1,
                latitude: this.state.lat,
                longitude: this.state.lon,
                username: this.state.username
            })
        }).then((response) => response.json())
            .then((responseJson) => {
                if (responseJson.result == "success") {
                    if (responseJson.status == 0)
                        this.setState({ loading: false, catg: responseJson.itemCategory, address: responseJson.address, landmark: responseJson.landmark, adstatus: responseJson.status, lat: responseJson.latitude, lon: responseJson.longitude })
                    else
                        this.setState({ loading: false, catg: responseJson.itemCategory, address: '', landmark: '', adstatus: responseJson.status, lat: responseJson.latitude, lon: responseJson.longitude })

                }
            }).catch((error) => {
                ToastAndroid.show(
                    'Failed',
                    ToastAndroid.SHORT,
                );
                console.error(error);
            });
    }
    //Get Sub-Category Data
    GetSubcatg = () => {
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
                subcategory: 1,
                cid: this.state.category
            })
        }).then((response) => response.json())
            .then((responseJson) => {
                if (responseJson.result == "success") {
                    this.setState({ loading: false, scatg: responseJson.subItemCategory })
                }
            }).catch((error) => {
                ToastAndroid.show(
                    'Failed',
                    ToastAndroid.SHORT,
                );
                console.error(error);
            });
    }
    //Upload Image
    showImage = (val) => {
        const newArray = [...this.state.avatarSource]
        this.setState({
            ImageStatus: false
        });
        ImagePicker.showImagePicker(options, (response) => {
            if (response.didCancel) {
                // this.props.navigation.goBack();
            }
            else if (response.error) {
                console.log('ImagePicker Error: ', response.error);
            }
            else if (response.customButton) {
                this.setState({ imageLoading: true });
                let source = { uri: response.uri };
                this.setState({ image: '', imageLoading: false, avatarSource: newArray });
            }
            else {
                let source = { uri: response.uri };
                this.setState({ imageLoading: true, image: response.uri });
                this.setState({
                    avatarSource: newArray, ImageStatus: true
                });
                var params = {
                    uploadFile: true,
                    filename: response.fileName
                };
                const urlParams = setParams(params);
                const url = global.IMAGE_PATH + urlParams;
                RNFetchBlob.fetch('POST', url, {
                    Authorization: "Bearer access-token",
                    otherHeader: "foo",
                    'Content-Type': 'multipart/form-data',
                }, [
                    { name: 'image', filename: 'image.jpg', type: 'image/jpg', data: response.data },
                ]).uploadProgress((written, total) => {
                    this.setState({ imageprogress: written / total });
                })
                    .then((response) => response.json())
                    .then(res => {
                        if (res.result == 'success') {
                            ToastAndroid.show(
                                'Image Uploaded',
                                ToastAndroid.SHORT,
                            );

                            newArray[val] = res.filepath;
                            // console.log("Res Path",res.filepath)
                            this.setState({ avatarSource: newArray });
                            this.setState({ image: res.filename, imageLoading: false });
                        } else {
                            ToastAndroid.show(
                                'Image Upload Failed',
                                ToastAndroid.SHORT,
                            );
                            this.setState({ imageLoading: false });
                        }
                    })
            }
        });
    }
    GetQuote = () => {
        let errorcount = 0;
        if (this.state.category === '') {
            this.scroll.scrollTo({ x: 0, y: 0, animated: true });
            this.setState({ categoryError: 'Please Select Category *', errorColor: '#e74c3c' })
            errorcount++;
        }
        else {
            this.scroll.scrollTo({ x: 0, y: 0, animated: true });
            this.setState({ categoryError: '', errorColor: '#000' })
        }
        if (this.state.subcategory === '') {
            this.scroll.scrollTo({ x: 0, y: 0, animated: true });
            this.setState({ subcategoryError: 'Please Select Sub Category *', errorColor: '#e74c3c' })
            errorcount++;
        }
        else {
            this.scroll.scrollTo({ x: 0, y: 0, animated: true });
            this.setState({ subcategoryError: '', errorColor: '#000' })
        }
        if (this.state.quantity === '' && this.state.weight === '') {
            this.setState({ qError: 'Please Enter Qty *', wError: 'Please Enter Weight *', errorColor: '#e74c3c' })
            errorcount++;
        }
        else {
            this.scroll.scrollTo({ x: 0, y: 0, animated: true });
            this.setState({ qError: '', errorColor: '#000' })
        }
        if (this.state.condition === '') {
            this.setState({ conditionError: "Please select working condition", errorColor: '#e74c3c' })
            errorcount++
        }
        else {
            this.scroll.scrollTo({ x: 0, y: 0, animated: true });
            this.setState({ conditionError: '', errorColor: '#000' })
        }
        // if (this.state.year === '') {
        //     this.setState({ yearError: "Please select Year", errorColor: "#e74c3c" })
        //     errorcount++;
        // }
        // else {
        //     this.scroll.scrollTo({ x: 0, y: 0, animated: true });
        //     this.setState({ yearError: '', errorColor: '#000' })
        // }
        if (this.state.month === '') {
            this.setState({ monthError: "Please Select Month", errorColor: "#e74c3c" })
            errorcount++;
        }
        else {
            this.scroll.scrollTo({ x: 0, y: 0, animated: true });
            this.setState({ monthError: '', errorColor: '#000' })
        }
        let image_empty = 0;
        if (this.state.avatarSource.length > 0) {
            this.state.avatarSource.map((rowdata, index) => {
                if (rowdata[index] == "" || rowdata[index] == undefined) {
                    image_empty++;
                }
            });
        }
        if (image_empty == 6) {
            errorcount++;
            this.setState({ imageError: 'Please Upload Atleast One Image *', errorColor: '#e74c3c' })
        }
        else {
            this.setState({ imageError: '', errorColor: '#e74c3c' })
        }
        if (errorcount == 0) {
            this.setState({ isBottom: 1 })
        }
    }
    SubmitData = () => {
        let errorcount = 0;
        if (this.state.address === '') {
            this.setState({ addressError: 'Please Enter Address *', errorColor: '#e74c3c' })
            errorcount++;
        }
        else {
            this.setState({ addressError: '', errorColor: '#000' })
        }
        if (this.state.landmark === '') {
            this.setState({ landmarkError: 'Please Enter Landmark *', errorColor: '#e74c3c' })
            errorcount++;
        }
        else {
            this.setState({ landmarkError: '', errorColor: '#000' })
        }
        if (errorcount == 0) {
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
                    postitem: 1,
                    cat: this.state.category,
                    subcat: this.state.subcategory,
                    product_description: this.state.description,
                    quantity: this.state.quantity,
                    weight: this.state.weight,
                    images: this.state.avatarSource,
                    uid: this.state.username,
                    latitude: this.state.lat,
                    longitude: this.state.lon,
                    condition: this.state.condition,
                    date: this.state.year + " - " + this.state.month,
                    offer_price: this.state.offer_price,
                    address: this.state.address,
                    landmark: this.state.landmark
                })
            }).then((response) => response.json())
                .then((responseJson) => {
                    if (responseJson.result == "success") {
                        ToastAndroid.show(
                            responseJson.msg,
                            ToastAndroid.SHORT,
                        );
                        this.setState({ loading: false, category: '', subcategory: '', avatarSource: [], description: '', quantity: '', weight: '', isBottom: 0, navigationModal: true })
                        this.GetCategory();

                    } else {
                        ToastAndroid.show(
                            responseJson.msg,
                            ToastAndroid.SHORT,
                        );
                        this.setState({ loading: false })
                    }
                }).catch((error) => {
                    ToastAndroid.show(
                        'Error Calling ',
                        ToastAndroid.SHORT,
                    );
                    this.setState({ loading: false })
                    console.error(error);
                });
        }
    }
    //Get Date
    getMinDate() {
        let newDate = new Date()
        let date = newDate.getDate();
        let month = newDate.getMonth() + 1;
        let year = newDate.getFullYear();
        //  alert(`${date<10?`0${date}`:`${date}`}-${month<10?`0${month}`:`${month}`}-${year}`);

        return `${date < 10 ? `0${date}` : `${date}`}-${month < 10 ? `0${month}` : `${month}`}-${year}`
    }
    getYears() {
        var date = new Date,
            years = [],
            year = date.getFullYear();

        for (var i = year; i > year - 25; i--) {
            var joined = this.state.years.concat(i);
            // this.setState({ years: joined })
            const obj = { 'label': i, 'value': i };
            this.setState({
                years: [...this.state.years, obj]
            });

        }
    }

    render() {
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
        var radio_props = [
            { label: 'Cash on Delivery', value: 'cod' },
            { label: 'ECS Vouchers', value: 'ECS' },
            { label: 'Other Vouchers', value: 'other' }
        ];

        var condition = [
            { label: 'Working', value: 'Working' },
            { label: 'Not Working', value: 'Not Working' }
        ];

        var months = [
            { label: 'January', value: '1January' },
            { label: 'February', value: 'February' },
            { label: 'March', value: 'March' },
            { label: 'April', value: 'April' },
            { label: 'May', value: 'May' },
            { label: 'June', value: 'June' },
            { label: 'July', value: 'July' },
            { label: 'August', value: 'August' },
            { label: 'September', value: 'September' },
            { label: 'October', value: 'October' },
            { label: 'November', value: 'November' },
            { label: 'December', value: 'December' }
        ];


        return (
            <View style={{ flex: 1 }}>
                <StatusBar hidden />
                <ImageBackground source={require('../../../images/Background_3.png')} style={{ flex: 1, width, height }}>
                    <DetailsModal isVisible={this.state.imodalVisible} closeModal={() => this.setState({ imodalVisible: false })}>
                        <Image style={{ width: width - 40, height: height - 180, flex: 1, borderRadius: 10 }} source={{ uri: this.state.modalimage }} resizeMode='stretch' />
                        <View style={{ flexDirection: 'row', justifyContent: 'space-around', marginHorizontal: 20, marginVertical: hp('2%') }}>
                            <TouchableOpacity style={{ backgroundColor: '#6e78f7', height: 45, alignItems: 'center', justifyContent: 'center', borderRadius: 5, paddingHorizontal: 10, width: 180 }} onPress={() => this.setState({ imodalVisible: false })}>
                                <Text style={[AppStyles.evenLRegular, { paddingHorizontal: 10, color: "#ffffff", fontSize: hp('3%') }]}>
                                    Close</Text>
                            </TouchableOpacity>
                        </View>
                    </DetailsModal>
                    <DetailsModal isVisible={this.state.navigationModal} closeModal={() => this.setState({ navigationModal: false })}>
                        <View style={{ flexDirection: 'column', marginTop: 50, alignItems: 'center', justifyContent: 'center' }}>
                            <Image style={{ width: width - 40, height: 300, borderRadius: 10 }} source={require('../../../images/smile.png')} resizeMode='contain' />
                            <Text style={[AppStyles.oddLMedium, { color: '#000000', letterSpacing: 0.5, paddingTop: 20, textAlign: 'center' }]}>Post Submitted Successfully,It is under scrutiny.</Text>
                            <TouchableOpacity style={{ backgroundColor: '#2680eb', height: 45, alignItems: 'center', justifyContent: 'center', borderRadius: 5, paddingHorizontal: 10, width: 180, marginTop: 30 }} onPress={() => this.setState({ navigationModal: false }, () => Actions.Pending({ name: 'Home Appliances' }))}>
                                <Text style={[AppStyles.evenLRegular, { paddingHorizontal: 10, color: "#ffffff", fontSize: hp('3%') }]}>
                                    Ok</Text>
                            </TouchableOpacity>
                        </View>
                    </DetailsModal>
                    <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps='handled' ref={(c) => { this.scroll = c }} >
                        <View style={styles.page}>
                            <View style={{ height: 80, width: width, justifyContent: 'space-evenly', borderWidth: 1, borderColor: '#6e78f7', backgroundColor: '#6e78f7', paddingHorizontal: 10 }} >
                                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                                    <View style={{ flex: 0.6, paddingTop: 15, flexDirection: 'row' }}>
                                        <TouchableOpacity onPress={() => Actions.pop()}>
                                            <View style={{ width: 50, height: 50, borderRadius: 50, elevation: 5, justifyContent: 'center', alignItems: 'center', backgroundColor: '#6e78f7' }}>
                                                <Image source={require('../../../images/leftarrow.png')} resizeMode='contain' style={{ width: 20, height: 20, tintColor: '#FFFFFF' }} />
                                            </View>
                                        </TouchableOpacity>
                                        <View style={{ justifyContent: 'center', alignItems: 'center' }}>
                                            <Text style={[AppStyles.oddLMedium, { color: '#FFFFFF', letterSpacing: 0.5, paddingLeft: 10, paddingTop: 5 }]}>Add Post</Text>
                                        </View>
                                    </View>
                                    <View style={{ flex: 0.4 }}>
                                        <MaterialDropdown
                                            label='City'
                                            value={global.CITY}
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
                                            inputContainerStyle={{ borderBottomColor: 'transparent' }}
                                        />
                                    </View>
                                </View>
                            </View>
                            <View style={{ padding: 10 }}>
                                <MaterialDropdown
                                    label='Select Category'
                                    value={this.state.category}
                                    error={this.state.categoryError}
                                    itemTextStyle={[AppStyles.evenLRegular]}
                                    labelTextStyle={[AppStyles.evenLRegular, { justifyContent: 'center' }]}
                                    titleTextStyle={[AppStyles.evenSRegular, { color: '#000000' }]}
                                    style={[AppStyles.evenLRegular, { color: '#000000' }]}
                                    data={this.state.catg}
                                    textColor='#000000'
                                    tintColor='#000000'
                                    baseColor='#000000'
                                    itemCount={4}
                                    overlayStyle={{ top: 85 }}
                                    dropdownPosition={1}
                                    ref={"category"}
                                    lineWidth={1.5}
                                    errorColor={this.state.errorColor}
                                    onChangeText={(value) => { this.setState({ category: value, loading: true }), this.GetSubcatg() }}
                                />
                                <MaterialDropdown
                                    label='Select Sub Category'
                                    value={this.state.subcategory}
                                    error={this.state.subcategoryError}
                                    itemTextStyle={[AppStyles.evenLRegular]}
                                    labelTextStyle={[AppStyles.evenLRegular, { justifyContent: 'center' }]}
                                    titleTextStyle={[AppStyles.evenSRegular, { color: '#000000' }]}
                                    style={[AppStyles.evenLRegular, { color: '#000000' }]}
                                    data={this.state.scatg}
                                    textColor='#000000'
                                    tintColor='#000000'
                                    baseColor='#000000'
                                    itemCount={4}
                                    overlayStyle={{ top: 85 }}
                                    dropdownPosition={1}
                                    errorColor={'#000000'}
                                    lineWidth={1.5}
                                    ref={"subcategory"}
                                    onChangeText={(value, index, data) => { this.setState({ subcategory: value }) }}
                                    errorColor={this.state.errorColor}
                                />
                                <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingTop: 15 }}>
                                    <Text style={{ ...AppStyles.evenLBold }}>Add Photos</Text>

                                    {/* <Image source={require('../../../images/add.png')} style={{width:30,height:30,overflow: 'hidden'}} resizeMode='contain' /> */}
                                </View>
                                <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingTop: 15 }}>
                                    {
                                        this.state.avatarSource[0] == '' ?
                                            <TouchableOpacity style={{ ...styles.camera }} onPress={() => this.showImage(0)}>
                                                <Image source={require('../../../images/capture.png')} style={{ width: 30, height: 30, overflow: 'hidden', }} resizeMode='contain' />
                                            </TouchableOpacity>

                                            :
                                            <TouchableOpacity style={{ ...styles.camera1 }} onPress={() => this.setiModalVisible(this.state.avatarSource[0])}>
                                                <Image source={{ uri: this.state.avatarSource[0] }} style={{ flex: 1, width: 30, height: 30, borderRadius: 5, borderColor: '#C4C4C4', borderWidth: 1 }} resizeMode='cover' />
                                            </TouchableOpacity>
                                    }

                                    {
                                        this.state.avatarSource[1] == '' ?
                                            <TouchableOpacity style={{ ...styles.camera }} onPress={() => this.showImage(1)}>
                                                <Image source={require('../../../images/capture.png')} style={{ width: 30, height: 30, overflow: 'hidden' }} resizeMode='contain' />
                                            </TouchableOpacity>

                                            :
                                            <TouchableOpacity style={{ ...styles.camera1 }} onPress={() => this.setiModalVisible(this.state.avatarSource[1])}>
                                                <Image source={{ uri: this.state.avatarSource[1] }} style={{ flex: 1, width: 30, height: 30, borderRadius: 5, borderColor: '#C4C4C4', borderWidth: 1 }} resizeMode='cover' />
                                            </TouchableOpacity>
                                    }
                                    {
                                        this.state.avatarSource[2] == '' ?
                                            <TouchableOpacity style={{ ...styles.camera }} onPress={() => this.showImage(2)}>
                                                <Image source={require('../../../images/capture.png')} style={{ width: 30, height: 30, overflow: 'hidden' }} resizeMode='contain' />
                                            </TouchableOpacity>

                                            :
                                            <TouchableOpacity style={{ ...styles.camera1 }} onPress={() => this.setiModalVisible(this.state.avatarSource[2])}>
                                                <Image source={{ uri: this.state.avatarSource[2] }} style={{ flex: 1, width: 30, height: 30, borderRadius: 5, borderColor: '#C4C4C4', borderWidth: 1 }} resizeMode='cover' />
                                            </TouchableOpacity>
                                    }

                                    {
                                        this.state.avatarSource[3] == '' ?
                                            <TouchableOpacity style={{ ...styles.camera }} onPress={() => this.showImage(3)}>
                                                <Image source={require('../../../images/capture.png')} style={{ width: 30, height: 30, overflow: 'hidden' }} resizeMode='contain' />
                                            </TouchableOpacity>

                                            :
                                            <TouchableOpacity style={{ ...styles.camera1 }} onPress={() => this.setiModalVisible(this.state.avatarSource[3])}>
                                                <Image source={{ uri: this.state.avatarSource[0] }} style={{ flex: 1, width: 30, height: 30, borderRadius: 5, borderColor: '#C4C4C4', borderWidth: 1 }} resizeMode='cover' />
                                            </TouchableOpacity>
                                    }
                                    {
                                        this.state.avatarSource[4] == '' ?
                                            <TouchableOpacity style={{ ...styles.camera }} onPress={() => this.showImage(4)}>
                                                <Image source={require('../../../images/capture.png')} style={{ width: 30, height: 30, overflow: 'hidden' }} resizeMode='contain' />
                                            </TouchableOpacity>

                                            :
                                            <TouchableOpacity style={{ ...styles.camera1 }} onPress={() => this.setiModalVisible(this.state.avatarSource[4])}>
                                                <Image source={{ uri: this.state.avatarSource[4] }} style={{ flex: 1, width: 30, height: 30, borderRadius: 5, borderColor: '#C4C4C4', borderWidth: 1 }} resizeMode='cover' />
                                            </TouchableOpacity>
                                    }
                                    {
                                        this.state.avatarSource[5] == '' ?
                                            <TouchableOpacity style={{ ...styles.camera }} onPress={() => this.showImage(5)}>
                                                <Image source={require('../../../images/capture.png')} style={{ width: 30, height: 30, overflow: 'hidden' }} resizeMode='contain' />
                                            </TouchableOpacity>
                                            :
                                            <TouchableOpacity style={{ ...styles.camera1 }} onPress={() => this.setiModalVisible(this.state.avatarSource[5])}>
                                                <Image source={{ uri: this.state.avatarSource[5] }} style={{ flex: 1, width: 30, height: 30, borderRadius: 5, borderColor: '#C4C4C4', borderWidth: 1 }} resizeMode='cover' />
                                            </TouchableOpacity>
                                    }
                                </View>
                                {this.state.imageError != '' &&
                                    <Text style={{ ...AppStyles.evenSRegular, paddingLeft: 5 }}>{this.state.imageError}</Text>
                                }
                                <View style={{ flexDirection: 'column', justifyContent: 'space-between' }}>
                                    <Text style={{ ...AppStyles.evenLBold, paddingVertical: 10 }}>Product Description</Text>
                                    <Textarea
                                        containerStyle={styles.textareaContainer}
                                        value={this.state.description}
                                        style={{ ...styles.textarea, ...AppStyles.evenLRegular }}
                                        onChangeText={(description) => this.setState({ description })}
                                        defaultValue={this.state.description}
                                        maxLength={150}
                                        ref={"description"}
                                        placeholderTextColor={'#D3D3D3'}
                                        underlineColorAndroid={'transparent'}
                                        autoCorrect={false}
                                    />
                                </View>
                                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <View style={{ width: width / 3 }}>
                                        <TextField label='Quantity'
                                            value={this.state.quantity}
                                            onChangeText={(quantity) => this.setState({ quantity })}
                                            error={this.state.qError}
                                            style={[AppStyles.evenLRegular, { color: '#000000' }]}
                                            titleTextStyle={[AppStyles.evenSRegular]}
                                            keyboardType='number-pad'
                                            returnKeyType="next"
                                            textColor='#000000'
                                            tintColor='#000000'
                                            baseColor='#000000'
                                            labelTextStyle={AppStyles.evenLRegular}
                                            errorColor={'#000000'}
                                            autoCorrect={false}
                                            ref={"quantity"}
                                            blurOnSubmit={false}
                                            lineWidth={1.5}
                                            autoCapitalize='none'
                                            onSubmitEditing={() => { this.refs.weight.focus(); }}
                                            errorColor={this.state.errorColor}
                                        />
                                    </View>
                                    <Text style={{ ...AppStyles.evenLBold, textAlign: 'center', paddingTop: 20 }}>OR</Text>
                                    <View style={{ width: width / 2.5 }}>
                                        <TextField label='Weight (Kgs) (approx)'
                                            value={this.state.weight}
                                            onChangeText={(weight) => this.setState({ weight })}
                                            error={this.state.wError}
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
                                            lineWidth={1.5}
                                            ref={"weight"}
                                            autoCapitalize='none'
                                            errorColor={this.state.errorColor}
                                        />
                                    </View>
                                </View>
                                {/* <View style={{paddingBottom:10}}>
                                <DatePicker
                                    style={{width:width-20}}
                                    date={this.state.date}
                                    mode="date"
                                    androidMode="calendar"
                                    placeholder="Manufactured Date"
                                    placeholderTextStyle={[AppStyles.evenLRegular]}
                                    format="DD-MM-YYYY"
                                    // minDate={this.getMinDate()}
                                    maxDate={this.getMinDate()}
                                    textColor='#000000'
                                    tintColor='#000000'
                                    baseColor='#000000'
                                    confirmBtnText="Confirm"
                                    cancelBtnText="Cancel"
                                    showIcon={false}
                                    errorColor={'#000000'}
                                    customStyles={{
                                    dateInput: {
                                        marginLeft: 0,
                                        marginTop:30,
                                        borderWidth: 0,
                                        borderBottomWidth: 1.5,
                                        alignItems: "flex-start",
                                        borderBottomColor:'#1B1B1B'
                                    },placeholderText: 
                                        AppStyles.DatePicker
                                    ,
                                        dateText: 
                                        AppStyles.DatePicker
                                    }}
                                    onDateChange={(date) => {this.setState({date: date})}}
                                />
                            </View> */}
                                <MaterialDropdown
                                    label='Condition'
                                    value={this.state.condition}
                                    error={this.state.conditionError}
                                    itemTextStyle={[AppStyles.evenLRegular]}
                                    labelTextStyle={[AppStyles.evenLRegular, { justifyContent: 'center' }]}
                                    titleTextStyle={[AppStyles.evenSRegular, { color: '#000000' }]}
                                    style={[AppStyles.evenLRegular, { color: '#000000' }]}
                                    data={condition}
                                    textColor='#000000'
                                    tintColor='#000000'
                                    baseColor='#000000'
                                    itemCount={4}
                                    overlayStyle={{ top: 80 }}
                                    dropdownPosition={1}
                                    ref={"condition"}
                                    lineWidth={1.5}
                                    onChangeText={(value) => { this.setState({ condition: value }) }}
                                    errorColor={this.state.errorColor}
                                />
                                <Text style={{ ...AppStyles.evenLBold, textAlign: 'left', paddingTop: 20 }}>Manufactured Date(optional)</Text>
                                <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'space-between' }}>
                                    <View style={{ flex: 0.45 }}>
                                        <MaterialDropdown
                                            label='Year'
                                            value={this.state.year}
                                            error={this.state.yearError}
                                            itemTextStyle={[AppStyles.evenLRegular]}
                                            labelTextStyle={[AppStyles.evenLRegular, { justifyContent: 'center' }]}
                                            titleTextStyle={[AppStyles.evenSRegular, { color: '#000000' }]}
                                            style={[AppStyles.evenLRegular, { color: '#000000' }]}
                                            data={this.state.years}
                                            textColor='#000000'
                                            tintColor='#000000'
                                            baseColor='#000000'
                                            itemCount={4}
                                            overlayStyle={{ top: 80 }}
                                            dropdownPosition={1}
                                            ref={"condition"}
                                            errorColor={'#000000'}
                                            lineWidth={1.5}
                                            onChangeText={(value) => { this.setState({ year: value }) }}
                                        />
                                    </View>
                                    <View style={{ flex: 0.45 }}>
                                        <MaterialDropdown
                                            label='Month'
                                            value={this.state.month}
                                            error={this.state.monthError}
                                            itemTextStyle={[AppStyles.evenLRegular]}
                                            labelTextStyle={[AppStyles.evenLRegular, { justifyContent: 'center' }]}
                                            titleTextStyle={[AppStyles.evenSRegular, { color: '#000000' }]}
                                            style={[AppStyles.evenLRegular, { color: '#000000' }]}
                                            data={months}
                                            textColor='#000000'
                                            tintColor='#000000'
                                            baseColor='#000000'
                                            itemCount={4}
                                            overlayStyle={{ top: 80 }}
                                            dropdownPosition={1}
                                            ref={"condition"}
                                            errorColor={'#000000'}
                                            lineWidth={1.5}
                                            onChangeText={(value) => { this.setState({ month: value }) }}
                                            errorColor={this.state.errorColor}
                                        />
                                    </View>
                                </View>
                                <TextField label='Offer Price'
                                    value={this.state.offer_price}
                                    onChangeText={(offer_price) => this.setState({ offer_price })}
                                    error={this.state.offer_priceError}
                                    style={[AppStyles.evenLRegular, { color: '#000000' }]}
                                    titleTextStyle={[AppStyles.evenSRegular]}
                                    keyboardType='numeric'
                                    returnKeyType="go"
                                    textColor='#000000'
                                    tintColor='#000000'
                                    baseColor='#000000'
                                    labelTextStyle={AppStyles.evenLRegular}
                                    errorColor={'#000000'}
                                    autoCorrect={false}
                                    lineWidth={1.5}
                                    ref={"offer_price"}
                                    autoCapitalize='none'
                                    errorColor={this.state.errorColor}
                                />
                                {/* <CheckBox
                                    style={{ flex: 1, paddingVertical: 10 }}
                                    onClick={() => {
                                        this.setState({
                                            isChecked: !this.state.isChecked
                                        })
                                    }}
                                    isChecked={this.state.isChecked}
                                    rightText={"Save this item for reuse"}
                                    rightTextStyle={{ ...AppStyles.evenLBold }}
                                /> */}


                                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 0 }}>
                                    <TouchableOpacity style={{ height: 50, alignItems: 'center', justifyContent: 'center', backgroundColor: '#6e78f7', width: 180, borderRadius: 5 }} onPress={() => this.GetQuote()} >
                                        <Text style={[AppStyles.evenLBold, { paddingHorizontal: 10, color: "#ffffff" }]}>
                                            Submit Post</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </View>
                    </ScrollView>

                    {
                        this.state.isBottom == 1 &&

                        <BottomSheet
                            bottomSheerColor="#FFFFFF"
                            ref="BottomSheet"
                            initialPosition={'85%'} //200, 300
                            snapPoints={['50%', '100%']}
                            isBackDrop={true}
                            isBackDropDismissByPress={false}
                            isRoundBorderWithTipHeader={true}
                            // backDropColor="red"
                            // isModal
                            // containerStyle={{backgroundColor:"red"}}
                            // tipStyle={{backgroundColor:"red"}}
                            // headerStyle={{backgroundColor:"red"}}
                            bodyStyle={{ flex: 1 }}
                            header={
                                <View>
                                    <View style={{ flexDirection: 'row', justifyContent: 'flex-end' }}>
                                        <TouchableOpacity onPress={() => this.setState({ isBottom: 0 })}>
                                            <Image source={require('../../../images/cross.png')} style={{ width: 25, height: 25, paddingLeft: 50 }} resizeMode='contain' />
                                        </TouchableOpacity>
                                    </View>
                                    <View style={{ flexDirection: 'row', justifyContent: 'center' }}>
                                        <Text style={{ ...AppStyles.evenXLRegular }}>Address</Text>
                                    </View>
                                </View>

                            }
                            body={
                                <View style={{ marginHorizontal: 10 }} >
                                    <View style={{ flexDirection: 'column', justifyContent: 'space-between' }}>
                                        <Text style={{ ...AppStyles.evenLRegular, paddingVertical: 5, color: '#000000' }}>Address</Text>
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
                                        />
                                        {this.state.addressError != '' &&
                                            <Text style={{ ...AppStyles.evenSRegular, paddingLeft: 5, color: 'red' }}>{this.state.addressError}</Text>
                                        }
                                    </View>
                                    <TextField label='Landmark'
                                        value={this.state.landmark}
                                        onChangeText={(landmark) => this.setState({ landmark })}
                                        error={this.state.landmarkError}
                                        style={[AppStyles.evenLRegular, { color: '#000000' }]}
                                        titleTextStyle={[AppStyles.evenSRegular]}
                                        keyboardType='default'
                                        returnKeyType="go"
                                        textColor='#000000'
                                        tintColor='#000000'
                                        baseColor='#000000'
                                        labelTextStyle={AppStyles.evenLRegular}
                                        errorColor={this.state.errorColor}
                                        autoCorrect={false}
                                        ref={"landmark"}
                                        autoCapitalize='none'
                                    />
                                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 10 }}>
                                        <TouchableOpacity style={{ height: 50, alignItems: 'center', justifyContent: 'center', backgroundColor: '#338995', width: 180, borderRadius: 20 }} onPress={() => this.SubmitData()} >
                                            <Text style={[AppStyles.evenLBold, { paddingHorizontal: 10, color: "#ffffff" }]}>
                                                Submit</Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            }
                        />
                    }
                    {/* </ScrollView> */}
                </ImageBackground>
            </View >
        );
    }
}

const styles = StyleSheet.create({
    page: {
        flex: 1,
        flexDirection: 'column',
        backgroundColor: '#FFFFFF',
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