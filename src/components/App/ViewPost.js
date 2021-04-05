import React from 'react';
import { Actions } from 'react-native-router-flux';
import {
    AsyncStorage, StyleSheet, Text, View, ScrollView, TouchableOpacity, Alert,
    ToastAndroid, ImageBackground, StatusBar, ActivityIndicator, FlatList, Image, Dimensions, PermissionsAndroid, Linking
} from 'react-native';
import { setParams } from '../common/common';
import { TextField } from 'react-native-material-textfield';
import Header from './Header';
import DetailsModal from "../common/DetailsModal";
import {
    widthPercentageToDP as wp, heightPercentageToDP as hp, listenOrientationChange as loc,
    removeOrientationListener as rol
} from 'react-native-responsive-screen';
import AppStyles from '../common/AppStyles';
import Textarea from 'react-native-textarea';

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

export default class ViewPost extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            loading: false,
            name: '',
            data: [],
            avatarSource: [],
            modalVisible: false,
            imodalVisible: false,
            modaldata: [],
            modalimage: '',
            userlevel: '',
            uid: '',
            price: '',
            priceError: 'Enter the Price',
            remarks: '',
            remarksError: '',
            buyers: [],
            verified: 0,
            pageindex: 0,
            errorColor: '#000',
        }

    }
    UNSAFE_componentWillMount() {
        rol();
    }

    setiModalVisible(modalimage) {
        this.setState({ imodalVisible: true, modalimage: modalimage });
    }
    async componentDidMount() {
        loc(this);
        const username = await AsyncStorage.getItem('username')
        const userlevel = await AsyncStorage.getItem('userlevel')
        const uid = await AsyncStorage.getItem('uid')
        this.setState({ username: username, loading: true, userlevel: userlevel, uid: uid });
        this.GetData();
        this.GetBuyers();
    }
    //Buyers Data
    GetBuyers = () => {
        const item = this.props.data;
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
                recieversInterestedPostView: 1,
                uid: item.mobile,
                post_id: item.post_id,
            })
        }).then((response) => response.json())
            .then((responseJson) => {
                // console.log("Buyers",responseJson)
                if (responseJson.result == "success") {
                    this.setState({ loading: false, buyers: responseJson.buyyers });
                } else {
                    this.setState({ loading: false });
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

    GetData = () => {
        let data = this.props.data;
        this.setState({ avatarSource: data.path })
    }

    Cancel = (item) => {
        Alert.alert("Alert", "Are you Sure Want to Cancel this post?", [
            {
                text: "Cancel",
                onPress: () => { },
                style: "cancel"
            },
            {
                text: "OK",
                onPress: () => {
                    this.CancelPost();
                }
            }
        ]);
    }
    CancelPost = () => {
        const item = this.props.data;
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
                cancelpost: 1,
                postid: item.post_id,
                post_status: item.post_status
            })
        }).then((response) => response.json())
            .then((responseJson) => {
                if (responseJson.result == "success") {
                    this.setState({ loading: false });
                    ToastAndroid.show(
                        responseJson.msg,
                        ToastAndroid.SHORT,
                    );
                    Actions.Pending({ data: 1 });
                } else {
                    ToastAndroid.show(
                        responseJson.msg,
                        ToastAndroid.SHORT,
                    );
                    this.setState({ loading: false });
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
    BuyyerInterested = () => {
        const item = this.props.data;
        let errorcount = 0;
        if (this.state.remarks == '') {
            this.setState(prevState => { return { ...prevState, remarksError: 'Please Enter Remarks *', errorColor: '#1B2430' } })
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
                    type: 'buyyer',
                    buyyerInterested: 1,
                    price: this.state.price,
                    remarks: this.state.remarks,
                    uid: this.state.username,
                    post_id: item.post_id,
                    seller_id: item.uid
                })
            }).then((response) => response.json())
                .then((responseJson) => {
                    if (responseJson.result == "success") {
                        this.setState({ loading: false }, () => Actions.BuyyerInterested({ name: 'Home Appliances' }));
                        ToastAndroid.show(
                            responseJson.msg,
                            ToastAndroid.SHORT,
                        )
                    } else {
                        ToastAndroid.show(
                            responseJson.msg,
                            ToastAndroid.SHORT,
                        );
                        this.setState({ loading: false });
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
    approve = (item) => {
        Alert.alert("Alert", "Are you Sure Want to Approve this Buyyer ?", [
            {
                text: "Cancel",
                onPress: () => { },
                style: "cancel"
            },
            {
                text: "OK",
                onPress: () => {
                    this.approveBuyyer(item)
                }
            }
        ]);
    }
    approveBuyyer = (item) => {
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
                closepost: 1,
                postid: item.post_id,
                buyyer_id: item.buyyer_id,
                post_status: item.post_status
            })
        }).then((response) => response.json())
            .then((responseJson) => {
                if (responseJson.result == "success") {
                    this.setState({ loading: false });
                    ToastAndroid.show(
                        responseJson.msg,
                        ToastAndroid.SHORT,
                    );
                    Actions.Pending({ data: 1 });
                } else {
                    ToastAndroid.show(
                        responseJson.msg,
                        ToastAndroid.SHORT,
                    );
                    this.setState({ loading: false });
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

    handleOnScroll(event) {
        //calculate screenIndex by contentOffset and screen width
        let pageindex = parseInt(event.nativeEvent.contentOffset.x / Dimensions.get('window').width);
        this.setState({ pageindex: pageindex })
    }

    linkCall(caller) {

        let phoneNumber = '';
        let celNumber = '+91' + caller;
        if (Platform.OS === 'android') {
            phoneNumber = 'tel:${' + celNumber + '}';
        }
        else {
            phoneNumber = 'telprompt:${' + celNumber + '}';
        }
        Linking.openURL(phoneNumber);
    }
    sideStatus = (post_status, bgcolor) => {
        return (
            <View style={{ flexDirection: 'column', flex: 0.35, backgroundColor: bgcolor, height: 50, borderTopRightRadius: 10, borderBottomLeftRadius: 10, justifyContent: 'center' }}>
                <Text style={[AppStyles.oddSBold, { textAlign: 'center', color: '#FFFFFF' }]}>Status </Text>
                <Text style={[AppStyles.oddSRegular, { textAlign: 'center', color: '#FFFFFF' }]}>{post_status}</Text>
            </View>
        )
    }
    render() {
        console.disableYellowBox = true;
        const item = this.props.data;
        // alert(JSON.stringify(item));
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
                <ImageBackground source={require('../../../images/Background_3.png')} style={{ flex: 1, width, height }}>
                    <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps='handled' ref={(c) => { this.scroll = c }}>
                        <View style={{ height: 80, width: width, justifyContent: 'space-evenly', borderWidth: 1, borderColor: '#6e78f7', backgroundColor: '#6e78f7', paddingHorizontal: 10 }} >
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                                <View style={{ flex: 0.6, paddingTop: 15, flexDirection: 'row' }}>
                                    <TouchableOpacity onPress={() => Actions.pop()}>
                                        <View style={{ width: 50, height: 50, borderRadius: 50, elevation: 5, justifyContent: 'center', alignItems: 'center', backgroundColor: '#6e78f7' }}>
                                            <Image source={require('../../../images/leftarrow.png')} resizeMode='contain' style={{ width: 20, height: 20, tintColor: '#FFFFFF' }} />
                                        </View>
                                    </TouchableOpacity>
                                    <View style={{ justifyContent: 'center', alignItems: 'center' }}>
                                        <Text style={[AppStyles.oddLMedium, { color: '#FFFFFF', letterSpacing: 0.5, paddingLeft: 10, paddingTop: 5 }]}>View Post</Text>
                                    </View>
                                </View>
                            </View>
                        </View>
                        <View style={{ borderRadius: 10, backgroundColor: '#F9F9F9', elevation: 2, borderColor: '#F9F9F9', borderWidth: 1, paddingHorizontal: 10, margin: 10, }}>
                            <View style={{ flex: 1, flexDirection: 'row', paddingBottom: 10 }}>
                                <View style={{ flexDirection: 'column', flex: 0.65 }}>
                                    <Text style={[AppStyles.oddMBold, { color: "#707070", textAlign: 'left', paddingBottom: 5 }]}>Post Id </Text>
                                    <Text style={[AppStyles.evenLRegular, { textAlign: 'left', color: '#6e78f7', paddingBottom: 5 }]}>{item.post_id}</Text>
                                </View>
                                {
                                    item.status == 0 && (this.sideStatus(item.post_status, "#009640"))
                                }
                                {
                                    item.status == 1 && (this.sideStatus(item.post_status, "#b8860b"))
                                }
                                {
                                    item.status == 2 && (this.sideStatus(item.post_status, "#dc143c"))
                                }
                            </View>
                            <View style={{ flexDirection: 'row', flex: 1, paddingVertical: 5 }}>
                                <Text style={[AppStyles.evenLRegular, { color: "#999999", flex: 0.4 }]} >Mobile Number </Text>
                                <Text style={[AppStyles.evenLRegular, { color: "#999999", flex: 0.1 }]}>: </Text>
                                <Text style={[AppStyles.evenLRegular, { color: "#1B2430", textAlign: 'left', flex: 0.5 }]} onPress={() => this.linkCall(item.mobile)}>{item.mobile}</Text>
                            </View>
                            <View style={{ flexDirection: 'row', flex: 1, paddingVertical: 5 }}>
                                <Text style={[AppStyles.evenLRegular, { color: "#999999", flex: 0.4 }]}>Category </Text>
                                <Text style={[AppStyles.evenLRegular, { color: "#999999", flex: 0.1 }]}>: </Text>
                                <Text style={[AppStyles.evenLRegular, { color: "#1B2430", textAlign: 'left', flex: 0.5 }]}>{item.category}</Text>
                            </View>
                            <View style={{ flexDirection: 'row', flex: 1, paddingVertical: 5 }}>
                                <Text style={[AppStyles.evenLRegular, { color: "#999999", flex: 0.4 }]}>Sub Category </Text>
                                <Text style={[AppStyles.evenLRegular, { color: "#999999", flex: 0.1 }]}>: </Text>
                                <Text style={[AppStyles.evenLRegular, { color: "#1B2430", textAlign: 'left', flex: 0.5 }]}>{item.subcategory}</Text>
                            </View>
                            <View style={{ flexDirection: 'row', flex: 1, paddingVertical: 5 }}>
                                <Text style={[AppStyles.evenLRegular, { color: "#999999", flex: 0.4 }]}>Qty / Weight</Text>
                                <Text style={[AppStyles.evenLRegular, { color: "#999999", flex: 0.1 }]}>: </Text>
                                <Text style={[AppStyles.evenLRegular, { color: "#1B2430", textAlign: 'left', flex: 0.5 }]}>{item.quantity} No's / {item.weight} Kgs.</Text>
                            </View>
                            <View style={{ flexDirection: 'row', flex: 1, paddingVertical: 5 }}>
                                <Text style={[AppStyles.evenLRegular, { color: "#999999", flex: 0.4 }]}>Offer Price </Text>
                                <Text style={[AppStyles.evenLRegular, { color: "#999999", flex: 0.1 }]}>: </Text>
                                <Text style={[AppStyles.evenLRegular, { color: "#1B2430", textAlign: 'left', flex: 0.5 }]}>{item.price} Rs/.</Text>
                            </View>
                            <View style={{ flexDirection: 'row', flex: 1, paddingVertical: 5 }}>
                                <Text style={[AppStyles.evenLRegular, { color: "#999999", flex: 0.4 }]}>Date of Manufacture </Text>
                                <Text style={[AppStyles.evenLRegular, { color: "#999999", flex: 0.1 }]}>: </Text>
                                <Text style={[AppStyles.evenLRegular, { color: "#1B2430", textAlign: 'left', flex: 0.5 }]}>{item.date}</Text>
                            </View>
                            <View style={{ flexDirection: 'row', flex: 1, paddingVertical: 5 }}>
                                <Text style={[AppStyles.evenLRegular, { color: "#999999", flex: 0.4 }]}>Condition </Text>
                                <Text style={[AppStyles.evenLRegular, { color: "#999999", flex: 0.1 }]}>: </Text>
                                <Text style={[AppStyles.evenLRegular, { color: "#1B2430", textAlign: 'left', flex: 0.5 }]}>{item.condition}</Text>
                            </View>
                            {this.state.userlevel == 2 &&
                                <React.Fragment>
                                    <View style={{ flexDirection: 'row', flex: 1, paddingVertical: 5 }}>
                                        <Text style={[AppStyles.evenLRegular, { color: "#999999", flex: 0.4 }]}>Address</Text>
                                        <Text style={[AppStyles.evenLRegular, { color: "#999999", flex: 0.1 }]}>: </Text>
                                        <Text style={[AppStyles.evenLRegular, { color: "#1B2430", textAlign: 'left', flex: 0.5 }]}>{item.address}</Text>
                                    </View>
                                    <View style={{ flexDirection: 'row', flex: 1, paddingVertical: 5 }}>
                                        <Text style={[AppStyles.evenLRegular, { color: "#999999", flex: 0.4 }]}>Landmark</Text>
                                        <Text style={[AppStyles.evenLRegular, { color: "#999999", flex: 0.1 }]}>: </Text>
                                        <Text style={[AppStyles.evenLRegular, { color: "#1B2430", textAlign: 'left', flex: 0.5 }]}>{item.landmark}</Text>
                                    </View>
                                </React.Fragment>
                            }
                        </View>
                        <View style={{ margin: 10 }}>
                            <Text style={{ ...AppStyles.oddMRegular, paddingVertical: 5, color: "#1B2430" }}>Product Description :</Text>
                            <Textarea
                                containerStyle={styles.textareaContainer}
                                value={item.product_description}
                                style={{ ...styles.textarea, ...AppStyles.evenLRegular }}
                                defaultValue={item.product_description}
                                editable={false}
                                ref={"description"}
                                placeholderTextColor={'#D3D3D3'}
                                underlineColorAndroid={'transparent'}
                                autoCorrect={false}
                            />
                        </View>
                        {
                            item.remarks !== "" && this.state.userlevel == 1 &&
                            <View style={{ margin: 10 }}>
                                <Text style={{ ...AppStyles.oddMRegular, paddingVertical: 5, color: "red" }}>Remarks For Rejection :</Text>
                                <Text>{item.remarks ? item.remarks : "NA"}</Text>
                            </View>
                        }
                        <View style={{ paddingTop: 15 }}>

                            <ScrollView
                                style={{ flex: 1, paddingVertical: 10 }}
                                horizontal={true}
                                pagingEnabled={true}
                                onScroll={(e) => this.handleOnScroll(e)}
                                showsHorizontalScrollIndicator={false}
                                scrollEventThrottle={5}
                            >
                                {
                                    this.state.avatarSource.map((rowdata, index) => {
                                        return (
                                            <TouchableOpacity onPress={() => Actions.Images({ data: this.state.avatarSource })}>
                                                <Image source={{ uri: rowdata }} style={{ flex: 1, width: width, height: 200 }} resizeMode='cover' />
                                            </TouchableOpacity>
                                        );
                                    })
                                }
                            </ScrollView>
                            <View style={styles.paginationWrapper}>
                                {this.state.avatarSource.map((key, index) => (
                                    <View style={this.state.pageindex == index ? styles.paginationDots1 : styles.paginationDots} key={index} />
                                ))}
                            </View>
                        </View>
                        {
                            this.state.userlevel == 1 && this.state.buyers.length > 0 &&
                            <View style={{ padding: 10 }}>
                                <Text style={{ ...AppStyles.evenXLRegular, paddingVertical: 5, color: '#1B2430' }}>Interested Authorised Buyers :</Text>

                                <FlatList
                                    data={this.state.buyers}
                                    showsVerticalScrollIndicator={false}
                                    renderItem={
                                        ({ item }) =>
                                            <TouchableOpacity style={{ borderWidth: 1, borderRadius: 10, padding: 5, marginVertical: 10 }} >
                                                <View style={{ flexDirection: 'row', flex: 1, paddingVertical: 5 }}>
                                                    <Text style={[AppStyles.evenMRegular, { color: "#9D9D9D", flex: 0.4 }]}>Name </Text>
                                                    <Text style={[AppStyles.evenMRegular, { color: "#9D9D9D", flex: 0.1 }]}>: </Text>
                                                    <Text style={[AppStyles.evenMRegular, { color: "#1B2430", textAlign: 'left', flex: 0.5 }]}>{item.buyyer_name}</Text>
                                                </View>
                                                <View style={{ flexDirection: 'row', flex: 1, paddingVertical: 5 }}>
                                                    <Text style={[AppStyles.evenMRegular, { color: "#9D9D9D", flex: 0.4 }]}>Address </Text>
                                                    <Text style={[AppStyles.evenMRegular, { color: "#9D9D9D", flex: 0.1 }]}>: </Text>
                                                    <Text style={[AppStyles.evenMRegular, { color: "#1B2430", textAlign: 'left', flex: 0.5 }]}>{item.buyyer_address}</Text>
                                                </View>
                                                <View style={{ flexDirection: 'row', flex: 1, paddingVertical: 5 }}>
                                                    <Text style={[AppStyles.evenMRegular, { color: "#9D9D9D", flex: 0.4 }]}>Mobile No. </Text>
                                                    <Text style={[AppStyles.evenMRegular, { color: "#9D9D9D", flex: 0.1 }]}>: </Text>
                                                    <TouchableOpacity onPress={() => this.linkCall(item.mobile)} style={{ flex: 0.5, flexDirection: 'row' }}>
                                                        <Text style={[AppStyles.evenMRegular, { color: "#1B2430" }]} >{item.mobile} </Text>
                                                        <Image source={require('../../../images/phone-call.png')} style={{ width: 15, height: 15 }} resizeMode='center' />
                                                    </TouchableOpacity>
                                                </View>
                                                <View style={{ flexDirection: 'row', flex: 1, paddingVertical: 5 }}>
                                                    <Text style={[AppStyles.evenMRegular, { color: "#9D9D9D", flex: 0.4 }]}>Price Quoted </Text>
                                                    <Text style={[AppStyles.evenMRegular, { color: "#9D9D9D", flex: 0.1 }]}>: </Text>
                                                    <TouchableOpacity onPress={() => this.linkCall(item.mobile)} style={{ flex: 0.5, flexDirection: 'row' }}>
                                                        <Text style={[AppStyles.evenMRegular, { color: "#1B2430" }]} >{item.price} </Text>
                                                        <Image source={require('../../../images/rupee.png')} style={{ width: 12, height: 12, top: 2.5 }} resizeMode='center' />
                                                    </TouchableOpacity>
                                                </View>
                                                {/* <View style={{flexDirection: 'row',flex:1,paddingVertical:5}}>
                                            <Text style={[AppStyles.evenMRegular,{color:"#9D9D9D",flex:0.4}]}>Price Quoted </Text>
                                            <Text style={[AppStyles.evenMRegular,{color:"#9D9D9D",flex:0.1}]}>: </Text>
                                            <Text style={[AppStyles.evenMRegular,{color:"#1B2430",textAlign:'left',flex:0.5}]}>{item.price}</Text>
                                        </View> */}
                                                <View style={{ flexDirection: 'row', flex: 1, paddingVertical: 5 }}>
                                                    <Text style={[AppStyles.evenMRegular, { color: "#9D9D9D", flex: 0.4 }]}>Remarks </Text>
                                                    <Text style={[AppStyles.evenMRegular, { color: "#9D9D9D", flex: 0.1 }]}>: </Text>
                                                    <Text style={[AppStyles.evenMRegular, { color: "#1B2430", textAlign: 'left', flex: 0.5 }]}>{item.remarks}</Text>
                                                </View>
                                                <View style={{ flexDirection: 'row', flex: 1, paddingVertical: 5, alignItems: 'flex-end', justifyContent: 'flex-end' }}>
                                                    <TouchableOpacity style={{ flex: 1 }} onPress={() => Actions.ChatBox({ data: item })} style={{ flexDirection: 'row' }}>
                                                        <Image source={require('../../../images/chat.png')} style={{ width: 30, height: 30, top: 2.5 }} resizeMode='center' />
                                                    </TouchableOpacity>
                                                    <TouchableOpacity style={{ height: 30, marginLeft: 10, alignItems: 'center', justifyContent: 'center', backgroundColor: '#27ae60', width: width - 300, borderRadius: 5 }} onPress={() => this.approve(item)}>
                                                        <Text style={[AppStyles.evenLBold, { paddingHorizontal: 10, color: "#FFFFFF" }]}>
                                                            Accept</Text>
                                                    </TouchableOpacity>
                                                </View>
                                            </TouchableOpacity>
                                    }
                                />
                            </View>
                        }
                        {
                            (this.state.userlevel == 2 && this.state.verified == 0) &&
                            <View style={{ paddingHorizontal: 10 }}>
                                <TextField label='Price'
                                    value={this.state.price}
                                    onChangeText={(price) => this.setState({ price })}
                                    error={this.state.priceError}
                                    style={[AppStyles.evenLRegular, { color: '#1B2430' }]}
                                    titleTextStyle={[AppStyles.evenSRegular]}
                                    keyboardType='numeric'
                                    returnKeyType="go"
                                    textColor='#1B2430'
                                    tintColor='#1B2430'
                                    baseColor='#1B2430'
                                    labelTextStyle={AppStyles.evenLRegular}
                                    errorColor={this.state.errorColor}
                                    autoCorrect={false}
                                    blurOnSubmit={false}
                                    autoCapitalize='none'
                                />
                                <View style={{ flexDirection: 'column', justifyContent: 'space-between' }}>
                                    <Text style={{ ...AppStyles.evenXLBold, paddingVertical: 15 }}>Remarks</Text>
                                    <Textarea
                                        containerStyle={styles.textareaContainer}
                                        value={this.state.remarks}
                                        style={{ ...styles.textarea, ...AppStyles.evenLRegular }}
                                        onChangeText={(remarks) => this.setState({ remarks })}
                                        defaultValue={this.state.remarks}
                                        maxLength={150}
                                        placeholderTextColor={'#D3D3D3'}
                                        underlineColorAndroid={'transparent'}
                                        autoCorrect={false}
                                        errorColor={this.state.errorColor}
                                    />
                                    <Text style={{ ...AppStyles.evenSRegular, paddingLeft: 5 }}>{this.state.remarksError}</Text>
                                </View>
                            </View>
                        }
                        {
                            (this.state.userlevel == 2 && this.state.verified == 0) &&


                            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around', marginVertical: 10 }}>
                                <TouchableOpacity style={{ height: 50, alignItems: 'center', justifyContent: 'center', backgroundColor: '#6e78f7', flex: 0.45, borderRadius: 5 }} onPress={() => this.BuyyerInterested()}>
                                    <Text style={[AppStyles.evenXLRegular, { paddingHorizontal: 10, color: "#ffffff" }]}>
                                        Interested To Buy</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={{ height: 50, alignItems: 'center', justifyContent: 'center', backgroundColor: '#197b30', flex: 0.45, borderRadius: 5 }} onPress={() => Actions.ChatBox({ data: item })}>
                                    <Text style={[AppStyles.evenXLRegular, { paddingHorizontal: 10, color: "#ffffff" }]}>
                                        Chat</Text>
                                </TouchableOpacity>
                            </View>
                        }
                        {
                            (this.state.userlevel == 1) &&

                            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginVertical: 10 }}>
                                <TouchableOpacity style={{ height: 50, alignItems: 'center', justifyContent: 'center', backgroundColor: '#6e78f7', width: 180, borderRadius: 5 }} onPress={() => this.Cancel(item)}>
                                    <Text style={[AppStyles.evenLRegular, { paddingHorizontal: 10, color: "#ffffff" }]}>
                                        Cancel Post</Text>
                                </TouchableOpacity>
                            </View>
                        }
                    </ScrollView>
                </ImageBackground>
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
        paddingVertical: 5
    },
    textareaContainer: {
        height: 100,
        padding: 5,
        backgroundColor: '#FFF',
        borderRadius: 10,
        borderColor: '#000',
        borderWidth: 1
    }, textarea: {
        textAlignVertical: 'top',
        height: 120,
        letterSpacing: 0.3,
        paddingTop: 1,
    }, camera: {
        width: width / 3, height: 80, marginVertical: 5, paddingHorizontal: 10
    }, paginationWrapper: {
        bottom: 40,
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