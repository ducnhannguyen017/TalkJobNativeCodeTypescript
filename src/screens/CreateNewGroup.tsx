import {
  View,
  Text,
  TextInput,
  StyleSheet,
  FlatList,
  Image,
  Pressable,
  Alert
} from 'react-native';
import React, {useEffect, useState} from 'react';
import AntDesign from 'react-native-vector-icons/AntDesign';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import UserItem from '../components/UserItem';
import {ChatRoom, ChatRoomUser, User} from '../models';
import Colors from '../constants/Colors';
import { useSelector } from 'react-redux';
import { DataStore } from 'aws-amplify';

const CreateNewGroup = props => {
  const {route, navigation} = props;
  const [inputSearch, setInputSearch] = useState(null);
  const [selectedUsers, setSelectedUsers] = useState<User[]>([]);
  const [showUsers, setShowUsers] = useState<User[]>([]);
  const [groupName, setGroupName] = useState(null);
  const currentUser = useSelector((store:any) => store.currentUser);

  useEffect(() => {
    console.log('[users]', route.params.users);
    setShowUsers(route.params.users);
  }, [route.params.users]);

  const onInputSearchChange = inputSearch => {
    console.log("onchane")
    setInputSearch(inputSearch);
    setShowUsers(
      route.params.users.filter(user =>
        user.name.toLocaleLowerCase().includes(inputSearch.toLocaleLowerCase()),
      ),
    );
  };

  const deleteUsers = userId => {
    setSelectedUsers(selectedUsers.filter(user => user.id != userId));
  };

  const handleCreateNewGroup = async ()=>{
    // const authUser = await Auth.currentAuthenticatedUser();
    const dbUser = await DataStore.query(User, currentUser.id);
    if (!dbUser) {
      Alert.alert("There was an error creating the group");
      return;
    }
    // Create a chat room
    const newChatRoomData:any = {
      newMessages: 0,
      Admin: dbUser,
    };
    if (selectedUsers.length > 1) {
      newChatRoomData.name = groupName;
      newChatRoomData.imageUri =
        "https://notjustdev-dummy.s3.us-east-2.amazonaws.com/avatars/group.jpeg";
    }
    const newChatRoom = await DataStore.save(new ChatRoom(newChatRoomData));

    if (dbUser) {
      await addUserToChatRoom(dbUser, newChatRoom);
    }

    // connect users user with the chat room
    await Promise.all(
      selectedUsers.map((user) => addUserToChatRoom(user, newChatRoom))
    );

    navigation.navigate("ChatRoom", { id: newChatRoom.id });
  }

  const addUserToChatRoom = async (user, chatRoom) => {
    DataStore.save(new ChatRoomUser({ user, chatRoom }));
  };

  return (
    <View>
      <View
        style={{
          flexDirection: "row",
          padding: 10,
          alignContent: "center",
          justifyContent: "space-between"
        }}
      >
        <TextInput
          style={[styles.input, {width:"80%", marginLeft: 0}]}
          onChangeText={setGroupName}
          value={groupName}
          placeholder="Group Name"
        />
        <Pressable style={{justifyContent: 'center'}} onPress={() => handleCreateNewGroup()}>
          <View style={styles.image}>
            <MaterialIcons
              name="arrow-forward-ios"
              size={24}
              color={Colors.light.background}
            />
          </View>
        </Pressable>
      </View>
      <View style={{flexDirection: 'row', marginLeft: 10}}>
        <FlatList
          horizontal
          data={selectedUsers}
          renderItem={({item, index}) => (
            <View key={item.id + index} style={{marginLeft: 5, marginRight: 5}}>
              <Image source={{uri: item.imageUri}} style={styles.image} />
              <Pressable
                onPress={() => deleteUsers(item.id)}
                style={styles.closeIcon}>
                <AntDesign name="close" size={18} color="white" />
              </Pressable>
            </View>
          )}
          showsVerticalScrollIndicator={true}></FlatList>
      </View>
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
      </View>
      {route.params.users && route.params.users.length > 0 ? (
        <FlatList
          data={showUsers}
          renderItem={({item}) => (
            <UserItem
              newGroupMode={true}
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
          <Text style={{fontSize: 20}}>No existed friends</Text>
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
});

export default CreateNewGroup;
