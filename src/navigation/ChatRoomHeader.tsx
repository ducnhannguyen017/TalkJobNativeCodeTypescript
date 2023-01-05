import React, { useEffect, useState } from "react";
import { View, Image, Text, useWindowDimensions, Pressable, Alert } from "react-native";
import Entypo from "react-native-vector-icons/Entypo";
import { Auth, DataStore } from "aws-amplify";
import { ChatRoom, ChatRoomUser, User } from "../models";
import moment from "moment";
import { useNavigation } from "@react-navigation/native";
import { useSelector } from "react-redux";
import ConnectyCube from 'react-native-connectycube';
import callService from "../services/call-service";
import pushNotificationsService from "../services/pushnotifications-service";
import { isCurrentRoute } from "../utils";
import permissionsService from "../services/permissions-service";


const ChatRoomHeader = ({ id, children }:any) => {
  const { width } = useWindowDimensions();
  const [user, setUser] = useState<User | null>(null);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [chatRoom, setChatRoom] = useState<ChatRoom | undefined>(undefined);
  const currentUser = useSelector((store:any) => store.currentUser);
  const callSession = useSelector((store:any) => store.activeCall.session);
  const isIcoming = useSelector((store:any) => store.activeCall.isIcoming);
  const isEarlyAccepted = useSelector((store:any) => store.activeCall.isEarlyAccepted);

  const navigation = useNavigation<any>();

  const fetchUsers = async () => {
    const fetchedUsers = (await DataStore.query(ChatRoomUser))
      .filter((chatRoomUser) => chatRoomUser.chatRoom.id === id)
      .map((chatRoomUser) => chatRoomUser.user);

    setAllUsers(fetchedUsers);

    const authUser = await Auth.currentAuthenticatedUser();
    setUser(
      fetchedUsers.find((user) => user.id !== authUser.attributes.sub) || null
    );
  };

  const fetchChatRoom = async () => {
    DataStore.query(ChatRoom, id).then(setChatRoom);
  };

  useEffect(() => {
    if (isIcoming && !isEarlyAccepted) {
      const isAlreadyOnIncomingCallScreen = isCurrentRoute(navigation, 'IncomingCallScreen');
      const isAlreadyOnVideoScreenScreen = isCurrentRoute(navigation, 'VideoScreen');
      if (!isAlreadyOnIncomingCallScreen && !isAlreadyOnVideoScreenScreen) {
        // incoming call
        navigation.push('IncomingCallScreen', { });
      }
    }
  }, [callSession, isIcoming, isEarlyAccepted]);

  useEffect(() => {
    if (isEarlyAccepted) {
      navigation.push('VideoScreen', { });
    }
  }, [isEarlyAccepted]);

  useEffect(() => {
    if (!id) {
      return;
    }

    fetchUsers();
    fetchChatRoom();
  }, []);

  const getLastOnlineText = () => {
    if (!user?.lastOnlineAt) {
      return null;
    }

    // if lastOnlineAt is less than 5 minutes ago, show him as ONLINE
    const lastOnlineDiffMS = moment().diff(moment(user.lastOnlineAt));
    if (lastOnlineDiffMS < 5 * 60 * 1000) {
      // less than 5 minutes
      return "online";
    } else {
      return `Last seen online ${moment(user.lastOnlineAt).fromNow()}`;
    }
  };

  const getUsernames = () => {
    return allUsers.map((user) => user.name).join(", ");
  };

  const openInfo = () => {
    // redirect to info page
    navigation.navigate("GroupInfoScreen", { id });
  };

  const startCall = async (callType) => {
    try {
      
      const selectedOpponentsIds = [user.connectyCubeUserId];
  
      ConnectyCube.videochat.CallType.AUDIO
  
      // 1. initiate a call
      //
      const callSession = await callService.startCall(selectedOpponentsIds, callType)
  
      // 2. send push notitification to opponents
      //
      const pushParams = {
        message: `Incoming call from ${currentUser.displayName}`,
        ios_voip: 1,
        handle: currentUser.displayName,
        initiatorId: callSession.initiatorID,
        opponentsIds: selectedOpponentsIds.join(","),
        uuid: callSession.ID,
        callType: callType === ConnectyCube.videochat.CallType.VIDEO ? "video" : "audio"
      };
      pushNotificationsService.sendPushNotification(selectedOpponentsIds, pushParams);
    } catch (error) {
      Alert.alert('Oops!', error.message)
    }
    navigation.push('VideoScreen', { });
  }

  const handleVideoCall = async() =>{
    await startCall(ConnectyCube.videochat.CallType.AUDIO)
  }

  const isGroup = allUsers.length > 2;

  return (
    <View
      style={{
        flexDirection: "row",
        justifyContent: "space-between",
        width: width - 100,
        // marginLeft: 25,
        // padding: 10,
        alignItems: "center",
      }}
    >
      <Image
        source={{
          uri: chatRoom?.imageUri || user?.imageUri,
        }}
        style={{ width: 30, height: 30, borderRadius: 30 }}
      />

      <Pressable onPress={openInfo} style={{ flex: 1, marginLeft: 10 }}>
        <Text style={{ fontWeight: "bold" }}>
          {chatRoom?.name || user?.name}
        </Text>
        <Text numberOfLines={1}>
          {isGroup ? getUsernames() : getLastOnlineText()}
        </Text>
      </Pressable>

      <Pressable onPress={()=>handleVideoCall()}>
        <Entypo
          name="camera"
          size={24}
          color="black"
          style={{ marginHorizontal: 10 }}
        />
      </Pressable>
      <Entypo
        name="phone"
        size={24}
        color="black"
        style={{ marginHorizontal: 10 }}
      />
    </View>
  );
};

export default ChatRoomHeader;
