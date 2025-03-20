import React, { useEffect } from 'react';
import Columns from '../components/Columns';
import Cards from '../components/Cards';
import { useBookContext } from '../components/Context';

const BookList: React.FC = () => {
	const { dateCount, books, years } = useBookContext();

	useEffect(() => {
		if (books.length > 0) {
			localStorage.setItem('books', JSON.stringify(books));
		}
	}, [books]);

	useEffect(() => {
		if (dateCount) {
			localStorage.setItem('dateCount', JSON.stringify(dateCount));
		}
	}, [dateCount]);

	useEffect(() => {
		if (years.length > 0) {
			localStorage.setItem('years', JSON.stringify(years));
		}
	}, [years]);

	return (
		<div>
			<Cards />
			<Columns />
		</div>
	);
};

export default BookList;
