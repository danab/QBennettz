import React, { Component, PureComponent } from 'react';
import { CSSTransitionGroup } from 'react-transition-group';
import './App.css';
import { GAME_SIZE, LEVELS } from './constants';

import Square from './Components/Square';

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
const getSquareCollection = (board, row, col) => {
	const dim = board
		.map(pile => pile.length)
		.reduce((max, len) => Math.max(max, len), 0);
	const color = board[row][col].val;
	const squareIdx = row * dim + col;

	let collection = [squareIdx];
	let checkedSquares = [squareIdx];

	let squaresToCheck = getAdjacentSquares(dim, board, row, col);

	while (squaresToCheck.length) {
		const [idx, num] = parseIdx(squaresToCheck.shift(), dim);

		if (board[idx][num].val === color) {
			collection.push(idx * dim + num);
			let newSquaresToCheck = getAdjacentSquares(dim, board, idx, num);
			let noCopies = newSquaresToCheck.filter(newSquareIdx => {
				return (
					squaresToCheck.indexOf(newSquareIdx) === -1 &&
					checkedSquares.indexOf(newSquareIdx) === -1
				);
			});
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

class Timer1 extends PureComponent {
	constructor(props) {
		super(props);
		this.state = {
			reset: true,
			active: false
		};

		this.handleTransitionEnd = this.handleTransitionEnd.bind(this);
	}

	componentDidMount() {
		// Is this reliable?
		setTimeout(() => this.setState({ active: true, reset: false }), 1);
	}

	handleTransitionEnd() {
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
		if (this.state.reset) {
			return 1;
		}

		const currentTime = new Date().getTime();
		const endTime = this.props.startTime + this.props.time * 1000;

		if (currentTime > endTime) {
			return 0;
		}

		const percentLeft = (endTime - currentTime) / (this.props.time * 1000);
		return percentLeft;
	}

	render() {
		const width = this.state.active
			? '0'
			: GAME_SIZE * this.getPercentLeft() + 'px';

		const classNames = this.state.active ? 'timer timer-active' : 'timer';
		return (
			<div
				onTransitionEnd={this.handleTransitionEnd}
				className={classNames}
				style={{
					width: width
				}}
			/>
		);
	}
}

class Timer extends PureComponent {
	constructor(props) {
		super(props);
		this.state = {
			percentLeft: 1
		};
	}

	componentDidMount() {
		this.updateTimer();
	}

	updateTimer() {
		const currentTime = new Date().getTime();
		const endTime = this.props.startTime + this.props.time * 1000;

		if (currentTime > endTime) {
			this.props.setGameOver();
			return;
		}

		this.setState({
			percentLeft: (endTime - currentTime) / (this.props.time * 1000)
		});

		if (this.props.active) {
			requestAnimationFrame(this.updateTimer.bind(this));
		}
	}

	componentDidUpdate(prevProps) {
		if (!prevProps.active && this.props.active) {
			this.updateTimer();
		}
	}

	render() {
		return (
			<div style={{ width: GAME_SIZE + 'px', margin: 'auto' }}>
				<div
					style={{
						// width: GAME_SIZE * this.state.percentLeft + 'px',
						transform: `scaleX(${this.state.percentLeft})`,
						height: '10px',
						borderRadius: '5px',
						background: this.state.percentLeft < 0.2 ? 'red' : 'white'
					}}
				/>
			</div>
		);
	}
}

class App extends Component {
	constructor(props) {
		super(props);
		const level = 0;
		const { dim, colors, time } = LEVELS[level];
		const startTime = new Date().getTime();
		this.state = {
			score: 0,
			level,
			levelOver: false,
			dim,
			colors,
			movesLeft: 3,
			time,
			board: createBoard(dim, colors),
			gameOver: false,
			rotating: false,
			rotation: 0,
			startTime
		};

		this.handleClick = this.handleClick.bind(this);
		this.setGameOver = this.setGameOver.bind(this);
	}

	setGameOver() {
		this.setState({ gameOver: true });
	}

	handleClick(row, col) {
		return e => {
			const collection = getSquareCollection(this.state.board, row, col);

			if (collection.length === 1) {
				// Don't do anything? Deduct score?
				this.setState({ score: this.state.score - 100 });
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
				levelOver,
				pieceBonus,
				timeBonus
			});
		};
	}
	handleRotate() {
		// set state rotating
		if (this.state.movesLeft > 0 && !this.state.gameOver) {
			this.setState({
				rotating: true,
				rotationDirection: 1,
				falling: false,
				movesLeft: this.state.movesLeft - 1
			});
		}
	}
	handleRotateCounter() {
		if (this.state.movesLeft > 0 && !this.state.gameOver) {
			this.setState({
				rotating: true,
				rotationDirection: -1,
				falling: false,
				movesLeft: this.state.movesLeft - 1
			});
		}
	}
	handleRandom() {
		if (this.state.movesLeft > 0 && !this.state.gameOver) {
			const board = randomizeBoard(this.state.board);
			this.setState({ board, movesLeft: this.state.movesLeft - 1 });
		}
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

	render() {
		// Resize when possible?
		// const height = this.state.board
		// 	.map(pile => pile.length)
		// 	.reduce((max, len) => Math.max(max, len), 0);
		// const dim = Math.max( height, this.state.board.length, 2 );

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
			<div>
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
					{this.state.gameOver && (
						<div
							style={Object.assign(
								{
									transform: 'none',
									position: 'absolute',
									background: 'rgba( 255, 255, 255, 0.8 )'
								},
								gameStyle
							)}
						>
							Game Over
						</div>
					)}
					{this.state.levelOver && (
						<div
							style={Object.assign(
								{
									transform: 'none',
									position: 'absolute',
									background: 'rgba( 255, 255, 255, 0.8 )'
								},
								gameStyle
							)}
						>
							<h1>Level Over </h1>
							<div> Time Bonus: {this.state.timeBonus.toLocaleString()} </div>
							<div> Piece Bonus: {this.state.pieceBonus.toLocaleString()} </div>
							<div>
								{' '}
								Score:{' '}
								{(
									this.state.score +
									this.state.timeBonus +
									this.state.pieceBonus
								).toLocaleString()}{' '}
							</div>
							<div onClick={this.goToNextLevel.bind(this)}> Next Level </div>
						</div>
					)}
				</div>
				<Timer1
					startTime={this.state.startTime}
					active={!this.state.levelOver && !this.state.gameOver}
					time={this.state.time}
					setGameOver={this.setGameOver}
				/>
				<div style={{ color: 'white' }}>
					Score:{this.state.score.toLocaleString()}
				</div>
				<div
					style={{ color: 'white' }}
					onClick={this.handleRotateCounter.bind(this, this.state.board)}
				>
					Rotate Counter
				</div>
				<div style={{ color: 'white' }} onClick={this.handleRotate.bind(this)}>
					Rotate
				</div>
				{/* <div class="reloadSingle"></div> */}
				<div style={{ color: 'white' }} onClick={this.handleRandom.bind(this)}>
					Random
				</div>
				<div style={{ color: 'white' }}>Moves Left: {this.state.movesLeft}</div>
				<div style={{ color: 'white' }} onClick={this.handleRestart.bind(this)}>
					Restart
				</div>
				<div style={{ color: 'white' }}>Level: {this.state.level + 1}</div>
			</div>
		);
	}
}

export default App;
