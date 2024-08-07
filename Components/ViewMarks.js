import React, { useState, useEffect } from 'react';
import { View, Text, Button, ActivityIndicator, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
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
    <View style={styles.container}>
      <Text style={styles.title}>Student's Marks</Text>
      {loading ? (
        <ActivityIndicator size="large" color="#0000ff" style={styles.loader} />
      ) : error ? (
        <Text style={styles.error}>Error: {error}</Text>
      ) : currentCourses.length > 0 ? (
        <FlatList
          data={currentCourses}
          keyExtractor={item => item.assignCourseId}
          renderItem={({ item }) => (
            <View style={styles.courseCard}>
              <Text style={styles.courseName}>{item.courseName}</Text>
              <View style={styles.detailsContainer}>
                <Text style={styles.detailText}>{item.instructorName}</Text>
                <Text style={styles.detailText}>{item.creditHours}</Text>
              </View>
              <Text style={styles.detailText}>{item.className}</Text>
              <TouchableOpacity onPress={() => handleViewMarks(item)} style={styles.button}>
                <Text style={styles.buttonText}>View Marks</Text>
              </TouchableOpacity>
            </View>
          )}
        />
      ) : (
        <Text style={styles.error}>No enrolled courses found.</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 12,
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  error: {
    color: 'red',
    textAlign: 'center',
    marginVertical: 15,
  },
  courseCard: {
    backgroundColor: '#007bff',
    borderRadius: 8,
    padding: 15,
    marginVertical: 5,
  },
  courseName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  detailsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  detailText: {
    color: '#fff',
  },
  button: {
    backgroundColor: '#0056b3',
    padding: 10,
    borderRadius: 8,
    marginTop: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default ViewMarks;
