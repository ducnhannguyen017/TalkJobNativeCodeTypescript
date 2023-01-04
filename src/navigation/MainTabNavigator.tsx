import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import AntDesign from 'react-native-vector-icons/AntDesign';
import Ionicons from 'react-native-vector-icons/Ionicons';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import Octicons from 'react-native-vector-icons/Octicons';
import * as React from 'react';


import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Colors from '../constants/Colors';
import DashBoardScreen from '../screens/DashBoardScreen';
import ChatsScreen from '../screens/chats-screen';
import FriendsScreen from '../screens/FriendsScreen';
import ProjectsScreen from '../screens/ProjectsScreen';
import IssuesScreen from '../screens/IssuesScreen';

const BottomTab = createBottomTabNavigator<any>();

function MainTabNavigator() {

  return (
    <BottomTab.Navigator
      initialRouteName="Chats"
      screenOptions={{
        tabBarActiveTintColor: Colors.light.tint,
        headerStyle: {
          backgroundColor: Colors.light.tint,
          shadowOpacity: 0,
          elevation: 0,
        },
        headerTintColor: Colors.light.background,
        headerTitleAlign: 'left',
        headerTitleStyle: {
          fontWeight: 'bold',
        }
      }}>
      <BottomTab.Screen
        name="DashBoard"
        component={DashBoardScreen}
        options={({navigation}:any)=>({
          tabBarIcon: ({ color }) => <MaterialIcons name="dashboard" size={24} color={color} />,
          headerShown: false,
          tabBarOptions: {
            showIcon: false,
          }
        })}
      />
      <BottomTab.Screen
        name="Chats"
        component={ChatsScreen}
        options={({ navigation }: any) => ({
          tabBarIcon: ({color})=> <AntDesign name="wechat" size={24} color={color} />,
          headerShown: false,
          tabBarOptions: {
            showIcon: false,
          }
        })}
      />
      <BottomTab.Screen
        name="Friends"
        component={FriendsScreen}
        options={({navigation}:any)=>({
          tabBarIcon: ({ color }) => <FontAwesome name="users" size={24} color={color} />,
          headerShown: false,
          tabBarOptions: {
            showIcon: false,
          }
        })}
      />
      <BottomTab.Screen
        name="Projects"
        component={ProjectsScreen}
        options={({navigation}:any)=>({
          tabBarIcon: ({ color }) => <Octicons name="project" size={24} color={color} />,
          headerShown: false,
          tabBarOptions: {
            showIcon: false,
          }
        })}
      />
      <BottomTab.Screen
        name="Issues"
        component={IssuesScreen}
        options={({navigation}:any)=>({
          tabBarIcon: ({ color }) => <Ionicons name="code-working" size={24} color={color} />,
          headerShown: false,
          tabBarOptions: {
            showIcon: false,
          }
        })}
      />
    </BottomTab.Navigator>
  );
}

export default MainTabNavigator;
