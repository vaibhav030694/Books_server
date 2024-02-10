const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const app = express();
app.use(bodyParser.json());
 app.use(cors());
//app.use(cors({ origin: 'http://localhost:4200' })); // Allow requests only from this origin

const User = require('./models/user');
const Book = require('./models/book');
const userList = require('./models/userlist');
// const userlist = require('./models/userlist');

mongoose.connect('mongodb+srv://neutrontiwari:Abcd1234@clustervaibhav.t7k7ibv.mongodb.net/?retryWrites=true&w=majority', { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
        console.log('Connected to MongoDB');
    })
    .catch(err => {
        console.error('Error connecting to MongoDB', err);
    });

// Authentication middleware
const authenticateUser = async (req, res, next) => {
    try {
        const token = req.headers.authorization.split(' ')[1];
        const decoded = jwt.verify(token, 'secretkey');
        const user = await User.findById(decoded.userId);
        if (!user) {
            throw new Error();
        }
        req.user = user;
        next();
    } catch (error) {
        res.status(401).json({ message: 'Authentication failed' });
    }
};

// Routes
app.post('/api/register', async (req, res) => {
    try {
        const { name, email, phone, password } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = new User({ name, email, phone, password: hashedPassword });
        await user.save();
        res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Failed to register user' });
    }
});

app.post('/api/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user) {
            throw new Error();
        }
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            throw new Error();
        }
        const token = jwt.sign({ userId: user._id }, 'secretkey', { expiresIn: '1h' });
        res.status(200).json({ token });
    } catch (error) {
        res.status(401).json({ message: 'Invalid credentials' });
    }
});

//get list of all books in userlist - added by user
app.get('/api/books/readingListbooks', async (req, res) => {
    try {
        const books = await userList.find();
        res.status(200).json(books);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch reading list books' });
    }
});

//get list of all books on initital load
app.get('/api/books/getAllBooks', async (req, res) => {
    try {
        const books = await Book.find();
        res.status(200).json(books);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch books' });
    }
});

app.post('/api/books/addBookToUserlist', async (req, res) => {
    try {
        const isbn = req.body.ISBN;
        // Find the book by its ISBN
        // console.log(isbn);
        const book = await Book.findOne({ ISBN: isbn });
        // console.log(book);
        if (!book) return res.status(404).send('Book not found');
        const userlist = new userList({
            ISBN: book.ISBN,
            name: book.name,
            author: book.author,
            status: book.status
        });
        await userlist.save();
        updatedObject = {isadded: '1'};
        // const book = await userList.findOne({ ISBN: req.params.isbn});
        await Book.findByIdAndUpdate(book._id.toString(), {$set: updatedObject});
        //book.status = 'in progress';
        //await book.save();
        res.send('Book moved to list successfully');
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});

//delete books from userlist
app.delete('/api/books/removeBookFormUserList/:id', async (req, res) => {
   
    try {
        const book = await userList.findOne({ ISBN: req.params.id });
        await userList.findByIdAndDelete(book._id.toString());
        updatedObject = {isadded: '0'};
        await Book.findByIdAndUpdate(book._id.toString(), {$set: updatedObject});
        res.status(200).json({ message: 'Book deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Failed to delete book' });
    }
});

//update the status of books in userlist
app.patch('/api/books/updateStatus/:isbn', async (req, res) => {
    try {
        const updatedStatus = req.body.status;
        updatedObject = {status: updatedStatus}
        const book = await userList.findOne({ ISBN: req.params.isbn});
        await userList.findByIdAndUpdate(book._id.toString(), {$set: updatedObject});
        res.status(200).json({ message: 'Book updated successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Failed to update book' });
    }
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
