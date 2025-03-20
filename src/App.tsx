import React from 'react';
import './styles/App.css';
import Header from './components/Header';
import BookList from './pages/BookList';
import { BrowserRouter, Link, Route, Routes } from 'react-router-dom';
import Graph from './pages/Graph';
import { BookProvider } from './components/Context';

const App: React.FC = () => {
	return (
		<BookProvider>
			<BrowserRouter>
				<div className='App'>
					<div className='container'>
						<nav className='nav'>
							<ul>
								<li>
									<Link to='/'>Graph</Link>
								</li>
								<li>
									<Link to='/booklist'>Book List</Link>
								</li>
							</ul>
						</nav>
						<Header />
						<Routes>
							<Route path='/' element={<Graph />} />
							<Route path='/booklist' element={<BookList />} />
						</Routes>
					</div>
				</div>
			</BrowserRouter>
		</BookProvider>
	);
};

export default App;
