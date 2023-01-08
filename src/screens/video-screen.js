import React, { useEffect } from 'react';
import { Alert, SafeAreaView, StatusBar } from 'react-native';
import { useSelector } from 'react-redux'
import ConnectyCube from 'react-native-connectycube';

import VideoGrid from '../components/generic/video-grid';
import CallService from '../services/call-service';
import VideoToolBar from '../components/generic/video-toolbar';
import Loader from '../components/generic/loader';
import { showToast } from '../utils'


export default function VideoScreen ({ navigation }) {
  const streams = useSelector(store => store.activeCall.streams);
  const callSession = useSelector(store => store.activeCall.session);
  const isEarlyAccepted = useSelector(store => store.activeCall.isEarlyAccepted);
  const user = useSelector((store) => store.currentUser);

  const isVideoCall = callSession?.callType === ConnectyCube.videochat.CallType.VIDEO;

  useEffect(() => {
    console.log("[VideoScreen] useEffect streams.length", streams.length)
    // stop call if all opponents are left
    if (streams.length <= 1) {
      stopCall()
    }
  }, [streams , streams.length]);

  function navigateBack() {
    navigation.pop();

    showToast("Call is ended")
  }
  
  function stopCall(){
    try {
      CallService.stopCall();
    } catch (error) {
      Alert.alert(error.message)
    }finally{
      navigateBack()
    }
  }

  function muteCall(isAudioMuted) {
    CallService.muteMicrophone(isAudioMuted);
  }

  function switchCamera() {
    CallService.switchCamera();
  };

  return (
    <SafeAreaView style={{flex: 1, backgroundColor: 'black'}}>
      <StatusBar backgroundColor="black" barStyle="light-content" />
      <VideoGrid streams={streams} />
      {isEarlyAccepted && <Loader text="connecting.." />}
      <VideoToolBar
        displaySwitchCam={isVideoCall}
        onSwitchCamera={switchCamera}
        onStopCall={stopCall}
        onMute={muteCall}
        canSwitchCamera={CallService.mediaDevices.length > 1}
      />
    </SafeAreaView>
  );
}