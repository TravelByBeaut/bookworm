import React, { useState } from 'react';
import './styles/App.css';
import Header from './components/Header';
import BookList from './components/BookList';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Graph from './components/Graph';

export type YearlyDateCount = {
	[monthIndex: number]: {
		month: string;
		count: number;
	};
};

export type DateCountByYear = {
	[year: number]: YearlyDateCount;
};

export enum Status {
	ToRead = 'to-read',
	Reading = 'reading',
	Read = 'read',
}

export interface Book {
	id: number;
	title: string;
	status: Status;
	month: number;
	year: number;
}

export const months = [
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

const App: React.FC = () => {
	const [dateCount, setDateCount] = useState<DateCountByYear>(() => {
		const storedData = localStorage.getItem('dateCount');
		return storedData ? JSON.parse(storedData) : {};
	});
	const [books, setBooks] = useState<Book[]>([]);
	const [years, setYears] = useState<number[]>([]);
	return (
		<BrowserRouter>
			<div className='App'>
				<nav className='nav'>
					<ul>
						<li>
							<a href='/'>Graph</a>
						</li>
						<li>
							<a href='/booklist'>Book List</a>
						</li>
					</ul>
				</nav>
				<Header />
				<Routes>
					<Route
						path='/'
						element={
							<Graph
								dateCount={dateCount}
								books={books}
								years={years}
								setYears={setYears}
							/>
						}
					/>
					<Route
						path='/booklist'
						element={
							<BookList
								dateCount={dateCount}
								setDateCount={setDateCount}
								books={books}
								setBooks={setBooks}
								years={years}
								setYears={setYears}
							/>
						}
					/>
				</Routes>
			</div>
		</BrowserRouter>
	);
};

export default App;
