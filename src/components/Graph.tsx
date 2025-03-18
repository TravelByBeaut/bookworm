import { useEffect, useState } from 'react';
import { Bar } from 'react-chartjs-2';
import { Book, DateCountByYear, months, Status, YearlyDateCount } from '../App';
import '../styles/graph.css';

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

interface Props {
	dateCount: { [key: number]: DateCountByYear };
	books: Book[];
	years: number[];
	setYears: React.Dispatch<React.SetStateAction<number[]>>;
	authors: string[];
	setAuthors: React.Dispatch<React.SetStateAction<string[]>>;
}

const Graph: React.FC<Props> = ({
	dateCount,
	books,
	years,
	setYears,
	authors,
	setAuthors,
}) => {
	const [selectedYear, setSelectedYear] = useState<number>(2025);
	const [selectedAuthor, setSelectedAuthor] = useState<string>('');

	useEffect(() => {
		const storedYears = localStorage.getItem('years');
		if (storedYears) {
			setYears(JSON.parse(storedYears));
		}
	}, [setYears]);

	useEffect(() => {
		const storedAuthors = localStorage.getItem('authors');
		if (storedAuthors) {
			setAuthors(JSON.parse(storedAuthors));
		}
	}, [setAuthors]);

	const booksForYear = selectedYear
		? books
				.filter(
					(book) =>
						book.year === selectedYear &&
						book.status === Status.Completed &&
						(!selectedAuthor || book.author === selectedAuthor)
				)
				.sort((a, b) => a.month - b.month)
		: [];

	const chartData = {
		labels: months,
		datasets: [
			{
				label: 'Books Read Count',
				data: months.map((_, index) => {
					const monthData =
						(dateCount[selectedYear] as YearlyDateCount)?.[index] ?? 0;
					if (selectedAuthor) {
						return books.filter(
							(book) =>
								monthData.count &&
								book.year === selectedYear &&
								book.status === Status.Completed &&
								book.author === selectedAuthor &&
								months[book.month] === monthData.month
						).length;
					}
					return monthData?.count ?? 0;
				}),
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
		maintainAspectRatio: false,
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
		<div>
			<h2>Select a year:</h2>
			<div>
				{years
					.sort((a, b) => a - b)
					.map((year) => (
						<button
							className={
								selectedYear === year ? 'year-btn_clicked' : 'year-btn'
							}
							key={year}
							onClick={() => setSelectedYear(year)}
						>
							{year}
						</button>
					))}
			</div>
			<div className='author-dropdown'>
				<h2>Filter by Author:</h2>
				<select
					value={selectedAuthor}
					onChange={(event) => setSelectedAuthor(event.target.value)}
				>
					<option value=''>Select Author</option>
					{authors.map((author) => (
						<option key={author} value={author}>
							{author}
						</option>
					))}
				</select>
			</div>
			<div className='text-container'>
				<h3>
					Books read in {selectedYear}
					{selectedAuthor && ` by ${selectedAuthor}`}
				</h3>

				<ul className='read-books-list'>
					{booksForYear.map((book, index) => (
						<li key={index}>
							{book.title} ({months[book.month]})
						</li>
					))}
				</ul>
				<p className='total'>Total: {booksForYear.length}</p>
			</div>
			<div className='graph'>
				<Bar data={chartData} options={chartOptions} />
			</div>
		</div>
	);
};

export default Graph;
