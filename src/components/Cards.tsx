import { useEffect, useState } from 'react';
import '../styles/cards.css';
import closedBook from '../images/closedbook.png';
import openBook from '../images/openbook.png';
import stackedBooks from '../images/stackedbooks.png';
import { Book, months, Status } from '../utils';
import { useBookContext } from './Context';
import Tags from './Tags';

const Cards = () => {
	const { setDateCount, books, setBooks, setYears, authors, setAuthors } =
		useBookContext();

	const currentYear = new Date().getFullYear();
	const [title, setTitle] = useState<string>('');
	const [author, setAuthor] = useState('');
	const [completedTitle, setCompletedTitle] = useState<string>('');
	const [completedAuthor, setCompletedAuthor] = useState('');
	const [selectedOption, setSelectedOption] = useState<string>('');
	const [year, setYear] = useState<number>(currentYear);
	const [showTitleValidation, setShowTitleValidation] = useState(false);
	const [showAuthorValidation, setShowAuthorValidation] = useState(false);
	const [showCompletedTitleValidation, setShowCompletedTitleValidation] =
		useState(false);
	const [showCompletedAuthorValidation, setShowCompletedAuthorValidation] =
		useState(false);

	useEffect(() => {
		if (authors.length > 0) {
			localStorage.setItem('authors', JSON.stringify(authors));
		}
	}, [authors]);

	const incrementYear = () => setYear((year) => year + 1);
	const decrementYear = () =>
		setYear((year) => (year > currentYear ? currentYear - 1 : year - 1));

	const addBook = (status: Status) => {
		let isValid = true;
		if (!title) {
			setShowTitleValidation(true);
			isValid = false;
		}
		if (!author) {
			setShowAuthorValidation(true);
			isValid = false;
		}

		if (!isValid) return;

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
		let isValid = true;
		if (!completedTitle) {
			setShowCompletedTitleValidation(true);
			isValid = false;
		}
		if (!completedAuthor) {
			setShowCompletedAuthorValidation(true);
			isValid = false;
		}

		if (!isValid) return;

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

	const handleDropdown = (event: React.ChangeEvent<HTMLSelectElement>) => {
		setSelectedOption(event.target.value);
	};

	return (
		<div className='book-cards'>
			<div className='book-card'>
				<input
					className={showTitleValidation ? 'input-error' : 'book-input'}
					type='text'
					value={title}
					onChange={(event) => setTitle(event.target.value)}
					onClick={() => setShowTitleValidation(false)}
					placeholder='Enter a book'
				/>
				{showTitleValidation && (
					<div className='validation-popup'>📚 Please enter a book title!</div>
				)}
				<input
					className={showAuthorValidation ? 'input-error' : 'book-input'}
					type='text'
					value={author}
					onChange={(event) => setAuthor(event.target.value)}
					onClick={() => setShowAuthorValidation(false)}
					placeholder='Enter the author'
				/>
				{showAuthorValidation && (
					<div className='validation-popup'>👤 Please enter an author!</div>
				)}
				<Tags />
				<button
					id='to-read'
					className='book-input-btn'
					onClick={() => addBook(Status.ToRead)}
				>
					<img className='book-icon' src={closedBook} alt={'closed book'} />+ To
					Read
				</button>
				<button
					id='reading'
					className='book-input-btn'
					onClick={() => addBook(Status.Reading)}
				>
					<img className='book-icon' src={openBook} alt={'open book'} />+
					Reading
				</button>
			</div>
			<div className='book-card'>
				<input
					className={
						showCompletedTitleValidation ? 'input-error' : 'book-input'
					}
					type='text'
					value={completedTitle}
					onChange={(event) => setCompletedTitle(event.target.value)}
					onClick={() => setShowCompletedTitleValidation(false)}
					placeholder='Enter a book you have read'
				/>
				{showCompletedTitleValidation && (
					<div className='validation-popup'>📚 Please enter a book title!</div>
				)}
				<input
					className={
						showCompletedAuthorValidation ? 'input-error' : 'book-input'
					}
					type='text'
					value={completedAuthor}
					onChange={(event) => setCompletedAuthor(event.target.value)}
					onClick={() => setShowCompletedAuthorValidation(false)}
					placeholder='Enter the author'
				/>
				{showCompletedAuthorValidation && (
					<div className='validation-popup'>👤 Please enter an author!</div>
				)}
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
						<button className='decrement-year-btn' onClick={decrementYear}>
							–
						</button>
						<input
							className='year-input'
							type='text'
							inputMode='numeric'
							value={year > currentYear ? currentYear : year}
							onChange={(event) => {
								if (/^\d*$/.test(event.target.value)) {
									setYear(Number(event.target.value));
								}
							}}
						/>
						<button className='increment-year-btn' onClick={incrementYear}>
							+
						</button>
					</div>
				</div>
				<button
					id='completed'
					className='book-input-btn'
					onClick={addCompletedBook}
				>
					<img
						className='book-icon'
						src={stackedBooks}
						alt={'stack of books'}
					/>
					+ Completed
				</button>
			</div>
		</div>
	);
};

export default Cards;
