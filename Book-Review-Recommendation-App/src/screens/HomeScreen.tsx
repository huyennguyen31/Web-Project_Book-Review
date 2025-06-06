import React, { useEffect, useState } from 'react';
import {
  View, Text, FlatList, TouchableOpacity,
  ActivityIndicator, StyleSheet, TextInput, Image
} from 'react-native';
import { fetchBooks } from '../api/api';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';

interface Book {
  id: number;
  title: string;
  author: string;
  subjects: string[];
  cover_url: string;
  genre: string;
}

export default function HomeScreen() {
  const [allBooks, setAllBooks] = useState<Book[]>([]);
  const [books, setBooks] = useState<Book[]>([]);
  const [searchText, setSearchText] = useState('');
  const [selectedGenre, setSelectedGenre] = useState<string | null>(null);
  const [genres, setGenres] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  useEffect(() => {
    loadBooks();
  }, []);

  const loadBooks = async () => {
    try {
      setLoading(true);
      const data = await fetchBooks();
      const fixed = data.map((book: any) => ({
        ...book,
        subjects: typeof book.subjects === 'string' ? JSON.parse(book.subjects) : (book.subjects || []),
      }));
      setAllBooks(fixed);
      setBooks(fixed);
      extractGenres(fixed);
    } catch (error) {
      console.log('Load books error:', error);
      setAllBooks([]);
      setBooks([]);
    } finally {
      setLoading(false);
    }
  };

  const extractGenres = (bookList: Book[]) => {
    const allGenres = bookList
      .map(book => book.genre)
      .filter((g): g is string => !!g && g.trim().length > 0 && g.toLowerCase() !== 'unknown');
    const unique = Array.from(new Set(allGenres));
    setGenres(unique);
  };

  const handleSearch = (text: string) => {
    setSearchText(text);
    filterBooks(text, selectedGenre);
  };

  const filterBooks = (text: string, genre: string | null) => {
    const filtered = allBooks.filter(book => {
      const matchTitle = book.title.toLowerCase().includes(text.toLowerCase());
      const matchGenre = genre ? book.genre === genre : true;
      return matchTitle && matchGenre;
    });
    setBooks(filtered);
  };

  const handleSelectGenre = (genre: string) => {
    const newGenre = genre === selectedGenre ? null : genre;
    setSelectedGenre(newGenre);
    setSearchText('');
    filterBooks('', newGenre);
  };

  if (loading) return <ActivityIndicator size="large" style={{ flex: 1 }} />;

  return (
    <View style={styles.container}>
 
      <View style={styles.searchContainer}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          placeholder="Search books by title..."
          placeholderTextColor="#aaa"
          style={styles.searchBox}
          value={searchText}
          onChangeText={handleSearch}
        />
        {searchText.length > 0 && (
          <TouchableOpacity
            onPress={() => {
              setSearchText('');
              filterBooks('', selectedGenre);
            }}
            style={styles.clearButton}
          >
            <Text style={styles.clearText}>✕</Text>
          </TouchableOpacity>
        )}
      </View>
 
      <FlatList
        horizontal
        data={genres}
        keyExtractor={(item) => item}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingVertical: 5 }}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[
              styles.genreButton,
              selectedGenre === item && styles.genreSelected
            ]}
            onPress={() => handleSelectGenre(item)}
          >
            <Text style={[
              styles.genreText,
              selectedGenre === item && styles.genreTextSelected
            ]}>
              {item}
            </Text>
          </TouchableOpacity>
        )}
      />
 
      {books.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No books found. Try another search or genre!</Text>
        </View>
      ) : (
        <FlatList
          data={books}
          numColumns={2}
          key={'2cols'}
          columnWrapperStyle={{ justifyContent: 'space-between' }}
          keyExtractor={item => item.id.toString()}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.card}
              activeOpacity={0.8}
              onPress={() => navigation.navigate('BookDetail', { bookId: item.id })}
            >
              <Image source={{ uri: item.cover_url }} style={styles.cover} />
              <Text style={styles.title}>{item.title}</Text>
              <Text style={styles.author}>{item.author}</Text>
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 10, backgroundColor: '#F5F1E9' },  
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFE7DA',
    borderRadius: 25,
    paddingHorizontal: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#D4C9B4',
  },
  searchIcon: {
    fontSize: 20,
    color: '#888',
    marginRight: 8,
  },
  searchBox: {
    flex: 1,
    paddingVertical: 10,
    fontSize: 16,
    color: '#333',
  },
  clearButton: {
    padding: 4,
  },
  clearText: {
    fontSize: 18,
    color: '#888',
  },
  genreButton: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#D9CBB6',
    marginRight: 8,
    marginBottom: 15,
    height: 36,
    justifyContent: 'center',
  },
  genreSelected: {
    backgroundColor: '#7D5A50',
  },
  genreText: {
    fontSize: 14,
    color: '#5A4A42',
  },
  genreTextSelected: {
    color: '#fff',
    fontWeight: 'bold',
  },
  card: {
    width: '48%',
    backgroundColor: '#FFF',
    borderRadius: 10,
    padding: 10,
    marginBottom: 20, 
    elevation: 5,
  },
  cover: {
    width: '100%',
    aspectRatio: 2 / 3,
    borderRadius: 8,
    marginBottom: 8,
    backgroundColor: '#ccc',
  },
  title: { fontSize: 14, fontWeight: 'bold', color: '#4A3A2A' },
  author: { fontSize: 12, color: '#7D6A58' },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    marginTop: 60,
  },
  emptyText: {
    fontSize: 16,
    color: '#7D5A50',
  },
});