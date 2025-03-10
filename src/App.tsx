import React, { useState } from 'react';
import './styles/App.css';
import Header from './components/Header';
import BookList from './components/BookList';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Graph from './components/Graph';

const App: React.FC = () => {
	const [dateCount, setDateCount] = useState<{
		[key: number]: { month: string; count: number };
	}>({
		0: { month: 'January', count: 0 },
		1: { month: 'February', count: 0 },
		2: { month: 'March', count: 0 },
		3: { month: 'April', count: 0 },
		4: { month: 'May', count: 0 },
		5: { month: 'June', count: 0 },
		6: { month: 'July', count: 0 },
		7: { month: 'August', count: 0 },
		8: { month: 'September', count: 0 },
		9: { month: 'October', count: 0 },
		10: { month: 'November', count: 0 },
		11: { month: 'December', count: 0 },
	});
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
					<Route path='/' element={<Graph dateCount={dateCount} />} />
					<Route
						path='/booklist'
						element={
							<BookList dateCount={dateCount} setDateCount={setDateCount} />
						}
					/>
				</Routes>
			</div>
		</BrowserRouter>
	);
};

export default App;
