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
		// Animação para tirar o card do envelope
		card: {
			y: -400,
			scale: 1.1,
			duration: 0.8,
			ease: "power2.out",
		},
		envelope: {
			opacity: 0.3,
			scale: 0.9,
			duration: 0.5,
			ease: "power2.out",
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
	const cardRef = useRef<HTMLDivElement>(null);
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
		if (state === "closed" || !envelope?.flap || !cardEl) return;

		const tl = gsap.timeline({
			onComplete: () => setState("closed"),
		});

		const { card: cardAnim, flap } = ANIMATION_CONFIG.close;

		// Abaixa o card
		tl.to(cardEl, {
			y: cardAnim.y,
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
			},
			flap.offset
		);

		// Reset do envelope se estava extraído
		if (state === "extracted" && envelope.container) {
			tl.to(
				envelope.container,
				{
					opacity: 1,
					scale: 1,
					duration: 0.3,
				},
				0
			);
		}

		return tl;
	};

	const extractCard = () => {
		const envelope = envelopeRef.current;
		const cardEl = cardRef.current;
		if (state !== "open" || !envelope?.container || !cardEl) return;

		const tl = gsap.timeline({
			onComplete: () => setState("extracted"),
		});

		const { card: cardAnim, envelope: envAnim } = ANIMATION_CONFIG.extract;

		// Tira o card do envelope
		tl.to(cardEl, {
			y: cardAnim.y,
			scale: cardAnim.scale,
			duration: cardAnim.duration,
			ease: cardAnim.ease,
		});

		// Diminui o envelope
		tl.to(
			envelope.container,
			{
				opacity: envAnim.opacity,
				scale: envAnim.scale,
				duration: envAnim.duration,
				ease: envAnim.ease,
			},
			"-=0.5"
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

	return (
		<div className="min-h-screen flex items-center justify-center">
			<div className="envelope-container">
				<Envelope ref={envelopeRef} {...envelope} onClick={handleClick}>
					<Card ref={cardRef} {...card} />
				</Envelope>
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
