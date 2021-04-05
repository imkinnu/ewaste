import React from 'react';
import { View, Text, Dimensions, StyleSheet, Platform, ScrollView, ImageBackground, TouchableOpacity } from 'react-native';
import Modal from 'react-native-modal';
import AppStyles from './AppStyles';
import COLORS from './Colors';
import Fonts from './Fonts';
import {width, height} from './Constants';


export default class NotesModal extends React.Component{
  constructor(props){
    super(props);
    this.state = {
    }
    this.onSubmit = this.onSubmit.bind(this);
    this.onCloseModal = this.onCloseModal.bind(this);
  }


  onCloseModal(){
    this.props.closeModal();
  }

  onSubmit(){

  } 

  render(){
    const {isVisible,height=500} = this.props;

    return(
      <Modal
      isVisible={isVisible}
      deviceWidth={width}
      fixedHeight={true}
      onBackButtonPress={() => this.onCloseModal()}
      onBackdropPress={() => this.onCloseModal()}
      style={{marginHorizontal: 0, paddingHorizontal: 0}}
      backdropOpacity={0.7}
      animationIn="slideInUp"
      animationOut="slideOutDown">
        <View style={[styles.reportModal,{height}]}>
        <ScrollView>
          {
            this.props.children
          }

        </ScrollView>
      </View>

    </Modal>

    )
  }
}


const styles = StyleSheet.create({
    reportModal: {
        backgroundColor: '#fff',
        borderRadius: 20,
        margin: 20,
		flex:1,
      },
     
})