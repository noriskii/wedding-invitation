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
			duration: 1.5,
			ease: "power2.inOut",
		},
		card: {
			y: -75,
			duration: 0.4,
			ease: "power2.out",
			offset: "-=0.2",
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
	const [state, setState] = useState<
		"closed" | "open" | "extracted" | "cardOpen"
	>("closed");

	const openEnvelope = () => {
		const envelope = envelopeRef.current;
		const cardEl = cardRef.current;
		if (state !== "closed" || !envelope?.flap || !cardEl) return;

		const tl = gsap.timeline({
			onComplete: () => setState("open"),
		});

		const { flap, card: cardAnim } = ANIMATION_CONFIG.open;

		// Abre a aba
		tl.to(envelope.flap, {
			rotateX: flap.rotateX,
			duration: flap.duration,
			ease: flap.ease,
		});

		// Tira o z-index
		tl.to(envelope.flap, {
			zIndex: -10,
		});

		// Levanta o card um pouco
		tl.to(
			cardEl,
			{
				y: cardAnim.y,
				duration: cardAnim.duration,
				ease: cardAnim.ease,
			},
			cardAnim.offset
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
				scale: 1,
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

	const extractCard = () => {
		const envelope = envelopeRef.current;
		const cardEl = cardRef.current;
		const envelopeContainer = envelopeContainerRef.current;
		const openableCardContainer = openableCardContainerRef.current;
		if (
			state !== "open" ||
			!envelope?.container ||
			!cardEl ||
			!envelopeContainer ||
			!openableCardContainer
		)
			return;

		const tl = gsap.timeline({
			onComplete: () => setState("extracted"),
		});

		const { card: cardAnim, envelope: envAnim } = ANIMATION_CONFIG.extract;

		// Card original sobe mais e some junto com o envelope
		tl.to(cardEl, {
			y: -200,
			opacity: 0,
			duration: 0.4,
			ease: "power2.in",
		});

		// Envelope container some
		tl.to(
			envelopeContainer,
			{
				opacity: envAnim.opacity,
				scale: envAnim.scale,
				y: envAnim.y,
				duration: envAnim.duration,
				ease: envAnim.ease,
			},
			0
		);

		// OpenableCard aparece
		tl.set(openableCardContainer, {
			zIndex: 50,
			pointerEvents: "auto",
		});

		tl.fromTo(
			openableCardContainer,
			{
				opacity: 0,
				scale: 1,
				y: -75,
			},
			{
				opacity: 1,
				scale: cardAnim.scale,
				y: cardAnim.y,
				duration: cardAnim.duration,
				ease: cardAnim.ease,
			},
			0.2
		);

		return tl;
	};

	// Configurar parallax para abertura do card quando extraído
	useEffect(() => {
		if (state !== "extracted") return;

		const openableCardEl = openableCardRef.current;
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

		// Cleanup
		return () => {
			ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
		};
	}, [state]);

	const handleClick = () => {
		switch (state) {
			case "closed":
				openEnvelope();
				break;
			case "open":
				extractCard();
				break;
			// Não há mais click para abrir/fechar o card - é controlado pelo scroll
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

	// Dimensões padrão do envelope para posicionar o card
	const envelopeWidth = envelope.width ?? 480;
	const envelopeHeight = envelope.height ?? 620;
	const contentPadding = envelope.contentPadding ?? 16;

	// Dimensões do card (baseadas no slot interno do envelope) - sempre números
	const cardWidth =
		typeof card.width === "number"
			? card.width
			: envelopeWidth - contentPadding * 2;
	const cardHeight =
		typeof card.height === "number"
			? card.height
			: envelopeHeight - contentPadding * 2 - 16;

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
				{/* Envelope com Card dentro */}
				<div
					ref={envelopeContainerRef}
					className="envelope-container"
					style={{ zIndex: 10 }}
				>
					<Envelope ref={envelopeRef} {...envelope} onClick={handleClick}>
						<Card ref={cardRef} {...card} />
					</Envelope>
				</div>

				{/* Card extraído que abre em abas (começa invisível, posição absoluta no centro) */}
				<div
					ref={openableCardContainerRef}
					className="absolute "
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

			{/* Indicador de scroll (aparece quando o card está extraído) */}
			{isCardExtracted && state !== "cardOpen" && (
				<div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 animate-bounce">
					<div className="text-white/70 text-sm flex flex-col items-center gap-2">
						<span>Role para abrir</span>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							width="24"
							height="24"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							strokeWidth="2"
							strokeLinecap="round"
							strokeLinejoin="round"
						>
							<path d="M12 5v14M19 12l-7 7-7-7" />
						</svg>
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
