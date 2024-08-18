import React, { useState, useEffect, useContext } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, FlatList } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { auth, fs } from '../Config/Config';

import { ThemeContext } from '../Context/ThemeContext';
const CheckAttendance = () => {
  const navigation = useNavigation();
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const { darkMode } = useContext(ThemeContext);

  useEffect(() => {
    const fetchEnrolledCourses = async () => {
      setLoading(true);
      setError(null);

      try {
        const user = auth.currentUser;
        if (user) {
          setCurrentUser(user);

          const studentDoc = await fs.collection('students').doc(user.uid).get();
          if (studentDoc.exists) {
            const student = studentDoc.data();
            const enrolledCoursesIds = student.currentCourses || [];

            const coursesData = await Promise.all(
              enrolledCoursesIds.map(async (courseId) => {
                const assignCourseDoc = await fs.collection('assignCourses').doc(courseId).get();
                if (assignCourseDoc.exists) {
                  const assignCourseData = assignCourseDoc.data();
                  const courseDoc = await fs.collection('courses').doc(assignCourseData.courseId).get();
                  const classDoc = await fs.collection('classes').doc(assignCourseData.classId).get();
                  const instructorDoc = await fs.collection('instructors').doc(assignCourseData.instructorId).get();

                  return {
                    assignCourseId: courseId,
                    courseName: courseDoc.exists ? courseDoc.data().name : 'Unknown',
                    courseHours: courseDoc.exists ? courseDoc.data().creditHours : 'Unknown',
                    className: classDoc.exists ? classDoc.data().name : 'Unknown',
                    instructorName: instructorDoc.exists ? instructorDoc.data().name : 'Unknown',
                  };
                }
                return null;
              })
            );

            setEnrolledCourses(coursesData.filter(course => course !== null));
          } else {
            setError('No student data found for current user');
          }
        } else {
          setError('No user logged in');
        }
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchEnrolledCourses();
  }, []);

  const handleViewAttendance = (courseId) => {
    navigation.navigate('StudentAttendanceDetails', { assignCourseId: courseId });
  };

  return (
    <View className={`flex-1 ${darkMode ? 'bg-gray-200' : 'bg-custom-blue'} p-4`}>
      <Text className={`text-2xl ${darkMode ? 'text-black' : 'text-white'} font-bold`}>Attendance Details</Text>
      <View className={`h-[2px] mt-[10px] w-[100%] mx-auto ${darkMode ? 'bg-gray-300' : 'bg-gray-600'} mb-[18px] rounded-xl`}></View>

      {loading ? (
        <View className={`flex justify-center items-center h-screen ${darkMode ? 'bg-gray-200' : 'bg-custom-blue'} p-4`}>
          <ActivityIndicator size="large" color={darkMode ? "#0056b3" : "#007bff"} />
        </View>
      ) : error ? (
        <Text className={`text-center my-4 ${darkMode ? 'text-red-600' : 'text-red-400'}`}>
          Error: {error}
        </Text>
      ) : (
        <FlatList
          data={enrolledCourses}
              keyExtractor={item => item.assignCourseId}
              showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <View className={`p-4 rounded-lg mb-3 ${darkMode ? 'bg-white' : 'bg-blue-900'}`}>
              <Text className={`text-lg font-bold ${darkMode ? 'text-black' : 'text-white'}`}>{item.courseName}</Text>

              <View className="flex-row justify-between items-center mt-2">
                <Text className={`text-${darkMode ? 'gray-600' : 'gray-300'} text-[16px] underline`}>{item.instructorName}</Text>
                <View className="flex-row">
                  <Text className={`text-${darkMode ? 'black' : 'white'}`}> Credit.Hrs: </Text>
                  <Text className={`font-extrabold ${darkMode ? 'bg-blue-950 text-white' : 'bg-white text-blue-950'} px-[6px] ml-[4px] rounded-md`}>
                    {item.courseHours}
                  </Text>
                </View>
              </View>

              <Text className={`text-${darkMode ? 'gray-800' : 'gray-300'} font-bold mt-[12px]`}>{item.className}</Text>
              <TouchableOpacity
                onPress={() => handleViewAttendance(item.assignCourseId)}
                className={`p-2 rounded-lg mt-3 ${darkMode ? 'bg-blue-900' : 'bg-blue-950'}`}
              >
                <Text className={`text-white font-bold text-center`}>View Attendance</Text>
              </TouchableOpacity>
            </View>
          )}
        />
      )}
    </View>
  );
};

export default CheckAttendance;
