import {
    DrawerContentScrollView,
    DrawerItem
} from '@react-navigation/drawer';
import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import {
    ActivityIndicator,
    Avatar, Caption, Drawer, Paragraph, Switch, Text, Title, TouchableRipple, useTheme
} from 'react-native-paper';

import { useNavigation } from '@react-navigation/native';
import { Auth } from 'aws-amplify';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import AntDesign from 'react-native-vector-icons/AntDesign';
import Ionicons from 'react-native-vector-icons/Ionicons';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import Octicons from 'react-native-vector-icons/Octicons';
import { setCurrentUser } from '../../actions/currentUser';
import authService from '../../services/auth-service';
import pushNotificationsService from '../../services/pushnotifications-service';
import store from '../../store';
import { useSelector } from 'react-redux';

const DrawerContent = (props) => {
    const paperTheme = useTheme();
    const navigation = useNavigation<any>();
    const [isLoading, setIsLoading] = useState(false);
    const currentUser = useSelector((store:any) => store.currentUser);

    const toggleTheme = () => {

    }

    const signOut = async () => {
        // await DataStore.clear();
        // await DataStore.start();
        setIsLoading(true);
        await authService.logout();
        pushNotificationsService.deleteSubscription()
        store.dispatch(setCurrentUser(null))
        await Auth.signOut();
        setIsLoading(false);
        // navigation.navigate("Login")
        // navigation.popToTop();
    }

    return (
        <View style={{ flex: 1 }}>
            <DrawerContentScrollView {...props}>
                <View style={styles.drawerContent}>
                    <View style={styles.userInfoSection}>
                        <View style={{ flexDirection: 'row', marginTop: 15 }}>
                            <Avatar.Image
                                source={{
                                    uri: currentUser?.imageUri
                                }}
                                size={50}
                            />
                            <View style={{ marginLeft: 15, flexDirection: 'column' }}>
                                <Title style={styles.title}>{currentUser?.name}</Title>
                                <Caption style={styles.caption}>{currentUser?.email}</Caption>
                            </View>
                        </View>

                        {/* <View style={styles.row}>
                            <View style={styles.section}>
                                <Paragraph style={[styles.paragraph, styles.caption]}>80</Paragraph>
                                <Caption style={styles.caption}>Following</Caption>
                            </View>
                            <View style={styles.section}>
                                <Paragraph style={[styles.paragraph, styles.caption]}>100</Paragraph>
                                <Caption style={styles.caption}>Followers</Caption>
                            </View>
                        </View> */}
                    </View>

                    <Drawer.Section style={styles.drawerSection}  title="Pages">

                        <DrawerItem
                            icon={({ color, size }) => (
                                <MaterialIcons name="dashboard" color={color}
                                    size={size} />
                            )}
                            label="DashBoard"
                            onPress={() => { props.navigation.navigate('DashBoard') }}
                        />
                        <DrawerItem
                            icon={({ color, size }) => (
                                <AntDesign name="wechat" size={24} color={color} />
                            )}
                            label="Chats"
                            onPress={() => { props.navigation.navigate('Chats') }}
                        />
                        <DrawerItem
                            icon={({ color, size }) => (
                                <FontAwesome name="users" size={24} color={color} />
                            )}
                            label="Friends"
                            onPress={() => { props.navigation.navigate('Friends') }}
                        />
                        <DrawerItem
                            icon={({ color, size }) => (
                                <Octicons name="project" size={24} color={color} />
                            )}
                            label="Projects"
                            onPress={() => { props.navigation.navigate('Projects') }}
                        />
                        <DrawerItem
                            icon={({ color, size }) => (
                                <Ionicons name="code-working" size={24} color={color} />
                            )}
                            label="Issues"
                            onPress={() => { props.navigation.navigate('Issues') }}
                        />
                    </Drawer.Section>
                    {/* <Drawer.Section title="Preferences">
                        <TouchableRipple onPress={() => { toggleTheme() }}>
                            <View style={styles.preference}>
                                <Text>Dark Theme</Text>
                                <View pointerEvents="none">
                                    <Switch value={paperTheme.dark} />
                                </View>
                            </View>
                        </TouchableRipple>
                    </Drawer.Section> */}
                </View>
            </DrawerContentScrollView>
            <Drawer.Section style={styles.bottomDrawerSection}>
                {isLoading ? (
                    <ActivityIndicator />
                ) : (
                    <DrawerItem
                        icon={({ color, size }) => (
                            <MaterialCommunityIcons
                                name="exit-to-app"
                                color={color}
                                size={size}
                            />
                        )}
                        label="Sign Out"
                        onPress={() => { signOut() }}
                    />
                )}
            </Drawer.Section>
        </View>
    );
};


const styles = StyleSheet.create({
    drawerContent: {
        flex: 1,
    },
    userInfoSection: {
        paddingLeft: 20,
    },
    title: {
        fontSize: 16,
        marginTop: 3,
        fontWeight: 'bold',
    },
    caption: {
        fontSize: 14,
        lineHeight: 14,
    },
    row: {
        marginTop: 20,
        flexDirection: 'row',
        alignItems: 'center',
    },
    section: {
        flexDirection: 'row',
        alignItems: 'center',
        marginRight: 15,
    },
    paragraph: {
        fontWeight: 'bold',
        marginRight: 3,
    },
    drawerSection: {
        marginTop: 15,
    },
    bottomDrawerSection: {
        marginBottom: 15,
        borderTopColor: '#f4f4f4',
        borderTopWidth: 1
    },
    preference: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 12,
        paddingHorizontal: 16,
    },
});

export default DrawerContent