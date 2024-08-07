import React, { useState, useEffect } from 'react';
import { View, Text, ActivityIndicator,Image, ScrollView } from 'react-native';
import { auth, fs } from '../Config/Config'; // Adjust the path as needed

const StudentProfile = () => {
    const [userData, setUserData] = useState(null);
    const [className, setClassName] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchUserData = async () => {
            setLoading(true);
            setError(null);

            try {
                const currentUser = auth.currentUser;

                if (currentUser) {
                    const docRef = await fs.collection('students').doc(currentUser.uid).get();

                    if (docRef.exists) {
                        const userData = docRef.data();
                        setUserData(userData);

                        if (userData.classId) {
                            const classDoc = await fs.collection('classes').doc(userData.classId).get();
                            if (classDoc.exists) {
                                setClassName(classDoc.data().name);
                            } else {
                                setClassName('Unknown Class');
                            }
                        } else {
                            setClassName('No Class ID');
                        }
                    } else {
                        setError('No user data found');
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

        fetchUserData();
    }, []);

    if (loading) {
        return (
            <View className="flex-1 justify-center items-center bg-blue-950">
                <ActivityIndicator size="large" color="#003F92" />
            </View>
        );
    }

    if (error) {
        return (
            <View className="flex-1 justify-center items-center bg-blue-950">
                <Text className="text-red-500 p-4 border-2 border-red-500 rounded-lg">
                    Error: {error}
                </Text>
            </View>
        );
    }

    if (!userData) {
        return (
            <View className="flex-1 justify-center items-center bg-blue-950">
                <Text className="text-white">No user data available</Text>
            </View>
        );
    }

    return (
        <ScrollView className="flex-1 bg-blue-950 p-4">
            <Text className="text-2xl font-bold text-center text-blue-300 mb-2">
                Student Profile
            </Text>
            <View className="w-full h-0.5 bg-blue-300 mb-4 self-center" />
            <Image
className="my-[15px]"
                source={{ uri: userData.profileUrl }}
                style={{ width: 130, height: 130, borderRadius: 100, marginRight: 10 }}
            />
            <View className="p-[4px] mb-5">
                <Text className="bg-blue-800 text-white p-2 text-lg font-bold rounded-lg">
                    Academic Information:
                </Text>
                <View className="flex flex-wrap  mt-2">
                    <View className="bg-blue-800 w-[100%] p-4 rounded-lg mb-2 flex-1">
                        <Text className="text-white mb-1">Roll Number:</Text>
                        <Text className="text-2xl text-white">{userData.rollNumber}</Text>
                    </View>
                    <View className="bg-blue-800 p-4 rounded-lg mb-2 flex-1">
                        <Text className="text-white mb-1">Email:</Text>
                        <Text className="text-2xl text-white">{userData.email}</Text>
                    </View>
                    <View className="bg-blue-800 p-4 rounded-lg mb-2 flex-1">
                        <Text className="text-white mb-1">Batch:</Text>
                        <Text className="text-2xl text-white">{userData.batch}</Text>
                    </View>
                    <View className="bg-blue-800 p-4 rounded-lg mb-2 flex-1">
                        <Text className="text-white mb-1">Semester:</Text>
                        <Text className="text-2xl text-white">{userData.semester}</Text>
                    </View>
                    <View className="bg-blue-800 p-4 rounded-lg mb-2 flex-1">
                        <Text className="text-white mb-1">Degree Program:</Text>
                        <Text className="text-xl text-white">{userData.degreeProgram}</Text>
                    </View>
                    <View className="bg-blue-800 p-4 rounded-lg mb-2 flex-1">
                        <Text className="text-white mb-1">Class:</Text>
                        <Text className="text-2xl text-white">{className}</Text>
                    </View>
                </View>

                <Text className="bg-blue-800 text-white p-2 text-lg font-bold rounded-lg">
                    Personal Information:
                </Text>
                <View className="flex flex-wrap mt-2">
                    <View className="bg-gray-800 p-4 rounded-lg mb-2 flex-1">
                        <Text className="text-white mb-1">Name:</Text>
                        <Text className="text-2xl text-white">{userData.name}</Text>
                    </View>
                    <View className="bg-gray-800 p-4 rounded-lg mb-2 flex-1">
                        <Text className="text-white mb-1">Father's Name:</Text>
                        <Text className="text-2xl text-white">{userData.fatherName}</Text>
                    </View>
                    <View className="bg-gray-800 p-4 rounded-lg mb-2 flex-1">
                        <Text className="text-white mb-1">Gender:</Text>
                        <Text className="text-2xl text-white">{userData.gender}</Text>
                    </View>
                    <View className="bg-gray-800 p-4 rounded-lg mb-2 flex-1">
                        <Text className="text-white mb-1">City:</Text>
                        <Text className="text-2xl text-white">{userData.city}</Text>
                    </View>
                    <View className="bg-gray-800 p-4 rounded-lg mb-2 flex-1">
                        <Text className="text-white mb-1">Country:</Text>
                        <Text className="text-2xl text-white">{userData.country}</Text>
                    </View>
                    <View className="bg-gray-800 p-4 rounded-lg mb-2 flex-1">
                        <Text className="text-white mb-1">Nationality:</Text>
                        <Text className="text-2xl text-white">{userData.nationality}</Text>
                    </View>
                </View>

                <View className="bg-blue-800 p-2 rounded-lg mb-2 flex-row items-center">
                    <Text className="text-white text-sm">Current Address:</Text>
                    <Text className="text-white text-lg ml-2">{userData.currentAddress}</Text>
                </View>
                <View className="bg-blue-800 p-2 rounded-lg mb-2 flex-row items-center">
                    <Text className="text-white text-sm">Permanent Address:</Text>
                    <Text className="text-white text-lg ml-2">{userData.permanentAddress}</Text>
                </View>
            </View>
        </ScrollView>
    );
};

export default StudentProfile;
