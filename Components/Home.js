import React, { useState, useEffect, useContext } from 'react';
import { Text, View, ScrollView, ActivityIndicator } from 'react-native';
import { auth, fs } from '../Config/Config';
import AntDesign from '@expo/vector-icons/AntDesign';
import { MaterialIcons, FontAwesome5 ,FontAwesome } from '@expo/vector-icons';
import { ThemeContext } from '../Context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';


const Home = () => {
  const [userData, setUserData] = useState(null);
  const [nextClass, setNextClass] = useState(null);
  const [secondNextClass, setSecondNextClass] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const { darkMode } = useContext(ThemeContext);

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
    <ScrollView className={`flex py-4 ${darkMode ? 'bg-gray-200' : 'bg-custom-blue'}`}>
      {nextClass ? (
        <View className="mx-4">
          <Text className={`rounded-lg w-[150px] text-center mb-[15px] text-lg font-bold ${darkMode ? 'text-green-600 bg-green-100 border-2 border-green-600' : 'text-green-500 bg-green-950'}`}>
            Upcoming Class
          </Text>
          <View className={`shadow-xl rounded-xl py-3 px-4 ${darkMode ? 'bg-white shadow-blue-300' : 'bg-blue-900 shadow-blue-500'}`}>
            <View className="flex flex-row items-center justify-between">
              <Text className={`font-bold mb-[5px] text-[25px] ${darkMode ? 'text-black' : 'text-white'}`}>{nextClass.course}</Text>
              <AntDesign name="clockcircleo" size={28} color={darkMode ? "black" : "white"} />
            </View>
            <View className={`h-[2px] w-[100%] mt-[8px] mx-auto ${darkMode ? 'bg-green-900' : 'bg-green-100'}`}></View>
            <View>
              <Text className={`font-medium ml-[2px] mt-[8px] w-[150px] underline underline-offset-8 ${darkMode ? 'text-gray-700' : 'text-gray-200'}`}>{nextClass.instructor}</Text>
            </View>
            <View className={`rounded-md mt-[5px] w-[160px] ${darkMode ? 'bg-blue-200' : 'bg-blue-950'}`}>
              <Text className={`py-[3px] font-bold px-[8px] ${darkMode ? 'text-black' : 'text-gray-200'}`}>
                <Text className={`font-medium ${darkMode ? 'text-blue-800' : 'text-blue-200'}`}>Venue:</Text>  {nextClass.venue}
              </Text>
            </View>
            <View className="flex flex-row items-center py-[5px] justify-between">
              <Text className={`font-bold mb-[5px] text-md ${darkMode ? 'text-blue-900' : 'text-blue-200'}`}>
                <Text className={`text-lg ${darkMode ? 'text-black' : 'text-white'}`}>{nextClass.day} | </Text>{nextClass.date}
              </Text>
              <Text className={`font-bold mb-[5px] text-lg ${darkMode ? 'text-blue-900' : 'text-blue-50'}`}>{nextClass.time}</Text>
            </View>
          </View>
        </View>
      ) : (
        <View className="mt-5">
          <Text className={`${darkMode ? 'text-gray-800' : 'text-gray-200'}`}>No upcoming classes found.</Text>
        </View>
      )}

      {secondNextClass ? (
        <View className="mx-4">
          <Text className={`mt-[35px] rounded-lg w-[200px] text-center mb-[15px] text-lg font-bold ${darkMode ? 'text-yellow-700 border border-yellow-600 bg-yellow-100' : 'text-yellow-500 bg-yellow-950'}`}>
            Next Upcoming Class
          </Text>
          <View className={`shadow-lg rounded-xl py-3 px-4 ${darkMode ? 'bg-gray-300 shadow-blue-100' : 'bg-blue-950 shadow-blue-200'}`}>
            <View className="flex flex-row items-center justify-between">
              <Text className={`font-bold mb-[5px] text-[25px] ${darkMode ? 'text-black' : 'text-white'}`}>{secondNextClass.course}</Text>
              <AntDesign name="clockcircleo" size={28} color={darkMode ? "black" : "white"} />
            </View>
            <View className={`h-[2px] w-[100%] mt-[8px] mx-auto ${darkMode ? 'bg-green-900' : 'bg-green-100'}`}></View>
            <View>
              <Text className={`font-medium ml-[2px] mt-[8px] underline underline-offset-8 ${darkMode ? 'text-gray-700' : 'text-gray-200'}`}>{secondNextClass.instructor}</Text>
            </View>
            <View className={`rounded-md mt-[5px] w-[160px] ${darkMode ? 'bg-blue-200' : 'bg-blue-700'}`}>
              <Text className={`py-[3px] font-bold pl-[8px] ${darkMode ? 'text-black' : 'text-gray-200'}`}>
                <Text className={`font-medium ${darkMode ? 'text-blue-800' : 'text-blue-100'}`}>Venue:</Text>  {secondNextClass.venue}
              </Text>
            </View>
            <View className="flex flex-row items-center py-[5px] justify-between">
              <Text className={`font-bold mb-[5px] text-md ${darkMode ? 'text-blue-900' : 'text-blue-200'}`}>
                <Text className={`text-lg ${darkMode ? 'text-black' : 'text-white'}`}>{secondNextClass.day} | </Text>{secondNextClass.date}
              </Text>
              <Text className={`font-bold mb-[5px] text-lg ${darkMode ? 'text-blue-900' : 'text-blue-50'}`}>{secondNextClass.time}</Text>
            </View>
          </View>
        </View>
      ) : (
        <View className="mt-5">
          <Text className={`${darkMode ? 'text-gray-800' : 'text-gray-200'}`}>No second upcoming class found.</Text>
        </View>
      )}

      <View className="flex-row mt-[35px] justify-center space-x-4 mb-1">
        <View className={`flex-row items-center px-3 py-5 rounded-lg w-[45%] ${darkMode ? 'bg-white' : 'bg-custom-card-blue'}`}>
          <View className="flex-row items-center">
            <FontAwesome5 name="calendar-alt" size={25} color={darkMode ? "black" : "white"} />
            <View className={`h-[45px] mx-[10px] w-[2px] ${darkMode ? 'bg-black' : 'bg-white'}`}></View>
          </View>
          <View className="flex ml-[10px] items-center">
            <Text className={`font-bold text-[12px] mb-[2px] ${darkMode ? 'text-gray-600' : 'text-gray-400'}`}>Current Semester</Text>
            <Text className={`text-[32px] font-bold ${darkMode ? 'text-black' : 'text-white'}`}>{userData.semester}</Text>
          </View>
        </View>

        <View className={`flex-row items-center py-5 px-3 rounded-lg w-[45%] ${darkMode ? 'bg-white' : 'bg-custom-card-blue'}`}>
          <View className="flex-row items-center">
            <MaterialIcons name="class" size={45} color={darkMode ? "black" : "white"} /> 
          </View>
          <View className="flex ml-[10px] items-center">
            <Text className={`font-bold text-[12px] mb-[2px] ${darkMode ? 'text-gray-600' : 'text-gray-400'}`}>Courses Enrolled</Text>
            <Text className={`text-[28px] font-bold ${darkMode ? 'text-black' : 'text-white'}`}>{userData.enrolledCourses.length}</Text>
          </View>
        </View>
      </View>

      <View className="flex-row mt-[15px] justify-center space-x-4 mb-4">
        <View className={`flex-row items-center px-3 py-5 rounded-lg w-[45%] ${darkMode ? 'bg-white' : 'bg-custom-card-blue'}`}>
          <View className="flex-row items-center">
            <Ionicons name="school-outline" size={25} color={darkMode ? "black" : "white"} />
            <View className={`h-[45px] mx-[10px] w-[2px] ${darkMode ? 'bg-black' : 'bg-white'}`}></View>
          </View>
          <View className="flex ml-[10px] justify-center items-center">
            <Text className={`font-bold text-[14px] mb-[2px] ${darkMode ? 'text-gray-600' : 'text-gray-400'}`}>Recent SGPA</Text>
            <Text className={`text-[32px] font-bold ${darkMode ? 'text-black' : 'text-white'}`}>{getRecentSemesterGPA()}</Text>
          </View>
        </View>

        <View className={`flex-row items-center py-5 px-3 rounded-lg w-[45%] ${darkMode ? 'bg-white' : 'bg-custom-card-blue'}`}>
          <View className="flex-row items-center">
            <FontAwesome name="graduation-cap" size={25} color={darkMode ? "black" : "white"} />
            <View className={`h-[45px] mx-[10px] w-[2px] ${darkMode ? 'bg-black' : 'bg-white'}`}></View>
          </View>
          <View className="flex ml-[10px] justify-center items-center">
            <Text className={`font-bold text-[14px] mb-[2px] ${darkMode ? 'text-gray-600' : 'text-gray-400'}`}>CGPA</Text>
            <Text className={`text-[32px] font-bold ${darkMode ? 'text-black' : 'text-white'}`}>{calculateCGPA()}</Text>
          </View>
        </View>
      </View>
    </ScrollView>

  );
};

export default Home;
