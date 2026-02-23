import { useRef, useState, useEffect } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Envelope, { type EnvelopeRef, type EnvelopeProps } from "./Envelope";
import Card, { type CardProps } from "./Card";
import OpenableCard, {
	type OpenableCardRef,
	type OpenableCardProps,
} from "./OpenableCard";
import InviteContent from "./InviteContent";

// Registrar o plugin ScrollTrigger
gsap.registerPlugin(ScrollTrigger);

// Configurações de animação
const ANIMATION_CONFIG = {
	open: {
		flap: {
			rotateX: 180,
			duration: 1,
			ease: "power2.inOut",
		},
		card: {
			y: -75,
			duration: 0.4,
			ease: "power2.out",
			offset: "+=0.5",
		},
	},
	close: {
		card: {
			y: 0,
			scale: 1,
			duration: 0.3,
			ease: "power2.in",
		},
		flap: {
			rotateX: 0,
			duration: 0.5,
			ease: "power2.inOut",
			offset: "-=0.1",
		},
	},
	extract: {
		// Animação para tirar o card do envelope e centralizar na tela
		card: {
			y: 0, // Centralizado verticalmente
			scale: 1.3,
			duration: 1,
			ease: "power2.inOut",
		},
		envelope: {
			opacity: 0,
			scale: 0.8,
			y: 100,
			duration: 0.6,
			ease: "power2.in",
		},
	},
	openCard: {
		// Animação para abrir o card em abas (80% = ~144 graus)
		flaps: {
			angle: 144, // 80% de 180 graus
			duration: 1.2,
			ease: "power2.out",
			stagger: 0.1, // Pequeno delay entre as abas
		},
	},
	intro: {
		duration: 0.8,
		ease: "back.out(1.7)",
		scale: { from: 0, to: 1 },
		rotation: { from: -10, to: 0 },
	},
};

interface SceneProps {
	envelope?: Omit<EnvelopeProps, "onClick" | "children">;
	card?: CardProps;
	openableCard?: OpenableCardProps;
}

export default function Scene({
	envelope = {},
	card = {},
	openableCard = {},
}: SceneProps) {
	const envelopeRef = useRef<EnvelopeRef>(null);
	const envelopeContainerRef = useRef<HTMLDivElement>(null); // Container do envelope
	const cardRef = useRef<HTMLDivElement>(null); // Card dentro do envelope
	const openableCardContainerRef = useRef<HTMLDivElement>(null); // Container do OpenableCard
	const openableCardRef = useRef<OpenableCardRef>(null); // Card que abre em abas
	const scrollGuideRef = useRef<HTMLDivElement>(null); // Ref para o guia de scroll
	const [state, setState] = useState<
		"closed" | "open" | "extracted" | "cardOpen"
	>("closed");
	const [showClickGuide, setShowClickGuide] = useState(false);
	const [viewportScale, setViewportScale] = useState(1);

	// Dimensões base do envelope
	const envelopeWidth = envelope.width ?? 480;
	const envelopeHeight = envelope.height ?? 620;
	const contentPadding = envelope.contentPadding ?? 16;

	// Dimensões do card (baseadas no slot interno do envelope)
	const cardWidth =
		typeof card.width === "number"
			? card.width
			: envelopeWidth - contentPadding * 2;
	const cardHeight =
		typeof card.height === "number"
			? card.height
			: envelopeHeight - contentPadding * 2 - 16;

	// Dimensões escaladas — passadas diretamente aos componentes (sem wrapper CSS)
	const scaledEnvelopeWidth = Math.round(envelopeWidth * viewportScale);
	const scaledEnvelopeHeight = Math.round(envelopeHeight * viewportScale);
	const scaledContentPadding = Math.round(contentPadding * viewportScale);
	const scaledCardWidth = Math.round(cardWidth * viewportScale);
	const scaledCardHeight = Math.round(cardHeight * viewportScale);

	// Escalonamento responsivo baseado no viewport
	useEffect(() => {
		const updateScale = () => {
			const vw = window.innerWidth;
			const vh = window.innerHeight;
			const scaleX = (vw - 32) / envelopeWidth; // 16px padding cada lado
			const scaleY = (vh - 100) / envelopeHeight; // espaço para guia abaixo
			setViewportScale(Math.min(1, scaleX, scaleY));
		};
		updateScale();
		window.addEventListener("resize", updateScale);
		return () => window.removeEventListener("resize", updateScale);
	}, [envelopeWidth, envelopeHeight]);

	// Mostrar o guia de clique imediatamente
	useEffect(() => {
		setShowClickGuide(true);
	}, []);

	// Esconder o guia quando sair do estado closed
	useEffect(() => {
		if (state !== "closed") {
			setShowClickGuide(false);
		}
	}, [state]);

	const openAndExtract = () => {
		const envelopeEl = envelopeRef.current;
		const cardEl = cardRef.current;
		const envelopeContainer = envelopeContainerRef.current;
		const openableCardContainer = openableCardContainerRef.current;
		if (state !== "closed" || !envelopeEl?.flap || !cardEl || !envelopeContainer || !openableCardContainer) return;

		const tl = gsap.timeline({
			onComplete: () => setState("extracted"),
		});

		const { flap, card: openCardAnim } = ANIMATION_CONFIG.open;
		const { card: extractCardAnim, envelope: envAnim } = ANIMATION_CONFIG.extract;

		// 1. Abre a aba do envelope
		tl.to(envelopeEl.flap, {
			rotateX: flap.rotateX,
			duration: flap.duration,
			ease: flap.ease,
		});

		// 2. Tira o z-index da aba
		tl.set(envelopeEl.flap, { zIndex: -10 });

		// 3. Card sobe continuamente: peek e extração em sequência sem pausa
		tl.to(
			cardEl,
			{
				y: openCardAnim.y * viewportScale,
				duration: openCardAnim.duration,
				ease: openCardAnim.ease,
			},
			openCardAnim.offset
		);

		// 4. Card continua subindo e some (sem pausa)
		tl.to(cardEl, {
			y: -200 * viewportScale,
			opacity: 0,
			duration: 0.4,
			ease: "power2.in",
		});

		// 6. Envelope some (paralelo com o card)
		tl.to(
			envelopeContainer,
			{
				opacity: envAnim.opacity,
				scale: envAnim.scale,
				y: envAnim.y * viewportScale,
				duration: envAnim.duration,
				ease: envAnim.ease,
			},
			"<"
		);

		// 7. OpenableCard aparece
		tl.set(openableCardContainer, {
			zIndex: 50,
			pointerEvents: "auto",
		});

		tl.fromTo(
			openableCardContainer,
			{ opacity: 0, scale: viewportScale, y: -75 * viewportScale },
			{
				opacity: 1,
				scale: extractCardAnim.scale * viewportScale,
				y: extractCardAnim.y,
				duration: extractCardAnim.duration,
				ease: extractCardAnim.ease,
			},
			"-=0.2"
		);

		return tl;
	};

	const closeEnvelope = () => {
		const envelope = envelopeRef.current;
		const cardEl = cardRef.current;
		const envelopeContainer = envelopeContainerRef.current;
		const openableCardContainer = openableCardContainerRef.current;
		if (state === "closed" || !envelope?.flap || !cardEl) return;

		const tl = gsap.timeline({
			onComplete: () => setState("closed"),
		});

		const { card: cardAnim, flap } = ANIMATION_CONFIG.close;

		// Se estava extraído, precisamos reverter tudo
		if (state === "extracted" && envelopeContainer && openableCardContainer) {
			// Esconde o card extraído
			tl.to(openableCardContainer, {
				opacity: 0,
				y: -75,
				scale: viewportScale,
				duration: 0.3,
				ease: "power2.in",
			});

			// Mostra o envelope novamente
			tl.to(
				envelopeContainer,
				{
					opacity: 1,
					scale: 1,
					y: 0,
					duration: 0.4,
					ease: "power2.out",
				},
				0.1
			);

			// Mostra o card original novamente
			tl.to(
				cardEl,
				{
					opacity: 1,
					y: -75, // Posição "open"
					duration: 0.3,
					ease: "power2.out",
				},
				0.2
			);
		}

		// Abaixa o card para posição fechada
		tl.to(cardEl, {
			y: cardAnim.y,
			scale: cardAnim.scale,
			duration: cardAnim.duration,
			ease: cardAnim.ease,
		});

		// Fecha a aba
		tl.to(
			envelope.flap,
			{
				rotateX: flap.rotateX,
				duration: flap.duration,
				ease: flap.ease,
				zIndex: 10,
			},
			flap.offset
		);

		return tl;
	};

	// Configurar parallax para abertura do card quando extraído
	useEffect(() => {
		if (state !== "extracted") return;

		const openableCardEl = openableCardRef.current;
		const scrollGuideEl = scrollGuideRef.current;
		const scrollContainer = document.querySelector(".scroll-container");
		if (!openableCardEl?.leftFlap || !openableCardEl?.rightFlap || !scrollContainer)
			return;

		const { flaps } = ANIMATION_CONFIG.openCard;

		// Criar timeline para o parallax
		const tl = gsap.timeline({
			scrollTrigger: {
				trigger: scrollContainer,
				start: "top top",
				end: "bottom bottom",
				scrub: 0.5, // Suaviza a animação com o scroll
			},
		});

		// Animação das abas vinculada ao scroll
		// Aba esquerda: rotação negativa para abrir para a esquerda (origin: left center)
		tl.to(
			openableCardEl.leftFlap,
			{
				rotateY: -flaps.angle,
				ease: "none",
			},
			0
		);

		// Aba direita: rotação positiva para abrir para a direita (origin: right center)
		tl.to(
			openableCardEl.rightFlap,
			{
				rotateY: flaps.angle,
				ease: "none",
			},
			0
		);

		// Animação de entrada do guia de scroll (GSAP, sem CSS animation)
		if (scrollGuideEl) {
			gsap.fromTo(
				scrollGuideEl,
				{ opacity: 0, y: 10 },
				{ opacity: 1, y: 0, duration: 0.4, ease: "power2.out", delay: 0 }
			);

			// Fade out do guia de scroll conforme o usuário rola
			gsap.to(scrollGuideEl, {
				opacity: 0,
				scrollTrigger: {
					trigger: scrollContainer,
					start: "top top",
					end: "25% top",
					scrub: true,
				},
			});
		}

		// Cleanup
		return () => {
			ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
		};
	}, [state]);

	const handleClick = () => {
		if (state === "closed") {
			setShowClickGuide(false);
			openAndExtract();
		}
	};

	// Animação de entrada
	const playIntroAnimation = () => {
		const { intro } = ANIMATION_CONFIG;

		const tl = gsap.timeline();

		tl.fromTo(
			".envelope-container",
			{ scale: intro.scale.from, rotation: intro.rotation.from },
			{
				scale: intro.scale.to,
				rotation: intro.rotation.to,
				duration: intro.duration,
				ease: intro.ease,
			}
		);

		return tl;
	};

	const isCardExtracted = state === "extracted" || state === "cardOpen";

	return (
		<div
			className="scroll-container"
			style={{
				// Altura extra para permitir scroll quando o card está extraído
				minHeight: isCardExtracted ? "300vh" : "100vh",
			}}
		>
			{/* Container fixo para o conteúdo visual */}
			<div className="fixed inset-0 flex items-center justify-center">
				{/* Wrapper sem transformações CSS para não interferir com 3D */}
				<div className="relative">
					{/* Envelope com Card dentro */}
					<div
						ref={envelopeContainerRef}
						className="envelope-container"
						style={{ zIndex: 10 }}
					>
						<Envelope
							ref={envelopeRef}
							{...envelope}
							width={scaledEnvelopeWidth}
							height={scaledEnvelopeHeight}
							contentPadding={scaledContentPadding}
							onClick={handleClick}
						>
							<Card ref={cardRef} {...card} width={scaledCardWidth} height={scaledCardHeight} />
						</Envelope>
					</div>

					{/* Guia "Clique para abrir" - centralizado abaixo do envelope */}
					{showClickGuide && (state === "closed" || state === "open") && (
						<div
							className="absolute z-50 pointer-events-none animate-pulse"
							style={{
								top: "100%",
								left: "50%",
								transform: "translateX(-50%)",
								marginTop: "20px",
							}}
						>
							<span
								style={{
									color: "#2D6A4F",
									textShadow: "0 1px 8px rgba(0,0,0,0.3)",
									fontFamily: "'Cinzel', serif",
									fontSize: "14px",
									fontWeight: 500,
									letterSpacing: "2px",
									textTransform: "uppercase",
									whiteSpace: "nowrap",
								}}
							>
								Clique para abrir
							</span>
						</div>
					)}

				</div>

				{/* Card extraído que abre em abas (começa invisível, posição absoluta no centro) */}
				<div
					ref={openableCardContainerRef}
					className="absolute"
					style={{
						opacity: 0,
						zIndex: -1,
						pointerEvents: "none",
					}}
				>
					<OpenableCard
						ref={openableCardRef}
						width={cardWidth}
						height={cardHeight}
						coverColor={card.backgroundColor}
						coverImage={card.backgroundImage}
						leftFlapImage="/images/aba-esquerda.png"
						rightFlapImage="/images/aba-direita.png"
						innerTopImage="/images/cima.png"
						innerTopHeight={67}
						innerBottomImage="/images/baixo.png"
						innerBottomHeight={67}
						innerColor="#ffffff"
						{...openableCard}
					>
						<InviteContent />
					</OpenableCard>
				</div>
			</div>

			{/* Guia "Role a página" com setas (estado extracted) - usa GSAP para controle total */}
			{isCardExtracted && (
				<div
					ref={scrollGuideRef}
					className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 pointer-events-none"
					style={{ opacity: 0 }}
				>
					<div
						className="flex flex-col items-center gap-1"
						style={{
							color: "#2D6A4F",
							textShadow: "0 1px 8px rgba(0,0,0,0.3)",
						}}
					>
						<span
							style={{
								fontFamily: "'Cinzel', serif",
								fontSize: "14px",
								fontWeight: 500,
								letterSpacing: "2px",
								textTransform: "uppercase",
							}}
						>
							Role a página
						</span>
						<div
							className="flex flex-col items-center"
							style={{ animation: "scrollArrows 1.5s ease-in-out infinite" }}
						>
							<svg
								xmlns="http://www.w3.org/2000/svg"
								width="22"
								height="22"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								strokeWidth="2"
								strokeLinecap="round"
								strokeLinejoin="round"
								style={{ opacity: 0.6, marginBottom: "-6px" }}
							>
								<path d="M7 10l5 5 5-5" />
							</svg>
							<svg
								xmlns="http://www.w3.org/2000/svg"
								width="22"
								height="22"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								strokeWidth="2"
								strokeLinecap="round"
								strokeLinejoin="round"
								style={{ opacity: 0.8, marginBottom: "-6px" }}
							>
								<path d="M7 10l5 5 5-5" />
							</svg>
							<svg
								xmlns="http://www.w3.org/2000/svg"
								width="22"
								height="22"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								strokeWidth="2"
								strokeLinecap="round"
								strokeLinejoin="round"
								style={{ opacity: 1 }}
							>
								<path d="M7 10l5 5 5-5" />
							</svg>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}

// Exporta a configuração para customização externa
export { ANIMATION_CONFIG };

// Exporta funções utilitárias do GSAP
export const gsapUtils = {
	timeline: gsap.timeline,
	to: gsap.to,
	from: gsap.from,
	fromTo: gsap.fromTo,
	set: gsap.set,
};
