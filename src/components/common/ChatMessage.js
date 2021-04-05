import React from 'react';
import { View, StyleSheet, Dimensions, Platform, Text,Image,TouchableOpacity} from 'react-native';
import PropTypes from 'prop-types';
const { width,height } = Dimensions.get('window');

const ChatMessage = props => {
  const { message, createdAt, avatar,onPress,image } = props;
  return (
    <View style={styles.page}>
     
        <View style={styles.userFullMessage} >
            <Text style={styles.avatarText}>{avatar}</Text>
            <Text style={styles.userMessageText}>{message}</Text>
            <View style={{flex:1,flexDirection:'row'}}>
            <Text style={styles.timeText}>{createdAt}</Text>
            {
              image != "" && 
              <TouchableOpacity onPress={onPress}>
                <Image style={{width:20,height:20}} source={image} resizeMode='contain'/>
              </TouchableOpacity>
            }
            </View>
        </View>
    </View>
  );
};

export default ChatMessage;

ChatMessage.defaultProps = {
  message: '',
};

ChatMessage.propTypes = {
  message: PropTypes.string,
  createdAt: PropTypes.string.isRequired,
  avatar: PropTypes.shape().isRequired,
};

const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    justifyContent: 'center',
    marginVertical: 10,
  },
  userFullMessage: {
    flexDirection: 'column',
    justifyContent: 'flex-start',
    alignItems:'flex-end',
    marginHorizontal: 20,
    padding:10,
    backgroundColor: '#ffffff',
    borderRadius: 15,
    borderTopRightRadius: 0,
    ...Platform.select({
      ios: {
        shadowColor: '#000000',
        shadowOpacity: 0.3,
        shadowRadius: 2,
        shadowOffset: {
          height: 1,
          width: 0,
        },
        zIndex: 5,
      },
      android: {
        elevation: 5,
      },
    }),
  },
  avatarText:{
    fontSize: 16,
    color: '#FFA502',
    fontWeight:'500',
    alignSelf:'flex-start',
    fontFamily: 'Poppins-Medium',
    letterSpacing:0.3,
    textTransform:'uppercase',
  },
  userMessageText: {
    color: '#9D9D9D',
    fontSize: 12,
    textAlign:'left',
    alignSelf:'flex-start',
    // lineHeight: 20,
    fontFamily: 'Poppins-Medium',
    letterSpacing:0.3,
  },
  timeText: {
    color: '#000000',
    fontSize: 12,
    fontFamily: 'Poppins-Medium',
    letterSpacing:0.3,
    paddingRight:10
  },
});
