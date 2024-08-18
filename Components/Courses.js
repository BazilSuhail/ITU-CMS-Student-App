import React, { useState, useEffect, useContext, useMemo } from 'react';
import { View, Text, TouchableOpacity, FlatList, ActivityIndicator, ScrollView } from 'react-native';
import { fs, auth } from '../Config/Config';
import { Ionicons } from '@expo/vector-icons';
import { ThemeContext } from '../Context/ThemeContext';

const CourseTable = ({ coursesData }) => {
  const { darkMode } = useContext(ThemeContext);
  const renderItem = ({ item }) => (
    <View className={`flex-row py-2  ${darkMode ? 'bg-white' : 'bg-blue-950'}`}>
      <Text className={`w-[200px] font-semibold px-2 ${darkMode ? 'text-gray-500' : 'text-white'}`}>
        {item.courseName}
      </Text>
      <Text className={`text-center w-[90px] font-medium underline my-auto px-2 ${darkMode ? 'text-gray-500' : 'text-white'}`}>
        {item.code}
      </Text>
      <Text className={`text-center w-[90px] mx-[15px] font-bold my-auto h-[22px] rounded-lg ${darkMode ? 'bg-gray-200 text-gray-700' : 'bg-white text-blue-950'}`}>
        {item.creditHours}
      </Text>
      <Text className={`text-center w-[90px] font-medium my-auto px-2 ${darkMode ? 'text-gray-500' : 'text-white'}`}>
        {item.expectedSemester}
      </Text>
    </View>
  );
  const memoizedData = useMemo(() => coursesData, [coursesData]);

  return (
    <ScrollView horizontal className="mx-[7px] mt-[18px]">
      <View >
        <View className={`flex-row  ${darkMode ? 'bg-gray-700' : 'bg-blue-500'} py-2 rounded-t-lg`}>
          <Text className="flex-1 w-[200px] text-center text-white font-bold">Course Name</Text>
          <Text className="flex-1 text-center w-[90px] text-white font-bold">Crs.Code</Text>
          <Text className="flex-1 text-center w-[90px] text-white font-bold">Credit.Hrs</Text>
          <Text className="flex-1 text-center w-[90px] text-white font-bold">Semester</Text>
        </View>

        <FlatList
          data={memoizedData}
          renderItem={renderItem}
          keyExtractor={(item) => item.assignCourseId || item.courseName} // Ensure unique key
          className="max-h-80"
        />
      </View>
    </ScrollView>
  );
};

const DisplayCourses = ({ coursesData }) => {
  const { darkMode } = useContext(ThemeContext);
  const renderItem = ({ item }) => (
    <View className={`flex rounded-lg py-[16px] mt-[18px] px-[12px] w-full ${darkMode ? 'bg-white' : 'bg-blue-950'}`}>
     <Text className={`font-medium text-xl ${darkMode ? 'text-gray-900' : 'text-gray-100'}`}>
        {item.courseName}
      </Text>
      <View className="flex-row mt-[7px] justify-between">
        <Text className={`font-medium ${darkMode ? 'text-gray-600' : 'text-gray-400'}`}>
          {item.instructorName}
        </Text>
        <Text className={`font-medium ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
          {item.className}
        </Text>
      </View>
    </View>
  );
  const memoizedData = useMemo(() => coursesData, [coursesData]);

  return (
    <View className="mx-[7px]">
      <FlatList
        data={memoizedData}
        renderItem={renderItem}
        keyExtractor={(item) => item.assignCourseId || item.courseName}
      />
    </View>
  );
};

const ShowCourses = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [completedCourses, setCompletedCourses] = useState([]);
  const [currentCourses, setCurrentCourses] = useState([]);
  const [showCompletedCourses, setShowCompletedCourses] = useState(false);
  const { darkMode } = useContext(ThemeContext);

  useEffect(() => {
    const fetchCourses = async () => {
      setLoading(true);
      setError(null);

      try {
        const user = auth.currentUser;
        if (user) {
          const studentId = user.uid;
          const studentDoc = await fs.collection('students').doc(studentId).get();
          if (studentDoc.exists) {
            const studentData = studentDoc.data();
            const completedCourseIds = studentData.completedCourses || [];
            const currentCourseIds = studentData.currentCourses || [];

            const fetchCompletedCourseDetails = async (courseIds) => {
              return Promise.all(
                courseIds.map(async (courseId) => {
                  try {
                    const courseDoc = await fs.collection('courses').doc(courseId).get();
                    if (courseDoc.exists) {
                      const courseData = courseDoc.data();
                      return {
                        courseName: courseData.name,
                        code: courseData.code,
                        creditHours: courseData.creditHours,
                        expectedSemester: courseData.expectedSemester,
                      };
                    }
                    return null;
                  } catch (err) {
                    console.error('Error fetching course details:', err);
                    return null;
                  }
                })
              );
            };

            const fetchCurrentCourseDetails = async (courseIds) => {
              return Promise.all(
                courseIds.map(async (courseId) => {
                  try {
                    const assignCourseDoc = await fs.collection('assignCourses').doc(courseId).get();
                    if (assignCourseDoc.exists) {
                      const assignCourseData = assignCourseDoc.data();
                      const courseDoc = await fs.collection('courses').doc(assignCourseData.courseId).get();
                      const classDoc = await fs.collection('classes').doc(assignCourseData.classId).get();
                      const instructorDoc = await fs.collection('instructors').doc(assignCourseData.instructorId).get();

                      return {
                        assignCourseId: courseId,
                        courseName: courseDoc.exists ? courseDoc.data().name : 'Unknown Course',
                        className: classDoc.exists ? classDoc.data().name : 'Unknown Class',
                        instructorName: instructorDoc.exists ? instructorDoc.data().name : 'Unknown Instructor',
                      };
                    }
                    return null;
                  } catch (err) {
                    console.error('Error fetching course details:', err);
                    return null;
                  }
                })
              );
            };

            const completedCoursesData = await fetchCompletedCourseDetails(completedCourseIds);
            const currentCoursesData = await fetchCurrentCourseDetails(currentCourseIds);

            setCompletedCourses(completedCoursesData.filter(course => course !== null));
            setCurrentCourses(currentCoursesData.filter(course => course !== null));
          } else {
            setError('Student data not found');
          }
        } else {
          setError('User not logged in');
        }
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  // Use useMemo to optimize performance
  const currentCoursesMemo = useMemo(() => currentCourses, [currentCourses]);
  const completedCoursesMemo = useMemo(() => completedCourses, [completedCourses]);

  return (
    <View className={`flex-1 py-2 ${darkMode ? 'bg-gray-200' : 'bg-custom-blue'}`}>
      <View className="flex-row mt-[12px] px-[5px] justify-between space-x-2 mb-4">
        <TouchableOpacity
          className={`flex p-3 rounded-lg w-[46%] ${!showCompletedCourses
            ? darkMode
              ? 'bg-gray-700'
              : 'bg-blue-900'
            : darkMode
              ? 'bg-gray-500'
              : 'bg-gray-700'}`}
          onPress={() => setShowCompletedCourses(false)}
        >
          <Ionicons name="school-outline" size={36} color="white" />
          <Text className={`text-[18px] font-bold mt-[5px] ${darkMode ? 'text-white' : 'text-gray-100'}`}>Current Courses</Text>
        </TouchableOpacity>

        <TouchableOpacity
          className={`flex p-3 rounded-lg w-[50%] ${showCompletedCourses
            ? darkMode
              ? 'bg-gray-700'
              : 'bg-blue-900'
            : darkMode
              ? 'bg-gray-500'
              : 'bg-gray-700'}`}
          onPress={() => setShowCompletedCourses(true)}
        >
          <Ionicons name="checkmark-done-outline" size={36} color="white" />
          <Text className={`text-[18px] font-bold mt-[5px] ${darkMode ? 'text-white' : 'text-gray-100'}`}>Completed Courses</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#0000ff" className="flex-1 justify-center" />
      ) : error ? (
        <Text className="text-red-500 text-center text-lg">Error: {error}</Text>
      ) : !showCompletedCourses ? (
        <DisplayCourses coursesData={currentCoursesMemo} />
      ) : (
        <CourseTable coursesData={completedCoursesMemo} />
      )}
    </View>
  );
};

export default ShowCourses;
