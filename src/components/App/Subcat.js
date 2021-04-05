import React from 'react';
import { Actions } from 'react-native-router-flux';
import {
    AsyncStorage, StyleSheet, Text, View, ScrollView, TouchableOpacity,
    ToastAndroid, ImageBackground, StatusBar, ActivityIndicator, FlatList, Image, Dimensions, PermissionsAndroid
} from 'react-native';
import {
    widthPercentageToDP as wp, heightPercentageToDP as hp, listenOrientationChange as loc,
    removeOrientationListener as rol
} from 'react-native-responsive-screen';
import { Dropdown as MaterialDropdown } from 'react-native-material-dropdown';
import AppStyles from '../common/AppStyles';
const { width, height } = Dimensions.get('window');
export default class Subcat extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            loading: false,
            userlevel: '',
            uid: '',
            name: '',
            data: [],
            scatg: [],
            summary: ''

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
        this.GetSubcatg();
    }
    //Get Sub-Category Data
    GetSubcatg = () => {
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
                subcategory: 1,
                cid: item.id
            })
        }).then((response) => response.json())
            .then((responseJson) => {
                if (responseJson.result == "success") {
                    this.setState({ loading: false, scatg: responseJson.subItemCategory, summary: responseJson.summary })
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
        const item = this.props.data;
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
            <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps='handled'>
                <View style={styles.page} >
                    <StatusBar hidden />
                    <View style={{ height: 80, width: width, justifyContent: 'space-evenly', borderWidth: 1, borderColor: '#6e78f7', backgroundColor: '#6e78f7', paddingHorizontal: 10 }} >
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                            <View style={{ flex: 0.6, paddingTop: 15, flexDirection: 'row' }}>
                                <TouchableOpacity onPress={() => Actions.pop()}>
                                    <View style={{ width: 30, height: 30, borderRadius: 4, elevation: 5, justifyContent: 'center', alignItems: 'center', backgroundColor: '#6e78f7' }}>
                                        <Image source={require('../../../images/leftarrow.png')} resizeMode='contain' style={{ width: 20, height: 20, tintColor: '#FFFFFF' }} />
                                    </View>
                                </TouchableOpacity>
                                <Text style={[AppStyles.oddLMedium, { color: '#FFFFFF', letterSpacing: 0.5, paddingLeft: 10, paddingTop: 5 }]}>{item.name}</Text>
                            </View>
                        </View>
                    </View>
                    {/* <View style={{alignItems:'center',marginVertical:20,paddingHorizontal:10}}>
                        <TouchableOpacity style={{justifyContent:'center',alignItems:'center',backgroundColor:'#FFFFFF',borderRadius:30,height:150,width:200}}>
                            <Image source={require('../../../images/ewaste.png')} style={{width:200,height:150,borderRadius:30}} resizeMode='contain' />
                        </TouchableOpacity> 
                        <Text style={[AppStyles.evenLBold,{color:'#1B2430',textAlign:'left',letterSpacing:0.5,paddingVertical:5}]} >{item.name}</Text>
                    </View> */}
                    <View style={{ marginVertical: 20, paddingHorizontal: 10 }}>
                        <Text style={[AppStyles.evenXLBold, { color: '#1B2430', textAlign: 'left', letterSpacing: 0.5, paddingTop: 5 }]} >Summary : </Text>
                        <Text style={[AppStyles.oddMRegular, { color: '#1B2430', textAlign: 'left', letterSpacing: 0.5 }]}>{this.state.summary}</Text>
                    </View>
                    <View style={{ padding: 10 }}>
                        <Text style={[AppStyles.evenLBold, { color: '#1B2430', textAlign: 'left', letterSpacing: 0.5, paddingTop: 5 }]} >Accessories : </Text>
                        <FlatList
                            data={this.state.scatg}
                            showsVerticalScrollIndicator={false}
                            numColumns={1}
                            renderItem={
                                ({ item, index }) =>
                                    // <View style={{flexDirection:'row',justifyContent:'space-around',margin:5}}>
                                    <View style={styles.symptoms}>
                                        <Text style={[AppStyles.oddMBold, { color: '#1B2430', textAlign: 'left', letterSpacing: 0.5 }]}>{index + 1}. </Text>
                                        <Text style={[AppStyles.oddMRegular, { color: '#1B2430', textAlign: 'left', letterSpacing: 0.5 }]}>{item.value}</Text>
                                    </View>
                                // </View>
                            }
                        />
                    </View>

                </View>
            </ScrollView>
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
        backgroundColor: '#FFFFFF', height: 100, width: width / 2.2, borderRadius: 10, alignItems: 'center', justifyContent: 'center'
    }, symptoms: {
        height: 20, flex: 1, margin: wp('2%'), flexDirection: 'row'
    }
});