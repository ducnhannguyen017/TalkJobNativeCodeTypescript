import React, { useState } from 'react';
import { Text, Image, View, Pressable, BackHandler } from 'react-native';
import { useNavigation } from '@react-navigation/core';
import styles from './styles';
import { Auth, DataStore } from 'aws-amplify';
import { ChatRoom, User, ChatRoomUser } from '../../models';
import AntDesign from 'react-native-vector-icons/AntDesign';


export default function UserItem({ user, setSelectedUsers, selectedUser, newGroupMode, showUsers }) {
  const navigation = useNavigation<any>();
  let roomMap={};

  var groupBy = function(xs) {
    return xs.reduce(function(rv, x) {
      (rv[x.chatRoom['id']] = rv[x.chatRoom['id']] || []).push(x);
      return rv;
    }, {});
  };

  const onPress = async () => {
    if(newGroupMode){
      if(filterContact()){
        return;
      }
      setSelectedUsers([...selectedUser, user])
    }else{
      const authUser = await Auth.currentAuthenticatedUser();
      
      //check exist chatroom
      const lstChatRoomUser:any = groupBy((await DataStore.query(ChatRoomUser)).filter(chatRoom => chatRoom.user.id == authUser.attributes.sub || chatRoom.user.id == user.id));
      await Promise.all(
        Object.keys(lstChatRoomUser).map((chatRoomId) => findUsersInChatRoom(chatRoomId))
      );
      const createNewRoom:any = Object.values(roomMap).find((room:any)=>{
        if(room.length == 2 && room.find(e=>e.user.id == user.id)) return true;
        else return false
      });
      //
      if(createNewRoom){
        navigation.navigate('ChatRoom', { id: createNewRoom[0].chatRoom.id });
        return;
      }else{
        // Create a chat room
        const newChatRoom = await DataStore.save(new ChatRoom({newMessages: 0}));
        
        // connect authenticated user with the chat room
        const dbUser = await DataStore.query(User, authUser.attributes.sub);
        await DataStore.save(new ChatRoomUser({
          user: dbUser,
          chatRoom: newChatRoom
        }))
    
        // connect clicked user with the chat room
        await DataStore.save(new ChatRoomUser({
          user,
          chatRoom: newChatRoom
        }));

        await DataStore.save(
          User.copyOf(dbUser, (updated) => {
            updated.friends = [...updated.friends, user.id];
          })
        );
        await DataStore.save(
          User.copyOf(user, (updated) => {
            updated.friends = [...updated.friends, dbUser.id];
          })
        );
    
        console.log("[71]")
        navigation.navigate('ChatRoom', { id: newChatRoom.id });
        // navigation.reset({
        //   index: 0,
        //   routes: [
        //     {
        //       name: 'Chats',
        //     },
        //   ],
        // });
      }
    }
    // const authUser = await Auth.currentAuthenticatedUser();
    // const lstChatRoomUser:any = groupBy((await DataStore.query(ChatRoomUser)).filter(chatRoom => chatRoom.user.id == authUser.attributes.sub || chatRoom.user.id == user.id));
    // await Promise.all(
    //   Object.keys(lstChatRoomUser).map((chatRoomId) => findUsersInChatRoom(chatRoomId))
    // );
    // const createNewRoom = Object.values(roomMap).find((room:any)=>{
    //   if(room.length == 2 ) return true;
    //   else return false
    // });
    // if(createNewRoom){

    // }else{

    // }
  }

  const findUsersInChatRoom= async (chatRoomId)=>{
    const chatRoom = (await DataStore.query(ChatRoomUser)).filter(chatRoomUser => chatRoomUser.chatRoom.id == chatRoomId);
    roomMap[chatRoomId] = chatRoom;
  }

  const filterContact=()=>{
    if(selectedUser && selectedUser.find(selectedUser=>selectedUser.id == user.id)){
      return true;
    }else{
      return false;
    }
  }

  return (
    <Pressable onPress={onPress} style={styles.container}>
      <Image source={{ uri: user.imageUri}} style={styles.image} />

      <View style={styles.rightContainer}>
        <View style={styles.row}>
          <Text style={styles.name}>{user.name}</Text>
          {filterContact() && (<AntDesign name="checkcircleo" size={24} color="black" />)}
        </View>
      </View>
    </Pressable>
  );
}
