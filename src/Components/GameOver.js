import React, { Component } from 'react';

import Overlay from './Overlay';

class GameOver extends Component {
	constructor(props) {
		super(props);
		this.state = {
			highscore: false
		};
	}

	render() {
		return (
			<Overlay rotation={this.props.rotation}>
				<h2>Game Over</h2>
				<h3>Score: {this.props.score.toLocaleString()}</h3>
				{this.state.highscore ? (
					<div>
						<div className="overlay-text">
							You've got a high score! Please enter your initials.
						</div>
						<div className="highscore-input">
							<input type="text" maxLength="3" size="3" placeholder="---" />
						</div>
						<div style={{ textAlign: 'center' }}>
							<div className="btn">Submit</div>
						</div>
					</div>
				) : (
					<div>
						<div className="overlay-text">Sorry, no high score this time.</div>
						<div style={{ textAlign: 'center' }}>
							<div onClick={this.props.restartGame} className="btn">
								Play Again
							</div>
							<div className="btn">High Scores</div>
						</div>
					</div>
				)}
			</Overlay>
		);
	}
}

export default GameOver;
