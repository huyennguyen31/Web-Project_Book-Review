import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, FlatList, TextInput, Button, Alert, Image, TouchableOpacity
} from 'react-native';
import { useRoute } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { fetchBookById, postComment } from '../api/api';

interface Comment {
  id: number;
  content: string;
  created_at: string;
  rating: number;
  username: string;
}

export default function BookDetailScreen() {
  const route = useRoute();
  const { bookId } = route.params as { bookId: number };

  const [book, setBook] = useState<any>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [userRating, setUserRating] = useState<number>(0);

  const fetchBook = async () => {
    try {
      const data = await fetchBookById(bookId);
      setBook(data);
    } catch (error) {
      Alert.alert('Lỗi', 'Không tải được sách');
    }
  };

  const fetchComments = async () => {
    try {
      const res = await fetch(`http://10.0.2.2:4000/api/comments/${bookId}`);
      const text = await res.text();
      const data = JSON.parse(text);
      setComments(data);
    } catch (error) {
      console.log('Lỗi lấy comment:', error);
    }
  };

  const handleComment = async () => {
    const token = await AsyncStorage.getItem('token');
    const userIdStr = await AsyncStorage.getItem('userId');
    if (!token || !userIdStr) return Alert.alert('You need to log in');
    if (!userRating) return Alert.alert('Please rate the book');
    if (!newComment.trim()) return Alert.alert('Please enter a comment');

    const userId = parseInt(userIdStr);
    try {
      console.log('🔄 Gửi:', { bookId, userId, newComment, userRating });
      await postComment(bookId, userId, newComment, userRating);
      setNewComment('');
      setUserRating(0);
      await fetchComments();
    } catch (error) {
      Alert.alert('Error!'); 
    }
  };

  useEffect(() => {
    fetchBook();
    fetchComments();
  }, []);

  const averageRating =
    comments.length > 0
      ? (comments.reduce((sum, c) => sum + c.rating, 0) / comments.length).toFixed(2)
      : 'Chưa có';

  const renderStars = (selected: number, onSelect?: (val: number) => void) => {
    return (
      <View style={styles.starRow}>
        {[1, 2, 3, 4, 5].map((val) => (
          <TouchableOpacity key={val} onPress={() => onSelect?.(val)}>
            <Text style={[styles.star, val <= selected ? styles.starActive : {}]}>⭐</Text>
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  if (!book || !book.title) return <Text style={styles.loading}>Loading...</Text>;

  return (
    <FlatList
      ListHeaderComponent={
        <View style={styles.container}>
          {book.cover_url && <Image source={{ uri: book.cover_url }} style={styles.cover} />}
          <Text style={styles.title}>{book.title}</Text>
          <Text style={styles.author}>Author: {book.author}</Text>
          <Text style={styles.rating}>⭐ {averageRating} ({comments.length} rate)</Text>
          <Text style={styles.desc}>{book.description || 'No description'}</Text>

          <Text style={styles.subjectLabel}>Subject:</Text>
          <View style={styles.subjectContainer}>
            {(Array.isArray(book.subjects) ? book.subjects : JSON.parse(book.subjects)).map(
              (subj: string, idx: number) => (
                <Text key={idx} style={styles.subjectTag}>#{subj}</Text>
              )
            )}
          </View>

          <Text style={styles.commentTitle}>Community comments:</Text>
        </View>
      }
      data={comments}
      keyExtractor={(item) => item.id.toString()}
      renderItem={({ item }) => (
        <View style={styles.commentBox}>
          <Text style={styles.username}>{item.username}</Text>
          {renderStars(item.rating)}
          <Text>{item.content}</Text>
          <Text style={styles.time}>{item.created_at}</Text>
        </View>
      )}
      ListFooterComponent={
        <View style={styles.footer}>
          <Text style={styles.footerTitle}>Book rating:</Text>
          {renderStars(userRating, setUserRating)}
          <TextInput
            placeholder="Enter comment"
            style={styles.input}
            value={newComment}
            onChangeText={setNewComment}
          />
          <Button title="Post comment" onPress={handleComment} color="#B7AC9C" />
        </View>
      }
    />
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, backgroundColor: '#F5F4F1' },
  title: { fontSize: 24, fontWeight: 'bold', marginTop: 10, color: '#7B5E57' },
  author: { fontSize: 18, marginTop: 5, color: '#8C7B75' },
  desc: { fontSize: 16, marginVertical: 10, color: '#4E4E4E' },
  cover: { width: '100%', aspectRatio: 2 / 3, resizeMode: 'cover', borderRadius: 8, marginBottom: 10 },
  rating: { fontSize: 16, color: '#BFA597', marginVertical: 5 },
  commentTitle: { fontSize: 20, fontWeight: 'bold', marginTop: 20, marginBottom: 10, color: '#7B5E57' },
  commentBox: { paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#EFE7DA' },
  input: { borderWidth: 1, padding: 10, marginTop: 10, borderRadius: 6, borderColor: '#E1DACA', backgroundColor: '#FFFFFF' },
  time: { fontSize: 12, color: '#999' },
  username: { fontWeight: 'bold', color: '#7B5E57' },
  subjectContainer: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 10 },
  subjectLabel: { fontWeight: 'bold', marginTop: 10, color: '#7B5E57' },
  subjectTag: { backgroundColor: '#EFE7DA', borderRadius: 5, padding: 4, marginRight: 5, marginTop: 5, color: '#4E4E4E' },
  starRow: { flexDirection: 'row', marginVertical: 5 },
  star: { fontSize: 28, opacity: 0.3 },
  starActive: { opacity: 1 },
  footer: { padding: 20, backgroundColor: '#F5F4F1' },
  footerTitle: { fontSize: 18, fontWeight: 'bold', color: '#7B5E57' },
  loading: { flex: 1, justifyContent: 'center', textAlign: 'center', marginTop: 50 }
});