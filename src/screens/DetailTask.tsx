import {View, Text, StyleSheet, Image, Pressable, Alert} from 'react-native';
import React, {useEffect, useState} from 'react';
import {useNavigation, useRoute} from '@react-navigation/core';
import {DataStore} from 'aws-amplify';
import {Task, User} from '../models';
import {
  MapLabelProcessStep,
  MapLabelTaskType,
  ProcessStep,
} from '../constants/Common';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import CustomButton from '../components/CustomButton';
import { useSelector } from 'react-redux';

const DetailTask = () => {
  const route = useRoute<any>();
  const [task, setTask] = useState<any>();
  const [assigner, setAssigner] = useState(null);
  const [assignee, setAssignee] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [processStep, setProcessStep] = useState(null);
  const user = useSelector((store:any) => store.currentUser);
  let defaultProcessStep;

  useEffect(() => {
    const fetch = async () => {
      const task = await DataStore.query(Task, route.params.taskId);
      setTask(task);
      setProcessStep(task.processStep);
      defaultProcessStep = task.processStep;
    };
    fetch();
  }, []);

  useEffect(() => {
    const fetch = async () => {
      if (task?.assigner) {
        const assigner = await DataStore.query(User, task.assigner);
        setAssigner(assigner);
      }
      if (task?.assignee) {
        const assignee = await DataStore.query(User, task.assignee);
        setAssignee(assignee);
      }
    };

    fetch();
  }, [task]);

  const handleClickProcessStep = index => {
    setProcessStep(index);
  };

  const handleSaveProcessStep = async () => {
    console.log("__save")
    setIsLoading(true);
    const response = await DataStore.save(
      Task.copyOf(task, updated => {
        updated.processStep = processStep;
      }),
    );
    Alert.alert("Save success")
    setIsLoading(false);
  };

  useEffect(() => {
    console.log("user, user", user)
  }, [])
  

  return (
    <View style={styles.container}>
      <View>
        <View style={{flexDirection: 'row'}}>
          <Text style={{marginBottom: 10, fontSize: 15, fontWeight: '900'}}>
            Code:{' '}
          </Text>
          <Text style={{fontWeight: '500'}}>{task?.code}</Text>
        </View>
        <View style={{flexDirection: 'row'}}>
          <Text style={{marginBottom: 10, fontSize: 15, fontWeight: '900'}}>
            Summary:{' '}
          </Text>
          <Text style={{fontWeight: '500'}}>{task?.summary}</Text>
        </View>
        <View style={{flexDirection: 'row'}}>
          <Text style={{marginBottom: 10, fontSize: 15, fontWeight: '900'}}>
            Description:{' '}
          </Text>
          <Text style={{fontWeight: '500'}}>{task?.description}</Text>
        </View>
        <View style={{flexDirection: 'row'}}>
          <Text style={{marginBottom: 10, fontSize: 15, fontWeight: '900'}}>
            Type:{' '}
          </Text>
          <Text>{MapLabelTaskType[`value${task?.type}`]}</Text>
        </View>
        <View style={{flexDirection: 'column'}}>
          <Text style={{marginBottom: 10, fontSize: 15, fontWeight: '900'}}>
            Assigner:
          </Text>
          <View style={{flexDirection: 'row'}}>
            <View style={{flexDirection: 'column', justifyContent: 'center'}}>
              <Image source={{uri: assigner?.imageUri}} style={styles.image} />
              {user.id != assigner?.id && (
                <Ionicons
                  style={{marginLeft: 10, marginTop: 10}}
                  name="chatbox-ellipses"
                  size={20}
                  color="black"
                />
              )}
            </View>
            <View>
              <View style={{flexDirection: 'row'}}>
                <Text
                  style={{marginBottom: 5, fontSize: 15, fontWeight: '900'}}>
                  Name:
                </Text>
                <Text style={{fontWeight: '500', marginLeft: 10}}>
                  {assigner?.name}
                </Text>
              </View>
              <View style={{flexDirection: 'row'}}>
                <Text
                  style={{marginBottom: 5, fontSize: 15, fontWeight: '900'}}>
                  Status:
                </Text>
                <Text style={{fontWeight: '500', marginLeft: 10}}>
                  {assigner?.status}
                </Text>
              </View>
              <View style={{flexDirection: 'row'}}>
                <Text
                  style={{marginBottom: 5, fontSize: 15, fontWeight: '900'}}>
                  Phone:
                </Text>
                <Text style={{fontWeight: '500', marginLeft: 10}}>
                  {assigner?.phone}
                </Text>
              </View>
              <View style={{flexDirection: 'row'}}>
                <Text
                  style={{marginBottom: 5, fontSize: 15, fontWeight: '900'}}>
                  Email:
                </Text>
                <Text style={{fontWeight: '500', marginLeft: 10}}>
                  {assigner?.email}
                </Text>
              </View>
            </View>
          </View>
        </View>
        <View style={{flexDirection: 'column'}}>
          <Text style={{marginBottom: 10, fontSize: 15, fontWeight: '900'}}>
            Assignee:
          </Text>
          <View style={{flexDirection: 'row'}}>
            <View style={{flexDirection: 'column', justifyContent: 'center'}}>
              <Image source={{uri: assignee?.imageUri}} style={styles.image} />
              {user.id != assignee?.id && (
                <Ionicons
                  style={{marginLeft: 10, marginTop: 10}}
                  name="chatbox-ellipses"
                  size={20}
                  color="black"
                />
              )}
            </View>
            <View>
              <View style={{flexDirection: 'row'}}>
                <Text
                  style={{marginBottom: 5, fontSize: 15, fontWeight: '900'}}>
                  Name:
                </Text>
                <Text style={{fontWeight: '500', marginLeft: 10}}>
                  {assignee?.name}
                </Text>
              </View>
              <View style={{flexDirection: 'row'}}>
                <Text
                  style={{marginBottom: 5, fontSize: 15, fontWeight: '900'}}>
                  Status:
                </Text>
                <Text style={{fontWeight: '500', marginLeft: 10}}>
                  {assignee?.status}
                </Text>
              </View>
              <View style={{flexDirection: 'row'}}>
                <Text
                  style={{marginBottom: 5, fontSize: 15, fontWeight: '900'}}>
                  Phone:
                </Text>
                <Text style={{fontWeight: '500', marginLeft: 10}}>
                  {assignee?.phone}
                </Text>
              </View>
              <View style={{flexDirection: 'row'}}>
                <Text
                  style={{marginBottom: 5, fontSize: 15, fontWeight: '900'}}>
                  Email:
                </Text>
                <Text style={{fontWeight: '500', marginLeft: 10}}>
                  {assignee?.email}
                </Text>
              </View>
            </View>
          </View>
        </View>
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-evenly',
            alignItems: 'center',
            marginTop: 20,
            padding: 10,
            backgroundColor: 'gray',
            borderRadius: 50,
          }}>
          {Object.values(ProcessStep).map((step, index) => {
            const bgc = processStep == index ? step.color : '#c9c6c6';
            const border = processStep == defaultProcessStep ? 1 : 0;
            return (
              <>
                <Pressable
                  style={{
                    paddingVertical: 15,
                    paddingHorizontal: 20,
                    borderRadius: 50,
                    backgroundColor: bgc,
                    borderWidth: border,
                  }}
                  onPress={() => handleClickProcessStep(index)}>
                  <Text
                    style={{fontSize: 18, fontWeight: '900', color: '#fff'}}>
                    {MapLabelProcessStep[`value${step.value}`]}
                  </Text>
                </Pressable>
                {index != Object.values(ProcessStep).length - 1 && (
                  <MaterialIcons name="double-arrow" size={20} color="black" />
                )}
              </>
            );
          })}
        </View>
      </View>
      <CustomButton
        loading={isLoading}
        label={'Save'}
        onPress={() => handleSaveProcessStep()}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 10,
    justifyContent: 'space-between',
  },
  image: {
    height: 50,
    width: 50,
    borderRadius: 30,
    marginRight: 10,
  },
});

export default DetailTask;
