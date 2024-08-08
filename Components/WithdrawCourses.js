import React, { useState, useEffect } from 'react';
import { View, Text, Button, FlatList, ActivityIndicator, Alert, StyleSheet } from 'react-native';
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

    const renderCourseItem = ({ item }) => (
        <View style={styles.courseItem}>
            <Text style={styles.courseName}>{item.courseName}</Text>
            <Text style={styles.instructorName}>{item.instructorName}</Text>
            <Text style={styles.className}>{item.className}</Text>
            <Button
                title="Withdraw Course"
                onPress={() => handleWithdraw(item.assignCourseId)}
                color="#007bff"
            />
        </View>
    );

    if (loading) {
        return (
            <View style={styles.container}>
                <ActivityIndicator size="large" color="#007bff" />
            </View>
        );
    }

    return (
        <View className="flex-1 bg-custom-blue p-4">

            <Text className="text-2xl text-white font-bold">Marks</Text>
            <View className="h-[2px] mt-[10px] w-[100%] mx-auto bg-gray-500 mb-[18px] rounded-xl"></View>


            <Text style={styles.subtitle}>Courses Enrolled</Text>
            {currentCoursesData.length > 0 ? (
                <FlatList
                    data={currentCoursesData}
                    renderItem={renderCourseItem}
                    keyExtractor={item => item.assignCourseId}
                />
            ) : (
                <Text style={styles.message}>No current courses found.</Text>
            )}

            <Text style={styles.subtitle}>Courses Applied For Withdraw</Text>
            {withdrawCoursesData.length > 0 ? (
                <FlatList
                    data={withdrawCoursesData}
                    renderItem={({ item }) => (
                        <View style={styles.courseItem}>
                            <Text style={styles.courseName}>{item.courseName}</Text>
                            <Text style={styles.instructorName}>{item.instructorName}</Text>
                            <Text style={styles.className}>{item.className}</Text>
                        </View>
                    )}
                    keyExtractor={item => item.assignCourseId}
                />
            ) : (
                <Text style={styles.message}>No courses applied for withdraw.</Text>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
        backgroundColor: '#f5f5f5',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#007bff',
        marginBottom: 16,
    },
    subtitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#007bff',
        marginVertical: 8,
    },
    courseItem: {
        backgroundColor: '#fff',
        padding: 16,
        borderRadius: 8,
        marginBottom: 8,
        elevation: 1,
    },
    courseName: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    instructorName: {
        fontSize: 14,
        color: '#666',
    },
    className: {
        fontSize: 14,
        color: '#666',
    },
    message: {
        fontSize: 16,
        color: '#ff0000',
        textAlign: 'center',
        marginTop: 16,
    },
});

export default WithdrawCourses;
