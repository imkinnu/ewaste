import React from 'react';
import { TextField } from 'react-native-material-textfield';
import {
    Platform, Button, StyleSheet, Text, View, Image,
} from 'react-native';
import {widthPercentageToDP as wp, heightPercentageToDP as hp,listenOrientationChange as loc,
removeOrientationListener as rol} from 'react-native-responsive-screen'; 

const EditText = (props) => {
    return (
        <View style={{marginHorizontal:wp('5%')}}>
            <TextField label={props.label}
                onChangeText={(text)=>props.changeText(text)}
                value={props.value}
                style={styles.name}
                textColor='#5b5b5b'
                tintColor='#5b5b5b'
                baseColor='#5b5b5b'
                maxLength={70}
                lineWidth={props.lineWidth}
                labelTextStyle={styles.labelTextStyle}
                titleTextStyle={styles.titleTextStyle}
                inputContainerPadding={0}
                autoCorrect={false}
                labelPadding={8}
            />
            <View style={{ borderBottomColor:props.linecolor, borderBottomWidth:props.line,marginBottom:props.bottomLine,marginTop:props.topLine }}></View>
        </View>
    );
};

const styles = StyleSheet.create({
    name: {
        fontSize: 14,
        ...Platform.select({
            ios: {
                fontFamily: 'Poppins-Medium',
            },
            android: {
                fontFamily: 'Poppins-Medium',
            },
        }),
    }, labelTextStyle: {
        fontSize: 10,
        ...Platform.select({
            ios: {
                fontFamily: 'Poppins-Medium',
            },
            android: {
                fontFamily: 'Poppins-Regular',
            },
        }),
    }, titleTextStyle: {
        fontSize: 0,
    },
});

export default EditText;