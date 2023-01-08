import React, { useState } from 'react';
import { StyleSheet, SafeAreaView, TouchableOpacity, View } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useSelector } from 'react-redux'

export default function VideoToolBar({displaySwitchCam, onSwitchCamera, onStopCall, onMute, canSwitchCamera}) {
  const [isFrontCamera, setIsFrontCamera] = useState(true);

  const isMicrophoneMuted = useSelector(store => store.activeCall.isMicrophoneMuted);

  function switchCamera() {
    onSwitchCamera();
    
    setIsFrontCamera(!isFrontCamera)
  };

  function muteUnmuteAudio() {
    onMute(!isMicrophoneMuted)
  };

  function _renderStopButton() {
    return (
      <TouchableOpacity
        style={[styles.iconButton, {backgroundColor: 'red'}]}
        onPress={onStopCall}>
        {/* <MaterialIcons name={'call-end'} size={32} color="white" /> */}
        <MaterialCommunityIcons name="phone-hangup" size={30} color={'white'} />
      </TouchableOpacity>
    );
  };

  function _renderMuteButton() {
    const type = isMicrophoneMuted ? 'mic-off' : 'mic';

    return (
      <TouchableOpacity
        style={[styles.iconButton]}
        onPress={muteUnmuteAudio}>
        {/* <MaterialIcons name={type} size={32} color="white" /> */}
        <FontAwesome
          name={isMicrophoneMuted ? 'microphone-slash' : 'microphone'}
          size={30}
          color={'white'}
        />
      </TouchableOpacity>
    );
  };

  function _renderSwitchVideoSourceButton() {
    const type = isFrontCamera ? 'camera-rear' : 'camera-front';

    return (
      <TouchableOpacity
        style={styles.iconButton}
        onPress={switchCamera}>
        <Ionicons name={"camera-reverse-outline"} size={32} color="white" />
        {/* <MaterialIcons
          name={isFrontCamera ? 'camera-off' : 'camera'}
          size={30}
          color={'white'}
        /> */}
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.buttonsContainer}>
      <View style={styles.toolBarItem}>
        {_renderMuteButton()}
      </View>
      <View style={styles.toolBarItem}>
        {_renderStopButton()}
      </View>
      {/* <TouchableOpacity style={styles.iconButton}>
        <Ionicons name="ios-camera-reverse" size={30} color={'white'} />
      </TouchableOpacity> */}
      {displaySwitchCam && canSwitchCamera && 
        <View style={styles.toolBarItem}>
          {_renderSwitchVideoSourceButton()}
        </View>
      }
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 20,
    left: 0,
    right: 0,
    height: 60,
    flex: 1,
    justifyContent: 'center',
    flexDirection: 'row',
    zIndex: 100,
  },
  toolBarItem: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonContainer: {
    height: 50,
    width: 50,
    borderRadius: 25,
    marginHorizontal: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonCallEnd: {
    backgroundColor: 'red',
  },
  buttonMute: {
    backgroundColor: 'blue',
  },
  buttonSwitch: {
    backgroundColor: 'orange',
  },

  buttonsContainer: {
    backgroundColor: '#333333',
    padding: 20,
    paddingBottom: 40,
    borderBottomLeftRadius: 15,
    borderBottomRightRadius: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 'auto',
  },
  iconButton: {
    backgroundColor: '#4a4a4a',
    padding: 15,
    borderRadius: 50,
  },
});
