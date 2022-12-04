import React from 'react'
import { NavigationContainer } from '@react-navigation/native'
import {createNativeStackNavigator } from '@react-navigation/native-stack'
import ChatScreen from '../screens/ChatScreen'
import MainTabNavigator from './MainTabNavigator'
import ContactsScreen from '../screens/ContactsScreen'
import NewGroupScreen from '../screens/NewGroupScreen'
import GroupInfoScreen from '../screens/GroupInfoScreen'
import AddContactToGroup from '../screens/AddContactToGroup'


const Stack = createNativeStackNavigator();

const Navigation = () => {

  return (
    <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerStyle: { backgroundColor: 'whitesmoke' } }} >
            <Stack.Screen name='Home' component={MainTabNavigator} options={{headerShown: false}}/>
            <Stack.Screen name='chat' component={ChatScreen} />
            <Stack.Screen name='Group Info' component={GroupInfoScreen} />
            <Stack.Screen name='contacts' component={ContactsScreen} />
            <Stack.Screen name='New Group' component={NewGroupScreen} />
            <Stack.Screen name='Add Contacts' component={AddContactToGroup} />
        </Stack.Navigator>
    </NavigationContainer>
  )
}

export default Navigation