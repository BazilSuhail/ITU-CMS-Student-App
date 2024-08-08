import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, FlatList } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { auth, fs } from '../Config/Config';

const CheckAttendance = () => {
  const navigation = useNavigation();
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [enrolledCourses, setEnrolledCourses] = useState([]);

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
    <View className="flex-1 bg-custom-blue p-4"> 
      
      <Text className="text-2xl text-white font-bold">Attendance Details</Text>
      <View className="h-[2px] mt-[10px] w-[100%] mx-auto bg-gray-500 mb-[18px] rounded-xl"></View>

      {loading ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : error ? (
        <Text className="text-red-500 text-center my-4">
          Error: {error}
        </Text>
      ) : (
        <FlatList
        data={enrolledCourses}
        keyExtractor={item => item.assignCourseId}
        renderItem={({ item }) => (
          <View className="bg-blue-900 p-4 rounded-lg mb-3">
            <Text className="text-lg font-bold text-white">{item.courseName}</Text>

            <View className="flex-row justify-between items-center mt-2">
              <Text className="text-gray-400 text-[16px]  underline ">{item.instructorName}</Text>
              <View className="flex-row">
                <Text className="text-white "> Credit.Hrs: </Text>
                <Text className="font-extrabold bg-white px-[6px] ml-[4px] text-blue-950 rounded-md ">{item.courseHours}</Text>
              </View>
            </View>

            <Text className="text-gray-200 fomt-bold mt-[12px] ">{item.className}</Text>
            <TouchableOpacity
              onPress={() => handleViewAttendance(item.assignCourseId)}
              className="bg-blue-950 p-2 rounded-lg mt-3"
            >
              <Text className="text-white font-bold text-center">View Attendance</Text>
            </TouchableOpacity>
          </View>
        )}
      />
      )}
    </View>
  );
};

export default CheckAttendance;
