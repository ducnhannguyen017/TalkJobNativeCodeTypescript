import React, { useState, useEffect } from "react";
import { Text, Image, View, Pressable, ActivityIndicator } from "react-native";
import { useNavigation } from "@react-navigation/core";
import { DataStore } from "@aws-amplify/datastore";
import styles from "./styles";
import Auth from "@aws-amplify/auth";
import { ChatRoom, ChatRoomUser, Message } from "../../models";
import moment from "moment/moment";
// import { ChatRoom } from "../../src/models";

export default function ChatRoomItem({ chatRoom }) {
  // const [users, setUsers] = useState<User[]>([]); // all users in this chatroom
  const [user, setUser] = useState(null); // the display user
  const [lastMessage, setLastMessage] = useState();
  const [isLoading, setIsLoading] = useState(true);

  const navigation = useNavigation();
  
  useEffect(() => {
    const subscription = DataStore.observe(ChatRoom, chatRoom.id).subscribe((msg) => {
      if (msg.model === ChatRoom && msg.opType === "UPDATE") {
        setLastMessage(msg.element.LastMessage);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    const fetchUsers = async () => {
      const fetchedUsers = (await DataStore.query(ChatRoomUser))
        .filter((chatRoomUser) => chatRoomUser.chatRoom.id === chatRoom.id)
        .map((chatRoomUser) => chatRoomUser.user);

      // setUsers(fetchedUsers);

      const authUser = await Auth.currentAuthenticatedUser();
      setUser(
        fetchedUsers.find((user) => user.id !== authUser.attributes.sub) || null
      );
      setIsLoading(false);
    };
    fetchUsers();
  }, []);

  useEffect(() => {
    if (!chatRoom.chatRoomLastMessageId) {
      return;
    }
    DataStore.query(Message, chatRoom.chatRoomLastMessageId).then(
      setLastMessage
    );
  }, []);

  const onPress = () => {
    navigation.navigate("ChatRoom", { id: chatRoom.id });
  };

  if (isLoading) {
    return <ActivityIndicator />;
  }

  const time = moment(lastMessage?.createdAt).from(moment());

  return (
    <Pressable onPress={onPress} style={styles.container}>
      <Image 
      source={{ uri: chatRoom.imageUri || user?.imageUri }} 
      style={styles.image} />

      {!!chatRoom.newMessages && (
        <View style={styles.badgeContainer}>
          <Text style={styles.badgeText}>{chatRoom.newMessages}</Text>
        </View>
      )}

      <View style={styles.rightContainer}>
        <View style={styles.row}>
          <Text style={styles.name}>{chatRoom.name || user?.name}</Text>
          <Text style={styles.text}>{chatRoom.chatRoomLastMessageId ? time:""}</Text>
        </View>
        <Text numberOfLines={1} style={styles.text}>
          {lastMessage?.content?lastMessage?.content:"Cuộc trò chuyện chưa bắt đầu!"}
        </Text>
      </View>
    </Pressable>
  );
}
