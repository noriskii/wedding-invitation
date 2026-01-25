import { forwardRef } from "react";

export interface CardProps {
	width?: number | string;
	height?: number | string;
	backgroundImage?: string;
	backgroundColor?: string;
	children?: React.ReactNode;
}

const Card = forwardRef<HTMLDivElement, CardProps>(
	(
		{
			width = "100%",
			height = "100%",
			backgroundImage,
			backgroundColor = "#fff",
			children,
		},
		ref
	) => {
		return (
			<div
				ref={ref}
				className="rounded flex items-center justify-center"
				style={{
					width: typeof width === "number" ? `${width}px` : width,
					height: typeof height === "number" ? `${height}px` : height,
					backgroundColor,
					backgroundImage: backgroundImage
						? `url('${backgroundImage}')`
						: undefined,
					backgroundSize: "cover",
					backgroundPosition: "center",
					boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
				}}
			>
				{children}
			</div>
		);
	}
);

Card.displayName = "Card";

export default Card;
