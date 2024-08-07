import React, { useState, useEffect } from 'react';
import { Text, View, ScrollView, ActivityIndicator } from 'react-native';
import { auth, fs } from '../Config/Config'; // Adjust the import path as needed

const Home = () => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      const user = auth.currentUser;

      if (user) {
        try {
          const userDoc = await fs.collection('students').doc(user.uid).get();
          if (userDoc.exists) {
            setUserData(userDoc.data());
          }
        } catch (error) {
          console.error("Error fetching user data: ", error);
        }
      }

      setLoading(false);
    };

    fetchUserData();
  }, []);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  if (!userData) {
    return (
      <View className="text-lg bg-red-300">
        <Text className="text-xl text-red-700" >No user data available</Text>
      </View>
    );
  }

  return (
    <ScrollView className="bg-blue-950 p-[10px]">
      <Text className="text-xl text-white mb-[15px] font-bold">
        Welcome, {userData.name}
      </Text>
      <View style={{ backgroundColor: '#4B5563', padding: 16, borderRadius: 8, marginBottom: 16 }}>
        <Text style={{ color: '#E5E7EB', fontSize: 18, fontWeight: '600', marginBottom: 8 }}>
          User Details
        </Text>
        
        <Text style={{ color: '#E5E7EB', fontSize: 16, marginBottom: 4 }}>📧 Email: {userData.email}</Text>
        <Text style={{ color: '#E5E7EB', fontSize: 16, marginBottom: 4 }}>📅 DOB: {userData.dob}</Text>
        <Text style={{ color: '#E5E7EB', fontSize: 16, marginBottom: 4 }}>🎓 Batch: {userData.batch}</Text>
        <Text style={{ color: '#E5E7EB', fontSize: 16, marginBottom: 4 }}>📚 Semester: {userData.semester}</Text>
        <Text style={{ color: '#E5E7EB', fontSize: 16, marginBottom: 4 }}>🌍 Country: {userData.country}</Text>
        <Text style={{ color: '#E5E7EB', fontSize: 16, marginBottom: 4 }}>🌐 Nationality: {userData.nationality}</Text>
        <Text style={{ color: '#E5E7EB', fontSize: 16, marginBottom: 4 }}>👤 Gender: {userData.gender}</Text>
        <Text style={{ color: '#E5E7EB', fontSize: 16 }}>📞 Phone: {userData.phone}</Text>
      </View>
 
      {/* Add more sections as needed */}
    </ScrollView>
  );
};

export default Home;
