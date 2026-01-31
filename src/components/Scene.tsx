import { useRef, useState } from "react";
import { gsap } from "gsap";
import Envelope, { type EnvelopeRef, type EnvelopeProps } from "./Envelope";
import Card, { type CardProps } from "./Card";

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
}

export default function Scene({ envelope = {}, card = {} }: SceneProps) {
	const envelopeRef = useRef<EnvelopeRef>(null);
	const cardRef = useRef<HTMLDivElement>(null); // Card dentro do envelope
	const extractedCardRef = useRef<HTMLDivElement>(null); // Card extraído (independente)
	const [state, setState] = useState<"closed" | "open" | "extracted">("closed");

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
		const extractedCardEl = extractedCardRef.current;
		if (state === "closed" || !envelope?.flap || !cardEl) return;

		const tl = gsap.timeline({
			onComplete: () => setState("closed"),
		});

		const { card: cardAnim, flap } = ANIMATION_CONFIG.close;

		// Se estava extraído, precisamos reverter tudo
		if (state === "extracted" && envelope.container && extractedCardEl) {
			// Esconde o card extraído
			tl.to(extractedCardEl, {
				opacity: 0,
				y: -75,
				scale: 1,
				duration: 0.3,
				ease: "power2.in",
			});

			// Mostra o envelope novamente
			tl.to(
				envelope.container,
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
		const extractedCardEl = extractedCardRef.current;
		if (state !== "open" || !envelope?.container || !cardEl || !extractedCardEl)
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

		// Envelope some
		tl.to(
			envelope.container,
			{
				opacity: envAnim.opacity,
				scale: envAnim.scale,
				y: envAnim.y,
				duration: envAnim.duration,
				ease: envAnim.ease,
			},
			0
		);

		// Card extraído aparece (começa invisível na posição do card original)
		tl.fromTo(
			extractedCardEl,
			{
				opacity: 0,
				scale: 1,
				y: -75, // Mesma posição que o card quando está "open"
			},
			{
				opacity: 1,
				scale: cardAnim.scale,
				y: cardAnim.y,
				duration: cardAnim.duration,
				ease: cardAnim.ease,
			},
			0.2 // Pequeno delay para sincronizar com o desaparecimento
		);

		return tl;
	};

	const handleClick = () => {
		switch (state) {
			case "closed":
				openEnvelope();
				break;
			case "open":
				extractCard();
				break;
			case "extracted":
				closeEnvelope();
				break;
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

	// Dimensões do card (baseadas no slot interno do envelope)
	const cardWidth = card.width ?? envelopeWidth - contentPadding * 2;
	const cardHeight = card.height ?? envelopeHeight - contentPadding * 2 - 16;

	return (
		<div className="min-h-screen flex items-center justify-center overflow-hidden">
			{/* Envelope com Card dentro */}
			<div className="envelope-container" style={{ zIndex: 10 }}>
				<Envelope ref={envelopeRef} {...envelope} onClick={handleClick}>
					<Card ref={cardRef} {...card} />
				</Envelope>
			</div>

			{/* Card extraído (independente, começa invisível) */}
			<div
				ref={extractedCardRef}
				className="absolute pointer-events-none"
				style={{
					opacity: 0,
					zIndex: 50,
					pointerEvents: state === "extracted" ? "auto" : "none",
					cursor: state === "extracted" ? "pointer" : "default",
				}}
				onClick={state === "extracted" ? handleClick : undefined}
			>
				<Card {...card} width={cardWidth} height={cardHeight} />
			</div>
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
