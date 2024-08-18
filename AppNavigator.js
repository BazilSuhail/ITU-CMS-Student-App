// navigation/DrawerNavigator.js
import React, { useEffect, useContext,useState } from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { View, Text, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Feather, FontAwesome } from '@expo/vector-icons';
import { auth, fs, useFirebaseAuth } from './Config/Config';

import Home from './Components/Home';
import Courses from './Components/Courses'; 
import StudentProfile from './Components/StudentProfile'; 
import Attendance from './Components/Attendance';
import Marks from './Components/Marks';
import EnrolledCourses from './Components/EnrolledCourses';
import WithdrawCourses from './Components/WithdrawCourses';
import Feedback from './Components/Feedback';

import { ThemeContext } from './Context/ThemeContext';

const Drawer = createDrawerNavigator();


const CustomDrawerContent = (props) => {
  const { currentUser, loading } = useFirebaseAuth();
  const [profile, setProfile] = useState(null);
  const insets = useSafeAreaInsets();

  const { darkMode } = useContext(ThemeContext);

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
    className={`flex-1 ${darkMode ? 'bg-gray-200' : 'bg-custom-blue'}`}
    style={{ paddingTop: insets.top, paddingBottom: insets.bottom }}
  >
    {profile && (
      <View className="flex justify-center mt-[-10px] p-4">
        <Image
          source={{ uri: profile.profileUrl }}
          className="w-[85px] h-[85px] rounded-full"
        />
        <View>
          <Text className={`${darkMode ? 'text-gray-800' : 'text-white'} text-2xl font-bold mt-4`}>
            {profile.name}
          </Text>
          <Text className={`${darkMode ? 'text-gray-600' : 'text-gray-50'} mt-[5px] font-medium text-sm`}>
            {profile.email}
          </Text>
        </View>
      </View>
    )}
  
    <View className={`w-[90%] mx-auto h-[2px] ${darkMode ? 'bg-gray-400' : 'bg-blue-800'} mt-[5px] mb-[15px]`} />
  
    <TouchableOpacity onPress={() => props.navigation.navigate('Home')} className="flex-row items-center py-2 px-4">
      <Feather name="home" size={20} color={darkMode ? "#4B5563" : "#E5E7EB"} />
      <Text className={`${darkMode ? 'text-gray-600' : 'text-gray-200'} ml-6 text-lg font-medium`}>Dashboard</Text>
    </TouchableOpacity>
  
    <TouchableOpacity onPress={() => props.navigation.navigate('Profile')} className="flex-row items-center py-2 px-4">
      <FontAwesome name="user" size={20} color={darkMode ? "#4B5563" : "#E5E7EB"} />
      <Text className={`${darkMode ? 'text-gray-600' : 'text-gray-200'} ml-[30px] text-lg font-medium`}>Profile</Text>
    </TouchableOpacity>
  
    <TouchableOpacity onPress={() => props.navigation.navigate('Courses')} className="flex-row items-center py-2 px-4">
      <Feather name="book" size={20} color={darkMode ? "#4B5563" : "#E5E7EB"} />
      <Text className={`${darkMode ? 'text-gray-600' : 'text-gray-200'} ml-6 text-lg font-medium`}>Courses</Text>
    </TouchableOpacity>
  
    <TouchableOpacity onPress={() => props.navigation.navigate('Attendance')} className="flex-row items-center py-2 px-4">
      <Feather name="check-circle" size={20} color={darkMode ? "#4B5563" : "#E5E7EB"} />
      <Text className={`${darkMode ? 'text-gray-600' : 'text-gray-200'} ml-6 text-lg font-medium`}>Attendance</Text>
    </TouchableOpacity>
  
    <TouchableOpacity onPress={() => props.navigation.navigate('Marks')} className="flex-row items-center py-2 px-4">
      <Feather name="bar-chart" size={20} color={darkMode ? "#4B5563" : "#E5E7EB"} />
      <Text className={`${darkMode ? 'text-gray-600' : 'text-gray-200'} ml-6 text-lg font-medium`}>Marks</Text>
    </TouchableOpacity>
  
    <View className={`w-[90%] mx-auto h-[2px] ${darkMode ? 'bg-gray-400' : 'bg-blue-800'} mt-[8px] mb-[12px]`} />
    <Text className={`${darkMode ? 'text-gray-800' : 'text-white'} ml-4 text-xl font-bold`}>Checkout</Text>
  
    <View className="ml-10 mt-[4px]">
      <TouchableOpacity onPress={() => props.navigation.navigate('Enrollment')} className="flex-row items-center py-2 px-4">
        <Feather name="file-plus" size={20} color={darkMode ? "#4B5563" : "#E5E7EB"} />
        <Text className={`${darkMode ? 'text-gray-600' : 'text-gray-200'} ml-4 text-lg font-medium`}>Enrollment</Text>
      </TouchableOpacity>
  
      <TouchableOpacity onPress={() => props.navigation.navigate('Withdraw')} className="flex-row items-center py-2 px-4">
        <Feather name="user-x" size={20} color={darkMode ? "#4B5563" : "#E5E7EB"} />
        <Text className={`${darkMode ? 'text-gray-600' : 'text-gray-200'} ml-4 text-lg font-medium`}>Withdraw</Text>
      </TouchableOpacity>
  
      <TouchableOpacity onPress={() => props.navigation.navigate('Feedback')} className="flex-row items-center py-2 px-4">
        <Feather name="message-circle" size={20} color={darkMode ? "#4B5563" : "#E5E7EB"} />
        <Text className={`${darkMode ? 'text-gray-600' : 'text-gray-200'} ml-4 text-lg font-medium`}>Feedback</Text>
      </TouchableOpacity>
    </View>
  
    <TouchableOpacity
      className={`flex-row items-center py-[5px] px-4 mt-auto mb-[12px] w-[120px] ${darkMode ? 'bg-red-600' : 'bg-red-900'} rounded-md mx-4`}
      onPress={async () => {
        try {
          await auth.signOut();
          props.navigation.navigate('SignIn'); // Navigate to SignIn screen
        } catch (error) {
          console.error("Logout error:", error);
        }
      }}
    >
      <Feather name="log-out" size={20} color={darkMode ? "#FFFFFF" : "#FFFFFF"} />
      <Text className={`${darkMode ? 'text-gray-600' : 'text-white'} ml-2 text-lg font-medium`}>Logout</Text>
    </TouchableOpacity>
  
  </View>
  
  );
};

const DrawerNavigator = () => {

  const { darkMode, toggleTheme } = useContext(ThemeContext);

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
        headerStyle: { backgroundColor: darkMode ? 'white' : '#172554' },
        headerTitleStyle: { fontWeight: 'bold', color: '#FFFFFF' },
        headerTintColor: '#FFFFFF',
        headerTitleAlign: 'center',
        headerLeft: () => (
          <View className="ml-[10px] flex flex-row">
            <TouchableOpacity onPress={() => navigation.toggleDrawer()}>
              <Feather name="menu" size={26} color={darkMode ? "#1F2937" : "#FFFFFF"} />
            </TouchableOpacity>
            <Text className={`text-[14px] font-medium ${darkMode ? "text-gray-700" : "text-white"} mt-auto ml-[12px]`}>
              <Text>Welcome, </Text>
              <Text className={`font-bold text-[21px] ${darkMode ? "text-gray-600" : "text-white"}`}>
                {`${firstName}`}
              </Text>
            </Text>
          </View>
        ),
        headerRight: () => (
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <TouchableOpacity onPress={toggleTheme} style={{ marginRight: 15 }}>
              <Feather name={darkMode ? 'sun' : 'moon'} size={24} color={darkMode ? "#1F2937" : "#FFF"} />
            </TouchableOpacity>
        
            {profile ? (
              <Image
                source={{ uri: profile.profileUrl }}
                style={{
                  width: 30,
                  height: 30,
                  borderRadius: 15,
                  marginRight: 10,
                  borderColor: darkMode ? "#374151" : "#3B82F6",
                  borderWidth: 1,
                }}
              />
            ) : (
              <View
                style={{
                  width: 30,
                  height: 30,
                  borderRadius: 15,
                  backgroundColor: darkMode ? "#4B5563" : "#3B82F6",
                  marginRight: 10,
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              >
                <ActivityIndicator size="small" color={darkMode ? "#9CA3AF" : "#FFFFFF"} />
              </View>
            )}
          </View>
        ),
        headerTitle: () => (
          <Text style={{ color: darkMode ? "#D1D5DB" : "#FFFFFF", fontSize: 18 }}>
            {/* Your header title */}
          </Text>
        ),
        drawerContentContainerStyle: {
          backgroundColor: darkMode ? "#1F2937" : "#1E3A8A",
        },
        
      })}
    >
      <Drawer.Screen name="Home" component={Home} />
      <Drawer.Screen name="Courses" component={Courses} />
      <Drawer.Screen name="Profile" component={StudentProfile} />

      <Drawer.Screen name="Attendance" component={Attendance} />
      <Drawer.Screen name="Marks" component={Marks} />

      <Drawer.Screen name="Enrollment" component={EnrolledCourses} />
      <Drawer.Screen name="Withdraw" component={WithdrawCourses} />

      <Drawer.Screen name="Feedback" component={Feedback} />

    </Drawer.Navigator>
  );
};

export default DrawerNavigator;
