import React, {
	createContext,
	useContext,
	useState,
	ReactNode,
	useEffect,
} from 'react';
import { DateCountByYear, Status } from '../utils';

export interface Book {
	id: number;
	title: string;
	author: string;
	status: Status;
	month: number;
	year: number;
}

interface BookContextType {
	books: Book[];
	setBooks: React.Dispatch<React.SetStateAction<Book[]>>;
	years: number[];
	setYears: React.Dispatch<React.SetStateAction<number[]>>;
	authors: string[];
	setAuthors: React.Dispatch<React.SetStateAction<string[]>>;
	dateCount: DateCountByYear;
	setDateCount: React.Dispatch<React.SetStateAction<DateCountByYear>>;
}

const BookContext = createContext<BookContextType | undefined>(undefined);

export const BookProvider = ({ children }: { children: ReactNode }) => {
	const [books, setBooks] = useState<Book[]>([]);
	const [years, setYears] = useState<number[]>([]);
	const [authors, setAuthors] = useState<string[]>([]);
	const [dateCount, setDateCount] = useState<DateCountByYear>({});

	useEffect(() => {
		const storedDateCount = localStorage.getItem('dateCount');
		if (storedDateCount) {
			setDateCount(JSON.parse(storedDateCount));
		}
	}, []);

	useEffect(() => {
		const storedBooks = localStorage.getItem('books');
		if (storedBooks) {
			setBooks(JSON.parse(storedBooks));
		}
	}, []);

	useEffect(() => {
		const storedYears = localStorage.getItem('years');
		if (storedYears) {
			setYears(JSON.parse(storedYears));
		}
	}, []);

	useEffect(() => {
		const storedAuthors = localStorage.getItem('authors');
		if (storedAuthors) {
			setAuthors(JSON.parse(storedAuthors));
		}
	}, []);

	return (
		<BookContext.Provider
			value={{
				books,
				setBooks,
				years,
				setYears,
				authors,
				setAuthors,
				dateCount,
				setDateCount,
			}}
		>
			{children}
		</BookContext.Provider>
	);
};

export const useBookContext = () => {
	const context = useContext(BookContext);
	if (!context)
		throw new Error('useBookContext must be used within a BookProvider');
	return context;
};
