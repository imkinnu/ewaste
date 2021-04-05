import React from 'react';
import { Actions } from 'react-native-router-flux';
import {
    AsyncStorage, StyleSheet, Text, View,TouchableOpacity,Image, Dimensions,
} from 'react-native';
import { setParams } from '../common/common';
import {widthPercentageToDP as wp, heightPercentageToDP as hp,listenOrientationChange as loc,
removeOrientationListener as rol} from 'react-native-responsive-screen'; 
import AppStyles from '../common/AppStyles'
export default class Header extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            loading : false,
            username:'',
        }
    }
    UNSAFE_componentWillMount (){
        rol();
    } 
    async componentDidMount() {
        loc(this);      
        const username=  await AsyncStorage.getItem('username')
        this.setState({ username: username });
        console.log('username',this.state.username);
    }
    render() {
        const heading = this.props.heading;
        return(
            <View style={styles.page}>
                <View style={{ marginTop: 0 }}>
                    <View style={styles.CardContainer}>
                        <View style={styles.rightCard}>
                            <View style={{justifyContent:'flex-end',alignItems:'flex-start',flex:1,paddingTop:5}}>
                                <Text style={[AppStyles.evenLBold,{color:"#EB4D4B",paddingLeft:25,textAlignVertical:'center'}]}>{heading} </Text>
                            </View>
                            <TouchableOpacity  onPress={this.props.onPress}>
                                <Image source={this.props.icon} style={{width: wp('6%'),height: hp('5%')}} resizeMode='contain' tintColor='#EB4D4B' />
                            </TouchableOpacity>
                            
                        </View>
                        
                    </View> 
                </View>
            </View>
        )
    }
}
const styles = StyleSheet.create({
    CardContainer: {
        marginHorizontal:wp('5%')
    },rightCard:{
        flexDirection:'row',
        alignItems:'center',
        marginTop:40,
        justifyContent:'center',
    },
    downCard:{
        flexDirection:'column',
        alignItems:'center',
    }, page: {
        backgroundColor:'#FFFFFF',
    },
});