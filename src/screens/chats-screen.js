import React, { useEffect, useState } from 'react';

import { Auth, DataStore } from 'aws-amplify';
import { FlatList, StyleSheet, Text, TextInput, View } from 'react-native';
import { ChatRoom, ChatRoomUser } from '../../src/models';
import ChatRoomItem from '../components/ChatRoomItem';


export default function ChatsScreen() {
  const [chatRooms, setChatRooms] = useState([]);
  const [inputSearch, setInputSearch] = useState(null);
  
  
  useEffect(() => {
    let subscription;
    const fetch=async()=>{
      const userData = await Auth.currentAuthenticatedUser();
      subscription = DataStore.observe(ChatRoom).subscribe((msg) => {
        if (msg.model === ChatRoom && msg.opType === "INSERT") {
          setChatRooms((chatRoom) => [msg.element, ...chatRoom]);
        }
      });
    }
    fetch();

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    const fetchChatRooms = async () => {
      try {
        const userData = await Auth.currentAuthenticatedUser();
  
        const chatRooms = (await DataStore.query(ChatRoomUser))
          .filter(chatRoomUser => chatRoomUser.user.id === userData.attributes.sub)
          .map(chatRoomUser => chatRoomUser.chatRoom);
        setChatRooms(chatRooms);

      } catch (error) {
        
      }
    };
    fetchChatRooms();
  }, []);

  return (
    <View style={styles.page}>
      <TextInput
        style={styles.input}
        onChangeText={setInputSearch}
        value={inputSearch}
        placeholder="Search"
      />
      <View style={styles.page}>
        {chatRooms && chatRooms.length > 0 ? (
          <FlatList
            data={chatRooms}
            renderItem={({ item }) => <ChatRoomItem chatRoom={item} />}
            showsVerticalScrollIndicator={false}
          />
        ):(
          <View style={{justifyContent:"center", alignItems:"center", flexGrow:1}}>
            <Text style={{fontSize:20}}>No existed chat</Text>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  page: {
    backgroundColor: 'white',
    flex: 1
  },
  input: {
    height: 40,
    margin: 12,
    borderWidth: 1,
    padding: 10,
    borderRadius: 10,
  },
});