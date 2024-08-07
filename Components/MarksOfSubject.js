import React from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
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
        <View style={styles.container}>
            <Text style={styles.title}>"{courseName}" Marks</Text>

            {selectedCourseMarks ? (
                <View>
                    <Text style={styles.subTitle}>Grading Criteria</Text>
                    <FlatList
                        data={selectedCourseMarks.criteriaDefined}
                        keyExtractor={(item, index) => index.toString()}
                        renderItem={({ item, index }) => (
                            <View style={styles.criteriaItem}>
                                <Text style={styles.criteriaText}>{index + 1}</Text>
                                <Text style={styles.criteriaText}>{item.assessment}</Text>
                                <Text style={styles.criteriaText}>{item.weightage}%</Text>
                            </View>
                        )}
                    />

                    <Text style={styles.subTitle}>Obtained Marks</Text>
                    <FlatList
                        data={selectedCourseMarks.criteriaDefined}
                        keyExtractor={(item, index) => index.toString()}
                        renderItem={({ item }) => (
                            <View style={styles.marksItem}>
                                <Text style={styles.marksText}>{item.assessment}</Text>
                                <Text style={styles.marksText}>{selectedCourseMarks.studentMarks[item.assessment]}</Text>
                                <Text style={styles.marksText}>{item.totalMarks}</Text>
                                <Text style={styles.marksText}>
                                    {((selectedCourseMarks.studentMarks[item.assessment] / item.totalMarks) * item.weightage).toFixed(2)}
                                </Text>
                            </View>
                        )}
                    />

                    <View style={styles.summaryContainer}>
                        <View style={styles.summaryItem}>
                            <Text style={styles.summaryText}>

                                Total Weighted Marks:
                            </Text>
                            <Text style={styles.summaryText}>{calculateTotalWeightedMarks()}</Text>
                        </View>
                        <View style={styles.summaryItem}>
                            <Text style={styles.summaryText}>
                                Grade:
                            </Text>
                            <Text style={styles.summaryText}>{selectedCourseMarks.grade}</Text>
                        </View>
                    </View>
                </View>
            ) : (
                <Text style={styles.error}>{errorMessage || 'No marks data available.'}</Text>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 10,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        textAlign: 'center',
        marginVertical: 12,
    },
    subTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginVertical: 10,
    },
    criteriaItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 5,
        borderBottomWidth: 1,
        borderBottomColor: '#ccc',
    },
    criteriaText: {
        flex: 1,
        textAlign: 'center',
    },
    marksItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 5,
        borderBottomWidth: 1,
        borderBottomColor: '#ccc',
    },
    marksText: {
        flex: 1,
        textAlign: 'center',
    },
    summaryContainer: {
        marginTop: 20,
    },
    summaryItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#ccc',
    },
    summaryText: {
        flex: 1,
        textAlign: 'center',
    },
    error: {
        color: 'red',
        textAlign: 'center',
        marginTop: 20,
    },
});

export default MarksOfSubject;
