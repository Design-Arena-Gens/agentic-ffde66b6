"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/utils";

type QuestionType = "short" | "long" | "choice" | "tags";

type QuestionDefinition = {
  id: string;
  title: string;
  description?: string;
  placeholder?: string;
  required?: boolean;
  type: QuestionType;
  options?: string[];
};

type AnswerValue = string | string[];

type AnswerMap = Record<string, AnswerValue>;

const baseQuestions: QuestionDefinition[] = [
  {
    id: "goal",
    title: "Qual é o objetivo central?",
    description:
      "Defina claramente o resultado desejado. Por exemplo: " +
      '"Crie um plano de aula interativo para ensinar frações a alunos do 6º ano".',
    placeholder: "Descreva o objetivo final do prompt...",
    required: true,
    type: "long",
  },
  {
    id: "audience",
    title: "Para quem (ou o que) o prompt será executado?",
    description:
      "Informe o modelo, persona ou ferramenta que deve interpretar a instrução.",
    placeholder: "Ex.: GPT-4 como consultor de marketing, Claude como analista jurídico, etc.",
    required: true,
    type: "short",
  },
  {
    id: "context",
    title: "Qual é o contexto essencial?",
    description:
      "Cenário, restrições de domínio, recursos disponíveis ou informações prévias que o modelo deve conhecer.",
    placeholder: "Inclua detalhes relevantes sobre o cenário...",
    required: true,
    type: "long",
  },
  {
    id: "inputs",
    title: "Quais dados de entrada o usuário fornecerá?",
    description:
      "Liste as variáveis, formatos e referências que o solicitante deve informar ao usar o prompt.",
    placeholder: "Ex.: lista de requisitos, tom de voz desejado, links, anexos...",
    type: "long",
  },
  {
    id: "constraints",
    title: "Restrições e requisitos obrigatórios",
    description:
      "Defina limites de tamanho, estilo, fontes confiáveis, linguagem proibida ou procedimentos mandatórios.",
    placeholder: "Liste cada restrição em linhas separadas...",
    type: "long",
  },
  {
    id: "tone",
    title: "Tom e postura",
    description: "Selecione estilos de comunicação que devem ser seguidos pelo modelo.",
    type: "tags",
    options: [
      "Profissional",
      "Instrutivo",
      "Persuasivo",
      "Empático",
      "Criativo",
      "Analítico",
      "Objetivo",
    ],
  },
  {
    id: "format",
    title: "Formato da resposta",
    description:
      "Determine como o resultado deve ser apresentado (estrutura, etapas, modelos, listas, tabelas).",
    placeholder: "Ex.: tabela Markdown, checklist numerado, JSON com campos específicos...",
    required: true,
    type: "long",
  },
  {
    id: "quality",
    title: "Critérios de qualidade e validação",
    description:
      "Como avaliar se a resposta final é boa? Inclua métricas, checks ou expectativas claras.",
    placeholder: "Ex.: cobrir no mínimo 5 estratégias, citar fontes confiáveis, destacar riscos...",
    type: "long",
  },
];

const requiredIds = baseQuestions.filter((q) => q.required).map((q) => q.id);

const heroHighlights = [
  "Detecta lacunas automaticamente",
  "Gera prompts estruturados prontos para uso",
  "Sugere perguntas complementares em tempo real",
];

function isFilled(value?: AnswerValue) {
  if (typeof value === "string") {
    return value.trim().length > 3;
  }
  if (Array.isArray(value)) {
    return value.length > 0;
  }
  return false;
}

function toLines(text?: AnswerValue) {
  if (typeof text !== "string") return [];
  return text
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

function buildPrompt(answers: AnswerMap) {
  if (requiredIds.some((id) => !isFilled(answers[id]))) {
    return "Responda às perguntas essenciais para ver o prompt final.";
  }

  const sections: { label: string; content?: string | string[] }[] = [
    {
      label: "Objetivo",
      content: answers.goal,
    },
    {
      label: "Papel do modelo",
      content: answers.audience,
    },
    {
      label: "Contexto",
      content: answers.context,
    },
    {
      label: "Entradas do usuário",
      content: toLines(answers.inputs),
    },
    {
      label: "Restrições",
      content: toLines(answers.constraints),
    },
    {
      label: "Tom e postura",
      content: Array.isArray(answers.tone) ? answers.tone : undefined,
    },
    {
      label: "Formato da resposta",
      content: answers.format,
    },
    {
      label: "Critérios de validação",
      content: answers.quality,
    },
  ];

  const body = sections
    .filter((section) =>
      Array.isArray(section.content)
        ? section.content.length
        : typeof section.content === "string"
        ? section.content.trim().length > 0
        : false
    )
    .map((section) => {
      if (Array.isArray(section.content)) {
        const list = section.content
          .map((item) => `- ${item}`)
          .join("\n");
        return `### ${section.label}\n${list}`;
      }
      return `### ${section.label}\n${section.content}`;
    })
    .join("\n\n");

  return [
    "Você é um assistente especializado em engenharia de prompts.",
    "Siga o briefing a seguir com total fidelidade.",
    body,
    "Confirme se as entradas fornecidas estão completas; caso contrário, solicite o que estiver faltando antes de responder.",
  ]
    .filter(Boolean)
    .join("\n\n");
}

function deriveInsights(answers: AnswerMap) {
  const insights: string[] = [];

  if (!isFilled(answers.inputs)) {
    insights.push(
      "Detalhe os insumos que o usuário deve fornecer ao usar o prompt para evitar respostas vagas."
    );
  }

  if (!isFilled(answers.constraints)) {
    insights.push(
      "Defina limites claros (tamanho, tom, fontes, passos obrigatórios) para garantir consistência."
    );
  }

  if (!isFilled(answers.quality)) {
    insights.push(
      "Inclua critérios de verificação para que o modelo valide a própria resposta antes de entregar."
    );
  }

  if (isFilled(answers.goal) && typeof answers.goal === "string") {
    if (answers.goal.toLowerCase().includes("estratégia")) {
      insights.push(
        "Peça ao modelo para apresentar diferentes cenários e riscos associados a cada recomendação."
      );
    }
    if (answers.goal.toLowerCase().includes("conteúdo")) {
      insights.push(
        "Garanta que o modelo defina público-alvo, canal de distribuição e indicadores de desempenho."
      );
    }
  }

  if (
    isFilled(answers.audience) &&
    typeof answers.audience === "string" &&
    answers.audience.toLowerCase().includes("junior")
  ) {
    insights.push(
      "Instrua o modelo a explicar o raciocínio passo a passo antes de apresentar o resultado final."
    );
  }

  if (!insights.length) {
    insights.push("Ótimo! As informações essenciais estão cobertas. Revise e refine se desejar.");
  }

  return insights;
}

function inferProgress(answers: AnswerMap) {
  const answered = baseQuestions.filter((question) => isFilled(answers[question.id]));
  return Math.round((answered.length / baseQuestions.length) * 100);
}

function getQuestionState(answers: AnswerMap) {
  return baseQuestions.map((question) => ({
    ...question,
    filled: isFilled(answers[question.id]),
  }));
}

export function PromptBuilder() {
  const [answers, setAnswers] = useState<AnswerMap>({ tone: [] });
  const [currentIndex, setCurrentIndex] = useState(0);
  const [customTagDraft, setCustomTagDraft] = useState("");
  const [copied, setCopied] = useState(false);

  const questionsWithState = useMemo(() => getQuestionState(answers), [answers]);
  const activeQuestion = questionsWithState[currentIndex];
  const progress = inferProgress(answers);
  const prompt = useMemo(() => buildPrompt(answers), [answers]);
  const insights = useMemo(() => deriveInsights(answers), [answers]);

  const pendingRequired = requiredIds.filter((id) => !isFilled(answers[id]));

  const handleValueChange = (value: AnswerValue) => {
    setAnswers((prev) => ({
      ...prev,
      [activeQuestion.id]: value,
    }));
    if (!activeQuestion.required) {
      return;
    }
  };

  const handleContinue = () => {
    setCurrentIndex((prev) => Math.min(prev + 1, baseQuestions.length - 1));
  };

  const handleBack = () => {
    setCurrentIndex((prev) => Math.max(prev - 1, 0));
  };

  const selectQuestion = (index: number) => {
    setCurrentIndex(index);
  };

  const toggleTag = (tag: string) => {
    setAnswers((prev) => {
      const currentValue = prev.tone;
      const tags = Array.isArray(currentValue) ? [...currentValue] : [];
      const exists = tags.includes(tag);
      const nextTags = exists ? tags.filter((item) => item !== tag) : [...tags, tag];
      return { ...prev, tone: nextTags };
    });
  };

  const addCustomTag = () => {
    const formatted = customTagDraft.trim();
    if (!formatted) return;
    toggleTag(formatted.charAt(0).toUpperCase() + formatted.slice(1));
    setCustomTagDraft("");
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(prompt);
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 pb-16">
      <section className="rounded-3xl bg-white/80 p-8 shadow-xl shadow-primary-900/5 backdrop-blur-sm">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full bg-primary-100 px-3 py-1 text-sm font-medium text-primary-700">
              <span className="h-2 w-2 rounded-full bg-primary-500" />
              Assistente inteligente de prompts
            </p>
            <h1 className="mt-4 text-3xl font-semibold text-slate-900 md:text-4xl">
              Construa prompts robustos com diálogo guiado
            </h1>
            <p className="mt-3 max-w-xl text-base text-slate-600">
              Avance pelas perguntas essenciais, receba sugestões contextuais e gere instruções completas em poucos minutos.
            </p>
          </div>
          <div className="grid gap-3 text-sm text-slate-600">
            {heroHighlights.map((highlight) => (
              <div
                key={highlight}
                className="flex items-center gap-3 rounded-2xl border border-primary-100/80 bg-primary-50/60 px-4 py-3"
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-500/10 text-primary-600">
                  •
                </span>
                <p className="font-medium leading-snug">{highlight}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="mt-8 h-2 w-full overflow-hidden rounded-full bg-slate-100">
          <div
            className="h-full rounded-full bg-gradient-to-r from-primary-500 to-primary-300 transition-all duration-300"
            style={{ width: `${Math.max(progress, 8)}%` }}
          />
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <section className="flex flex-col gap-5">
          <div className="grid gap-3 rounded-3xl border border-white/60 bg-white/80 p-6 shadow-lg shadow-primary-900/5 backdrop-blur-sm">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-slate-900">Pergunta atual</h2>
                <p className="text-sm text-slate-500">
                  {currentIndex + 1} de {baseQuestions.length} etapas essenciais
                </p>
              </div>
              <div className="flex gap-2 text-sm">
                <button
                  onClick={handleBack}
                  disabled={currentIndex === 0}
                  className="rounded-full border border-slate-200 px-3 py-1 text-slate-600 transition hover:border-primary-200 hover:text-primary-600 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Voltar
                </button>
                <button
                  onClick={handleContinue}
                  disabled={currentIndex === baseQuestions.length - 1}
                  className="rounded-full border border-primary-200 bg-primary-500/10 px-3 py-1 text-primary-600 transition hover:bg-primary-500/20 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Avançar
                </button>
              </div>
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={activeQuestion.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.24, ease: "easeOut" }}
                className="rounded-2xl border border-slate-100 bg-white/80 p-5"
              >
                <header className="flex flex-col gap-2">
                  <p className="text-xs uppercase tracking-wide text-primary-500">Coleta guiada</p>
                  <h3 className="text-xl font-semibold text-slate-900">
                    {activeQuestion.title}
                    {activeQuestion.required && <span className="text-primary-500"> *</span>}
                  </h3>
                  {activeQuestion.description && (
                    <p className="text-sm text-slate-500">{activeQuestion.description}</p>
                  )}
                </header>

                <div className="mt-4">
                  {activeQuestion.type === "long" && (
                    <textarea
                      rows={6}
                      value={typeof answers[activeQuestion.id] === "string" ? (answers[activeQuestion.id] as string) : ""}
                      onChange={(event) => handleValueChange(event.target.value)}
                      placeholder={activeQuestion.placeholder}
                      className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 shadow-inner outline-none transition focus:border-primary-300 focus:shadow-focus"
                    />
                  )}
                  {activeQuestion.type === "short" && (
                    <input
                      type="text"
                      value={typeof answers[activeQuestion.id] === "string" ? (answers[activeQuestion.id] as string) : ""}
                      onChange={(event) => handleValueChange(event.target.value)}
                      placeholder={activeQuestion.placeholder}
                      className="w-full rounded-full border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 shadow-inner outline-none transition focus:border-primary-300 focus:shadow-focus"
                    />
                  )}
                  {activeQuestion.type === "choice" && (
                    <div className="flex flex-wrap gap-2">
                      {(activeQuestion.options ?? []).map((option) => {
                        const currentValue = answers[activeQuestion.id];
                        const active = currentValue === option;
                        return (
                          <button
                            key={option}
                            onClick={() => handleValueChange(option)}
                            className={cn(
                              "rounded-full border px-4 py-2 text-sm transition",
                              active
                                ? "border-primary-500 bg-primary-500 text-white"
                                : "border-slate-200 bg-white text-slate-600 hover:border-primary-200 hover:text-primary-600"
                            )}
                          >
                            {option}
                          </button>
                        );
                      })}
                    </div>
                  )}
                  {activeQuestion.type === "tags" && (
                    <div className="flex flex-col gap-3">
                      <div className="flex flex-wrap gap-2">
                        {(activeQuestion.options ?? []).map((option) => {
                          const currentValue = answers[activeQuestion.id];
                          const selected = Array.isArray(currentValue) && currentValue.includes(option);
                          return (
                            <button
                              key={option}
                              type="button"
                              onClick={() => toggleTag(option)}
                              className={cn(
                                "rounded-full border px-4 py-2 text-sm transition",
                                selected
                                  ? "border-primary-500 bg-primary-500 text-white"
                                  : "border-slate-200 bg-white text-slate-600 hover:border-primary-200 hover:text-primary-600"
                              )}
                            >
                              {option}
                            </button>
                          );
                        })}
                      </div>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={customTagDraft}
                          onChange={(event) => setCustomTagDraft(event.target.value)}
                          placeholder="Outro tom? Adicione aqui"
                          className="flex-1 rounded-full border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 shadow-inner outline-none transition focus:border-primary-300 focus:shadow-focus"
                        />
                        <button
                          type="button"
                          onClick={addCustomTag}
                          className="rounded-full bg-primary-500 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-primary-600"
                        >
                          Adicionar
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                <footer className="mt-5 flex items-center justify-between text-xs text-slate-500">
                  <p>
                    {activeQuestion.required
                      ? "Resposta obrigatória para desbloquear o prompt final."
                      : "Opcional, mas ajuda a refinar o resultado."}
                  </p>
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-primary-300" />
                    {isFilled(answers[activeQuestion.id]) ? "Pronto" : "Aguardando"}
                  </div>
                </footer>
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="grid gap-3 rounded-3xl border border-white/60 bg-white/70 p-6 shadow-lg shadow-primary-900/5 backdrop-blur-sm">
            <h2 className="text-lg font-semibold text-slate-900">Perguntas essenciais</h2>
            <p className="text-sm text-slate-500">
              Revise ou ajuste qualquer etapa sempre que precisar. As respostas obrigatórias exibem um ponto azul quando completas.
            </p>
            <div className="flex flex-wrap gap-2">
              {questionsWithState.map((question, index) => (
                <button
                  key={question.id}
                  onClick={() => selectQuestion(index)}
                  className={cn(
                    "group flex items-center gap-2 rounded-full border px-3 py-2 text-xs font-medium transition",
                    currentIndex === index
                      ? "border-primary-500 bg-primary-500/10 text-primary-700"
                      : "border-slate-200 bg-white text-slate-600 hover:border-primary-200 hover:text-primary-600"
                  )}
                >
                  <span className={cn(
                    "h-2.5 w-2.5 rounded-full transition",
                    question.filled ? "bg-primary-400" : "bg-slate-200 group-hover:bg-primary-200"
                  )} />
                  {index + 1}. {question.title}
                </button>
              ))}
            </div>
          </div>

          <div className="grid gap-3 rounded-3xl border border-primary-100 bg-primary-50/80 p-6 text-sm text-primary-900 shadow-lg shadow-primary-900/5">
            <h2 className="text-lg font-semibold text-primary-900">Sugestões inteligentes</h2>
            <p className="text-sm text-primary-700">
              Use estas ideias para tornar o prompt mais específico antes de gerar o resultado final.
            </p>
            <ul className="grid gap-2">
              {insights.map((insight) => (
                <li key={insight} className="flex gap-2">
                  <span className="mt-1 h-1.5 w-1.5 rounded-full bg-primary-500" />
                  <span>{insight}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <aside className="flex flex-col gap-4">
          <div className="flex flex-col gap-4 rounded-3xl border border-white/60 bg-white/80 p-6 shadow-lg shadow-primary-900/5 backdrop-blur-sm">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">Prompt estruturado</h2>
                <p className="text-xs text-slate-500">
                  O texto abaixo é atualizado em tempo real conforme você preenche as respostas.
                </p>
              </div>
              <button
                onClick={handleCopy}
                disabled={pendingRequired.length > 0}
                className={cn(
                  "rounded-full px-4 py-2 text-xs font-semibold transition",
                  pendingRequired.length > 0
                    ? "cursor-not-allowed bg-slate-200 text-slate-500"
                    : copied
                    ? "bg-emerald-500 text-white"
                    : "bg-primary-500 text-white hover:bg-primary-600"
                )}
              >
                {copied ? "Copiado" : "Copiar"}
              </button>
            </div>

            <div className="relative overflow-hidden rounded-2xl border border-slate-100 bg-slate-50/60 p-4 text-sm text-slate-800">
              {pendingRequired.length > 0 && (
                <div className="mb-3 rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs text-amber-700">
                  Responda às etapas obrigatórias para desbloquear o prompt completo.
                </div>
              )}
              <pre className="max-h-[440px] overflow-auto whitespace-pre-wrap leading-relaxed">
                {prompt}
              </pre>
            </div>
          </div>

          <div className="rounded-3xl border border-white/60 bg-white/80 p-6 text-sm text-slate-600 shadow-lg shadow-primary-900/5 backdrop-blur-sm">
            <h2 className="text-lg font-semibold text-slate-900">Checklist final</h2>
            <ul className="mt-3 grid gap-2">
              <li className="flex items-start gap-2">
                <span className={cn(
                  "mt-1 h-2 w-2 rounded-full",
                  pendingRequired.length === 0 ? "bg-emerald-500" : "bg-amber-400"
                )} />
                Confirme se todas as informações essenciais estão respondidas.
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1 h-2 w-2 rounded-full bg-primary-300" />
                Ajuste o tom, as restrições e os critérios de validação conforme necessário.
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1 h-2 w-2 rounded-full bg-primary-200" />
                Compartilhe o prompt final com sua equipe e registre aprendizados.
              </li>
            </ul>
          </div>
        </aside>
      </div>
    </div>
  );
}
