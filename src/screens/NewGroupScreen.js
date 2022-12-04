import { View, FlatList, StyleSheet, Button, TextInput } from 'react-native'
import React from 'react'
import ContactList from '../component/ContactList/ContactList'
import { useEffect, useState } from "react";
import { API, graphqlOperation, Auth } from "aws-amplify";
import { createChatRoom, createUserChatRoom } from '../graphql/mutations';
import { listUsers } from "../graphql/queries";
import { useNavigation } from '@react-navigation/native';


const ContactsScreen = () => {

  const navigation = useNavigation();

  const [users, setUsers] = useState([]);
  const [name, setName] = useState('');

  const [selectedUserIds, setSelectedUserIds] = useState([])
	
	useEffect(() => {
	  API.graphql(graphqlOperation(listUsers)).then((result) => {
	    setUsers(result.data?.listUsers?.items);
	  });
	}, []);

  useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <Button title='Create' disabled={!name || selectedUserIds.length < 1} onPress={onCreateGroupPress} />
      )
    });
  }, [name, selectedUserIds]);


  const onCreateGroupPress = async () => {      
    // create a new Chat Room

    const newChatRoomData = await API.graphql(graphqlOperation(createChatRoom, {input: {name}}));

    if (!newChatRoomData.data?.createChatRoom) {
        console.log('Error creating the chat error');
    }

    const newChatRoom = newChatRoomData.data?.createChatRoom;

    // add the selected users to the chatRoom
    await Promise.all(
      selectedUserIds.map(userID => 
        API.graphql(
          graphqlOperation(createUserChatRoom, {
            input: { chatRoomID: newChatRoom.id, userID },
          })
        )
      )
    );

    // add the auth user to the chatRoom
        const authUser = await Auth.currentAuthenticatedUser();
    await API.graphql(
        graphqlOperation(createUserChatRoom, {
            input: { chatRoomID: newChatRoom.id, userID: authUser.attributes.sub },
        })
    );

    setSelectedUserIds([]);
    setName('');

    // navigate to the newly created chatRoom

    navigation.navigate('chat', { id: newChatRoom.id })
};

  const onContactPress = (id) => {
    setSelectedUserIds((userIds) => {
      if (userIds.includes(id)) {
        // remove id from selected
        return [...userIds].filter((uid) => uid !== id);

      } else {
        // add id to selected
        return [...userIds, id];
      }
    })
  }

  return (
    <View style={styles.container}>
    <TextInput 
      placeholder='Group name'
      value={name}
      onChangeText={setName}
      style={styles.input}
    />
    <FlatList
      data={users}
      renderItem={({item}) => (
        <ContactList 
        user={item}
        selectable 
        onPress={() => onContactPress(item.id)} 
        isSelected={selectedUserIds.includes(item.id)}
        />
    )}
    />
    </View>
  );
};

const styles = StyleSheet.create({

  container: {backgroundColor: 'white'},
  input: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: 'lightgray',
    padding: 10,
    margin: 10,
  },

});

export default ContactsScreen