import React from 'react';
import { Actions } from 'react-native-router-flux';
import {
    AsyncStorage, StyleSheet, Text, View, ScrollView,  TouchableOpacity,
    ToastAndroid, ImageBackground,StatusBar, ActivityIndicator, KeyboardAvoidingView, Image, Dimensions,PermissionsAndroid
} from 'react-native';
import { setParams } from '../common/common';
import { TextField } from 'react-native-material-textfield';
import Header from './Header';
import DetailsModal from "../common/DetailsModal";
import {widthPercentageToDP as wp, heightPercentageToDP as hp,listenOrientationChange as loc,
removeOrientationListener as rol} from 'react-native-responsive-screen'; 
import { Dropdown as MaterialDropdown } from 'react-native-material-dropdown';
import AppStyles from '../common/AppStyles';
import Textarea from 'react-native-textarea';
import RNFetchBlob from 'rn-fetch-blob';
import ImagePicker from 'react-native-image-picker';
import RadioForm, {RadioButton, RadioButtonInput, RadioButtonLabel} from 'react-native-simple-radio-button';
import CheckBox from 'react-native-check-box'
import BottomSheet from 'react-native-bottomsheet-reanimated';
import Geolocation from 'react-native-geolocation-service';
import Pending from './Pending'
import DatePicker from 'react-native-datepicker'
import getDirections from 'react-native-google-maps-directions';

const {width,height} = Dimensions.get('window');

var options = {
    title: 'Select Photo',
    customButtons: [{ name: 'Product', title: 'Remove Photo' }],
    maxWidth:600,
    maxHeight:600,
    quality:0.5,
    mediaType:'photo',
    allowsEditing:true,
    storageOptions: {
        cameraRoll: true,
        waitUntilSaved: true,
      skipBackup: true,
      path: 'images'
    }
  }; 

export default class HomeScreen extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            loading: false,
            userlevel:'',
            uid:'',
            name: '',
            data : [],
            token:'',
            username:'',
            heading:'',
            category:'',
            subcategory:'',
            description:'',
            isChecked:false,
            cod:'',
            ecs:'',
            radio:'',
            catg:[],
            scatg:[],
            image : '',   
            imageLoading : false,  
            avatarSource : ['','','','','',''],
            images : '' ,
            ImageStatus : false,
            modalVisible: false,
            imodalVisible: false,
            modaldata:[],
            modalimage:'',
            categoryError:'',
            subcategoryError:'',
            qError:'',
            wError:'',
            descriptionError:'',
            quantity:'',
            weight:'',
            imageEmpty:false,
            imageError:'Upload Atleaset One Image',
            vendorData:[],
            isBottom:0,
            landmark:'',
            landmarkError:'Enter Landmark',
            address:'',
            addressError:'Enter Address',
            lat: '0.00',
            lon : '0.00',
            adstatus:0,
            condition:'',
            conditionError:'',
            date:'',
            offer_price:''

        }
    }
    UNSAFE_componentWillMount (){
        rol();
        
    }
    componentWillReceiveProps(props){
        // console.log(props);
        this.setState({loading:true})
        this.GetCategory();
    }
    
    async componentDidMount() { 
        loc(this); 
        const username=  await AsyncStorage.getItem('username')
        const userlevel=  await AsyncStorage.getItem('userlevel')
        const uid=  await AsyncStorage.getItem('uid')
        this.setState({ username: username,loading:true,userlevel:userlevel,uid:uid });
        if(this.state.userlevel == 1){
            this.GetCategory();
        }else{
            this.viewProfile();
        }
        var that =this;
        async function requestLocationPermission() {
            try {
                const granted = await PermissionsAndroid.request(
                PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,{
                    'title': 'Location Access Required',
                    'message': 'This App needs to Access your location'
                }
                )
                if (granted === PermissionsAndroid.RESULTS.GRANTED) {
                that.callLocation(that);
                } else {
                alert("Permission Denied");
                }
            } catch (err) {
                console.warn(err)
            }
        }
        requestLocationPermission();
        
        
    }
    callLocation(that){
        Geolocation.getCurrentPosition(
          (position) => {
                this.setState({
                    lat:position.coords.latitude,
                    lon:position.coords.longitude
                })                
                global.LAT = position.coords.latitude;            
                global.LON = position.coords.longitude;
          },
          (error) => {
              alert(error.message);
          },
          { enableHighAccuracy: true, timeout: 5000, maximumAge: 10000 }
        );
        that.watchID = Geolocation.watchPosition((position) => {
          console.log('position changed',position);
            this.setState({
                lat:position.coords.latitude,
                lon:position.coords.longitude,
            })            
        },
          (error) => {
            console.log(error.message);
          },
          { enableHighAccuracy: true, distanceFilter: 1 }
        );
    }
    setiModalVisible(modalimage) {
        this.setState({imodalVisible: true,modalimage:modalimage});
    }
    //Get Vendor Profile Data
    viewProfile = () =>{ 
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
                type : 'buyyer',
                viewProfile:1,
                uid:this.state.uid
            })
        }).then((response) => response.json())
        .then((responseJson) => {
            if(responseJson.result == "success"){
                this.setState({loading:false,vendorData:responseJson})
            }
        }).catch((error) => {
            ToastAndroid.show(
                'Failed',
                    ToastAndroid.SHORT,
            );
            console.error(error);
        });
    }
    //Get Category Data
    GetCategory = () =>{ 
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
                type : 'seller',
                category:1,
                latitude:this.state.lat,
                longitude:this.state.lon,
                username:this.state.username
            })
        }).then((response) => response.json())
        .then((responseJson) => {
            if(responseJson.result == "success"){
                if(responseJson.status == 0)
                    this.setState({loading:false,catg:responseJson.itemCategory,address:responseJson.address,landmark:responseJson.landmark,adstatus:responseJson.status,lat:responseJson.latitude,lon:responseJson.longitude})
                else
                    this.setState({loading:false,catg:responseJson.itemCategory,address:'',landmark:'',adstatus:responseJson.status,lat:responseJson.latitude,lon:responseJson.longitude})

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
    GetSubcatg=()=>{
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
                type : 'seller',
                subcategory:1,
                cid:this.state.category
            })
        }).then((response) => response.json())
        .then((responseJson) => {
            if(responseJson.result == "success"){
                this.setState({loading:false,scatg:responseJson.subItemCategory})
            }
        }).catch((error) => {
            ToastAndroid.show(
                'Failed',
                    ToastAndroid.SHORT,
            );
            console.error(error);
        });
    }
    //Upload Image
    showImage =(val) =>{
        const newArray  = [...this.state.avatarSource]
        this.setState({
            ImageStatus:false
        });
        ImagePicker.launchCamera(options, (response) => {
            // console.log('Response = ', response);
          
            if (response.didCancel) {
                // this.props.navigation.goBack();
            }
            else if (response.error) {
            //   console.log('ImagePicker Error: ', response.error);
            }
            else if (response.customButton) {
              this.setState({ imageLoading: true });
              let source = { uri: response.uri };
              this.setState({image:'', imageLoading: false ,avatarSource: newArray});
            }
            else {
                let source = { uri: response.uri };
                this.setState({ imageLoading: true,image: response.uri}); 
                this.setState({
                    avatarSource: newArray,ImageStatus:true
                });          
                var params = { 
                    uploadFile: true,
                    filename: response.fileName
                };
                const urlParams = setParams(params);
                const url = global.IMAGE_PATH + urlParams;
                RNFetchBlob.fetch('POST',url, {
                    Authorization : "Bearer access-token",
                    otherHeader : "foo",
                    'Content-Type' : 'multipart/form-data',
                  }, [
                    { name : 'image', filename : 'image.jpg',type:'image/jpg', data: response.data},
                  ]).uploadProgress((written, total) => {
                    this.setState({imageprogress: written / total });
                    })
                     .then((response) => response.json())
                      .then(res => {
                        if (res.result == 'success') {
                            ToastAndroid.show(
                                'Image Uploaded',
                                    ToastAndroid.SHORT,
                            );                            
                           
                            newArray[val] = res.filepath;
                            // console.log("Res Path",res.filepath)
                           this.setState({avatarSource:newArray});
                            this.setState({image:res.filename, imageLoading: false });
                        } else{
                            ToastAndroid.show(
                                'Image Upload Failed',
                                    ToastAndroid.SHORT,
                            );
                            this.setState({ imageLoading: false });
                        }
                  })
                }
        });
    }
    GetQuote=()=>{
        let errorcount = 0;
        if(this.state.category === ''){
            this.scroll.scrollTo({x: 0, y: 0, animated: true});
            this.setState({categoryError: 'Please Select Category *',errorColor: '#000000'})
            errorcount++;
        }if(this.state.subcategory === ''){
            this.scroll.scrollTo({x: 0, y: 0, animated: true});
            this.setState({subcategoryError: 'Please Select Sub Category *',errorColor: '#000000'})
            errorcount++;
        }if(this.state.quantity === '' && this.state.weight === ''){
            this.setState({qError: 'Please Enter Qty *',wError: 'Please Enter Weight *',errorColor: '#000000'})
            errorcount++;
        }if(this.state.description === ''){
            this.setState({descriptionError: 'Please Enter Product Description *',errorColor: '#000000'})
            errorcount++;
        }
        let image_empty = 0;
        if(this.state.avatarSource.length > 0){
            this.state.avatarSource.map((rowdata,index) => {
                if(rowdata[index] == "" || rowdata[index] == undefined){                   
                    image_empty++;                    
                }
            });
        }
        if(image_empty == 6){
            errorcount++;
            this.setState({imageError: 'Please Upload Atleast One Image *',errorColor: '#000000'})
        }
        if(errorcount == 0){
            this.setState({isBottom:1})
        }
    }
    SubmitData=()=>{
        let errorcount = 0;
        if(this.state.address === ''){
            this.setState({addressError: 'Please Enter Address *',errorColor: '#000000'})
            errorcount++;
        }
        if(this.state.landmark === ''){
            this.setState({landmarkError: 'Please Enter Landmark *',errorColor: '#000000'})
            errorcount++;
        }
        if(errorcount == 0){
            this.setState({loading:true})
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
                    type : 'seller',
                    postitem:1,
                    cat:this.state.category,                    
                    subcat:this.state.subcategory,                    
                    product_description:this.state.description,                    
                    quantity:this.state.quantity,                    
                    weight:this.state.weight,                    
                    images:this.state.avatarSource,
                    uid:this.state.username,
                    latitude:this.state.lat,
                    longitude:this.state.lon,
                    condition:this.state.condition,
                    date:this.state.date,
                    offer_price:this.state.offer_price
                })
            }).then((response) => response.json())
            .then((responseJson) => {
                if(responseJson.result == "success"){
                    ToastAndroid.show(
                        responseJson.msg,
                            ToastAndroid.SHORT,
                    );
                    this.setState({loading:false,category:'',subcategory:'',avatarSource:[],description:'',quantity:'',weight:'',isBottom:0})
                    this.GetCategory();
                }else{
                    ToastAndroid.show(
                        responseJson.msg,
                            ToastAndroid.SHORT,
                    );
                    this.setState({loading:false})
                }
            }).catch((error) => {
                ToastAndroid.show(
                    'Error Calling ',
                        ToastAndroid.SHORT,
                );
                this.setState({loading:false})
                console.error(error);
            });
        }
    }
    //Get Date
    getMinDate(){
        let newDate = new Date()
        let date = newDate.getDate();
        let month = newDate.getMonth() + 1;
        let year = newDate.getFullYear();
        //  alert(`${date<10?`0${date}`:`${date}`}-${month<10?`0${month}`:`${month}`}-${year}`);
        
        return `${date<10?`0${date}`:`${date}`}-${month<10?`0${month}`:`${month}`}-${year}`
    }
    render() {
        console.disableYellowBox = true;
        if (this.state.loading) {
            return (
                <View style={{ flex: 1,justifyContent:'center',alignItems:'center',backgroundColor:'#EEEEEE'}}>
                    <View style={{height:100,width:100,backgroundColor:'#FFFFFF',borderRadius:10,justifyContent:'center',elevation:2}}>
                        <ActivityIndicator size="small" color='#338995' />
                    </View>
                </View>
            );
        }
          var radio_props = [
            {label: 'Cash on Delivery', value: 'cod'},
            {label: 'ECS Vouchers', value: 'ECS' },
            {label: 'Other Vouchers', value: 'other' }
          ];

          var condition = [
            {label: 'Working', value: 'Working'},
            {label: 'Not Working', value: 'Not Working' }
          ];
        
        
        return (               
            <View style={{flex:1}}>
                <StatusBar hidden />
                <ImageBackground source={require('../../../images/Background_3.png')} style={{flex:1,width,height}}>
                    <DetailsModal isVisible={this.state.imodalVisible} closeModal={()=>this.setState({imodalVisible:false})}>
                        <Image style={{width:width-40,height:height-180,flex:1,borderRadius:10}} source={{uri:this.state.modalimage}} resizeMode='stretch'/>
                        <View style={{flexDirection:'row',justifyContent:'space-around',marginHorizontal:20,marginVertical:hp('2%')}}>
                            <TouchableOpacity style={{backgroundColor: '#338995',height:45,alignItems:'center',justifyContent:'center',borderRadius:5,paddingHorizontal:10}} onPress={() =>this.setState({imodalVisible:false})}>
                                <Text style={[AppStyles.evenLRegular,{paddingHorizontal:10,color:"#ffffff",fontSize:hp('3%')}]}>
                                Close</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={{backgroundColor: '#EB4D4B',height:45,alignItems:'center',justifyContent:'center',borderRadius:5,paddingHorizontal:10}} onPress={() =>this.setState({imodalVisible:false})}>
                                <Text style={[AppStyles.evenLRegular,{paddingHorizontal:10,color:"#ffffff",fontSize:hp('3%')}]}>
                                Remove</Text>
                            </TouchableOpacity>
                        </View>
                    </DetailsModal>
                    
                        {
                            this.state.userlevel == 1 &&
                            <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps='handled' ref={(c) => {this.scroll = c}} >
                        
                                <View style={styles.page}>                             
                                    
                                    <MaterialDropdown
                                        label='Select Category' 
                                        value={this.state.category}
                                        error={this.state.categoryError}
                                        itemTextStyle={[AppStyles.evenLRegular]}
                                        labelTextStyle={[AppStyles.evenLRegular,{justifyContent:'center'}]}
                                        titleTextStyle={[AppStyles.evenSRegular,{color:'#000000'}]}
                                        style={[AppStyles.evenLRegular,{color:'#000000'}]}
                                        data={this.state.catg}
                                        textColor='#000000'
                                        tintColor='#000000'
                                        baseColor='#000000'
                                        itemCount={4}
                                        overlayStyle={{top:85}}
                                        dropdownPosition={1}
                                        ref={"category"}
                                        errorColor={'#000000'}
                                        onChangeText={(value) => {this.setState({category:value,loading:true}),this.GetSubcatg()}}
                                    />
                                    <MaterialDropdown
                                        label='Select Sub Category' 
                                        value={this.state.subcategory}
                                        error={this.state.subcategoryError}
                                        itemTextStyle={[AppStyles.evenLRegular]}
                                        labelTextStyle={[AppStyles.evenLRegular,{justifyContent:'center'}]}
                                        titleTextStyle={[AppStyles.evenSRegular,{color:'#000000'}]}
                                        style={[AppStyles.evenLRegular,{color:'#000000'}]}
                                        data={this.state.scatg}
                                        textColor='#000000'
                                        tintColor='#000000'
                                        baseColor='#000000'
                                        itemCount={4}
                                        overlayStyle={{top:85}}
                                        dropdownPosition={1}
                                        errorColor={'#000000'}
                                        ref={"subcategory"}
                                        onChangeText={(value) => {this.setState({subcategory:value})}}
                                    />
                                    <View style={{flexDirection:'row',justifyContent:'space-between',paddingTop:15}}>
                                        <Text style={{...AppStyles.evenLBold}}>Add Photos</Text>
                                    
                                        <Image source={require('../../../images/add.png')} style={{width:30,height:30,overflow: 'hidden'}} resizeMode='contain' />
                                    </View>
                                    <View style={{flexDirection:'row',justifyContent:'space-between',paddingTop:15}}>
                                        {
                                            this.state.avatarSource[0] == '' ?    
                                            <TouchableOpacity style={{...styles.camera}} onPress={()=>this.showImage(0)}>
                                                <Image source={require('../../../images/capture.png')} style={{width:30,height:30,overflow: 'hidden',}} resizeMode='contain' />
                                            </TouchableOpacity>
                                                
                                                :
                                            <TouchableOpacity style={{...styles.camera1}} onPress={() => this.setiModalVisible(this.state.avatarSource[0])}>
                                                <Image source={{uri:this.state.avatarSource[0]}} style={{flex:1 , width:30,height:30,borderRadius:5,borderColor:'#C4C4C4',borderWidth:1}} resizeMode='cover' />
                                            </TouchableOpacity>
                                        }
                                    
                                        {
                                            this.state.avatarSource[1] == '' ?    
                                            <TouchableOpacity style={{...styles.camera}} onPress={()=>this.showImage(1)}>
                                                <Image source={require('../../../images/capture.png')} style={{width:30,height:30,overflow: 'hidden'}} resizeMode='contain' />
                                            </TouchableOpacity>
                                                
                                                :
                                            <TouchableOpacity style={{...styles.camera1}} onPress={() => this.setiModalVisible(this.state.avatarSource[1])}>
                                                <Image source={{uri:this.state.avatarSource[1]}} style={{flex:1 , width:30,height:30,borderRadius:5,borderColor:'#C4C4C4',borderWidth:1}} resizeMode='cover' />
                                            </TouchableOpacity>
                                        }
                                        {
                                            this.state.avatarSource[2] == '' ?    
                                            <TouchableOpacity style={{...styles.camera}} onPress={()=>this.showImage(2)}>
                                                <Image source={require('../../../images/capture.png')} style={{width:30,height:30,overflow: 'hidden'}} resizeMode='contain' />
                                            </TouchableOpacity>
                                                
                                                :
                                            <TouchableOpacity style={{...styles.camera1}} onPress={() => this.setiModalVisible(this.state.avatarSource[2])}>
                                                <Image source={{uri:this.state.avatarSource[2]}} style={{flex:1 , width:30,height:30,borderRadius:5,borderColor:'#C4C4C4',borderWidth:1}} resizeMode='cover' />
                                            </TouchableOpacity>
                                        }
                                    
                                        {
                                            this.state.avatarSource[3] == '' ?    
                                            <TouchableOpacity style={{...styles.camera}} onPress={()=>this.showImage(3)}>
                                                <Image source={require('../../../images/capture.png')} style={{width:30,height:30,overflow: 'hidden'}} resizeMode='contain' />
                                            </TouchableOpacity>
                                                
                                                :
                                            <TouchableOpacity style={{...styles.camera1}} onPress={() => this.setiModalVisible(this.state.avatarSource[3])}>
                                                <Image source={{uri:this.state.avatarSource[0]}} style={{flex:1 , width:30,height:30,borderRadius:5,borderColor:'#C4C4C4',borderWidth:1}} resizeMode='cover' />
                                            </TouchableOpacity>
                                        }
                                        {
                                            this.state.avatarSource[4] == '' ?    
                                            <TouchableOpacity style={{...styles.camera}} onPress={()=>this.showImage(4)}>
                                                <Image source={require('../../../images/capture.png')} style={{width:30,height:30,overflow: 'hidden'}} resizeMode='contain' />
                                            </TouchableOpacity>
                                                
                                                :
                                            <TouchableOpacity style={{...styles.camera1}} onPress={() => this.setiModalVisible(this.state.avatarSource[4])}>
                                                <Image source={{uri:this.state.avatarSource[4]}} style={{flex:1 , width:30,height:30,borderRadius:5,borderColor:'#C4C4C4',borderWidth:1}} resizeMode='cover' />
                                            </TouchableOpacity>
                                        }
                                        {
                                            this.state.avatarSource[5] == '' ?    
                                            <TouchableOpacity style={{...styles.camera}} onPress={()=>this.showImage(5)}>
                                                <Image source={require('../../../images/capture.png')} style={{width:30,height:30,overflow: 'hidden'}} resizeMode='contain' />
                                            </TouchableOpacity>                                            
                                                :
                                            <TouchableOpacity style={{...styles.camera1}} onPress={() => this.setiModalVisible(this.state.avatarSource[5])}>
                                                <Image source={{uri:this.state.avatarSource[5]}} style={{flex:1 , width:30,height:30,borderRadius:5,borderColor:'#C4C4C4',borderWidth:1}} resizeMode='cover' />
                                            </TouchableOpacity>
                                        }
                                    </View>
                                    <Text style={{...AppStyles.evenSRegular,paddingLeft:5}}>{this.state.imageError}</Text>
                                    <View style={{flexDirection:'column',justifyContent:'space-between'}}>
                                        <Text style={{...AppStyles.evenLBold,paddingVertical:10}}>Product Description</Text>
                                        <Textarea
                                            containerStyle={styles.textareaContainer}
                                            value={this.state.description}
                                            style={{...styles.textarea,...AppStyles.evenLRegular}}
                                            onChangeText={(description) => this.setState({ description })}
                                            defaultValue={this.state.description}
                                            maxLength={150}
                                            ref={"description"}
                                            placeholderTextColor={'#D3D3D3'}
                                            underlineColorAndroid={'transparent'}
                                            autoCorrect={false}
                                        />
                                        <Text style={{...AppStyles.evenSRegular,paddingLeft:5}}>{this.state.descriptionError}</Text>
                                    </View>
                                    <View style={{flexDirection:'row',justifyContent:'space-between',alignItems:'center'}}>
                                        <View style={{width:width/3}}>
                                            <TextField label='Quantity'
                                                value={this.state.quantity}
                                                onChangeText={(quantity) => this.setState({ quantity })}
                                                error={this.state.qError}
                                                style={[AppStyles.evenLRegular,{color:'#000000'}]}
                                                titleTextStyle={[AppStyles.evenSRegular]}
                                                keyboardType='numeric'
                                                returnKeyType="next"
                                                textColor='#000000'
                                                tintColor='#000000'
                                                baseColor='#000000'
                                                labelTextStyle={AppStyles.evenLRegular}
                                                errorColor={'#000000'}
                                                autoCorrect={false}
                                                ref={"quantity"}
                                                blurOnSubmit={false}
                                                autoCapitalize = 'none'
                                                onSubmitEditing={() => { this.refs.weight.focus(); }}
                                            />
                                        </View>
                                        <Text style={{...AppStyles.evenLBold,textAlign:'center',paddingTop:20}}>OR</Text>
                                        <View style={{width:width/3}}>
                                            <TextField label='Weight (Kgs)'
                                                value={this.state.weight}
                                                onChangeText={(weight) => this.setState({ weight })}
                                                error={this.state.wError}
                                                style={[AppStyles.evenLRegular,{color:'#000000'}]}
                                                titleTextStyle={[AppStyles.evenSRegular]}
                                                keyboardType='numeric'
                                                returnKeyType="next"
                                                textColor='#000000'
                                                tintColor='#000000'
                                                baseColor='#000000'
                                                labelTextStyle={AppStyles.evenLRegular}
                                                errorColor={'#000000'}
                                                autoCorrect={false}
                                                ref={"weight"}
                                                autoCapitalize = 'none'
                                            />
                                        </View>
                                    </View>
                                    <View style={{paddingBottom:10}}>
                                        <DatePicker
                                            style={{width:width-20}}
                                            date={this.state.date}
                                            mode="date"
                                            androidMode="calendar"
                                            placeholder="Manufactured Date"
                                            placeholderTextStyle={[AppStyles.evenLRegular]}
                                            format="DD-MM-YYYY"
                                            // minDate={this.getMinDate()}
                                            maxDate={this.getMinDate()}
                                            textColor='#000000'
                                            tintColor='#000000'
                                            baseColor='#000000'
                                            confirmBtnText="Confirm"
                                            cancelBtnText="Cancel"
                                            showIcon={false}
                                            errorColor={'#000000'}
                                            customStyles={{
                                            dateInput: {
                                                marginLeft: 0,
                                                marginTop:30,
                                                borderWidth: 0,
                                                borderBottomWidth: 1,
                                                alignItems: "flex-start",
                                                borderBottomColor:'#1B1B1B'
                                            },placeholderText: 
                                                AppStyles.DatePicker
                                            ,
                                                dateText: 
                                                AppStyles.DatePicker
                                            }}
                                            onDateChange={(date) => {this.setState({date: date})}}
                                        />
                                    </View>
                                    <MaterialDropdown
                                        label='Condition' 
                                        value={this.state.condition}
                                        error={this.state.conditionError}
                                        itemTextStyle={[AppStyles.evenLRegular]}
                                        labelTextStyle={[AppStyles.evenLRegular,{justifyContent:'center'}]}
                                        titleTextStyle={[AppStyles.evenSRegular,{color:'#000000'}]}
                                        style={[AppStyles.evenLRegular,{color:'#000000'}]}
                                        data={condition}
                                        textColor='#000000'
                                        tintColor='#000000'
                                        baseColor='#000000'
                                        itemCount={4}
                                        overlayStyle={{top:80}}
                                        dropdownPosition={1}
                                        ref={"condition"}
                                        errorColor={'#000000'}
                                        onChangeText={(value) => {this.setState({condition:value})}}
                                    />
                                    <TextField label='Offer Price'
                                        value={this.state.offer_price}
                                        onChangeText={(offer_price) => this.setState({ offer_price })}
                                        error={this.state.offer_priceError}
                                        style={[AppStyles.evenLRegular,{color:'#000000'}]}
                                        titleTextStyle={[AppStyles.evenSRegular]}
                                        keyboardType='numeric'
                                        returnKeyType="go"
                                        textColor='#000000'
                                        tintColor='#000000'
                                        baseColor='#000000'
                                        labelTextStyle={AppStyles.evenLRegular}
                                        errorColor={'#000000'}
                                        autoCorrect={false}
                                        ref={"offer_price"}
                                        autoCapitalize = 'none'
                                    />
                                    <CheckBox
                                        style={{flex: 1, paddingVertical: 10}}
                                        onClick={()=>{
                                        this.setState({
                                            isChecked:!this.state.isChecked
                                        })
                                        }}
                                        isChecked={this.state.isChecked}
                                        rightText={"Save this item for reuse"}
                                        rightTextStyle={{...AppStyles.evenLBold}}
                                    />
                                    {/* <Text style={{...AppStyles.evenLBold,paddingVertical:5}}>Rewards</Text>
                                    <View style={{height:120,borderRadius:20,borderColor:'#000000',borderWidth:1,justifyContent:'center',paddingHorizontal:10,flex:1,justifyContent:'space-around'}}>
                                    <RadioForm
                                        formHorizontal={false}
                                        animation={true}
                                        >
                                        
                                        {
                                            radio_props.map((obj, i) => (
                                            <RadioButton labelHorizontal={true} key={i} >
                                            
                                                <RadioButtonInput
                                                obj={obj}
                                                index={i}
                                                initial={0}
                                                isSelected={this.state.radio === i}
                                                onPress={(value) => {this.setState({radio:value})}}
                                                borderWidth={1}
                                                buttonInnerColor={'#000000'}
                                                buttonOuterColor={this.state.radio === i ? '#000000' : '#000000'}
                                                buttonSize={6}
                                                buttonOuterSize={18}
                                                buttonStyle={{}}
                                                />
                                                <RadioButtonLabel
                                                obj={obj}
                                                index={i}
                                                labelHorizontal={true}
                                                onPress={(value) => {this.setState({radio:value})}}
                                                labelStyle={[AppStyles.evenLBold]}
                                                labelWrapStyle={[AppStyles.evenLBold]}
                                                />
                                            </RadioButton>
                                            ))
                                        }  
                                        </RadioForm>
                                    </View> */}
                                    
                                    <View style={{flexDirection:'row',alignItems:'center',justifyContent:'center',marginTop:0}}>
                                        <TouchableOpacity style={{height:50,alignItems:'center',justifyContent:'center',backgroundColor:'#0072bb',width:180,borderRadius:20}} onPress={()=>this.GetQuote()} >
                                            <Text style={[AppStyles.evenLBold,{paddingHorizontal:10,color:"#ffffff"}]}>
                                            Submit Post</Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            </ScrollView>
                        }
                        {
                            this.state.userlevel == 2 && 
                                <Pending/>
                        }
                        {
                            this.state.isBottom == 1  && 
                            
                                <BottomSheet
                                    bottomSheerColor="#FFFFFF"
                                    ref="BottomSheet"
                                    initialPosition={'85%'} //200, 300
                                    snapPoints={['50%', '100%']}
                                    isBackDrop={true}
                                    isBackDropDismissByPress={false}
                                    isRoundBorderWithTipHeader={true}
                                    // backDropColor="red"
                                    // isModal
                                    // containerStyle={{backgroundColor:"red"}}
                                    // tipStyle={{backgroundColor:"red"}}
                                    // headerStyle={{backgroundColor:"red"}}
                                    bodyStyle={{flex:1}}
                                    header={
                                        <View>
                                            <View style={{flexDirection:'row',justifyContent:'flex-end'}}>
                                                <TouchableOpacity onPress={()=>this.setState({isBottom:0})}>
                                                    <Image source={require('../../../images/cross.png')} style={{width:25,height:25,paddingLeft:50}} resizeMode='contain' />
                                                </TouchableOpacity>
                                            </View>
                                            <View style={{flexDirection:'row',justifyContent:'center'}}>
                                                <Text style={{...AppStyles.evenXLRegular}}>Address</Text>
                                            </View>
                                        </View>
                                        
                                    }
                                    body={
                                        <View style={{marginHorizontal:10}} >
                                            <View style={{flexDirection:'column',justifyContent:'space-between'}}>
                                            <Text style={{...AppStyles.evenLRegular,paddingVertical:5,color:'#000000'}}>Address</Text>
                                            <Textarea
                                                containerStyle={styles.textareaContainer}
                                                value={this.state.address}
                                                style={{...styles.textarea,...AppStyles.evenLRegular}}
                                                onChangeText={(address) => this.setState({ address })}
                                                maxLength={150}
                                                ref={"address"}
                                                placeholderTextColor={'#D3D3D3'}
                                                underlineColorAndroid={'transparent'}
                                                autoCorrect={false}
                                            />
                                            <Text style={{...AppStyles.evenSRegular,paddingLeft:5,color:'#000000'}}>{this.state.addressError}</Text>
                                        </View>  
                                        <TextField label='Landmark'
                                            value={this.state.landmark}
                                            onChangeText={(landmark) => this.setState({ landmark })}
                                            error={this.state.landmarkError}
                                            style={[AppStyles.evenLRegular,{color:'#000000'}]}
                                            titleTextStyle={[AppStyles.evenSRegular]}
                                            keyboardType='default'
                                            returnKeyType="go"
                                            textColor='#000000'
                                            tintColor='#000000'
                                            baseColor='#000000'
                                            labelTextStyle={AppStyles.evenLRegular}
                                            errorColor={'#000000'}
                                            autoCorrect={false}
                                            ref={"landmark"}
                                            autoCapitalize = 'none'
                                        /> 
                                        <View style={{flexDirection:'row',alignItems:'center',justifyContent:'center',marginTop:10}}>
                                            <TouchableOpacity style={{height:50,alignItems:'center',justifyContent:'center',backgroundColor:'#338995',width:180,borderRadius:20}} onPress={()=>this.SubmitData()} >
                                                <Text style={[AppStyles.evenLBold,{paddingHorizontal:10,color:"#ffffff"}]}>
                                                Submit</Text>
                                            </TouchableOpacity>
                                        </View>
                                    </View>
                                    }
                                />
                        }
                    {/* </ScrollView> */}
                </ImageBackground>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    page: {
        flex: 1,
        // backgroundColor:'#FFFFFF',
        justifyContent:'flex-start',
        paddingHorizontal:10,
        paddingVertical:5
    },
    textareaContainer: {
      height: 80,
      padding: 5,
      backgroundColor: '#FFF',
      borderRadius:10,
      borderColor:'#000',
      borderWidth:1
    },textarea: {
        textAlignVertical: 'top', 
        height: 150,
        letterSpacing: 0.3,
        paddingTop:1,
    },camera :{
        flex:0.16,backgroundColor:'#F6F6F6',borderRadius:5,borderWidth:1,height:50,borderColor:'#C4C4C4',justifyContent:'center',alignItems:'center'
    },camera1 :{
        flex:0.16,height:50
    }
});