import React, { useState, useEffect } from 'react';
import { View, Text, Button, ActivityIndicator, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
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
    <View style={styles.container}>
      <Text style={styles.header}>Available Courses</Text>

      {loading ? (
        <ActivityIndicator size="large" color="#003f72" />
      ) : error ? (
        <Text style={styles.error}>Error: {error}</Text>
      ) : (
        <FlatList
          data={filteredCourses}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.courseContainer}>
              <Text style={styles.courseName}>{item.courseName}</Text>
              <Text style={styles.className}>{item.className}</Text>
              <Text style={styles.instructorName}>{item.instructorName}</Text>
              {enrolledCourses.includes(item.id) ? (
                <Button title="Enrolled" color="gray" disabled />
              ) : (
                <TouchableOpacity
                  style={styles.enrollButton}
                  onPress={() => handleEnroll(item.id)}
                >
                  <Text style={styles.enrollButtonText}>Enroll</Text>
                </TouchableOpacity>
              )}
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
    padding: 10,
    backgroundColor: '#f0f0f0',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 10,
  },
  error: {
    color: 'red',
    textAlign: 'center',
    marginVertical: 20,
  },
  courseContainer: {
    marginVertical: 10,
    padding: 15,
    backgroundColor: 'white',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 3,
  },
  courseName: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  className: {
    fontSize: 16,
    color: '#007bff',
  },
  instructorName: {
    fontSize: 16,
    color: '#333',
  },
  enrollButton: {
    marginTop: 10,
    backgroundColor: '#003f72',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
  },
  enrollButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});

export default EnrolledCourses;
