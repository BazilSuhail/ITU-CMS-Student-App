import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, TouchableOpacity, FlatList, ActivityIndicator, ScrollView } from 'react-native';
import { fs, auth } from '../Config/Config'; // Ensure this path is correct
import { Ionicons } from '@expo/vector-icons'; // For icons

const CourseTable = ({ coursesData, type }) => {
  const renderItem = ({ item }) => (
    <View className="flex-row py-2 border-b border-gray-200">
      <Text className="flex-1 text-center px-2">{item.courseName}</Text>
      {type !== 'Completed' && (
        <>
          <Text className="flex-1 text-center px-2">{item.instructorName}</Text>
          <Text className="flex-1 text-center px-2">{item.className}</Text>
        </>
      )}
      {type === 'Completed' && (
        <>
          <Text className="flex-1 text-center px-2">{item.code}</Text>
          <Text className="flex-1 text-center px-2">{item.creditHours}</Text>
          <Text className="flex-1 text-center px-2">{item.expectedSemester}</Text>
        </>
      )}
    </View>
  );
  const memoizedData = useMemo(() => coursesData, [coursesData]);

  return (
    <ScrollView horizontal className="bg-white rounded-lg p-4 shadow-md">
      <View>
        <Text className="text-lg font-bold mb-2">{type} Courses</Text>
        <View className="flex-row bg-blue-500 py-2 rounded-t-lg mb-2">
          <Text className="flex-1 text-center text-white font-bold">Course Name</Text>
          {type !== 'Completed' && (
            <>
              <Text className="flex-1 text-center text-white font-bold">Instructor</Text>
              <Text className="flex-1 text-center text-white font-bold">Class Name</Text>
            </>
          )}
          {type === 'Completed' && (
            <>
              <Text className="flex-1 text-center text-white font-bold">Crs.Code</Text>
              <Text className="flex-1 text-center text-white font-bold">Credit.Hrs</Text>
              <Text className="flex-1 text-center text-white font-bold">Semester</Text>
            </>
          )}
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

const ShowCourses = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [completedCourses, setCompletedCourses] = useState([]);
  const [currentCourses, setCurrentCourses] = useState([]);
  const [showCompletedCourses, setShowCompletedCourses] = useState(true);

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
  const completedCoursesMemo = useMemo(() => completedCourses, [completedCourses]);
  const currentCoursesMemo = useMemo(() => currentCourses, [currentCourses]);

  return (
    <View className="flex-1 p-4 bg-gray-100">
      <View className="flex-row justify-around mb-4">
        <TouchableOpacity
          className={`flex-row items-center p-3 rounded-lg w-40 ${!showCompletedCourses ? 'bg-blue-500' : 'bg-gray-500'}`}
          onPress={() => setShowCompletedCourses(false)}
        >
          <Ionicons name="school-outline" size={24} color="white" />
          <Text className="text-white ml-2 text-lg">Current Courses</Text>
        </TouchableOpacity>
        <TouchableOpacity
          className={`flex-row items-center p-3 rounded-lg w-40 ${showCompletedCourses ? 'bg-blue-500' : 'bg-gray-500'}`}
          onPress={() => setShowCompletedCourses(true)}
        >
          <Ionicons name="checkmark-done-outline" size={24} color="white" />
          <Text className="text-white ml-2 text-lg">Completed Courses</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#0000ff" className="flex-1 justify-center" />
      ) : error ? (
        <Text className="text-red-500 text-center text-lg">Error: {error}</Text>
      ) : !showCompletedCourses ? (
        <CourseTable coursesData={currentCoursesMemo} type="Current" />
      ) : (
        <CourseTable coursesData={completedCoursesMemo} type="Completed" />
      )}
    </View>
  );
};

export default ShowCourses;
