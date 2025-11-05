# Construtor de Prompts Avançados

Aplicação web interativa para planejar e gerar prompts robustos. Desenvolvida com Next.js 14, React 18 e Tailwind CSS.

## Scripts disponíveis

- `npm run dev` – ambiente de desenvolvimento com recarregamento automático.
- `npm run build` – compila o projeto para produção.
- `npm run start` – executa a build de produção localmente.
- `npm run lint` – executa a checagem de lint.

## Como funciona

1. O assistente conduz perguntas essenciais sobre objetivo, contexto, entradas, restrições e formatos.
2. Sugestões inteligentes apontam lacunas e oportunidades de melhoria.
3. O prompt estruturado é gerado em tempo real, pronto para copiar assim que as etapas obrigatórias são preenchidas.

## Deploy

Hospedagem pensada para Vercel. Após `npm run build`, utilize `vercel deploy --prod --yes --token $VERCEL_TOKEN --name agentic-ffde66b6`.
