import React, { useState, useEffect, useContext } from 'react';
import { View, Text, ActivityIndicator, Image, ScrollView } from 'react-native';
import { auth, fs } from '../Config/Config';

import { ThemeContext } from '../Context/ThemeContext';

const StudentProfile = () => {
    const [userData, setUserData] = useState(null);
    const [className, setClassName] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { darkMode } = useContext(ThemeContext);
    
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
            <View className={`flex justify-center items-center h-screen ${darkMode ? 'bg-gray-200' : 'bg-custom-blue'} p-4`}>
                <ActivityIndicator size="large" color="#007bff" />
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
            <View className={`flex-1 justify-center items-center ${darkMode ? 'bg-gray-200' : 'bg-custom-blue'}`}>
                <Text className="text-white px-3 text-mf border-red-500 rounded-lg  py-3">No user data available</Text>
            </View>
        );
    }

    return (
        <ScrollView className={`flex-1 ${darkMode ? 'bg-gray-200' : 'bg-custom-blue'} px-2 py-4`}>

            <View className="flex justify-center pl-[5px]">
                <Image
                    source={{ uri: userData.profileUrl }}
                    className="w-[160px] h-[160px] rounded-full"
                />
                <View className="">
                    <Text className={`${darkMode ? 'text-custom-blue' : 'text-white'} text-4xl font-bold mt-4`}>{userData.name}</Text>
                    <Text className={`${darkMode ? 'text-blue-950' : 'text-gray-200'} underline ml-[5px] pt-[5px] font-medium text-sm`}>{userData.email}</Text>
                </View>
            </View>

            <View className="h-[2px] mt-[25px] w-[90%] mx-auto bg-gray-500 mb-[25px] rounded-xl"></View>

            <View className="py-[4px] mb-5">
                <Text className={`underline ${!darkMode ? 'text-gray-200' : 'text-blue-950'} py-2 ml-[5px] text-xl font-bold rounded-lg`}>
                    Academic Information:
                </Text>
                <View className="flex flex-wrap  mt-2">

                    <View className="w-[100%] mb-[15px] flex flex-row justify-center space-x-2">
                        <View className={` ${darkMode ? ' bg-white' : 'bg-blue-950'} p-3 rounded-2xl w-[48%]`}>
                            <Text className={`text-sm ${darkMode ? ' text-gray-500' : 'text-gray-400'} mb-[7px] font-bold`}>Rollnumber:</Text>
                            <Text className={` ${darkMode ? 'text-gray-700' : 'text-blue-100'} font-semibold text-xl `}>{userData.rollNumber}</Text>
                        </View>
                        <View className={` ${darkMode ? ' bg-white' : 'bg-blue-950'} p-3 rounded-2xl w-[48%]`}>
                            <Text className={`text-sm ${darkMode ? ' text-gray-500' : 'text-gray-400'} mb-[7px] font-bold`}>Batch:</Text>
                            <Text className={` ${darkMode ? 'text-gray-500' : 'text-blue-100'} font-semibold text-xl `}>{userData.batch}</Text>
                        </View>
                    </View>

                    <View className="w-[100%] mb-[15px] flex flex-row justify-center space-x-2">
                        <View className={` ${darkMode ? ' bg-white' : 'bg-blue-950'} p-3 rounded-2xl w-[48%]`}>
                            <Text className={`text-sm ${darkMode ? ' text-gray-500' : 'text-gray-400'} mb-[7px] font-bold`}>Semester:</Text>
                            <Text className={` ${darkMode ? 'text-gray-500' : 'text-blue-100'} font-semibold text-xl `}>{userData.semester}</Text>
                        </View>
                        <View className={` ${darkMode ? ' bg-white' : 'bg-blue-950'} p-3 rounded-2xl w-[48%]`}>
                            <Text className={`text-sm ${darkMode ? ' text-gray-500' : 'text-gray-400'} mb-[7px] font-bold`}>Class:</Text>
                            <Text className={` ${darkMode ? 'text-gray-500' : 'text-blue-100'} font-semibold text-xl `}>{className}</Text>
                        </View>
                    </View>

                    <View className="w-[100%] mb-[15px] flex flex-row justify-center space-x-2">
                        <View className={` ${darkMode ? ' bg-white' : 'bg-blue-950'} p-3 rounded-2xl w-full`}>
                            <Text className={`text-sm ${darkMode ? ' text-gray-500' : 'text-gray-400'} mb-[7px] font-bold`}>Degree Program:</Text>
                            <Text className={` ${darkMode ? 'text-gray-500' : 'text-blue-100'} font-semibold text-xl `}>{userData.degreeProgram}</Text>
                        </View>
                    </View>
                </View>


                <View className="h-[2px] mt-[25px] w-[90%] mx-auto bg-gray-500 mb-[25px] rounded-xl"></View>

                <Text className={`underline ${!darkMode ? 'text-gray-200' : 'text-blue-950'} py-2 ml-[5px] text-xl font-bold rounded-lg`}>
                    Personal Information:
                </Text>

                <View className="flex flex-wrap mt-2">
                     
                    <View className="w-[100%] mb-[15px] flex flex-row justify-center space-x-2">
                        <View className={` ${darkMode ? ' bg-white' : 'bg-blue-950'} p-3 rounded-2xl w-[48%]`}>
                            <Text  className={`text-sm ${darkMode ? ' text-gray-500' : 'text-gray-300'} mb-[7px] font-bold`}>Name:</Text>
                            <Text className={` ${darkMode ? 'text-gray-500' : 'text-blue-100'} font-semibold text-xl `}>{userData.name}</Text>
                        </View>
                        <View className={` ${darkMode ? ' bg-white' : 'bg-blue-950'} p-3 rounded-2xl w-[48%]`}>
                            <Text  className={`text-sm ${darkMode ? ' text-gray-500' : 'text-gray-300'} mb-[7px] font-bold`}>Father Name:</Text>
                            <Text className={` ${darkMode ? 'text-gray-500' : 'text-blue-100'} font-semibold text-xl `}>{userData.fatherName}</Text>
                        </View>
                    </View>

                    <View className="w-[100%] mb-[15px] flex flex-row justify-center space-x-2">
                        <View className={` ${darkMode ? ' bg-white' : 'bg-blue-950'} p-3 rounded-2xl w-[48%]`}>
                            <Text  className={`text-sm ${darkMode ? ' text-gray-500' : 'text-gray-300'} mb-[7px] font-bold`}>Gender:</Text>
                            <Text className={` ${darkMode ? 'text-gray-500' : 'text-blue-100'} font-semibold text-xl `}>{userData.gender}</Text>
                        </View>
                        <View className={` ${darkMode ? ' bg-white' : 'bg-blue-950'} p-3 rounded-2xl w-[48%]`}>
                            <Text  className={`text-sm ${darkMode ? ' text-gray-500' : 'text-gray-300'} mb-[7px] font-bold`}>Blood Group:</Text>
                            <Text className={` ${darkMode ? 'text-gray-500' : 'text-blue-100'} font-semibold text-xl `}>{userData.bloodGroup}</Text>
                        </View>
                    </View>

                    <View className="w-[100%] mb-[15px] flex flex-row justify-center space-x-2">
                        <View className={` ${darkMode ? ' bg-white' : 'bg-blue-950'} p-3 rounded-2xl w-[48%]`}>
                            <Text  className={`text-sm ${darkMode ? ' text-gray-500' : 'text-gray-300'} mb-[7px] font-bold`}>City:</Text>
                            <Text className={` ${darkMode ? 'text-gray-500' : 'text-blue-100'} font-semibold text-xl `}>{userData.city}</Text>
                        </View>
                        <View className={` ${darkMode ? ' bg-white' : 'bg-blue-950'} p-3 rounded-2xl w-[48%]`}>
                            <Text  className={`text-sm ${darkMode ? ' text-gray-500' : 'text-gray-300'} mb-[7px] font-bold`}>Nationality:</Text>
                            <Text className={` ${darkMode ? 'text-gray-500' : 'text-blue-100'} font-semibold text-xl `}>{userData.nationality}</Text>
                        </View>
                    </View>

                    <View className="w-[100%] mb-[15px] flex flex-row justify-center space-x-2">                        
                    <View className={` ${darkMode ? ' bg-gray-500' : 'bg-blue-900'} p-3 rounded-2xl w-full`}>
                            <Text  className={`text-sm ${darkMode ? ' text-gray-100' : 'text-gray-300'} mb-[7px] font-bold`}>Current Address:</Text>
                            <Text className="text-white font-semibold text-lg">{userData.currentAddress}</Text>
                        </View>
                    </View>

                    <View className="w-[100%] mb-[15px] flex flex-row justify-center space-x-2">
                        <View className={` ${darkMode ? ' bg-gray-500' : 'bg-blue-900'} p-3 rounded-2xl w-full`}>
                            <Text className= {`text-sm ${darkMode ? ' text-gray-100' : 'text-gray-300'} mb-[7px] font-bold`}>Permanent Address:</Text>
                            <Text className="text-white font-semibold text-lg">{userData.permanentAddress}</Text>
                        </View>
                    </View>

                </View>

            </View> 
        </ScrollView>
    );
};

export default StudentProfile;
