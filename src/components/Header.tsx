import worm from '../images/worm.png';
import '../styles/header.css';

const Header: React.FC = () => {
	return (
		<div className='header'>
			<h1>BookWorm</h1>
			<img src={worm} alt='worm' className='worm'></img>
		</div>
	);
};

export default Header;
