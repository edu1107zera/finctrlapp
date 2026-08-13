import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';

export interface TutorialStep {
  id: string;
  title: string;
  description: string;
  view: string;
  icon: string;
  tip: string;
}

export const BASIC_STEPS: TutorialStep[] = [
  {
    id: 'salary',
    title: 'Salário Fixo',
    description: 'Primeiro, informe quanto você recebe por mês. Isso permite que o Nixx calcule sua disponibilidade financeira, projeções e indicadores automaticamente.',
    view: 'settings',
    icon: '💰',
    tip: 'Preencha o Salário Fixo Mensal e o Dia de Recebimento, depois clique em "Salvar Configurações".',
  },
  {
    id: 'accounts',
    title: 'Contas e Instituições',
    description: 'Agora vamos cadastrar onde seu dinheiro está guardado ou movimentado, como Nubank, Itaú, Bradesco ou sua carteira física.',
    view: 'accounts',
    icon: '🏦',
    tip: 'Clique em "Nova Conta", preencha o nome e escolha uma cor para identificá-la.',
  },
  {
    id: 'transactions',
    title: 'Transações',
    description: 'Agora vamos registrar o que entra e o que sai do seu dinheiro. Você pode lançar receitas, despesas e parcelamentos.',
    view: 'transactions',
    icon: '💸',
    tip: 'Clique em "Nova Transação". Para compras parceladas, informe o total de parcelas — o Nixx cria cada mês automaticamente.',
  },
  {
    id: 'loans',
    title: 'Empréstimos',
    description: 'Se você possui empréstimos, financiamentos ou parcelas de dívidas, registre aqui para que o Nixx calcule o impacto no seu orçamento.',
    view: 'loans',
    icon: '🏧',
    tip: 'Clique em "Novo Empréstimo" e informe o banco, valor total, parcela mensal e período.',
  },
];

export const COMPLETE_STEPS: TutorialStep[] = [
  ...BASIC_STEPS,
  {
    id: 'cards',
    title: 'Cartões de Crédito',
    description: 'Cadastre seus cartões de crédito para controlar limite, fatura atual e lançar compras parceladas. O Nixx calcula automaticamente a qual mês pertence cada compra com base no dia de fechamento.',
    view: 'cards',
    icon: '💳',
    tip: 'Cadastre o cartão com limite, dia de fechamento e dia de vencimento. Use "Lançar Gasto" para registrar compras no cartão.',
  },
  {
    id: 'expenses',
    title: 'Despesas Gerais',
    description: 'Veja tudo que precisa ser pago organizado por mês. Você pode quitar individualmente ou usar "Quitar Tudo Pendente" para uma quitação em massa de todas as pendências.',
    view: 'expenses',
    icon: '📊',
    tip: 'Expanda um mês para ver as despesas. Use ✓ para marcar individualmente ou "Quitar Tudo Pendente" para pagar tudo de uma vez.',
  },
  {
    id: 'calendar',
    title: 'Calendário Financeiro',
    description: 'Visualize quando o dinheiro entra e quando sai. Pontos verdes são receitas, vermelhos são despesas. Clique em um dia para ver os detalhes.',
    view: 'calendar',
    icon: '🗓️',
    tip: 'Os pontos coloridos nos dias indicam movimentações. Clique em qualquer dia para ver o resumo financeiro daquela data.',
  },
  {
    id: 'goals',
    title: 'Metas Financeiras',
    description: 'Crie metas com simulação de juros compostos. O Nixx projeta exatamente quando você vai atingir seu objetivo com base na contribuição mensal e taxa de juros anual.',
    view: 'goals',
    icon: '🎯',
    tip: 'Informe o valor objetivo, quanto já tem, contribuição mensal e prazo. O gráfico mostra a projeção mês a mês até atingir a meta.',
  },
  {
    id: 'dashboard',
    title: 'Dashboard — Fluxo de Caixa',
    description: 'O Dashboard é o coração do Nixx. Ele mostra quanto sobra no fim do mês, receitas, despesas, limite diário e gráficos de evolução financeira dos últimos 6 meses.',
    view: 'dashboard',
    icon: '🏠',
    tip: 'Use as setas ← → para navegar entre meses. Clique em "Mudar" no card de limite diário para ver a projeção do próximo mês.',
  },
  {
    id: 'budget',
    title: 'Orçamento por Categoria',
    description: 'Defina limites mensais de gastos por categoria (ex: Alimentação → R$ 800). O Nixx compara com seus gastos reais e alerta quando você está se aproximando do limite.',
    view: 'budget',
    icon: '📋',
    tip: 'Clique em "Novo Orçamento", escolha a categoria (deve ser igual ao nome usado nas transações) e defina o limite mensal.',
  },
  {
    id: 'reports',
    title: 'Relatórios',
    description: 'Analise a evolução dos seus gastos, compare meses e veja quais categorias consomem mais da sua renda. Filtros permitem períodos personalizados.',
    view: 'reports',
    icon: '📈',
    tip: 'Use os filtros para comparar meses diferentes. A seção de maiores gastos mostra as categorias que mais pesam no seu orçamento.',
  },
  {
    id: 'insights',
    title: 'Insights Financeiros',
    description: 'O Nixx analisa seus dados e gera insights automáticos sobre seus hábitos. Tudo baseado em dados reais — nunca inventa informações.',
    view: 'insights',
    icon: '💡',
    tip: 'Os insights aparecem automaticamente à medida que você registra mais transações. Quanto mais dados, mais precisos eles ficam.',
  },
  {
    id: 'alerts',
    title: 'Alertas Automáticos',
    description: 'Alertas aparecem no Dashboard quando há contas próximas do vencimento, orçamento excedido ou metas com ritmo atrasado. Baseados em dados reais.',
    view: 'dashboard',
    icon: '🔔',
    tip: 'Mantenha seus dados sempre atualizados para receber alertas precisos sobre sua saúde financeira.',
  },
  {
    id: 'cashflow',
    title: 'Fluxo de Caixa',
    description: 'O Dashboard calcula automaticamente: Receitas - Despesas = O que sobra. A barra de progresso mostra o percentual da renda comprometido.',
    view: 'dashboard',
    icon: '🌊',
    tip: 'O card "O que sobra no fim do mês" é o número mais importante. Verde = positivo, Vermelho = orçamento estourado.',
  },
  {
    id: 'simulator',
    title: 'Simulador Financeiro',
    description: 'Antes de fazer uma compra grande, simule o impacto no seu orçamento. O simulador mostra como a compra parcelada afeta os próximos meses sem bloquear você.',
    view: 'dashboard',
    icon: '🧮',
    tip: 'Clique em "Simular Compra" no Dashboard, informe o valor e o número de parcelas para ver o impacto mensal.',
  },
  {
    id: 'ai',
    title: 'IA Financeira',
    description: 'A FinControl Intelligence é seu consultor financeiro pessoal com IA. Faça perguntas sobre seus gastos, metas e receba análises personalizadas com base nos seus dados reais.',
    view: 'ai',
    icon: '🤖',
    tip: 'Experimente: "Em que categoria estou gastando mais?" ou "Estou indo bem nas minhas metas?" ou "Como posso economizar?"',
  },
  {
    id: 'history',
    title: 'Histórico',
    description: 'O histórico registra todos os eventos: pagamentos, quitações em massa e alterações financeiras. É o log completo de tudo que aconteceu no sistema.',
    view: 'history',
    icon: '📜',
    tip: 'Consulte o histórico para rastrear pagamentos ou verificar quando uma quitação foi realizada.',
  },
  {
    id: 'investments',
    title: 'Investimentos',
    description: 'Registre seus investimentos manualmente para acompanhar a rentabilidade. Informe o valor aplicado e o valor atual — o Nixx calcula o retorno automaticamente.',
    view: 'investments',
    icon: '📈',
    tip: 'Cadastre CDBs, ações, fundos ou qualquer investimento. O Nixx calcula a rentabilidade percentual entre o valor aplicado e o atual.',
  },
];

interface OnboardingContextType {
  showOnboarding: boolean;
  setShowOnboarding: (v: boolean) => void;
  isTutorialActive: boolean;
  tutorialMode: 'basic' | 'complete' | null;
  currentStep: number;
  completedSteps: string[];
  steps: TutorialStep[];
  startBasicTutorial: (onNavigate: (v: string) => void) => void;
  startCompleteTutorial: (onNavigate: (v: string) => void) => void;
  dismissOnboarding: () => void;
  goToNext: (onNavigate: (v: string) => void) => void;
  goToPrev: (onNavigate: (v: string) => void) => void;
  skipTutorial: () => void;
  markStepComplete: (stepId: string) => void;
  resetTutorial: (mode: 'basic' | 'complete', onNavigate: (v: string) => void) => void;
  basicProgress: number;
  completeProgress: number;
}

const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined);

const getKey = (userId: string, k: string) => `nixx_${userId}_${k}`;

export function OnboardingProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const uid = user?.id || 'guest';

  const [showOnboarding, setShowOnboarding] = useState(false);
  const [isTutorialActive, setIsTutorialActive] = useState(false);
  const [tutorialMode, setTutorialMode] = useState<'basic' | 'complete' | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);

  useEffect(() => {
    if (!user) return;
    const seen = localStorage.getItem(getKey(uid, 'hasSeenOnboarding'));
    const saved = JSON.parse(localStorage.getItem(getKey(uid, 'completedSteps')) || '[]');
    setCompletedSteps(saved);
    if (!seen) setShowOnboarding(true);
  }, [user, uid]);

  const steps = tutorialMode === 'complete' ? COMPLETE_STEPS : BASIC_STEPS;

  const startBasicTutorial = useCallback((onNavigate: (v: string) => void) => {
    setTutorialMode('basic');
    setCurrentStep(0);
    setIsTutorialActive(true);
    setShowOnboarding(false);
    localStorage.setItem(getKey(uid, 'hasSeenOnboarding'), 'true');
    onNavigate(BASIC_STEPS[0].view);
  }, [uid]);

  const startCompleteTutorial = useCallback((onNavigate: (v: string) => void) => {
    setTutorialMode('complete');
    setCurrentStep(0);
    setIsTutorialActive(true);
    setShowOnboarding(false);
    localStorage.setItem(getKey(uid, 'hasSeenOnboarding'), 'true');
    onNavigate(COMPLETE_STEPS[0].view);
  }, [uid]);

  const dismissOnboarding = useCallback(() => {
    setShowOnboarding(false);
    localStorage.setItem(getKey(uid, 'hasSeenOnboarding'), 'true');
  }, [uid]);

  const goToNext = useCallback((onNavigate: (v: string) => void) => {
    const currentSteps = tutorialMode === 'complete' ? COMPLETE_STEPS : BASIC_STEPS;
    if (currentStep < currentSteps.length - 1) {
      const next = currentStep + 1;
      setCurrentStep(next);
      onNavigate(currentSteps[next].view);
    } else {
      setIsTutorialActive(false);
      setTutorialMode(null);
      setCurrentStep(0);
    }
  }, [currentStep, tutorialMode]);

  const goToPrev = useCallback((onNavigate: (v: string) => void) => {
    const currentSteps = tutorialMode === 'complete' ? COMPLETE_STEPS : BASIC_STEPS;
    if (currentStep > 0) {
      const prev = currentStep - 1;
      setCurrentStep(prev);
      onNavigate(currentSteps[prev].view);
    }
  }, [currentStep, tutorialMode]);

  const skipTutorial = useCallback(() => {
    setIsTutorialActive(false);
    setTutorialMode(null);
    setCurrentStep(0);
  }, []);

  const markStepComplete = useCallback((stepId: string) => {
    setCompletedSteps(prev => {
      if (prev.includes(stepId)) return prev;
      const next = [...prev, stepId];
      localStorage.setItem(getKey(uid, 'completedSteps'), JSON.stringify(next));
      return next;
    });
  }, [uid]);

  const resetTutorial = useCallback((mode: 'basic' | 'complete', onNavigate: (v: string) => void) => {
    const stepsForMode = mode === 'complete' ? COMPLETE_STEPS : BASIC_STEPS;
    setTutorialMode(mode);
    setCurrentStep(0);
    setIsTutorialActive(true);
    onNavigate(stepsForMode[0].view);
  }, []);

  const basicProgress = Math.round(
    (completedSteps.filter(s => BASIC_STEPS.some(b => b.id === s)).length / BASIC_STEPS.length) * 100
  );
  const completeProgress = Math.round(
    (completedSteps.filter(s => COMPLETE_STEPS.some(c => c.id === s)).length / COMPLETE_STEPS.length) * 100
  );

  return (
    <OnboardingContext.Provider value={{
      showOnboarding, setShowOnboarding,
      isTutorialActive, tutorialMode, currentStep, completedSteps, steps,
      startBasicTutorial, startCompleteTutorial, dismissOnboarding,
      goToNext, goToPrev, skipTutorial, markStepComplete, resetTutorial,
      basicProgress, completeProgress,
    }}>
      {children}
    </OnboardingContext.Provider>
  );
}

export function useOnboarding() {
  const ctx = useContext(OnboardingContext);
  if (!ctx) throw new Error('useOnboarding must be used within OnboardingProvider');
  return ctx;
}
