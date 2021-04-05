import React, { Component } from 'react';
import { Platform, BackHandler, StyleSheet, TouchableOpacity, AsyncStorage, Image, Text, Alert, View, ToastAndroid } from 'react-native';
import SplashScreen from './src/components/Auth/SplashScreen'
import Login from './src/components/Auth/Login'
import Register from './src/components/Auth/Register'
import Mobile from './src/components/Auth/Mobile'
import Otp from './src/components/Auth/Otp'
import ForgotPassword from './src/components/Auth/ForgotPassword';
import HomeScreen from './src/components/App/HomeScreen'
import Pending from './src/components/App/Pending'
import BuyyerInterested from './src/components/App/BuyyerInterested'
import Profile from './src/components/App/Profile'
import ChatBox from './src/components/App/ChatBox'
import ViewPost from './src/components/App/ViewPost'
import NearVendors from './src/components/App/NearVendors'
import AddPost from './src/components/App/AddPost'
import DrawerView from "./src/components/App/DrawerView"
import AppStyles from './src/components/common/AppStyles'
import Images from './src/components/App/Images'
import Subcat from './src/components/App/Subcat'
import {
  widthPercentageToDP as wp, heightPercentageToDP as hp, listenOrientationChange as loc,
  removeOrientationListener as rol
} from 'react-native-responsive-screen';

import { Scene, Router, ActionConst, Drawer, Actions, Stack } from 'react-native-router-flux'
import firebase from 'react-native-firebase';
import { width } from './src/components/common/Constants';


global.PATH = "http://apemcl.ap.gov.in/ewaste/service/";
global.API_KEY = "AIzaSyC__kMc5DrP-ygWTQ9hG53MtnOapqONUkI";
global.IMAGE_PATH = "http://apemcl.ap.gov.in/ewaste/service/index.php?";
export default class App extends Component {

  constructor(props) {
    super(props);
  }

  async componentDidMount() {
    this.checkPermission();
    this.createNotificationListeners();
  }

  checkPermission = async () => {
    const enabled = await firebase.messaging().hasPermission();
    // alert(enabled);
    // If Premission granted proceed towards token fetch
    if (enabled) {
      this.getToken();
    } else {
      // If permission hasn’t been granted to our app, request user in requestPermission method.
      this.requestPermission();
    }
  };

  requestPermission = async () => {
    try {
      await firebase.messaging().requestPermission();
      // User has authorised
      getToken();
    } catch (error) {
      // User has rejected permissions
    }
  };

  displayNotification(title, body) {
    // we display notification in alert box with title and body
    ToastAndroid.show(
      "You have a new message",
      ToastAndroid.SHORT
    )
  }

  createNotificationListeners = async () => {
    // This listener triggered when notification has been received in foreground
    notificationListener = firebase
      .notifications()
      .onNotification((notification) => {
        const { title, body } = notification;
        this.displayNotification(title, body);
      });

    // This listener triggered when app is in backgound and we click, tapped and opened notifiaction
    notificationOpenedListener = firebase
      .notifications()
      .onNotificationOpened((notificationOpen) => {
        const { title, body } = notification;
        this.displayNotification(title, body);
      });

    // This listener triggered when app is closed and we click,tapped and opened notification
    const notificationOpen = await firebase
      .notifications()
      .getInitialNotification();
    if (notificationOpen) {
      const { title, body } = notification;
      this.displayNotification(title, body);
    }
  };

  getToken = async () => {
    let fcmToken = await AsyncStorage.getItem('testapp_fcmToken');
    if (!fcmToken) {
      await firebase.messaging().subscribeToTopic('entroewaste');
      fcmToken = await firebase.messaging().getToken();
      console.log('fcmToken', fcmToken);
      if (fcmToken) {
        // user has a device token
        await AsyncStorage.setItem('testapp_fcmToken', fcmToken);
      }
    }
  };

  render() {
    return (
      <RouterComponent />
    );
  }
}


const drawerImage = () => {
  return (
    <Image source={require('./images/05.png')} style={{ width: 30, height: 30, top: -20 }} resizeMode='center' />
  )
}
const RouterComponent = (props) => {
  return (
    <Router
      backAndroidHandler={() => {
        let cs = Actions.currentScene;
        if (cs === 'Login' || cs === 'Home' || cs === '_Home') {
          Alert.alert("Alert", "Are you Sure Want to Exit the App ?", [
            {
              text: "Cancel",
              onPress: () => { },
              style: "cancel"
            },
            {
              text: "OK",
              onPress: () => {
                BackHandler.exitApp();
              }
            }
          ]);
        }
        else if (cs === 'Pending') {
          Actions.Home({ "somePropToRefresh": Math.random(), "yourProp": "to " });
          Actions.refresh({ "somePropToRefresh": Math.random(), "yourProp": "to " });
        }
        else {
          Actions.pop();
          Actions.refresh({ "somePropToRefresh": Math.random(), "yourProp": "to " });
        }
        return true;
      }}
    >
      <Stack key="root" hideNavBar >
        <Scene key="SplashStack" hideNavBar >
          <Scene key="Splash" component={SplashScreen} />
        </Scene>
        <Scene key="Auth" hideNavBar  >
          <Scene key="Login" component={Login} initial />
          <Scene key="Mobile" component={Mobile} />
          <Scene key="ForgotPassword" component={ForgotPassword} />
          <Scene key="Register" component={Register} />
          <Scene key="Otp" component={Otp} />
        </Scene>
        <Stack key="App">
          <Drawer
            hideNavBar
            key="drawerMenu"
            contentComponent={DrawerView}
            drawerWidth={250}
            drawerPosition="left"
            drawerIcon={drawerImage}
            navigationBarStyle={{ backgroundColor: "#197b30" }}
            titleStyle={[AppStyles.evenXLBold, { color: '#404040' }]}
          >
            {/* <Scene key="Home"
            component={HomeScreen}
            hideNavBar={false}
            title={`Home`}
            titleStyle={[AppStyles.evenLBold,{color:'#FFFFFF'}]}
            navigationBarStyle={{ backgroundColor: '#197b30',height:60 }}
            initial />        */}
            <Scene key="Home"
              component={HomeScreen}
              hideNavBars navTransparent={1}
              initial
              {...props}
            />
          </Drawer>
          <Scene key="Pending"
            component={Pending}
            hideNavBars navTransparent={1}
            left={() => null}
          />
          <Scene key="BuyyerInterested"
            component={BuyyerInterested}
            hideNavBars navTransparent={1}
            left={() => null}
          />
          <Scene key="AddPost"
            component={AddPost}
            hideNavBars navTransparent={1}
            left={() => null}
          />
          <Scene key="Subcat"
            component={Subcat}
            hideNavBars navTransparent={1}
            left={() => null}
          />

          <Scene key="Profile"
            component={Profile}
            hideNavBars navTransparent={1}
            left={() => null}
          />
          <Scene key="ViewPost"
            component={ViewPost}
            hideNavBars navTransparent={1}
            left={() => null}
          />
          <Scene key="ChatBox"
            component={ChatBox}
            hideNavBar={false}
            tintColor='white'
            title={`Messages`}
            titleStyle={[AppStyles.evenLBold, { color: '#FFFFFF' }]}
            navigationBarStyle={{ backgroundColor: '#197b30', height: 60 }}
          />
          <Scene key="NearVendors"
            component={NearVendors}
            hideNavBars navTransparent={1}
            left={() => null}
          />
          <Scene key="Images"
            component={Images}
            hideNavBars navTransparent={1}
            left={() => null}
          />
        </Stack>
      </Stack>
    </Router>

  );
};


const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
  },

});
