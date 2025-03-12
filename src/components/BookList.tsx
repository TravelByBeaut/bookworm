import React, { useState, useEffect } from 'react';
import bin from '../images/bin.png';
import '../styles/bookList.css';
import { Book, DateCountByYear, months, Status } from '../App';

interface DateCountProps {
	dateCount: DateCountByYear;
	setDateCount: React.Dispatch<React.SetStateAction<DateCountByYear>>;
	books: Book[];
	setBooks: React.Dispatch<React.SetStateAction<Book[]>>;
	years: number[];
	setYears: React.Dispatch<React.SetStateAction<number[]>>;
}

const BookList: React.FC<DateCountProps> = ({
	dateCount,
	setDateCount,
	books,
	setBooks,
	years,
	setYears,
}) => {
	const [title, setTitle] = useState<string>('');
	const [readTitle, setReadTitle] = useState<string>('');
	const [selectedOption, setSelectedOption] = useState<string>('');
	const [year, setYear] = useState<number>(new Date().getFullYear());

	const incrementYear = () => setYear((year) => year + 1);
	const decrementYear = () => setYear((year) => year - 1);

	useEffect(() => {
		const storedBooks = localStorage.getItem('books');
		const storedDateCount = localStorage.getItem('dateCount');
		if (storedBooks) {
			setBooks(JSON.parse(storedBooks));
		}
		if (storedDateCount) {
			setDateCount(JSON.parse(storedDateCount));
		}
	}, [setDateCount, setBooks]);

	useEffect(() => {
		if (books.length > 0) {
			localStorage.setItem('books', JSON.stringify(books));
		}
	}, [books]);

	useEffect(() => {
		if (dateCount) {
			localStorage.setItem('dateCount', JSON.stringify(dateCount));
		}
	}, [dateCount]);

	useEffect(() => {
		if (years) {
			localStorage.setItem('years', JSON.stringify(years));
		}
	}, [years]);

	const addDataToDateCount = (book: Book) => {
		setDateCount((prevData) => {
			const { year, month } = book;
			const newYear = prevData[year] ? { ...prevData[year] } : {};
			const newMonth = newYear[month]
				? { ...newYear[month] }
				: { month: months[month], count: 0 };

			return {
				...prevData,
				[year]: {
					...newYear,
					[month]: {
						...newMonth,
						count: newMonth.count + 1,
					},
				},
			};
		});
	};

	const addBook = () => {
		const date = new Date();
		const newBook: Book = {
			id: date.getMilliseconds(),
			title,
			status: Status.ToRead,
			month: date.getMonth(),
			year: date.getFullYear(),
		};
		setBooks([...books, newBook]);
		setTitle('');
		setYears((prevYears) => {
			if (!prevYears.includes(newBook.year)) {
				return [...prevYears, newBook.year];
			}
			return prevYears;
		});
	};

	const addReadBook = () => {
		const date = new Date();
		const newBook: Book = {
			id: date.getMilliseconds(),
			title: readTitle,
			status: Status.Read,
			month: months.findIndex((month) => month === selectedOption),
			year,
		};
		addDataToDateCount(newBook);
		setBooks([...books, newBook]);
		setReadTitle('');
		setYears((prevYears) => {
			if (!prevYears.includes(year)) {
				return [...prevYears, year];
			}
			return prevYears;
		});
	};

	const deleteDataIfEmpty = (data: DateCountByYear, year: number) => {
		const yearData = data[year];

		for (const month in yearData) {
			if (yearData[month].count === 0) {
				delete yearData[month];
			}
		}
		if (Object.keys(yearData).length === 0) {
			delete data[year];
		}
	};

	const deleteBook = (id: number) => {
		const bookToDelete = books.find((book) => book.id === id);
		if (bookToDelete) {
			setDateCount((prevData) => {
				const { year, month } = bookToDelete;
				const updatedData = { ...prevData };

				if (bookToDelete.status === Status.Read) {
					updatedData[year] = { ...updatedData[year] };
					updatedData[year][month] = {
						...updatedData[year][month],
						count: updatedData[year][month].count - 1,
					};
				}
				deleteDataIfEmpty(updatedData, year);

				return updatedData;
			});
		}

		setBooks(books.filter((book) => book.id !== id));
	};

	const changeStatus = (id: number, newStatus: Status) => {
		let oldStatus = '';
		setBooks(
			books.map((book) => {
				if (book.id === id) {
					oldStatus += book.status;
					return { ...book, status: newStatus };
				}
				return book;
			})
		);

		const updatedBook = books.find((book) => book.id === id);
		if (updatedBook) {
			if (newStatus === Status.Read && oldStatus !== Status.Read) {
				addDataToDateCount(updatedBook);
			}
			if (oldStatus === Status.Read && newStatus === Status.Read) {
				return;
			}
			if (oldStatus === Status.Read && newStatus !== Status.Read) {
				const { year, month } = updatedBook;
				setDateCount((prevData) => {
					const updatedData = { ...prevData };
					updatedData[year] = { ...updatedData[year] };
					updatedData[year][month] = {
						...updatedData[year][month],
						count: updatedData[year][month].count - 1,
					};
					deleteDataIfEmpty(updatedData, year);
					return updatedData;
				});
			}
		}
	};

	const handleDrop = (e: React.DragEvent, newStatus: Status) => {
		const id = e.dataTransfer.getData('bookId');
		changeStatus(parseInt(id), newStatus);
	};

	const filterBooksByStatus = (status: Status) => {
		return books.filter((book) => book.status === status);
	};

	const handleDragOver = (e: React.DragEvent) => e.preventDefault();

	const handleDragStart = (e: React.DragEvent, bookId: number) => {
		e.dataTransfer.setData('bookId', bookId.toString());
	};

	const handleDropdown = (event: React.ChangeEvent<HTMLSelectElement>) => {
		setSelectedOption(event.target.value);
	};

	return (
		<div className='booklist'>
			<div className='book-input'>
				<input
					type='text'
					value={title}
					onChange={(e) => setTitle(e.target.value)}
					placeholder='Enter a book'
				/>
				<button onClick={addBook}>+</button>
			</div>
			<div className='book-input'>
				<input
					type='text'
					value={readTitle}
					onChange={(e) => setReadTitle(e.target.value)}
					placeholder='Enter a book you have read'
				/>
				<select value={selectedOption} onChange={handleDropdown}>
					<option value=''>--Select a month--</option>
					{months.map((month, index) => (
						<option key={index} value={month}>
							{month}
						</option>
					))}
				</select>
				<div className='year-input-container'>
					<button className='year-btn' onClick={decrementYear}>
						–
					</button>
					<input
						className='year-input'
						type='number'
						value={year}
						min={1901}
						onChange={(e) => setYear(Number(e.target.value))}
					/>
					<button className='year-btn' onClick={incrementYear}>
						+
					</button>
				</div>
				<button className='add-btn' onClick={addReadBook}>
					+
				</button>
			</div>

			<div className='reading-columns'>
				<div
					className='column'
					onDragOver={handleDragOver}
					onDrop={(e) => handleDrop(e, Status.ToRead)}
				>
					<h2>Want to Read</h2>
					<ul>
						{filterBooksByStatus(Status.ToRead).map((book) => (
							<li
								key={book.id}
								draggable
								onDragStart={(e) => handleDragStart(e, book.id)}
							>
								<img
									src={bin}
									alt='bin'
									className='delete-btn'
									onClick={() => deleteBook(book.id)}
								></img>
								{book.title}
								<button
									className='arrow-btn'
									onClick={() => changeStatus(book.id, Status.Reading)}
								>
									→
								</button>
							</li>
						))}
					</ul>
				</div>

				<div
					className='column'
					onDragOver={handleDragOver}
					onDrop={(e) => handleDrop(e, Status.Reading)}
				>
					<h2>Reading</h2>
					<ul>
						{filterBooksByStatus(Status.Reading).map((book) => (
							<li
								key={book.id}
								draggable
								onDragStart={(e) => handleDragStart(e, book.id)}
							>
								<img
									src={bin}
									alt='bin'
									className='delete-btn'
									onClick={() => deleteBook(book.id)}
								></img>
								{book.title}
								<button
									className='tick-btn'
									onClick={() => changeStatus(book.id, Status.Read)}
								>
									✔
								</button>
							</li>
						))}
					</ul>
				</div>

				<div
					className='column'
					onDragOver={handleDragOver}
					onDrop={(e) => handleDrop(e, Status.Read)}
				>
					<h2>Read</h2>
					<ul>
						{filterBooksByStatus(Status.Read).map((book) => (
							<li
								key={book.id}
								draggable
								onDragStart={(e) => handleDragStart(e, book.id)}
							>
								<button
									className='arrow-btn'
									onClick={() => changeStatus(book.id, Status.Reading)}
								>
									←
								</button>
								{book.title}
								<img
									src={bin}
									alt='bin'
									className='delete-btn'
									onClick={() => deleteBook(book.id)}
								></img>
							</li>
						))}
					</ul>
				</div>
			</div>
		</div>
	);
};

export default BookList;
