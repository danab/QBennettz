import React, { Component } from 'react';

import Initial from './InitialOverlay';
import LevelOver from './LevelOver';
import GameOver from './GameOver';

class Overlays extends Component {
	render() {
		if (!this.props.initialized) {
			return <Initial restartGame={this.props.restartGame} />;
		} else if (this.props.levelOver) {
			return (
				<LevelOver
					rotation={this.props.rotation}
					level={this.props.level + 1}
					goToNextLevel={this.props.goToNextLevel}
					timeBonus={this.props.timeBonus}
					pieceBonus={this.props.pieceBonus}
				/>
			);
		} else if (this.props.gameOver) {
			return <GameOver {...this.props} />;
		}
	}
}

export default Overlays;
