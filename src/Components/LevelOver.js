import React, { Component } from 'react';

import Overlay from './Overlay';

class LevelOver extends Component {
	render() {
		const totalBonus = this.props.timeBonus + this.props.pieceBonus;
		return (
			<Overlay rotation={this.props.rotation}>
				<h2>Level {this.props.level} Completed </h2>
				<div>
					<h3 className="time-bonus">
						Time Bonus: <span>{this.props.timeBonus.toLocaleString()}</span>
					</h3>
					<h3 className="piece-bonus">
						Piece Bonus: <span>{this.props.pieceBonus.toLocaleString()}</span>
					</h3>
					<h3 className="total-score" style={{ marginBottom: '40px' }}>
						Total Bonus: <span>{totalBonus.toLocaleString()}</span>
					</h3>
				</div>
				<div className="next-level" style={{ textAlign: 'center' }}>
					<div onClick={this.props.goToNextLevel} className="btn">
						Next Level
					</div>
				</div>
			</Overlay>
		);
	}
}

export default LevelOver;
