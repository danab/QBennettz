import React, { Component } from 'react';
import moment from 'moment';

import Overlay from './Overlay';

const HIGH_SCORES_KEPT = 10;

const encouragement = [
	'You Rock!',
	'Keep it up!',
	'Wowee!',
	'Congratulations!',
	"I'm impressed!",
	'Fantastic!',
	'Absolutely stellar!',
	'Way to go!'
];

const checkHighScore = (score, highscores) => {
	if (highscores.length < HIGH_SCORES_KEPT) {
		return true;
	}

	// should be unnecessary
	highscores.sort((scoreA, scoreB) => scoreB.score - scoreA.score);

	return highscores[HIGH_SCORES_KEPT - 1].score < score;
};

const createNewHighScores = (scoreObj, highScores) => {
	highScores.push(scoreObj);
	highScores.sort((scoreA, scoreB) => scoreB.score - scoreA.score);

	return highScores.slice(0, HIGH_SCORES_KEPT);
};

class HighScores extends Component {
	getPlace() {
		const placeIndex = this.props.scores.findIndex(score => {
			return (
				score.score === this.props.currentScore &&
				score.initials === this.props.currentInitials
			);
		});

		if (placeIndex !== -1) {
			return placeIndex + 1;
		} else {
			return false;
		}
	}
	render() {
		const place = this.getPlace();
		const today = moment().format('MM-DD-YY');
		const yesterday = moment()
			.subtract(1, 'day')
			.format('MM-DD-YY');
		const exclamation =
			encouragement[Math.floor(Math.random() * encouragement.length)];
		return (
			<div>
				<h2 style={{ marginBottom: '0.5em' }}>High Scores </h2>

				{place && (
					<div style={{ color: 'white' }} className="overlay-text">
						#{place} All-Time. {exclamation}
					</div>
				)}

				<div className="highscore-wrapper">
					<ol className="highscore-table">
						{this.props.scores.map((score, i) => {
							const classes =
								place && i === place - 1 ? 'clearfix new-score' : 'clearfix';

							const date = moment(score.date).format('MM-DD-YY');
							return (
								<li key={i} className={classes}>
									<span className="highscore-initials">{score.initials}</span>
									<span className="highscore-score">
										{score.score.toLocaleString()}
									</span>
									<span className="highscore-date">
										{date === today
											? 'Today'
											: date === yesterday ? 'Yesterday' : date}
									</span>
								</li>
							);
						})}
					</ol>
				</div>

				<div className="btn-wrapper">
					<div onClick={this.props.restartGame} className="btn">
						Play Again
					</div>
				</div>
			</div>
		);
	}
}
class GameOver extends Component {
	constructor(props) {
		super(props);
		const scores = localStorage.getItem('scores');
		const initials = localStorage.getItem('initials')
			? localStorage.getItem('initials')
			: '';
		let highscores;
		if (!scores) {
			highscores = { original: [] };
		} else {
			highscores = JSON.parse(scores);
		}

		const isHighScore = checkHighScore(props.score, highscores.original);
		this.state = {
			highscores,
			isHighScore,
			initials
		};

		this.handleChange = this.handleChange.bind(this);
		this.handleSubmit = this.handleSubmit.bind(this);
	}

	componentDidMount() {}

	handleChange(e) {
		this.setState({ initials: e.target.value.toUpperCase() });
	}

	createScoreObj() {
		return {
			score: this.props.score,
			initials: this.state.initials,
			level: this.props.level,
			bestGroup: this.props.bestGroup,
			date: moment().toISOString()
		};
	}

	handleSubmit() {
		if (this.state.initials.length > 1) {
			const newHighScores = createNewHighScores(
				this.createScoreObj(),
				this.state.highscores.original
			);

			const newHighScoreObj = {
				...this.state.highscores,
				original: newHighScores
			};
			this.setState({
				submitted: true,
				highscores: newHighScoreObj
			});

			localStorage.setItem('scores', JSON.stringify(newHighScoreObj));
			localStorage.setItem('initials', this.state.initials);
		}
	}

	showHighScores() {
		this.setState({ isHighScore: true, submitted: true });
	}

	render() {
		return (
			<Overlay rotation={this.props.rotation}>
				{this.state.isHighScore ? (
					this.state.submitted ? (
						<HighScores
							currentScore={this.props.score}
							currentInitials={this.state.initials}
							restartGame={this.props.restartGame}
							scores={this.state.highscores.original}
						/>
					) : (
						<div>
							<h2>Game Over</h2>
							<h3>Score: {this.props.score.toLocaleString()}</h3>
							<div className="overlay-text">
								You've got a high score! Please enter your initials.
							</div>
							<div className="highscore-input">
								<input
									onChange={this.handleChange}
									value={this.state.initials}
									type="text"
									maxLength="3"
									size="3"
									placeholder="---"
								/>
							</div>
							<div style={{ textAlign: 'center' }}>
								<div onClick={this.handleSubmit} className="btn">
									Submit
								</div>
							</div>
						</div>
					)
				) : (
					<div>
						<h2>Game Over</h2>
						<h3>Score: {this.props.score.toLocaleString()}</h3>
						<div className="overlay-text">Sorry, no high score this time.</div>
						<div style={{ textAlign: 'center' }}>
							<div onClick={this.props.restartGame} className="btn">
								Play Again
							</div>
							<div className="btn" onClick={this.showHighScores.bind(this)}>
								High Scores
							</div>
						</div>
					</div>
				)}
			</Overlay>
		);
	}
}

export default GameOver;
