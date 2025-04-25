// Import required dependencies
import React from 'react';
import { StyleSheet, View, Text, FlatList, TouchableOpacity, Image, ScrollView } from 'react-native';
import SeniorDash from './SeniorDash';
import { useState, useEffect } from 'react';
import { auth } from '../firebaseConfig';

const categories = [
  {
    id: 1,
    name: 'Placement Volunteers',
    nav: 'PlacementUser',
    image: 'https://www.thrivecyn.ca/wp-content/uploads/2018/10/adults-afro-charity-1413657.jpg',
    description: 'Get guidance on placement preparation and strategies.'
  },
  {
    id: 2,
    name: 'Placed Super Seniors',
    nav: 'SuperSenior',
    image: 'https://www.ocalastyle.com/wp-content/uploads/xigla/2593-shutterstock_133089581.jpg',
    description: 'Learn from experiences of placed seniors.'
  },
  {
    id: 3,
    name: 'Event Coordinators',
    nav: 'EventCoordinator',
   image: 'https://www.itechdigitalproduction.com/wp-content/uploads/2016/05/event-coordinator-resume-sample.png',
    description: 'Organize and manage college events effectively.'
  },
  // {
  //   id: 4,
  //   name: 'Toppers',
  //   nav: '',
  //   //image: 'https://media.istockphoto.com/id/1371896330/photo/happy-asian-woman-in-his-graduation-day.jpg?s=612x612&w=0&k=20&c=Ur3moWl1fKFms-6UACseglMjoYAynYKzsanZpgK8lFk=',
  //   description: 'Get study tips and guidance from department toppers.'
  // }
];

const CategoryCard = ({ category, onPress }) => (
  <TouchableOpacity style={styles.card} onPress={() => onPress(category.name)}>
    <Image 
      source={{ uri: category.image }} 
      style={styles.cardImage} 
      onError={() => console.warn(`Image failed to load for: ${category.name}`)}
    />
    <Text style={styles.cardTitle}>{category.name}</Text>
    <Text style={styles.cardDescription}>{category.description}</Text>
  </TouchableOpacity>
);

const HomePage = ({navigation}) => {
  const [isSenior, setIsSenior] = useState(false);

  useEffect(() => {
    const checkIsSenior = async () => {
      const currentUser = auth.currentUser;

      if (currentUser && currentUser.email) {
        const email = currentUser.email;
        const regex = /(\d{2})(?=mca)/; 
        const match = email.match(regex);

        if (match && parseInt(match[0], 10) <= 23) {
          setIsSenior(true);
        }
      }
      setLoading(false);
    };

    checkIsSenior();
  }, []);

  return (
    <>
    {isSenior ? 
      <SeniorDash/>
      :
      <View style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.headerTitle}>Welcome to MentorConnect</Text>
        <Text style={styles.headerSubtitle}>Find the right mentors to guide your journey</Text>
      </View>

      <FlatList
        data={categories}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <CategoryCard category={item} onPress={() => navigation.navigate(item.nav)} />
        )}
        contentContainerStyle={styles.listContainer}
      />
    </View>
    }
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5'
  },
  headerContainer: {
    backgroundColor: '#2A3663',
    padding: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    alignItems: 'center'
  },
  headerTitle: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold'
  },
  headerSubtitle: {
    color: '#fff',
    fontSize: 16,
    marginTop: 10,
    textAlign: 'center'
  },
  listContainer: {
    padding: 20
  },
  card: {
    backgroundColor: '#fff',
    marginBottom: 15,
    padding: 15,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3
  },
  cardImage: {
    width: '100%',
    height: 120,
    borderRadius: 10,
    marginBottom: 10
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333'
  },
  cardDescription: {
    fontSize: 14,
    color: '#777',
    marginTop: 5
  }
});

export default HomePage;