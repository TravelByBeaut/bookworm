import { Book, DateCountByYear, months, Status } from '../utils';
import closedBook from '../images/closedbook.png';
import openBook from '../images/openbook.png';
import stackedBooks from '../images/stackedbooks.png';
import bin from '../images/bin.png';
import '../styles/columns.css';
import { useState } from 'react';
import { useBookContext } from './Context';

const Columns: React.FC = () => {
	const { setDateCount, books, setBooks, setYears, authors, setAuthors } =
		useBookContext();
	const [toReadPage, setToReadPage] = useState(0);
	const [readingPage, setReadingPage] = useState(0);
	const [completedPage, setCompletedPage] = useState(0);
	const [editingId, setEditingId] = useState<null | number>(null);
	const [editedTitle, setEditedTitle] = useState('');
	const itemsPerPage = 5;

	const deleteBook = (id: number) => {
		const bookToDelete = books.find((book) => book.id === id);
		if (bookToDelete) {
			setDateCount((prevData) => {
				const { year, month } = bookToDelete;
				const updatedData = { ...prevData };

				if (bookToDelete.status === Status.Completed) {
					if (!updatedData[year]) return {};
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

		const hasCompletedBooks = newBooks.some(
			(book) => book.status === Status.Completed
		);

		if (!hasCompletedBooks) {
			localStorage.clear();
		}
	};

	const deleteDataIfEmpty = (data: DateCountByYear, year: number) => {
		const yearData = data[year];

		if (!yearData) return;

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

	const getAuthorsFromBooks = (books: Book[]) => {
		const authorsSet = new Set<string>();
		books.forEach((book) => {
			if (book.status === Status.Completed) {
				authorsSet.add(book.author);
			}
		});
		return Array.from(authorsSet);
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
						? 'To Read'
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
				{currentPage > 0 && allBooks.length > itemsPerPage && (
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
		<div className='reading-columns'>
			{renderColumns(Status.ToRead, Status.Reading, openBook)}
			{renderColumns(Status.Reading, Status.Completed, stackedBooks)}
			{renderColumns(Status.Completed, Status.Reading, openBook)}
		</div>
	);
};

export default Columns;
