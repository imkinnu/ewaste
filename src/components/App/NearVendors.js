import React from 'react';
import { Actions } from 'react-native-router-flux';
import {
    AsyncStorage, StyleSheet, Text, View, ScrollView, TouchableOpacity,
    ToastAndroid, ImageBackground, StatusBar, ActivityIndicator, FlatList, Image, Dimensions, PermissionsAndroid, Linking, TouchableHighlight
} from 'react-native';
import { setParams } from '../common/common';
import { TextField } from 'react-native-material-textfield';
import Header from './Header';
import DetailsModal from "../common/DetailsModal";
import TextInput from 'react-native-textinput-with-icons'
import {
    widthPercentageToDP as wp, heightPercentageToDP as hp, listenOrientationChange as loc,
    removeOrientationListener as rol
} from 'react-native-responsive-screen';
import ChatMessage from '../common/ChatMessage';
import AppStyles from '../common/AppStyles';
import Geocoder from 'react-native-geocoding';
import MapView, { Marker, Polyline, PROVIDER_GOOGLE, Callout } from "react-native-maps";
import getDirections from 'react-native-google-maps-directions';
Geocoder.init(global.API_KEY);
const { width, height } = Dimensions.get('window');
const LATITUDE_DELTA = 0.002;
const LONGITUDE_DELTA = 0.002;

export default class NearVendors extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            loading: false,
            data: [],
            avatarSource: [],
            userlevel: '',
            username: '',
            uid: '',
            message: '',
            vendor_data: [],
            MarkerRegion:
                [{
                    latitude: '0.00',
                    longitude: '0.00',
                    title: '',
                    description: ''
                }]
        }

    }
    UNSAFE_componentWillMount() {
        rol();
    }


    async componentDidMount() {
        loc(this);
        const username = await AsyncStorage.getItem('username')
        const userlevel = await AsyncStorage.getItem('userlevel')
        const uid = await AsyncStorage.getItem('uid')
        this.setState({ username: username, loading: true, userlevel: userlevel, uid: uid });
        this.GetVendorData();
        const markerObj = {
            latitude: global.LAT,
            longitude: global.LON,
            title: "Vendor's Nearby",
            description: "Nearest Collection Centers",
            current: true,
        }
        let MarkerRegion = [];
        MarkerRegion.push(markerObj);
        this.setState({ search: 1, MarkerRegion: MarkerRegion });
    }
    GetVendorData = () => {
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
                    this.setState({ loading: false, vendor_data: responseJson.sellerData })

                    this.state.vendor_data.map(marker => {
                        if (marker.latitude != '') {
                            const coordinate = {
                                latitude: parseFloat(marker.latitude),
                                longitude: parseFloat(marker.longitude),
                            };
                            // this.ImageDesc(marker)
                            const obj = { 'latitude': marker.latitude, 'longitude': marker.longitude, 'title': marker.label, 'description': marker.mobile, 'attachment': marker.attachment };
                            this.setState({
                                MarkerRegion: [...this.state.MarkerRegion, obj]
                            });
                            // console.log("Coords",this.state.MarkerRegion)

                        }
                    }
                    )
                }
            }).catch((error) => {
                ToastAndroid.show(
                    'Failed',
                    ToastAndroid.SHORT,
                );
                console.error(error);
            });
    }
    getMapRegion = () => ({
        latitude: global.LAT,
        longitude: global.LON,
        latitudeDelta: LATITUDE_DELTA,
        longitudeDelta: LONGITUDE_DELTA,
    });
    //Google Maps Directions
    Directions = (latituded, longituded) => {
        console.log("latituded", global.LAT)
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

    renderItem(item) {
        return (
            <ChatMessage avatar={this.state.username} message={item.message} createdAt={item.timestamp} />
        );
    }
    render() {
        console.disableYellowBox = true;
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
            <View style={{ flex: 1 }}>
                <View style={{ flex: 1 }}>
                    <StatusBar hidden />
                    <View style={{ height: 80, width: width, justifyContent: 'space-evenly', borderWidth: 1, borderColor: '#6e78f7', backgroundColor: '#6e78f7', paddingHorizontal: 10 }} >
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                            <View style={{ flex: 0.6, paddingTop: 15, flexDirection: 'row' }}>
                                <TouchableOpacity onPress={() => Actions.pop()}>
                                    <View style={{ width: 50, height: 50, borderRadius: 50, elevation: 5, justifyContent: 'center', alignItems: 'center', backgroundColor: '#6e78f7' }}>
                                        <Image source={require('../../../images/leftarrow.png')} resizeMode='contain' style={{ width: 20, height: 20, tintColor: '#FFFFFF' }} />
                                    </View>
                                </TouchableOpacity>
                                <View style={{ justifyContent: 'center', alignItems: 'center' }}>
                                    <Text style={[AppStyles.oddLMedium, { color: '#FFFFFF', letterSpacing: 0.5, paddingLeft: 10, paddingTop: 5 }]}>Nearest Vendors</Text>
                                </View>
                            </View>
                        </View>
                    </View>
                    <View style={{ flex: 1 }}>
                        <MapView style={styles.mapStyle}
                            provider={PROVIDER_GOOGLE}
                            initialRegion={this.getMapRegion()}
                            followsUserLocation={true}
                            showsUserLocation={true}
                            showsCompass={true}
                            toolbarEnabled={true}
                            zoomEnabled={true}
                            loadingEnabled={true}
                            loadingIndicatorColor="#666666"
                            loadingBackgroundColor="#eeeeee"
                            moveOnMarkerPress={false}
                            showsPointsOfInterest={false}
                        >
                            {
                                this.state.MarkerRegion.map(marker => {
                                    const coordinate = {
                                        latitude: parseFloat(marker.latitude),
                                        longitude: parseFloat(marker.longitude),
                                    };
                                    return (
                                        <Marker
                                            coordinate={coordinate}
                                            title={marker.title}
                                            description={marker.description}
                                        // onPress={(description) => this.titlePress(description)}

                                        >
                                            <MapView.Callout tooltip style={styles.customView} onPress={() => this.Directions(marker.latitude, marker.longitude)}>
                                                <View >
                                                    <View style={{ backgroundColor: '#FFFFFF', borderRadius: 10, height: 200, borderWidth: 1, justifyContent: 'center', alignItems: 'center', width: width - 150, padding: 10, }}>
                                                        <Text><Image style={{ height: 50, width: 50, alignSelf: 'center' }} source={{ uri: marker.attachment }} resizeMode="center" /></Text>
                                                        <Text style={{ ...AppStyles.evenLRegular, textAlign: 'center' }}>Vendor Data</Text>
                                                        <Text style={{ ...AppStyles.evenLRegular }}>1. {marker.title}</Text>
                                                        <Text style={{ ...AppStyles.evenLRegular }}>2 .{marker.description}</Text>
                                                        <Text style={{ ...AppStyles.evenLRegular, textAlign: 'center' }}>Get Directions</Text>
                                                    </View>
                                                </View>
                                            </MapView.Callout>
                                        </Marker>
                                    )
                                })
                                // this.mapMarkers()
                            }
                        </MapView>
                    </View>
                </View>
            </View >
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
    }, mapStyle: {
        position: 'absolute',
        width: width,
        height: height,
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
    }
});