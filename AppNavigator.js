// navigation/DrawerNavigator.js
import React, { useEffect, useState } from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { View, Text, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Feather, FontAwesome } from '@expo/vector-icons'; // For icons
import { auth, fs, useFirebaseAuth } from './Config/Config'; // Adjust the import path as needed
import Home from './Components/Home'; // Adjust the path as needed
import Courses from './Components/Courses'; // Adjust the path as needed

import StudentProfile from './Components/StudentProfile'; // Adjust the path as needed 

import Attendance from './Components/Attendance'; // Adjust the path as needed CheckAttendance

import Marks from './Components/Marks'; // Adjust the path as needed CheckAttendance
import EnrolledCourses from './Components/EnrolledCourses'; // Adjust the path as needed CheckAttendance
import WithdrawCourses from './Components/WithdrawCourses'; // Adjust the path as needed CheckAttendance

const Drawer = createDrawerNavigator();


const CustomDrawerContent = (props) => {
  const { currentUser, loading } = useFirebaseAuth();
  const [profile, setProfile] = useState(null);
  const insets = useSafeAreaInsets();

  useEffect(() => {
    if (currentUser) {
      const fetchProfile = async () => {
        try {
          const userDoc = await fs.collection('students').doc(currentUser.uid).get();
          if (userDoc.exists) {
            setProfile(userDoc.data());
          }
        } catch (error) {
          console.error('Error fetching profile:', error);
        }
      };
      fetchProfile();
    }
  }, [currentUser]);

  if (loading) {
    return <View className="flex-1 justify-center items-center bg-blue-900"><Text className="text-white">Loading...</Text></View>;
  }

  return (
    <View
      className="flex-1 bg-custom-blue"
      style={{ paddingTop: insets.top, paddingBottom: insets.bottom }}
    >
      {profile && (
        <View className="flex justify-center mt-[-10px] p-4">
          <Image
            source={{ uri: profile.profileUrl }}
            className="w-[85px] h-[85px] rounded-full"
          />
          <View className="">
            <Text className="text-white text-2xl font-bold mt-4">{profile.name}</Text>
            <Text className="text-gray-50 pmt-[5px] font-medium text-sm">{profile.email}</Text>
          </View>
        </View>
      )}

      <View className="w-[90%] mx-auto h-[2px] bg-blue-800 mt-[5px] mb-[15px]" />

      <TouchableOpacity onPress={() => props.navigation.navigate('Home')} className="flex-row items-center py-2 px-4">
        <Feather name="home" size={20} color="#E5E7EB" />
        <Text className="text-gray-200 ml-6 text-lg font-medium">Dashboard</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => props.navigation.navigate('Profile')} className="flex-row items-center py-2 px-4">
        <FontAwesome name="user" size={20} color="#E5E7EB" />
        <Text className="text-gray-200 ml-[30px] text-lg font-medium">Profile</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => props.navigation.navigate('Courses')} className="flex-row items-center py-2 px-4">
        <Feather name="book" size={20} color="#E5E7EB" />
        <Text className="text-gray-200 ml-6 text-lg font-medium">Courses</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => props.navigation.navigate('Marks')} className="flex-row items-center py-2 px-4">
        <Feather name="bar-chart" size={20} color="#E5E7EB" />
        <Text className="text-gray-200 ml-6 text-lg font-medium">Marks</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => props.navigation.navigate('Attendance')} className="flex-row items-center py-2 px-4">
        <Feather name="check-circle" size={20} color="#E5E7EB" />
        <Text className="text-gray-200 ml-6 text-lg font-medium">Attendance</Text>
      </TouchableOpacity>

      <View className="w-[90%] mx-auto h-[2px] bg-blue-800 mt-[8px] mb-[12px]" />
      <Text className="text-white ml-4 text-xl font-bold">Checkout</Text>

      <View className="ml-10 mt-[4px]">
        <TouchableOpacity onPress={() => props.navigation.navigate('Enrollment')} className="flex-row items-center py-2 px-4">
          <Feather name="file-plus" size={20} color="#E5E7EB" />
          <Text className="text-gray-200 ml-4 text-lg font-medium">Enrollment</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => props.navigation.navigate('Withdraw')} className="flex-row items-center py-2 px-4">
          <Feather name="user-x" size={20} color="#E5E7EB" />
          <Text className="text-gray-200 ml-4 text-lg font-medium">Withdraw</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => props.navigation.navigate('Feedback')} className="flex-row items-center py-2 px-4">
          <Feather name="message-circle" size={20} color="#E5E7EB" />
          <Text className="text-gray-200 ml-4 text-lg font-medium">Feedback</Text>
        </TouchableOpacity>
      </View>


      <TouchableOpacity className="flex-row items-center py-[5px] px-4 mt-auto mb-[12px] w-[120px] bg-red-900 rounded-md mx-4"
        onPress={async () => {
          try {
            await auth.signOut();
            props.navigation.navigate('SignIn'); // Navigate to SignIn screen
          } catch (error) {
            console.error("Logout error:", error);
          }
        }}
      >
        <Feather name="log-out" size={20} color="#FFFFFF" />
        <Text className="text-white ml-2 text-lg font-medium">Logout</Text>
      </TouchableOpacity>

    </View>
  );
};

const DrawerNavigator = () => {
  const [profile, setProfile] = useState(null);
  const { currentUser } = useFirebaseAuth();

  useEffect(() => {
    if (currentUser) {
      const fetchProfile = async () => {
        try {
          const userDoc = await fs.collection('students').doc(currentUser.uid).get();
          if (userDoc.exists) {
            setProfile(userDoc.data());
          }
        } catch (error) {
          console.error('Error fetching profile:', error);
        }
      };
      fetchProfile();
    }
  }, [currentUser]);

  const firstName = profile ? profile.name.split(' ')[0] : 'User';

  return (
    <Drawer.Navigator
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={({ navigation }) => ({
        drawerPosition: 'left',
        headerStyle: { backgroundColor: '#1E3A8A' },
        headerTitleStyle: { fontWeight: 'bold', color: '#FFFFFF' },
        headerTintColor: '#FFFFFF',
        headerTitleAlign: 'center',
        headerLeft: () => (
          <View className="ml-[10px] flex flex-row">
            <TouchableOpacity onPress={() => navigation.toggleDrawer()} >
              <Feather name="menu" size={26} color="#FFFFFF" />
            </TouchableOpacity>
            <Text className="text-[14px] font-medium text-white mt-auto ml-[12px]">
              <Text>Welcome, </Text>
              <Text className="font-bold text-[21px]">{`${firstName}`}</Text>
            </Text>
          </View>
        ),
        headerRight: () => (
          profile ? (
            <Image
              source={{ uri: profile.profileUrl }}
              style={{ width: 30, height: 30, borderRadius: 15, marginRight: 10 }}
            />
          ) : (
            <View style={{ width: 30, height: 30, borderRadius: 15, backgroundColor: '#3B82F6', marginRight: 10, justifyContent: 'center', alignItems: 'center' }}>
              <ActivityIndicator size="small" color="#FFFFFF" />
            </View>
          )
        ),
        headerTitle: () => (
          <Text style={{ color: '#FFFFFF', fontSize: 18 }}>
          </Text>
        ),
        drawerContentContainerStyle: {
          backgroundColor: '#1E3A8A',
        },
      })}
    >
      <Drawer.Screen name="Home" component={Home} />
      <Drawer.Screen name="Courses" component={Courses} />

      <Drawer.Screen name="Attendance" component={Attendance} />

      <Drawer.Screen name="Marks" component={Marks} />

      <Drawer.Screen name="Profile" component={StudentProfile} />

      <Drawer.Screen name="Enrollment" component={EnrolledCourses} />
      <Drawer.Screen name="Withdraw" component={WithdrawCourses} />
    </Drawer.Navigator>
  );
};

export default DrawerNavigator;
