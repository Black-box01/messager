import {useState} from 'react'
import { FlatList, Image, StyleSheet, TextInput, View } from 'react-native'
import React from 'react'
import {AntDesign, MaterialIcons} from '@expo/vector-icons'
import {s} from 'react-native-wind'
import {SafeAreaView} from 'react-native-safe-area-context'
import {API, graphqlOperation, Auth, Storage} from 'aws-amplify'
import { createMessage, updateChatRoom } from '../../graphql/mutations'
import * as ImagePicker from "expo-image-picker";
import 'react-native-get-random-values';
import { v4 as uuidv4 } from 'uuid';

const InputBox = ({chatroom}) => {

  const [text, setText] = useState('')
  const [images, setImages] = useState([]);

  const onSend = async () => {

    const authUser = await Auth.currentAuthenticatedUser();

    const newMessage = {
      chatroomID: chatroom.id,
      text,
      userID: authUser.attributes.sub,
    };

    if (images.length > 0) {
      newMessage.images = await Promise.all(images.map(uploadFile));
      setImages([]);
    }

    const newMessageData = await API.graphql(graphqlOperation(createMessage, { input: newMessage }));

    setText('');

    await API.graphql(graphqlOperation(
      updateChatRoom, {
        input: {_version: chatroom._version, chatRoomLastMessageId: newMessageData.data.createMessage.id, id: chatroom.id}
      }
    ))
  };

  const pickImage = async () => {
    // No permissions request is necessary for launching the image library
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
      allowsMultipleSelection: true,
    });

    console.log(result);

    if (!result.cancelled) {
      if (result.selected) {
        setImages(result.selected.map((asset) => asset.uri));
      } else {
        setImages([result.uri]);
      }
    }
  };

  const uploadFile = async (fileUri) => {
	  try {
	    const response = await fetch(fileUri);
	    const blob = await response.blob();
	    const key = `${uuidv4()}.png`;
	    await Storage.put(key, blob, {
	      contentType: "image/png", // contentType is optional
	    });
	    return key;
	  } catch (err) {
	    console.log("Error uploading file:", err);
	  }
	};

  return (
    <>
    {images.length > 0 && (
      <View style={styles.attachmentsContainer}>
      <FlatList 
        data={images}
        horizontal
        renderItem={({item}) => (
            <>
              <Image
              source={{ uri: item }}
              style={styles.selectedImage}
              resizeMode="contain"
              />
              <MaterialIcons
                name="highlight-remove"
                onPress={() => setImages((existingImages) => existingImages.filter((img) => img !== item))
                }
                size={20}
                color="gray"
                style={styles.removeSelectedImage}
              />
            </>
        )}
      /> 
      </View>
    )}
    <SafeAreaView edges={['bottom']} style={s`flex-row bg-trueGray-100 p-2 px-3.5 items-center`}>
        <AntDesign name='plus' size={24} color='royalblue' onPress={pickImage} />

            <TextInput placeholder='Type your message...' style={s`flex-grow bg-white p-2 rounded-full px-3.5 border-gray-200 border-2 mx-3 text-base`} value={text} onChangeText={setText} />

        {text != '' && (<MaterialIcons name='send' size={24} color='white' style={s`bg-blue-400 p-1.5 rounded-full overflow-hidden`} onPress={onSend}/>)}
    </SafeAreaView>
    </>
  )
}

const styles = StyleSheet.create({
  attachmentsContainer: {
    alignItems: 'flex-end',
  },
  selectedImage: {
    height: 100,
    width: 200,
    margin: 5,
  },
  removeSelectedImage: {
    position: 'absolute',
    right: 10,
    backgroundColor: 'white',
    borderRadius: 10,
    overflow: 'hidden',
  },
})

export default InputBox