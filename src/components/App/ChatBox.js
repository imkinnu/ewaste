import React from 'react';
import { Actions } from 'react-native-router-flux';
import {
    AsyncStorage, StyleSheet, Text, View, ScrollView, TouchableOpacity,
    ToastAndroid, ImageBackground, StatusBar, ActivityIndicator, FlatList, Image, Dimensions, PermissionsAndroid, Linking
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
import Fonts from '../common/Fonts';

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

export default class ChatBox extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            loading: false,
            data: [],
            avatarSource: [],
            userlevel: '',
            username: '',
            uid: '',
            message: ''
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
        this.Messages();
    }
    //Messages Data
    Messages = () => {
        const item = this.props.data;
        if (this.state.userlevel == 1) {
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
                    conv: 1,
                    post_id: item.post_id,
                    vendor: item.uid,
                    username: this.state.uid,
                    buyyer_id: item.buyyer_id
                })
            }).then((response) => response.json())
                .then((responseJson) => {
                    if (responseJson.result == "success") {
                        this.setState({ loading: false, data: responseJson.conv });
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
        else {
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
                    conv: 1,
                    post_id: item.post_id,
                    vendor: item.uid,
                    username: this.state.uid,
                    buyyer_id: this.state.uid
                })
            }).then((response) => response.json())
                .then((responseJson) => {
                    if (responseJson.result == "success") {
                        this.setState({ loading: false, data: responseJson.conv });
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
    }
    //Send Message
    SendMessage = () => {
        const item = this.props.data;
        if (this.state.message != '') {
            this.setState({ loading: true });
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
                    sendmessage: 1,
                    post_id: item.post_id,
                    vendor: item.uid,
                    username: this.state.uid,
                    message: this.state.message
                })
            }).then((response) => response.json())
                .then((responseJson) => {
                    // console.log("Buyers",responseJson)
                    if (responseJson.result == "success") {
                        this.setState({ loading: false });
                        this.Messages()
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
    }
    renderItem(item) {
        return (
            <ChatMessage avatar={item.sender} message={item.message} createdAt={item.timestamp} />
        );
    }
    render() {
        console.disableYellowBox = true;
        if (this.state.loading) {
            return (
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                    <ActivityIndicator />
                </View>
            );
        }
        return (
            <View style={{ flex: 1 }}>
                <View style={{ flex: 1 }}>
                    <StatusBar hidden />
                    {/* <ChatMessage avatar="Admin" message="working on this task" createdAt="Friday, 23 August 2019, 03:35:13 pm" />
                    
                    <ChatMessage avatar="Admin" message="Rediff News - Delivers most trusted news from India and around the world. Impeccable coverage on society, politics, business, sports and entertainment.
                    .Get all the Latest Business News, Economy News, India" createdAt="Friday, 23 August 2019, 03:35:13 pm" />

                    <ChatMessage avatar="Admin" message="Task is almost Completed" createdAt="Friday, 23 August 2019, 03:35:13 pm" /> */}
                    <FlatList
                        data={this.state.data}
                        showsVerticalScrollIndicator={false}
                        renderItem={
                            ({ item }) => this.renderItem(item)
                        }
                    />
                </View>
                <View style={{ justifyContent: 'center', alignItems: 'center', backgroundColor: '#FFFFFF', marginHorizontal: 20, borderRadius: 10, top: -20 }}>
                    <TextInput
                        placeholder="Enter Message"
                        rightIcon="thumbsup"
                        rightIconType="oct"
                        rightIconSize={22}
                        rightIconColor='#6e78f7'
                        placeholderColor='#6e78f7'
                        rippleColor='#6e78f7'
                        error={this.state.usernameError}
                        fontFamily={Fonts.ProximaNovaRegular}
                        onChangeText={(message) => this.setState({ message: message })}
                        underlineHeight={0}
                        underlineActiveHeight={0}
                        labelActiveScale={0}
                        autoFocus={false}
                        onPressRightIcon={() => this.SendMessage()}
                    />
                </View>
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
    }
});