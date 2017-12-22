import React, { Component } from 'react';

class LastScore extends Component {
	render() {
		const score =
			this.props.score > 0
				? '+' + this.props.score.toLocaleString()
				: this.props.score;
		return (
			<div
				style={{
					color: this.props.score < 0 ? 'red' : 'white'
				}}
				className="last-score"
			>
				{score}
			</div>
		);
	}
}

export default LastScore;
