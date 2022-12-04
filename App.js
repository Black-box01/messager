import {useEffect} from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View } from 'react-native';
import Navigation from './src/navigation/Navigation';
import { Amplify, Auth, API, graphqlOperation } from 'aws-amplify'
import awsconfig from './src/aws-exports'
import { withAuthenticator } from "aws-amplify-react-native";
import {getUser} from './src/graphql/queries'
import {createUser} from './src/graphql/mutations'

Amplify.configure({...awsconfig, Analytics: { disabled: true }});

function App() {

  useEffect(() => {
    const syncUser = async () => {
      // get Auth user
      const authUser = await Auth.currentAuthenticatedUser({bypassCache: true,});

      // wuery the database using Auth user id (sub)
      const userData = await API.graphql(
        graphqlOperation(getUser, { id: authUser.attributes.sub})
      );

      // checking if user is already in database
      if (userData.data.getUser){
        console.log('User already exist in database')
        return;
      }

      // if there is no user in db, create one
      const newUser = {
        id: authUser.attributes.sub,
        name: authUser.attributes.phone_number,
        status: 'I\'m using Black chatter'
      };

      const newUserResponse = await API.graphql(
        graphqlOperation(createUser, {input: newUser})
      )

    };

    syncUser();

  }, [])

  return (
    <View style={styles.container}>
      <Navigation />
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'whitesmoke',
    justifyContent: 'center',
  },
});

export default withAuthenticator(App);