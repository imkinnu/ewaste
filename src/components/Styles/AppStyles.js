import { StyleSheet, Platform } from 'react-native';
import {widthPercentageToDP as wp, heightPercentageToDP as hp,listenOrientationChange as loc,
removeOrientationListener as rol} from 'react-native-responsive-screen';

const AppStyles = StyleSheet.create({
    page: {
        flex: 1, 
    },
    BottomTextHolder: {
        fontSize: 12,
        justifyContent: 'center',
        alignSelf: 'center',
        paddingBottom:15,
        color: '#717171',
        ...Platform.select({
            ios: {
                fontFamily: 'Avenir-Medium',
            },
            android: {
                fontFamily: 'GoogleSans-Medium',
            },
        }),
    },
   ForgotupHolder: {
        fontSize: 14,
        justifyContent: 'center',
        alignSelf: 'center',
        paddingBottom:15,
        color: '#717171',
        ...Platform.select({
            ios: {
                fontFamily: 'Avenir-Medium',
            },
            android: {
                fontFamily: 'GoogleSans-Medium',
            },
        }),
    },
    buttOnBackground: {
        zIndex:1,
        alignSelf: 'stretch',
        backgroundColor: "#0caa41",
        borderWidth: 1,
        borderRadius: 6,
        borderColor: '#0caa41',
        borderBottomWidth: 1,
        padding: 5,
        elevation: 1,
        marginTop: 20,
        marginBottom: 20,
    }, text: {
        fontSize: 14,
        lineHeight: 32,
        textAlign: "center",
        color: "#fff",
        ...Platform.select({
            ios: {
                fontFamily: 'ProximaNova-Black',
            },
            android: {
                fontFamily: 'ProximaNova-Black',
            },
        }),
    },
    name: {
        fontSize: 18,
        letterSpacing: 0.3,
        paddingTop:1,
        ...Platform.select({
            ios: {
                fontFamily: 'ProximaNova-Black',
            },
            android: {
                fontFamily: 'ProximaNova-Black',
            },
        }),
    },DropDownStyle: {
        textAlign: "left",
        letterSpacing: 0.3,
        ...Platform.select({
            ios: {
                fontFamily: 'ProximaNova-Black',
            },
            android: {
                fontFamily: 'ProximaNova-Black',
            },
        }),
    },buttonStyle:{
        flexDirection:'row',backgroundColor: '#ffffff',height:45,marginHorizontal:20,alignItems:'center',justifyContent:'center',borderRadius:20,
    },iconstyle: {
        width: wp('7%'),
        height: hp('8%'),
        resizeMode:'center'
    }, 
    imagestyle: {
        width: wp('70%'),
        alignSelf: 'center',
        height: hp('10%'),
    }
});

export default AppStyles;
