import React, { useState, useEffect, useContext } from 'react';
import { Text, View, ScrollView, ActivityIndicator } from 'react-native';
import { auth, fs } from '../Config/Config';
import AntDesign from '@expo/vector-icons/AntDesign';
import { MaterialIcons, FontAwesome5, FontAwesome } from '@expo/vector-icons';
import { ThemeContext } from '../Context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';

const academicCalendar = [
  { date: '2024-09-01', event: 'Fall Semester Begins' },
  { date: '2024-09-10', event: 'Last Day to Add/Drop Classes' },
  { date: '2024-10-15', event: 'Midterm Exams' },
  { date: '2024-11-25', event: 'Thanksgiving Break' },
  { date: '2024-12-15', event: 'Final Exams Begin' },
  { date: '2024-12-20', event: 'End of Fall Semester' },
];

const calculateDaysLeft = (date) => {
  const currentDate = new Date();
  const targetDate = new Date(date);
  const diffTime = Math.abs(targetDate - currentDate);
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

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

  const upcomingEvents = academicCalendar.filter(event => new Date(event.date) > new Date()).slice(0, 2);

  if (loading) {
    return (
      <View className={`flex justify-center items-center h-screen ${darkMode ? 'bg-gray-200' : 'bg-custom-blue'} p-4`}>
        <ActivityIndicator size="large" color="#007bff" />
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
          <Text className={`rounded-lg w-[150px] text-center mb-[15px] text-[16px] font-bold ${darkMode ? 'text-green-700 bg-green-100' : 'text-green-500 bg-green-950'}`}>
            Upcoming Class
          </Text>
          <View className={`shadow-xl rounded-xl py-3 px-4 ${darkMode ? 'bg-white shadow-blue-300' : 'bg-blue-900 shadow-blue-500'}`}>
            <View className="flex flex-row items-center justify-between">
              <Text className={`font-bold mb-[5px] text-[25px] ${darkMode ? 'text-black' : 'text-white'}`}>{nextClass.course}</Text>
              <AntDesign name="clockcircleo" size={28} color={darkMode ? "black" : "white"} />
            </View>
            <View className={`h-[2px] w-[100%] mt-[8px] mx-auto ${darkMode ? 'bg-gray-300' : 'bg-green-100'}`}></View>
            <View>
              <Text className={`font-medium ml-[2px] mt-[8px] w-[150px] underline underline-offset-8 ${darkMode ? 'text-gray-700' : 'text-gray-200'}`}>{nextClass.instructor}</Text>
            </View>
            <View className={`rounded-md mt-[5px] w-[160px] ${darkMode ? 'bg-gray-200' : 'bg-blue-950'}`}>
              <Text className={`py-[3px] font-bold px-[8px] ${darkMode ? 'text-gray-900' : 'text-gray-200'}`}>
                <Text className={`font-medium ${darkMode ? 'text-gray-600' : 'text-blue-200'}`}>Venue:</Text>  {nextClass.venue}
              </Text>
            </View>
            <View className="flex flex-row items-center py-[5px] justify-between">
              <Text className={`font-bold mb-[5px] text-md ${darkMode ? 'text-gray-900' : 'text-blue-200'}`}>
                <Text className={`text-lg ${darkMode ? 'text-black' : 'text-white'}`}>{nextClass.day} | </Text>{nextClass.date}
              </Text>
              <Text className={`font-bold mb-[5px] text-lg ${darkMode ? 'text-gray-700' : 'text-blue-50'}`}>{nextClass.time}</Text>
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
          <Text className={`mt-[28px] rounded-lg w-[160px] py-[4px] text-center mb-[10px] text-[14px] font-bold ${darkMode ? 'text-yellow-700 bg-yellow-100' : 'text-yellow-500 bg-yellow-950'}`}>
            Next Upcoming Class
          </Text>
          <View className={`rounded-xl py-3 px-4 ${darkMode ? 'bg-gray-100 border-2 border-gray-300' : 'bg-blue-950'}`}>
            <View className="flex flex-row items-center justify-between">
              <Text className={`font-bold mb-[5px] text-[18px] ${darkMode ? 'text-black' : 'text-white'}`}>{secondNextClass.course}</Text>
              <AntDesign name="clockcircleo" size={22} color={darkMode ? "black" : "white"} />
            </View>
            <View className={`h-[2px] w-[100%] mt-[8px] mx-auto ${darkMode ? 'bg-gray-300' : 'bg-green-100'}`}></View>
            <View>
              <Text className={`font-medium ml-[2px] mt-[8px] underline underline-offset-8 ${darkMode ? 'text-gray-700' : 'text-gray-200'}`}>{secondNextClass.instructor}</Text>
            </View>
            <View className={`rounded-md mt-[5px] w-[140px] ${darkMode ? 'bg-gray-200' : 'bg-blue-700'}`}>
              <Text className={`py-[3px] font-bold pl-[8px] text-[12px] ${darkMode ? 'text-gray-900' : 'text-gray-200'}`}>
                <Text className={`font-medium ${darkMode ? 'text-gray-600' : 'text-blue-100'}`}>Venue:</Text> {secondNextClass.venue}
              </Text>
            </View>
            <View className="flex flex-row items-center py-[5px] justify-between">
              <Text className={`font-bold mb-[5px] text-md ${darkMode ? 'text-gray-900' : 'text-blue-200'}`}>
                <Text className={`text-[14px] ${darkMode ? 'text-black' : 'text-white'}`}>{secondNextClass.day} | </Text>{secondNextClass.date}
              </Text>
              <Text className={`font-bold mb-[5px] text-[14px] ${darkMode ? 'text-gray-700' : 'text-blue-50'}`}>{secondNextClass.time}</Text>
            </View>
          </View>
        </View>
      ) : (
        <View className="mt-5">
          <Text className={`${darkMode ? 'text-gray-800' : 'text-gray-200'}`}>No second upcoming class found.</Text>
        </View>
      )}

      <View className={`h-[3px] mt-[25px] mx-3 ${darkMode ? 'bg-gray-400' : 'bg-green-100'}`}></View>
      <Text className={`${darkMode ? 'text-black' : 'text-white'} text-2xl mx-4 font-bold my-4`}>
        Academic OverView
      </Text>
      <View className="flex-row mx-1 justify-center space-x-4 mb-1">
        <View className={`flex-row items-center px-5 py-5 rounded-lg w-[45%] ${darkMode ? 'bg-white' : 'bg-custom-card-blue'}`}>
          <FontAwesome5 name="calendar-alt" size={45} color={darkMode ? "#9ca3af" : "#BFDBFE"} />
          <View className="flex ml-[15px] items-center">
            <Text className={`font-bold text-[10px] ${darkMode ? 'text-gray-400' : 'text-gray-400'}`}>Current Semester</Text>
            <Text className={`text-[30px] font-bold ${darkMode ? 'text-gray-600' : 'text-white'}`}>{userData.semester}</Text>
          </View>
        </View>

        <View className={`flex-row items-center py-5 px-3 rounded-lg w-[45%] ${darkMode ? 'bg-white' : 'bg-custom-card-blue'}`}>
          <MaterialIcons name="class" size={45} color={darkMode ? "#9ca3af" : "#BFDBFE"} />
          <View className="flex ml-[10px] items-center">
            <Text className={`font-bold text-[12px] ${darkMode ? 'text-gray-400' : 'text-gray-400'}`}>Courses Enrolled</Text>
            <Text className={`text-[28px] font-bold ${darkMode ? 'text-gray-600' : 'text-blue-50'}`}>{userData.enrolledCourses.length}</Text>
          </View>
        </View>
      </View>

      <View className="flex-row mt-[15px] mx-1 justify-center space-x-4 mb-4">
        <View className={`flex-row items-center px-3 py-5 rounded-lg w-[45%] ${darkMode ? 'bg-white' : 'bg-custom-card-blue'}`}>
          <Ionicons name="school-outline" size={45} color={darkMode ? "#9ca3af" : "#BFDBFE"} />
          <View className="flex ml-[10px] justify-center items-center">
            <Text className={`font-bold text-[14px] ${darkMode ? 'text-gray-400' : 'text-gray-400'}`}>Recent SGPA</Text>
            <Text className={`text-[32px] font-bold ${darkMode ? 'text-gray-600' : 'text-white'}`}>{getRecentSemesterGPA()}</Text>
          </View>
        </View>

        <View className={`flex-row items-center py-5 px-3 rounded-lg w-[45%] ${darkMode ? 'bg-white' : 'bg-custom-card-blue'}`}>
          <FontAwesome name="graduation-cap" size={42} color={darkMode ? "#9ca3af" : "#BFDBFE"} />
          <View className="flex ml-[15px] justify-center items-center">
            <Text className={`font-bold text-[14px] ${darkMode ? 'text-gray-400' : 'text-gray-400'}`}>CGPA</Text>
            <Text className={`text-[32px] font-bold ${darkMode ? 'text-gray-600' : 'text-white'}`}>{calculateCGPA()}</Text>
          </View>
        </View>
      </View>

      <View className={`h-[3px] mt-[25px] mx-3 ${darkMode ? 'bg-gray-400' : 'bg-blue-900'}`}></View>

      <View className={`p-4`}>
        <View className={` ${darkMode ? 'bg-gray-100' : 'bg-blue-900'} border-2 ${darkMode ? 'border-gray-300' : 'border-blue-900'} rounded-lg mt-3 px-4 pt-5`}>
          <Text className={`${darkMode ? 'text-gray-600' : 'text-white'} text-2xl font-bold mb-4`}>
            Announcements
          </Text>

          {upcomingEvents.map((event, index) => {
            const daysUntilEvent = calculateDaysLeft(event.date);
            return (
              <View
                key={index}
                className={`${darkMode ? 'bg-white' : 'bg-blue-950'} mb-6 w-[100%] px-2 py-5 mx-auto rounded-lg flex-row items-start`}
              >
                <View className="ml-[10px] mt-[5px]">
                  <FontAwesome
                    name={index === 0 ? "bullhorn" : "calendar"}
                    size={28}
                    color={darkMode ? "#9ca3af" : "white"}
                  />
                </View>
                <View className="flex-1 ml-[15px]">
                  <Text className={`${darkMode ? 'text-gray-700' : 'text-gray-50'} mb-2 text-[18px] font-extrabold`}>
                    {index === 0 ? 'Next Event' : 'Following Event'}: {event.event}
                  </Text>
                  <Text className={`${darkMode ? 'text-gray-500' : 'text-blue-200'} font-medium text-[12px]`}>
                    {daysUntilEvent} days left until {event.event} on {event.date}.
                  </Text>
                </View>
              </View>
            );
          })}
        </View>


        <View className={`h-[3px] mt-[25px] ${darkMode ? 'bg-gray-400' : 'bg-blue-900'}`}></View>
        <Text className={`${darkMode ? 'text-black' : 'text-white'} text-2xl  font-bold my-4`}>
          Academic Calender
        </Text>

        {/* Tabular Format for Calendar */}
        <View className={`${darkMode ? 'border-gray-300' : 'border-gray-600'} flex `}>
          <View className={`flex-row justify-center ${darkMode ? 'bg-gray-700' : 'bg-blue-500'} w-full py-2 rounded-t-lg`}>
            <Text className="w-[40%] text-center text-white font-bold">Date</Text>
            <Text className="w-[60%] text-center text-white font-bold">Event</Text>
          </View>

          {academicCalendar.map((item, index) => (
            <View
              key={index}
              className={`flex-row justify-center w-full px-3 py-3 ${index % 2 === 0 ? (darkMode ? 'bg-white' : 'bg-blue-950') : (darkMode ? 'bg-gray-100' : 'bg-blue-900')}`}
            >
              <Text className={`${darkMode ? 'text-gray-700' : 'text-gray-300'} w-[40%] text-center font-bold text-[15px]`}>
                {item.date}
              </Text>
              <Text className={`${darkMode ? 'text-gray-600' : 'text-gray-200'} w-[60%] text-[14px] text-center`}>
                {item.event}
              </Text>
            </View>
          ))}
        </View>
      </View>
      <View className="h-[35px]"></View>

    </ScrollView>

  );
};

export default Home;
