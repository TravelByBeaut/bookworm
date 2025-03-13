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
}

const Graph: React.FC<Props> = ({ dateCount, books, years, setYears }) => {
	const [selectedYear, setSelectedYear] = useState<number>(2025);

	useEffect(() => {
		const storedYears = localStorage.getItem('years');
		if (storedYears) {
			setYears(JSON.parse(storedYears));
		}
	}, [setYears]);

	const booksForYear = selectedYear
		? books
				.filter(
					(book) =>
						book.year === selectedYear && book.status === Status.Completed
				)
				.sort((a, b) => a.month - b.month)
		: [];

	const chartData = {
		labels: months,
		datasets: [
			{
				label: 'Books Read Count',
				data: months.map((_, index) => {
					const monthData = (dateCount[selectedYear] as YearlyDateCount)?.[
						index
					];
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
		<div className='graph-container'>
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

			{selectedYear && (
				<div>
					<h3>Books read in {selectedYear}</h3>
					<ul className='read-books-list'>
						{booksForYear.map((book, index) => (
							<li key={index}>
								{book.title} ({months[book.month]})
							</li>
						))}
					</ul>
					<div className='graph'>
						<Bar data={chartData} options={chartOptions} />
					</div>
				</div>
			)}
		</div>
	);
};

export default Graph;
