import { View, Text, Image, StyleSheet, Pressable } from 'react-native'
import {useNavigation} from '@react-navigation/native'
import React, { useEffect, useState } from 'react'
import { Auth, API, graphqlOperation } from 'aws-amplify';
import { onUpdateChatRoom } from '../../graphql/subscriptions';
import { s } from "react-native-wind";
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime'
dayjs.extend(relativeTime);


const ChatList = ({chat}) => {

    const navigation = useNavigation();
    const [user, setUser] = useState(null);
    const [chatRoom, setChatRoom] = useState(chat);

    useEffect(() => {
        const fetchUser = async () => {
            const authUser = await Auth.currentAuthenticatedUser();

            const userItem = chatRoom.users.items.find(item => item.user.id !== authUser.attributes.sub);
            setUser(userItem?.user)
        };

        fetchUser();
    }, []);

     // fetching chat rooms
  useEffect(() => {
    const subscription = API.graphql(graphqlOperation(onUpdateChatRoom, {filter: {id: {"eq": chat.id}}})
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
  }, [chat.id]);
    

  return (
    <Pressable onPress={() => navigation.navigate('chat', {id: chatRoom.id, name: user?.name})} style={s`h-16 mx-3 my-2 flex-row`}>
      <Image source={{uri: user?.image}} style={styles.image} />
      <View style={styles.content}>
            <View style={styles.row}>
                <Text style={styles.name} numberOfLines={1}>{chatRoom.name || user?.name}</Text>


                {chatRoom.LastMessage && (<Text style={styles.subTitle} >{dayjs(chatRoom.LastMessage?.createdAt).fromNow(true)}</Text>)}
            </View>
            <Text style={styles.subTitle} numberOfLines={1}>{chatRoom.LastMessage?.text}</Text>
      </View>
    </Pressable>
  )
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        marginHorizontal: 10,
        marginVertical: 5,
        height: 70
    },
    image: {
        height: 60,
        width: 60,
        borderRadius: 30,
        marginRight: 10
    },
    content: {
        flex: 1,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: 'lightgray'
    },
    row: {
        flexDirection: 'row',
        marginBottom: 5
    },
    name: {
        fontWeight: 'bold',
        flex: 1
    },
    subTitle: {
        color: 'gray'
    },
    
})

export default ChatList