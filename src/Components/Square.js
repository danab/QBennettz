import React, { PureComponent } from 'react';

class Square extends PureComponent {
	render() {
		const {
			dim,
			rotation,
			squareHeight,
			row,
			col,
			color,
			handleClick
		} = this.props;

		let top;
		let left;

		const modRotation = (rotation % 4 + 4) % 4;

		switch (modRotation) {
			case 0:
				top = squareHeight * (dim - row - 1);
				left = squareHeight * col;
				break;
			case 1:
				top = squareHeight * (dim - col - 1);
				left = squareHeight * (dim - row - 1);
				break;
			case 2:
				left = squareHeight * (dim - col - 1);
				top = squareHeight * row;
				break;
			case 3:
				left = squareHeight * row;
				top = squareHeight * col;
				break;
			default:
				// Number theory suggests this isn't necessary... silly linter
				top = squareHeight * (dim - row - 1);
				left = squareHeight * col;
		}

		return (
			<div
				onTransitionEnd={e => e.stopPropagation()}
				onClick={handleClick(col, row)}
				className="translateX"
				style={{ transform: `translateX(${left}px)` }}
			>
				<div
					className="translateY"
					style={{ transform: `translateY(${top}px)` }}
				>
					<div
						className={`square color-${color}`}
						style={{ height: squareHeight, width: squareHeight }}
					/>
				</div>
			</div>
		);
	}
}
// const Square = ({ dim, squareHeight, row, col, color, handleClick }) => {
// 	return (
// 		<div
// 			className="square"
// 			onClick={handleClick(col, row)}
// 			style={{
// 				top: squareHeight * (dim - row - 1) + 'px',
// 				left: squareHeight * col + 'px',
// 				height: squareHeight,
// 				width: squareHeight
// 			}}
// 		>
// 			<div className={`color-${color}`} />
// 		</div>
// 	);
// };

export default Square;
