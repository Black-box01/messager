import { View, FlatList, Pressable, Text } from 'react-native'
import React from 'react'
import ContactList from '../component/ContactList/ContactList'
import { useEffect, useState } from "react";
import { listUsers } from "../graphql/queries";
import { MaterialIcons } from '@expo/vector-icons'
import { useNavigation } from '@react-navigation/native';
import { API, graphqlOperation, Auth } from 'aws-amplify';
import { createChatRoom, createUserChatRoom } from '../graphql/mutations';
import { getCommonChatRoomWithUser } from '../services/ChatRoomService'

const ContactsScreen = () => {

  const navigation = useNavigation();

  const [users, setUsers] = useState([]);

  const createAChatRoomWithUser = async (user) => {
    // check if we already have a chatRoom with user
        const existingChatRoom = await getCommonChatRoomWithUser(user.id);
        if (existingChatRoom) {
            navigation.navigate('chat', { id: existingChatRoom.chatRoom.id });
            return;
        }
        

    // create a new Chat Room

    const newChatRoomData = await API.graphql(graphqlOperation(createChatRoom, {input: {}}));

    if (!newChatRoomData.data?.createChatRoom) {
        console.log('Error creating the chat error');
    }

    const newChatRoom = newChatRoomData.data?.createChatRoom;

    // add the clicked user to the chatRoom

    await API.graphql(
        graphqlOperation(createUserChatRoom, {
            input: { chatRoomID: newChatRoom.id, userID: user.id },
        })
    );

    // add the auth user to the chatRoom
        const authUser = await Auth.currentAuthenticatedUser();
    await API.graphql(
        graphqlOperation(createUserChatRoom, {
            input: { chatRoomID: newChatRoom.id, userID: authUser.attributes.sub },
        })
    );

    // navigate to the newly created chatRoom

    navigation.navigate('chat', { id: newChatRoom.id })
};
	
	useEffect(() => {
	  API.graphql(graphqlOperation(listUsers)).then((res) => {
	    setUsers(res.data?.listUsers?.items);
	  });
	}, []);

  return (
    <View>
    <FlatList
      data={users}
      renderItem={({item}) => ( 
      <ContactList 
      user={item}
      onPress={() => createAChatRoomWithUser(item)
      } 
      />
  )}
      ListHeaderComponent={() => (
        <Pressable
          onPress={() => {navigation.navigate('New Group')} }
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            padding: 15,
            paddingHorizontal: 20
          }}
        >
          <MaterialIcons 
            name='group'
            size={24}
            color='royalblue'
            style={{
              marginRight: 20,
              backgroundColor: 'gainsboro',
              padding: 7,
              borderRadius: 20,
              overflow: 'hidden',
            }}
          />
          <Text style={{ color: 'royalblue ', fontSize: 16 }}>New Group</Text>
        </Pressable>
      )}
      
     style={{backgroundColor: 'white'}}/>
    </View>
  )
}

export default ContactsScreen