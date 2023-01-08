import {
  View,
  Text,
  TextInput,
  StyleSheet,
  FlatList,
  Image,
  Pressable,
} from 'react-native';
import React, {useCallback, useEffect, useState} from 'react';
import AntDesign from 'react-native-vector-icons/AntDesign';
import UserItem from '../components/UserItem';
import {ChatRoomUser, User} from '../models';
import Colors from '../constants/Colors';
import {DataStore} from 'aws-amplify';
import {debounce} from 'lodash';
import { useSelector } from 'react-redux';

const AddContact = ({navigation}) => {
  const [inputSearch, setInputSearch] = useState(null);
  const [selectedUsers, setSelectedUsers] = useState<User[]>([]);
  const [showUsers, setShowUsers] = useState<User[]>([]);
  const currentUser = useSelector((store:any) => store.currentUser);
  let roomMap={};

  const fetchUser = async inputSearch => {
    if (!inputSearch) {
      setShowUsers([]);
      return;
    }
    const fetchedMessages = (await DataStore.query(User, user =>
      user.id("ne", currentUser.id)
    )).filter(e=> e.name.toLowerCase().includes(inputSearch.toLowerCase()));
    console.log('inputSearch', inputSearch);
    console.log('fetchedMessages', fetchedMessages);
    setShowUsers(fetchedMessages);
  };
  useEffect(() => {
    console.log("currentUser", currentUser);
  }, [currentUser]);

  const onInputSearchChange = useCallback(
    debounce(inputSearch => fetchUser(inputSearch), 1000),
    [],
  );

  const deleteUsers = userId => {
    setSelectedUsers(selectedUsers.filter(user => user.id != userId));
  };

  const onPress = async(item:User) => {
    if(currentUser.friends.find(e=>e == item.id)){
      // const authUser = await Auth.currentAuthenticatedUser();
      
      //check exist chatroom
      const lstChatRoomUser:any = groupBy((await DataStore.query(ChatRoomUser)).filter(chatRoom => chatRoom.user.id == currentUser.id || chatRoom.user.id == item.id));
      await Promise.all(
        Object.keys(lstChatRoomUser).map((chatRoomId) => findUsersInChatRoom(chatRoomId))
      );
      const createNewRoom:any = Object.values(roomMap).find((room:any)=>{
        if(room.length == 2 && room.find(e=>e.user.id == item.id)) return true;
        else return false
      });
      navigation.navigate('ChatRoom', { id: item.id });
      return;
    }else{
      DataStore.save(
        User.copyOf(currentUser, (updated) => {
          updated.friends = [...updated.friends, item.id];
        })
      );
    }

    console.log("item", item)
  };

  const findUsersInChatRoom= async (chatRoomId)=>{
    const chatRoom = (await DataStore.query(ChatRoomUser)).filter(chatRoomUser => chatRoomUser.chatRoom.id == chatRoomId);
    roomMap[chatRoomId] = chatRoom;
  }

  const groupBy = function(xs) {
    return xs.reduce(function(rv, x) {
      (rv[x.chatRoom['id']] = rv[x.chatRoom['id']] || []).push(x);
      return rv;
    }, {});
  };

  return (
    <View>
      <TextInput
        style={styles.input}
        onChangeText={text => onInputSearchChange(text)}
        value={inputSearch}
        placeholder="Search"
      />
      <AntDesign
        name="search1"
        size={24}
        color="black"
        style={{position: 'absolute', right: 20, top: 20}}
      />
      {/* <View style={{ flexDirection: "row", marginLeft: 10 }}>
            <FlatList
              horizontal
              data={selectedUsers}
              renderItem={({ item, index }) => (
                <View key={item.id+index} style={{ marginLeft: 5, marginRight: 5 }}>
                  <Image source={{ uri: item.imageUri }} style={styles.image} />
                  <Pressable
                    onPress={() => deleteUsers(item.id)}
                    style={styles.closeIcon}
                  >
                    <AntDesign name="close" size={18} color="white" />
                  </Pressable>
                </View>
              )}
              showsVerticalScrollIndicator={true}
            ></FlatList>
          </View> */}
      {showUsers && showUsers.length > 0 ? (
        <FlatList
          data={showUsers}
          renderItem={({item}) => (
            <UserItem
              newGroupMode={false}
              setSelectedUsers={setSelectedUsers}
              selectedUser={selectedUsers}
              user={item}
              showUsers={showUsers}
            />
          )}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <View
          style={{justifyContent: 'center', alignItems: 'center', flexGrow: 1}}>
          <Text style={{fontSize: 20}}>No user found</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  input: {
    height: 40,
    margin: 12,
    borderWidth: 1,
    padding: 10,
    borderRadius: 10,
  },
  image: {
    height: 50,
    width: 50,
    borderRadius: 30,
    marginRight: 10,
    backgroundColor: Colors.light.tint,
    // flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeIcon: {
    height: 20,
    width: 20,
    borderRadius: 10,
    backgroundColor: 'gray',
    // flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    bottom: 0,
    right: 5,
  },
  rightContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  name: {
    fontWeight: 'bold',
    fontSize: 18,
    marginBottom: 3,
  },
  container: {
    flexDirection: 'row',
    padding: 10,
  },
});

export default AddContact;
