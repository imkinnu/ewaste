import React from 'react';
import { AsyncStorage, Dimensions, Text, Image, StyleSheet, View, ImageBackground, StatusBar, Platform,ScrollView } from 'react-native';
import { Actions } from 'react-native-router-flux';
import {widthPercentageToDP as wp, heightPercentageToDP as hp,listenOrientationChange as loc,
removeOrientationListener as rol} from 'react-native-responsive-screen'; 
import LinearGradient from 'react-native-linear-gradient';
import AppStyles from '../common/AppStyles';

const {width,height} = Dimensions.get('window');


export default class SplashScreen extends React.Component {

    constructor(props) {
        super(props);
        this.checkStorage = this.checkStorage.bind(this);
    }

    UNSAFE_componentWillMount() {
        setTimeout(this.checkStorage, 2000);
    }

    checkStorage = async () => {
        const userToken = await AsyncStorage.getItem('username');
        if (userToken !== null) {
            Actions.App();
        } else {
             Actions.Auth();
        }
    };
    render() {
        console.disableYellowBox = true;
        return (
            <ScrollView contentContainerStyle={{ flexGrow: 1,backgroundColor:'#FFFFFF' }} keyboardShouldPersistTaps='handled'>
                <StatusBar hidden /> 
                {/* <ImageBackground source={require('../../../images/splash2.jpg')} style={{height:height,width:width,justifyContent:'center'}} resizeMode="cover"  > */}
                    {/* <ImageBackground source={require('../../../images/polygon.png')} style={{height:300,width:300,alignSelf:'center',justifyContent:'center'}}  resizeMode='contain' resizeMethod="auto" > */}
                    <View style={styles.page}>
                        <Image source={require('../../../images/pcb_logo.png')} style={{...styles.imagestyle}} resizeMode='contain' /> 
                    </View>
                    {/* </ImageBackground> */}
                {/* </ImageBackground> */}
                <Text style={[AppStyles.oddLBold,{color:"#999999",textAlign:'center'}]}>Andhra Pradesh Pollution Control Board</Text>
            </ScrollView>
        );
    }
}

const styles = StyleSheet.create({
    page: {
        flex: 1,
        backgroundColor: '#FFFFFF',
        justifyContent:'center'
    },
    container: {
        flex: 1,
        flexDirection: 'column',
        justifyContent:'center',
        marginHorizontal:20
    }, imagestyle: {
        alignSelf: 'center',
        height: hp('50%'),
        width: wp('90%')
    },
   

});
