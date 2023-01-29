import AntDesign from 'react-native-vector-icons/AntDesign';
import Entypo from 'react-native-vector-icons/Entypo';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Octicons from 'react-native-vector-icons/Octicons';
import RNTextArea from '@freakycoder/react-native-text-area';
import {useNavigation} from '@react-navigation/native';
import {Auth, DataStore, Predicates, SortDirection} from 'aws-amplify';
import React, {useEffect, useState} from 'react';
import {
  Alert,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {ScrollView, TextInput} from 'react-native-gesture-handler';
import {Transition, Transitioning} from 'react-native-reanimated';
import CustomButton from '../components/CustomButton';
import DropDown from '../components/DropDown';
import {Project, ProjectStatus, ProjectUser, Task, User} from '../models';
import { isCurrentRoute } from '../utils';
import { useSelector } from 'react-redux';

const transition = (
  <Transition.Together>
    <Transition.In type="fade" durationMs={200} />
    <Transition.Change />
    <Transition.Out type="fade" durationMs={200} />
  </Transition.Together>
);

export default function DashBoardScreen() {
  const [currentIndex, setCurrentIndex] = React.useState(null);
  const [projects, setProjects] = useState([]);
  const [allProjects, setAllProjects] = useState([]);
  const [dropdownUsers, setDropdownUsers] = useState([]);
  const [mapTasks, setMapTasks] = useState({});
  const [membersOfProject, setMembersOfProject] = useState({});
  const [yourTasks, setYourTasks] = useState([]);
  const [tasksCreated, setTasksCreated] = useState([]);

  const ref = React.useRef<any>();
  const [inputSearchProject, setInputSearchProject] = useState(null);
  const navigation = useNavigation<any>();

  const currentUser = useSelector((store:any) => store.currentUser);
  const callSession = useSelector((store:any) => store.activeCall.session);
  const isIcoming = useSelector((store:any) => store.activeCall.isIcoming);
  const isEarlyAccepted = useSelector((store:any) => store.activeCall.isEarlyAccepted);
  // const { showActionSheetWithOptions } = useActionSheet();

  // LogBox.ignoreAllLogs();
  useEffect(() => {
    // query users
    try {
      const fetchProjects = async () => {
        const userData = await Auth.currentAuthenticatedUser();
        const projects = await DataStore.query(ProjectUser, Predicates.ALL, {
          sort: message => message.createdAt(SortDirection.DESCENDING),
        });

        const projectsCurrUser = projects.filter(
          projectUser => projectUser.user.id == userData.attributes.sub,
        );
        setProjects(projectsCurrUser);
        setAllProjects(projectsCurrUser);
      };
      fetchProjects();
    } catch (error) {}
  }, []);

  useEffect(() => {
    const fetch = async () => {
      const userData = await Auth.currentAuthenticatedUser();
      const tasks = (await DataStore.query(Task)).filter(
        e => e.assignee == userData.attributes.sub,
      );
      setYourTasks(tasks);
    };
    fetch();
  }, []);

  useEffect(() => {
    const fetch = async () => {
      const userData = await Auth.currentAuthenticatedUser();
      const tasks = (await DataStore.query(Task)).filter(
        e => e.assigner == userData.attributes.sub,
      );
      setTasksCreated(tasks);
    };
    fetch();
  }, []);
  
  useEffect(() => {
    if (isIcoming && !isEarlyAccepted) {
      const isAlreadyOnIncomingCallScreen = isCurrentRoute(navigation, 'IncomingCallScreen');
      const isAlreadyOnVideoScreenScreen = isCurrentRoute(navigation, 'VideoScreen');
      if (!isAlreadyOnIncomingCallScreen && !isAlreadyOnVideoScreenScreen) {
        // incoming call
        navigation.push('IncomingCallScreen', { });
      }
    }
  }, [callSession, isIcoming, isEarlyAccepted]);

  useEffect(() => {
    if (isEarlyAccepted) {
      navigation.push('VideoScreen', { });
    }
  }, [isEarlyAccepted]);

  const fetchMembersAndTask = async () => {
    const userData = await Auth.currentAuthenticatedUser();
    const projects = await DataStore.query(ProjectUser, Predicates.ALL, {
      sort: message => message.createdAt(SortDirection.DESCENDING),
    });

    const projectsCurrUser = projects.filter(
      projectUser => projectUser.user.id == userData.attributes.sub,
    );
    const membersOfProject: any = {};
    projectsCurrUser.map(project => {
      const projectMembers: any = projects.filter(
        e => e.project.id == project.project.id,
      );
      membersOfProject[project.id] = projectMembers.length;
    });
    setMembersOfProject(membersOfProject);

    let mapTasks = {};
    await Promise.all(
      projectsCurrUser.map(async project => {
        const task: any = (await DataStore.query(Task)).filter(
          task => task.projectID == project.project.id,
        );
        mapTasks[project.id] = task;
      }),
    );
    setMapTasks(mapTasks);
  };

  useEffect(() => {
    fetchMembersAndTask();
  }, [allProjects]);

  useEffect(() => {
    // query users
    try {
      const fetchUsers = async () => {
        const userData = await Auth.currentAuthenticatedUser();
        const authUser = await DataStore.query(User, userData.attributes.sub);
        let usersQuery = [];
        let dropdownUsers = [];
        await Promise.all(
          authUser.friends.map(async friend => {
            const user: any = await DataStore.query(User, friend);
            usersQuery.push(user);
            dropdownUsers.push({
              label: user.name,
              value: user.id,
            });
          }),
        );
        // setMembers(usersQuery);
        setDropdownUsers(dropdownUsers);
      };
      fetchUsers();
    } catch (error) {}
  }, []);

  useEffect(() => {
    const subscription = DataStore.observe(ProjectUser).subscribe(async msg => {
      const userData = await Auth.currentAuthenticatedUser();
      if (
        msg.model === ProjectUser &&
        msg.opType === 'INSERT' &&
        userData.attributes.sub == msg.element.user.id
      ) {
        setProjects(existingProject => [msg.element, ...existingProject]);
        setAllProjects(existingProject => [msg.element, ...existingProject]);
        // fetchMembersAndTask();
      }

      if (
        msg.model === ProjectUser &&
        msg.opType === 'DELETE' &&
        userData.attributes.sub == msg.element.user.id
      ) {
        setProjects(existingProject => {
          return [
            ...existingProject.filter(
              e => e.project.id != msg.element.project.id,
            ),
          ];
        });
        setAllProjects(existingProject => [
          ...existingProject.filter(
            e => e.project.id != msg.element.project.id,
          ),
        ]);
      }
      fetchMembersAndTask();
    });

    return () => subscription.unsubscribe();
  }, []);

  const onPressViewMore = projectId => {
    navigation.navigate('DetailProject', {projectId});
  };

  const navigateToDetailTask = (taskId)=>{
    navigation.navigate('DetailTask', {taskId})
  }

  return (
    <SafeAreaView style={{marginBottom: 50}}>
      <View style={{padding: 15, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0abfad', marginBottom: 10}}>
        <Text style={{color: "white", fontSize: 18, fontWeight: '900'}}>Welcome </Text>
      </View>
      <ScrollView style={{backgroundColor: '#fff', flexGrow: 1, marginBottom: 20}}>

        <View style={{paddingLeft: 15,paddingRight: 15, marginBottom: 20}}>
          <Text style={{fontSize: 18, fontWeight: '900', marginBottom: 10}}>
            Total task: {Number(yourTasks.length) + Number(tasksCreated.length)}
          </Text>
          <View>
            <Text style={{fontSize: 15, fontWeight: '900'}}>
              Bug task: {yourTasks?.filter(e=>e.type == 0).length + tasksCreated?.filter(e=>e.type == 0).length}
            </Text>
            <View style={{flexDirection: 'row', marginLeft: 20, justifyContent:"space-between"}}>
              <Text style={{paddingLeft: 10, paddingRight: 10, fontSize: 15, fontWeight: '900', color: 'green'}}>
                Open: {yourTasks?.filter(e=>e.processStep == 0 && e.type == 0).length + tasksCreated?.filter(e=>e.processStep == 0 && e.type == 0).length}
              </Text>
              <Text style={{paddingLeft: 10, paddingRight: 10, fontSize: 15, fontWeight: '900', color: 'orange'}}>
                Pending: {yourTasks?.filter(e=>e.processStep == 1  && e.type == 0).length + tasksCreated?.filter(e=>e.processStep == 1 && e.type == 0).length}
              </Text>
              <Text style={{paddingLeft: 10, paddingRight: 10, fontSize: 15, fontWeight: '900', color: 'red'}}>
                Close: {yourTasks?.filter(e=>e.processStep == 2  && e.type == 0).length + tasksCreated?.filter(e=>e.processStep == 2 && e.type == 0).length}
              </Text>
            </View>
          </View>
          <View style={{borderBottomWidth: 1, paddingBottom: 10}}>
            <Text style={{fontSize: 15, fontWeight: '900'}}>
              Feature task: {yourTasks?.filter(e=>e.type == 1).length + tasksCreated?.filter(e=>e.type == 1).length}
            </Text>
            <View style={{flexDirection: 'row', marginLeft: 20, justifyContent:"space-between"}}>
              <Text style={{paddingLeft: 10, paddingRight: 10, fontSize: 15, fontWeight: '900', color: 'green'}}>
                Open: {yourTasks?.filter(e=>e.processStep == 1 && e.type == 1).length + tasksCreated?.filter(e=>e.processStep == 1 && e.type == 1).length}
              </Text>
              <Text style={{paddingLeft: 10, paddingRight: 10, fontSize: 15, fontWeight: '900', color: 'orange'}}>
                Pending: {yourTasks?.filter(e=>e.processStep == 1  && e.type == 1).length + tasksCreated?.filter(e=>e.processStep == 1 && e.type == 1).length}
              </Text>
              <Text style={{paddingLeft: 10, paddingRight: 10, fontSize: 15, fontWeight: '900', color: 'red'}}>
                Close: {yourTasks?.filter(e=>e.processStep == 2  && e.type == 1).length + tasksCreated?.filter(e=>e.processStep == 2 && e.type == 1).length}
              </Text>
            </View>
          </View>
          <View>
            <Text style={{fontSize: 15, fontWeight: '900'}}>
              Your task: {Number(yourTasks.length)}
            </Text>
            <View style={{flexDirection: 'row', marginLeft: 20, justifyContent:"space-between"}}>
              <Text style={{paddingLeft: 10, paddingRight: 10, fontSize: 15, fontWeight: '900', color: 'green'}}>
                Open: {yourTasks?.filter(e=>e.processStep == 0).length}
              </Text>
              <Text style={{paddingLeft: 10, paddingRight: 10, fontSize: 15, fontWeight: '900', color: 'orange'}}>
                Pending: {yourTasks?.filter(e=>e.processStep == 1).length}
              </Text>
              <Text style={{paddingLeft: 10, paddingRight: 10, fontSize: 15, fontWeight: '900', color: 'red'}}>
                Close: {yourTasks?.filter(e=>e.processStep == 2).length}
              </Text>
            </View>
          </View>
          <View>
            <Text style={{fontSize: 15, fontWeight: '900'}}>
              Task Created: {Number(tasksCreated.length)}
            </Text>
            <View style={{flexDirection: 'row', marginLeft: 20, justifyContent:"space-between"}}>
              <Text style={{paddingLeft: 10, paddingRight: 10, fontSize: 15, fontWeight: '900', color: 'green'}}>
                Open: {tasksCreated?.filter(e=>e.processStep == 0).length}
              </Text>
              <Text style={{paddingLeft: 10, paddingRight: 10, fontSize: 15, fontWeight: '900', color: 'orange'}}>
                Pending: {tasksCreated?.filter(e=>e.processStep == 1).length}
              </Text>
              <Text style={{paddingLeft: 10, paddingRight: 10, fontSize: 15, fontWeight: '900', color: 'red'}}>
                Close: {tasksCreated?.filter(e=>e.processStep == 2).length}
              </Text>
            </View>
          </View>
        </View>

        <View>
          <View>
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}>
              <Text
                style={{
                  padding: 5,
                  fontSize: 15,
                  fontWeight: '900',
                  fontStyle: 'italic',
                  marginLeft: 10,
                }}>
                Your tasks
              </Text>
              <View style={{flexDirection: 'row', alignItems: 'center'}}>
                <Text
                  style={{
                    marginRight: 5,
                    fontSize: 10,
                    fontStyle: 'italic',
                  }}>
                  All
                </Text>
                <Entypo name="arrow-with-circle-right" size={20} />
              </View>
            </View>
          </View>
          {yourTasks.slice(0, 2).map((task, index) => {
            return (
              <View key={index} style={styles.cardIssue}>
                <View>
                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}>
                    <View
                      style={{
                        alignItems: 'center',
                        flexDirection: 'row',
                        justifyContent: 'flex-start',
                      }}>
                      <FontAwesome name="dot-circle-o" size={15} color="red" />
                      <Text style={styles.issuesCode}>{task.code}</Text>
                    </View>
                    <View
                      style={{
                        justifyContent: 'flex-end',
                        alignItems: 'flex-end',
                      }}>
                      <Pressable
                        style={{flexDirection: 'row', alignItems: 'center'}}
                        onPress={()=>navigateToDetailTask(task.id)}>
                        <Text
                          style={{
                            marginRight: 5,
                            fontSize: 10,
                            fontStyle: 'italic',
                          }}>
                          View more
                        </Text>
                        <Entypo name="arrow-with-circle-right" size={20} />
                      </Pressable>
                    </View>
                  </View>
                  <Text
                    style={{fontSize: 13, overflow: 'hidden', maxWidth: '90%'}}
                    numberOfLines={2}>
                    <Text style={{fontWeight: '900'}}>Summary: </Text>
                    {task.summary}
                  </Text>
                </View>
              </View>
            );
          })}
        </View>

        <View>
          <View>
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}>
              <Text
                style={{
                  padding: 5,
                  fontSize: 15,
                  fontWeight: '900',
                  fontStyle: 'italic',
                  marginLeft: 10,
                }}>
                Task you created
              </Text>
              <View style={{flexDirection: 'row', alignItems: 'center'}}>
                <Text
                  style={{
                    marginRight: 5,
                    fontSize: 10,
                    fontStyle: 'italic',
                  }}>
                  All
                </Text>
                <Entypo name="arrow-with-circle-right" size={20} />
              </View>
            </View>
          </View>
          {tasksCreated.slice(0, 2).map((task, index) => {
            return (
              <View key={index} style={styles.cardIssue}>
                <View>
                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}>
                    <View
                      style={{
                        alignItems: 'center',
                        flexDirection: 'row',
                        justifyContent: 'flex-start',
                      }}>
                      <FontAwesome name="dot-circle-o" size={15} color="red" />
                      <Text style={styles.issuesCode}>{task.code}</Text>
                    </View>
                    <View
                      style={{
                        justifyContent: 'flex-end',
                        alignItems: 'flex-end',
                      }}>
                      <Pressable
                        style={{flexDirection: 'row', alignItems: 'center'}}
                        onPress={()=>navigateToDetailTask(task.id)}>
                        <Text
                          style={{
                            marginRight: 5,
                            fontSize: 10,
                            fontStyle: 'italic',
                          }}>
                          View more
                        </Text>
                        <Entypo name="arrow-with-circle-right" size={20} />
                      </Pressable>
                    </View>
                  </View>
                  <Text
                    style={{fontSize: 13, overflow: 'hidden', maxWidth: '90%'}}
                    numberOfLines={2}>
                    <Text style={{fontWeight: '900'}}>Summary: </Text>
                    {task.summary}
                  </Text>
                </View>
              </View>
            );
          })}
        </View>

        <Transitioning.View
          ref={ref}
          transition={transition}
          style={styles.container}>
          {/* <StatusBar hidden /> */}
          <View style={{flexDirection: 'row', justifyContent: 'space-between', width: '100%'}}>
            <View style={{
                flexDirection: 'row',
                alignItems: 'center',
                paddingLeft: 20,
                justifyContent: 'space-between',
                width: '100%'
              }}>
              <Text style={{padding: 5, fontSize: 15, fontWeight: '900'}}>
                Projects
              </Text>
              <View style={{flexDirection: 'row', alignItems: 'center'}}>
                <Text
                  style={{
                    marginRight: 5,
                    fontSize: 10,
                    fontStyle: 'italic',
                  }}>
                  All
                </Text>
                <Entypo name="arrow-with-circle-right" size={20} />
              </View>
            </View>
          </View>

          {projects && projects.length > 0 ? (
            projects
              .slice(0, 2)
              .map(({id, project, user, createdAt}, index) => {
                return (
                  <TouchableOpacity
                    key={id + index}
                    onPress={() => {
                      ref.current.animateNextTransition();
                      setCurrentIndex(index === currentIndex ? null : index);
                    }}
                    style={styles.cardContainer}
                    activeOpacity={0.9}>
                    <View style={[styles.card, {backgroundColor: '#086E4B'}]}>
                      <View style={styles.projectName}>
                        <View style={{flexGrow: 1}}>
                          <Text style={[styles.heading, {color: '#FCBE4A'}]}>
                            {project?.key}
                          </Text>
                        </View>
                        <View style={{flexDirection: 'row'}}>
                          <Text style={styles.owner}>Owner: {user.name}</Text>
                        </View>
                      </View>
                      {index === currentIndex && (
                        <>
                          <View style={styles.subCategoriesList}>
                            {mapTasks[id] && mapTasks[id].length > 0 ? (
                              mapTasks[id].map(({id, code}, index) => (
                                <>
                                  <Text
                                    key={id + index}
                                    style={[
                                      styles.body,
                                      {
                                        flexDirection: 'row',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                      },
                                    ]}>
                                    <View
                                      style={{
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                      }}>
                                      {index % 2 == 0 ? (
                                        <FontAwesome
                                          name="dot-circle-o"
                                          size={15}
                                          color="red"
                                        />
                                      ) : (
                                        <FontAwesome
                                          name="check-circle"
                                          size={15}
                                          color="blue"
                                        />
                                      )}
                                    </View>
                                    <View style={{paddingLeft: 10}}>
                                      <Pressable onPress={()=>navigation.navigate('DetailTask', {taskId:id})}>
                                        <Text
                                          style={{
                                            textDecorationLine: 'underline',
                                            color: '#c9c6c6',
                                            fontStyle: 'italic',
                                          }}>
                                          {code}
                                        </Text>
                                      </Pressable>
                                    </View>
                                  </Text>
                                </>
                              ))
                            ) : (
                              <Text
                                key={id}
                                style={[
                                  styles.body,
                                  {
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                  },
                                ]}>
                                <View style={{paddingLeft: 10}}>
                                  <Text
                                    style={{
                                      textDecorationLine: 'underline',
                                      color: '#c9c6c6',
                                      fontStyle: 'italic',
                                    }}>
                                    {'No exist Task'}
                                  </Text>
                                </View>
                              </Text>
                            )}
                          </View>
                        </>
                      )}
                      <View
                        style={{
                          width: '100%',
                          flexDirection: 'column',
                          justifyContent: 'space-between',
                          marginTop: 10,
                          marginBottom: 5,
                        }}>
                        <View>
                          <Text style={{fontSize: 13, color: '#c9c6c6'}}>
                            <Text style={{color: '#FCBE4A', fontWeight: '900'}}>
                              Status:{' '}
                            </Text>
                            {project.status}
                          </Text>
                          <Text
                            style={{
                              fontSize: 13,
                              color: '#c9c6c6',
                              overflow: 'hidden',
                              maxWidth: '90%',
                            }}
                            numberOfLines={2}>
                            <Text style={{color: '#FCBE4A', fontWeight: '900'}}>
                              Description:{' '}
                            </Text>
                            {project.description}
                          </Text>
                        </View>
                        <View
                          style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            justifyContent: 'flex-end',
                            marginTop: 10,
                          }}>
                          {/* <Pressable onPress={()=>{confirmDeleteProject(project.id)}}>
                      <MaterialIcons name="delete-forever" size={24} color="#c51a1a" />
                    </Pressable> */}
                          <View
                            style={{
                              flexDirection: 'row',
                              alignItems: 'flex-end',
                              justifyContent: 'flex-end',
                            }}>
                            <View
                              style={{
                                flexDirection: 'row',
                                alignItems: 'center',
                                marginRight: 20,
                              }}>
                              <MaterialCommunityIcons
                                name="account-multiple"
                                size={24}
                                color="black"
                              />
                              <Text
                                style={{
                                  marginRight: 5,
                                  fontSize: 10,
                                  fontStyle: 'italic',
                                  color: '#FCBE4A',
                                }}>
                                Members: {membersOfProject[id]}
                              </Text>
                            </View>
                            <Pressable
                              style={{
                                flexDirection: 'row',
                                alignItems: 'center',
                              }}
                              onPress={() => onPressViewMore(project.id)}>
                              <Text
                                style={{
                                  marginRight: 5,
                                  fontSize: 10,
                                  fontStyle: 'italic',
                                  color: '#FCBE4A',
                                }}>
                                View more
                              </Text>
                              <Entypo
                                name="arrow-with-circle-right"
                                size={24}
                                color="#FCBE4A"
                              />
                            </Pressable>
                          </View>
                        </View>
                      </View>
                    </View>
                  </TouchableOpacity>
                );
              })
          ) : (
            <View
              style={{
                justifyContent: 'center',
                alignItems: 'center',
                flexGrow: 1,
              }}>
              <Text style={{fontSize: 20}}>No existed projects</Text>
            </View>
          )}
        </Transitioning.View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    // justifyContent: 'center',
  },
  cardContainer: {
    // flexGrow: 1,
    marginBottom: 2,
    justifyContent: 'flex-start',
  },
  card: {
    flexGrow: 1,
    alignItems: 'flex-start',
    justifyContent: 'center',
    paddingTop: 10,
    paddingBottom: 10,
    paddingLeft: 10,
    paddingRight: 10,
  },
  heading: {
    fontSize: 20,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: -1,
    marginLeft: 10,
    // marginTop: 20,
    // marginBottom: 20
  },
  body: {
    fontSize: 13,
    lineHeight: 13 * 1.5,
    // textAlign: 'left',
  },
  subCategoriesList: {
    marginTop: 20,
    marginBottom: 10,
  },
  projectName: {
    flexGrow: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  owner: {
    fontSize: 10,
    color: '#c9c6c6',
    marginRight: 10,
  },
  input: {
    height: 40,
    margin: 12,
    borderWidth: 1,
    padding: 10,
    borderRadius: 10,
  },
  formContainer: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 10,
    borderBottomWidth: 1,
  },
  fieldName: {
    marginLeft: 20,
  },
  textareaContainer: {
    height: 180,
    padding: 5,
    backgroundColor: '#F5FCFF',
  },
  textarea: {
    textAlignVertical: 'top', // hack android
    height: 170,
    fontSize: 14,
    color: '#333',
    marginBottom: 12,
    marginTop: 12,
    borderWidth: 1,
    padding: 10,
    borderRadius: 10,
  },
  cardIssue: {
    backgroundColor: '#c9c6c6',
    padding: 10,
    marginBottom: 2,
  },
  issuesCode: {
    fontSize: 18,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: -1,
    marginLeft: 10,
    color: '#FD5963',
    // marginTop: 20,
    // marginBottom: 20
  },
});
