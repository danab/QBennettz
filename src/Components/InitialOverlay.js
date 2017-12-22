import React, { Component } from 'react';

import Overlay from './Overlay';

class GameOver extends Component {
	render() {
		const style = {
			position: 'absolute',
			top: '50%',
			left: '50%',
			marginLeft: '-100px',
			marginTop: '-30px',
			height: '90px',
			fontSize: '2em',
			width: '200px',
			textAlign: 'center'
		};
		return (
			<Overlay noAnimation rotation={this.props.rotation}>
				<div style={style} onClick={this.props.restartGame} className="btn">
					Play
				</div>
			</Overlay>
		);
	}
}

export default GameOver;
