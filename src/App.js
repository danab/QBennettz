import React, { Component, PureComponent } from 'react';
import { CSSTransitionGroup } from 'react-transition-group';
import './App.css';
import { GAME_SIZE, LEVELS } from './constants';

import Square from './Components/Square';
import Timer from './Components/Timer';
import GameOver from './Components/GameOver';
import LevelOver from './Components/LevelOver';
import Initial from './Components/InitialOverlay';
import LastScore from './Components/LastScore';

const createBoard = (dim, colors) => {
	const board = [];
	for (var i = 0; i < dim; i++) {
		board.push([]);
		for (var j = 0; j < dim; j++) {
			board[i].push({
				id: Math.random(),
				val: Math.floor(Math.random() * colors)
			});
		}
	}
	return board;
};

const getAdjacentSquares = (dim, board, pileIdx, pileNum) => {
	const possibleAdjacent = [
		[pileIdx, pileNum + 1],
		[pileIdx, pileNum - 1],
		[pileIdx - 1, pileNum],
		[pileIdx + 1, pileNum]
	];

	return possibleAdjacent
		.filter(([idx, num]) => {
			return (
				typeof board[idx] !== 'undefined' &&
				typeof board[idx][num] !== 'undefined'
			);
		})
		.map(([idx, num]) => idx * dim + num);
};

const parseIdx = (idx, dim) => [Math.floor(idx / dim), idx % dim];

// TODO: Oh shiiiiiit this is convoluted.

const filterFunction = (squaresToCheck, checkedSquares, newSquareIdx) => {
	return (
		squaresToCheck.indexOf(newSquareIdx) === -1 &&
		checkedSquares.indexOf(newSquareIdx) === -1
	);
};

const getSquareCollection = (board, row, col) => {
	const dim = board
		.map(pile => pile.length)
		.reduce((max, len) => Math.max(max, len), 0);
	const color = board[row][col].val;
	const squareIdx = row * dim + col;

	let collection = [squareIdx];
	let checkedSquares = [squareIdx];

	let squaresToCheck = getAdjacentSquares(dim, board, row, col);
	const filterFunc = filterFunction.bind(null, squaresToCheck, checkedSquares);

	while (squaresToCheck.length) {
		const [idx, num] = parseIdx(squaresToCheck.shift(), dim);

		if (board[idx][num].val === color) {
			collection.push(idx * dim + num);
			let newSquaresToCheck = getAdjacentSquares(dim, board, idx, num);
			let noCopies = newSquaresToCheck.filter(filterFunc);
			squaresToCheck = squaresToCheck.concat(noCopies);
		}
		checkedSquares.push(idx * dim + num);
	}

	return collection.map(idx => parseIdx(idx, dim));
};

const removeSquaresAndCondense = (board, squaresToRemove) => {
	squaresToRemove.forEach(([idx, num]) => (board[idx][num] = false));

	const boardWithPossibleExtraPiles = board.map(pile => {
		return pile.filter(square => square !== false);
	});

	return condensePiles(boardWithPossibleExtraPiles);
};

const createSquares = (board, dim, rotation, handleClick) => {
	const squareHeight = GAME_SIZE / dim;
	return board.reduce((squares, pile, col) => {
		return squares.concat(
			pile.map((square, row) => {
				return (
					<Square
						key={square.id}
						dim={dim}
						row={row}
						col={col}
						rotation={rotation}
						squareHeight={squareHeight}
						handleClick={handleClick}
						color={square.val}
					/>
				);
			})
		);
	}, []);
};
const condensePiles = board => {
	return board.filter(pile => pile.length);
};

const isLevelOver = (board, movesLeft) => {
	const colors = [];
	for (var i = 0; i < board.length; i++) {
		for (var j = 0; j < board[i].length; j++) {
			if (movesLeft > 0) {
				// Let's just check for multiple of the same colors
				if (colors.indexOf(board[i][j].val) === -1) {
					colors.push(board[i][j].val);
				} else {
					return false;
				}
			} else {
				// If no "movesLeft", we need to see if there are any adjacent squares
				const collection = getSquareCollection(board, i, j);
				if (collection.length > 1) {
					return false;
				}
			}
		}
	}
	return true;
};

// HT: https://stackoverflow.com/questions/2450954/how-to-randomize-shuffle-a-javascript-array
function shuffleArray(array) {
	for (let i = array.length - 1; i > 0; i--) {
		let j = Math.floor(Math.random() * (i + 1));
		[array[i], array[j]] = [array[j], array[i]];
	}
}

const randomizeBoard = board => {
	let coords = board.reduce((cum, pile, i) => {
		return cum.concat(pile.map((square, j) => [i, j]));
	}, []);

	shuffleArray(coords);
	let newBoard = [];

	for (var i = 0; i < board.length; i++) {
		for (var j = 0; j < board[i].length; j++) {
			if (!newBoard[i]) {
				newBoard[i] = [];
			}
			const [x, y] = coords.pop();
			newBoard[i][j] = board[x][y];
		}
	}

	return newBoard;
};

// Clockwise
const rotateBoard = board => {
	let newBoard = [];
	for (var i = board.length - 1; i >= 0; i--) {
		for (var j = 0; j < board[i].length; j++) {
			const newCol = j;
			const newRow = board.length - i - 1;

			if (!newBoard[newCol]) {
				newBoard[newCol] = [];
			}

			newBoard[newCol][newRow] = board[i][j];
		}
	}

	return newBoard.map(pile => pile.filter(square => square !== undefined));
};

const rotateBoardCounter = board => {
	let newBoard = [];
	const dim = board
		.map(pile => pile.length)
		.reduce((max, len) => Math.max(max, len), 0);
	for (var i = 0; i < board.length; i++) {
		for (var j = 0; j < board[i].length; j++) {
			const newCol = dim - 1 - j;
			if (!newBoard[newCol]) {
				newBoard[newCol] = [];
			}
			newBoard[dim - 1 - j][i] = board[i][j];
		}
	}

	return newBoard.map(pile => pile.filter(square => square !== undefined));
};

class App extends Component {
	constructor(props) {
		super(props);
		const level = 0;
		const { dim, colors, time } = LEVELS[level];
		const startTime = new Date().getTime();
		this.state = {
			initialized: false,
			// Number of clicks in the game?
			clicks: 0,
			score: 0,
			level,
			levelOver: false,
			dim,
			colors,
			movesLeft: 3,
			time,
			board: createBoard(dim, colors),
			gameOver: true,
			rotating: false,
			rotation: 0,
			startTime
		};

		this.handleClick = this.handleClick.bind(this);
		this.setGameOver = this.setGameOver.bind(this);
		this.handleRestart = this.handleRestart.bind(this);
		this.goToNextLevel = this.goToNextLevel.bind(this);
		this.handleKeyDown = this.handleKeyDown.bind(this);
	}

	componentWillMount() {
		window.addEventListener('keydown', this.handleKeyDown);
	}

	componentWillUnmount() {
		window.removeEventListener('keydown', this.handleKeyDown);
	}

	setGameOver() {
		this.setState({ gameOver: true });
	}

	handleClick(row, col) {
		return e => {
			const collection = getSquareCollection(this.state.board, row, col);
			const clicks = this.state.clicks + 1;

			if (collection.length === 1) {
				// Don't do anything? Deduct score?
				this.setState({
					score: this.state.score - 100,
					lastScore: -100,
					clicks
				});
				return;
			}

			const board = removeSquaresAndCondense(this.state.board, collection);

			const score = collection.length * collection.length * 5;

			const levelOver = isLevelOver(board, this.state.movesLeft);

			const pieceBonus = levelOver ? this.getPieceBonus(board) : 0;
			const timeBonus = levelOver ? this.getTimeBonus() : 0;

			this.setState({
				rotating: false,
				falling: false,
				board,
				score: this.state.score + score,
				lastScore: score,
				levelOver,
				pieceBonus,
				timeBonus,
				clicks
			});
		};
	}
	handleRotate() {
		// set state rotating
		if (this.hasMovesLeft()) {
			this.setState({
				rotating: true,
				rotationDirection: 1,
				falling: false,
				movesLeft: this.state.movesLeft - 1
			});
		}
	}
	handleRotateCounter() {
		if (this.hasMovesLeft()) {
			this.setState({
				rotating: true,
				rotationDirection: -1,
				falling: false,
				movesLeft: this.state.movesLeft - 1
			});
		}
	}
	handleRandom() {
		if (this.hasMovesLeft()) {
			const board = randomizeBoard(this.state.board);

			const levelOver = isLevelOver(board, this.state.movesLeft - 1);
			const pieceBonus = levelOver ? this.getPieceBonus(board) : 0;
			const timeBonus = levelOver ? this.getTimeBonus() : 0;
			this.setState({
				board,
				movesLeft: this.state.movesLeft - 1,
				levelOver,
				pieceBonus,
				timeBonus
			});
		}
	}

	hasMovesLeft() {
		return (
			this.state.movesLeft > 0 && !this.state.gameOver && !this.state.levelOver
		);
	}

	handleRestart() {
		const level = 0;
		const score = 0;
		const startTime = new Date().getTime();
		const { dim, colors } = LEVELS[0];
		const board = createBoard(dim, colors);
		const newState = {
			...LEVELS[0],
			level,
			startTime,
			initialized: true,
			gameOver: false,
			levelOver: false,
			board,
			score
		};
		this.setState(newState);
	}
	goToNextLevel() {
		const level = this.state.level + 1;
		const startTime = new Date().getTime();
		const { dim, colors } = LEVELS[level];
		const board = createBoard(dim, colors);
		const newState = {
			...LEVELS[level],
			level,
			startTime,
			levelOver: false,
			board,
			lastScore: this.state.pieceBonus + this.state.timeBonus,
			score: this.state.score + this.state.pieceBonus + this.state.timeBonus
		};
		this.setState(newState);
	}
	handleTransitionEnd() {
		// there may be more transitions some day
		if (this.state.rotating) {
			const board =
				this.state.rotationDirection === 1
					? rotateBoard(this.state.board)
					: rotateBoardCounter(this.state.board);
			const rotation = this.state.rotation + this.state.rotationDirection;
			this.setState({ rotating: false, rotation, falling: true, board });

			if (isLevelOver(board, this.state.movesLeft)) {
				const pieceBonus = this.getPieceBonus(board);
				const timeBonus = this.getTimeBonus();
				this.setState({ levelOver: true, pieceBonus, timeBonus });
			}
		}
	}
	getTimeBonus() {
		const currentTime = new Date().getTime();
		const endTime = this.state.startTime + this.state.time * 1000;
		const percentLeft = (endTime - currentTime) / (this.state.time * 1000);

		return Math.floor(percentLeft * 1000) * 10;
	}
	getPieceBonus(board) {
		const piecesLeft = board.reduce((cum, col) => cum + col.length, 0);

		if (piecesLeft === 0) {
			return 10000;
		} else {
			return Math.max(5000 - piecesLeft * 100, 0);
		}
	}

	handleKeyDown(e) {
		switch (e.key) {
			case 'ArrowLeft':
				this.handleRotateCounter();
				e.preventDefault();
				break;
			case 'ArrowUp':
				this.handleRandom();
				e.preventDefault();
				break;
			case 'ArrowRight':
				this.handleRotate();
				e.preventDefault();
				break;
		}
	}

	render() {
		// Resize when possible?
		// const height = this.state.board
		// 	.map(pile => pile.length)
		// 	.reduce((max, len) => Math.max(max, len), 0);
		// const dim = Math.max( height, this.state.board.length, 2 );

		console.log('render app');
		const dim = this.state.dim;
		const squares = createSquares(
			this.state.board,
			dim,
			this.state.rotation,
			this.handleClick
		);

		// Need to keep the order of elements in order on the page for transitions to work
		squares.sort((a, b) => a.key - b.key);

		const effectiveRotation = this.state.rotating
			? this.state.rotation + this.state.rotationDirection
			: this.state.rotation;
		const gameStyle = {
			height: GAME_SIZE + 'px',
			width: GAME_SIZE + 'px',
			transform: `rotate(${effectiveRotation * 90}deg)`
		};

		let classes = effectiveRotation % 2 ? 'sideways' : 'upright';
		if (this.state.rotating) {
			classes += ' rotating';
		}
		if (this.state.falling) {
			classes += ' falling';
		}

		return (
			<div id="wrapper">
				<div className=" header clearfix">
					<h1>
						QBe<span>nn</span>e<span>tt</span>z
					</h1>
					<div className="header-container">
						<div className="score-container">
							<div className="score">
								<div className="score-header">LEVEL</div>
								<div>{this.state.level + 1}</div>
							</div>
						</div>
						<div className="score-container">
							<div className="score">
								<div className="score-header">SCORE</div>
								<div>{this.state.score.toLocaleString()}</div>
							</div>

							<LastScore
								key={this.state.clicks + this.state.level}
								score={this.state.lastScore}
							/>
						</div>
					</div>
				</div>
				<div
					style={gameStyle}
					onTransitionEnd={this.handleTransitionEnd.bind(this)}
					id="game"
					className={classes}
				>
					{/* <CSSTransitionGroup
						transitionName="explode"
						transitionLeaveTimeout={300}
						transitionEnter={false}
					> */}
					{squares}
					{/* </CSSTransitionGroup> */}
					{!this.state.initialized && (
						<Initial restartGame={this.handleRestart} />
					)}
					{this.state.initialized &&
						this.state.gameOver && (
							<GameOver
								restartGame={this.handleRestart}
								rotation={effectiveRotation}
								score={this.state.score}
							/>
						)}
					{this.state.levelOver && (
						<LevelOver
							level={this.state.level + 1}
							goToNextLevel={this.goToNextLevel}
							pieceBonus={this.state.pieceBonus}
							timeBonus={this.state.timeBonus}
							rotation={effectiveRotation}
						/>
					)}
				</div>
				<Timer
					startTime={this.state.startTime}
					active={!this.state.levelOver && !this.state.gameOver}
					time={this.state.time}
					setGameOver={this.setGameOver}
				/>
				<div className="moves">
					<div
						className="icon-holder"
						onClick={this.handleRotateCounter.bind(this)}
					>
						<i
							className="fa fa-redo-alt fa-flip-horizontal"
							style={{ fontSize: '80px', color: 'white' }}
						/>
					</div>
					<div className="icon-holder" onClick={this.handleRandom.bind(this)}>
						<i
							className="fa fa-random"
							style={{ fontSize: '80px', color: 'white' }}
						/>
					</div>
					<div className="icon-holder" onClick={this.handleRotate.bind(this)}>
						<i
							className="fa fa-redo-alt"
							style={{ fontSize: '80px', color: 'white' }}
						/>
					</div>
					<div className="icon-holder moves-holder">
						<div className="moves-holder-wrapper">
							<div className="moves-header">MOVES</div>
							<div className="moves-remaining">{this.state.movesLeft}</div>
						</div>
					</div>
				</div>
			</div>
		);
	}
}

export default App;
