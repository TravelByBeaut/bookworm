import { Link } from 'react-router-dom';
import worm from '../images/worm.png';
import '../styles/header.css';

const Header: React.FC = () => {
	return (
		<div>
			<nav className='nav'>
				<ul>
					<li>
						<Link to='/'>Home</Link>
					</li>
					<li>
						<Link to='/booklist'>Book List</Link>
					</li>
					<li>
						<Link to='/graph'>Graph</Link>
					</li>
				</ul>
			</nav>
			<div className='header'>
				<h1>Book Worm</h1>
				<img src={worm} alt='worm' className='worm'></img>
			</div>
		</div>
	);
};

export default Header;
