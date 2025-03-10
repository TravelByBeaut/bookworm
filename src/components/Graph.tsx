import { Bar } from 'react-chartjs-2';

interface DateCount {
	month: string;
	count: number;
}

interface DateCountProps {
	dateCount: { [key: number]: DateCount };
}

const Graph: React.FC<DateCountProps> = ({ dateCount }) => {
	console.log(dateCount);
	return (
		<div>
			{/* <Bar
  options={...}
  data={...}
  {...props}
/> */}
		</div>
	);
};

export default Graph;
