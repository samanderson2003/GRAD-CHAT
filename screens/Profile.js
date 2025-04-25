import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Linking,
  Alert
} from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { auth, db } from "../firebaseConfig";
import {
  query,
  where,
  getDocs,
  collection,
  doc,
  updateDoc,
} from "firebase/firestore";

import { signOut } from "firebase/auth";


const Profile = () => {
  const [profileData, setProfileData] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [updatedProfile, setUpdatedProfile] = useState({});
  const [isSenior, setIsSenior] = useState(false);
  const [loading, setLoading] = useState(true);

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
    };

    const fetchProfileData = async () => {
      const user = auth.currentUser;
      if (user) {
        try {
          // Query seniors collection
          const seniorQuery = query(
            collection(db, "seniors"),
            where("uid", "==", user.uid)
          );
          const seniorSnapshot = await getDocs(seniorQuery);

          if (!seniorSnapshot.empty) {
            seniorSnapshot.forEach((doc) => {
              setProfileData({ ...doc.data(), id: doc.id });
            });
            setLoading(false);
            return;
          }

          // Query juniors collection if not found in seniors
          const juniorQuery = query(
            collection(db, "juniors"),
            where("uid", "==", user.uid)
          );
          const juniorSnapshot = await getDocs(juniorQuery);

          if (!juniorSnapshot.empty) {
            juniorSnapshot.forEach((doc) => {
              setProfileData({ ...doc.data(), id: doc.id });
            });
          } else {
            console.log("No document found for the user in seniors or juniors.");
          }
        } catch (error) {
          console.error("Error fetching profile data:", error);
        }
      }
      setLoading(false);
    };

    const initialize = async () => {
      await checkIsSenior();
      await fetchProfileData();
    };

    initialize();
  }, []);

  const handleLogout = () => {
    Alert.alert(
      "Logout",
      "Are you sure you want to logout?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Logout",
          onPress: async () => {
            try {
              await signOut(auth);
            } catch (error) {
              console.error("Error logging out:", error);
            }
          },
        },
      ],
      { cancelable: true }
    );
  };

  const handleSave = async () => {
    if (profileData && profileData.id) {
      const collectionName = isSenior ? "seniors" : "juniors";
      const docRef = doc(db, collectionName, profileData.id);
      try {
        await updateDoc(docRef, updatedProfile);
        setProfileData({ ...profileData, ...updatedProfile });
        setIsEditing(false);
        console.log("Profile updated successfully!");
      } catch (error) {
        console.error("Error updating profile:", error);
      }
    }
  };

  const openLink = (url) => {
    Linking.openURL(url).catch((err) =>
      console.error("Failed to open URL: ", err)
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading...</Text>
      </View>
    );
  }

  if (!profileData) {
    return (
      <View style={styles.loadingContainer}>
        <Text>No profile data available.</Text>
      </View>
    );
  }


  return (
    <ScrollView contentContainerStyle={styles.container}>

      {!isSenior ? 
      <>
        <Text style={styles.name}>Name: {profileData.fullName}</Text>
        <Text style={styles.email}>Email: {profileData.email}</Text>
        <Text style={styles.phone}>Phone:{profileData.phone}</Text>
        <TouchableOpacity
        style={[styles.editButton, styles.logoutButton]}
        onPress={handleLogout}
      >
        <Text style={styles.editButtonText}>Logout</Text>
      </TouchableOpacity>
      </>
        :
        <>
        <View style={styles.headerContainer}>
        <Image source={{ uri: profileData.photo }} style={styles.profileImage} />
        <View style={styles.infoContainer}>
          <Text style={styles.name}>{profileData.fullName}</Text>
          <Text style={styles.role}>{profileData.role}</Text>
        </View>
      </View>

      {!isEditing ? (
        <>
          <Text style={styles.bio}>{profileData.bio || "No bio available"}</Text>
          <View style={styles.linksContainer}>
            {profileData.email && (
              <TouchableOpacity
                style={styles.linkButton}
                onPress={() => openLink(`mailto:${profileData.email}`)}
              >
                <Icon name="email" size={30} color="#2A3663" />
              </TouchableOpacity>
            )}
            {profileData.whatsapp && (
              <TouchableOpacity
                style={styles.linkButton}
                onPress={() =>
                  openLink(`https://wa.me/${profileData.whatsapp}`)
                }
              >
                <Icon name="whatsapp" size={30} color="#25D366" />
              </TouchableOpacity>
            )}
            {profileData.github && (
              <TouchableOpacity
                style={styles.linkButton}
                onPress={() => openLink(profileData.github)}
              >
                <Icon name="github" size={30} color="#333" />
              </TouchableOpacity>
            )}
            {profileData.linkedin && (
              <TouchableOpacity
                style={styles.linkButton}
                onPress={() => openLink(profileData.linkedin)}
              >
                <Icon name="linkedin" size={30} color="#0077B5" />
              </TouchableOpacity>
            )}
          </View>

          <TouchableOpacity
            style={styles.editButton}
            onPress={() => setIsEditing(true)}
          >
            <Text style={styles.editButtonText}>Edit Profile</Text>
          </TouchableOpacity>
        </>
      ) : (
        <View style={styles.editForm}>
          <TextInput
            style={styles.input}
            placeholder="Full Name"
            defaultValue={profileData.fullName}
            onChangeText={(text) =>
              setUpdatedProfile((prev) => ({ ...prev, fullName: text }))
            }
          />
          <TextInput
            style={styles.input}
            placeholder="Role"
            defaultValue={profileData.role}
            onChangeText={(text) =>
              setUpdatedProfile((prev) => ({ ...prev, role: text }))
            }
          />
          <TextInput
            style={styles.input}
            placeholder="Bio"
            defaultValue={profileData.bio}
            onChangeText={(text) =>
              setUpdatedProfile((prev) => ({ ...prev, bio: text }))
            }
          />
          <TextInput
            style={styles.input}
            placeholder="Photo URL"
            defaultValue={profileData.photo}
            onChangeText={(text) =>
              setUpdatedProfile((prev) => ({ ...prev, photo: text }))
            }
          />
          <TextInput
            style={styles.input}
            placeholder="Email"
            defaultValue={profileData.email}
            onChangeText={(text) =>
              setUpdatedProfile((prev) => ({ ...prev, email: text }))
            }
          />
          <TextInput
            style={styles.input}
            placeholder="WhatsApp"
            defaultValue={profileData.whatsapp}
            onChangeText={(text) =>
              setUpdatedProfile((prev) => ({ ...prev, whatsapp: text }))
            }
          />
          <TextInput
            style={styles.input}
            placeholder="GitHub"
            defaultValue={profileData.github}
            onChangeText={(text) =>
              setUpdatedProfile((prev) => ({ ...prev, github: text }))
            }
          />
          <TextInput
            style={styles.input}
            placeholder="LinkedIn"
            defaultValue={profileData.linkedin}
            onChangeText={(text) =>
              setUpdatedProfile((prev) => ({ ...prev, linkedin: text }))
            }
          />

          <View style={styles.editActions}>
            <TouchableOpacity
              style={[styles.editButton, styles.saveButton]}
              onPress={handleSave}
            >
              <Text style={styles.editButtonText}>Save</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.editButton, styles.cancelButton]}
              onPress={() => setIsEditing(false)}
            >
              <Text style={styles.editButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Logout Button at the bottom */}
      <TouchableOpacity
        style={[styles.editButton, styles.logoutButton]}
        onPress={handleLogout}
      >
        <Text style={styles.editButtonText}>Logout</Text>
      </TouchableOpacity>
      </>
      }

    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    padding: 20,
    backgroundColor: "#F9F9F9",
  },
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginRight: 15,
  },
  infoContainer: {
    flex: 1,
  },
  name: {
    fontSize: 20,
    fontWeight: "bold",
  },
  role: {
    fontSize: 16,
    color: "#666",
  },
  bio: {
    fontSize: 16,
    color: "#333",
    textAlign: "center",
    marginBottom: 20,
  },
  linksContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 20,
  },
  linkButton: {
    marginHorizontal: 10,
  },
  editButton: {
    backgroundColor: "#2A3663",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    marginTop: 10,
  },
  logoutButton: {
    backgroundColor: "#F44336",
    marginTop: 20,
  },
  saveButton: {
    backgroundColor: "#4CAF50",
    marginRight: 10,
  },
  cancelButton: {
    backgroundColor: "#F44336",
  },
  editButtonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  editForm: {
    width: "100%",
    marginTop: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: "#CCC",
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
    backgroundColor: "#FFF",
  },
  editActions: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
});

export default Profile;
