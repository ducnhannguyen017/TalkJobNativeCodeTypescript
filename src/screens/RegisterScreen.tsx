import React, {useState} from 'react';
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert
} from 'react-native';
import InputField from '../components/InputField';
import CustomButton from '../components/CustomButton';
import AntDesign from 'react-native-vector-icons/AntDesign';
import Entypo from 'react-native-vector-icons/Entypo';
import {Auth, DataStore} from 'aws-amplify';
import {User} from '../models';
import { useNavigation } from "@react-navigation/core";
import ConnectyCube from 'react-native-connectycube';

const RegisterScreen = () => {
  const [fullName, setFullName] = useState(null);
  const [email, setEmail] = useState(null);
  const [password, setPassword] = useState(null);
  const [confirmPassword, setConfirmPassword] = useState(null);
  const [phone, setPhone] = useState(null);
  const navigation = useNavigation<any>();


  const onRegister = async () => {
    try {
      let name = email.split('@')[0];
      await Auth.signUp({
        username: email,
        password: password,
      });
      await DataStore.save(
        new User({
          name: name,
          email: email,
          friends: [],
          imageUri: 'https://talkjob-app-bucket164426-staging.s3.us-east-2.amazonaws.com/default-user-image.png',
          status: `Hi, I'm ${fullName}`,
          phone: phone,
          displayName: fullName
        }),
      );
      const userProfile = {
        login: name,
        password: name,
        email: email,
        full_name: fullName,
        phone: phone,
      };
      
      await ConnectyCube.users
        .signup(userProfile)
        .then((user) => {
          console.log("user", user)
        })
        .catch((error) => {
          console.log("error", error)
        });
      // navigation.navigate('ConfirmEmail')
    } catch (error) {
      Alert.alert('Oops!', error.message)
      
    }
  };
  return (
    <SafeAreaView style={{flex: 1, justifyContent: 'center'}}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        style={{paddingHorizontal: 25}}>
        <View style={{alignItems: 'center'}}>
          <AntDesign name="google" size={24} color="black" />
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
          icon={<AntDesign name="twitter" size={24} color="black" />}
          onChangeText={setFullName}
          value={fullName}
        />

        <InputField
          label={'Email'}
          icon={<AntDesign name="twitter" size={24} color="black" />}
          keyboardType="email-address"
          onChangeText={setEmail}
          value={email}
        />

        <InputField
          label={'Phone'}
          icon={<AntDesign name="twitter" size={24} color="black" />}
          keyboardType="email-address"
          onChangeText={setPhone}
          value={phone}
        />

        <InputField
          label={'Password'}
          icon={<AntDesign name="twitter" size={24} color="black" />}
          inputType="password"
          onChangeText={setPassword}
          value={password}
        />

        <InputField
          label={'Confirm Password'}
          icon={<AntDesign name="twitter" size={24} color="black" />}
          inputType="password"
          onChangeText={setConfirmPassword}
          value={confirmPassword}
        />

        {/* <View
          style={{
            flexDirection: 'row',
            borderBottomColor: '#ccc',
            borderBottomWidth: 1,
            paddingBottom: 8,
            marginBottom: 30,
          }}>
          <AntDesign name="twitter" size={24} color="black" />
          <TouchableOpacity onPress={() => setOpen(true)}>
            <Text style={{color: '#666', marginLeft: 5, marginTop: 5}}>
              {dobLabel}
            </Text>
          </TouchableOpacity>
        </View> */}

        {/* <DatePicker
          modal
          open={open}
          date={date}
          mode={'date'}
          maximumDate={new Date('2005-01-01')}
          minimumDate={new Date('1980-01-01')}
          onConfirm={date => {
            setOpen(false);
            setDate(date);
            setDobLabel(date.toDateString());
          }}
          onCancel={() => {
            setOpen(false);
          }}
        /> */}

        <CustomButton label={'Register'} onPress={() => onRegister()} />

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
