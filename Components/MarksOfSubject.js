import React from 'react';
import { View, Text, FlatList } from 'react-native';
import { useRoute } from '@react-navigation/native';

import { Ionicons } from '@expo/vector-icons'; // For icons
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

const MarksOfSubject = () => {
    const route = useRoute();
    const { selectedCourseMarks, courseName, errorMessage } = route.params || {};

    const calculateTotalWeightedMarks = () => {
        if (!selectedCourseMarks) return 0;
        return selectedCourseMarks.criteriaDefined.reduce((total, criterion) => {
            const obtainedMarks = selectedCourseMarks.studentMarks[criterion.assessment] || 0;
            const weightage = parseFloat(criterion.weightage) || 0;
            return total + ((obtainedMarks / criterion.totalMarks) * weightage);
        }, 0).toFixed(2);
    };

    return (
        <View className="flex-1 p-4 bg-custom-blue">
            {selectedCourseMarks ? (
                <View>
                    <Text className="text-xl font-bold text-white my-4">Obtained Marks</Text>
                    <View>
                        <View className="flex-row bg-blue-500 py-2 rounded-t-lg">
                            <Text className="flex-1 w-[170px] text-center text-white font-bold">Assesment Name</Text>
                            <Text className="flex-1 text-center text-white font-bold">Obtained Marks</Text>
                            <Text className="flex-1 text-center text-white font-bold">Total Marks</Text>
                            <Text className="flex-1 text-center text-white font-bold">Weighted Marks</Text>
                        </View>
                        <FlatList
                            data={selectedCourseMarks.criteriaDefined}
                            keyExtractor={(item, index) => index.toString()}
                            renderItem={({ item }) => (
                                <View className="flex-row justify-between py-2 bg-blue-950 border-b border-gray-500">
                                    <Text className="text-white font-extrabold pl-[4px] text-center flex-1">{item.assessment}</Text>
                                    <Text className="text-white text-center flex-1">{selectedCourseMarks.studentMarks[item.assessment]}</Text>
                                    <Text className="text-white text-center flex-1">{item.totalMarks}</Text>
                                    <Text className="text-white text-center flex-1">
                                        {((selectedCourseMarks.studentMarks[item.assessment] / item.totalMarks) * item.weightage).toFixed(2)}
                                    </Text>
                                </View>
                            )}
                        />
                    </View>

                    <View className="flex-row mt-[35px] px-[5px] justify-between space-x-3 mb-4">
                        <View className="bg-blue-900 flex-row items-center p-3 rounded-lg w-[49%] ">
                            <View className="flex-row items-center">
                                <Ionicons name="school-outline" size={38} color="white" />
                                <View className="h-[40px] mx-[10px] w-[2px] bg-white "></View>
                            </View>
                            <View className="flex ml-[5px] justify-center items-center">
                                <Text className="text-gray-200 font-bold text-[14px] mb-[2px]">Total Marks</Text>
                                <Text className="text-white text-[22px] font-bold ">{calculateTotalWeightedMarks()}</Text>
                            </View>
                        </View>

                        <View className="bg-blue-900 flex-row items-center p-3 rounded-lg w-[49%] ">
                            <View className="flex-row items-center">
                                <MaterialIcons name="grade" size={38} color="white" />
                                <View className="h-[40px] mx-[10px] w-[2px] bg-white "></View>
                            </View>
                            <View className="flex ml-[22px] justify-center items-center">
                                <Text className="text-gray-200 font-bold text-[14px] mb-[2px]">Grade</Text>
                                <Text className="text-white text-[22px] font-bold ">{selectedCourseMarks.grade}</Text>
                            </View>
                        </View>
                    </View>

                    <Text className="text-xl font-bold text-white underline my-4">Grading Criteria</Text>
                    <View className="flex-row bg-blue-500 py-2 rounded-t-lg">
                            <Text className="flex-1 w-[170px] text-center text-white font-bold">Assesment Name</Text>
                            <Text className="flex-1 text-center text-white font-bold">Decided Weightage</Text>
                         </View>
                    <FlatList
                        data={selectedCourseMarks.criteriaDefined}
                        keyExtractor={(item, index) => index.toString()}
                        renderItem={({ item, index }) => (
                            <View className="flex-row justify-between bg-blue-900 py-[10px] border-b border-gray-500">
                                <Text className="text-white font-medium text-center flex-1">{item.assessment}</Text>
                                <Text className="text-white font-extrabold text-center flex-1">{item.weightage}%</Text>
                            </View>
                        )}
                    />



                    <View className="mt-5">
                        <View className="flex-row justify-between py-3 border-b border-gray-700">
                            <Text className="text-white text-center flex-1">Total Weighted Marks:</Text>
                            <Text className="text-white text-center flex-1">{calculateTotalWeightedMarks()}</Text>
                        </View>
                        <View className="flex-row justify-between py-3 border-b border-gray-700">
                            <Text className="text-white text-center flex-1">Grade:</Text>
                            <Text className="text-white text-center flex-1">{selectedCourseMarks.grade}</Text>
                        </View>
                    </View>
                </View>
            ) : (
                <Text className="text-red-500 text-center mt-5">{errorMessage || 'No marks data available.'}</Text>
            )}
        </View>
    );
};

export default MarksOfSubject;
