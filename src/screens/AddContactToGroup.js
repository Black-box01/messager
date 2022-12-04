import { View, FlatList, StyleSheet, Button, TextInput } from 'react-native'
import React from 'react'
import ContactList from '../component/ContactList/ContactList'
import { useEffect, useState } from "react";
import { API, graphqlOperation, Auth } from "aws-amplify";
import { createChatRoom, createUserChatRoom } from '../graphql/mutations';
import { listUsers } from "../graphql/queries";
import { useNavigation, useRoute } from '@react-navigation/native';


const ContactsScreen = () => {

  const navigation = useNavigation();

  const [users, setUsers] = useState([]);

  const [selectedUserIds, setSelectedUserIds] = useState([])

  const route = useRoute();
  const chatRoom = route.params.chatRoom;
	
	useEffect(() => {
	  API.graphql(graphqlOperation(listUsers)).then((result) => {
	    setUsers(result.data?.listUsers?.items.filter((item) => !chatRoom.users.items.some((chatRoomUser) => !chatRoomUser._deleted && item.id === chatRoomUser.userID
            )
        )
      );
	  });
	}, []);

  useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <Button title='Add to group' disabled={selectedUserIds.length < 1} onPress={onAddToGroupPress} />
      )
    });
  }, [selectedUserIds]);


  const onAddToGroupPress = async () => {      
    // add the selected users to the chatRoom
    await Promise.all(
      selectedUserIds.map(userID => 
        API.graphql(
          graphqlOperation(createUserChatRoom, {
            input: { chatRoomID: chatRoom.id, userID },
          })
        )
      )
    );

    setSelectedUserIds([]);

    // navigate to the newly created chatRoom

    navigation.goBack();
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