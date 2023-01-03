import "react-native-gesture-handler";
import React, { useEffect, useState } from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";
import Amplify, { DataStore, Hub, Auth } from "aws-amplify";
import { withAuthenticator } from "aws-amplify-react-native";
import config from "./src/aws-exports";
import { Message, User } from "./src/models";

// import useCachedResources from "./hooks/useCachedResources";
// import useColorScheme from "./hooks/useColorScheme";
import Navigation from "./src/navigation";
import moment from "moment";

Amplify.configure({
  ...config,
  Analytics: { 
    disabled: true
  }
});

function App() {
  // const isLoadingComplete = useCachedResources();
  // const colorScheme = useColorScheme();

  const [user, setUser] = useState<User | null>(null);

  // useEffect(() => {
  //   const signOut=async()=>{
  //     // navigation.navigate("LoginScreen")
  //     await DataStore.clear();
  //     await DataStore.start();
  //     Auth.signOut();
  //   }
  //   signOut();
  // })
  

  useEffect(() => {
    const listener = Hub.listen("datastore", async (hubData) => {
      const { event, data } = hubData.payload;
      if(event === 'networkStatus'){
        console.log('User has a network connection:'+data.active)
      }
      if (
        event === "outboxMutationProcessed" &&
        data.model === Message &&
        !["DELIVERED", "READ"].includes(data.element.status)
      ) {
        // set the message status to delivered
        DataStore.save(
          Message.copyOf(data.element, (updated) => {
            updated.status = "DELIVERED";
          })
        );
      }
    });

    // Remove listener
    return () => listener();
  }, []);

  useEffect(() => {
    if (!user) {
      return;
    }

    const subscription = DataStore.observe(User, user.id).subscribe((msg) => {
      if (msg.model === User && msg.opType === "UPDATE") {
        setUser(msg.element);
      }
    });

    return () => subscription.unsubscribe();
  }, [user?.id]);

  useEffect(() => {
    fetchUser();
  }, []);

  useEffect(() => {
    const interval = setInterval(async () => {
      await updateLastOnline();
    }, 1 * 60 * 1000);
    return () => clearInterval(interval);
  }, [user]);

  const fetchUser = async () => {
    const userData = await Auth.currentAuthenticatedUser();
    const user = await DataStore.query(User, userData.attributes.sub);
    if (user) {
      setUser(user);
    }
  };

  const updateLastOnline = async () => {
    if (!user) {
      return;
    }

    const response = await DataStore.save(
      User.copyOf(user, (updated) => {
        updated.lastOnlineAt = +new Date();
      })
    );
    setUser(response);
  };

  // if (!isLoadingComplete) {
  //   return null;
  // } else {
    return (
      <SafeAreaProvider>
        <Navigation/>
        {/* <StatusBar /> */}
      </SafeAreaProvider>
    );
  // }
}

export default withAuthenticator(App);
