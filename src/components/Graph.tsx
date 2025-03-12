import { useEffect, useState } from 'react';
import { Bar } from 'react-chartjs-2';
import { Book, DateCountByYear, months, YearlyDateCount } from '../App';
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

interface DateCountProps {
	dateCount: { [key: number]: DateCountByYear };
	books: Book[];
	years: number[];
	setYears: React.Dispatch<React.SetStateAction<number[]>>;
}

const Graph: React.FC<DateCountProps> = ({
	dateCount,
	books,
	years,
	setYears,
}) => {
	const [selectedYear, setSelectedYear] = useState<number>(2025);

	useEffect(() => {
		const storedYears = localStorage.getItem('years');
		if (storedYears) {
			setYears(JSON.parse(storedYears));
		}
	}, [setYears]);

	const booksForYear = selectedYear
		? books.filter((book) => book.year === selectedYear)
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
				{years.map((year) => (
					<button
						className='year-btn'
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
					<ul>
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
