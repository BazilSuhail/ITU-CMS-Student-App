import React, { useState, useEffect, useContext } from 'react';
import { View, Text, ActivityIndicator, FlatList } from 'react-native';
import { useRoute } from '@react-navigation/native';
import { auth, fs } from '../Config/Config';
import { ThemeContext } from '../Context/ThemeContext';

const StudentAttendanceDetails = () => {
  const route = useRoute();
  const { assignCourseId } = route.params;
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [totalDays, setTotalDays] = useState(0);
  const [daysPresent, setDaysPresent] = useState(0);
  const { darkMode } = useContext(ThemeContext);

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
    <View className={`flex-1 ${darkMode ? 'bg-gray-200' : 'bg-custom-blue'} p-4`}>
      {loading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#0000ff" />
        </View>
      ) : error ? (
        <Text className={`text-${darkMode ? 'red-400' : 'red-500'} p-3 border-2 ${darkMode ? 'border-red-400' : 'border-red-500'} rounded-lg text-center my-4`}>
          {error}
        </Text>
      ) : (
        <View>
          <View className="mb-4" />

          <View className={`mb-[15px] flex ${darkMode ? 'bg-white' : 'bg-blue-900'} p-3 rounded-2xl w-full`}>

            <View className={`pt-3 flex-row justify-between rounded-2xl w-full `}>
              <Text className={`bg-${darkMode ? 'gray-600' : 'blue-950'} rounded-lg text-md ${darkMode ? 'text-gray-200' : 'text-white'} py-[8px] w-[120px] text-center mb-[7px] font-bold`}>
                Attendance %
              </Text>
              <View className="flex-row space-x-2">
                <Text className={`text-sm bg-${darkMode ? 'gray-600' : 'blue-950'} rounded-lg ${darkMode ? 'text-gray-300' : 'text-blue-200'} w-[100px] text-center mt-[2px] pt-[5px] h-[30px] py-auto font-bold`}>
                  Days Present
                </Text>
                <Text className={`text-sm bg-${darkMode ? 'gray-600' : 'blue-950'} rounded-lg ${darkMode ? 'text-gray-300' : 'text-blue-200'} w-[100px] text-center mt-[2px] pt-[5px] h-[30px] py-auto font-bold`}>
                  Days Absent
                </Text>
              </View>
            </View>

            <View className={`flex-row justify-between rounded-2xl w-full ${darkMode ? 'bg-white' : 'bg-blue-900'}`}>
              <Text className={`text-2xl ${darkMode ? 'text-gray-700' : 'text-gray-300'} text-center w-[120px] font-bold`}>
                {attendancePercentage} %
              </Text>
              <View className="flex-row space-x-2">
                <Text className={`text-3xl text-center ${darkMode ? 'text-gray-700' : 'text-gray-300'} w-[100px] mb-[7px] font-bold`}>
                  {daysPresent}
                </Text>
                <Text className={`text-3xl text-center ${darkMode ? 'text-gray-700' : 'text-gray-300'} w-[100px] mb-[7px] font-bold`}>
                  {totalDays - daysPresent}
                </Text>
              </View>
            </View>

          </View>

          {attendanceRecords.length > 0 ? (
            <View>
              <View className={`flex-row ${darkMode ? 'bg-gray-700' : 'bg-blue-500'} py-2 rounded-t-lg`}>
                <Text className="flex-1 w-[170px] text-center text-white font-bold">Date</Text>
                <Text className="flex-1 text-center w-[90px] text-white font-bold">Status</Text>
              </View>

              <FlatList
                data={attendanceRecords}
                keyExtractor={(item) => item.date}
                renderItem={({ item }) => (
                  <View className={`flex-row py-2 ${darkMode ? 'bg-white' : 'bg-blue-950'} text-white`}>
                    <Text className={`text-center text-[16px] w-[170px] font-medium my-auto ${darkMode ? 'text-gray-700' : 'text-white'} px-2`}>{item.date}</Text>
                    <Text
                      className={`text-lg p-1 w-[100px] mx-auto rounded-lg font-semibold text-center ${item.records[currentUser.uid] ? (darkMode ? 'bg-green-700 text-white' : 'bg-green-800 text-white') : (darkMode ? 'bg-red-700 text-white' : 'bg-red-800 text-white')}`}
                    >
                      {item.records[currentUser.uid] ? 'Present' : 'Absent'}
                    </Text>
                  </View>
                )}
              />
            </View>
          ) : (
            <Text className={`text-${darkMode ? 'red-300' : 'red-500'} p-3 border-2 ${darkMode ? 'border-red-300' : 'border-red-200'} rounded-lg text-center my-4`}>
              No attendance records found.
            </Text>
          )}
        </View>
      )}
    </View>
  );
};

export default StudentAttendanceDetails;
