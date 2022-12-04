import { View, Button } from 'react-native'
import React from 'react'
import { s } from "react-native-wind";
import {Auth} from 'aws-amplify'

const SettingsScreen = () => {
  return (
    <View style={s`items-center justify-center flex-grow`}>
      <Button title='Sign Out' onPress={() => Auth.signOut()} />
    </View>
  )
}

export default SettingsScreen