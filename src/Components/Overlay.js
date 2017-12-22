import React, { Component } from 'react';

// This is probably worthless...
import { GAME_STYLE } from '../constants';

class Overlay extends Component {
	render() {
		const rotation = `rotate(${-1 * this.props.rotation * 90}deg)`;
		const animation = this.props.noAnimation ? { animation: 'none' } : {};
		return (
			<div
				className="overlay"
				style={Object.assign({ transform: rotation }, animation, GAME_STYLE)}
			>
				{this.props.children}
			</div>
		);
	}
}

export default Overlay;
