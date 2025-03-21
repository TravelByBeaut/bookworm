import React from 'react';
import './styles/app.css';
import Header from './components/Header';
import BookList from './pages/BookList';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Graph from './pages/Graph';
import { BookProvider } from './components/Context';
import Home from './pages/Home';

const App: React.FC = () => {
	return (
		<BookProvider>
			<BrowserRouter>
				<div className='app'>
					<div className='container'>
						<Header />
						<Routes>
							<Route path='/' element={<Home />} />
							<Route path='/booklist' element={<BookList />} />
							<Route path='/graph' element={<Graph />} />
						</Routes>
					</div>
				</div>
			</BrowserRouter>
		</BookProvider>
	);
};

export default App;
