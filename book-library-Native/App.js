import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  FlatList,
  Alert,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Image    
} from "react-native";
import * as ImagePicker from "expo-image-picker";

//import React hooks and React Native UI components,Expo image picker

const API_URL = "http://192.168.8.102:4000/api/books";
const SERVER = "http://192.168.8.102:4000";   //SERVER is used to convert to full URL


const getCoverUrl = (cover) => {   //Function to correctly handle different image formats.
  if (!cover) return "";  //If no image exists, return empty string
  if (cover.startsWith("data:image")) return cover; // base64
  if (cover.startsWith("http")) return cover; // full url
  if (cover.startsWith("/")) return `${SERVER}${cover}`; // /covers/..
  return `${SERVER}/${cover}`; // Fallback for relative image paths
};

export default function App() {
  const [books, setBooks] = useState([]);  //State to store all books from backend


  const [form, setForm] = useState({   //State to store form input values
    id: null,
    title: "",
    author: "",
    genre: "",
    year: "",
    cover: "",
  });

  const isEditing = !!form.id;

                          
  const loadBooks = async () => {    //Function to fetch books from API 
    try {
      const res = await fetch(API_URL);   //Fetch books and store in state
      const data = await res.json();
      setBooks(data);
    } catch (e) {
      console.log(e);
      Alert.alert("Error", "Failed to fetch books");
    }
  };

  useEffect(() => {   //Runs once when app loads
    loadBooks();
  }, []);

  
  const handleChange = (name, value) => {
    if (name === "year") {
      const onlyDigits = value.replace(/\D/g, "");   //Allows only numbers for year
      setForm((prev) => ({ ...prev, year: onlyDigits }));
      return;
    }
    setForm((prev) => ({ ...prev, [name]: value }));
  };


  const pickImage = async () => {  //Function to pick image from gallery
    try {
      const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!perm.granted) {
        Alert.alert("Permission needed", "Please allow photo access");
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({   //Opens image picker.
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.6,
        base64: true,  //Converts image to base64
      });

      if (result.canceled) return;

      const asset = result.assets?.[0];
      if (!asset?.base64) {
        Alert.alert("Error", "Failed to read image");
        return;
      }

      const base64Uri = `data:image/jpeg;base64,${asset.base64}`;   //Creates valid base64 image URI
      setForm((prev) => ({ ...prev, cover: base64Uri }));
    } catch (e) {
      console.log(e);
      Alert.alert("Error", "Image pick failed");
    }
  };

  
  const saveBook = async () => {   //Handles add or update
    if (!form.title || !form.author || !form.genre || !form.year) {    // check Form validation
      Alert.alert("Validation", "Fill all fields");
      return;
    }

    const payload = {   //Data sent to backend
      title: form.title,
      author: form.author,
      genre: form.genre,
      year: Number(form.year),
      cover: form.cover || "",
    };

    try {
      if (isEditing) {    //Update existing book
        const res = await fetch(`${API_URL}/${form.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        if (!res.ok) throw new Error("Update failed");
        Alert.alert("Success", "Book updated");
      } else {   //Create new book
        
        const res = await fetch(API_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        if (!res.ok) throw new Error("Create failed");
        Alert.alert("Success", "Book added");
      }

      clearForm();
      loadBooks();
    } catch (e) {
      console.log(e);
      Alert.alert(
        "Error",
        isEditing ? "Failed to update book" : "Failed to add book"
      );
    }
  };

  const editBook = (book) => {    //Fills form with selected book
    setForm({
      id: book.id,
      title: book.title || "",
      author: book.author || "",
      genre: book.genre || "",
      year: String(book.year ?? ""),
      cover: book.cover || "",
    });
  };


  const deleteBook = async (id) => {
    try {
      const res = await fetch(`${API_URL}/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Delete failed");
      Alert.alert("Success", "Book deleted");
      loadBooks();
    } catch (e) {
      console.log(e);
      Alert.alert("Error", "Failed to delete");
    }
  };

  const confirmDelete = (id) => {    //Shows confirmation alert
    Alert.alert("Confirm", "Delete this book?", [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: () => deleteBook(id) },
    ]);
  };


  const clearForm = () => {   //clear form
    setForm({
      id: null,
      title: "",
      author: "",
      genre: "",
      year: "",
      cover: "",
    });
  };

  const renderItem = ({ item }) => (   //Defines how each book is displayed
    <View style={styles.card}>
      {item.cover ? (
        <Image
          source={{ uri: getCoverUrl(item.cover) }}  //Displays book cover
          style={styles.cover}
          resizeMode="cover"
        />
      ) : (
        <View style={styles.noCover}>
          <Text style={{ color: "#555" }}>No Cover</Text>
        </View>
      )}

      <View style={{ flex: 1 }}>
        <Text style={styles.bookTitle}>{item.title}</Text>
        <Text style={styles.bookMeta}>
          {item.author} • {item.genre} • {item.year}
        </Text>

        <View style={styles.row}>
          <View style={{ flex: 1, marginRight: 8 }}>
            <Button title="Edit" onPress={() => editBook(item)} />  
          </View>
          <View style={{ flex: 1 }}>
            <Button title="Delete" onPress={() => confirmDelete(item.id)} />
          </View>
        </View>
      </View>
    </View>
  );

  return (
    <KeyboardAvoidingView  //automatically moves or resizes the screenso the keyboard does not hide your input fields
      style={{ flex: 1, backgroundColor: "#DDA0DD" }} // plum background color
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Book Library</Text>

    
        <View style={styles.formBox}>
          <Text style={styles.formTitle}>
            {isEditing ? "Update Book" : "Add Book"}
          </Text>

          <TextInput
            style={styles.input}
            placeholder="Title"
            value={form.title}
            onChangeText={(v) => handleChange("title", v)}
          />
          <TextInput
            style={styles.input}
            placeholder="Author"
            value={form.author}
            onChangeText={(v) => handleChange("author", v)}
          />
          <TextInput
            style={styles.input}
            placeholder="Genre"
            value={form.genre}
            onChangeText={(v) => handleChange("genre", v)}
          />
          <TextInput
            style={styles.input}
            placeholder="Year"
            value={form.year}
            keyboardType="numeric"
            onChangeText={(v) => handleChange("year", v)}
          />

          <TouchableOpacity style={styles.pickBtn} onPress={pickImage}>
            <Text style={styles.pickBtnText}>
              {form.cover ? "Change Cover" : "Pick Cover"}
            </Text>
          </TouchableOpacity>

          {form.cover ? (
            <Image
              source={{ uri: getCoverUrl(form.cover) }}
              style={styles.preview}
              resizeMode="cover"
            />
          ) : null}

          <View style={{ marginTop: 10 }}>
            <Button
              title={isEditing ? "Update Book" : "Add Book"}
              onPress={saveBook}
            />
          </View>

          {isEditing ? (
            <View style={{ marginTop: 8 }}>
              <Button title="Cancel Edit" onPress={clearForm} />
            </View>
          ) : null}
        </View>

        <Text style={styles.listTitle}>Books</Text>

        <FlatList
          data={books}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          scrollEnabled={false}
          ListEmptyComponent={
            <Text style={{ marginTop: 8 }}>No books found.</Text>
          }
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({  //Edit & Delete buttons
  container: {
    padding: 16,
    paddingBottom: 40,
  },
  title: {
    fontSize: 26,
    fontWeight: "800",
    marginTop: 40,
    marginBottom: 12,
  },

  formBox: {
    backgroundColor: "white",
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
  },
  formTitle: {
    fontSize: 18,
    fontWeight: "800",
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    padding: 10,
    borderRadius: 10,
    marginBottom: 8,
    backgroundColor: "white",
  },
  pickBtn: {
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: "center",
    marginBottom: 8,
  },
  pickBtnText: {
    fontWeight: "700",
  },
  preview: {
    width: "100%",
    height: 180,
    borderRadius: 12,
    marginTop: 6,
  },

  listTitle: {
    fontSize: 18,
    fontWeight: "800",
    marginTop: 16,
    marginBottom: 8,
  },

  card: {
    flexDirection: "row",
    gap: 12,
    backgroundColor: "white",
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    marginBottom: 10,
  },
  cover: {
    width: 80,
    height: 120,
    borderRadius: 10,
    backgroundColor: "#eee",
  },
  noCover: {
    width: 80,
    height: 120,
    borderRadius: 10,
    backgroundColor: "#eee",
    alignItems: "center",
    justifyContent: "center",
  },
  bookTitle: {
    fontSize: 16,
    fontWeight: "800",
  },
  bookMeta: {
    marginTop: 4,
    marginBottom: 10,
    color: "#444",
  },
  row: {
    flexDirection: "row",
    marginTop: 6,
  },
});
