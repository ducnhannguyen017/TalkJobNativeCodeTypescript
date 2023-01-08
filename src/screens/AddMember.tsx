import React, {useEffect, useState} from 'react';

import {DataStore} from '@aws-amplify/datastore';
import {useRoute} from '@react-navigation/core';
import {useNavigation} from '@react-navigation/native';
import {Auth} from 'aws-amplify';
import {
  FlatList,
  Image,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  Alert
} from 'react-native';
import AntDesign from 'react-native-vector-icons/AntDesign';
import Colors from '../constants/Colors';
import {Project, ProjectUser, User} from '../models';

export default function AddMember() {
  const [users, setUsers] = useState<User[]>([]);
  const [showUsers, setShowUsers] = useState<User[]>([]);
  const [inputSearch, setInputSearch] = useState('');
  const [selectedUsers, setSelectedUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation<any>();
  const route = useRoute<any>();

  useEffect(() => {
    const fetch = async () => {
      const project = await DataStore.query(Project, route.params?.projectId);

      const members = await (
        await DataStore.query(ProjectUser)
      )
        .filter(e => e.project.id == route.params?.projectId)
        .map(e => e.user)
        .filter(e => e.id != project.Owner.id);
    };
    fetch();
  }, []);

  useEffect(() => {
    // query users
    try {
      const fetchUsers = async () => {
        const userData = await Auth.currentAuthenticatedUser();
        const authUser = await DataStore.query(User, userData.attributes.sub);

        const project = await DataStore.query(Project, route.params?.projectId);

        const members = await (
          await DataStore.query(ProjectUser)
        )
          .filter(e => e.project.id == route.params?.projectId)
          .filter(e => e.id != project.Owner.id)
          .map(e => e.user.id);

        let usersQuery = [];
        await Promise.all(
          authUser.friends.map(async friend => {
            if (!members.includes(friend)) {
              const user: any = await DataStore.query(User, friend);
              usersQuery.push(user);
            }
          }),
        );
        setUsers(usersQuery);
        setShowUsers(usersQuery);
      };
      fetchUsers();
    } catch (error) {}
  }, []);

  const deleteUsers = userId => {
    setSelectedUsers(selectedUsers.filter(user => user.id != userId));
  };

  const onInputSearchChange = inputSearch => {
    setInputSearch(inputSearch);
    setShowUsers(
      users.filter(user =>
        user.name.toLocaleLowerCase().includes(inputSearch.toLocaleLowerCase()),
      ),
    );
  };

  const selectAddMember = user => {
    setSelectedUsers([...selectedUsers, user]);
  };

  const filterContact = userId => {
    if (
      selectedUsers &&
      selectedUsers.find(selectedUser => selectedUser.id == userId)
    ) {
      return true;
    } else {
      return false;
    }
  };

  const onAddMember = async () => {
    if (selectedUsers && selectedUsers.length <= 0) {
      Alert.alert("Must select at least one user")
      return null;
    }
    const project = await DataStore.query(Project, route.params?.projectId);
    
    await Promise.all(
      selectedUsers.map(async member => {
        //   const user = (await DataStore.query(User, member))
        return saveProjectUser(member, project);
      }),
    );
    navigation.navigate('DetailProject');
  };

  const saveProjectUser = async (user, project) => {
    await DataStore.save(
      new ProjectUser({
        user,
        project,
      }),
    );
  };

  return (
    <>
      <View style={styles.page}>
        <TextInput
          style={styles.input}
          onChangeText={text => onInputSearchChange(text)}
          value={inputSearch}
          placeholder="Search"
        />
        <View style={{flexDirection: 'row', marginLeft: 10}}>
          <FlatList
            horizontal
            data={selectedUsers}
            renderItem={({item, index}) => (
              <View
                key={item.id + index}
                style={{marginLeft: 5, marginRight: 5}}>
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
          <Text style={styles.text}>Contacts on TalkJob</Text>
          {users.length > 0 ? (
            <FlatList
              data={showUsers}
              renderItem={({item}: any) => (
                <Pressable
                  onPress={() => selectAddMember(item)}
                  style={styles.container}>
                  <Image source={{uri: item?.imageUri}} style={styles.image} />
                  <View style={styles.rightContainer}>
                    <View style={styles.row}>
                      <Text style={styles.name}>{item?.name}</Text>
                      {filterContact(item.id) && (
                        <AntDesign
                          name="checkcircleo"
                          size={24}
                          color="black"
                        />
                      )}
                    </View>
                  </View>
                </Pressable>
              )}
              showsVerticalScrollIndicator={false}
            />
          ) : (
            <View
              style={{
                justifyContent: 'center',
                alignItems: 'center',
                flexGrow: 1,
              }}>
              <Text style={{fontSize: 20}}>No existed friends</Text>
            </View>
          )}
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'center',
              marginBottom: 30,
            }}>
            <Text>No find in here?</Text>
            <Pressable onPress={() => navigation.navigate('AddContact')}>
              <Text>
                <Text style={{color: '#AD40AF', fontWeight: '700'}}>
                  {' '}
                  Add Contact{' '}
                </Text>
                before this action
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
      <Pressable
        style={{
          backgroundColor: '#AD40AF',
          padding: 20,
          borderRadius: 10,
          marginBottom: 30,
          marginLeft: 10,
          marginRight: 10,
        }}
        onPress={() => onAddMember()}>
        <Text
          style={{
            textAlign: 'center',
            fontWeight: '700',
            fontSize: 16,
            color: '#fff',
          }}>
          Save
        </Text>
      </Pressable>
      {/* )} */}
    </>
  );
}

const styles = StyleSheet.create({
  page: {
    backgroundColor: 'white',
    flex: 1,
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
  container: {
    flexDirection: 'row',
    padding: 10,
  },
  container2: {
    flexDirection: 'row',
    padding: 10,
    borderBottomWidth: 1,
  },
  text: {
    fontSize: 14,
    padding: 10,
  },
  input: {
    height: 40,
    margin: 12,
    borderWidth: 1,
    padding: 10,
    borderRadius: 10,
  },
});
