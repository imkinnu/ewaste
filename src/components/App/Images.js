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
import {
    widthPercentageToDP as wp, heightPercentageToDP as hp, listenOrientationChange as loc,
    removeOrientationListener as rol
} from 'react-native-responsive-screen';
import AppStyles from '../common/AppStyles';
import Textarea from 'react-native-textarea';

const { width, height } = Dimensions.get('window');

export default class Images extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            loading: false,
            name: '',
            pageindex: 0
        }

    }
    handleOnScroll(event) {
        //calculate screenIndex by contentOffset and screen width
        let pageindex = parseInt(event.nativeEvent.contentOffset.x / Dimensions.get('window').width);
        this.setState({ pageindex: pageindex })
    }


    render() {
        console.disableYellowBox = true;
        const data = this.props.data;
        if (this.state.loading) {
            return (
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#EEEEEE' }}>
                    <View style={{ height: 100, width: 100, backgroundColor: '#FFFFFF', borderRadius: 10, justifyContent: 'center', elevation: 2 }}>
                        <ActivityIndicator size="small" color='#338995' />
                    </View>
                </View>
            );
        }
        return (
            <View style={{ flex: 1 }}>
                <StatusBar hidden />
                {/* <View style={{paddingTop:15}}> */}

                <ScrollView
                    style={{ flex: 1 }}
                    horizontal={true}
                    pagingEnabled={true}
                    onScroll={(e) => this.handleOnScroll(e)}
                    showsHorizontalScrollIndicator={false}
                    scrollEventThrottle={5}
                >
                    {

                        data.map((rowdata, index) => {
                            return (

                                <Image source={{ uri: rowdata }} style={{ width: width, height: height }} resizeMode='cover' />

                            );
                        })
                    }
                </ScrollView>
                <View style={styles.paginationWrapper}>
                    {data.map((key, index) => (
                        <View style={this.state.pageindex == index ? styles.paginationDots1 : styles.paginationDots} key={index} />
                    ))}
                </View>

                {/* </View>      */}
            </View>
        );
    }
}

const styles = StyleSheet.create({
    page: {
        flex: 1,
        // backgroundColor:'#FFFFFF',
    },
    paginationWrapper: {
        bottom: 30,
        left: 0,
        right: 0,
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'row',
    },
    paginationDots: {
        height: 5,
        width: 25,
        borderRadius: 10 / 2,
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: '#2680eb',
        marginLeft: 10,
    },
    paginationDots1: {
        height: 5,
        width: 25,
        borderRadius: 10 / 2,
        backgroundColor: '#2680eb',
        borderWidth: 1,
        borderColor: '#2680eb',
        marginLeft: 10,
    }
});