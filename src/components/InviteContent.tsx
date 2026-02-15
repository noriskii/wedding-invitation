import { useState, useEffect } from "react";

export default function InviteContent() {
	const textColor = "#2A4235";
	const [isMobile, setIsMobile] = useState(false);

	useEffect(() => {
		setIsMobile(/Android|iPhone|iPad|iPod/i.test(navigator.userAgent));
	}, []);

	return (
		<div
			className="flex flex-col items-center text-center px-6 py-4 w-full"
			style={{ fontFamily: "'Cinzel', serif", color: textColor }}
		>
			{/* Aquarela decorativa */}
			<img
				src="/images/aquarela.png"
				alt=""
				className="w-32 mb-2"
			/>

			{/* Nomes do casal - Fonte Snell Roundhand */}
			<h1
				className="text-4xl mb-3"
				style={{ fontFamily: "'Snell Roundhand', cursive" }}
			>
				Jéssica e Lucas
			</h1>

			{/* Benção dos pais */}
			<p className="text-[0.7rem] mb-2">
				Com a benção dos seus pais
			</p>

			{/* Nomes dos pais */}
			<div className="flex justify-between w-full gap-8 mb-4 text-[0.7rem]">
				<div className="flex items-center pl-4">
					Andreia da Costa
				</div>
				<div className="flex flex-col pr-4">
					<span>Simone Rosa da Silva</span>
					<span>Renato Pereira da Silva</span>
				</div>
			</div>

			{/* Convite */}
			<p className="text-[0.7rem] mb-1">
				Convidam com muita alegria
			</p>
			<p className="text-[0.7rem] mb-1">
				Para compartilhar um dia em meio a natureza
			</p>
			<p className="text-[0.7rem] mb-4">
				E celebrar o início dessa nova jornada ao lado de quem amam
			</p>

			{/* Data e hora */}
			<p className="text-lg mb-3">
				Sábado | <span className="font-medium">18.04.2026</span> | Às 15h
			</p>

			{/* Local */}
			<h2 className="text-sm font-semibold mb-1">
				CASA GIARDINO
			</h2>
			<a
				href={
					isMobile
						? "https://waze.com/ul?q=Casa+Giardino,+Av.+Prefeito+Francisco+Ribeiro+Nogueira,+3790,+Mogi+das+Cruzes,+SP&navigate=yes"
						: "https://www.google.com/maps/search/?api=1&query=Casa+Giardino+Av.+Prefeito+Francisco+Ribeiro+Nogueira+3790+Mogi+das+Cruzes+SP"
				}
				target={isMobile ? undefined : "_blank"}
				rel="noopener noreferrer"
				style={{
					textDecoration: "underline",
					textDecorationColor: "rgba(42, 66, 53, 0.3)",
					textUnderlineOffset: "3px",
				}}
			>
				<p className="text-[0.7rem] mb-1">
					Av. Prefeito Francisco Ribeiro Nogueira, 3790
				</p>
				<p className="text-[0.7rem] mb-3">
					Mogi das Cruzes, SP
				</p>
			</a>

			{/* Site */}
			<a
				href="https://www.jelucks.com.br"
				target="_blank"
				rel="noopener noreferrer"
				className="text-[0.7rem] underline"
			>
				www.jelucks.com.br
			</a>
		</div>
	);
}
