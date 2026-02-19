// server/routes/bookRoutes.js
const express = require("express");
const Book = require("../models/Book");

const router = express.Router();

// =================== MAIN CRUD ROUTES =================== //

// GET /api/books - get all books
router.get("/", async (req, res) => {
  try {
    const books = await Book.find().sort({ createdAt: -1 });
    res.json(books);
  } catch (err) {
    console.error("Error getting books:", err.message);
    res.status(500).json({ error: "Failed to fetch books" });
  }
});

// POST /api/books - create new book
router.post("/", async (req, res) => {
  try {
    const { title, author, genre, year, cover } = req.body;
    const book = await Book.create({
      title,
      author,
      genre,
      year,
      cover
    });
    res.status(201).json(book);
  } catch (err) {
    console.error("Error creating book:", err.message);
    res.status(400).json({ error: "Failed to create book" });
  }
});

// PUT /api/books/:id - update book
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { title, author, genre, year, cover } = req.body;

    const book = await Book.findByIdAndUpdate(
      id,
      { title, author, genre, year, cover },
      { new: true }
    );

    if (!book) {
      return res.status(404).json({ error: "Book not found" });
    }

    res.json(book);
  } catch (err) {
    console.error("Error updating book:", err.message);
    res.status(400).json({ error: "Failed to update book" });
  }
});

// DELETE /api/books/:id - delete book
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const book = await Book.findByIdAndDelete(id);
    if (!book) {
      return res.status(404).json({ error: "Book not found" });
    }
    res.json({ message: "Book deleted" });
  } catch (err) {
    console.error("Error deleting book:", err.message);
    res.status(400).json({ error: "Failed to delete book" });
  }
});

// =================== TEMP SEED ROUTE (ONLY DEV) =================== //
// DELETE /api/books/:id - delete book
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const book = await Book.findByIdAndDelete(id);
    if (!book) {
      return res.status(404).json({ error: "Book not found" });
    }
    res.json({ message: "Book deleted" });
  } catch (err) {
    console.error("Error deleting book:", err.message);
    res.status(400).json({ error: "Failed to delete book" });
  }
});

// =================== TEMP SEED ROUTE (ONLY DEV) =================== //

// NOTE: This is a GET so you can hit it from the browser easily.
// After seeding once, you should DELETE or COMMENT this route.
router.get("/seed", async (req, res) => {
  try {
    const sampleBooks = [
      {
        title: "Clean Code",
        author: "Robert C. Martin",
        genre: "Programming",
        year: 2008,
        cover: "/covers/clean-code.jpg"
      },
      {
        title: "Harry Potter and the Sorcerer's Stone",
        author: "J.K. Rowling",
        genre: "Fantasy",
        year: 1997,
        cover: "/covers/harry-potter.jpg"
      },
      {
        title: "The Hobbit",
        author: "J.R.R. Tolkien",
        genre: "Fantasy",
        year: 1937,
        cover: "/covers/hobbit.jpg"
      },
      {
        title: "The Pragmatic Programmer",
        author: "Andrew Hunt",
        genre: "Programming",
        year: 1999,
        cover: "/covers/pragmatic-programmer.jpg"
      },
      {
        title: "1984",
        author: "George Orwell",
        genre: "Dystopian",
        year: 1949,
        cover: "/covers/1984.jpg"
      },
      {
        title: "To Kill a Mockingbird",
        author: "Harper Lee",
        genre: "Classic",
        year: 1960,
        cover: "/covers/to-kill-a-mockingbird.jpg"
      },
      {
        title: "The Great Gatsby",
        author: "F. Scott Fitzgerald",
        genre: "Classic",
        year: 1925,
        cover: "/covers/great-gatsby.jpg"
      },
      {
        title: "Clean Architecture",
        author: "Robert C. Martin",
        genre: "Programming",
        year: 2017,
        cover: "/covers/clean-architecture.jpg"
      },
      {
        title: "Brave New World",
        author: "Aldous Huxley",
        genre: "Dystopian",
        year: 1932,
        cover: "/covers/brave-new-world.jpg"
      }
    ];

    const count = await Book.countDocuments();
    if (count > 0) {
      return res
        .status(400)
        .json({ message: "Books already exist. Not seeding again." });
    }

    const created = await Book.insertMany(sampleBooks);
    res.json({ message: "Seeded successfully", count: created.length });
  } catch (err) {
    console.error("Error seeding books:", err.message);
    res.status(500).json({ error: "Failed to seed books" });
  }
});

// =================== EXPORT ROUTER =================== //

module.exports = router;

