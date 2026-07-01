const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const dbConnect = require("./db");
const {bookModel, review} = require('./models')
// TODO: Workshop Part 1: import your db connection from ./db once it's wired up.
// TODO: Workshop Part 2: import your Book model from ./models/Book once it's defined. 
const app = express();
const PORT = 8080;

// middleware ---------------------------------------
app.use(express.json()); // lets the server read JSON sent in a request body (req.body)
app.use(morgan("dev")); // logs method + url for every request
app.use(cors()); // allows a future frontend (different origin) to call this API

// in-memory data ------------------------------------
let books = [
  { id: 1, title: "The Pragmatic Programmer", author: "David Thomas", genre: "Tech", available: true },
  { id: 2, title: "Educated", author: "Tara Westover", genre: "Memoir", available: true },
  { id: 3, title: "Dune", author: "Frank Herbert", genre: "Sci-Fi", available: false },
  { id: 4, title: "Sapiens", author: "Yuval Noah Harari", genre: "History", available: true },
  { id: 5, title: "The Alchemist", author: "Paulo Coelho", genre: "Fiction", available: true },
];

let nextId = 6; // use this for any new book you create

// routes --------------------------------------------
// TODO: Workshop Part 4: one at a time, swap the array logic below for a real
// Book query. Keep the same path, same status codes, same 404 checks —
// only what's inside each try block changes.

// Part 2: smallest possible route, before touching book data
app.get("/", (request, response) => {
  response.send("Books API is running");
});

// Part 3: GET all books
// TODO: Workshop: swap `books` for the Book method that returns every row.
app.get("/api/books", async (request, response, next) => {
  try {
    const books  = await bookModel.findAll({include: review});
    response.json(books);
  } catch (error) {
    next(error);
  }
});

// Part 4: GET one book by id
// TODO: Workshop: swap `.find()` for the Book method that looks up by primary key.
// It returns null when nothing matches — your 404 check below still applies.
app.get("/api/books/:id", async (request, response, next) => {
  try {
    const id = Number(request.params.id); // request.params.id is always a string — Number() makes it comparable
    const book = await bookModel.findByPk(id, {include: review} );

    if (!book) {
      return response.sendStatus(404);
    }

    response.json(book);
  } catch (error) {
    next(error);
  }
});

// Part 5: POST a new book
// TODO: Workshop: swap the manual id/push for the Book method that creates a row
// directly from req.body. nextId goes away — the database assigns the id now.
app.post("/api/books", async (request, response, next) => {
  try {
    const book = await bookModel.create(request.body);
    response.status(201).json(book);
    } catch (error) {
    next(error);
  }
});

app.post("/api/books/:bookId/reviews", async (request, response, next) => {
 try{
  const id = Number(request.params.bookId);  
  const book = await bookModel.findByPk(id);
  if(!book){
        return response.statusCode(404);
  }
  
  await review.create({
    ...request.body,
    bookId: id
  })
  response.sendStatus(201);
  
} catch(err){
  next(err);
}
  })


// Part 6: PATCH an existing book — only changes the fields that were sent
// TODO: Workshop: find the book the same Sequelize way as the GET-one route above,
// then call the instance method that updates it in place with req.body.
app.patch("/api/books/:id", async (request, response, next) => {
  try {
    const id = Number(request.params.id);
    const book = await bookModel.findByPk(id)

    if (!book) {
      return response.sendStatus(404);
    }

    await book.update(request.body);

    response.status(200).json(book);
  } catch (error) {
    next(error);
  }
});

// Part 7: DELETE a book
// TODO: Workshop: find the book first, same as above, then call the instance
// method that removes itself — no more findIndex/splice.
app.delete("/api/books/:id", async (request, response, next) => {
  try {
    const id = Number(request.params.id);
    const book = await bookModel.findByPk(id);

    if (!book) {
      return response.sendStatus(404);
    }

    await book.destroy();
    response.sendStatus(204); // 204 No Content — no body on a successful delete
  } catch (error) {
    next(error);
  }
});

// TODO: Workshop cleanup: once all five routes above use Book instead of `books`,
// delete the `books` array and `nextId` variable up top — nothing should
// reference them anymore.

// error-handling middleware -------------------------
// 4 parameters (error first) is how Express recognizes this as an error handler.
app.use((error, request, response, next) => {
  console.error(error);
  response.sendStatus(500);
});

// app server ------------------------------------------
async function startApp() {
  await dbConnect.sync()
  // TODO: Workshop Part 3: this is where your table gets created from the Book
  // model. Call the sync method on your db connection and await it — the
  // table must exist before app.listen lets any request in.
 
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));  
}
dbConnect.authenticate().then(() => console.log("DB connected")).catch(console.error)
startApp();


/*const express = require("express");
const morgan = require("morgan");
const cors = require("cors");

// Import the Sequelize connection and the Book model.
// Importing the model here registers it with the connection so db.sync()
// knows about it when startApp() runs below.
const db = require("./db");
const Book = require("./models/book");

const app = express();
const PORT = 8080;

// middleware ---------------------------------------
app.use(express.json()); // lets the server read JSON sent in a request body (req.body)
app.use(morgan("dev"));  // logs method + url for every request
app.use(cors());         // allows a frontend on a different port to call this API

// routes --------------------------------------------

app.get("/", (request, response) => {
  response.send("Books API is running");
});

// GET all books
// findAll() returns every row in the Books table as an array of model instances.
app.get("/api/books", async (request, response, next) => {
  try {
    const books = await Book.findAll();
    response.json(books);
  } catch (error) {
    next(error);
  }
});

// GET one book by id
// findByPk() looks up a single row by its primary key.
// It returns null (not undefined) when nothing matches — always check before responding.
app.get("/api/books/:id", async (request, response, next) => {
  try {
    const id = Number(request.params.id); // params are always strings — convert before comparing
    const book = await Book.findByPk(id);

    if (!book) {
      return response.sendStatus(404);
    }

    response.json(book);
  } catch (error) {
    next(error);
  }
});

// POST a new book
// Book.create() inserts a new row and returns the created instance with its new id.
// The database assigns the id automatically — there's no more nextId counter.
app.post("/api/books", async (request, response, next) => {
  try {
    const book = await Book.create(request.body);
    response.status(201).json(book);
  } catch (error) {
    next(error);
  }
});

// PATCH an existing book
// Find the row first, then call .update() on the instance.
// .update() merges only the fields that were sent — same partial-update behavior
// as Object.assign(), but written to the database.
app.patch("/api/books/:id", async (request, response, next) => {
  try {
    const id = Number(request.params.id);
    const book = await Book.findByPk(id);

    if (!book) {
      return response.sendStatus(404);
    }

    await book.update(request.body);
    response.json(book);
  } catch (error) {
    next(error);
  }
});

// DELETE a book
// Find the row first, then call .destroy() on the instance to remove it.
app.delete("/api/books/:id", async (request, response, next) => {
  try {
    const id = Number(request.params.id);
    const book = await Book.findByPk(id);

    if (!book) {
      return response.sendStatus(404);
    }

    await book.destroy();
    response.sendStatus(204); // 204 No Content — no body on a successful delete
  } catch (error) {
    next(error);
  }
});

// error-handling middleware -------------------------
// Express recognizes this as an error handler because it has 4 parameters (error first).
// Any route that calls next(error) ends up here.
app.use((error, request, response, next) => {
  console.error(error);
  response.sendStatus(500);
});

// app server ------------------------------------------
async function startApp() {
  // db.sync() compares the Book model to the actual database and creates the
  // Books table if it doesn't exist yet. We await it before calling app.listen()
  // so no request can arrive before the table is ready.
  await db.sync();
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}

startApp();*/