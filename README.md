# Books_server

Books_server is a simple RESTful API server built with Node.js and Express.js to manage a collection of books.

## Features

- **CRUD Operations:** Perform CRUD (Create, Read, Update, Delete) operations on the book collection.
- **MongoDB Integration:** Utilizes MongoDB as the database to store book data.
- **Validation:** Input data is validated to ensure consistency and integrity.
- **Express.js Middleware:** Utilizes Express.js middleware for routing and handling requests.
- **Error Handling:** Provides error handling for various scenarios.

## Requirements

- Node.js
- npm
- git
- MongoDB

## Setting up the project directory for frontend and server using bash script 

1. Download setup.sh or copy the contents and create a file in your local directory.
2. make the file executable using the following command:

```
chmod +x setup.sh
```

3. You can then run the script by executing the following command in your terminal.

```
./setup.sh
```

4. This will clone both repositories, install dependencies, and start the Angular frontend and Node.js server
   
## Setting up Server manually - Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/vaibhav030694/Books_server.git
   ```

2. Navigate to the project directory:

```bash
cd Books_server
```
3. Install dependencies:

```
npm install
```

4. Start the server:

```bash
node server.js
```

## Usage
- POST /api/register : Register a new user. 
- POST /api/login : Login to the application using email and password.
- GET /api/books/getAllBooks/:emailId : Retrieve all books.
- GET /api/books/readingListbooks/:emailId : Retrieve a specific book by userID.
- POST /api/books/addBookToUserlist/:emailId : Add a book from all books to reading list for logged in user.
- DELETE /api/books/removeBookFormUserList/:emailId/:isbn :  Delete a book from reading list for logged in user.
- PATCH /api/books/updateStatus/:isbn : Update status of a book in reading list for logged in user.
- GET /api/books/booksStatusData/:emailId : Returns count of the status of books in users reading list

## Schema information 
- **bookSchema:**

This schema defines the structure of documents in the "Book" collection.
It includes fields for ISBN (International Standard Book Number), name, author, status, and isadded.
ISBN, name, and author fields are of type String and are required.
Status field is of type String and has an enum constraint, meaning it can only have values from the specified list ('in progress', 'completed', 'unread'). It has a default value of 'unread'.
isadded field is of type String and has a default value of '0'.

- **userSchema:**

This schema defines the structure of documents in the "User" collection.
It includes fields for name, email, phone, and password.
Name, email, phone, and password fields are of type String and are required.
Email field has a unique constraint, ensuring each email address is unique within the collection.

- **userListSchema:**

This schema defines the structure of documents in the "userList" collection.
It includes fields for user, book, and status.
User and book fields are references to documents in the "User" and "Book" collections, respectively. They are of type mongoose.Schema.Types.ObjectId.
Status field is of type String and has an enum constraint with values ('in progress', 'completed', 'unread'). It has a default value of 'unread'.
