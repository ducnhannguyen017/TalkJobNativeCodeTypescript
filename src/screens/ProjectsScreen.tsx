
import AntDesign from 'react-native-vector-icons/AntDesign'
import Entypo from 'react-native-vector-icons/Entypo'
import FontAwesome from 'react-native-vector-icons/FontAwesome'
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons'
import MaterialIcons from 'react-native-vector-icons/MaterialIcons'
import Octicons from 'react-native-vector-icons/Octicons'
import RNTextArea from "@freakycoder/react-native-text-area";
import { useNavigation } from '@react-navigation/native';
import { Auth, DataStore, Predicates, SortDirection } from 'aws-amplify';
import React, { useEffect, useState } from 'react';
import { Alert, Pressable, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { ScrollView, TextInput } from 'react-native-gesture-handler';
import { Transition, Transitioning } from 'react-native-reanimated';
import CustomButton from '../components/CustomButton';
import DropDown from '../components/DropDown';
import { Project, ProjectStatus, ProjectUser, Task, User } from '../models';

const transition = (
  <Transition.Together>
    <Transition.In type='fade' durationMs={200} />
    <Transition.Change />
    <Transition.Out type='fade' durationMs={200} />
  </Transition.Together>
);

export default function ProjectsScreen() {
  const [loading, setLoading] = useState(false);
  const [currentIndex, setCurrentIndex] = React.useState(null);
  const [projectName, setProjectName] = useState(null);
  const [projectKey, setProjectKey] = useState(null);
  const [members, setMembers] = useState(null);
  const [description, setDescription] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [projects, setProjects] = useState([]);
  const [allProjects, setAllProjects] = useState([]);
  const [dropdownUsers, setDropdownUsers] = useState([]);
  const [mapTasks, setMapTasks] = useState({});
  const [membersOfProject, setMembersOfProject] = useState({});

  const ref = React.useRef<any>();
  const [inputSearchProject, setInputSearchProject] = useState(null);
  const navigation = useNavigation<any>();
  // const { showActionSheetWithOptions } = useActionSheet();

  // LogBox.ignoreAllLogs();
  useEffect(() => {
    // query users
    try {
      const fetchProjects = async () => {
        const userData = await Auth.currentAuthenticatedUser();
        const projects  = (await DataStore.query(ProjectUser,Predicates.ALL,{
          sort: (message) => message.createdAt(SortDirection.DESCENDING),
        }));

        const projectsCurrUser = projects.filter(projectUser=> projectUser.user.id == userData.attributes.sub);
        setProjects(projectsCurrUser);
        setAllProjects(projectsCurrUser);

        // const membersOfProject:any={};
        // projectsCurrUser.map(project=>{
        //   const projectMembers:any = projects.filter(e=> e.project.id == project.project.id);
        //   membersOfProject[project.id] = projectMembers.length;
        // });
        // setMembersOfProject(membersOfProject);

        // let mapTasks ={}
        // await Promise.all(
        //   projectsCurrUser.map(async(project) => {
        //     const task:any = (await DataStore.query(Task)).filter(task=> task.projectID == project.project.id);
        //     mapTasks[project.id]=task
        //   }));
        // setMapTasks(mapTasks);
      };
      fetchProjects();
    } catch (error) {}
  }, []);

  const fetchMembersAndTask = async()=>{
      const userData = await Auth.currentAuthenticatedUser();
      const projects  = (await DataStore.query(ProjectUser,Predicates.ALL,{
        sort: (message) => message.createdAt(SortDirection.DESCENDING),
      }));

      const projectsCurrUser = projects.filter(projectUser=> projectUser.user.id == userData.attributes.sub);
      const membersOfProject:any={};
      projectsCurrUser.map(project=>{
        const projectMembers:any = projects.filter(e=> e.project.id == project.project.id);
        membersOfProject[project.id] = projectMembers.length;
      });
      setMembersOfProject(membersOfProject);

      let mapTasks ={}
      await Promise.all(
        projectsCurrUser.map(async(project) => {
          const task:any = (await DataStore.query(Task)).filter(task=> task.projectID == project.project.id);
          mapTasks[project.id]=task
        }));
      setMapTasks(mapTasks);
  }
  useEffect(() => {
    fetchMembersAndTask()
  }, [allProjects])
  
 
  useEffect(() => {
    // query users
    try {
      const fetchUsers = async () => {
        const userData = await Auth.currentAuthenticatedUser();
        const authUser  = (await DataStore.query(User, userData.attributes.sub))
        let usersQuery=[];
        let dropdownUsers = [];
        await Promise.all(
          authUser.friends.map(async(friend) => {
            const user:any = (await DataStore.query(User, friend));
            usersQuery.push(user);
            dropdownUsers.push({
              label: user.name,
              value: user.id
            })
          }));
          // setMembers(usersQuery);
          setDropdownUsers(dropdownUsers)
      };
      fetchUsers();
    } catch (error) {}
  }, []);

  useEffect(() => {
    const subscription = DataStore.observe(ProjectUser).subscribe(async(msg) => {
      const userData = await Auth.currentAuthenticatedUser();
      if (msg.model === ProjectUser && msg.opType === "INSERT" && userData.attributes.sub == msg.element.user.id) {
        setProjects((existingProject) => [msg.element, ...existingProject]);
        setAllProjects((existingProject) => [msg.element, ...existingProject]);
        // fetchMembersAndTask();
      }
      
      if (msg.model === ProjectUser && msg.opType === "DELETE" && userData.attributes.sub == msg.element.user.id) {
        setProjects((existingProject) => {
          return [...existingProject.filter(e=>e.project.id != msg.element.project.id)]});
          setAllProjects((existingProject) => [...existingProject.filter(e=>e.project.id != msg.element.project.id)]);
      }
      fetchMembersAndTask();
    });

    return () => subscription.unsubscribe();
  }, []);
  
  const onSaveProject=async()=>{
    setLoading(true);
    const save = async()=>{
      const userData = await Auth.currentAuthenticatedUser();
      const authUser  = (await DataStore.query(User, userData.attributes.sub));

      const newProject = await DataStore.save(
        new Project({
          key: projectKey.toUpperCase(),
          name: projectName,
          description: description,
          status: ProjectStatus.PENDING,
          Owner: authUser
        })
      )
      saveProjectUser(authUser, newProject )
      if(members.length > 0){
        await Promise.all(
          members.map(async(userId) => {
            const user = (await DataStore.query(User, userId))
            return saveProjectUser(user, newProject)
          })
        );
      }
    }

    save().then(()=>{
      setLoading(false);
      setShowCreateForm(false);
      setProjectKey(null)
      setProjectName(null)
      setDescription(null);
    })
  }

  const saveProjectUser=async(user, project)=>{
    await DataStore.save(new ProjectUser({
      user,
      project
    }))
  }

  const onChangeInputSearch = (text)=>{
    setInputSearchProject(text);
    setProjects(allProjects.filter(e=> e.project.key.includes(text)))
  }

  const confirmDeleteProject = (id)=>{
    Alert.alert(
      "Confirm delete",
      "Are you sure you want to delete the message?",
      [
        {
          text: "Delete",
          onPress: ()=>deleteProject(id),
          style: "destructive",
        },
        {
          text: "Cancel",
        },
      ]
    );
  }

  const onPressViewMore=(projectId)=>{
    navigation.navigate("DetailProject", {projectId})
  }
  
  const deleteProject = async (id) => {
    const projectUsers = (await DataStore.query(ProjectUser)).filter(e=>e.project.id == id);
    await Promise.all(
      projectUsers.map(async(pu) => {
        await DataStore.delete(pu);
      }));

    await DataStore.clear();
    await DataStore.start();

    // const project = (await DataStore.query(Project, id));
    // await DataStore.delete(project);
  };

  return (
    <SafeAreaView>
      <ScrollView style={{backgroundColor:"#fff", flexGrow: 1}} >
        <Transitioning.View
          ref={ref}
          transition={transition}
          style={styles.container}
        >
          {/* <StatusBar hidden /> */}
          <View style={{flexDirection: "row", justifyContent:"space-between"}}>
            <View style={{flexDirection: "row", alignItems:"center", marginLeft: 20}}>
              <Octicons name="dot-fill" size={24} color="black"/>
              <Text style={{padding: 5,fontSize: 20,fontWeight: '900', marginLeft: 10}}>Projects</Text>
            </View>
            {showCreateForm && (
              <Pressable onPress={()=>setShowCreateForm(!showCreateForm)} style={{flexDirection:"row", alignItems:"center", marginRight: 20}}>
                <Text style={{marginRight: 5, fontSize: 15, fontStyle:"italic", textDecorationLine:"underline", color:"black"}}>Cancel</Text>
                <MaterialIcons name="cancel" size={20} color="black" />
              </Pressable>
            )}
            {!showCreateForm && (
              <Pressable onPress={()=>setShowCreateForm(!showCreateForm)} style={{flexDirection:"row", alignItems:"center", marginRight: 20}}>
                <Text style={{marginRight: 5, fontSize: 15, fontStyle:"italic", textDecorationLine:"underline", color:"black"}}>Create</Text>
                <AntDesign name="pluscircleo" size={20} color="black" />
              </Pressable>
            )}
          </View>
          {showCreateForm && (
            <View style={styles.formContainer}>
              {/* <Entypo name="creative-cloud" size={50} color="black" /> */}
              <View>
                <TextInput
                  style={[styles.input,{marginLeft: 0, marginRight: 0, marginBottom: 0}]}
                  onChangeText={setProjectKey}
                  value={projectKey}
                  placeholder="Key"
                />
              </View>
              <View>
                <TextInput
                  style={[styles.input,{marginLeft: 0, marginRight: 0}]}
                  onChangeText={setProjectName}
                  value={projectName}
                  placeholder="Name"
                />
              </View>
              <View>
                <DropDown placeHolder="Members" value={members} setValue={setMembers} items={dropdownUsers} setItems={setDropdownUsers}/>
              </View>
              <View>
                <RNTextArea
                  style={[styles.textarea]}
                  maxCharLimit={50}
                  placeholderTextColor="black"
                  exceedCharCountColor="#990606"
                  placeholder={"Description..."}
                  onChangeText={setDescription}
                />
              </View>
              <CustomButton loading={loading} label={"Save"} onPress={()=>onSaveProject()} />
            </View>
          )}
      
          <TextInput
            style={styles.input}
            onChangeText={(text)=> onChangeInputSearch(text)}
            value={inputSearchProject}
            placeholder="Search"
          />

          {projects && projects.length > 0 ?
          projects.map(({id, project, user, createdAt}, index) => {
            return (
              <TouchableOpacity
                key={id+index}
                onPress={() => {
                  ref.current.animateNextTransition();
                  setCurrentIndex(index === currentIndex ? null : index);
                }}
                style={styles.cardContainer}
                activeOpacity={0.9}
              >
                <View style={[styles.card, { backgroundColor: '#086E4B' }]}>
                  <View style={styles.projectName}>
                    <View style={{flexGrow: 1}}>
                      <Text style={[styles.heading, { color: '#FCBE4A' }]}>{project?.key}</Text>
                    </View>
                    <View style={{flexDirection: "row"}}>
                      <Text style={styles.owner}>Owner: {user.name}</Text>
                    </View>
                  </View>
                  {index === currentIndex && (
                      <>
                        <View style={styles.subCategoriesList}>
                        {mapTasks[id] && mapTasks[id].length > 0 ?
                          mapTasks[id].map(({id, code}, index) => (
                            <>
                              <Text key={id+index} style={[styles.body, {flexDirection:"row", alignItems:"center", justifyContent:"center"}]}>
                                <View style={{alignItems:"center", justifyContent:"center"}}>
                                  {index % 2 == 0 ?(
                                    <FontAwesome name="dot-circle-o" size={15} color="red" />
                                  ):(<FontAwesome name="check-circle" size={15} color="blue" />)}
                                </View>
                                <View style={{paddingLeft: 10}}><Text style={{textDecorationLine:"underline", color: "#c9c6c6", fontStyle:"italic"}}>{code}</Text></View>
                              </Text>
                              <Text>...</Text>
                            </>
                          )):(
                            <Text key={id} style={[styles.body, {flexDirection:"row", alignItems:"center", justifyContent:"center"}]}>
                              <View style={{paddingLeft: 10}}><Text style={{textDecorationLine:"underline", color: "#c9c6c6", fontStyle:"italic"}}>{"No exist Task"}</Text></View>
                            </Text>
                          )
                        }
                        </View>
                      </>
                  )}
                <View style={{ width:"100%",flexDirection:"column", justifyContent:"space-between", marginTop: 10, marginBottom: 5}}>
                  <View>
                    <Text style={{fontSize: 13, color: "#c9c6c6"}}>
                      <Text style={{color:"#FCBE4A",fontWeight: '900',}}>Status:  </Text>
                      {project.status}
                    </Text>
                    <Text style={{fontSize: 13, color: "#c9c6c6", overflow: "hidden", maxWidth: "90%", }} numberOfLines={2}>
                    <Text style={{color:"#FCBE4A",fontWeight: '900',}}>Description:  </Text>
                    {project.description}
                    </Text>
                  </View>
                  <View style={{ flexDirection:"row", alignItems:"center", justifyContent:"space-between", marginTop: 10}}>
                    <Pressable onPress={()=>{confirmDeleteProject(project.id)}}>
                      <MaterialIcons name="delete-forever" size={24} color="#c51a1a" />
                    </Pressable>
                    <View style={{ flexDirection:"row", alignItems:"flex-end", justifyContent:"flex-end"}}>
                      <View style={{flexDirection:"row", alignItems:"center", marginRight: 20}}>
                        <MaterialCommunityIcons name="account-multiple" size={24} color="black" />
                        <Text style={{marginRight: 5, fontSize: 12, fontStyle:"italic", color:"#FCBE4A"}}>Members: {membersOfProject[id]}</Text>
                      </View>
                      <Pressable style={{flexDirection:"row",alignItems:"center"}} onPress={()=>onPressViewMore(project.id)}>
                        <Text style={{marginRight: 5, fontSize: 12, fontStyle:"italic", color:"#FCBE4A"}}>View more</Text>
                        <Entypo name="arrow-with-circle-right" size={24} color="#FCBE4A" />
                      </Pressable>
                    </View>
                  </View>
      
                </View>
                </View>
              </TouchableOpacity>
            );
          }):(
            <View style={{justifyContent:"center", alignItems:"center", flexGrow:1}}>
              <Text style={{fontSize:20}}>No existed projects</Text>
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
    marginBottom:2,
    justifyContent: "flex-start"
  },
  card: {
    flexGrow: 1,
    alignItems: 'flex-start',
    justifyContent: 'center',
    paddingTop: 20,
    paddingBottom: 10,
    paddingLeft: 10,
    paddingRight: 10
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
  projectName:{flexGrow: 1, flexDirection: "row", alignItems: 'center', justifyContent: "space-between"},
  owner: {
    fontSize: 12,
    color: "#c9c6c6",
    marginRight: 10
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
    borderBottomWidth: 1
  },
  fieldName:{
    marginLeft: 20
  },
  textareaContainer: {
    height: 180,
    padding: 5,
    backgroundColor: '#F5FCFF',
  },
  textarea: {
    textAlignVertical: 'top',  // hack android
    height: 170,
    fontSize: 14,
    color: '#333',
    marginBottom: 12,
    marginTop: 12,
    borderWidth: 1,
    padding: 10,
    borderRadius: 10,
  },
});