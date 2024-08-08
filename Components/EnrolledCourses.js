import React, { useState, useEffect } from 'react';
import { View, Text, Button, ActivityIndicator, FlatList, TouchableOpacity, ScrollView } from 'react-native';
import { auth, fs } from '../Config/Config'; // Ensure to configure Firebase properly

const EnrolledCourses = () => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [courses, setCourses] = useState([]);
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [completedCourses, setCompletedCourses] = useState([]);

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
    <View className="flex-1 p-4 bg-custom-blue ">

      <Text className="text-2xl text-white font-bold">Available Courses</Text>
      <View className="h-[2px] mt-[10px] w-[100%] mx-auto bg-gray-500 mb-[18px] rounded-xl"></View>

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
            <View className="flex-row bg-blue-500 py-2 rounded-t-lg">
              <Text className="flex-1 w-[170px] text-center text-white font-bold">Course Name</Text>
              <Text className="flex-1 text-center w-[90px] text-white font-bold">Class_id</Text>
              <Text className="flex-1 text-center w-[150px] text-white font-bold">Instructor Name</Text>
              <Text className="flex-1 text-center w-[130px] text-white font-bold">Action</Text>
            </View>

            {/* Course Details */}
            <View>
              {filteredCourses.map((item) => (
                <View key={item.id} className="flex-row border-b bg-blue-950 border-gray-600 py-2 px-4">
                  <Text className="text-center w-[150px] font-bold my-auto text-white px-2">{item.courseName}</Text>
                  <Text className="text-center w-[80px] mx-[15px] font-bold my-auto h-[22px] bg-blue-100 rounded-lg text-blue-950">{item.className}</Text>
                  <Text className="text-center w-[140px] font-semibold my-auto text-white px-2">{item.instructorName}</Text>
                  <View className="text-center w-[120px] font-medium my-auto text-white px-2">
                    {enrolledCourses.includes(item.id) ? (
                      <TouchableOpacity className="bg-gray-200 p-2 rounded-md" >
                        <Text className="text-gray-400 font-bold text-center">Applied</Text>
                      </TouchableOpacity>
                    ) : (
                      <TouchableOpacity onPress={() => handleEnroll(item.id)}
                        className="bg-blue-700 p-2 rounded-lg"
                      >
                        <Text className="text-white font-bold text-center">Enroll</Text>
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