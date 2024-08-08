import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { auth, fs, FieldValue } from '../Config/Config';

const WithdrawCourses = () => {
    const [loading, setLoading] = useState(true);
    const [currentCoursesData, setCurrentCoursesData] = useState([]);
    const [withdrawCoursesData, setWithdrawCoursesData] = useState([]);

    useEffect(() => {
        const fetchCourses = async () => {
            setLoading(true);

            try {
                const currentUser = auth.currentUser;

                if (currentUser) {
                    const studentDoc = await fs.collection('students').doc(currentUser.uid).get();
                    if (studentDoc.exists) {
                        const studentData = studentDoc.data();
                        const enrolledCourseIds = studentData.currentCourses || [];
                        const appliedWithdrawCourseIds = studentData.withdrawCourses || [];

                        const courseDataPromises = enrolledCourseIds
                            .filter(courseId => !appliedWithdrawCourseIds.includes(courseId))
                            .map(async (courseId) => {
                                const assignCourseDoc = await fs.collection('assignCourses').doc(courseId).get();
                                if (assignCourseDoc.exists) {
                                    const assignCourseData = assignCourseDoc.data();
                                    const { instructorId, courseId: actualCourseId, classId } = assignCourseData;

                                    const courseDoc = await fs.collection('courses').doc(actualCourseId).get();
                                    const instructorDoc = await fs.collection('instructors').doc(instructorId).get();
                                    const classDoc = await fs.collection('classes').doc(classId).get();

                                    return {
                                        assignCourseId: courseId,
                                        courseName: courseDoc.exists ? courseDoc.data().name : 'Unknown Course',
                                        courseHours: courseDoc.exists ? courseDoc.data().creditHours : 'Unknown',
                                        instructorName: instructorDoc.exists ? instructorDoc.data().name : 'Unknown Instructor',
                                        className: classDoc.exists ? classDoc.data().name : 'Unknown Class',
                                    };
                                }
                                return null;
                            });

                        const withdrawCourseDataPromises = appliedWithdrawCourseIds.map(async (courseId) => {
                            const assignCourseDoc = await fs.collection('assignCourses').doc(courseId).get();
                            if (assignCourseDoc.exists) {
                                const assignCourseData = assignCourseDoc.data();
                                const { instructorId, courseId: actualCourseId, classId } = assignCourseData;

                                const courseDoc = await fs.collection('courses').doc(actualCourseId).get();
                                const instructorDoc = await fs.collection('instructors').doc(instructorId).get();
                                const classDoc = await fs.collection('classes').doc(classId).get();

                                return {
                                    assignCourseId: courseId,
                                    courseName: courseDoc.exists ? courseDoc.data().name : 'Unknown Course',
                                    courseHours: courseDoc.exists ? courseDoc.data().creditHours : 'Unknown',
                                    instructorName: instructorDoc.exists ? instructorDoc.data().name : 'Unknown Instructor',
                                    className: classDoc.exists ? classDoc.data().name : 'Unknown Class',
                                };
                            }
                            return null;
                        });

                        const currentCourses = await Promise.all(courseDataPromises);
                        const withdrawCourses = await Promise.all(withdrawCourseDataPromises);

                        setCurrentCoursesData(currentCourses.filter(course => course !== null));
                        setWithdrawCoursesData(withdrawCourses.filter(course => course !== null));
                    } else {
                        Alert.alert('Error', 'Student data not found');
                    }
                } else {
                    Alert.alert('Error', 'No authenticated user found');
                }
            } catch (error) {
                Alert.alert('Error', error.message);
            } finally {
                setLoading(false);
            }
        };

        fetchCourses();
    }, []);

    const handleWithdraw = async (assignCourseId) => {
        try {
            const currentUser = auth.currentUser;
            if (!currentUser) {
                Alert.alert('Error', 'No authenticated user found');
                return;
            }

            const studentDocRef = fs.collection('students').doc(currentUser.uid);
            await studentDocRef.update({
                withdrawCourses: FieldValue.arrayUnion(assignCourseId),
            });

            setWithdrawCoursesData(prevWithdrawCourses => {
                return [...prevWithdrawCourses, currentCoursesData.find(course => course.assignCourseId === assignCourseId)];
            });
            setCurrentCoursesData(prevCurrentCourses => {
                return prevCurrentCourses.filter(course => course.assignCourseId !== assignCourseId);
            });
        } catch (error) {
            Alert.alert('Error', error.message);
        }
    };

    const renderCourseItem = (item) => (
        <View key={item.assignCourseId} className="bg-blue-900 p-4 rounded-lg mb-3">
            <Text className="text-lg font-bold text-white">{item.courseName}</Text>

            <View className="flex-row justify-between items-center mt-2">
                <Text className="text-gray-400 text-[16px] underline">{item.instructorName}</Text>
                <View className="flex-row">
                    <Text className="text-white">Credit.Hrs:</Text>
                    <Text className="font-extrabold bg-white px-[6px] ml-[4px] text-blue-950 rounded-md">{item.courseHours}</Text>
                </View>
            </View>

            <Text className="text-gray-200 font-bold mt-[12px]">{item.className}</Text>

            <TouchableOpacity onPress={() => handleWithdraw(item.assignCourseId)} className="bg-blue-950 py-3 rounded-lg mt-3">
                <Text className="text-white font-bold text-center">Withdraw Course</Text>
            </TouchableOpacity>
        </View>
    );

    if (loading) {
        return (
            <View className="flex justify-center items-center h-screen  bg-custom-blue p-4">
                <ActivityIndicator size="large" color="#007bff" />
            </View>
        );
    }

    return (
        <ScrollView className="flex bg-custom-blue p-4">
            <Text className="text-2xl text-white font-bold">Marks</Text>
            <View className="h-[2px] mt-[10px] w-[100%] mx-auto bg-gray-500 mb-[18px] rounded-xl"></View>

            <Text className="text-xl font-bold text-white my-4">Courses Enrolled</Text>
            {currentCoursesData.length > 0 ? (
                currentCoursesData.map(course => renderCourseItem(course))
            ) : (
                <Text className="text-red-300 p-3 border-2 border-red-200 rounded-lg text-center my-4">No current courses found.</Text>
            )}

            <View className="mb-[35px]">
                <Text className="text-xl font-bold text-white my-4">Courses Applied For Withdraw</Text>
                {withdrawCoursesData.length > 0 ? (
                    withdrawCoursesData.map(course => (
                        <View key={course.assignCourseId} className="bg-blue-950 p-4 rounded-lg mb-3">
                            <Text className="text-lg font-bold text-white">{course.courseName}</Text>

                            <View className="flex-row justify-between items-center mt-2">
                                <Text className="text-gray-400 text-[16px] underline">{course.instructorName}</Text>
                                <View className="flex-row">
                                    <Text className="text-white">Credit.Hrs:</Text>
                                    <Text className="font-extrabold bg-white px-[6px] ml-[4px] text-blue-950 rounded-md">{course.courseHours}</Text>
                                </View>
                            </View>

                            <Text className="text-gray-200 font-bold mt-[12px]">{course.className}</Text>
                        </View>
                    ))
                ) : (
                    <Text className="text-red-300 p-3 border-2 border-red-200 rounded-lg text-center my-4">No courses applied for withdraw.</Text>
                )}
            </View>
        </ScrollView>
    );
};

export default WithdrawCourses;
