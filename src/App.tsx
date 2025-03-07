import React, { useState, useEffect } from 'react';
import './App.css';
import bin from './images/binn.png'
import Header from './components/Header';

export enum Status {
  ToRead = "to-read",
  Reading = "reading",
  Read = "read"
}
interface BooksRead {
  id: number;
  title: string;
  status: Status;
}

const App: React.FC = () => {
  const [title, setTitle] = useState<string>('');
  const [booksRead, setBooksRead] = useState<BooksRead[]>([]);

  // Load booksRead from localStorage when the component mounts
  useEffect(() => {
    const storedBooks = localStorage.getItem('booksRead');
    if (storedBooks) {
      setBooksRead(JSON.parse(storedBooks));
    }
  }, []);

  useEffect(() => {
    if (booksRead.length > 0) {
      localStorage.setItem('booksRead', JSON.stringify(booksRead));
    }
  }, [booksRead]);

  const addBook = () => {
    const newBook: BooksRead = {
      id: Date.now(),
      title,
      status: Status.ToRead,
    };
    setBooksRead([...booksRead, newBook]);
    setTitle(''); // Clear the input field after adding the book
  };

  const deleteBook = (id: number) => {
    setBooksRead(booksRead.filter((booksRead) => booksRead.id !== id));
  };

  const changeStatus = (id: number, newStatus: Status) => {
    setBooksRead(
      booksRead.map((book) =>
        book.id === id ? { ...book, status: newStatus } : book
      )
    );
  };

  const filterBooksByStatus = (status: Status) => {
    return booksRead.filter((book) => book.status === status);
  };

  const handleDrop = (e: React.DragEvent, newStatus: Status) => {
    const id = e.dataTransfer.getData("bookId");
    const updatedBooks = booksRead.map((book) =>
      book.id.toString() === id ? { ...book, status: newStatus } : book
    );
    setBooksRead(updatedBooks);
  };

  const handleDragOver = (e: React.DragEvent) => e.preventDefault()

  const handleDragStart = (e: React.DragEvent, bookId: number) => {
    e.dataTransfer.setData("bookId", bookId.toString());
  };

  return (
    <div className="App">
      <Header/>
      <div className="book-input">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Enter a book"
        />
        <button onClick={addBook}>+</button>
      </div>

      <div className="reading-columns">
        <div className="column" onDragOver={handleDragOver} onDrop={(e) => handleDrop(e, Status.ToRead)}>
          <h2>Want to Read</h2>
          <ul>
            {filterBooksByStatus(Status.ToRead).map((book) => (
              <li key={book.id} draggable onDragStart={(e) => handleDragStart(e, book.id)}>
                <img src={bin} alt='bin' className="delete-btn" onClick={() => deleteBook(book.id)}></img>
                {book.title}
                <button className='arrow-btn' onClick={() => changeStatus(book.id, Status.Reading)}>→</button>
              </li>
            ))}
          </ul>
        </div>

        <div className="column" onDragOver={handleDragOver} onDrop={(e) => handleDrop(e, Status.Reading)}>
          <h2>Reading</h2>
          <ul>
            {filterBooksByStatus(Status.Reading).map((book) => (
              <li key={book.id} draggable onDragStart={(e) => handleDragStart(e, book.id)}>
                <img src={bin} alt='bin' className="delete-btn" onClick={() => deleteBook(book.id)}></img>
                {book.title}
                <button className='tick-btn' onClick={() => changeStatus(book.id, Status.Read)}>✔</button>
              </li>
            ))}
          </ul>
        </div>

        <div className="column" onDragOver={handleDragOver} onDrop={(e) => handleDrop(e, Status.Read)}>
          <h2>Read</h2>
          <ul>
            {filterBooksByStatus(Status.Read).map((book) => (
              <li key={book.id} draggable onDragStart={(e) => handleDragStart(e, book.id)}>
                <button className='arrow-btn' onClick={() => changeStatus(book.id, Status.Reading)}>←</button>
                {book.title}
                <img src={bin} alt='bin' className="delete-btn" onClick={() => deleteBook(book.id)}></img>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default App;
