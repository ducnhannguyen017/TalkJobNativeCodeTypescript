/**
 * If you are not familiar with React Navigation, check out the "Fundamentals" guide:
 * https://reactnavigation.org/docs/getting-started
 *
 */
import {
  DarkTheme, DefaultTheme, NavigationContainer
} from "@react-navigation/native";
import * as React from "react";
import {
  ActivityIndicator,
  Alert,
  ColorSchemeName, Pressable, View
} from "react-native";

// import LinkingConfiguration from "./LinkingConfiguration";


import { createDrawerNavigator } from '@react-navigation/drawer';
import { createStackNavigator } from "@react-navigation/stack";
import { Auth, Hub } from "aws-amplify";
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import DrawerContent from "../components/DrawerContent";
import Colors from "../constants/Colors";
import AddMember from "../screens/AddMember";
import ChatRoomScreen from "../screens/ChatRoomScreen";
import CreateNewTask from "../screens/CreateNewTask";
import DetailProjectScreen from "../screens/DetailProjectScreen";
import ChatRoomHeader from "./ChatRoomHeader";
import MainTabNavigator from "./MainTabNavigator";
// import LoginScreen from "../screens/login-screen";
import LoginScreen from "../screens/LoginScreen";
import authService from "../services/auth-service";

const Drawer = createDrawerNavigator();
const Stack = createStackNavigator<any>();

const defaultOptions = ({ navigation }) => ({
  title: "TalkJob",
  headerRight: () => (
    <View style={{
      flexDirection: 'row',
      width: 60,
      justifyContent: 'space-between',
      marginRight: 10,
    }}>
      <MaterialIcons name="search" size={22} color={'white'} />
      <Pressable onPress={() => navigation.openDrawer()}>
        <MaterialCommunityIcons name="dots-vertical" size={22} color={'white'} />
      </Pressable>
    </View>
  ),
  headerLeft: () => (<></>)
});

export default function Navigation({
  colorScheme,
}: {
  colorScheme?: ColorSchemeName;
}) {
  const [currentUser, setCurrentUser] = React.useState(null);

  React.useEffect(() => {
    Hub.listen("auth", (event) => {
      console.log(event)
      if (event.payload.event == 'signIn') {
        setCurrentUser(event.payload.data)
      } else {
        setCurrentUser(null)
      }

      if (event.payload.event == 'signIn_failure') {
        Alert.alert("Opss", "Incorrect account or password")
      }
      if (event.payload.event == 'signUp_failure') {
        Alert.alert("Opss", "An account with the given email already exists")
      }
      if (event.payload.event.split('_')[1] == "failure") {
      }
    })
  })

  return (
    <NavigationContainer
      // linking={LinkingConfiguration}
      theme={colorScheme === "dark" ? DarkTheme : DefaultTheme}
    >
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
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login" component={LoginScreen} />
      {/* <Stack.Screen name="Register" component={RegisterScreen} /> */}
    </Stack.Navigator>
  );
};

function RootNavigator() {
  // console.log(currentUser);
  const [currentUser, setCurrentUser] = React.useState(undefined);
  const checkUser = async () => {
    try {
      const authUser = await Auth.currentAuthenticatedUser({ bypassCache: true });
      console.log("authUser", authUser)
      if (authUser) {
        setCurrentUser(authUser)
      } else {
        setCurrentUser(null)
      }
    } catch (error) {
      setCurrentUser(null)
    }
  }
  React.useEffect(() => {
    checkUser();
  }, []);

  if (currentUser === undefined) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator />
      </View>
    )
  }

  return (
    <Stack.Navigator
      initialRouteName={currentUser ? "Drawer" : "Login"}
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
      }}
    >
      <Stack.Screen
        name="Login"
        component={LoginScreen}
        options={({ route }: any) => ({
          headerShown: false
        })}
      />
      <Stack.Screen
        name="Drawer"
        component={DrawerNavigator}
        options={() => ({
          headerShown: false
        })}
      />
      <Stack.Screen
        name="ChatRoom"
        component={ChatRoomScreen}
        options={({ route }: any) => ({
          headerTitle: () => <ChatRoomHeader id={route.params?.id} />,
          headerBackTitleVisible: false,
        })}
      />
      <Stack.Screen
        name="DetailProject"
        component={DetailProjectScreen}
        options={({ route }: any) => ({
          headerTitle: "Detail Project",
          headerBackTitleVisible: false,
        })}
      />
      <Stack.Screen
        name="AddMember"
        component={AddMember}
        options={({ route }: any) => ({
          headerTitle: "Add Project",
          headerBackTitleVisible: false,
        })}
      />
      <Stack.Screen
        name="CreateNewTask"
        component={CreateNewTask}
        options={({ route }: any) => ({
          headerTitle: "Create New Task",
          headerBackTitleVisible: false,
        })}
      />
    </Stack.Navigator>
  );
}

function DrawerNavigator() {
  return (
    <Drawer.Navigator
      drawerContent={(props) => (<DrawerContent {...props} />)}
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
        }
      }}
    >
      <Drawer.Screen name="Main" component={MainTabNavigator} options={defaultOptions} />
    </Drawer.Navigator>
  )
}
