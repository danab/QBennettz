import React, { PureComponent } from 'react';
import { GAME_SIZE } from '../constants';

class Timer extends PureComponent {
	constructor(props) {
		super(props);
		this.handleAnimationEnd = this.handleAnimationEnd.bind(this);
	}

	handleAnimationEnd() {
		this.props.setGameOver();
	}

	componentWillReceiveProps(newProps) {
		// Stopping
		if (this.props.active && !newProps.active) {
			this.setState({ active: false });
		}

		// New Level
		if (!this.props.active && newProps.active) {
			this.setState({ reset: true }, () => {
				setTimeout(() => this.setState({ reset: false, active: true }), 1);
			});
		}
	}

	getPercentLeft() {
		const currentTime = new Date().getTime();
		const endTime = this.props.startTime + this.props.time * 1000;

		if (currentTime > endTime) {
			return 0;
		}

		return (endTime - currentTime) / (this.props.time * 1000);
	}

	render() {
		const width = this.props.active
			? GAME_SIZE + 'px'
			: GAME_SIZE * this.getPercentLeft() + 'px';

		const classNames = this.props.active ? 'timer timer-animation' : 'timer';
		return (
			<div className="timer-wrapper" style={{ width: width }}>
				<div
					onAnimationEnd={this.handleAnimationEnd}
					className={classNames}
					style={{ animationDuration: this.props.time + 's' }}
				/>
			</div>
		);
	}
}

export default Timer;
