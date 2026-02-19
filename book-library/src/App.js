import {useState,useEffect,useRef,forwardRef,useImperativeHandle} from "react";  // React hooks import 
import "./App.css";  // CSS file import

const API_URL = "http://localhost:4000/api/books"; // Backend API URL

const Toaster = forwardRef((props, ref) => {
  const [toast, setToast] = useState(null);   // toast state → message & intent store 

  useImperativeHandle(ref, () => ({
    show({ message, intent = "success", timeout = 3000 }) {   // show() function → toast display
      setToast({ message, intent });
      setTimeout(() => setToast(null), timeout);
    }
  }));

  if (!toast) return null;
// toast UI
  return (
    <div className={`toast toast-${toast.intent}`}>
      {toast.message}
    </div>
  );
});


function App() {

  const [books, setBooks] = useState([]);   // books list state

  const [form, setForm] = useState({      // form state (add / edit book)
    id: null,
    title: "",
    author: "",
    genre: "",
    year: "",
    cover: ""
  });

  const [filter, setFilter] = useState("");    // filter input state

  const toasterRef = useRef(null);      // toaster component reference

//Load books from backend 

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const res = await fetch(API_URL);  // backend API call
        const data = await res.json();     // JSON data convert
        setBooks(data);    // books state update
      } catch (err) {
        console.error("Failed to fetch books:", err);
      }
    };
    fetchBooks();
  }, []);   // empty dependency → only once run

// Handle form inputs

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "year") {
      const onlyDigits = value.replace(/\D/g, "");  // only allow numbers , remove 
      setForm((prev) => ({ ...prev, year: onlyDigits }));
      return;
    }

    setForm((prev) => ({ ...prev, [name]: value }));
  };

//Image upload 
  const handleImage = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();   //covert  image to  base64
    reader.onload = () => {
      setForm((prev) => ({ ...prev, cover: reader.result }));
    };
    reader.readAsDataURL(file);
  };

  // Add / Update 
  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      title: form.title,
      author: form.author,
      genre: form.genre,
      year: Number(form.year),
      cover: form.cover
    };

    try {
      if (form.id) {
        // UPDATE
        const res = await fetch(`${API_URL}/${form.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });
        const updated = await res.json();

        setBooks((prev) =>
          prev.map((b) => (b.id === updated.id ? updated : b))
        );

        toasterRef.current.show({
          message: "Book updated successfully!",
          intent: "update"
        });
      } else {
        // CREATE
        const res = await fetch(API_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });
        const created = await res.json();

        setBooks((prev) => [created, ...prev]);

        toasterRef.current.show({
          message: "Book added successfully!",
          intent: "success"
        });
      }

      setForm({
        id: null,
        title: "",
        author: "",
        genre: "",
        year: "",
        cover: ""
      });
    } catch (err) {
      console.error("Failed to save book:", err);
      toasterRef.current.show({
        message: "Something went wrong!",
        intent: "error"
      });
    }
  };

 //Edit
  const editBook = (book) => {    //Fill form with book data.
    setForm({
      id: book.id,
      title: book.title,
      author: book.author,
      genre: book.genre,
      year: String(book.year),
      cover: book.cover || ""
    });
  };

// Delete
  const deleteBook = async (id) => {
    try {
      await fetch(`${API_URL}/${id}`, { method: "DELETE" }); //Delete API call.
      setBooks((prev) => prev.filter((b) => b.id !== id));

      toasterRef.current.show({
        message: "Book deleted successfully!",
        intent: "delete"
      });
    } catch (err) {
      console.error("Failed to delete book:", err);
      toasterRef.current.show({
        message: "Delete failed!",
        intent: "error"
      });
    }
  };
//Filter
  const filteredBooks = books.filter((book) =>
    book.author.toLowerCase().includes(filter.toLowerCase()) //Case-insensitive search.2
  );

  return (
    <div>
      <h1> Book Library</h1>

     
      <input
        placeholder="Filter by author"
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
      />

   
      <form onSubmit={handleSubmit}>
        <input
          name="title"
          placeholder="Book Title"
          value={form.title}
          onChange={handleChange}
          required
        />
        <input
          name="author"
          placeholder="Author"
          value={form.author}
          onChange={handleChange}
          required
        />
        <input
          name="genre"
          placeholder="Genre"
          value={form.genre}
          onChange={handleChange}
          required
        />
        <input
          name="year"
          placeholder="Year Published"
          value={form.year}
          onChange={handleChange}
          required
        />
        <input type="file" onChange={handleImage} />
        <button type="submit">
          {form.id ? "Update Book" : "Add Book"}
        </button>
      </form>

     
      {filteredBooks.map((book) => (
        <div key={book.id} style={{ padding: "10px" }}>
          {book.cover && (
            <img src={book.cover} alt={book.title} width="100" />
          )}
          <h3>{book.title}</h3>
          <p>Author: {book.author}</p>
          <p>Genre: {book.genre}</p>
          <p>Year: {book.year}</p>
          <button onClick={() => editBook(book)}>Edit</button>
          <button onClick={() => deleteBook(book.id)}>Delete</button>
        </div>
      ))}

    
      <Toaster ref={toasterRef} />
    </div>
  );
}

export default App;
