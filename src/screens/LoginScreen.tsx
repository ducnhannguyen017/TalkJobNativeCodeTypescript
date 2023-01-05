import AntDesign from 'react-native-vector-icons/AntDesign'
import Entypo from 'react-native-vector-icons/Entypo'
import Ionicons from 'react-native-vector-icons/Ionicons'
import MaterialIcons from 'react-native-vector-icons/MaterialIcons'
import { useNavigation } from '@react-navigation/native';
import { Auth, DataStore } from 'aws-amplify';
import React, { useEffect, useState } from 'react';

import {
  SafeAreaView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
} from 'react-native';

// import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
// import Ionicons from 'react-native-vector-icons/Ionicons';

// import LoginSVG from '../assets/images/misc/login.svg';
// import GoogleSVG from '../assets/images/misc/google.svg';
// import FacebookSVG from '../assets/images/misc/facebook.svg';
// import TwitterSVG from '../assets/images/misc/twitter.svg';

import CustomButton from '../components/CustomButton';
import InputField from '../components/InputField';
import authService from '../services/auth-service';
import store from '../store';
import { setCurrentUser } from '../actions/currentUser';
import callService from '../services/call-service';
import pushNotificationsService from '../services/pushnotifications-service';
import { User } from '../models';

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState(null);
  const [password, setPassword] = useState(null);
  const [isLoading, setIsLoading] = useState(false)
  // const navigation = useNavigation<any>();

  // useEffect(() => {
  //   const fetch = async () => {
  //     const userData = await Auth.currentAuthenticatedUser();
  //     if (userData.attributes.sub) {
  //       navigation.push('Drawer');
  //     } else {
  //       navigation.push('Login');
  //     }
  //   }
  //   fetch();
  // }, [])


  const login = async() => {
    setIsLoading(true);
    try{
      await Auth.signIn(email, password).then(async(res)=>{
        // const userData = await Auth.currentAuthenticatedUser();
        await DataStore.clear();
        await DataStore.start();
        const authUser  = (await DataStore.query(User, res.attributes.sub))
        console.log("authUser", authUser)
        await authService.login(authUser)
        store.dispatch(setCurrentUser(authUser))
        callService.init();
        pushNotificationsService.init();

        navigation?.navigate('Drawer');
      });
    }catch(e){
      Alert.alert('Oops', e.message)
    }
    setIsLoading(false)
  }

  return (
    <SafeAreaView style={{ flex: 1, justifyContent: 'center' }}>
      <View style={{ paddingHorizontal: 25 }}>
        <View style={{ alignItems: 'center' }}>
          <AntDesign name="login" size={24} color="black" />
        </View>

        <Text
          style={{
            fontSize: 28,
            fontWeight: '500',
            color: '#333',
            marginBottom: 30,
          }}>
          Login
        </Text>

        <InputField
          label={'Email ID'}
          icon={
            <MaterialIcons
              name="alternate-email"
              size={20}
              color="#666"
              style={{ marginRight: 5 }}
            />
          }
          keyboardType="email-address"
          onChangeText={setEmail}
          value={email}
        />

        <InputField
          label={'Password'}
          icon={
            <Ionicons
              name="ios-lock-closed-outline"
              size={20}
              color="#666"
              style={{ marginRight: 5 }}
            />
          }
          inputType="password"
          fieldButtonLabel={"Forgot?"}
          fieldButtonFunction={() => { }}
          onChangeText={setPassword}
          value={password}
        />

        <CustomButton loading={isLoading} label={"Login"} onPress={() => login()} />

        <Text style={{ textAlign: 'center', color: '#666', marginBottom: 30 }}>
          Or, login with ...
        </Text>

        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            marginBottom: 30,
          }}>
          <TouchableOpacity
            onPress={() => { }}
            style={{
              borderColor: '#ddd',
              borderWidth: 2,
              borderRadius: 10,
              paddingHorizontal: 30,
              paddingVertical: 10,
            }}>
            <AntDesign name="google" size={24} color="black" />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => { }}
            style={{
              borderColor: '#ddd',
              borderWidth: 2,
              borderRadius: 10,
              paddingHorizontal: 30,
              paddingVertical: 10,
            }}>
            <Entypo name="facebook" size={24} color="black" />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => { }}
            style={{
              borderColor: '#ddd',
              borderWidth: 2,
              borderRadius: 10,
              paddingHorizontal: 30,
              paddingVertical: 10,
            }}>
            <AntDesign name="twitter" size={24} color="black" />
          </TouchableOpacity>
        </View>

        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'center',
            marginBottom: 30,
          }}>
          <Text>New to the app?</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Register')}>
            <Text style={{ color: '#AD40AF', fontWeight: '700' }}> Register</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default LoginScreen;