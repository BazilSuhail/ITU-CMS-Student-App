import React, { useState, useEffect } from 'react';
import { View, Text, ActivityIndicator, FlatList, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { auth, fs } from '../Config/Config';

const ViewMarks = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentCourses, setCurrentCourses] = useState([]);
  const navigation = useNavigation();

  useEffect(() => {
    const fetchEnrolledCourses = async () => {
      setLoading(true);
      setError(null);

      try {
        const currentUser = auth.currentUser;

        if (currentUser) {
          const studentDoc = await fs.collection('students').doc(currentUser.uid).get();
          if (studentDoc.exists) {
            const studentData = studentDoc.data();
            const enrolledCoursesIds = studentData.currentCourses || [];

            const assignCoursesData = await Promise.all(enrolledCoursesIds.map(async courseId => {
              const assignCourseDoc = await fs.collection('assignCourses').doc(courseId).get();
              if (assignCourseDoc.exists) {
                const assignCourseData = assignCourseDoc.data();
                const { courseId: actualCourseId, instructorId, classId } = assignCourseData;

                const courseDoc = await fs.collection('courses').doc(actualCourseId).get();
                const instructorDoc = await fs.collection('instructors').doc(instructorId).get();
                const classDoc = await fs.collection('classes').doc(classId).get();
                const courseData = courseDoc.exists ? courseDoc.data() : {};
                const instructorData = instructorDoc.exists ? instructorDoc.data() : {};
                const classData = classDoc.exists ? classDoc.data() : {};

                return {
                  assignCourseId: courseId,
                  courseId: actualCourseId,
                  courseName: courseData.name || 'Unknown Course',
                  creditHours: courseData.creditHours || 'Unknown',
                  instructorName: instructorData.name || 'Unknown Instructor',
                  className: classData.name || 'Unknown Class',
                };
              } else {
                return {
                  assignCourseId: courseId,
                  courseId: courseId,
                  courseName: 'Unknown Course',
                  creditHours: 'Unknown',
                  instructorName: 'Unknown Instructor',
                  className: 'Unknown Class',
                };
              }
            }));

            setCurrentCourses(assignCoursesData);
          } else {
            setError('Student data not found');
          }
        } else {
          setError('No authenticated user found');
        }
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchEnrolledCourses();
  }, []);

  const handleViewMarks = (course) => {
    let selectedCourseMarks = null;
    let errorMessage = null;

    const fetchMarks = async () => {
      try {
        const marksDoc = await fs.collection('studentsMarks').doc(course.assignCourseId).get();
        if (marksDoc.exists) {
          const marksData = marksDoc.data();

          const studentMarks = marksData.marksOfStudents.find(student => student.studentId === auth.currentUser.uid);

          if (studentMarks) {
            selectedCourseMarks = {
              criteriaDefined: marksData.criteriaDefined || [],
              studentMarks: studentMarks.marks || {},
              grade: studentMarks.grade || 'I',
            };
          } else {
            errorMessage = `No records for ${course.courseName} found.`;
          }
        } else {
          errorMessage = `No records for ${course.courseName} found.`;
        }
      } catch (error) {
        errorMessage = error.message;
      }

      navigation.navigate('MarksOfSubject', {
        selectedCourseMarks,
        courseName: course.courseName,
        errorMessage,
      });
    };

    fetchMarks();
  };

  return (
    <View className="flex-1 bg-custom-blue p-4">

      <Text className="text-2xl text-white font-bold">Marks</Text>
      <View className="h-[2px] mt-[10px] w-[100%] mx-auto bg-gray-500 mb-[18px] rounded-xl"></View>

      {loading ? (
        <ActivityIndicator size="large" color="#0000ff" className="flex-1 justify-center items-center" />
      ) : error ? (
        <Text className="text-red-500 text-center my-4">{`Error: ${error}`}</Text>
      ) : currentCourses.length > 0 ? (
        <FlatList
          data={currentCourses}
          keyExtractor={item => item.assignCourseId}
          renderItem={({ item }) => (
            <View className="bg-blue-950 p-4 rounded-lg mb-3">
              <Text className="text-lg font-bold text-white">{item.courseName}</Text>

              <View className="flex-row justify-between items-center mt-2">
                <Text className="text-gray-500 text-[16px]  underline ">{item.instructorName}</Text>
                <View className="flex-row">
                  <Text className="text-white "> Credit.Hrs: </Text>
                  <Text className="font-extrabold bg-white px-[6px] ml-[4px] text-blue-950 rounded-md ">{item.creditHours}</Text>
                </View>
              </View>

              <Text className="text-gray-400 fomt-bold mt-[12px] ">{item.className}</Text>
              <TouchableOpacity
                onPress={() => handleViewMarks(item)}
                className="bg-blue-700 p-2 rounded-lg mt-3"
              >
                <Text className="text-white font-bold text-center">View Marks</Text>
              </TouchableOpacity>
            </View>
          )}
        />
      ) : (
        <Text className="text-red-500 text-center my-4">No enrolled courses found.</Text>
      )}
    </View>
  );
};

export default ViewMarks;
