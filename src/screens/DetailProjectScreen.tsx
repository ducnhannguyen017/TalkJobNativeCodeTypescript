import { useNavigation, useRoute } from "@react-navigation/core";
import { DataStore } from "aws-amplify";
import moment from "moment";
import React, { useEffect, useState } from "react";
import { Alert, Image, Pressable, StyleSheet, Text, View } from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import { Transition } from "react-native-reanimated";
import AntDesign from "react-native-vector-icons/AntDesign";
import Entypo from "react-native-vector-icons/Entypo";
import { MapLabelProcessStep } from "../constants/Common";
import { Project, ProjectUser, Task } from "../models";

const transition = (
  <Transition.Together>
    <Transition.In type="fade" durationMs={200} />
    <Transition.Change />
    <Transition.Out type="fade" durationMs={200} />
  </Transition.Together>
);

const DetailProjectScreen = () => {
  const route = useRoute<any>();
  const [project, setProject] = useState(null);
  const [members, setMembers] = useState([]);
  const [membersIndex, setMembersIndex] = React.useState(null);
  const [tasksIndex, setTasksIndex] = useState(null);
  const [tasks, setTasks] = useState([]);
  const ref = React.useRef<any>();
  const navigation = useNavigation<any>();

  useEffect(() => {
    const fetchChatRoom = async () => {
      if (!route.params?.projectId) {
        console.warn("No project id provided");
        return;
      }
      const project = await DataStore.query(Project, route.params?.projectId);
      if (!project) {
        console.error("Couldn't find a chat room with this id");
      } else {
        setProject(project);
      }
      //---------
      const members = await (
        await DataStore.query(ProjectUser)
      )
        .filter((e) => e.project.id == route.params?.projectId)
        // .map((e) => e.user)
        .filter((e) => e.id != project.Owner.id);
      setMembers(members);
    };
    fetchChatRoom();
  }, []);

  useEffect(() => {
    const fetch = async () => {
      const tasks = await (
        await DataStore.query(Task)
      ).filter((e) => e.projectID == route.params?.projectId);
      setTasks(tasks);
    };
    fetch();
  }, []);

  const confirmDeleteMember = (id)=>{
    Alert.alert(
      "Confirm delete",
      "Are you sure you want to delete the message?",
      [
        {
          text: "Delete",
          onPress: ()=>deleteMember(id),
          style: "destructive",
        },
        {
          text: "Cancel",
        },
      ]
    );
  }
  const deleteMember=async (id)=>{
    const pu = await DataStore.query(ProjectUser, id);
    await DataStore.delete(pu);
    // await DataStore.clear();
    // await DataStore.start();
  }

  useEffect(() => {
    const subscription = DataStore.observe(ProjectUser).subscribe(async(msg) => {
      if (msg.model === ProjectUser && msg.opType === "INSERT") {
        setMembers((existingProject) => [msg.element, ...existingProject]);
      }
      if (msg.model === ProjectUser && msg.opType === "DELETE") {
        setMembers(existingProject=> existingProject.filter(e=>e.user.id != msg.element.user.id))
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <ScrollView style={styles.container}>
      <View>
        <Text
          style={{
            fontSize: 15,
            fontWeight: "bold",
            backgroundColor: "#c9c6c6",
            marginTop: 20,
            padding: 10,
          }}
        >
          Project Information
        </Text>
        <View
          style={[styles.card, styles.shadowProp, { flexDirection: "column" }]}
        >
          <View style={{ width: "100%" }}>
            <Text style={styles.heading}>Owner: {project?.Owner.name}</Text>
          </View>
          <View style={{ flexDirection: "row" }}>
            <View>
              <View>
                <Text style={styles.heading}>Key: {project?.key}</Text>
              </View>
              <View>
                <Text style={styles.heading}>Name: {project?.name}</Text>
              </View>
              <View>
                <Text style={styles.heading}>Status: {project?.status}</Text>
              </View>
            </View>
            <View style={{ marginLeft: 30 }}>
              <View>
                <Text style={styles.heading}>
                  Description: {project?.description}
                </Text>
              </View>
              <View>
                <Text style={styles.heading}>
                  Created at: {moment(project?.createdAt).format("MMM Do YY")}
                </Text>
              </View>
            </View>
          </View>
        </View>
      </View>
      <View>
        <View
          style={{
            backgroundColor: "#c9c6c6",
            marginTop: 20,
            padding: 10,
            display: "flex",
            flexDirection: "row",
            justifyContent: "space-between",
          }}
        >
          <Text style={{ fontSize: 15, fontWeight: "bold" }}>Members</Text>
          <Pressable
            onPress={() =>
              navigation.navigate("AddMember", {
                projectId: route.params?.projectId,
              })
            }
            style={{ marginRight: 15 }}
          >
            <AntDesign name="pluscircleo" size={24} color="black" />
          </Pressable>
        </View>
        {members.map(({user, id}, index) => {
          return (
            <View
              key={index}
              style={[
                styles.shadowProp,
                styles.card,
                {
                  flexDirection: "column",
                  backgroundColor: "#c9c6c6",
                  // borderRadius: 8,
                  paddingVertical: 10,
                  // paddingHorizontal: 25,
                  width: "100%",
                  marginTop: 5,
                },
              ]}
            >
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <View>
                  <Text>Name: {user.name}</Text>
                  <Text>Email: {user.email}</Text>
                </View>
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                  }}
                >
                  <Image
                    source={{ uri: user.imageUri }}
                    style={styles.image}
                  />
                  <Pressable onPress={()=>confirmDeleteMember(id)}>
                    <Entypo name="trash" size={24} color="red" />
                  </Pressable>
                </View>
              </View>
            </View>
          );
        })}
      </View>
      <View>
        <View
          style={{
            backgroundColor: "#c9c6c6",
            marginTop: 20,
            padding: 10,
            display: "flex",
            flexDirection: "row",
            justifyContent: "space-between",
          }}
        >
          <Text style={{ fontSize: 15, fontWeight: "bold" }}>Task</Text>
          <Pressable
            onPress={() =>
              navigation.navigate("Issues", {
                projectId: route.params?.projectId,
              })
            }
            style={{ marginRight: 15 }}
          >
            {/* <Pressable onPress={()=>navigation.navigate("Issues")}> */}
              <AntDesign name="arrowright" size={24} color="black" />
            {/* </Pressable> */}
          </Pressable>
        </View>
        {tasks.map((task, index) => {
          return (
            <View
              key={index}
              style={[
                styles.shadowProp,
                styles.card,
                {
                  flexDirection: "column",
                  backgroundColor: "#c9c6c6",
                  // borderRadius: 8,
                  paddingVertical: 10,
                  // paddingHorizontal: 25,
                  width: "100%",
                  marginTop: 5,
                },
              ]}
            >
              <View>
                <Text>Summary: {task.summary}</Text>
                <Text>Status: {MapLabelProcessStep[`value${task.processStep}`]}</Text>
              </View>
            </View>
          );
        })}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    marginTop: 10,
    // padding: 20
    // justifyContent: 'center',
  },
  card: {
    backgroundColor: "#c9c6c6",
    // borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 25,
    width: "100%",
    borderTopWidth: 1,
    // marginVertical: 10,
  },
  heading: {
    // fontSize: 18,
    fontWeight: "600",
    marginBottom: 13,
  },
  shadowProp: {
    shadowColor: "#171717",
    shadowOffset: { width: -2, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  cardContainer: {
    // flexGrow: 1,
    marginBottom: 2,
    justifyContent: "flex-start",
  },
  projectName: {
    flexGrow: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  owner: {
    fontSize: 12,
    color: "#c9c6c6",
    marginRight: 10,
  },
  cardO: {
    flexGrow: 1,
    alignItems: "flex-start",
    justifyContent: "center",
    paddingTop: 20,
    paddingBottom: 10,
    paddingLeft: 10,
    paddingRight: 10,
  },
  body: {
    fontSize: 13,
    lineHeight: 13 * 1.5,
    // textAlign: 'left',
  },
  subCategoriesList: {
    // marginTop: 20,
    marginBottom: 10,
  },
  image: {
    height: 50,
    width: 50,
    borderRadius: 30,
    marginRight: 10,
    // backgroundColor:"red"
  },
});

export default DetailProjectScreen;
