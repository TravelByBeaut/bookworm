import React, { useState, useEffect } from 'react';
import bin from '../images/bin.png';
import '../styles/bookList.css';
import { Bar } from 'react-chartjs-2';
import {
	Chart as ChartJS,
	CategoryScale,
	LinearScale,
	BarElement,
	Title,
	Tooltip,
	Legend,
} from 'chart.js';

ChartJS.register(
	CategoryScale,
	LinearScale,
	BarElement,
	Title,
	Tooltip,
	Legend
);

export enum Status {
	ToRead = 'to-read',
	Reading = 'reading',
	Read = 'read',
}
interface Book {
	id: number;
	title: string;
	status: Status;
	month: number;
}

interface DateCount {
	month: string;
	count: number;
}

interface DateCountProps {
	dateCount: { [key: number]: DateCount };
	setDateCount: React.Dispatch<
		React.SetStateAction<{ [key: string]: DateCount }>
	>;
}

const months = [
	'January',
	'February',
	'March',
	'April',
	'May',
	'June',
	'July',
	'August',
	'September',
	'October',
	'November',
	'December',
];

const BookList: React.FC<DateCountProps> = ({ dateCount, setDateCount }) => {
	const [title, setTitle] = useState<string>('');
	const [readTitle, setReadTitle] = useState<string>('');
	const [books, setBooks] = useState<Book[]>([]);
	const [selectedOption, setSelectedOption] = useState<string>('');

	useEffect(() => {
		const storedBooks = localStorage.getItem('books');
		const storedDateCount = localStorage.getItem('dateCount');
		if (storedBooks) {
			setBooks(JSON.parse(storedBooks));
		}
		if (storedDateCount) {
			console.log('Loaded dateCount from localStorage', storedDateCount);
			setDateCount(JSON.parse(storedDateCount));
		}
	}, []);

	useEffect(() => {
		if (books.length > 0) {
			localStorage.setItem('books', JSON.stringify(books));
		}
	}, [books]);

	useEffect(() => {
		if (dateCount) {
			console.log('Saving dateCount to localStorage', dateCount);
			localStorage.setItem('dateCount', JSON.stringify(dateCount));
		}
	}, [dateCount]);

	const addBook = () => {
		const date = new Date();
		const newBook: Book = {
			id: date.getMilliseconds(),
			title,
			status: Status.ToRead,
			month: date.getMonth(),
		};
		setBooks([...books, newBook]);
		setTitle('');
	};

	const addReadBook = () => {
		const date = new Date();
		const newBook: Book = {
			id: date.getMilliseconds(),
			title: readTitle,
			status: Status.Read,
			month: months.findIndex((month) => month === selectedOption),
		};
		setDateCount((prevData) => {
			prevData[newBook.month].count += 1;
			return prevData;
		});
		setBooks([...books, newBook]);
		setReadTitle('');
	};

	const deleteBook = (id: number) => {
		const bookToDelete = books.find((book) => book.id === id);
		if (bookToDelete) {
			setDateCount((prevData) => {
				if (bookToDelete.status === Status.Read) {
					prevData[bookToDelete.month].count -= 1;
				}
				return prevData;
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
			setDateCount((prevData) => {
				if (newStatus === Status.Read && oldStatus !== Status.Read) {
					prevData[updatedBook.month].count += 1;
				} else if (oldStatus === Status.Read && newStatus === Status.Read) {
					return prevData;
				} else if (oldStatus === Status.Read) {
					prevData[updatedBook.month].count -= 1;
				}
				return prevData;
			});
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

	const chartData = {
		labels: Object.values(dateCount).map((monthData) => monthData.month),
		datasets: [
			{
				label: 'Books Read Count',
				data: Object.values(dateCount).map((monthData) => monthData.count),
				backgroundColor: 'rgb(94, 51, 51)',
			},
		],
	};

	const chartOptions = {
		responsive: true,
		plugins: {
			legend: {
				labels: {
					color: 'rgb(250, 250, 250)',
				},
			},
		},
		scales: {
			x: {
				ticks: {
					color: 'white',
				},
			},
			y: {
				ticks: {
					color: 'white',
				},
			},
		},
	};

	return (
		<div className='bookList'>
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
				<button onClick={addReadBook}>+</button>
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
			<Bar data={chartData} options={chartOptions} />
		</div>
	);
};

export default BookList;
