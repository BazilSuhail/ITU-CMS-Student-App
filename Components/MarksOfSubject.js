import React from 'react';
import { View, Text, FlatList } from 'react-native';
import { useRoute } from '@react-navigation/native';

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
                    <Text className="text-xl font-bold text-white underline my-4">Grading Criteria</Text>
                    <FlatList
                        data={selectedCourseMarks.criteriaDefined}
                        keyExtractor={(item, index) => index.toString()}
                        renderItem={({ item, index }) => (
                            <View className="flex-row justify-between bg-blue-900 rounded-md py-[10px] border-b border-gray-500">
                                <Text className="text-white font-medium text-center flex-1">{item.assessment}</Text>
                                <Text className="text-white font-extrabold text-center flex-1">{item.weightage}%</Text>
                            </View>
                        )}
                    />

                    <Text className="text-xl font-bold text-white my-4">Obtained Marks</Text>
                    <FlatList
                        data={selectedCourseMarks.criteriaDefined}
                        keyExtractor={(item, index) => index.toString()}
                        renderItem={({ item }) => (
                            <View className="flex-row justify-between py-2 border-b border-gray-700">
                                <Text className="text-white text-center flex-1">{item.assessment}</Text>
                                <Text className="text-white text-center flex-1">{selectedCourseMarks.studentMarks[item.assessment]}</Text>
                                <Text className="text-white text-center flex-1">{item.totalMarks}</Text>
                                <Text className="text-white text-center flex-1">
                                    {((selectedCourseMarks.studentMarks[item.assessment] / item.totalMarks) * item.weightage).toFixed(2)}
                                </Text>
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
