import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Construtor de Prompts Avançados",
  description: "Assistente interativo para criar prompts complexos e eficazes.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
