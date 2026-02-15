import { forwardRef, useRef, useImperativeHandle } from "react";

export interface EnvelopeProps {
	width?: number;
	height?: number;
	bodyColor?: string;
	flapColor?: string;
	innerColor?: string;
	contentPadding?: number;
	onClick?: () => void;
	children?: React.ReactNode;
}

export interface EnvelopeRef {
	flap: HTMLDivElement | null;
	contentSlot: HTMLDivElement | null;
	container: HTMLDivElement | null;
}

const Envelope = forwardRef<EnvelopeRef, EnvelopeProps>(
	(
		{
			width = 480,
			height = 620,
			bodyColor = "#2A4235",
			flapColor = "#2A4235",
			innerColor = "#203228",
			contentPadding = 16,
			onClick,
			children,
		},
		ref
	) => {
		const containerRef = useRef<HTMLDivElement>(null);
		const flapRef = useRef<HTMLDivElement>(null);
		const contentSlotRef = useRef<HTMLDivElement>(null);

		useImperativeHandle(ref, () => ({
			get flap() {
				return flapRef.current;
			},
			get contentSlot() {
				return contentSlotRef.current;
			},
			get container() {
				return containerRef.current;
			},
		}));

		const flapSize = width * 0.7;

		return (
			<div
				ref={containerRef}
				className="cursor-pointer select-none"
				style={{ perspective: "1000px" }}
				onClick={onClick}
			>
				<div
					className="relative"
					style={{
						width: `${width}px`,
						height: `${height}px`,
					}}
				>
					{/* Parte interna do envelope */}
					<div
						className="absolute inset-0 border-t"
						style={{ backgroundColor: innerColor }}
					/>

					{/* Slot do conteúdo (Card vai aqui) */}
					<div
						ref={contentSlotRef}
						className="absolute flex items-center justify-center"
						style={{
							top: contentPadding,
							left: contentPadding,
							right: contentPadding,
							bottom: contentPadding + 16,
						}}
					>
						{children}
					</div>

					{/* Corpo do envelope (parte frontal) */}
					<div
						className="absolute z-10 bottom-0 left-0 right-0 rounded-b-md "
						style={{
							height: `${height * 0.6}px`,
							backgroundColor: bodyColor,
						}}
					/>
					<div className="absolute bottom-20 left-0 w-16 h-4 rounded-t-lg " style={{
						height: `${height * 0.6}px`,
						backgroundColor: bodyColor,
					}}></div>
					<div className="absolute bottom-20 right-0 w-16 h-4 rounded-t-lg " style={{
						height: `${height * 0.6}px`,
						backgroundColor: bodyColor,
					}}></div>


					{/* Aba do envelope (flap) */}
					<div
						ref={flapRef}
						className="absolute left-0 top-0 z-10 border-b rounded-b-2xl flex items-center justify-center"
						style={{
							width: `${width}px`,
							height: `${flapSize}px`,
							// marginLeft: `-${flapSize / 2}px`,
							backgroundColor: flapColor,
							transformOrigin: "top center",
							transform: "rotateX(0deg)",
						}}
					>
						{/* Selo */}
						<img
							src="/images/selo.png"
							alt="Selo do envelope"
							className="absolute left-1/2 -translate-x-1/2 z-10"
							style={{
								bottom: `-${flapSize * 0.125}px`, // Adjust vertical position to be on the edge
								width: '90px',
								height: '90px',
							}}
						/>
					</div>

					{/* Triângulo interno (aparece quando abre) */}
					{/* <div
						className="absolute left-1/2 top-0"
						style={{
							width: `${flapSize}px`,
							height: `${flapSize}px`,
							marginLeft: `-${flapSize / 2}px`,
							backgroundColor: innerColor,
							clipPath: "polygon(50% 100%, 0% 0%, 100% 0%)",
							zIndex: -1,
						}}
					/> */}
				</div>
			</div>
		);
	}
);

Envelope.displayName = "Envelope";

export default Envelope;
