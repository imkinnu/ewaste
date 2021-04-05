import React from "react";
import { Actions } from "react-native-router-flux";
import {
  Platform,
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Alert,
  ImageBackground,
  AsyncStorage,
  Image,
  Dimensions,
  ToastAndroid
} from "react-native";
import {
  widthPercentageToDP as wp, heightPercentageToDP as hp, listenOrientationChange as loc,
  removeOrientationListener as rol
} from 'react-native-responsive-screen';
import { setParams } from '../common/common';
import AppStyles from '../common/AppStyles';
import LinearGradient from 'react-native-linear-gradient';

const { width, height } = Dimensions.get('window');

export default class Example extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      name: "",
      mobile: "",
      username: "",
      token: '',
      userlevel: '',
    };
    this.logout = this.logout.bind(this);
    this.clearAsyncStorage = this.clearAsyncStorage.bind(this);
  }

  async componentDidMount() {
    loc(this);
    const username = await AsyncStorage.getItem('username')
    const userlevel = await AsyncStorage.getItem('userlevel')
    this.setState({ username: username, userlevel: userlevel });
    const token = await AsyncStorage.getItem('token')
    this.setState({ token: token });

  }
  NextRelease() {
    ToastAndroid.show(
      'Will be released in next update',
      ToastAndroid.SHORT,
    );
  }

  logout() {
    Alert.alert("Alert", "Are you Sure Want to Logout?", [
      {
        text: "Cancel",
        onPress: () => console.log("Cancel Pressed"),
        style: "cancel"
      },
      {
        text: "OK",
        onPress: () => {
          this.clearAsyncStorage();
          Actions.Auth({ type: "reset" });
          console.log("OK Pressed");
        }
      }
    ]);
  }

  clearAsyncStorage = async () => {
    AsyncStorage.clear();
  }

  render() {
    console.disableYellowBox = true;
    return (
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <ImageBackground source={require('../../../images/Image-2.png')} style={{ width: 250, height: height }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingTop: 25, alignItems: 'center' }}>
            <Image source={require('../../../images/pcb_logo.png')} style={{ width: 200, height: 200, elevation: 2 }} resizeMode='contain' />
            {/* <Text style={[AppStyles.evenLBold,{color:"#6e78f7",textAlign:'center',textAlignVertical: 'bottom', }]}>{`Bharadwaj Padmasolala`}</Text> */}
          </View>

          <View style={styles.RestDrawer}>
            <TouchableOpacity style={{ backgroundColor: '#6e78f7' }} onPress={() => Actions.Profile()}>
              <View style={styles.item}>
                <Image
                  resizeMode="contain"
                  source={require("../../../images/user.png")}
                  style={{ ...styles.icon, tintColor: '#FFFFFF' }}
                />
                <Text style={{ ...AppStyles.evenLBold, color: '#FFFFFF' }}>{"Edit Profile"}</Text>
              </View>
              {/* <View
                    style={{
                      borderBottomColor: '#6e78f7',
                      borderBottomWidth: 0.5,
                    }}
                  /> */}
            </TouchableOpacity>
            <TouchableOpacity onPress={() => { Actions.drawerClose() }}>
              <View style={styles.item}>
                <Image
                  resizeMode="contain"
                  source={require("../../../images/home.png")}
                  style={{ ...styles.icon, tintColor: '#6e78f7' }}
                />
                <Text style={{ ...AppStyles.evenLRegular, color: '#6e78f7' }}>{"Home"}</Text>
              </View>
              {/* <View
                style={{
                  borderBottomColor: '#000000',
                  borderBottomWidth: 0.5,
                }}
              /> */}
            </TouchableOpacity>
            {
              this.state.userlevel == 2 ?
                <TouchableOpacity onPress={() => { Actions.BuyyerInterested({ data: { "interested": 1 } }) }}>
                  <View style={styles.item}>
                    <Image
                      resizeMode="contain"
                      source={require("../../../images/share-post.png")}
                      style={{ ...styles.icon, tintColor: '#6e78f7' }}
                    />
                    <Text style={{ ...AppStyles.evenLRegular, color: '#6e78f7' }}>{"Interested Posts"}</Text>
                  </View>
                  {/* <View
                  style={{
                    borderBottomColor: '#000000',
                    borderBottomWidth: 0.5,
                  }}
                /> */}
                </TouchableOpacity>
                :

                <TouchableOpacity onPress={() => { Actions.Pending() }}>
                  <View style={styles.item}>
                    <Image
                      resizeMode="contain"
                      source={require("../../../images/share-post.png")}
                      style={{ ...styles.icon, tintColor: '#6e78f7' }}
                    />
                    <Text style={{ ...AppStyles.evenLRegular, color: '#6e78f7' }}>{"My Posts"}</Text>
                  </View>
                  {/* <View
                  style={{
                    borderBottomColor: '#000000',
                    borderBottomWidth: 0.5,
                  }}
                /> */}
                </TouchableOpacity>
            }


            {
              this.state.userlevel == 1 &&
              <TouchableOpacity onPress={() => { Actions.NearVendors() }}>
                <View style={styles.item}>
                  <Image
                    resizeMode="contain"
                    source={require("../../../images/navigation.png")}
                    style={{ ...styles.icon, tintColor: '#6e78f7' }}
                  />
                  <Text style={{ ...AppStyles.evenLRegular, color: '#6e78f7' }}>{"Nearest Collecting\nCenters"}</Text>
                </View>
                {/* <View
                  style={{
                    borderBottomColor: '#000000',
                    borderBottomWidth: 0.5,
                  }}
                /> */}
              </TouchableOpacity>
            }
            <TouchableOpacity onPress={() => this.NextRelease()}>
              <View style={styles.item}>
                <Image
                  resizeMode="contain"
                  source={require("../../../images/review.png")}
                  style={{ ...styles.icon, tintColor: '#6e78f7' }}
                />
                <Text style={{ ...AppStyles.evenLRegular, color: '#6e78f7' }}>{"Rate Us"}</Text>
              </View>
              {/* <View
                style={{
                  borderBottomColor: '#000000',
                  borderBottomWidth: 0.5,
                }}
              /> */}

            </TouchableOpacity>
            {/* <TouchableOpacity onPress={() => {Actions.Pending()}}>
              <View style={styles.item}>
                <Image
                  resizeMode="contain"
                  source={require("../../../images/love.png")}
                  style={{...styles.icon,tintColor:'#6e78f7'}}
                />
                <Text style={{...AppStyles.evenLRegular,color:'#6e78f7'}}>{"Suggestions"}</Text>
              </View>
              <View
                style={{
                  borderBottomColor: '#000000',
                  borderBottomWidth: 0.5,
                }}
              />
            </TouchableOpacity> */}
            <TouchableOpacity onPress={() => this.NextRelease()}>
              <View style={styles.item}>
                <Image
                  resizeMode="contain"
                  source={require("../../../images/information.png")}
                  style={{ ...styles.icon, tintColor: '#6e78f7' }}
                />
                <Text style={{ ...AppStyles.evenLRegular, color: '#6e78f7' }}>{"Contact Us"}</Text>
              </View>
              {/* <View
                style={{
                  borderBottomColor: '#000000',
                  borderBottomWidth: 0.5,
                }}
              /> */}
            </TouchableOpacity>
            <TouchableOpacity onPress={() => { this.logout() }}>
              <View style={styles.item}>
                <Image
                  resizeMode="contain"
                  source={require("../../../images/logout.png")}
                  style={{ ...styles.icon, tintColor: '#6e78f7' }}
                />
                <Text style={{ ...AppStyles.evenLRegular, color: '#6e78f7' }}>{"Logout"}</Text>
              </View>
            </TouchableOpacity>
          </View>
        </ImageBackground>
      </ScrollView>
    );
  }
}

const styles = StyleSheet.create({
  page: {
    flex: 1,

  },
  TopDrawer: {
    flexDirection: "row",
    resizeMode: 'contain',
    // backgroundColor: "#0caa41",
    justifyContent: "flex-start",
    alignItems: "center",
    height: 110,
  },
  nameView: {
    flexDirection: "column",
    justifyContent: "flex-start",
    alignItems: "flex-start",
    marginLeft: 10,

  },
  RestDrawer: {
    flexDirection: "column",
    // backgroundColor: "#fff",
    justifyContent: "center",
    marginTop: -20
  },
  LightTextStyle: {
    flexWrap: "wrap",
    fontSize: 16,
    fontWeight: "normal",
    fontStyle: "normal",
    paddingTop: 4,
    letterSpacing: 1,
    paddingLeft: 15,
    color: "#000",
    ...Platform.select({
      ios: {
        fontFamily: "Poppins-Medium"
      },
      android: {
        fontFamily: "Poppins-Medium"
      }
    })
  },
  MediumTextStyle: {
    fontSize: 16,
    lineHeight: 22,
    color: "#fff",
    letterSpacing: 1,
    ...Platform.select({
      ios: {
        fontFamily: "Poppins-Medium"
      },
      android: {
        fontFamily: "Poppins-Medium"
      }
    })
  },
  RegularTextStyle: {
    fontSize: 16,
    lineHeight: 22,
    color: "#fff",
    ...Platform.select({
      ios: {
        fontFamily: "Poppins-Medium"
      },
      android: {
        fontFamily: "Poppins-Medium"
      }
    })
  },
  item: {
    flexDirection: "row",
    justifyContent: "flex-start",
    alignItems: "center",
    marginHorizontal: 10,
    marginVertical: 10
  },
  icon: {
    width: 20,
    height: 20,
    // tintColor: "#b6b6b6",
    marginRight: 20
  },
  itemText: {
    fontSize: 18,
    color: "#b6b6b6",
    ...Platform.select({
      ios: {
        fontFamily: "Poppins-Medium"
      },
      android: {
        fontFamily: "Poppins-Medium"
      }
    })
  },
  logoOuterView: {
    width: 50,
    height: 50,
    borderRadius: 50,
    backgroundColor: "#fff",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center"
  },
  logo: {
    width: 25,
    height: 25,
    tintColor: "#717171"
  }
});
