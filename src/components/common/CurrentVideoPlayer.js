import React, {Component } from 'react';
import { ScrollView,StyleSheet, Text,TouchableOpacity,View,Dimensions,Alert,Animated,TouchableWithoutFeedback,PanResponder} from 'react-native';
import Video from 'react-native-video';
import ProgressBar from "react-native-progress/Bar";
import Icon from "react-native-vector-icons/FontAwesome";
import Ionicons from 'react-native-vector-icons/Ionicons';

const THRESHOLD = 30;

function secondsToTime(time) {
    return ~~(time / 60) + ":" + (time % 60 < 10 ? "0" : "") + time % 60;
  }

export default class CurrentVideoPlayer extends Component {

    static navigationOptions =  {
        header: null,
    }

    constructor(props){
        super(props);
        this.state = {
            error: false,
            paused: true,
            progress: 0,
            duration: 0,
            buffering: true,
            animated: new Animated.Value(0),
        }

        this.position = {
            start: null,
            end: null,
          };
        
        this.animated = new Animated.Value(0);

        this.handleError = this.handleError.bind(this);
        this.handleLoadStart = this.handleLoadStart.bind(this);
        this.handleBuffer = this.handleBuffer.bind(this);
        this.triggerBufferAnimation = this.triggerBufferAnimation.bind(this);
        this.handleVideoLayout =  this.handleVideoLayout.bind(this);
        this.handleScroll = this.handleScroll.bind(this);
        this.handleLoad = this.handleLoad.bind(this);
        this.handleEnd = this.handleEnd.bind(this);
        this.handleProgress = this.handleProgress.bind(this);
        this.handleMainButtonTouch = this.handleMainButtonTouch.bind(this);
        this.handleProgressPress = this.handleProgressPress.bind(this);
        this.triggerShowHide = this.triggerShowHide.bind(this);
        this.onAudioBecomingNoisy = this.onAudioBecomingNoisy.bind(this);
    }

    componentWillMount(){
        this.PanResponder = PanResponder.create({
            onMoveShouldSetPanResponderCapture: () =>{
                this.triggerShowHide();
                return false;
            }
        })
    }

    handleError = (meta) => {
        const { error: { code } } = meta;

        let error = "An error has occurred playing this video";
        switch (code) {
          case -11800:
            error = "Could not load video from URL";
            break;
        } 
        this.setState({ error,buffering:false});
    };

    
    handleLoadStart = () => {
        this.triggerBufferAnimation();
    };

    handleBuffer = meta => {
        meta.isBuffering && this.triggerBufferAnimation()

        if (this.loopingAnimation && !meta.isBuffering) {
        this.loopingAnimation.stopAnimation();
        }
        this.setState({ buffering: meta.isBuffering,});
    };

    triggerBufferAnimation = () => {
        this.loopingAnimation && this.loopingAnimation.stopAnimation();
        this.loopingAnimation = Animated.loop(
        Animated.timing(this.state.animated, {
            toValue: 1,
            duration: 350,
        })
        ).start();
    };


    handleVideoLayout = e => {
        const { height } = Dimensions.get("window");
    
        this.position.start = e.nativeEvent.layout.y - height + THRESHOLD;
        this.position.end = e.nativeEvent.layout.y + e.nativeEvent.layout.height - THRESHOLD;
      };

    handleScroll = e => {
        const scrollPosition = e.nativeEvent.contentOffset.y;
        const paused = this.state.paused;
        const { start, end } = this.position;
    
        if (scrollPosition > start && scrollPosition < end && paused) {
          this.setState({ paused: false });
        } else if (
          (scrollPosition > end || scrollPosition < start) && !paused
        ) {
          this.setState({ paused: true });
        }
    };   

    handleMainButtonTouch = () => {
        if (this.state.progress >= 1) {
          this.player.seek(0);
        }
    
        this.setState(state => {
          return {
            paused: !state.paused,
          };
        });
    };
    
    handleProgressPress = e => {
        const position = e.nativeEvent.locationX;
        const progress = (position / 250) * this.state.duration;
        const isPlaying = !this.state.paused;
        
        this.player.seek(progress,0);
    };

    handleProgress = progress => {
        this.setState({
          progress: progress.currentTime / this.state.duration,
        });
      };
    
    handleEnd = () => {
        this.setState({ paused: true });
        this.player.seek(0);
    };
    
    handleLoad = meta => {
        this.setState({
          duration: meta.duration,
        });
        // this.triggerShowHide();
    };
    
    triggerShowHide = () => {
        clearTimeout(this.hideTimeout);
    
        Animated.timing(this.animated, {
          toValue: 1,
          duration: 100,
        }).start();
        this.hideTimeout = setTimeout(() => {
          Animated.timing(this.animated, {
            toValue: 0,
            duration: 300,
          }).start();
        }, 1500);
      };

      onAudioBecomingNoisy = () => {
        this.setState({ paused: true })
      };

  
    render(){

        const w = Dimensions.get('window').width;
        const h = w*0.5625;
        const {error,buffering} = this.state;

        const interpolatedAnimation = this.state.animated.interpolate({
            inputRange: [0, 1],
            outputRange: ["0deg", "360deg"],
          });
      
          const rotateStyle = {
            transform: [{ rotate: interpolatedAnimation }],
          };

          const interpolatedControls = this.animated.interpolate({
            inputRange: [0, 1],
            outputRange: [48, 0],
          });
      
          const controlHideStyle = {
            transform: [
              {
                translateY: interpolatedControls,
              },
            ],
          };

        return(
            <View style={styles.Container}>
            {/* <ScrollView scrollEventThrottle={16} onScroll={this.handleScroll}> */}

        <View {...this.PanResponder.panHandlers} style={styles.videoContainer}>
            <View style={buffering ? styles.buffering : undefined}>
                
                <Video
                    source={{uri:this.props.file}}
                    resizeMode='cover'
                    useTextureView={true}
                    style={{width:w,height:h}}
                    paused={this.state.paused}
                    repeat={false}
                    playInBackground={false} 
                    playWhenInactive={false}
                    ignoreSilentSwitch={"obey"}
                    onError={this.handleError}
                    onLayout={this.handleVideoLayout}
                    onLoadStart={this.handleLoadStart}
                    onBuffer={this.handleBuffer}
                    onLoad={this.handleLoad}
                    onProgress={this.handleProgress}
                    onEnd={this.handleEnd}
                    onAudioBecomingNoisy={this.onAudioBecomingNoisy}
                    ref={ref => { this.player = ref;}}
                />
              

                <View style={styles.videoCover}>
                    {error && <Icon name="exclamation-triangle" size={30} color="red" />}
                    {error && <Text style={{color:'#ffffff'}}>{error}</Text>}
                    {buffering &&
                        <Animated.View style={rotateStyle}>
                            <Icon name="circle-o-notch" size={30} color="white" />
                        </Animated.View>}

                    { (!buffering && this.state.paused) &&
                        <Ionicons name="md-arrow-dropright-circle" size={40} color="#ffffff" onPress={this.handleMainButtonTouch}/>
                    }     
                </View>

                    <Animated.View style={[styles.controls, controlHideStyle]}>
                            <TouchableWithoutFeedback onPress={this.handleMainButtonTouch}>
                            <Icon name={!this.state.paused ? "pause" : "play"} size={30} color="#FFF" />
                            </TouchableWithoutFeedback>
                            <TouchableWithoutFeedback onPress={this.handleProgressPress}>
                            <View>
                                <ProgressBar
                                progress={this.state.progress}
                                color="#FFF"
                                unfilledColor="rgba(255,255,255,.5)"
                                borderColor="#FFF"
                                width={250}
                                height={20}
                                />
                            </View>
                            </TouchableWithoutFeedback>

                            <Text style={styles.duration}>
                            {secondsToTime(Math.floor(this.state.progress * this.state.duration))}
                            </Text>
                    </Animated.View>

            </View>
        </View>

               

            {/* </ScrollView> */}
            </View>
        )
    }

}

const styles = StyleSheet.create({
    Container: {
        flex:1,
        justifyContent:'center',
        alignItems:'center',
        backgroundColor: '#000',
    },
    videoContainer: {
        overflow: "hidden",
      },
    videoCover: {
        alignItems: "center",
        justifyContent: "center",
        position: "absolute",
        left: 0,
        top: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "transparent",
      },
      buffering: {
        backgroundColor: "#000",
      },
      controls: {
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        height: 48,
        left: 0,
        bottom: 0,
        right: 0,
        position: "absolute",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-around",
        paddingHorizontal: 10,
      },
      mainButton: {
        marginRight: 15,
      },
      duration: {
        color: "#FFF",
        marginLeft: 15,
      },
});