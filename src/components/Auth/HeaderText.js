import React from 'react';
import { Actions } from 'react-native-router-flux';
import {
    Platform, Button, StyleSheet, Text, View, TextInput, ScrollView, FlatList, NetInfo, TouchableOpacity,
    ToastAndroid, Alert, DatePickerAndroid, ActivityIndicator, AsyncStorage, Image, Dimensions
} from 'react-native';
import { setParams } from '../common/common';
import AppStyles from '../Styles/AppStyles'

export default class HeaderText extends React.Component {

    render() {
        console.disableYellowBox = true;
        return (
            <Text style={styles.LoginText}>{this.props.headerText}</Text>
        );
    }

}

const styles = StyleSheet.create({
    LoginText: {
        fontSize: 21,
        justifyContent: 'center',
        alignItems: 'stretch',
        color: '#ffffff',
        padding: 20,
        ...Platform.select({
            ios: {
                fontFamily: 'Poppins-Medium',
            },
            android: {
                fontFamily: 'Poppins-Medium',
            },
        }),
    },
});