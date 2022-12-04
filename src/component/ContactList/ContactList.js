import { View, Text, Image, StyleSheet, Pressable } from 'react-native'
import {useNavigation} from '@react-navigation/native'
import React from 'react'
import { s } from "react-native-wind";
import { AntDesign, FontAwesome } from '@expo/vector-icons'



const ContactList = ({user, onPress = () => {}, selectable = false, isSelected = false }) => {

    const navigation = useNavigation();

    

  return (
    <Pressable onPress={onPress} style={s`h-16 mx-3 my-2 flex-row`}>
      <Image source={{uri: user.image}} style={styles.image} />
      <View style={styles.content}>
                <Text style={styles.name} numberOfLines={1}>{user.name}</Text>
            
            <Text style={styles.subTitle} numberOfLines={1}>{user.status}</Text>
            </View>
            {selectable && (
                isSelected ? (                <AntDesign name='checkcircle' size={24} color='royalblue' />
                ) : (
                    <FontAwesome name='circle-thin' size={24} color='lightgray' />
                )
            )}
    </Pressable>
  )
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        marginHorizontal: 10,
        marginVertical: 5,
        height: 70,
        alignItems: 'center'
    },
    image: {
        height: 60,
        width: 60,
        borderRadius: 30,
        marginRight: 15
    },
    content: {
        flex: 1,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: 'lightgray',
        marginRight: 10
    },
    row: {
        flexDirection: 'row',
        marginBottom: 5
    },
    name: {
        fontWeight: 'bold'
    },
    subTitle: {
        color: 'gray'
    },
    
})

export default ContactList