import type { Person, Team } from './types';


export const INITIAL_PEOPLE: Person[] = [
  { id: 'p1', name: 'Lucas Gabriel', type: 'PJ', priority: 3, phone: '(11) 98765-4321', notes: 'Muito comunicativo e animado', createdAt: '2026-09-01' },
  { id: 'p2', name: 'Mariana Silva', type: 'Integrantes', priority: 2, phone: '(11) 97654-3210', notes: 'Toca violão e canta', createdAt: '2026-09-01' },
  { id: 'p3', name: 'Beatriz Ramos', type: 'Integrantes', priority: 1, phone: '(11) 96543-2109', notes: 'Organizada e pontual', createdAt: '2026-09-01' },
  { id: 'p4', name: 'Tio Carlos', type: 'Tios', priority: 3, phone: '(11) 95432-1098', notes: 'Experiência em cozinha para grandes retiros', createdAt: '2026-09-01' },
  { id: 'p5', name: 'Tia Fernanda', type: 'Tios', priority: 3, phone: '(11) 94321-0987', notes: 'Nutricionista e acolhimento', createdAt: '2026-09-01' },
  { id: 'p6', name: 'Tio Roberto', type: 'Tios', priority: 2, phone: '(11) 93210-9876', notes: 'Apoio logístico e primeiros socorros', createdAt: '2026-09-01' },
  { id: 'p7', name: 'Tia Cristina', type: 'Tios', priority: 2, phone: '(11) 92109-8765', notes: 'Pastoral e acolhida', createdAt: '2026-09-01' },
  { id: 'p8', name: 'Rafael Costa', type: 'Coordenação', priority: 3, phone: '(11) 91098-7654', notes: 'Coordenador geral JUSC', createdAt: '2026-09-01' },
  { id: 'p9', name: 'Juliana Mendes', type: 'Coordenação', priority: 3, phone: '(11) 90987-6543', notes: 'Vice-coordenadora e secretaria', createdAt: '2026-09-01' },
  { id: 'p10', name: 'Matheus Santos', type: 'Voluntários', priority: 2, phone: '(11) 99887-7665', notes: 'Mesa de som e cabos', createdAt: '2026-09-01' },
  { id: 'p11', name: 'Larissa Alencar', type: 'Veteranos', priority: 2, phone: '(11) 98877-6655', notes: 'Já atuou na Animação e Liturgia', createdAt: '2026-09-01' },
  { id: 'p12', name: 'Vinicius Rocha', type: 'Voluntários', priority: 1, phone: '(11) 97766-5544', notes: 'Carregamento de equipamentos', createdAt: '2026-09-01' },
  { id: 'p13', name: 'Camila Ribeiro', type: 'PJ', priority: 1, phone: '(11) 96655-4433', notes: 'Teatro e dinâmicas', createdAt: '2026-09-01' },
  { id: 'p14', name: 'Pedro Henrique', type: 'Integrantes', priority: 0, phone: '(11) 95544-3322', notes: 'Fotografia e mídias sociais', createdAt: '2026-09-01' },
  { id: 'p15', name: 'Enzo Rodrigues', type: 'Voluntários', priority: 0, phone: '(11) 94433-2211', notes: 'Suporte geral e compras', createdAt: '2026-09-01' },
];

export const INITIAL_TEAMS: Team[] = [
  {
    id: 't-cozinha',
    name: 'Equipe de Cozinha',
    description: 'Responsável pelo preparo das refeições, lanches, café e manutenção da nutrição com muito carinho e amor para todos os participantes.',
    colorAccent: '#FFC700',
    roles: [
      {
        id: 'r-coz-1',
        title: 'Coordenação Geral da Cozinha',
        description: 'Responsável por liderar a equipe, gerenciar o estoque de alimentos, compras e cronograma dos horários de refeição.',
        maxSpots: 2,
        assignedPersonIds: ['p4', 'p5'],
      },
      {
        id: 'r-coz-2',
        title: 'Preparo dos Pratos Principais',
        description: 'Execução do cardápio das refeições de almoço e jantar, garantindo sabor, higiene e pontualidade.',
        maxSpots: 3,
        assignedPersonIds: ['p12'],
      },
      {
        id: 'r-coz-3',
        title: 'Equipe de Lanches e Bebidas',
        description: 'Preparo dos cafés da manhã e lanches da tarde, higienização de frutas e reposição dos pontos de água.',
        maxSpots: 3,
        assignedPersonIds: [],
      },
      {
        id: 'r-coz-4',
        title: 'Higienização e Organização',
        description: 'Lavagem de panelas, louças, separação de lixo e conservação da limpeza contínua da cozinha e refeitório.',
        maxSpots: 4,
        assignedPersonIds: [],
      }
    ],
  },
  {
    id: 't-animacao',
    name: 'Equipe de Animação e Louvor',
    description: 'Cria um ambiente vibrante, dinâmico e acolhedor através da música, coreografias, teatro e dinâmicas interativas.',
    colorAccent: '#FF9500',
    roles: [
      {
        id: 'r-ani-1',
        title: 'Ministro de Louvor & Vozes',
        description: 'Conduz os momentos de louvor, oração cantada e sintonia vocal com o tema do encontro.',
        maxSpots: 2,
        assignedPersonIds: ['p2'],
      },
      {
        id: 'r-ani-2',
        title: 'Instrumentistas (Violão / Teclado / Percussão)',
        description: 'Execução dos instrumentos musicais, harmonia e suporte acústico para os momentos de oração e animação.',
        maxSpots: 3,
        assignedPersonIds: [],
      },
      {
        id: 'r-ani-3',
        title: 'Animador de Palco e Dinâmicas',
        description: 'Manter a energia alta, conduzir gincanas, danças e interagir com os jovens para descontrair.',
        maxSpots: 3,
        assignedPersonIds: ['p1', 'p13'],
      }
    ],
  },
  {
    id: 't-acolhida',
    name: 'Equipe de Acolhida e Credenciamento',
    description: 'Primeiro sorriso e ponto de contato. Faz a recepção calorosa na chegada, entrega de materiais e suporte individual.',
    colorAccent: '#06B6D4',
    roles: [
      {
        id: 'r-aco-1',
        title: 'Recepção e Crachás',
        description: 'Conferência de listas de inscritos, entrega de crachás, boas-vindas calorosas e encaminhamento aos quartos/salas.',
        maxSpots: 3,
        assignedPersonIds: ['p3', 'p7'],
      },
      {
        id: 'r-aco-2',
        title: 'Apoio aos Encontristas (Anjos da Guarda)',
        description: 'Estar atento a jovens tímidos ou que precisem de atenção especial, conforto ou orientação durante o evento.',
        maxSpots: 4,
        assignedPersonIds: ['p11'],
      }
    ],
  },
  {
    id: 't-liturgia',
    name: 'Equipe de Liturgia e Intercessão',
    description: 'Zelo sagrado pelo altar, preparação das Santas Missas, adorações ao Santíssimo e plantão contínuo de oração.',
    colorAccent: '#8B5CF6',
    roles: [
      {
        id: 'r-lit-1',
        title: 'Zelador do Altar e Paramentos',
        description: 'Preparação do cálice, hóstias, velas, livros litúrgicos e arranjos do altar para as celebrações.',
        maxSpots: 2,
        assignedPersonIds: ['p9'],
      },
      {
        id: 'r-lit-2',
        title: 'Plantão de Intercessão',
        description: 'Oração em revezamento na capela durante as palestras e atividades para sustentar espiritualmente o retiro.',
        maxSpots: 6,
        assignedPersonIds: ['p8'],
      }
    ],
  },
  {
    id: 't-logistica',
    name: 'Equipe de Infraestrutura e Som',
    description: 'Garante o funcionamento técnico impecável de som, projeção, cabos, iluminação, segurança e transporte.',
    colorAccent: '#10B981',
    roles: [
      {
        id: 'r-log-1',
        title: 'Operador de Som & Mesa de Áudio',
        description: 'Regulagem dos microfones, caixas de som, equalização e evitar microfonias durante palestras e músicas.',
        maxSpots: 2,
        assignedPersonIds: ['p10'],
      },
      {
        id: 'r-log-2',
        title: 'Projeção de Letras e Multimídia',
        description: 'Passagem de slides de palestras, vídeos e letras de músicas no telão em tempo real.',
        maxSpots: 2,
        assignedPersonIds: ['p14'],
      },
      {
        id: 'r-log-3',
        title: 'Patrulha e Apoio de Circulação',
        description: 'Verificação de portas, segurança, carregamento de materiais pesados e socorro imediato para qualquer imprevisto.',
        maxSpots: 4,
        assignedPersonIds: ['p6', 'p15'],
      }
    ],
  }
];
