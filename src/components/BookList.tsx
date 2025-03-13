import React, { useState, useEffect } from 'react';
import bin from '../images/bin.png';
import '../styles/bookList.css';
import { Book, DateCountByYear, months, Status } from '../App';

interface Props {
	dateCount: DateCountByYear;
	setDateCount: React.Dispatch<React.SetStateAction<DateCountByYear>>;
	books: Book[];
	setBooks: React.Dispatch<React.SetStateAction<Book[]>>;
	years: number[];
	setYears: React.Dispatch<React.SetStateAction<number[]>>;
}

const BookList: React.FC<Props> = ({
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
		if (years.length > 0) {
			localStorage.setItem('years', JSON.stringify(years));
		}
	}, [years]);

	const addBook = (status: Status) => {
		const date = new Date();
		const newBook: Book = {
			id: date.getMilliseconds(),
			title,
			status: status,
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
			status: Status.Completed,
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

	const deleteDataIfEmpty = (data: DateCountByYear, year: number) => {
		const yearData = data[year];

		for (const month in yearData) {
			if (yearData[month].count === 0) {
				delete yearData[month];
			}
		}
		if (Object.keys(yearData).length === 0) {
			setYears((prevYears) =>
				prevYears.filter((yearWithData) => yearWithData !== year)
			);
			delete data[year];
		}
	};

	const deleteBook = (id: number) => {
		const bookToDelete = books.find((book) => book.id === id);
		if (bookToDelete) {
			setDateCount((prevData) => {
				const { year, month } = bookToDelete;
				const updatedData = { ...prevData };

				if (bookToDelete.status === Status.Completed) {
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
			if (newStatus === Status.Completed && oldStatus !== Status.Completed) {
				addDataToDateCount(updatedBook);
			}
			if (oldStatus === Status.Completed && newStatus === Status.Completed) {
				return;
			}
			if (oldStatus === Status.Completed && newStatus !== Status.Completed) {
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

	const filterBooksByStatus = (status: Status) => {
		return books.filter((book) => book.status === status);
	};

	const handleDragStart = (event: React.DragEvent, bookId: number) => {
		event.dataTransfer.setData('bookId', bookId.toString());
	};

	const handleDragOver = (event: React.DragEvent) => event.preventDefault();

	const handleDrop = (event: React.DragEvent, newStatus: Status) => {
		const id = event.dataTransfer.getData('bookId');
		changeStatus(parseInt(id), newStatus);
	};

	const handleDropdown = (event: React.ChangeEvent<HTMLSelectElement>) => {
		setSelectedOption(event.target.value);
	};

	const renderColumns = (
		status: Status,
		moveToStatus: Status,
		icon: string
	) => {
		return (
			<div
				className='column'
				onDragOver={handleDragOver}
				onDrop={(event) => handleDrop(event, status)}
			>
				<h2>
					{status === 'to-read'
						? 'Want To Read'
						: `${status.charAt(0).toUpperCase()}${status.slice(1)}`}
				</h2>
				<ul>
					{filterBooksByStatus(status).map((book) => (
						<li
							key={book.id}
							draggable
							onDragStart={(event) => handleDragStart(event, book.id)}
						>
							<img
								src={bin}
								alt='bin'
								className='delete-btn'
								onClick={() => deleteBook(book.id)}
							></img>
							{book.title}
							<button
								className={icon === '✔' ? 'tick-btn' : 'arrow-btn'}
								onClick={() => changeStatus(book.id, moveToStatus)}
							>
								{icon}
							</button>
						</li>
					))}
				</ul>
			</div>
		);
	};

	return (
		<div className='booklist'>
			<div className='book-cards'>
				<div className='book-card'>
					<input
						className='book-input'
						type='text'
						value={title}
						onChange={(event) => setTitle(event.target.value)}
						placeholder='Enter a book'
					/>
					<button
						id='to-read'
						className='book-input-btn'
						onClick={() => addBook(Status.ToRead)}
					>
						+ Want To Read
					</button>
					<button
						id='reading'
						className='book-input-btn'
						onClick={() => addBook(Status.Reading)}
					>
						+ Reading
					</button>
				</div>
				<div className='book-card'>
					<input
						className='book-input'
						type='text'
						value={readTitle}
						onChange={(event) => setReadTitle(event.target.value)}
						placeholder='Enter a book you have read'
					/>
					<div className='month-year-inputs'>
						<div className='dropdown-container'>
							<select value={selectedOption} onChange={handleDropdown}>
								<option value=''>Select month</option>
								{months.map((month, index) => (
									<option key={index} value={month}>
										{month}
									</option>
								))}
							</select>
						</div>
						<div className='year-input-container'>
							<button className='year-btn' onClick={decrementYear}>
								–
							</button>
							<input
								className='year-input'
								type='number'
								value={year}
								min={1901}
								onChange={(event) => setYear(Number(event.target.value))}
							/>
							<button className='year-btn' onClick={incrementYear}>
								+
							</button>
						</div>
					</div>
					<button
						id='completed'
						className='book-input-btn'
						onClick={addReadBook}
					>
						+ Completed
					</button>
				</div>
			</div>
			<div className='reading-columns'>
				{renderColumns(Status.ToRead, Status.Reading, '→')}
				{renderColumns(Status.Reading, Status.Completed, '✔')}
				{renderColumns(Status.Completed, Status.Reading, '←')}
			</div>
		</div>
	);
};

export default BookList;
