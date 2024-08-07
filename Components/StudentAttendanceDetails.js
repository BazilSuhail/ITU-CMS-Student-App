import React, { useState, useEffect } from 'react';
import { View, Text, ActivityIndicator, StyleSheet, FlatList } from 'react-native';
import { useRoute } from '@react-navigation/native';
import { auth, fs } from '../Config/Config';

const StudentAttendanceDetails = () => {
  const route = useRoute();
  const { assignCourseId } = route.params;
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [totalDays, setTotalDays] = useState(0);
  const [daysPresent, setDaysPresent] = useState(0);

  useEffect(() => {
    const fetchAttendanceData = async () => {
      setLoading(true);
      setError(null);

      try {
        const user = auth.currentUser;
        if (user) {
          setCurrentUser(user);

          if (assignCourseId) {
            const attendanceDocRef = fs.collection('attendances').doc(assignCourseId);
            const attendanceDoc = await attendanceDocRef.get();

            if (attendanceDoc.exists) {
              const attendanceData = attendanceDoc.data().attendances || [];
              setAttendanceRecords(attendanceData);

              let total = 0;
              let present = 0;

              attendanceData.forEach(record => {
                total++;
                if (record.records && record.records[user.uid] === true) {
                  present++;
                }
              });

              setTotalDays(total);
              setDaysPresent(present);
            } else {
              setError('No attendance records found');
            }
          } else {
            setError('No course ID provided');
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

    fetchAttendanceData();
  }, [assignCourseId]);

  const attendancePercentage = totalDays > 0 ? ((daysPresent / totalDays) * 100).toFixed(2) : 0;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Attendance Record</Text>
      {loading ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : error ? (
        <Text style={styles.error}>Error: {error}</Text>
      ) : (
        <View>
          <View style={styles.summary}>
            <Text style={styles.summaryText}>Total Days: {totalDays}</Text>
            <Text style={styles.summaryText}>Days Present: {daysPresent}</Text>
            <Text style={styles.summaryText}>Days Absent: {totalDays - daysPresent}</Text>
            <Text style={styles.summaryText}>Attendance %: {attendancePercentage}%</Text>
          </View>
          {attendanceRecords.length > 0 ? (
            <FlatList
              data={attendanceRecords}
              keyExtractor={(item) => item.date}
              renderItem={({ item }) => (
                <View style={styles.recordItem}>
                  <Text style={styles.recordDate}>{item.date}</Text>
                  <Text style={[styles.recordStatus, item.records[currentUser.uid] ? styles.present : styles.absent]}>
                    {item.records[currentUser.uid] ? 'Present' : 'Absent'}
                  </Text>
                </View>
              )}
            />
          ) : (
            <Text style={styles.error}>No attendance records found.</Text>
          )}
        </View>
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
  summary: {
    marginBottom: 16,
  },
  summaryText: {
    fontSize: 18,
    marginVertical: 4,
  },
  recordItem: {
    marginBottom: 16,
  },
  recordDate: {
    fontSize: 18,
  },
  recordStatus: {
    fontSize: 18,
    padding: 8,
    borderRadius: 8,
    textAlign: 'center',
  },
  present: {
    backgroundColor: 'green',
    color: 'white',
  },
  absent: {
    backgroundColor: 'red',
    color: 'white',
  },
});

export default StudentAttendanceDetails;
