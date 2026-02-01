import { forwardRef, useImperativeHandle, useRef } from "react";

export interface OpenableCardProps {
	width?: number;
	height?: number;
	coverColor?: string;
	innerColor?: string;
	coverImage?: string;
	leftFlapImage?: string;
	rightFlapImage?: string;
	innerTopImage?: string;
	innerTopHeight?: number | string;
	innerBottomImage?: string;
	innerBottomHeight?: number | string;
	children?: React.ReactNode;
}

export interface OpenableCardRef {
	container: HTMLDivElement | null;
	leftFlap: HTMLDivElement | null;
	rightFlap: HTMLDivElement | null;
	innerPage: HTMLDivElement | null;
}

const OpenableCard = forwardRef<OpenableCardRef, OpenableCardProps>(
	(
		{
			width = 448,
			height = 572,
			coverColor = "#fff",
			innerColor = "#fffef5",
			coverImage,
			leftFlapImage,
			rightFlapImage,
			innerTopImage,
			innerTopHeight,
			innerBottomImage,
			innerBottomHeight,
			children,
		},
		ref
	) => {
		const containerRef = useRef<HTMLDivElement>(null);
		const leftFlapRef = useRef<HTMLDivElement>(null);
		const rightFlapRef = useRef<HTMLDivElement>(null);
		const innerPageRef = useRef<HTMLDivElement>(null);

		useImperativeHandle(ref, () => ({
			get container() {
				return containerRef.current;
			},
			get leftFlap() {
				return leftFlapRef.current;
			},
			get rightFlap() {
				return rightFlapRef.current;
			},
			get innerPage() {
				return innerPageRef.current;
			},
		}));

		const flapWidth = width / 2;

		const coverStyle: React.CSSProperties = {
			width: `${flapWidth}px`,
			height: `${height}px`,
			backgroundColor: coverColor,
			backgroundImage: coverImage ? `url('${coverImage}')` : undefined,
			backgroundSize: "cover",
			backgroundPosition: "center",
			backfaceVisibility: "hidden",
		};

		return (
			<div
				ref={containerRef}
				className="relative"
				style={{
					width: `${width}px`,
					height: `${height}px`,
					perspective: "2000px",
					perspectiveOrigin: "center center",
				}}
			>
				{/* Página interna (centro) - sempre visível quando aberto */}
				<div
					ref={innerPageRef}
					className="absolute inset-0 rounded-lg flex flex-col"
					style={{
						backgroundColor: innerColor,
						boxShadow: "inset 0 0 20px rgba(0,0,0,0.05)",
					}}
				>
					{/* Imagem de cima (largura 100%, altura editável) */}
					{innerTopImage && (
						<img
							src={innerTopImage}
							alt=""
							style={{
								width: "100%",
								height: innerTopHeight
									? typeof innerTopHeight === "number"
										? `${innerTopHeight}px`
										: innerTopHeight
									: "auto",
								objectFit: "cover",
								objectPosition: "center",
								flexShrink: 0,
							}}
						/>
					)}

					{/* Área central - conteúdo livre */}
					<div className="flex-1 flex items-center justify-center overflow-hidden">
						{children}
					</div>

					{/* Imagem de baixo (largura 100%, altura editável) */}
					{innerBottomImage && (
						<img
							src={innerBottomImage}
							alt=""
							style={{
								width: "100%",
								height: innerBottomHeight
									? typeof innerBottomHeight === "number"
										? `${innerBottomHeight}px`
										: innerBottomHeight
									: "auto",
								objectFit: "cover",
								objectPosition: "center",
								flexShrink: 0,
							}}
						/>
					)}
				</div>

				{/* Aba esquerda - abre para a esquerda (rotaciona a partir da borda esquerda) */}
				<div
					ref={leftFlapRef}
					className="absolute top-0 left-0 rounded-l-lg"
					style={{
						...coverStyle,
						transformOrigin: "left center",
						transform: "rotateY(0deg)",
						transformStyle: "preserve-3d",
						zIndex: 2,
					}}
				>
					{/* Frente da aba esquerda (metade esquerda da capa/aquarela) */}
					<div
						className="absolute inset-0 rounded-l-lg"
						style={{
							backgroundColor: coverColor,
							backgroundImage: coverImage ? `url('${coverImage}')` : undefined,
							backgroundSize: `${width}px ${height}px`,
							backgroundPosition: "left center",
							backfaceVisibility: "hidden",
						}}
					/>
					{/* Verso da aba esquerda (visível quando abre) */}
					<div
						className="absolute inset-0 rounded-l-lg"
						style={{
							backgroundColor: innerColor,
							backgroundImage: leftFlapImage ? `url('${leftFlapImage}')` : undefined,
							backgroundSize: "cover",
							backgroundPosition: "center",
							transform: "rotateY(180deg)",
							backfaceVisibility: "hidden",
							boxShadow: "inset 0 0 15px rgba(0,0,0,0.03)",
						}}
					/>
				</div>

				{/* Aba direita - abre para a direita (rotaciona a partir da borda direita) */}
				<div
					ref={rightFlapRef}
					className="absolute top-0 right-0 rounded-r-lg"
					style={{
						...coverStyle,
						transformOrigin: "right center",
						transform: "rotateY(0deg)",
						transformStyle: "preserve-3d",
						zIndex: 2,
					}}
				>
					{/* Frente da aba direita (metade direita da capa/aquarela) */}
					<div
						className="absolute inset-0 rounded-r-lg"
						style={{
							backgroundColor: coverColor,
							backgroundImage: coverImage ? `url('${coverImage}')` : undefined,
							backgroundSize: `${width}px ${height}px`,
							backgroundPosition: "right center",
							backfaceVisibility: "hidden",
						}}
					/>
					{/* Verso da aba direita (visível quando abre) */}
					<div
						className="absolute inset-0 rounded-r-lg"
						style={{
							backgroundColor: innerColor,
							backgroundImage: rightFlapImage ? `url('${rightFlapImage}')` : undefined,
							backgroundSize: "cover",
							backgroundPosition: "center",
							transform: "rotateY(180deg)",
							backfaceVisibility: "hidden",
							boxShadow: "inset 0 0 15px rgba(0,0,0,0.03)",
						}}
					/>
				</div>
			</div>
		);
	}
);

OpenableCard.displayName = "OpenableCard";

export default OpenableCard;
