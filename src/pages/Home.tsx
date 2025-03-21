import '../styles/home.css';

const Home = () => {
	return (
		<div className='home-container'>
			<h1>Welcome!</h1>
			<p className='intro'>
				This is where your reading adventures come to life! Record and track
				your progress throughout the months and years of your reading habits 📚
			</p>
			<p className='intro'>
				Head over to
				<button className='link-btn'>
					<a href='/booklist' className='link'>
						Book List
					</a>
				</button>
				to start adding the stories you're itching to read, currently devouring,
				or have triumphantly finished. Don’t forget to include the title and
				author — it’s the secret ingredient that powers your personalized stats!
			</p>
			<p className='intro'>
				Once you've marked books as Completed, the
				<button className='link-btn'>
					<a href='/graph' className='link'>
						Graph
					</a>
				</button>
				page becomes your nerdy sidekick — revealing reading patterns by month
				and year, spotlighting your most-read authors, and tallying up your
				total reads per year.
			</p>
			<p className='intro'>
				Whether you're a casual reader or a full-blown book worm, this app is
				here to celebrate your reading journey. So grab a cup of tea and dive
				into the
				<button className='link-btn'>
					<a href='/booklist' className='link'>
						Book List
					</a>
				</button>
				to get started!
			</p>
		</div>
	);
};

export default Home;
