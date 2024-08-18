import React, { useContext } from 'react';
import { View, Text, FlatList } from 'react-native';
import { useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons'; // For icons
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { ThemeContext } from '../Context/ThemeContext';


const MarksOfSubject = () => {
    const route = useRoute();
    const { selectedCourseMarks, courseName, errorMessage } = route.params || {};
    const { darkMode } = useContext(ThemeContext);

    const calculateTotalWeightedMarks = () => {
        if (!selectedCourseMarks) return 0;
        return selectedCourseMarks.criteriaDefined.reduce((total, criterion) => {
            const obtainedMarks = selectedCourseMarks.studentMarks[criterion.assessment] || 0;
            const weightage = parseFloat(criterion.weightage) || 0;
            return total + ((obtainedMarks / criterion.totalMarks) * weightage);
        }, 0).toFixed(2);
    };

    return (
        <View className={`flex-1 p-4 ${darkMode ? 'bg-gray-200' : 'bg-custom-blue'}`}>
            {selectedCourseMarks ? (
                <View>
                    <Text className={`text-xl font-bold my-4 ${darkMode ? 'text-gray-800' : 'text-white'}`}>Obtained Marks</Text>
                    <View>
                        <View className={`flex-row py-2 rounded-t-lg ${darkMode ? 'bg-gray-600' : 'bg-blue-500'}`}>
                            <Text className={`flex-1 pl-[15px] text-center font-bold ${darkMode ? 'text-gray-100' : 'text-white'}`}>Assessment Name</Text>
                            <Text className={`flex-1 text-center font-bold ${darkMode ? 'text-gray-100' : 'text-white'}`}>Obtained Marks</Text>
                            <Text className={`flex-1 text-center font-bold ${darkMode ? 'text-gray-100' : 'text-white'}`}>Total Marks</Text>
                            <Text className={`flex-1 text-center font-bold ${darkMode ? 'text-gray-100' : 'text-white'}`}>Weighted Marks</Text>
                        </View>
                        <FlatList
                            data={selectedCourseMarks.criteriaDefined}
                            keyExtractor={(item, index) => index.toString()}
                            renderItem={({ item }) => (
                                <View className={`flex-row justify-between py-2 border-b ${darkMode ? 'bg-white border-gray-300' : 'bg-blue-950 border-gray-500'}`}>
                                    <Text className={` pl-[15px] text-center flex-1 font-extrabold ${darkMode ? 'text-gray-800' : 'text-white'}`}>{item.assessment}</Text>
                                    <Text className={`text-center flex-1 ${darkMode ? 'text-gray-800' : 'text-white'}`}>{selectedCourseMarks.studentMarks[item.assessment]}</Text>
                                    <Text className={`text-center flex-1 ${darkMode ? 'text-gray-800' : 'text-white'}`}>{item.totalMarks}</Text>
                                    <Text className={`text-center flex-1 ${darkMode ? 'text-gray-800' : 'text-white'}`}>
                                        {((selectedCourseMarks.studentMarks[item.assessment] / item.totalMarks) * item.weightage).toFixed(2)}
                                    </Text>
                                </View>
                            )}
                        />
                    </View>

                    <View className="flex-row mt-[35px] px-[5px] justify-between space-x-3 mb-4">
                        <View className={`flex-row items-center p-3 rounded-lg w-[49%] ${darkMode ? 'bg-white' : 'bg-blue-900'}`}>
                            <View className="flex-row items-center">
                                <Ionicons name="school-outline" size={38} color={darkMode ? 'gray' : 'white'} />
                                <View className={`h-[40px] mx-[10px] w-[2px] ${darkMode ? 'bg-gray-400' : 'bg-white'}`} />
                            </View>
                            <View className="flex ml-[5px] justify-center items-center">
                                <Text className={`font-bold text-[14px] mb-[2px] ${darkMode ? 'text-gray-600' : 'text-gray-200'}`}>Total Marks</Text>
                                <Text className={`text-[22px] font-bold ${darkMode ? 'text-gray-800' : 'text-white'}`}>{calculateTotalWeightedMarks()}</Text>
                            </View>
                        </View>

                        <View className={`flex-row items-center p-3 rounded-lg w-[49%] ${darkMode ? 'bg-white' : 'bg-blue-900'}`}>
                            <View className="flex-row items-center">
                                <MaterialIcons name="grade" size={38} color={darkMode ? 'gray' : 'white'} />
                                <View className={`h-[40px] mx-[10px] w-[2px] ${darkMode ? 'bg-gray-400' : 'bg-white'}`} />
                            </View>
                            <View className="flex ml-[22px] justify-center items-center">
                                <Text className={`font-bold text-[14px] mb-[2px] ${darkMode ? 'text-gray-600' : 'text-gray-200'}`}>Grade</Text>
                                <Text className={`text-[22px] font-bold ${darkMode ? 'text-gray-800' : 'text-white'}`}>{selectedCourseMarks.grade}</Text>
                            </View>
                        </View>
                    </View>

                    <Text className={`text-xl font-bold underline my-4 ${darkMode ? 'text-gray-800' : 'text-white'}`}>Grading Criteria</Text>
                    <View className={`flex-row py-2 rounded-t-lg ${darkMode ? 'bg-gray-300' : 'bg-blue-500'}`}>
                        <Text className={`flex-1 w-[170px] text-center font-bold ${darkMode ? 'text-gray-700' : 'text-white'}`}>Assessment Name</Text>
                        <Text className={`flex-1 text-center font-bold ${darkMode ? 'text-gray-700' : 'text-white'}`}>Decided Weightage</Text>
                    </View>
                    <FlatList
                        data={selectedCourseMarks.criteriaDefined}
                        keyExtractor={(item, index) => index.toString()}
                        renderItem={({ item }) => (
                            <View className={`flex-row justify-between py-[10px] border-b ${darkMode ? 'bg-white border-gray-300' : 'bg-blue-900 border-gray-500'}`}>
                                <Text className={`text-center flex-1 font-medium ${darkMode ? 'text-gray-800' : 'text-white'}`}>{item.assessment}</Text>
                                <Text className={`text-center flex-1 font-extrabold ${darkMode ? 'text-gray-800' : 'text-white'}`}>{item.weightage}%</Text>
                            </View>
                        )}
                    />


                </View>
            ) : (
                <Text className={`text-center mt-5 ${darkMode ? 'text-red-600' : 'text-red-500'}`}>{errorMessage || 'No marks data available.'}</Text>
            )}
        </View>

    );
};

export default MarksOfSubject;
