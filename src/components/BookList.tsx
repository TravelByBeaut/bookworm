import React, { useState, useEffect } from 'react';
import bin from '../images/bin.png';
import closedBook from '../images/closedbook.png';
import openBook from '../images/openbook.png';
import stackedBooks from '../images/stackedbooks.png';
import '../styles/bookList.css';
import { Book, DateCountByYear, months, Status } from '../App';

interface Props {
	dateCount: DateCountByYear;
	setDateCount: React.Dispatch<React.SetStateAction<DateCountByYear>>;
	books: Book[];
	setBooks: React.Dispatch<React.SetStateAction<Book[]>>;
	years: number[];
	setYears: React.Dispatch<React.SetStateAction<number[]>>;
	authors: string[];
	setAuthors: React.Dispatch<React.SetStateAction<string[]>>;
}

const BookList: React.FC<Props> = ({
	dateCount,
	setDateCount,
	books,
	setBooks,
	years,
	setYears,
	authors,
	setAuthors,
}) => {
	const currentYear = new Date().getFullYear();
	const [title, setTitle] = useState<string>('');
	const [author, setAuthor] = useState('');
	const [completedTitle, setCompletedTitle] = useState<string>('');
	const [completedAuthor, setCompletedAuthor] = useState('');
	const [selectedOption, setSelectedOption] = useState<string>('');
	const [year, setYear] = useState<number>(currentYear);
	const [editingId, setEditingId] = useState<null | number>(null);
	const [editedTitle, setEditedTitle] = useState('');
	const [toReadPage, setToReadPage] = useState(0);
	const [readingPage, setReadingPage] = useState(0);
	const [completedPage, setCompletedPage] = useState(0);

	const incrementYear = () => setYear((year) => year + 1);
	const decrementYear = () =>
		setYear((year) => (year > currentYear ? currentYear - 1 : year - 1));

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

	useEffect(() => {
		if (authors.length > 0) {
			localStorage.setItem('authors', JSON.stringify(authors));
		}
	}, [authors]);

	const addBook = (status: Status) => {
		const date = new Date();
		const newBook: Book = {
			id: date.getMilliseconds(),
			title,
			author,
			status: status,
			month: date.getMonth(),
			year: date.getFullYear(),
		};
		setBooks([...books, newBook]);
		setTitle('');
		setAuthor('');
		setYears((prevYears) => {
			if (!prevYears.includes(newBook.year)) {
				return [...prevYears, newBook.year];
			}
			return prevYears;
		});
	};

	const addCompletedBook = () => {
		const date = new Date();
		const newBook: Book = {
			id: date.getMilliseconds(),
			title: completedTitle,
			author: completedAuthor,
			status: Status.Completed,
			month: months.findIndex((month) => month === selectedOption),
			year,
		};
		addDataToDateCount(newBook);
		setBooks([...books, newBook]);
		setAuthors([...authors, completedAuthor]);
		setCompletedTitle('');
		setCompletedAuthor('');
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
		const newBooks = books.filter((book) => book.id !== id);
		const remainingAuthors = getAuthorsFromBooks(newBooks);
		setBooks(newBooks);
		setAuthors(remainingAuthors);
	};

	const getAuthorsFromBooks = (books: Book[]) => {
		const authorsSet = new Set<string>();
		books.forEach((book) => {
			if (book.author && book.status === Status.Completed) {
				authorsSet.add(book.author);
			}
		});
		return Array.from(authorsSet);
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
				setAuthors([...authors, updatedBook.author]);
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
		return books
			.filter((book) => book.status === status)
			.sort((a, b) => {
				if (a.year !== b.year) return b.year - a.year;
				return b.month - a.month;
			});
	};

	const handleEdit = (id: number, title: string) => {
		setEditingId(id);
		setEditedTitle(title);
	};

	const handleSave = (id: number) => {
		setBooks((prevBooks) =>
			prevBooks.map((book) =>
				book.id === id ? { ...book, title: editedTitle } : book
			)
		);
		setEditingId(null);
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

	const renderIcon = (status: Status) => {
		let icon;
		let altText;

		switch (status) {
			case Status.ToRead:
				icon = closedBook;
				altText = 'closed book';
				break;
			case Status.Reading:
				icon = openBook;
				altText = 'open book';
				break;
			case Status.Completed:
				icon = stackedBooks;
				altText = 'stack of books';
		}

		return <img className='book-icon' src={icon} alt={altText} />;
	};

	const renderColumns = (
		status: Status,
		moveToStatus: Status,
		icon: string
	) => {
		const itemsPerPage = 5;
		const allBooks = filterBooksByStatus(status);
		const currentPage =
			status === Status.ToRead
				? toReadPage
				: status === Status.Reading
				? readingPage
				: completedPage;

		const paginatedBooks = allBooks.slice(0, (currentPage + 1) * itemsPerPage);

		const showMoreOrLess = (symbol: '+' | '-') => {
			if (status === Status.ToRead)
				setToReadPage((prev) => (symbol === '+' ? prev + 1 : prev - 1));
			if (status === Status.Reading)
				setReadingPage((prev) => (symbol === '+' ? prev + 1 : prev - 1));
			if (status === Status.Completed)
				setCompletedPage((prev) => (symbol === '+' ? prev + 1 : prev - 1));
		};

		return (
			<div
				className='column'
				onDragOver={handleDragOver}
				onDrop={(event) => handleDrop(event, status)}
			>
				<h2 className='column-h2'>
					{renderIcon(status)}
					{status === 'to-read'
						? 'Want To Read'
						: `${status.charAt(0).toUpperCase()}${status.slice(1)}`}
				</h2>
				<ul>
					{paginatedBooks.map((book) => (
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
							/>
							{editingId === book.id ? (
								<input
									className='book-title'
									type='text'
									value={editedTitle}
									onChange={(event) => setEditedTitle(event.target.value)}
									onBlur={() => handleSave(book.id)}
									onKeyDown={(event) => {
										if (event.key === 'Enter') handleSave(book.id);
									}}
									autoFocus
								/>
							) : (
								<div
									className='book-title'
									onClick={() => handleEdit(book.id, book.title)}
								>
									{book.title}
								</div>
							)}
							<button
								className='book-icon-btn'
								onClick={() => changeStatus(book.id, moveToStatus)}
							>
								<img
									className='book-icon-btn-image'
									src={icon}
									alt='book icon'
								/>
							</button>
						</li>
					))}
				</ul>
				{currentPage > 0 && (
					<button onClick={() => showMoreOrLess('-')} className='show-less-btn'>
						Show Less
					</button>
				)}
				{allBooks.length > paginatedBooks.length && (
					<button onClick={() => showMoreOrLess('+')} className='show-more-btn'>
						Show More
					</button>
				)}
			</div>
		);
	};

	return (
		<div>
			<div className='book-cards'>
				<div className='book-card'>
					<input
						className='book-input'
						type='text'
						value={title}
						onChange={(event) => setTitle(event.target.value)}
						placeholder='Enter a book'
					/>
					<input
						className='book-input'
						type='text'
						value={author}
						onChange={(event) => setAuthor(event.target.value)}
						placeholder='Enter the author'
					/>
					<button
						id='to-read'
						className='book-input-btn'
						onClick={() => addBook(Status.ToRead)}
					>
						{renderIcon(Status.ToRead)} + Want To Read
					</button>
					<button
						id='reading'
						className='book-input-btn'
						onClick={() => addBook(Status.Reading)}
					>
						{renderIcon(Status.Reading)}+ Reading
					</button>
				</div>
				<div className='book-card'>
					<input
						className='book-input'
						type='text'
						value={completedTitle}
						onChange={(event) => setCompletedTitle(event.target.value)}
						placeholder='Enter a book you have read'
					/>
					<input
						className='book-input'
						type='text'
						value={completedAuthor}
						onChange={(event) => setCompletedAuthor(event.target.value)}
						placeholder='Enter the author'
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
								type='text'
								inputMode='numeric'
								value={year > currentYear ? currentYear : year}
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
						onClick={addCompletedBook}
					>
						{renderIcon(Status.Completed)}+ Completed
					</button>
				</div>
			</div>
			<div className='reading-columns'>
				{renderColumns(Status.ToRead, Status.Reading, openBook)}
				{renderColumns(Status.Reading, Status.Completed, stackedBooks)}
				{renderColumns(Status.Completed, Status.Reading, openBook)}
			</div>
		</div>
	);
};

export default BookList;
