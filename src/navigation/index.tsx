/**
 * If you are not familiar with React Navigation, check out the "Fundamentals" guide:
 * https://reactnavigation.org/docs/getting-started
 *
 */
import {
  DarkTheme,
  DefaultTheme,
  NavigationContainer,
} from '@react-navigation/native';
import * as React from 'react';
import {
  ActivityIndicator,
  Alert,
  ColorSchemeName,
  Pressable,
  View,
} from 'react-native';
import {useNavigation} from '@react-navigation/core';

// import LinkingConfiguration from "./LinkingConfiguration";

import {createDrawerNavigator} from '@react-navigation/drawer';
import {createStackNavigator} from '@react-navigation/stack';
import {Auth, DataStore, Hub} from 'aws-amplify';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import DrawerContent from '../components/DrawerContent';
import Colors from '../constants/Colors';
import AddMember from '../screens/AddMember';
import ChatRoomScreen from '../screens/ChatRoomScreen';
import CreateNewTask from '../screens/CreateNewTask';
import DetailProjectScreen from '../screens/DetailProjectScreen';
import ChatRoomHeader from './ChatRoomHeader';
import MainTabNavigator from './MainTabNavigator';
// import LoginScreen from "../screens/login-screen";
import LoginScreen from '../screens/LoginScreen';
import authService from '../services/auth-service';
import DetailTask from '../screens/DetailTask';
import RegisterScreen from '../screens/RegisterScreen';
import ConfirmEmail from '../screens/ConfirmEmail';
import IncomingCallScreen from '../screens/incoming-call-screen';
import InitiateCallScreen from '../screens/initiate-call-screen';
import VideoScreen from '../screens/video-screen';
import {User} from '../models';
import store from '../store';
import callService from '../services/call-service';
import pushNotificationsService from '../services/pushnotifications-service';
import {setCurrentUser} from '../actions/currentUser';
import permissionsService from '../services/permissions-service';
import AddContact from '../screens/AddContact';
import CreateNewGroup from '../screens/CreateNewGroup';
import { HeaderBackButton } from '@react-navigation/elements';

const Drawer = createDrawerNavigator();
const Stack = createStackNavigator<any>();

const defaultOptions = ({navigation}) => ({
  title: 'TalkJob',
  headerRight: () => (
    <View
      style={{
        flexDirection: 'row',
        width: 60,
        justifyContent: 'space-between',
        marginRight: 10,
      }}>
      <MaterialIcons name="search" size={22} color={'white'} />
      <Pressable onPress={() => navigation.openDrawer()}>
        <MaterialCommunityIcons
          name="dots-vertical"
          size={22}
          color={'white'}
        />
      </Pressable>
    </View>
  ),
  headerLeft: () => <></>,
});

export default function Navigation({
  colorScheme,
}: {
  colorScheme?: ColorSchemeName;
}) {
  return (
    <NavigationContainer
      // linking={LinkingConfiguration}
      theme={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <RootNavigator />
      {/* {currentUser ? (
      ) : (
        <AuthStack />
      )} */}
    </NavigationContainer>
  );
}

const AuthStack = () => {
  return (
    <Stack.Navigator screenOptions={{headerShown: false}}>
      <Stack.Screen name="Login" component={LoginScreen} />
      {/* <Stack.Screen name="Register" component={RegisterScreen} /> */}
    </Stack.Navigator>
  );
};

function RootNavigator() {
  // console.log(currentUser);
  const [currUser, setCurrUser] = React.useState(undefined);
  const checkUser = async () => {
    try {
      const userData = await Auth.currentAuthenticatedUser({bypassCache: true});
      const authUser = await DataStore.query(User, userData.attributes.sub);
      if (authUser) {
        await authService.login(authUser);
        store.dispatch(setCurrentUser(authUser));
        callService.init();
        pushNotificationsService.init();

        setCurrUser(authUser);
      } else {
        setCurrUser(null);
      }
    } catch (error) {
      setCurrUser(null);
    }
  };
  const navigation = useNavigation<any>();

  React.useEffect(() => {
    Hub.listen("auth", async (event) => {
      if (event.payload.event == 'signOut') {
        // await DataStore.clear();
        // console.log("event", event)
        navigation?.navigate('Login');
      } 
      if (event.payload.event == 'signIn') {
        navigation?.navigate('Drawer');
      }
    })
  }, [])
  React.useEffect(() => {
    checkUser();
  }, []);

  React.useEffect(() => {
    permissionsService.checkAndRequestDrawOverlaysPermission();
  }, []);

  if (currUser === undefined) {
    return (
      <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <Stack.Navigator
      initialRouteName={currUser ? "Drawer" : "Login"}
      screenOptions={{
        headerStyle: {
          backgroundColor: Colors.light.tint,
          shadowOpacity: 0,
          elevation: 0,
        },
        headerTintColor: Colors.light.background,
        headerTitleAlign: 'left',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}>
      <Stack.Screen
        name="Login"
        component={LoginScreen}
        options={({route}: any) => ({
          headerShown: false,
        })}
      />
      <Stack.Screen
        name="Register"
        component={RegisterScreen}
        options={({route}: any) => ({
          headerShown: false,
        })}
      />
      <Stack.Screen
        name="IncomingCallScreen"
        component={IncomingCallScreen}
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="InitiateCallScreen"
        component={InitiateCallScreen}
        options={{
          headerStyle: {
            backgroundColor: 'grey',
          },
          headerTintColor: '#fff',
          headerShown: true,
          headerLeft: () => <></>,
          gestureEnabled: false,
        }}
      />
      <Stack.Screen
        name="VideoScreen"
        component={VideoScreen}
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="ConfirmEmail"
        component={ConfirmEmail}
        options={({route}: any) => ({
          headerShown: false,
        })}
      />
      <Stack.Screen
        name="Drawer"
        component={DrawerNavigator}
        options={() => ({
          headerShown: false,
        })}
      />
      <Stack.Screen
        name="ChatRoom"
        component={ChatRoomScreen}
        options={({route}: any) => ({
          headerTitle: () => <ChatRoomHeader id={route.params?.id} />,
          // headerLeft:()=>(
          //     <HeaderBackButton onPress={()=>{navigation.navigate('Chats')}}  tintColor={'white'}/>
          // ),
          headerBackTitleVisible: false,
        })}
      />
      <Stack.Screen
        name="DetailProject"
        component={DetailProjectScreen}
        options={({route}: any) => ({
          headerTitle: 'Detail Project',
          headerBackTitleVisible: false,
        })}
      />
      <Stack.Screen
        name="AddMember"
        component={AddMember}
        options={({route}: any) => ({
          headerTitle: 'Add Member',
          headerBackTitleVisible: false,
        })}
      />
      <Stack.Screen
        name="CreateNewTask"
        component={CreateNewTask}
        options={({route}: any) => ({
          headerTitle: 'Create New Task',
          headerBackTitleVisible: false,
        })}
      />
      <Stack.Screen
        name="DetailTask"
        component={DetailTask}
        options={({route}: any) => ({
          headerTitle: 'Detail Task',
          headerBackTitleVisible: false,
        })}
      />
      <Stack.Screen
        name="AddContact"
        component={AddContact}
        options={({route}: any) => ({
          headerTitle: 'Add New Contact',
          headerBackTitleVisible: false,
          headerLeft:()=>(
            <HeaderBackButton onPress={()=>{navigation.navigate('Friends')}} tintColor={'white'}/>
        ),
        })}
      />
      <Stack.Screen
        name="CreateNewGroup"
        component={CreateNewGroup}
        options={({route}: any) => ({
          headerTitle: 'Create New Group',
          headerBackTitleVisible: false,
        })}
      />
    </Stack.Navigator>
  );
}

function DrawerNavigator() {
  return (
    <Drawer.Navigator
      drawerContent={props => <DrawerContent {...props} />}
      screenOptions={{
        headerStyle: {
          backgroundColor: Colors.light.tint,
          shadowOpacity: 0,
          elevation: 0,
        },
        headerTintColor: Colors.light.background,
        headerTitleAlign: 'left',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}>
      <Drawer.Screen
        name="Main"
        component={MainTabNavigator}
        options={defaultOptions}
      />
    </Drawer.Navigator>
  );
}
