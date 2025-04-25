import React, { useState, useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { onAuthStateChanged, getAuth } from 'firebase/auth';
import Icon from 'react-native-vector-icons/Ionicons'; // For tab icons
import Welcome from './screens/Welcome';
import Login from './screens/Login';
import SeniorRegister from './screens/SeniorRegister';
import JuniorRegister from './screens/JuniorRegister';
import Home from './screens/Home';
import CommunityChat from './screens/CommumityChat';
import Profile from './screens/Profile';
import ChatBot from './screens/ChatBot';
import './firebaseConfig'; // Ensure Firebase is initialized in this file
import PlacementUser from './screens/PlacementUser';
import PlacementUserDetail from './screens/PlacementUserDetail';
import SeniorDash from './screens/SeniorDash'; // Import the SeniorDash component
import { db } from './firebaseConfig'; // Import db
import { doc, getDoc } from 'firebase/firestore'; // Firebase v9+ import
import SuperSenior from './screens/SuperSenior';
import EventCoordinator from './screens/EventCoordinator';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(null); // null indicates loading state
  const [userRole, setUserRole] = useState(null); // Track the user's role
  const auth = getAuth();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // Get the user's role from Firebase
        const userRef = doc(db, 'users', user.uid); // Use doc() to get the document reference
        const docSnap = await getDoc(userRef); // Fetch the document using getDoc

        if (docSnap.exists()) {
          const role = docSnap.data().role; // Get the role from the document data
          setUserRole(role); // Set the role in state
        } else {
          console.log('No such user document!');
        }

        setIsAuthenticated(true); // User is authenticated
      } else {
        setIsAuthenticated(false); // If no user is logged in
      }
    });

    return () => unsubscribe(); // Cleanup on unmount
  }, [auth]);

  if (isAuthenticated === null) {
    // Show a loading indicator while checking authentication state
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  // Tab Navigator for authenticated users
  const TabNavigator = () => (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => {
          let iconName;

          switch (route.name) {
            case 'Home':
              iconName = 'home-outline';
              break;
            case 'CommunityChat':
              iconName = 'chatbubbles-outline';
              break;
            case 'Profile':
              iconName = 'person-outline';
              break;
            case 'ChatBot':
              iconName = 'chatbox-ellipses-outline';
              break;
            default:
              iconName = 'home-outline';
          }

          return <Icon name={iconName} size={size} color={color} />;
        },
      })}
      tabBarOptions={{
        tabBarActiveTintColor: '#2A3663', // Active icon color
        tabBarInactiveTintColor: 'gray',
        style: { height: 60, paddingBottom: 10 },
      }}
    >
      <Tab.Screen name="Home" component={Home} />
      <Tab.Screen name="CommunityChat" component={CommunityChat} />
      <Tab.Screen name="Profile" component={Profile} />
      <Tab.Screen name="ChatBot" component={ChatBot} />
    </Tab.Navigator>
  );

  return (
    <NavigationContainer>
      <Stack.Navigator>
        {isAuthenticated ? (
          <>
          <Stack.Screen
            name="Main"
            component={TabNavigator} // Navigate to the main tab for juniors
            options={{ headerShown: false }}
          />
            <Stack.Screen name="PlacementUser" component={PlacementUser} />
            <Stack.Screen name="PlacementUserDetail" component={PlacementUserDetail} />
            <Stack.Screen name="SuperSenior" component={SuperSenior} />
            <Stack.Screen name="EventCoordinator" component={EventCoordinator} />
            
          </>
        ) : (
          <>
            <Stack.Screen name="Welcome" component={Welcome} options={{ headerShown: false }} />
            <Stack.Screen name="Login" component={Login} />
            <Stack.Screen name="JuniorRegister" component={JuniorRegister} />
            <Stack.Screen name="SeniorRegister" component={SeniorRegister} />
            <Stack.Screen name="SeniorDash" component={SeniorDash} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
});

export default App;
