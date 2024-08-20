import React, { useState, useEffect, useContext } from 'react';
import { View, Text, Button, ActivityIndicator, FlatList, TouchableOpacity, ScrollView } from 'react-native';
import { auth, fs } from '../Config/Config'; // Ensure to configure Firebase properly
import { ThemeContext } from '../Context/ThemeContext';
const EnrolledCourses = () => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [courses, setCourses] = useState([]);
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [completedCourses, setCompletedCourses] = useState([]);
  const { darkMode } = useContext(ThemeContext);

  useEffect(() => {
    const fetchCourses = async () => {
      setLoading(true);
      setError(null);

      try {
        // Get the current logged-in user
        const user = auth.currentUser;
        if (user) {
          setCurrentUser(user);

          // Fetch student data to get enrolled and completed courses
          const studentDoc = await fs.collection('students').doc(user.uid).get();
          if (studentDoc.exists) {
            const studentData = studentDoc.data();
            setEnrolledCourses(studentData.enrolledCourses || []);
            const completedCoursesIds = studentData.completedCourses || [];

            // Fetch completed courses names
            const completedCoursesNames = await Promise.all(
              completedCoursesIds.map(async (courseId) => {
                const courseDoc = await fs.collection('courses').doc(courseId).get();
                return courseDoc.exists ? courseDoc.data().name : 'Unknown Course';
              })
            );

            setCompletedCourses(completedCoursesNames);
          }

          // Fetch assignCourses data
          const assignCoursesSnapshot = await fs.collection('assignCourses').get();
          const coursesData = await Promise.all(assignCoursesSnapshot.docs.map(async (doc) => {
            const data = doc.data();
            const courseDoc = await fs.collection('courses').doc(data.courseId).get();
            const instructorDoc = await fs.collection('instructors').doc(data.instructorId).get();
            const classDoc = await fs.collection('classes').doc(data.classId).get();
            return {
              id: doc.id,
              courseName: courseDoc.data().name,
              instructorName: instructorDoc.data().name,
              className: classDoc.data().name,
            };
          }));

          setCourses(coursesData);
        } else {
          setError('No user logged in');
        }
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  const handleEnroll = async (courseId) => {
    try {
      if (!currentUser) {
        setError('No user logged in');
        return;
      }

      // Update the student's enrolled courses in Firestore
      const studentDocRef = fs.collection('students').doc(currentUser.uid);
      await studentDocRef.update({
        enrolledCourses: [...enrolledCourses, courseId],
      });

      // Update the local state
      setEnrolledCourses((prev) => [...prev, courseId]);
    } catch (error) {
      setError(error.message);
    }
  };

  // Filter out the courses that are in the completed courses list
  const filteredCourses = courses.filter(course => !completedCourses.includes(course.courseName));

  return (
    <View className={`flex-1 p-4 ${darkMode ? 'bg-gray-200' : 'bg-custom-blue'}`}>
      <View className={`flex-row justify-between items-center mt-4`}>
        <Text className={`text-2xl font-bold ${darkMode ? 'text-gray-700' : 'text-white'}`}>Available Courses</Text>
        <Text className={`text-[22px] font-bold px-[15px] py-[-4px] rounded-lg ${darkMode ? 'bg-white' : 'bg-blue-800'} ${darkMode ? 'text-gray-700' : 'text-white'}`}>{filteredCourses.length}</Text>
      </View>
      <View className={`h-[2px] mt-[10px] w-[100%] mx-auto  ${darkMode ? 'bg-gray-700' : 'bg-gray-500'} mb-[18px] rounded-xl`}></View>

      {loading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#0000ff" />
        </View>
      ) : error ? (
        <Text className="text-red-500 text-center mb-4">Error: {error}</Text>
      ) : (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mx-[7px] mt-[18px]">
          <View>
            {/* Header Row */}
            <View className={`flex-row ${darkMode ? 'bg-gray-700' : 'bg-blue-500'} py-2 rounded-t-lg`}>
              <Text className={`flex-1 w-[170px] text-center font-bold ${darkMode ? 'text-gray-300' : 'text-white'}`}>Course Name</Text>
              <Text className={`flex-1 w-[90px] text-center font-bold ${darkMode ? 'text-gray-300' : 'text-white'}`}>Class_id</Text>
              <Text className={`flex-1 w-[150px] text-center font-bold ${darkMode ? 'text-gray-300' : 'text-white'}`}>Instructor Name</Text>
              <Text className={`flex-1 w-[130px] text-center font-bold ${darkMode ? 'text-gray-300' : 'text-white'}`}>Action</Text>
            </View>

            {/* Course Details */}
            <View>
              {filteredCourses.map((item) => (
                <View key={item.id} className={`flex-row border-b ${darkMode ? 'bg-white border-gray-700' : 'bg-blue-950 border-gray-600'} py-2 px-4`}>
                  <Text className={`w-[150px] font-bold my-auto ${darkMode ? 'text-gray-700' : 'text-white'}  px-2`}>{item.courseName}</Text>
                  <Text className={`text-center w-[80px] mx-[15px] pt-[3px] font-bold my-auto h-[26px] ${darkMode ? 'bg-gray-200 text-gray-800' : 'bg-blue-100 text-blue-950'} rounded-lg`}>{item.className}</Text>
                  <Text className={`text-center w-[140px] font-semibold my-auto ${darkMode ? 'text-gray-700' : 'text-white'} px-2`}>{item.instructorName}</Text>
                  <View className="text-center w-[120px] font-medium my-auto px-2">
                    {enrolledCourses.includes(item.id) ? (
                      <TouchableOpacity className={`p-2 rounded-md ${darkMode ? 'bg-gray-300' : 'bg-gray-200'}`}>
                        <Text className={`font-bold text-center ${darkMode ? 'text-gray-400' : 'text-gray-400'}`}>Applied</Text>
                      </TouchableOpacity>
                    ) : (
                      <TouchableOpacity onPress={() => handleEnroll(item.id)}
                        className={`p-2 rounded-lg ${darkMode ? 'bg-blue-800' : 'bg-blue-700'}`}
                      >
                        <Text className={`font-bold text-center ${darkMode ? 'text-gray-200' : 'text-white'}`}>Enroll</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              ))}
            </View>
          </View>
        </ScrollView>
      )}
    </View>
  );
};

export default EnrolledCourses;