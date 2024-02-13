const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const app = express();
const connectDB = require('./db');
app.use(bodyParser.json());
//  app.use(cors());
app.use(cors({ origin: 'http://localhost:4200' })); // Allow requests only from this origin

const User = require('./models/user');
const Book = require('./models/book');
const userList = require('./models/userlist');

connectDB();

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


app.post('/api/register', async (req, res) => {
    try {
        const hashedPassword = await bcrypt.hash(req.body.password, 10);
        const user = new User({ name:req.body.name, email:req.body.email, phone: req.body.phone, password: hashedPassword });
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

//get list of all books on initital load
app.get('/api/books/getAllBooks/:emailId',authenticateUser, async (req, res) => {
    try {
        const books = await Book.find();
        userOBj = await User.findOne({email: req.params.emailId});
        userObjId = userOBj._id;
        const userReadingList = await userList.find({ user: userOBj._id });
        const returnBookList = []
        let isFound = 'false';
        books.forEach(book=>{
            isFound = 'false';
            userReadingList.forEach(readingbook =>{
                if(readingbook.book.toString() == book._id.toString()){
                    isFound = 'true'
                    returnBookList.push({
                        ISBN:book.ISBN,
                        name:book.name,
                        author:book.author,
                        status:book.status,
                        isadded:'yes'
                    });
                }   
            });
            if(isFound == 'false'){
                returnBookList.push({
                    ISBN:book.ISBN,
                    name:book.name,
                    author:book.author,
                    status:book.status,
                    isadded:'no'
                });
            }
            });
        res.status(200).json(returnBookList);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch books' });
    }
});

//get list of all books in userlist - added by user
app.get('/api/books/readingListbooks/:emailId',authenticateUser, async (req, res) => {
    try {
        userOBj = await User.findOne({email: req.params.emailId});
        const userReadingList = await userList.find({ user: userOBj._id });
        const bookPromises = userReadingList.map(async userListObj =>{
            const book = await Book.findById(userListObj.book.toString());
            book.status = userListObj.status;
            return book;
        })
        const booksListForUser = await Promise.all(bookPromises);
        res.status(200).json(booksListForUser);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

app.post('/api/books/addBookToUserlist/:emailId',authenticateUser, async (req, res) => {
    try {
        const isbn = req.body.ISBN;
        userOBj = await User.findOne({email: req.params.emailId});
        userObjId = userOBj._id;
        const book = await Book.findOne({ ISBN: isbn });
        if (!book) return res.status(404).send('Book not found');
        const userlist = new userList({
            book:book._id,
            status: 'unread',
            user: userObjId
        });
        await userlist.save();
        res.status(200).json({message:'Book moved to list successfully'});
    } catch (error) {
        console.error(error);
        res.status(500).json({message:'Internal Server Error'});
    }
});

//delete books from userlist
app.delete('/api/books/removeBookFormUserList/:emailId/:isbn',authenticateUser, async (req, res) => {
   
    try {
        userOBj = await User.findOne({email: req.params.emailId});
        bookOBj = await Book.findOne({ISBN: req.params.isbn});
        const book = await userList.findOne({ book: bookOBj._id}, {user: userOBj._id});
        await userList.findOneAndDelete({ user: userOBj._id, book: bookOBj._id });
        res.status(200).json({ message: 'Book deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Failed to delete book' });
    }
});

//update the status of books in userlist
app.patch('/api/books/updateStatus/:isbn',authenticateUser, async (req, res) => {
    try {
        const updatedStatus = req.body.status;
        const emailId = req.body.emailId;
        userOBj = await User.findOne({email: emailId});
        bookOBj = await Book.findOne({ISBN: req.params.isbn});
        updatedObject = {status: updatedStatus}
        const book = await userList.findOne({book: bookOBj._id,user: userOBj._id});
        await userList.findByIdAndUpdate(book._id.toString(), {$set: updatedObject});
        res.status(200).json({ message: 'Book updated successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Failed to update book' });
    }
});

// fetch book status data
app.get('/api/books/booksStatusData/:emailId',authenticateUser, async (req, res) => {
    try {
        userOBj = await User.findOne({email: req.params.emailId});      
        userObjId = userOBj._id;
      const unreadCount = await userList.find({ status: 'unread' , user: userObjId}).count();
      const inProgressCount = await userList.find({ status: 'inProgress' , user: userObjId}).count();
      const finishedCount = await userList.find({ status: 'finished', user: userObjId}).count();
      
      res.status(200).json({ unreadCount, inProgressCount, finishedCount });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
