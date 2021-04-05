import React from 'react';
import { Actions } from 'react-native-router-flux';
import { WebView } from 'react-native-webview';
import {
    AsyncStorage, StyleSheet, Text, View, ScrollView,  TouchableOpacity,
    ToastAndroid, ImageBackground,StatusBar, ActivityIndicator, FlatList, Image, Dimensions,PermissionsAndroid
} from 'react-native';
import { setParams } from '../common/common';
import Header from './Header';
import {widthPercentageToDP as wp, heightPercentageToDP as hp,listenOrientationChange as loc,
removeOrientationListener as rol} from 'react-native-responsive-screen';
import {QRscanner} from 'react-native-qr-scanner';
import AppStyles from '../common/AppStyles';
import LinearGradient from 'react-native-linear-gradient';
import DetailsModal from "../common/DetailsModal";
import CheckBox from 'react-native-check-box'

const {width,height} = Dimensions.get('window');

export default class Brouchure extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            flashMode: false,
            zoom: 0.2,
            scanstatus:false,
            loading: false,
            data : '',
            details : [],
            username:'',
            modalVisible:false,
            modalData:'',
            status:0,
            reportingdate:'',
            reportingtime:'',
            bookingdate:'',
            amount:'',
            color:''
        }
        this.forceUpdateHandler = this.forceUpdateHandler.bind(this);
    }
    UNSAFE_componentWillMount (){
        rol();
    }
    async componentDidMount() { 
        loc(this); 
        const username=  await AsyncStorage.getItem('username')
        this.setState({ username: username });
        this.setState({loading:false});
    }
    forceUpdateHandler(){
      this.forceUpdate();
    };
    bottomView = ()=>{
        return(
        <View style={{flex:1,flexDirection:'row',backgroundColor:'#0000004D'}}>
            <TouchableOpacity style={{flex:1,alignItems:'center', justifyContent:'center'}} onPress={()=>this.setState({flashMode:!this.state.flashMode})}>
                <Text style={[AppStyles.evenSBold,{color:"#FFFFFF",textAlign:'center'}]}>TURN {this.state.flashMode == true ? 'OFF' : 'ON'} FLASH</Text>
            </TouchableOpacity>
        </View>
        );
    }
    onRead = (res) => {
        console.log(res.data);
        this.setState({loading:true});
        this.setState({data:res.data,type:res.type});
        var parms = {
            getData : true,
            id : res.data,
        }
        const url_params = setParams(parms);
        const url = global.PATH + url_params;
        console.log(url);
        fetch(url).then((response) => response.json())
        .then((responseJson) => {
            if(responseJson.result == 'success'){
                this.setState({details: responseJson.details,loading:false,modalVisible:true,reportingdate:responseJson.reportingdate,reportingtime:responseJson.reportingtime,bookingdate:responseJson.bookingdate,amount:responseJson.total_amount,color:responseJson.color,});
            }else{this.setState({loading:false});
                ToastAndroid.show(
                    responseJson.result,
                        ToastAndroid.SHORT,
                );
            }
        }).catch((error) => {
            ToastAndroid.show(
                'Failed',
                    ToastAndroid.SHORT,
            );
            console.error(error);
        });
    }    
    ChangeValue(index,value){
        let details = this.state.details.map(item => {
            //  item.status = false;
             return item;
        });
        details[index].status = !details[index].status;
        console.log(details)
        this.setState({details:details});
    }
    submitData(){
        let errorcount=0;
        let details = this.state.details.map(item => {
             return item.status;
        });
        let id = this.state.details.map(item => {
            return item.id;
       });
        var parms1 = {
            submitdata : true,
            details : details,
            id : id,
        }
        const url_params1 = setParams(parms1);
        const url1 = global.PATH + url_params1;
        console.log(url1);
        fetch(url1).then((response) => response.json())
        .then((responseJson) => {
            if(responseJson.result == 'success'){
                this.setState({modalVisible:false,status:0});
                ToastAndroid.show(
                    'Success',
                        ToastAndroid.SHORT,
                );
            }else{
                ToastAndroid.show(
                    'Scanning Failed',
                        ToastAndroid.SHORT,
                );
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
        if (this.state.loading) {
            return (
                <View style={{ flex: 1,justifyContent:'center',alignItems:'center',backgroundColor:'#FFE390' }}>
                    <ActivityIndicator size='small'  color='#404040'  />
                </View>
            );
        }
        
        return (               
            <View style={styles.page}>
                <StatusBar hidden />
                {/* <Header /> */}
                <LinearGradient 
                    colors={['#FFE390', '#FFFFFF']}
                    start={{ x: 0, y: 0 }} end={{ x: 0, y: 0.5 }}
                    style={{flex:1, flexDirection:'column',justifyContent:'center',}}
                >
                   <DetailsModal isVisible={this.state.modalVisible} closeModal={()=>this.setState({modalVisible:false})}>
                        <View style={{backgroundColor:'#FFC312',height:80,borderTopLeftRadius:20,alignItems:'center',justifyContent:'center',margin:5,borderTopRightRadius:20}}>
                            <Text style={[AppStyles.evenXLBold,{color:"#FFFFFF",textAlign:'center',textAlignVertical: 'bottom',borderColor:'#FFFFFF',borderWidth:1,paddingHorizontal:100,paddingVertical:20,borderTopRightRadius:20,borderTopLeftRadius:20 }]}>Ticket Data</Text>
                        </View> 
                        {/* <View
                            style={{
                            borderBottomColor: '#EEEEEE',
                            borderBottomWidth: 1,
                            borderStyle:'dashed'
                            }}
                        /> */}
                        <View style={{ height: 1, width: '100%', borderRadius: 5, borderWidth: 1, borderColor:'#EEEEEE', borderStyle: 'dashed', zIndex: 0, }}>
                            <View style={{ position: 'absolute', left: 0, bottom: 0, width: '100%', height: 1, backgroundColor: '#EEEEEE', zIndex: 1 }} />
                        </View>
                        <View style={{flexDirection:'row',flex:1,justifyContent:'space-evenly',paddingHorizontal:15,alignItems:'center',marginVertical:5}}>
                            <View style={{flex:0.7,}}>
                                <Text style={[AppStyles.evenLRegular,{color:"#B5B5B5",textAlign:'left',paddingVertical:5}]}>Reporting Time</Text>
                                <Text style={[AppStyles.evenLRegular,{color:this.state.color,textAlign:'left'}]}>{this.state.reportingtime}</Text>
                            </View>
                            <View style={{flex:0.3,}}>
                                <Text style={[AppStyles.evenLRegular,{color:"#B5B5B5",textAlign:'left',paddingVertical:5}]}>Amount</Text>
                                <Text style={[AppStyles.evenLRegular,{color:"#000000",textAlign:'left'}]}>{this.state.amount}</Text>
                            </View>
                        </View>
                        {/* <View style={{flexDirection:'row',flex:1,justifyContent:'space-evenly',paddingHorizontal:15,alignItems:'center',marginVertical:5}}>
                            <View style={{flex:0.5,}}>
                                <Text style={[AppStyles.evenLRegular,{color:"#B5B5B5",textAlign:'left',paddingVertical:5}]}>Booking Date</Text>
                                <Text style={[AppStyles.evenLRegular,{color:"#3D8627",textAlign:'left'}]}>{this.state.bookingdate}</Text>
                            </View>
                            <View style={{flex:0.5,}}>
                                <Text style={[AppStyles.evenLRegular,{color:"#B5B5B5",textAlign:'left',paddingVertical:5}]}>Amount</Text>
                                <Text style={[AppStyles.evenLRegular,{color:"#000000",textAlign:'left'}]}>{this.state.amount}</Text>
                            </View>
                        </View> */}
                        <Text style={[AppStyles.evenLRegular,{color:"#B5B5B5",textAlign:'left',paddingVertical:5,paddingHorizontal:15}]}>Number of piligrims ({this.state.details.length})</Text>
                        <FlatList
                        data={this.state.details}
                        showsVerticalScrollIndicator={false}
                        renderItem={
                            ({ item ,index}) =>
                            <View style={{backgroundColor:'#D3D3D3',height:60,margin:5,borderRadius:5,flexDirection:'row',flex:1}}>
                                <View style={{flex:0.7,paddingHorizontal:10,justifyContent:'center'}}>
                                    <Text style={[AppStyles.evenLBold,{color:"#404040",textAlign:'left',paddingVertical:2}]}>{item.name}</Text>
                                    <Text style={[AppStyles.evenSRegular,{color:"#3D8627",textAlign:'left',paddingVertical:2}]}>{item.ticket_no}</Text>
                                    <Text style={[AppStyles.evenSRegular,{color:"#3D8627",textAlign:'left'}]}>{item.mobile}</Text>
                                </View>
                                <View style={{flex:0.3,paddingHorizontal:10,justifyContent:'center'}}>
                                    {/* <TouchableOpacity style={[item.status == true ? styles.buttonStyle1 : styles.buttonStyle]} onPress={()=>this.ChangeValue(index,item.id)} >
                                        <Text style={[AppStyles.evenLRegular,{paddingHorizontal:10,color:"#ffffff"}]}>
                                        {item.status == true ?  'Check':'Uncheck'}
                                        </Text>
                                    </TouchableOpacity> */}
                                    <CheckBox
                                        onClick={()=>this.ChangeValue(index,item.id)}
                                        isChecked={item.status == true ? false : true}
                                        checkedCheckBoxColor={'#1F8A63'}
                                        uncheckedCheckBoxColor={'#EB5569'}
                                    />
                                </View>
                            </View> 
                            }
                        />
                        
                        <View style={{flexDirection:'row',alignItems:'center',marginHorizontal:2.5,justifyContent:'space-around',flex:1,marginVertical:10}}>
                            <TouchableOpacity style={[styles.buttonStyle,{flex:0.45,backgroundColor:'#1F8A63'}]} onPress={() => this.submitData()}>
                                <Text style={[AppStyles.evenLRegular,{paddingHorizontal:10,color:"#ffffff"}]}>
                                Submit</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={[styles.buttonStyle,{flex:0.45}]} onPress={() => this.setState({modalVisible:false})}>
                                <Text style={[AppStyles.evenLRegular,{paddingHorizontal:10,color:"#ffffff"}]}>
                                Close</Text>
                            </TouchableOpacity>
                        </View> 
                   </DetailsModal>
                    <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps='handled'>
                        <View style={{flexDirection:'row',alignItems:'center',justifyContent:'center',paddingTop:25}}>
                            <Image source={require('../../../images/temple.png')} style={{width: wp('10%'),height: hp('10%'),marginRight:10}} resizeMode='center' />
                            <Text style={[AppStyles.evenSBold,{color:"#000000",textAlign:'center',textAlignVertical: 'bottom', }]}>{`SRI RAJA RAJESHWARI\nSWAMY DEVASTHANAM`}</Text>
                        </View>
                        
                        {
                            this.state.status == 1 ?
                                <View style={{height:400,marginHorizontal:20,borderRadius:20,marginVertical:20}}>
                                    
                                    <QRscanner onRead={this.onRead} renderBottomView={this.bottomView} flashMode={this.state.flashMode} zoom={this.state.zoom} finderY={50} hintText={''} />
                                </View> 
                            : 
                                <View style={{backgroundColor:'#FFC312',height:400,marginHorizontal:20,borderRadius:20,marginVertical:20,alignItems:'center',justifyContent:'center'}}>
                                    <Text style={[AppStyles.evenXLBold,{color:"#FFFFFF",textAlign:'center',textAlignVertical: 'bottom', }]}>QR Scanner</Text>
                                </View> 
                        }
                        <View style={{flexDirection:'row',alignItems:'center',marginHorizontal:2.5,justifyContent:'space-around',flex:1}}>
                            <TouchableOpacity style={[styles.buttonStyle,{flex:0.45,backgroundColor:'#1F8A63',height:50}]} onPress={() => this.setState({status:1})}>
                                <Text style={[AppStyles.evenLRegular,{paddingHorizontal:10,color:"#ffffff"}]}>
                                Start</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={[styles.buttonStyle,{flex:0.45,height:50}]} onPress={() => this.setState({status:0})}>
                                <Text style={[AppStyles.evenLRegular,{paddingHorizontal:10,color:"#ffffff"}]}>
                                Stop</Text>
                            </TouchableOpacity>
                        </View>                
                    </ScrollView>
                </LinearGradient>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    page: {
        flex: 1,
    },
    container: {
      height: height*0.75,
      width : width-10,
      borderRadius:20,
      overflow: 'hidden',
    },
    buttonStyle:{
        flexDirection:'row',backgroundColor: '#EB5569',height:40,alignItems:'center',justifyContent:'center',borderRadius:20,
    },
    buttonStyle1:{
        flexDirection:'row',backgroundColor: '#1F8A63',height:40,alignItems:'center',justifyContent:'center',borderRadius:20,
    }
});