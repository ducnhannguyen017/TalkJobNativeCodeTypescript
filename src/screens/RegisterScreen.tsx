import { useNavigation } from '@react-navigation/core';
import { Auth, DataStore } from 'aws-amplify';
import React, { useState } from 'react';
import {
  Alert, SafeAreaView,
  ScrollView, Text, TouchableOpacity, View
} from 'react-native';
import AntDesign from 'react-native-vector-icons/AntDesign';
import Entypo from 'react-native-vector-icons/Entypo';
import Ionicons from 'react-native-vector-icons/Ionicons';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import CustomButton from '../components/CustomButton';
import InputField from '../components/InputField';
import { User } from '../models';
import authService from '../services/auth-service';

const RegisterScreen = () => {
  const [fullName, setFullName] = useState(null);
  const [email, setEmail] = useState(null);
  const [password, setPassword] = useState(null);
  const [confirmPassword, setConfirmPassword] = useState(null);
  const [phone, setPhone] = useState(null);
  const navigation = useNavigation<any>();
  const [isLoading, setIsLoading] = useState(false);

  const onRegister = async () => {
    console.log("[Register]")
        //     await DataStore.clear();
        // await DataStore.start();
    
    if(password !== confirmPassword){
      Alert.alert("Oop!", "Password does not match");
      return;
    }
    if(password.length < 8){
      Alert.alert("Oop!", "Password is at least 8 characters long");
      return;
    }
    setIsLoading(true);
    try {
      let name = email.split('@')[0];
      try {
        const userSignup = await Auth.signUp({
          username: email,
          password: password,
        });
        console.log("userSignup", userSignup)
      } catch (error) {
        console.log(error.message)
        return;
      }
      const user = await DataStore.save(
        new User({
          name: fullName,
          email: email,
          friends: [],
          imageUri:
            'https://talkjob-app-bucket164426-staging.s3.us-east-2.amazonaws.com/default-user-image.png',
          status: `Hi, I'm ${fullName}`,
          phone: phone,
          displayName: fullName,
        }),
      );
      const userProfile = {
        login: name,
        password: user.id,
        email: email,
        full_name: fullName,
        phone: phone,
      };

      console.log(userProfile)

      authService
        .signUp(userProfile)
        .then(() => {
          // Alert.alert('Account successfully registered');
        })
        .catch(error => {
          console.log(JSON.stringify(error))
          Alert.alert(`Error.${JSON.stringify(error)}`);
        });
      navigation.navigate('ConfirmEmail', email)
    } catch (error) {
      Alert.alert('Oops!', error.message);
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <SafeAreaView style={{flex: 1, justifyContent: 'center'}}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        style={{paddingHorizontal: 25}}>
        <View style={{alignItems: 'center', marginTop: 20}}>
          <FontAwesome name="registered" size={24} color="black" />
        </View>

        <Text
          style={{
            fontSize: 28,
            fontWeight: '500',
            color: '#333',
            marginBottom: 30,
          }}>
          Register
        </Text>

        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            marginBottom: 30,
          }}>
          <TouchableOpacity
            onPress={() => {}}
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
            onPress={() => {}}
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
            onPress={() => {}}
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

        <Text style={{textAlign: 'center', color: '#666', marginBottom: 30}}>
          Or, register with email ...
        </Text>

        <InputField
          label={'Full Name'}
          icon={<Ionicons
            name="person-outline"
            size={20}
            color="#666"
            style={{marginRight: 5}}
          />}
          onChangeText={setFullName}
          value={fullName}
        />

        <InputField
          label={'Email'}
          icon={<MaterialIcons
            name="alternate-email"
            size={20}
            color="#666"
            style={{marginRight: 5}}
          />}
          keyboardType="email-address"
          onChangeText={setEmail}
          value={email}
        />

        <InputField
          label={'Phone'}
          icon={<AntDesign name="phone" size={24} color="black" />}
          onChangeText={setPhone}
          value={phone}
        />

        <InputField
          label={'Password'}
          icon={<Ionicons
            name="ios-lock-closed-outline"
            size={20}
            color="#666"
            style={{marginRight: 5}}
          />}
          inputType="password"
          onChangeText={setPassword}
          value={password}
        />

        <InputField
          label={'Confirm Password'}
          icon={<Ionicons
            name="ios-lock-closed-outline"
            size={20}
            color="#666"
            style={{marginRight: 5}}
          />}
          inputType="password"
          onChangeText={setConfirmPassword}
          value={confirmPassword}
        />

        <CustomButton label={'Register'} loading={isLoading} onPress={() => onRegister()} />

        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'center',
            marginBottom: 30,
          }}>
          <Text>Already registered?</Text>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={{color: '#AD40AF', fontWeight: '700'}}> Login</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default RegisterScreen;
