import React, { useState, useEffect } from 'react';
import { Text, View, ScrollView, ActivityIndicator } from 'react-native';
import { auth, fs } from '../Config/Config';
import AntDesign from '@expo/vector-icons/AntDesign';
import { MaterialIcons, FontAwesome5 } from '@expo/vector-icons';

import { Ionicons } from '@expo/vector-icons';


const Home = () => {
  const [userData, setUserData] = useState(null);
  const [nextClass, setNextClass] = useState(null);
  const [secondNextClass, setSecondNextClass] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUserDataAndSchedule = async () => {
      const user = auth.currentUser;

      if (user) {
        try {
          // Fetch user data
          const userDoc = await fs.collection('students').doc(user.uid).get();
          if (userDoc.exists) {
            const data = userDoc.data();
            setUserData(data);

            // Get the classId from user data
            const classId = data.classId;

            if (classId) {
              // Fetch schedule data for the class
              const scheduleDoc = await fs.collection('scheduleOfClasses').doc(classId).get();
              if (scheduleDoc.exists) {
                const scheduleData = scheduleDoc.data().schedule || [];

                // Find the next upcoming classes
                const now = new Date();
                const upcomingClasses = scheduleData
                  .map(entry => {
                    const [classDate, classTime] = [entry.date, entry.time].map(str => str.trim());
                    const [year, month, day] = classDate.split('-').map(num => parseInt(num, 10));
                    const [hour, minute] = classTime.split(':').map(num => parseInt(num, 10));
                    const isPM = classTime.toLowerCase().includes('pm');

                    const classDateTime = new Date(year, month - 1, day, hour % 12 + (isPM ? 12 : 0), minute);

                    return {
                      ...entry,
                      classDateTime,
                    };
                  })
                  .filter(entry => entry.classDateTime > now)
                  .sort((a, b) => a.classDateTime - b.classDateTime);

                setNextClass(upcomingClasses[0] || null);
                setSecondNextClass(upcomingClasses[1] || null);
              }
            }
          }
        } catch (error) {
          setError("Error fetching data: " + error.message);
        }
      }

      setLoading(false);
    };

    fetchUserDataAndSchedule();
  }, []);

  const calculateCGPA = () => {
    if (userData && userData.results && userData.results.length > 0) {
      // Convert GPA strings to numbers and filter out invalid entries
      const validResults = userData.results
        .map(result => {
          const gpaNumber = parseFloat(result.gpa);
          return { ...result, gpa: !isNaN(gpaNumber) ? gpaNumber : 0 };
        })
        .filter(result => !isNaN(result.gpa) && result.gpa > 0); // Filter out any non-numeric or zero values

      if (validResults.length > 0) {
        const totalGPA = validResults.reduce((sum, result) => sum + result.gpa, 0);
        return (totalGPA / validResults.length).toFixed(2);
      }
    }
    return "No valid GPA data available";
  };



  const getRecentSemesterGPA = () => {
    if (userData && userData.results && userData.results.length > 0) {
      const recentResult = userData.results[userData.results.length - 1];
      return recentResult.gpa;
    }
    return "No recent GPA data available";
  };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 justify-center items-center">
        <Text className="text-red-500">{error}</Text>
      </View>
    );
  }

  if (!userData) {
    return (
      <View className="flex-1 justify-center items-center">
        <Text>No user data available</Text>
      </View>
    );
  }

  return (
    <ScrollView className="bg-custom-blue flex py-4">
      {nextClass ? (
        <View className="mx-4">
          <Text className="text-green-500 bg-green-950 rounded-lg w-[150px] text-center mb-[15px] text-lg font-bold">
            Upcoming Class
          </Text>
          <View className="bg-blue-900 shadow-xl shadow-blue-500 rounded-xl py-3 px-4">
            <View className="flex flex-row items-center justify-between">
              <Text className="text-white font-bold mb-[5px] text-[25px]">{nextClass.course}</Text>
              <AntDesign name="clockcircleo" size={28} color="white" />
            </View>
            <View className="h-[2px] w-[100%] mt-[8px] mx-auto bg-green-100 "></View>
            <View>
              <Text className="text-gray-200 font-medium ml-[2px] mt-[8px] w-[150px] underline underline-offset-8">{nextClass.instructor}</Text>
            </View>
            <View className="bg-blue-950 rounded-md mt-[5px] w-[160px]">
              <Text className="text-gray-200 py-[3px] font-bold px-[8px]"><Text className="font-medium text-blue-200">Venue:</Text>  {nextClass.venue}</Text>
            </View>
            <View className="flex flex-row items-center py-[5px] justify-between">
              <Text className="text-blue-200 font-bold mb-[5px] text-md"><Text className="text-lg text-white">{nextClass.day} | </Text>{nextClass.date}</Text>
              <Text className="text-blue-50 font-bold mb-[5px] text-lg">{nextClass.time}</Text>
            </View>
          </View>
        </View>
      ) : (
        <View className="mt-5">
          <Text className="text-gray-200">No upcoming classes found.</Text>
        </View>
      )}

      {secondNextClass ? (
        <View className="mx-4">
          <Text className="text-yellow-500 mt-[35px] bg-yellow-950 rounded-lg w-[200px] text-center mb-[15px] text-lg font-bold">
            Next Upcoming Class
          </Text>
          <View className="bg-blue-950 shadow-lg shadow-blue-200 rounded-xl py-3 px-4">
            <View className="flex flex-row items-center justify-between">
              <Text className="text-white font-bold mb-[5px] text-[25px]">{secondNextClass.course}</Text>
              <AntDesign name="clockcircleo" size={28} color="white" />
            </View>
            <View className="h-[2px] w-[100%] mt-[8px] mx-auto bg-green-100 "></View>
            <View>
              <Text className="text-gray-200 font-medium ml-[2px] mt-[8px] underline underline-offset-8">{secondNextClass.instructor}</Text>
            </View>
            <View className="bg-blue-700 rounded-md mt-[5px] w-[160px]">
              <Text className="text-gray-200 py-[3px] font-bold pl-[8px]"><Text className="font-medium text-blue-100">Venue:</Text>  {secondNextClass.venue}</Text>
            </View>
            <View className="flex flex-row items-center py-[5px] justify-between">
              <Text className="text-blue-200 font-bold mb-[5px] text-md"><Text className="text-lg text-white">{secondNextClass.day} | </Text>{secondNextClass.date}</Text>
              <Text className="text-blue-50 font-bold mb-[5px] text-lg">{secondNextClass.time}</Text>
            </View>
          </View>
        </View>
      ) : (
        <View className="mt-5">
          <Text className="text-gray-200">No second upcoming class found.</Text>
        </View>
      )}

      <View className="flex-row mt-[35px] justify-center space-x-4 mb-1">
        <View className="bg-custom-card-blue flex-row items-center px-3 py-5 rounded-lg w-[45%] ">
          <View className="flex-row items-center">
          <FontAwesome5 name="calendar-alt" size={25} color="white" /> 
            <View className="h-[45px] mx-[10px] w-[2px] bg-white "></View>
          </View>
          <View className="flex ml-[10px] items-center">
            <Text className="text-gray-400 font-bold text-[12px] mb-[2px]">Current Semester</Text>
            <Text className="text-white text-[32px] font-bold ">{userData.semester}</Text>
          </View>
        </View>

        <View className="bg-custom-card-blue flex-row items-center py-5 px-3 rounded-lg w-[45%] ">
          <View className="flex-row items-center">
          <MaterialIcons name="class" size={25} color="white" />
            <View className="h-[45px] mx-[10px] w-[2px] bg-white "></View>
          </View>
          <View className="flex ml-[10px] items-center">
            <Text className="text-gray-400 font-bold text-[12px] mb-[2px]">Courses Enrolled</Text>
            <Text className="text-white text-[32px] font-bold ">{userData.enrolledCourses.length}</Text>
          </View>
        </View>
      </View>
       
      <View className="flex-row mt-[15px] justify-center space-x-4 mb-4">
        <View className="bg-custom-card-blue flex-row items-center px-3 py-5 rounded-lg w-[45%] ">
          <View className="flex-row items-center">
            <Ionicons name="school-outline" size={25} color="white" />
            <View className="h-[45px] mx-[10px] w-[2px] bg-white "></View>
          </View>
          <View className="flex ml-[10px] justify-center items-center">
            <Text className="text-gray-400 font-bold text-[14px] mb-[2px]">Recent SGPA</Text>
            <Text className="text-white text-[32px] font-bold ">{getRecentSemesterGPA()}</Text>
          </View>
        </View>

        <View className="bg-custom-card-blue flex-row items-center py-5 px-3 rounded-lg w-[45%] ">
          <View className="flex-row items-center">
            <MaterialIcons name="grade" size={25} color="white" />
            <View className="h-[45px] mx-[10px] w-[2px] bg-white "></View>
          </View>
          <View className="flex ml-[25px] justify-center items-center">
            <Text className="text-gray-400 font-bold text-[14px] mb-[2px]">Grade</Text>
            <Text className="text-white text-[32px] font-bold ">{calculateCGPA()}</Text>
          </View>
        </View>
      </View> 
 
    </ScrollView>
  );
};

export default Home;
