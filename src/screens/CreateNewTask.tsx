import RNTextArea from "@freakycoder/react-native-text-area";
import { useNavigation } from "@react-navigation/core";
import { Auth, DataStore, Predicates, SortDirection } from "aws-amplify";
import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  TextInput, View
} from "react-native";
import { Dropdown } from "react-native-element-dropdown";
import CustomButton from "../components/CustomButton";
import { Project, ProjectUser, Task, User } from "../models";

const items = [
  {
    id: "92iijs7yta",
    name: "Ondo",
  },
  {
    id: "a0s0a8ssbsd",
    name: "Ogun",
  },
  {
    id: "16hbajsabsd",
    name: "Calabar",
  },
  {
    id: "nahs75a5sg",
    name: "Lagos",
  },
  {
    id: "667atsas",
    name: "Maiduguri",
  },
  {
    id: "hsyasajs",
    name: "Anambra",
  },
  {
    id: "djsjudksjd",
    name: "Benue",
  },
  {
    id: "sdhyaysdj",
    name: "Kaduna",
  },
  {
    id: "suudydjsjd",
    name: "Abuja",
  },
];
function CreateNewTask() {
  const [type, setType] = useState(null);
  const [dropdownType, setDropdownType] = useState([
    {
      label: "Bug",
      value: 0,
    },
    {
      label: "Feature",
      value: 1,
    },
  ]);
  const [assignee, setAssignee] = useState(null);
  const [assigneeData, setAssigneeData] = useState([]);
  const [project, setProject] = useState(null);
  const [projectData, setProjectData] = useState([]);
  const [status, setStatus] = useState(0);
  const [statusData, setStatusData] = useState([
    {
      label: "Open",
      value: 0
    },
    {
      label: "Pending",
      value: 1
    },
    {
      label: "Close",
      value: 2
    },
  ]);
  const [summary, setSummary] = useState(null);
  const [description, setDescription] = useState(null);
  const [loading, setLoading] = useState(false);

  const navigation = useNavigation<any>();


  useEffect(() => {
    // query users
    try {
      const fetchUsers = async () => {
        const userData = await Auth.currentAuthenticatedUser();
        const authUser  = (await DataStore.query(User, userData.attributes.sub))
        let usersQuery=[];
        await Promise.all(
          authUser.friends.map(async(friend) => {
            const user:any = (await DataStore.query(User, friend));
            usersQuery.push(user)
          }));
          setAssigneeData(usersQuery);
      };
      fetchUsers();
    } catch (error) {}
  }, []);

  useEffect(() => {
    // query users
    try {
      const fetchProjects = async () => {
        const userData = await Auth.currentAuthenticatedUser();
        const projects  = (await DataStore.query(ProjectUser,Predicates.ALL,{
          sort: (message) => message.createdAt(SortDirection.DESCENDING),
        }));

        const projectsCurrUser = projects.filter(projectUser=> projectUser.user.id == userData.attributes.sub).map(e=>e.project);
        setProjectData(projectsCurrUser);

      };
      fetchProjects();
    } catch (error) {}
  }, []);

  const onSaveTask = async() => {
    const userData = await Auth.currentAuthenticatedUser();
    const lastTask  = (await DataStore.query(Task,c => c.projectID("eq", project),{
      sort: (task) => task.createdAt(SortDirection.DESCENDING),
      limit: 1,
    }))[0];
    const projectCode = (await DataStore.query(Project, project)).key
    await DataStore.save(new Task({
      summary: summary,
      projectID: project,
      description: description,
      processStep: 0,
      assignee: assignee,
      assigner: userData.attributes.sub,
      taskIndex: lastTask.taskIndex + 1,
      code: `${projectCode}-${lastTask.taskIndex + 1}`
    }))
    navigation.navigate("Issues");
  };
  return (
    <View style={styles.formContainer}>
      {/* <Entypo name="creative-cloud" size={50} color="black" /> */}
      <View>
        <TextInput
          style={[
            styles.input,
            { marginLeft: 0, marginRight: 0, marginBottom: 0 },
          ]}
          onChangeText={setSummary}
          value={summary}
          placeholder="Summary"
        />
      </View>

      <View>
        <RNTextArea
          style={[styles.textarea]}
          maxCharLimit={50}
          placeholderTextColor="gray"
          exceedCharCountColor="#990606"
          placeholder={"Description..."}
          onChangeText={setDescription}
        />
      </View>
      <View>
        <Dropdown
          style={styles.dropdown}
          placeholderStyle={styles.placeholderStyle}
          selectedTextStyle={styles.selectedTextStyle}
          inputSearchStyle={styles.inputSearchStyle}
          iconStyle={styles.iconStyle}
          data={dropdownType}
          search
          maxHeight={300}
          labelField="label"
          valueField="value"
          placeholder="Type"
          searchPlaceholder="Search..."
          value={type}
          onChange={(item) => {
            setType(item.value);
          }}
        />
      </View>
      <View style={{ marginTop: 10 }}>
        <Dropdown
          style={styles.dropdown}
          placeholderStyle={styles.placeholderStyle}
          selectedTextStyle={styles.selectedTextStyle}
          inputSearchStyle={styles.inputSearchStyle}
          iconStyle={styles.iconStyle}
          data={statusData}
          search
          maxHeight={300}
          labelField="label"
          valueField="value"
          placeholder="Status"
          searchPlaceholder="Search..."
          value={status}
          onChange={(item) => {
            setStatus(item.value);
          }}
        />
      </View>
      <View style={{ marginTop: 10 }}>
        <Dropdown
          style={styles.dropdown}
          placeholderStyle={styles.placeholderStyle}
          selectedTextStyle={styles.selectedTextStyle}
          inputSearchStyle={styles.inputSearchStyle}
          iconStyle={styles.iconStyle}
          data={assigneeData}
          search
          maxHeight={300}
          labelField="name"
          valueField="id"
          placeholder="Assignee"
          searchPlaceholder="Search..."
          value={assignee}
          onChange={(item) => {
            setAssignee(item.id);
          }}
        />
      </View>
      <View style={{ marginTop: 10, marginBottom: 30 }}>
        <Dropdown
          style={styles.dropdown}
          placeholderStyle={styles.placeholderStyle}
          selectedTextStyle={styles.selectedTextStyle}
          inputSearchStyle={styles.inputSearchStyle}
          iconStyle={styles.iconStyle}
          data={projectData}
          search
          maxHeight={300}
          labelField="key"
          valueField="id"
          placeholder="Project"
          searchPlaceholder="Search..."
          value={project}
          onChange={(item) => {
            setProject(item.id);
          }}
        />
      </View>
      <CustomButton
        loading={loading}
        label={"Save"}
        onPress={() => onSaveTask()}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  textarea: {
    textAlignVertical: "top", // hack android
    height: 170,
    fontSize: 14,
    color: "#333",
    marginBottom: 12,
    marginTop: 12,
    borderWidth: 1,
    padding: 10,
    borderRadius: 10,
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
    backgroundColor: "#fff",
    padding: 10,
    borderBottomWidth: 1,
  },
  containerDropDown: {
    // flex: 1,
    // justifyContent: 'center',
    // alignItems: 'center',
    // backgroundColor: '#F5FCFF',
    marginTop: 10,
    // backgroundColor: "red",
    // height: 40,
    // margin: 12,
    borderWidth: 1,
    // padding: 10,
    borderRadius: 10,
  },
  multiSelectContainer: {
    height: 50,
    width: "100%",
    padding: 10,
  },
  dropdown: {
    // margin: 16,
    // height: 50,
    borderBottomColor: "gray",
    borderBottomWidth: 0.5,
    height: 40,
    marginTop: 12,
    borderWidth: 1,
    padding: 10,
    borderRadius: 10,
  },
  icon: {
    marginRight: 5,
  },
  placeholderStyle: {
    fontSize: 16,
    color: "gray"
  },
  selectedTextStyle: {
    fontSize: 16,
  },
  iconStyle: {
    width: 20,
    height: 20,
  },
  inputSearchStyle: {
    height: 40,
    fontSize: 16,
  },
  itemContainerStyle:{
    // marginTop: 0,
    backgroundColor: "red"
  }
});

export default CreateNewTask;
