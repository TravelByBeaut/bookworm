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
	Completed = 'completed',
}

export interface Book {
	id: number;
	title: string;
	author: string;
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