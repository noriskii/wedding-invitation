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
		const sealSize = Math.round(90 * (width / 480));

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
						boxShadow: "0 24px 64px rgba(0,0,0,0.45), 0 8px 24px rgba(0,0,0,0.28)",
					}}
				>
					{/* Parte interna do envelope */}
					<div
						className="absolute inset-0 border-t"
						style={{
							background: `linear-gradient(160deg, ${innerColor} 0%, #1a2b22 100%)`,
						}}
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
						className="absolute z-10 bottom-0 left-0 right-0 rounded-b-md"
						style={{
							height: `${height * 0.6}px`,
							background: `linear-gradient(170deg, #324f3e 0%, ${bodyColor} 45%, #1e3028 100%)`,
						}}
					/>
					<div className="absolute bottom-20 left-0 w-16 h-4 rounded-t-lg" style={{
						height: `${height * 0.6}px`,
						background: `linear-gradient(100deg, #2f4b3a 0%, ${bodyColor} 60%, #1c2e24 100%)`,
					}}></div>
					<div className="absolute bottom-20 right-0 w-16 h-4 rounded-t-lg" style={{
						height: `${height * 0.6}px`,
						background: `linear-gradient(260deg, #1e3028 0%, ${bodyColor} 60%, #2f4b3a 100%)`,
					}}></div>


					{/* Aba do envelope (flap) */}
					<div
						ref={flapRef}
						className="absolute left-0 top-0 z-10 border-b rounded-b-2xl flex items-center justify-center"
						style={{
							width: `${width}px`,
							height: `${flapSize}px`,
							// marginLeft: `-${flapSize / 2}px`,
							background: `linear-gradient(180deg, #2f4d3c 0%, ${flapColor} 50%, #1f3229 100%)`,
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
								bottom: `-${sealSize / 2}px`,
								width: `${sealSize}px`,
								height: `${sealSize}px`,
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
