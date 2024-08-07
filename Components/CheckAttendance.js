import React, { useState, useEffect } from 'react';
import { View, Text, Button, ActivityIndicator, StyleSheet, FlatList } from 'react-native';
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
    <View style={styles.container}>
      <Text style={styles.title}>Student's Attendance</Text>
      {loading ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : error ? (
        <Text style={styles.error}>Error: {error}</Text>
      ) : (
        <FlatList
          data={enrolledCourses}
          keyExtractor={(item) => item.assignCourseId}
          renderItem={({ item }) => (
            <View style={styles.courseItem}>
              <Text style={styles.courseName}>{item.courseName}</Text>
              <Text style={styles.className}>{item.className}</Text>
              <Text style={styles.instructorName}>{item.instructorName}</Text>
              <Button
                title="View Attendance"
                onPress={() => handleViewAttendance(item.assignCourseId)}
              />
            </View>
          )}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 16,
  },
  error: {
    color: 'red',
    textAlign: 'center',
    marginVertical: 16,
  },
  courseItem: {
    marginBottom: 16,
  },
  courseName: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  className: {
    fontSize: 16,
  },
  instructorName: {
    fontSize: 16,
    marginBottom: 8,
  },
});

export default CheckAttendance;
