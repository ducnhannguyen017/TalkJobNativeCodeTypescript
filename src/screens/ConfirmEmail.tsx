import { useNavigation } from "@react-navigation/core";
import { Auth } from 'aws-amplify';
import React, { useState } from 'react';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import { Alert, SafeAreaView, Text, TouchableOpacity, View } from 'react-native';
import CustomButton from '../components/CustomButton';
import InputField from '../components/InputField';

const ConfirmEmail = ({ email }) => {
  const [confirmCode, setConfirmCode] = useState(null);
  const [userName, setUserName] = useState(null);
  const [isLoading, setIsLoading] = useState(null);
  const navigation = useNavigation<any>();
  // const [userName, setUserName] = useState(email)

  const confirmEmail = async()=>{
    try {
      const res = await Auth.confirmSignUp(userName, confirmCode)
      if(res == "SUCCESS"){
        Alert.alert("Confirm success")
        navigation.navigate("Login")
      }
    } catch (error) {
      Alert.alert(error.message)
    }
  }

  const resendCode = async()=>{
    try {
      const res = await Auth.resendSignUp(userName);
      Alert.alert("Resend Success", "Wait a minute")
      console.log("[res]", res)
    } catch (error) {
      Alert.alert(error.message)
    }
  }

  return (
    <SafeAreaView style={{ flex: 1, justifyContent: 'center' }}>
      <View style={{ paddingHorizontal: 25 }}>
        <View style={{ alignItems: 'center' }}>
          <FontAwesome name="flag-checkered" size={24} color="black" />
        </View>

        <Text
          style={{
            fontSize: 28,
            fontWeight: '500',
            color: '#333',
            marginBottom: 30,
            marginTop: 30
          }}>
          Confirm Email
        </Text>

        <InputField
          label={'Email'}
          icon={
            <MaterialCommunityIcons
              name="ticket-confirmation-outline"
              size={20}
              color="#666"
              style={{ marginRight: 5 }}
            />
          }
          keyboardType="email-address"
          onChangeText={setUserName}
          value={userName}
        />
        <InputField
          label={'Code'}
          icon={
            <MaterialCommunityIcons
              name="ticket-confirmation-outline"
              size={20}
              color="#666"
              style={{ marginRight: 5 }}
            />
          }
          keyboardType="email-address"
          onChangeText={setConfirmCode}
          value={confirmCode}
        />
        <CustomButton loading={isLoading} label={"Confirm"} onPress={() => {confirmEmail()}} />
        <CustomButton loading={isLoading} label={"Resend"} onPress={() => {resendCode()}} />

        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'center',
            marginBottom: 30,
          }}>
          <Text>Go back to </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <Text style={{ color: '#AD40AF', fontWeight: '700' }}> Login</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default ConfirmEmail;