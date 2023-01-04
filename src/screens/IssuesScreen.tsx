
import { useNavigation } from "@react-navigation/native";
import { Auth, DataStore } from "aws-amplify";
import React, { useEffect, useState } from "react";
import {
  Pressable,
  ScrollView, StyleSheet, Text, TextInput, View
} from "react-native";
import AntDesign from 'react-native-vector-icons/AntDesign';
import Entypo from 'react-native-vector-icons/Entypo';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import Octicons from 'react-native-vector-icons/Octicons';
import { Task } from "../models";

const IssuesScreen = () => {
  const [inputSearchProject, setInputSearchProject] = useState("");
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [yourTasks, setYourTasks] = useState([]);
  const [allYourTasks, setAllYourTasks] = useState([])
  const [tasksCreated, setTasksCreated] = useState([])
  const [allTasksCreated, setAllTasksCreated] = useState([])
  const navigation = useNavigation<any>();

  useEffect(() => {
    const fetch = async () => {
      const userData = await Auth.currentAuthenticatedUser();
      const tasks = (await DataStore.query(Task)).filter(
        (e) => e.assignee == userData.attributes.sub
      );
      setYourTasks(tasks);
      setAllYourTasks(tasks);
    };
    fetch();
  }, []);

  useEffect(() => {
    const fetch = async () => {
      const userData = await Auth.currentAuthenticatedUser();
      const tasks = (await DataStore.query(Task)).filter(
        (e) => e.assigner == userData.attributes.sub
      );
      setTasksCreated(tasks);
      setAllTasksCreated(tasks);
    };
    fetch();
  }, []);

  
  useEffect(() => {
    const subscription = DataStore.observe(Task).subscribe(async(msg) => {
      const userData = await Auth.currentAuthenticatedUser();
      if (msg.model === Task && msg.opType === "INSERT") {
        if(msg.element.assignee == userData.attributes.sub){
          setYourTasks((existingEle) => [msg.element, ...existingEle])
          setAllYourTasks((existingEle) => [msg.element, ...existingEle])
        }
        if(msg.element.assigner == userData.attributes.sub){
          setTasksCreated((existingEle) => [msg.element, ...existingEle])
          setAllTasksCreated((existingEle) => [msg.element, ...existingEle])
        }
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleChangeInputSearch = (text)=>{
    setInputSearchProject(text);
    setYourTasks(allYourTasks.filter(e=>e.code.includes(text)))
    setTasksCreated(allTasksCreated.filter(e=>e.code.includes(text)))
  }

  return (
    <ScrollView style={styles.container}>
      <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
        <View
          style={{ flexDirection: "row", alignItems: "center", marginLeft: 20 }}
        >
          <Octicons name="dot-fill" size={24} color="black" />
          <Text
            style={{
              padding: 5,
              fontSize: 20,
              fontWeight: "900",
              marginLeft: 10,
            }}
          >
            Issues
          </Text>
        </View>
        <Pressable
          onPress={() => navigation.navigate("CreateNewTask")}
          style={{
            flexDirection: "row",
            alignItems: "center",
            marginRight: 20,
          }}
        >
          <Text
            style={{
              marginRight: 5,
              fontSize: 15,
              fontStyle: "italic",
              textDecorationLine: "underline",
              color: "black",
            }}
          >
            Create
          </Text>
          <AntDesign name="pluscircleo" size={20} color="black" />
        </Pressable>
      </View>

      <TextInput
        style={styles.input}
        onChangeText={(text)=>handleChangeInputSearch(text)}
        value={inputSearchProject}
        placeholder="Search"
      />

      <View>
        <View>
          <Text style={{
              padding: 5,
              fontSize: 15,
              fontWeight: "900",
              fontStyle: 'italic',
              marginLeft: 10,
            }}>Your tasks</Text>
        </View>
        {yourTasks.map((task, index) => {
          return (
            <View key={index} style={styles.cardIssue}>
              <View>
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <View
                    style={{
                      alignItems: "center",
                      flexDirection: "row",
                      justifyContent: "flex-start",
                    }}
                  >
                    <FontAwesome name="dot-circle-o" size={15} color="red" />
                    <Text style={styles.issuesCode}>{task.code}</Text>
                  </View>
                  <View
                    style={{
                      justifyContent: "flex-end",
                      alignItems: "flex-end",
                    }}
                  >
                    <View
                      style={{ flexDirection: "row", alignItems: "center" }}
                    >
                      <Text
                        style={{
                          marginRight: 5,
                          fontSize: 12,
                          fontStyle: "italic",
                        }}
                      >
                        View more
                      </Text>
                      <Entypo name="arrow-with-circle-right" size={20} />
                    </View>
                  </View>
                </View>
                <Text
                  style={{ fontSize: 13, overflow: "hidden", maxWidth: "90%" }}
                  numberOfLines={2}
                >
                  <Text style={{ fontWeight: "900" }}>Summary: </Text>
                  {task.summary}
                </Text>
              </View>
            </View>
          );
        })}

      </View>

      <View>
        <View>
          <Text style={{
              padding: 5,
              fontSize: 15,
              fontWeight: "900",
              fontStyle: 'italic',
              marginLeft: 10,
            }}>Task you created</Text>
        </View>
        {tasksCreated.map((task, index) => {
          return (
            <View key={index} style={styles.cardIssue}>
              <View>
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <View
                    style={{
                      alignItems: "center",
                      flexDirection: "row",
                      justifyContent: "flex-start",
                    }}
                  >
                    <FontAwesome name="dot-circle-o" size={15} color="red" />
                    <Text style={styles.issuesCode}>{task.code}</Text>
                  </View>
                  <View
                    style={{
                      justifyContent: "flex-end",
                      alignItems: "flex-end",
                    }}
                  >
                    <View
                      style={{ flexDirection: "row", alignItems: "center" }}
                    >
                      <Text
                        style={{
                          marginRight: 5,
                          fontSize: 12,
                          fontStyle: "italic",
                        }}
                      >
                        View more
                      </Text>
                      <Entypo name="arrow-with-circle-right" size={20} />
                    </View>
                  </View>
                </View>
                <Text
                  style={{ fontSize: 13, overflow: "hidden", maxWidth: "90%" }}
                  numberOfLines={2}
                >
                  <Text style={{ fontWeight: "900" }}>Summary: </Text>
                  {task.summary}
                </Text>
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
    // justifyContent: 'center',
  },

  cardIssue: {
    backgroundColor: "#c9c6c6",
    padding: 10,
    marginBottom: 2,
  },

  issuesCode: {
    fontSize: 18,
    fontWeight: "900",
    textTransform: "uppercase",
    letterSpacing: -1,
    marginLeft: 10,
    color: "#FD5963",
    // marginTop: 20,
    // marginBottom: 20
  },
  input: {
    height: 40,
    margin: 12,
    borderWidth: 1,
    padding: 10,
    borderRadius: 10,
  },
});

export default IssuesScreen;
