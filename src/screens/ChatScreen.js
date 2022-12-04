import { ImageBackground, FlatList, KeyboardAvoidingView, Platform, ActivityIndicator, View, StyleSheet } from 'react-native'
import {React, useEffect, useState} from 'react'
import {useRoute, useNavigation} from '@react-navigation/native'
import bg from '../../assets/images/BG.png'
import { s } from "react-native-wind";
import Message from '../component/Message/Message';
import InputBox from '../component/InputBox/InputBox';
import {API, graphqlOperation} from 'aws-amplify'
import {getChatRoom, listMessagesByChatRoom} from '../graphql/queries'
import {onCreateMessage, onUpdateChatRoom} from '../graphql/subscriptions'
import {Feather} from '@expo/vector-icons'


const ChatScreen = () => {

  const [chatRoom,setChatRoom] = useState(null);
  const [messages, setMessages] = useState([]);

  const route = useRoute();
  const navigation = useNavigation();

  const chatroomID = route.params.id;

  // fetching chat rooms
  useEffect(() => {
    API.graphql(graphqlOperation(getChatRoom, {
      id: chatroomID 
    })).then(
      (result) => {
        setChatRoom(result.data?.getChatRoom)
      }
    );

    const subscription = API.graphql(graphqlOperation(onUpdateChatRoom, {filter: {id: {"eq": chatroomID}}})
    ).subscribe({
      next: ({value}) => {
        setChatRoom((cr) => ({
          ...(cr || {}),
          ...value.data.onUpdateChatRoom,
        }));
      },
      error: (err) => console.warn(err),
    });

    return () => subscription.unsubscribe();
  }, [chatroomID]);

// fetching messages
  useEffect(() => {
    API.graphql(graphqlOperation(listMessagesByChatRoom, {
      chatroomID, sortDirection: "DESC",
    })).then(
      (result) => setMessages(result.data?.listMessagesByChatRoom?.items)
    );

    // subcribe to new messages
    const subscription = API.graphql(graphqlOperation(onCreateMessage, {filter: {chatroomID: {"eq": chatroomID }}, })).subscribe({
      next: ({value}) => {
        setMessages((m) => [value.data.onCreateMessage, ...m]);
      },
      error: (err) => console.warn(err),
    });

    return () => subscription.unsubscribe();
  }, [chatroomID]);

  useEffect(() => {
    navigation.setOptions({ title: route.params.name, headerRight: () => (
      <Feather onPress={() => navigation.navigate('Group Info', {id: chatroomID})} name='more-vertical' size={24} color='gray' />
    ) })
  }, [route.params.name, chatroomID]);

  if (!chatRoom) {
    return <ActivityIndicator />
  }

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} keyboardVerticalOffset={Platform.OS === 'ios' ? 60 : 90} style={styles.length}>
        <ImageBackground source={bg} style={s`flex-grow`}>
        <FlatList 
            data={messages}
            renderItem={({item}) => <Message message={item} />} 
            style={s`p-3`}
            inverted
            />
            <InputBox chatroom={chatRoom} />
        </ImageBackground>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  length: {
    paddingBottom: 170,
    flex: 1,
  },
})

export default ChatScreen