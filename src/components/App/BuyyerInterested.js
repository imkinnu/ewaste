import React from 'react';
import { Actions } from 'react-native-router-flux';
import {
    AsyncStorage, StyleSheet, Text, View, ScrollView, TouchableOpacity,
    ToastAndroid, ImageBackground, StatusBar, ActivityIndicator, FlatList, Image, Dimensions, PermissionsAndroid, Alert
} from 'react-native';
import { setParams } from '../common/common';
import {
    widthPercentageToDP as wp, heightPercentageToDP as hp, listenOrientationChange as loc,
    removeOrientationListener as rol
} from 'react-native-responsive-screen';
import { Dropdown as MaterialDropdown } from 'react-native-material-dropdown';
import AppStyles from '../common/AppStyles';
import getDirections from 'react-native-google-maps-directions';
import { TouchableNativeFeedback } from 'react-native-gesture-handler';

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

export default class Pending extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            loading: false,
            name: '',
            data: [],
            token: '',
            username: '',
            heading: '',
            category: '',
            subcategory: '',
            status: '',
            catg: [],
            scatg: [],
            statuses: [
                {
                    value: "Pending"
                },
                {
                    value: "Approved"
                },
                {
                    value: "Rejected"
                }

            ],
            categoryError: '',
            subcategoryError: '',
            fetchLoading: false,
            limitExceed: false,
            userlevel: '',
            uid: '',
            districts: [],
            districtError: 'Select District',
            filter: 0
        }
        this.page = 1;
        this.Pageadd = this.Pageadd.bind(this);
        this.renderFooter = this.renderFooter.bind(this);
    }
    UNSAFE_componentWillMount() {
        rol();
    }

    async componentDidMount() {
        loc(this);
        const username = await AsyncStorage.getItem('username')
        const userlevel = await AsyncStorage.getItem('userlevel')
        const uid = await AsyncStorage.getItem('uid')
        const heading = username.slice(0, 1).toUpperCase() + username.slice(1, username.length)
        this.setState({ username: username, heading: 'Welcome ' + heading, loading: true, userlevel: userlevel, uid: uid });
        // this.GetCategory();
        this.GetData();
    }

    Pageadd = (status) => {
        // if(status == false){
        //     this.page = this.page+1;
        //     this.GetData();
        // }else{
        this.page = this.page + 1;
        // this.setState({data:[],limitExceed:false,fetchLoading:false},()=>this.GetData());
        this.setState({ limitExceed: false, fetchLoading: false }, () => this.GetData());
        // }

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
                category: 1
            })
        }).then((response) => response.json())
            .then((responseJson) => {
                // console.log(responseJson)
                if (responseJson.result == "success") {
                    this.setState({ loading: false, catg: responseJson.itemCategory })
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
                // console.log(responseJson)
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
    componentWillReceiveProps(props) {
        // console.log(props);
        this.setState({ loading: true })
        this.GetCategory();
        // this.GetData();
    }

    GetData = () => {
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
                uid: this.state.username,
                buyyerHistory: 1
            })
        }).then((response) => response.json())
            .then((responseJson) => {
                if (responseJson.result == "success") {
                    this.setState({ loading: false, fetchLoading: false, limitExceed: false, data: [...this.state.data, ...responseJson.posts] });
                } else {
                    this.setState({ loading: false, fetchLoading: false, limitExceed: true });
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

    //Google Maps Directions
    Directions = (latituded, longituded) => {
        const data = {
            source: {
                latitude: global.LAT,
                longitude: global.LON
            },
            destination: {
                latitude: latituded,
                longitude: longituded
            },
            params: [
                {
                    key: "travelmode",
                    value: "driving"        // may be "walking", "bicycling" or "transit" as well
                },
                {
                    key: "dir_action",
                    value: "navigate"       // this instantly initializes navigation using the given travel mode
                }
            ],
            waypoints: [
                {
                    latitude: latituded,
                    longitude: longituded
                },
                {
                    latitude: latituded,
                    longitude: longituded
                },
                {
                    latitude: latituded,
                    longitude: longituded
                }
            ]
        };
        getDirections(data);
    }
    sideStatus = (post_status, count, bgcolor) => {
        return (
            <View style={{ flexDirection: 'column', flex: 0.35, backgroundColor: bgcolor, height: 30, borderTopRightRadius: 10, borderBottomLeftRadius: 10, justifyContent: 'center' }}>
                <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
                    <View>
                        <Text style={[AppStyles.oddSBold, { textAlign: 'center', color: '#FFFFFF' }]}>Status </Text>
                        <Text style={[AppStyles.oddSRegular, { textAlign: 'center', color: '#FFFFFF' }]}>{post_status}</Text>
                    </View>
                    {
                        count != 0 &&

                        <View style={{ flexDirection: 'row', justifyContent: 'flex-end', left: 10 }}>
                            <Image source={require('../../../images/notification.png')} style={{ width: 20, height: 20, alignSelf: 'center' }} resizeMode='center' tintColor='#FFFFFF' />
                            <Text style={[AppStyles.evenSRegular, { color: '#FFFFFF', bottom: 5, right: 3 }]}>{count}</Text>
                        </View>
                    }
                </View>
            </View>

        )
    }
    renderFooter() {
        return (
            <View style={styles.footerStyle}>
                {
                    (this.state.fetchLoading)
                        ?
                        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#EEEEEE' }}>
                            <View style={{ height: 100, width: 100, backgroundColor: '#FFFFFF', borderRadius: 10, justifyContent: 'center', elevation: 2 }}>
                                <ActivityIndicator size="small" color='#338995' />
                            </View>
                        </View>
                        :
                        null
                }
            </View>
        )
    }
    goToHome() {
        // Actions.pop();
        // Actions.refresh({ "somePropToRefresh": Math.random(), "yourProp": "to " });
        // // Actions.refresh({ "somePropToRefresh": Math.random(), "yourProp": "to " });
        setTimeout(() => { Actions.refresh({ refresh: true }) }, 10); Actions.pop(); Actions.Home();
    }
    render() {
        console.disableYellowBox = true;
        const item = this.props.data;
        let bgcolor = ''
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
                    <View style={styles.page}>
                        <View style={{ height: 80, width: width, justifyContent: 'space-evenly', borderWidth: 1, borderColor: '#6e78f7', backgroundColor: '#6e78f7', paddingHorizontal: 10 }} >
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                                <View style={{ flex: 0.6, paddingTop: 15, flexDirection: 'row' }}>
                                    <TouchableOpacity onPress={() => this.goToHome()}>
                                        <View style={{ width: 50, height: 50, borderRadius: 50, elevation: 5, justifyContent: 'center', alignItems: 'center', backgroundColor: '#6e78f7' }}>
                                            <Image source={require('../../../images/leftarrow.png')} resizeMode='contain' style={{ width: 20, height: 20, tintColor: '#FFFFFF' }} />
                                        </View>
                                    </TouchableOpacity>
                                    <View style={{ justifyContent: 'center', alignItems: 'center' }}>
                                        <Text style={[AppStyles.oddLMedium, { color: '#FFFFFF', letterSpacing: 0.5, paddingLeft: 10, paddingTop: 5 }]}>Interested Posts</Text>
                                    </View>
                                </View>
                            </View>
                        </View>
                        <FlatList
                            data={this.state.data}
                            showsVerticalScrollIndicator={false}
                            renderItem={
                                ({ item }) =>
                                    <TouchableOpacity onPress={() => { }}>
                                        <View style={{ borderRadius: 10, height: 175, backgroundColor: '#F9F9F9', elevation: 2, borderColor: '#F9F9F9', borderWidth: 1, margin: 10 }}>
                                            <View style={{ flex: 1, flexDirection: 'row', paddingBottom: 10 }}>
                                                <View style={{ flexDirection: 'column', flex: 0.65, padding: 10, }}>
                                                    <Text style={[AppStyles.oddMBold, { color: "#707070", textAlign: 'left', paddingBottom: 5 }]}>Post Id </Text>
                                                    <Text style={[AppStyles.evenLRegular, { textAlign: 'left', color: '#6e78f7', paddingBottom: 5 }]}>{item.post_id}</Text>
                                                </View>
                                                <View style={{ flexDirection: 'row', flex: 0.5, marginTop: 5 }}>
                                                    <Text style={[AppStyles.oddMBold, { textAlign: 'left', color: '#000000', paddingBottom: 5 }]}>Rs {item.price} /-</Text>
                                                </View>
                                                {
                                                    item.status == 0 && (this.sideStatus(item.post_status, item.count, "#009640"))
                                                }
                                                {
                                                    item.status == 1 && (this.sideStatus(item.post_status, item.count, "#b8860b"))
                                                }
                                                {
                                                    item.status == 2 && (this.sideStatus(item.post_status, item.count, "#dc143c"))
                                                }
                                            </View>
                                            <View style={{ flex: 1, flexDirection: 'column', justifyContent: 'space-between', marginTop: 10 }}>
                                                <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 20 }}>
                                                    <View style={{ flex: 0.6 }}>
                                                        <Text style={[AppStyles.oddMRegular, { color: "#AFAFAF", textAlign: 'left' }]}>Category </Text>
                                                        <Text style={[AppStyles.oddSRegular, { textAlign: 'left' }]}>{item.category}</Text>
                                                    </View>
                                                    <View style={{ flex: 0.4 }}>
                                                        <Text style={[AppStyles.oddMRegular, { color: "#AFAFAF", textAlign: 'left' }]}>Sub Category </Text>
                                                        <Text style={[AppStyles.oddSRegular, { textAlign: 'left' }]}>{item.subcategory}</Text>
                                                    </View>
                                                </View>
                                            </View>
                                            <View style={{ flex: 1, flexDirection: 'column', justifyContent: 'space-between', marginTop: 10 }}>
                                                <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 10 }}>
                                                    <View style={{ flex: 0.6 }}>
                                                        <Text style={[AppStyles.oddMRegular, { color: "#AFAFAF", textAlign: 'left' }]}>Condition </Text>
                                                        <Text style={[AppStyles.oddSRegular, { textAlign: 'left' }]}>{item.condition}</Text>
                                                    </View>
                                                    <View style={{ flex: 0.4 }}>
                                                        <Text style={[AppStyles.oddMRegular, { color: "#AFAFAF", textAlign: 'left' }]}>Posted Date </Text>
                                                        <Text style={[AppStyles.oddSRegular, { textAlign: 'left' }]}>{item.posted_date}</Text>
                                                    </View>
                                                </View>
                                            </View>
                                            {
                                                this.state.userlevel == 1 &&
                                                <View style={{ flexDirection: 'row', marginTop: 5 }}>
                                                    <View style={{ flex: 1, padding: 10, }}>
                                                        <Text style={[AppStyles.oddSRegular, { color: 'red' }]}>Remarks for Rejection</Text>
                                                        <Text style={AppStyles.oddSRegular}>{item.remarks ? item.remarks : "NA"}</Text>
                                                    </View>
                                                    {item.verified == 2 &&

                                                        <View style={{ flexDirection: 'column', flex: 0.35, marginTop: 10, backgroundColor: 'red', height: 30, borderTopRightRadius: 10, borderBottomLeftRadius: 10, justifyContent: 'center' }}>
                                                            <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
                                                                <View>
                                                                    <Text style={[AppStyles.oddSRegular, { textAlign: 'center', color: '#fff' }]}>Rejected</Text>
                                                                </View>
                                                            </View>
                                                        </View>

                                                    }
                                                </View>
                                            }
                                            {
                                                (this.state.userlevel == 2) &&
                                                <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 5 }}>
                                                    <View style={{ flex: 0.4 }}>
                                                        <View>
                                                            <Text style={[AppStyles.oddMRegular, { color: "#AFAFAF", textAlign: 'left' }]}></Text>
                                                            <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center' }} onPress={() => this.Directions(item.latitude, item.longitude)}>
                                                                <Text style={[AppStyles.oddLRegular, { color: "#9D9D9D" }]}>Get Directions</Text>
                                                                <Image source={require('../../../images/navigation.png')} style={{ width: 20, height: 20, paddingLeft: 10 }} resizeMode='center' />
                                                            </TouchableOpacity>
                                                        </View>
                                                    </View>
                                                </View>
                                            }
                                        </View>
                                    </TouchableOpacity>

                            }
                        // ListFooterComponent={this.renderFooter}
                        />
                    </View>

                    {/* </ScrollView> */}
                </ImageBackground>
            </View >
        );
    }
}

const styles = StyleSheet.create({
    page: {
        flex: 1,
        backgroundColor: '#EEEEEE',
        justifyContent: 'flex-start',
    },
    textareaContainer: {
        height: 120,
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
        flex: 0.3, backgroundColor: '#F6F6F6', borderRadius: 5, borderWidth: 1, height: 80, borderColor: '#C4C4C4', justifyContent: 'center', alignItems: 'center'
    }
});