import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import juntosLogo from '@/imports/juntos_somos_tis.png'
import tisLogoSvg from '@/imports/TIS_logo-01.svg'
import agentPhoto from '@/imports/porta_RH-08.png'
import newsDetailBg from '@/imports/gradient-1.png'

// ── Portrait photos ──
const PHOTO_IDS = [
  '1769636929231-3cd7f853d038', '1578758760917-e36305c1b872',
  '1732154478254-f94aebec9501', '1779760250127-72e8e8a5b1ce',
  '1769636929354-59165ba73c7e', '1769636930016-5d9f0ca653aa',
  '1769636929266-8057f2c5ed52', '1769636929130-56648d6e9c6d',
  '1769636930152-238ed1f7e07f', '1784652951070-9cb1a374132f',
  '1765005204227-bf58bcdd4449', '1765005204268-631d9e0c6fe1',
  '1763757321139-e7e4de128cd9', '1784652951090-faffc6417c0f',
  '1784652951073-755afb86c312', '1611432579402-7037e3e2c1e4',
  '1563132337-f159f484226c',  '1618085219724-c59ba48e08cd',
  '1573496799515-eebbb63814f2','1666867540898-aaa1993ffabc',
  '1748290880596-2a2c80530bc0','1710778044102-56a3a6b69a1b',
  '1725461254746-93101ae627f0','1783013952839-cda1c697e275',
]
function photoUrl(id: string) {
  return `https://images.unsplash.com/photo-${id}?w=400&h=500&fit=crop&crop=faces&auto=format&q=75`
}
const GRID_IDS = [...PHOTO_IDS, ...PHOTO_IDS].sort(() => Math.random() - 0.5)
const COLS = 8
const ROWS = 6

// ── Types ──
type TISUser  = { name: string; email: string; initials: string; dept: string }
type Message  = { id: number; role: 'agent' | 'user'; content: string }
type Bubble   = { key: number; slot: number; text: string; visible: boolean }
type ChatTopic = { id: string; icon: React.FC<{ className?: string }>; label: string; question: string }
type TISEvent = {
  date: string; title: string; type: string; color: string;
  time?: string; location?: string; organizer?: string; description?: string
}
type ChatSession = { id: number; title: string; date: string; preview: string; messages: Message[] }
type NewsItem = {
  id: number; date: string; category: string; title: string;
  excerpt: string; color: string; icon: string; image?: string; archive?: boolean; body?: string
}
type TISDocument = {
  id: number; name: string; type: 'pdf' | 'docx' | 'xlsx' | 'pptx'
  category: string; size: string; pages: number; date: string; excerpt: string
}
type DocMessage = { role: 'user' | 'agent'; content: string; sources?: string[] }

// ── Speech bubbles — 5 slots, all LEFT side with right-pointing tail ──
const HR_QUESTIONS = [
  'Quantos dias de férias tenho?',
  'Como marco férias no Odoo?',
  'Qual é a política de teletrabalho?',
  'Quando é a minha próxima avaliação?',
  'Como peço uma declaração de trabalho?',
  'Quais são os meus benefícios?',
  'Como funciona o seguro de saúde?',
  'Como me inscrevo numa formação?',
  'Tenho direito a licença parental?',
  'O que acontece numa baixa médica?',
  'Como atualizo os meus dados bancários?',
  'Qual é a política de horário flexível?',
]
const BUBBLE_SLOTS = [
  { top: '18%', right: '3%',  dur: '4.2s', delay: '0s'   },
  { top: '34%', right: '14%', dur: '3.8s', delay: '0.5s' },
  { top: '53%', right: '4%',  dur: '4.5s', delay: '1.0s' },
  { top: '69%', right: '11%', dur: '3.6s', delay: '1.5s' },
  { top: '83%', right: '5%',  dur: '4.8s', delay: '2.0s' },
]

// ── FAQs ──
const FAQS_DATA = [
  { q: 'Como posso consultar o meu saldo de férias?', a: 'Podes consultar o teu saldo no Odoo em "Ausências > Os Meus Pedidos". O saldo é calculado automaticamente com base no teu contrato e nos dias já utilizados. O Assistente de RH também te informa em tempo real.' },
  { q: 'Como faço um pedido de férias?', a: 'Submete o pedido através do Odoo (menu Ausências) ou pelo Assistente de RH neste portal. O pedido é enviado para aprovação da tua chefia, que recebe uma notificação. Recomenda-se submeter com pelo menos 10 dias de antecedência.' },
  { q: 'Qual é a política de teletrabalho da TIS?', a: 'A TIS permite até 3 dias de teletrabalho por semana em regime híbrido, acordado com a chefia. O equipamento é fornecido pela empresa. Consulta o Regulamento de Teletrabalho TIS 2026 para detalhes sobre elegibilidade e obrigações.' },
  { q: 'Como posso pedir uma declaração de trabalho?', a: 'Podes pedir declarações (fins bancários, vínculo ou rendimentos) pelo Assistente de RH ou via pedido no portal. O prazo habitual de emissão é 3 a 5 dias úteis. O documento pode ser levantado na receção ou enviado por e-mail.' },
  { q: 'Como funciona o processo de avaliação de desempenho?', a: 'O ciclo anual tem 3 etapas: Autoavaliação (1-15 out), Reunião com chefia (16-31 out) e Validação final (novembro). Os critérios avaliam competências técnicas, comportamentais e objetivos definidos no início do ano.' },
  { q: 'Quais são os benefícios disponíveis para colaboradores TIS?', a: 'Os benefícios incluem: seguro de saúde (extensível à família), subsídio de refeição, plano de formação anual, programa de bem-estar e apoio psicológico, seguro de vida e descontos em parceiros. Variam consoante o nível de carreira.' },
  { q: 'O que devo fazer em caso de baixa médica?', a: 'Comunica imediatamente ao teu responsável e ao RH. O certificado de incapacidade temporária (CIT) deve ser entregue ao RH até ao 3.º dia de ausência. Para baixas superiores a 3 dias, a Segurança Social é automaticamente informada.' },
  { q: 'Como me inscrevo numa formação?', a: 'As formações disponíveis estão no catálogo do portal ou no Odoo. Fala com o Assistente de RH ou envia um pedido à equipa de Formação. As inscrições estão sujeitas a aprovação da chefia e disponibilidade de vagas.' },
  { q: 'Como funciona o subsídio de refeição?', a: 'O subsídio de refeição é pago mensalmente com o vencimento no valor de €8,32 por dia útil trabalhado. É processado automaticamente com base nos registos de assiduidade. Em caso de teletrabalho, o subsídio mantém-se nas mesmas condições.' },
  { q: 'Qual o procedimento para atualizar os meus dados pessoais?', a: 'Podes atualizar os teus dados (morada, IBAN, contacto, dependentes) diretamente no Odoo em "Perfil do Colaborador". Alterações de dados bancários requerem envio de comprovativo ao RH por e-mail para rh@tis.pt.' },
]

// ── Notícias ──
const NEWS_DATA: NewsItem[] = [
  { id: 1, date: '28 Ago 2026', category: 'Cultura', title: 'Novo programa de bem-estar para colaboradores',
    excerpt: 'A partir de setembro, sessões semanais de mindfulness, yoga e apoio psicológico online disponíveis para todos os colaboradores TIS.',
    body: 'A TIS lança em setembro um programa de bem-estar completo e gratuito para todos os colaboradores. O programa inclui sessões semanais de mindfulness às terças-feiras (12h30), yoga ao vivo às quintas-feiras (07h30), e acesso ilimitado a uma plataforma de apoio psicológico online com terapeutas certificados.\n\nO bem-estar dos nossos colaboradores é uma prioridade estratégica. Acreditamos que equipas saudáveis e equilibradas são mais criativas, mais resilientes e mais felizes — e isso reflete-se diretamente na qualidade do trabalho e na cultura da empresa.\n\nAs inscrições estão abertas no portal Odoo a partir de 1 de setembro. Não é necessária inscrição prévia para as sessões de mindfulness e yoga — basta aparecer. Para o apoio psicológico, o acesso é imediato através do link disponível no portal.\n\nTodas as sessões são confidenciais e voluntárias. A participação não é registada nem reportada à chefia.',
    color: '', icon: '', image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800&h=600&fit=crop&auto=format&q=80' },
  { id: 2, date: '22 Ago 2026', category: 'Carreiras', title: 'Inscrições abertas: Liderança e Gestão de Equipas 2026',
    excerpt: 'Programa intensivo de 3 meses em parceria com a Nova SBE. Candidaturas até 15 de setembro. Vagas limitadas.',
    body: 'A TIS abre candidaturas para o Programa de Liderança e Gestão de Equipas 2026, desenvolvido em parceria com a Nova School of Business & Economics. O programa decorre entre outubro e dezembro, com sessões presenciais quinzenais no campus de Carcavelos e trabalho de projeto em equipas interdepartamentais.\n\nO currículo cobre comunicação eficaz, gestão de conflitos, tomada de decisão sob pressão, feedback construtivo e desenvolvimento de equipas de alta performance. Cada participante terá ainda um mentor sénior da TIS durante todo o programa.\n\nCondições de candidatura: colaboradores com pelo menos 2 anos de experiência na TIS, com função de liderança formal ou potencial identificado pela chefia. As candidaturas são feitas através do portal de Formação no Odoo e devem incluir uma carta de motivação.\n\nAs vagas são limitadas a 20 participantes. Os candidatos selecionados serão notificados até 25 de setembro.',
    color: '', icon: '', image: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=600&h=400&fit=crop&auto=format&q=80' },
  { id: 3, date: '15 Ago 2026', category: 'Felicidade', title: 'Prémio de Inovação TIS — Candidaturas abertas',
    excerpt: 'Submete o teu projeto inovador e concorre ao prémio anual. Prémios até €5.000 e visibilidade interna.',
    body: 'Está aberta a 4.ª edição do Prémio de Inovação TIS, a maior iniciativa interna de reconhecimento de ideias disruptivas e projetos de impacto. Qualquer colaborador, individualmente ou em equipa, pode submeter uma proposta até 30 de setembro.\n\nEste ano os projetos serão avaliados em três categorias: Inovação de Processo (melhoria operacional), Inovação de Produto (novo serviço ou solução para clientes) e Inovação Social (impacto na comunidade ou no bem-estar dos colaboradores).\n\nO júri é composto por membros da direção, clientes parceiros e um representante externo do ecossistema de inovação português. Os três finalistas apresentam os seus projetos no TIS Team Day a 20 de setembro.\n\nPrémios: 1.º lugar — €5.000 e mentoria de 6 meses; 2.º lugar — €2.500; 3.º lugar — €1.000. Todos os finalistas recebem visibilidade interna e acesso a uma aceleradora de projetos durante 3 meses.',
    color: '', icon: '', image: 'https://images.unsplash.com/photo-1567427017947-545c5f8d16ad?w=600&h=400&fit=crop&auto=format&q=80' },
  { id: 4, date: '10 Ago 2026', category: 'Benefícios', title: 'Novo parceiro de saúde: plano alargado em outubro',
    excerpt: 'A Medis passa a cobrir medicina alternativa, nutrição e psicologia para todos os colaboradores e familiares.',
    body: 'A partir de 1 de outubro, o plano de saúde TIS com a Medis passa a incluir cobertura alargada em áreas antes excluídas: medicina alternativa (acupuntura, osteopatia, homeopatia), consultas de nutrição, psicologia e psiquiatria, e fisioterapia sem limite de sessões.\n\nEste alargamento aplica-se a todos os colaboradores com contrato de trabalho ativo e aos seus dependentes diretos (cônjuge/companheiro e filhos até 25 anos). Não é necessária qualquer ação da parte dos colaboradores — a atualização é automática.\n\nOs colaboradores que já têm dependentes inscritos no plano não precisam de fazer nada. Quem ainda não inscreveu dependentes pode fazê-lo até 15 de setembro sem período de carência, através do formulário disponível no portal RH.\n\nPara consultas de psicologia online, a Medis disponibiliza uma app dedicada com marcação em menos de 48 horas. O acesso é gratuito até 12 sessões por ano por titular.',
    color: '', icon: '', image: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=600&h=400&fit=crop&auto=format&q=80' },
  { id: 5, date: '5 Ago 2026', category: 'Eventos', title: 'Team Day TIS — 20 de setembro em Lisboa',
    excerpt: 'O encontro anual de toda a equipa TIS está marcado para 20 de setembro no Pavilhão do Conhecimento.',
    body: 'O TIS Team Day 2026 acontece a 20 de setembro no Pavilhão do Conhecimento, em Lisboa. É o maior evento interno do ano e reúne todos os colaboradores TIS de Portugal, com transmissão em direto para as equipas internacionais.\n\nO programa começa às 09h00 com receção e pequeno-almoço, seguido de uma sessão plenária com a direção sobre a estratégia e os resultados do primeiro semestre. A tarde é dedicada a workshops temáticos (escolha entre 6 temas diferentes), um almoço coletivo com food trucks e atividades de team building.\n\nO evento encerra com a cerimónia do Prémio de Inovação TIS e um cocktail de networking. A presença é obrigatória para colaboradores em Lisboa e voluntária para os restantes.\n\nA inscrição nos workshops é feita no Odoo até 10 de setembro. O transporte para quem está fora de Lisboa é assegurado pela empresa — consulta os horários de partida no portal de eventos.',
    color: '', icon: '', image: 'https://images.unsplash.com/photo-1511578314322-379afb476865?w=600&h=400&fit=crop&auto=format&q=80' },
  { id: 6, date: '1 Ago 2026', category: 'Políticas', title: 'Regulamento de Trabalho Remoto atualizado para 2026',
    excerpt: 'Nova política que permite até 3 dias de teletrabalho por semana, com maior flexibilidade para pais e cuidadores.',
    body: 'A TIS atualizou o Regulamento de Trabalho Remoto com entrada em vigor a 1 de setembro de 2026. As principais alterações são: aumento do limite de dias de teletrabalho de 2 para 3 dias por semana para todos os colaboradores elegíveis; regime especial de até 5 dias por semana para pais e cuidadores com filhos menores de 12 anos ou dependentes com necessidades especiais.\n\nO novo regulamento também clarifica as obrigações de disponibilidade em trabalho remoto: os colaboradores devem estar acessíveis nas horas de trabalho acordadas, participar nas reuniões de equipa previstas e garantir que o equipamento e a ligação à internet têm qualidade suficiente para videoconferência.\n\nA TIS continua a fornecer os seguintes equipamentos para teletrabalho: portátil, monitor externo, teclado, rato e headset. Colaboradores com necessidades específicas podem solicitar equipamento adicional através do portal de IT.\n\nO acordo de teletrabalho deve ser renovado anualmente com a chefia direta. O novo formulário de acordo está disponível no Odoo a partir de 1 de setembro.',
    color: '', icon: '', image: 'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=600&h=400&fit=crop&auto=format&q=80' },
  { id: 7, date: '25 Jul 2026', category: 'Felicidade', title: 'Resultados do inquérito de satisfação 2026',
    excerpt: '82% dos colaboradores afirmam sentir-se orgulhosos de trabalhar na TIS. Resultados completos disponíveis no portal.',
    body: 'O inquérito anual de satisfação e engagement 2026 registou a maior taxa de participação de sempre: 94% dos colaboradores responderam. Os resultados são motivo de orgulho — e também de reflexão sobre os pontos a melhorar.\n\nDestaque positivo: 82% dos colaboradores afirmam sentir-se orgulhosos de trabalhar na TIS, 79% recomendam a TIS como local de trabalho e 76% sentem que o seu trabalho tem impacto real nos clientes e na organização.\n\nÁreas de melhoria identificadas: comunicação interna (especialmente entre áreas), progressão de carreira e reconhecimento informal. A direção compromete-se a apresentar um plano de ação até outubro.\n\nO relatório completo está disponível no portal na secção "Cultura e Pessoas > Inquéritos". Cada equipa receberá também os resultados específicos da sua área para discussão com a chefia.',
    color: '', icon: '', image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=600&h=400&fit=crop&auto=format&q=80' },
  { id: 8, date: '18 Jul 2026', category: 'Carreiras', title: 'Abertura de 12 vagas internas — candidata-te',
    excerpt: 'Doze posições abertas em Engenharia, Produto e Operações. Prioridade a candidatos internos até 31 de agosto.',
    body: 'A TIS abre 12 vagas internas antes de as publicar externamente. Esta prática reforça o compromisso com o desenvolvimento de carreira interno e dá prioridade a quem já conhece a cultura da empresa.\n\nAs vagas distribuem-se pelas áreas de Engenharia de Software (5 posições), Gestão de Produto (3), Operações e Projetos (2) e Data & Analytics (2). Os requisitos detalhados e os descritivos de função estão disponíveis no Odoo em "Recrutamento > Vagas Internas".\n\nO processo de candidatura interna é simplificado: basta submeter o perfil atualizado e uma nota de interesse de no máximo uma página. Não é necessária carta de motivação formal. As candidaturas são tratadas com total confidencialidade — a tua chefia atual não é notificada sem o teu consentimento.\n\nPrazo para candidaturas internas: 31 de agosto. As posições não preenchidas internamente serão publicadas externamente a partir de 1 de setembro.',
    color: '', icon: '', image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&h=400&fit=crop&auto=format&q=80' },
  { id: 9, date: '10 Jul 2026', category: 'Cultura', title: 'TIS celebra 15 anos com exposição interna',
    excerpt: 'Uma exposição fotográfica percorre os marcos dos 15 anos da TIS. Visível na sede de Lisboa durante agosto.',
    body: 'Em 2026, a TIS completa 15 anos de história. Para celebrar este marco, a equipa de Cultura e Pessoas desenvolveu uma exposição fotográfica e documental que percorre os momentos mais marcantes da empresa — dos primeiros clientes às equipas que cresceram, dos escritórios improvisados às instalações atuais.\n\nA exposição "15 Anos TIS" está patente no átrio principal da sede de Lisboa durante todo o mês de agosto. Inclui fotografias de arquivo, citações de colaboradores e clientes, e uma linha cronológica dos principais projetos e crescimento da empresa.\n\nUma versão digital da exposição será disponibilizada no portal a partir de 1 de setembro, para que os colaboradores de outras geografias também possam aceder.\n\nAo longo de agosto, realizarão-se também sessões de storytelling com membros fundadores e colaboradores de longa data, abertas a todos. As datas estão no calendário de eventos do portal.',
    color: '', icon: '', image: 'https://images.unsplash.com/photo-1529543544282-ea669407fca3?w=600&h=400&fit=crop&auto=format&q=80' },
  { id: 10, date: '2 Jul 2026', category: 'Benefícios', title: 'Novo subsídio de mobilidade sustentável',
    excerpt: 'TIS passa a subsidiar passes de transporte público e bicicletas elétricas para colaboradores em deslocação diária.',
    body: 'A TIS lança o programa de Mobilidade Sustentável 2026, um novo benefício que apoia os colaboradores nas deslocações diárias para o trabalho de forma mais ecológica e económica.\n\nO programa inclui dois componentes: subsídio de 50% no custo do passe mensal de transporte público (Navegante, Andante ou equivalente regional), até um máximo de €40 por mês; e comparticipação de 40% na compra de bicicleta elétrica ou trotinete elétrica, até um máximo de €400 por colaborador, uma única vez.\n\nO benefício aplica-se a todos os colaboradores com contrato sem termo. A adesão é feita através do portal RH, com upload do comprovativo de compra ou do passe mensal. O reembolso é processado no mês seguinte ao pedido.\n\nEsta iniciativa faz parte do compromisso TIS com a sustentabilidade e está alinhada com os objetivos ESG definidos para 2026-2028. Meta: reduzir em 30% as emissões de carbono associadas às deslocações dos colaboradores.',
    color: '', icon: '', image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&h=400&fit=crop&auto=format&q=80' },
]
const NEWS_ARCHIVE: NewsItem[] = [
  { id: 101, date: '20 Jul 2026', category: 'Carreiras',  title: 'Resultados: Programa de Mentoria 2025/26',            excerpt: '87% de satisfação entre os participantes. Nova edição abre candidaturas em outubro.', color: '', icon: '', archive: true, image: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=600&h=400&fit=crop&auto=format&q=70' },
  { id: 102, date: '10 Jul 2026', category: 'Cultura',    title: 'Summer Social — recap do evento',                     excerpt: 'Mais de 200 colaboradores reunidos no evento de verão. Vê as fotos e os momentos em destaque.', color: '', icon: '', archive: true, image: 'https://images.unsplash.com/photo-1529543544282-ea669407fca3?w=600&h=400&fit=crop&auto=format&q=70' },
  { id: 103, date: '30 Jun 2026', category: 'Políticas',  title: 'Nova política de despesas aprovada',                  excerpt: 'Simplificação do processo de submissão e reembolso de despesas profissionais com efeitos a julho.', color: '', icon: '', archive: true, image: 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=600&h=400&fit=crop&auto=format&q=70' },
  { id: 104, date: '15 Jun 2026', category: 'Benefícios', title: 'Subsídio de refeição aumenta para €8,32',             excerpt: 'O valor do subsídio de refeição é atualizado em linha com o regulamento vigente, com efeitos retroativos a junho.', color: '', icon: '', archive: true, image: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=600&h=400&fit=crop&auto=format&q=70' },
  { id: 105, date: '1 Jun 2026',  category: 'Carreiras',  title: 'Catálogo de formação 2026 — 2.º semestre disponível', excerpt: '42 ações de formação em áreas técnicas, liderança e bem-estar. Inscrições abertas no Odoo.', color: '', icon: '', archive: true, image: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=600&h=400&fit=crop&auto=format&q=70' },
]

// ── Documentos ──
const DOC_CATS = ['Todos', 'Regulamentos', 'Leis', 'Políticas', 'Contratos', 'Formulários']
const DOCS_DATA: TISDocument[] = [
  { id: 1, name: 'Regulamento Interno de Trabalho.pdf',  type: 'pdf',  category: 'Regulamentos', size: '2,4 MB', pages: 48,  date: 'Jan 2026', excerpt: 'Art. 15.º — O período normal de trabalho é de 40 horas semanais, distribuídas por 5 dias. Regimes de horário flexível podem ser aprovados pela direção.' },
  { id: 2, name: 'Política de Teletrabalho 2026.pdf',    type: 'pdf',  category: 'Políticas',     size: '890 KB', pages: 12,  date: 'Fev 2026', excerpt: 'Secção 3 — Elegibilidade: Colaboradores com contrato sem termo e mínimo de 6 meses de antiguidade podem aderir ao teletrabalho, até 3 dias por semana.' },
  { id: 3, name: 'Código do Trabalho (excertos).pdf',    type: 'pdf',  category: 'Leis',          size: '5,1 MB', pages: 120, date: 'Dez 2023', excerpt: 'Art. 282.º — Férias: O trabalhador tem direito a um período anual de férias remuneradas de 22 dias úteis, acrescidos de 1 dia por cada 5 anos de antiguidade.' },
  { id: 4, name: 'Contrato Individual de Trabalho.docx', type: 'docx', category: 'Contratos',     size: '340 KB', pages: 8,   date: 'Mar 2024', excerpt: 'Cláusula 5.ª — A retribuição base mensal é acordada entre as partes, acrescida de subsídio de refeição e demais subsídios legalmente previstos.' },
  { id: 5, name: 'Manual do Colaborador TIS 2026.pdf',   type: 'pdf',  category: 'Regulamentos', size: '4,2 MB', pages: 64,  date: 'Jan 2026', excerpt: 'Capítulo 2 — Na TIS acreditamos que equipas diversas e inclusivas constroem produtos melhores. O nosso código de conduta aplica-se a todos os colaboradores.' },
  { id: 6, name: 'Política de Despesas e Reembolsos.pdf',type: 'pdf',  category: 'Políticas',     size: '520 KB', pages: 6,   date: 'Abr 2026', excerpt: 'Ponto 4 — O pedido de reembolso deve ser submetido no Odoo no prazo de 30 dias após a despesa, com comprovativo para valores superiores a €25.' },
  { id: 7, name: 'Regulamento RGPD Interno.pdf',         type: 'pdf',  category: 'Regulamentos', size: '1,8 MB', pages: 24,  date: 'Jun 2024', excerpt: 'Art. 6.º — A TIS é responsável pelo tratamento dos dados pessoais dos colaboradores e garante o cumprimento do RGPD em todos os processos de RH.' },
  { id: 8, name: 'Formulário de Pedido de Férias.docx',  type: 'docx', category: 'Formulários',   size: '95 KB',  pages: 2,   date: 'Jan 2026', excerpt: 'Preencher com: nome, número de colaborador, período solicitado e assinatura da chefia direta. Submeter com 10 dias de antecedência.' },
  { id: 9, name: 'Plano de Formação 2026.xlsx',          type: 'xlsx', category: 'Políticas',     size: '1,1 MB', pages: 4,   date: 'Jan 2026', excerpt: 'Catálogo de 42 ações de formação disponíveis no 2.º semestre de 2026, nas áreas técnicas, liderança, comunicação e bem-estar.' },
  { id: 10, name: 'Seguro de Saúde — Apólice Medis.pdf', type: 'pdf',  category: 'Contratos',     size: '3,3 MB', pages: 32,  date: 'Out 2025', excerpt: 'Art. 12.º — O plano cobre consultas de medicina geral, especialidades, internamento, cirurgia e meios de diagnóstico. A partir de out 2026 inclui psicologia e nutrição.' },
]
const DOC_MOCK_RESPONSES: Array<{ keywords: string[]; response: string; docIds: number[] }> = [
  { keywords: ['férias', 'dias', 'ausência', 'vac'], response: 'De acordo com o Código do Trabalho (Art. 282.º) e o Regulamento Interno TIS (Art. 15.º), tens direito a 22 dias úteis de férias por ano. Colaboradores com mais de 5 anos de antiguidade acumulam 1 dia adicional por cada 5 anos de serviço.', docIds: [3, 1] },
  { keywords: ['teletrabalho', 'remoto', 'casa', 'híbrido'], response: 'Segundo a Política de Teletrabalho 2026 (Secção 3), podes trabalhar remotamente até 3 dias por semana, mediante acordo escrito com a tua chefia direta. O equipamento de trabalho é fornecido pela TIS. A elegibilidade exige contrato sem termo e mínimo de 6 meses de antiguidade.', docIds: [2] },
  { keywords: ['seguro', 'saúde', 'medis', 'cobertura', 'médico', 'consulta'], response: 'A apólice Medis TIS (Art. 12.º) cobre consultas de medicina geral e especialidades, internamento hospitalar, cirurgia e meios complementares de diagnóstico. A partir de outubro 2026, a cobertura é alargada a psicologia, nutrição e fisioterapia, sem limite de sessões.', docIds: [10] },
  { keywords: ['despesa', 'reembolso', 'viagem', 'recibo'], response: 'Nos termos da Política de Despesas e Reembolsos (Ponto 4), tens 30 dias após a realização da despesa para submeter o pedido de reembolso no Odoo. Comprovativo obrigatório para valores acima de €25. Despesas de viagem e alojamento têm limites definidos no Anexo A.', docIds: [6] },
  { keywords: ['rgpd', 'dados', 'privacidade', 'pessoais'], response: 'Segundo o Regulamento RGPD Interno TIS (Art. 6.º), a empresa é responsável pelo tratamento dos dados pessoais dos colaboradores, assegurando o cumprimento do RGPD. Os dados são conservados pelo período mínimo exigido por lei e nunca partilhados com terceiros sem consentimento.', docIds: [7] },
  { keywords: ['formação', 'curso', 'aprendizagem', 'inscr'], response: 'O Plano de Formação TIS 2026 prevê 42 ações de formação no 2.º semestre, cobrindo áreas técnicas, liderança, comunicação e bem-estar. As inscrições são feitas no Odoo (Formação > Catálogo). Cada colaborador tem direito a pelo menos 35 horas de formação por ano.', docIds: [9, 5] },
  { keywords: ['contrato', 'vínculo', 'salário', 'remuner'], response: 'O Contrato Individual de Trabalho (Cláusula 5.ª) define a retribuição base mensal, acrescida de subsídio de refeição (€8,32/dia útil) e demais subsídios legais. Alterações contratuais requerem acordo por escrito entre ambas as partes.', docIds: [4] },
]

// ── Chat history mock ──
const MOCK_CHAT_HISTORY: ChatSession[] = [
  { id: 1, title: 'Férias de verão', date: '28 Ago', preview: 'Tens 18 dias de férias disponíveis este ano…',
    messages: [
      { id: 0, role: 'agent', content: 'Olá, Maria! 👋 Sou a tua assistente de RH da TIS. Como posso ajudar-te hoje?' },
      { id: 1, role: 'user',  content: 'Quantos dias de férias tenho disponíveis?' },
      { id: 2, role: 'agent', content: 'Tens atualmente 18 dias de férias disponíveis este ano (de um total de 22 dias por regulamento — já usaste 4 dias).\n\nQueres já marcar alguns dias?' },
      { id: 3, role: 'user',  content: 'Sim, quero marcar de 15 a 22 de agosto' },
      { id: 4, role: 'agent', content: 'Claro! Para submeter o pedido de férias preciso de saber as datas. Qual é o período que pretendes?' },
    ]
  },
  { id: 2, title: 'Declaração para o banco', date: '22 Ago', preview: 'Posso submeter o pedido para ti. Que tipo…',
    messages: [
      { id: 0, role: 'agent', content: 'Olá, Maria! 👋 Sou a tua assistente de RH da TIS. Como posso ajudar-te hoje?' },
      { id: 1, role: 'user',  content: 'Preciso de uma declaração de trabalho para fins bancários' },
      { id: 2, role: 'agent', content: 'Posso submeter o pedido para ti. Que tipo de declaração precisas?\n\n• Declaração para fins bancários\n• Declaração de vínculo e categoria\n• Declaração de rendimentos\n\nQual delas precisas?' },
      { id: 3, role: 'user',  content: 'Declaração para fins bancários, por favor' },
      { id: 4, role: 'agent', content: 'Pedido submetido! ✅ Receberás a declaração em 3 a 5 dias úteis no teu e-mail institucional.' },
    ]
  },
  { id: 3, title: 'Política de teletrabalho', date: '15 Ago', preview: 'A TIS permite até 3 dias por semana…',
    messages: [
      { id: 0, role: 'agent', content: 'Olá, Maria! 👋 Sou a tua assistente de RH da TIS. Como posso ajudar-te hoje?' },
      { id: 1, role: 'user',  content: 'Qual é a política de teletrabalho?' },
      { id: 2, role: 'agent', content: 'A política de teletrabalho da TIS permite modalidade híbrida:\n\n• Até 3 dias por semana em teletrabalho\n• Acordo com a chefia direta\n• Equipamento fornecido pela empresa\n\nConsulta o Regulamento de Teletrabalho TIS 2026 para mais detalhes.' },
    ]
  },
  { id: 4, title: 'Avaliação de desempenho', date: '10 Ago', preview: 'O ciclo anual tem 3 etapas: Autoavaliação…',
    messages: [
      { id: 0, role: 'agent', content: 'Olá, Maria! 👋 Sou a tua assistente de RH da TIS. Como posso ajudar-te hoje?' },
      { id: 1, role: 'user',  content: 'Como funciona a avaliação de desempenho?' },
      { id: 2, role: 'agent', content: 'O ciclo de avaliação de desempenho 2026 tem estas etapas:\n\n1. Autoavaliação — 1 a 15 de outubro\n2. Reunião com a chefia — 16 a 31 de outubro\n3. Validação final — novembro\n\nA tua avaliação está atualmente: Por iniciar.' },
    ]
  },
]

// ── Eventos / Calendário ──
const EVENTS_DATA: TISEvent[] = [
  { date: '2026-09-03', title: 'Kick-off Q4',              type: 'meeting',  color: '#036ef2', time: '10h00 – 12h00', location: 'Sala Tejo · Lisboa',                  organizer: 'Direcção Geral',            description: 'Reunião de alinhamento estratégico para o quarto trimestre. Apresentação dos objetivos, KPIs e iniciativas prioritárias de cada área.' },
  { date: '2026-09-08', title: 'Formação: Liderança',      type: 'training', color: '#8200c8', time: '09h00 – 18h00', location: 'Nova SBE · Carcavelos',               organizer: 'Cultura & Pessoas',         description: 'Primeiro módulo do programa de liderança em parceria com a Nova SBE. Foco em comunicação eficaz, gestão de conflitos e tomada de decisão.' },
  { date: '2026-09-10', title: 'Check-in Avaliações',      type: 'hr',       color: '#1e3a8a', time: '14h00 – 17h00', location: 'Online (Teams)',                       organizer: 'Cultura & Pessoas',         description: 'Sessão de preparação para o ciclo de avaliação de desempenho. Explicação do processo, dos critérios e resposta a dúvidas.' },
  { date: '2026-09-10', title: 'Coffee & Connect',         type: 'social',   color: '#1e3a8a', time: '09h00 – 09h30', location: 'Cozinha TIS · Lisboa',                    organizer: 'Comissão de Eventos',       description: 'Momento informal de convívio matinal entre equipas. Café, croissants e conversa antes do arranque do dia.' },
  { date: '2026-09-12', title: 'Sessão de Bem-estar',      type: 'wellness', color: '#ec4899', time: '12h30 – 13h30', location: 'Jardim TIS · Lisboa',                  organizer: 'Programa Bem-estar',        description: 'Sessão semanal de mindfulness e relaxamento ao ar livre. Aberta a todos os colaboradores, sem necessidade de inscrição.' },
  { date: '2026-09-15', title: 'Autoavaliação — início',   type: 'hr',       color: '#c026d3', time: 'Todo o dia',    location: 'Odoo (portal)',                        organizer: 'Cultura & Pessoas',         description: 'Início do período de autoavaliação de desempenho 2026. Acede ao Odoo e preenche o teu formulário até 30 de setembro.' },
  { date: '2026-09-18', title: 'Formação: Excel Avançado', type: 'training', color: '#8200c8', time: '09h30 – 17h30', location: 'Sala Alpha · Porto',                   organizer: 'Cultura & Pessoas',         description: 'Formação prática em Excel avançado: tabelas dinâmicas, Power Query, macros e dashboards. Traz o teu portátil.' },
  { date: '2026-09-20', title: 'TIS Team Day',             type: 'social',   color: '#1e3a8a', time: '09h00 – 18h00', location: 'Pavilhão do Conhecimento · Lisboa',    organizer: 'Comissão de Eventos',       description: 'Encontro anual de todos os colaboradores TIS. Programa inclui sessões plenárias, workshops, almoço coletivo e atividades de team building.' },
  { date: '2026-09-20', title: 'Prémio de Inovação',      type: 'social',   color: '#8200c8', time: '17h00 – 18h00', location: 'Pavilhão do Conhecimento · Lisboa',    organizer: 'Inovação & Transformação',  description: 'Cerimónia integrada no Team Day. Apresentação dos projetos finalistas e anúncio dos vencedores do Prémio de Inovação TIS 2026.' },
  { date: '2026-09-20', title: 'Cocktail de Networking',  type: 'wellness', color: '#ec4899', time: '18h30 – 20h00', location: 'Foyer · Pavilhão do Conhecimento',     organizer: 'Comissão de Eventos',       description: 'Cocktail de encerramento do Team Day. Drinks, petiscos e networking entre todos os colaboradores TIS.' },
  { date: '2026-09-22', title: 'Sessão de Onboarding',     type: 'hr',       color: '#1e3a8a', time: '10h00 – 13h00', location: 'Sala Douro · Lisboa',                  organizer: 'Cultura & Pessoas',         description: 'Sessão de integração para novos colaboradores. Apresentação da empresa, cultura TIS, benefícios e ferramentas internas.' },
  { date: '2026-09-25', title: 'Workshop Design Thinking', type: 'training', color: '#8200c8', time: '09h00 – 17h00', location: 'Hub Inovação · Lisboa',                organizer: 'Inovação & Transformação',  description: 'Imersão de um dia em metodologias de Design Thinking aplicadas à resolução de problemas organizacionais.' },
  { date: '2026-09-29', title: 'Happy Hour TIS',           type: 'social',   color: '#1e3a8a', time: '18h30 – 21h00', location: 'Rooftop TIS · Lisboa',                 organizer: 'Comissão de Eventos',       description: 'Convívio mensal informal para todos os colaboradores. Drinks, petiscos e boa disposição no rooftop da sede.' },
  { date: '2026-10-01', title: 'Início Avaliações',        type: 'hr',       color: '#c026d3', time: 'Todo o dia',    location: 'Odoo (portal)',                        organizer: 'Cultura & Pessoas',         description: 'Início das reuniões de avaliação de desempenho com a chefia direta. Consulta a tua agenda no Odoo.' },
  { date: '2026-10-05', title: 'Reunião de Líderes',       type: 'meeting',  color: '#036ef2', time: '09h00 – 13h00', location: 'Sala Tejo · Lisboa',                  organizer: 'Direcção Geral',            description: 'Reunião trimestral de líderes de equipa. Revisão de performance, desafios e prioridades para Q4.' },
  { date: '2026-10-15', title: 'Reunião com Chefia',       type: 'hr',       color: '#c026d3', time: '14h00 – 18h00', location: 'A definir',                            organizer: 'Cultura & Pessoas',         description: 'Período de reuniões individuais de avaliação de desempenho entre colaborador e chefia direta.' },
  { date: '2026-08-28', title: 'Prémio Inovação',          type: 'social',   color: '#1e3a8a', time: '18h00 – 20h00', location: 'Auditório TIS · Lisboa',               organizer: 'Inovação & Transformação',  description: 'Cerimónia de entrega do Prémio de Inovação TIS 2026. Apresentação dos projetos finalistas e anúncio dos vencedores.' },
]

const PT_MONTHS = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro']
const PT_DAYS   = ['Seg','Ter','Qua','Qui','Sex','Sáb','Dom']

function getMonthDays(year: number, month: number): Array<number | null> {
  const first = new Date(year, month, 1).getDay()
  const startPad = first === 0 ? 6 : first - 1
  const total = new Date(year, month + 1, 0).getDate()
  return [...Array(startPad).fill(null), ...Array.from({ length: total }, (_, i) => i + 1)]
}
function eventsForDay(year: number, month: number, day: number): TISEvent[] {
  const str = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
  return EVENTS_DATA.filter(e => e.date === str)
}

function generateResponse(msg: string): string {
  const m = msg.toLowerCase()
  if (m.includes('férias') || m.includes('ferias')) {
    if (m.includes('marcar') || m.includes('pedir') || m.includes('quero') || m.includes('submeter'))
      return 'Claro! Para submeter o pedido de férias preciso de saber as datas. Qual é o período que pretendes?'
    return 'Tens atualmente 18 dias de férias disponíveis este ano (de um total de 22 dias por regulamento — já usaste 4 dias).\n\nQueres já marcar alguns dias?'
  }
  if (m.includes('avalia') || m.includes('desempenho'))
    return 'O ciclo de avaliação de desempenho 2026 tem estas etapas:\n\n1. Autoavaliação — 1 a 15 de outubro\n2. Reunião com a chefia — 16 a 31 de outubro\n3. Validação final — novembro\n\nA tua avaliação está atualmente: Por iniciar.'
  if (m.includes('declaração') || m.includes('declaracao') || m.includes('certificado'))
    return 'Posso submeter o pedido para ti. Que tipo de declaração precisas?\n\n• Declaração para fins bancários\n• Declaração de vínculo e categoria\n• Declaração de rendimentos\n\nQual delas precisas?'
  if (m.includes('baixa') || m.includes('doença') || m.includes('médico'))
    return 'Em caso de baixa médica, deves comunicar ao teu responsável o mais rápido possível e entregar o certificado de incapacidade temporária (CIT) ao RH nos prazos legais.\n\nPrecisas de ajuda para enviar o certificado?'
  if (m.includes('teletrabalho') || m.includes('remoto') || m.includes('horário'))
    return 'A política de teletrabalho da TIS permite modalidade híbrida:\n\n• Até 3 dias por semana em teletrabalho\n• Acordo com a chefia direta\n• Equipamento fornecido pela empresa\n\nConsulta o Regulamento de Teletrabalho TIS 2026 para mais detalhes.'
  if (m.includes('benefício') || m.includes('salário') || m.includes('remuner'))
    return 'Os benefícios da TIS incluem:\n\n• Seguro de saúde (extensível à família)\n• Subsídio de refeição\n• Plano de formação anual\n• Programa de bem-estar\n\nPara informações sobre a tua remuneração, contacta diretamente o RH.'
  if (m.includes('formação') || m.includes('curso') || m.includes('treino'))
    return 'Tens 2 formações registadas este ano e 1 inscrição pendente — Liderança e Comunicação, com início previsto em outubro.\n\nQueres consultar o catálogo de formações disponíveis?'
  if (m.includes('obrigad') || m.includes('brigad'))
    return 'De nada! 😊 Se precisares de mais ajuda com qualquer assunto de RH, estou aqui. Tem um ótimo dia!'
  if (/^(olá|ola|bom dia|boa tarde|boa noite|oi|hey|hello)[\s!]*$/.test(m))
    return 'Olá! Em que posso ajudar-te hoje? Podes perguntar sobre férias, avaliações, documentos, formações ou qualquer outro assunto de RH.'
  return 'Percebi a tua questão. Para te dar a melhor resposta, podes dar-me mais detalhes? Também posso ajudar diretamente com férias, declarações, avaliações ou outros pedidos administrativos.'
}

// ── Nav icons ──
type NavItem = { id: string; label: string; icon: React.FC<{ className?: string }> }
function IconAbout({ className }: { className?: string }) {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="12" cy="8" r="3.5" /><path d="M5 20c0-3.866 3.134-7 7-7s7 3.134 7 7" /></svg>
}
function IconFaq({ className }: { className?: string }) {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="12" cy="12" r="9" /><path d="M9.5 9a2.5 2.5 0 0 1 5 0c0 1.5-1.5 2-2.5 2.5V13" /><circle cx="12" cy="16.5" r=".5" fill="currentColor" /></svg>
}
function IconNews({ className }: { className?: string }) {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M4 6h16M4 10h10M4 14h8M4 18h5" /><rect x="2" y="3" width="20" height="18" rx="2" /></svg>
}
function IconEvents({ className }: { className?: string }) {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className={className}><rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" /><circle cx="8" cy="16" r="1" fill="currentColor" /><circle cx="12" cy="16" r="1" fill="currentColor" /><circle cx="16" cy="16" r="1" fill="currentColor" /></svg>
}

// ── Chat topic icons (single-color white) ──
function IconSun({ className }: { className?: string }) {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M2 12h2M20 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" /></svg>
}
function IconStar({ className }: { className?: string }) {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className={className}><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>
}
function IconDoc({ className }: { className?: string }) {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="8" y1="13" x2="16" y2="13"/><line x1="8" y1="17" x2="16" y2="17"/></svg>
}
function IconLibrary({ className }: { className?: string }) {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className={className}><rect x="2" y="3" width="4" height="18" rx="1"/><rect x="9" y="3" width="4" height="18" rx="1"/><path d="M16 3l4.5 16.5M16 7l3 11"/></svg>
}
function IconHome({ className }: { className?: string }) {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
}
function IconGift({ className }: { className?: string }) {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className={className}><polyline points="20 12 20 22 4 22 4 12"/><rect x="2" y="7" width="20" height="5"/><line x1="12" y1="22" x2="12" y2="7"/><path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"/><path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"/></svg>
}
function IconBook({ className }: { className?: string }) {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>
}
function IconHeart({ className }: { className?: string }) {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
}
function IconCoin({ className }: { className?: string }) {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="12" cy="12" r="8"/><path d="M12 8v8M9.5 10h4a1.5 1.5 0 0 1 0 3h-3a1.5 1.5 0 0 0 0 3H15"/></svg>
}

// ── Utility icons ──
function TisMark({ className }: { className?: string }) {
  return <svg viewBox="0 0 80 80" className={className} fill="currentColor"><circle cx="40" cy="12" r="6" /><circle cx="40" cy="68" r="6" /><circle cx="12" cy="40" r="6" /><circle cx="68" cy="40" r="6" /><circle cx="40" cy="40" r="6" /><path d="M40 18 L40 62 M18 40 L62 40" stroke="currentColor" strokeWidth="5" strokeLinecap="round" fill="none" /></svg>
}
function SendIcon({ className }: { className?: string }) {
  return <svg viewBox="0 0 24 24" fill="currentColor" className={className}><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" /></svg>
}
function IconSignOut({ className }: { className?: string }) {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></svg>
}
function IconSearch({ className }: { className?: string }) {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
}
function IconHistory({ className }: { className?: string }) {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="12" cy="12" r="9"/><polyline points="12 7 12 12 15 15"/></svg>
}
function IconPlus({ className }: { className?: string }) {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className}><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
}
function IconArchive({ className }: { className?: string }) {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className={className}><polyline points="21 8 21 21 3 21 3 8"/><rect x="1" y="3" width="22" height="5"/><line x1="10" y1="12" x2="14" y2="12"/></svg>
}
function DocTypeIcon({ type, className }: { type: TISDocument['type']; className?: string }) {
  const docBase = <>
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
    <polyline points="14 2 14 8 20 8"/>
  </>
  if (type === 'pdf') return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className={className}>
      {docBase}
      <line x1="8" y1="11.5" x2="16" y2="11.5" strokeWidth={1.3}/>
      <line x1="8" y1="14"   x2="13" y2="14"   strokeWidth={1.3}/>
      <line x1="8" y1="16.5" x2="16" y2="16.5" strokeWidth={1.3}/>
      <text x="12" y="20.5" textAnchor="middle" fontSize="3.5" fill="currentColor" stroke="none" fontWeight="800" fontFamily="system-ui,sans-serif">PDF</text>
    </svg>
  )
  if (type === 'docx') return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className={className}>
      {docBase}
      <polyline points="8 11.5 9.5 16.5 12 13.5 14.5 16.5 16 11.5" strokeWidth={1.4}/>
      <text x="12" y="20.5" textAnchor="middle" fontSize="3.5" fill="currentColor" stroke="none" fontWeight="800" fontFamily="system-ui,sans-serif">DOC</text>
    </svg>
  )
  if (type === 'xlsx') return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className={className}>
      {docBase}
      <rect x="7.5" y="10.5" width="9" height="6" rx="0.4" strokeWidth={1.2}/>
      <line x1="7.5" y1="13" x2="16.5" y2="13" strokeWidth={1.2}/>
      <line x1="7.5" y1="15" x2="16.5" y2="15" strokeWidth={1.2}/>
      <line x1="11" y1="10.5" x2="11" y2="16.5" strokeWidth={1.2}/>
      <text x="12" y="20.5" textAnchor="middle" fontSize="3.5" fill="currentColor" stroke="none" fontWeight="800" fontFamily="system-ui,sans-serif">XLS</text>
    </svg>
  )
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className={className}>
      {docBase}
      <text x="12" y="17.5" textAnchor="middle" fontSize="5" fill="currentColor" stroke="none" fontWeight="700" fontFamily="system-ui,sans-serif">{type.toUpperCase()}</text>
    </svg>
  )
}
function IconDownload({ className }: { className?: string }) {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
}
function IconArrowLeft({ className }: { className?: string }) {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M19 12H5"/><path d="M12 19l-7-7 7-7"/></svg>
}
function MicrosoftLogo({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 21 21" className={className ?? "h-5 w-5 shrink-0"}>
      <rect x="0"  y="0"  width="9.5" height="9.5" fill="#F25022" />
      <rect x="11" y="0"  width="9.5" height="9.5" fill="#7FBA00" />
      <rect x="0"  y="11" width="9.5" height="9.5" fill="#00A4EF" />
      <rect x="11" y="11" width="9.5" height="9.5" fill="#FFB900" />
    </svg>
  )
}

const CHAT_TOPICS: ChatTopic[] = [
  { id: 'ferias',       icon: IconSun,   label: 'Férias',       question: 'Quero informações sobre as minhas férias' },
  { id: 'avaliacao',    icon: IconStar,  label: 'Avaliação',    question: 'Como funciona a avaliação de desempenho?' },
  { id: 'declaracoes',  icon: IconDoc,   label: 'Declarações',  question: 'Preciso de uma declaração de trabalho' },
  { id: 'teletrabalho', icon: IconHome,  label: 'Teletrabalho', question: 'Qual é a política de teletrabalho?' },
  { id: 'beneficios',   icon: IconGift,  label: 'Benefícios',   question: 'Quais são os meus benefícios?' },
  { id: 'formacao',     icon: IconBook,  label: 'Formação',     question: 'Que formações tenho disponíveis?' },
  { id: 'baixa',        icon: IconHeart, label: 'Baixa médica', question: 'O que acontece numa baixa médica?' },
  { id: 'remuneracao',  icon: IconCoin,  label: 'Remuneração',  question: 'Tenho dúvidas sobre o meu vencimento' },
]

const NAV_ITEMS: NavItem[] = [
  { id: 'sobre',       label: 'Início',      icon: IconAbout   },
  { id: 'faqs',        label: "FAQ's",       icon: IconFaq     },
  { id: 'noticias',    label: 'Notícias',    icon: IconNews    },
  { id: 'eventos',     label: 'Eventos',     icon: IconEvents  },
  { id: 'documentos',  label: 'Documentos',  icon: IconLibrary },
]

const DEMO_USER: TISUser = {
  name:     'Maria Santos',
  email:    'maria.santos@tis.pt',
  initials: 'MS',
  dept:     'Direcção de Cultura & Pessoas',
}

export default function App() {
  const gridRef      = useRef<HTMLDivElement>(null)
  const messagesEnd  = useRef<HTMLDivElement>(null)
  const msgId        = useRef(1)
  const bubbleKey    = useRef(0)
  const bubblesAlive = useRef(false)

  const [authed,        setAuthed]        = useState(false)
  const [authLoading,   setAuthLoading]   = useState(false)
  const [user,          setUser]          = useState<TISUser | null>(null)
  const [activeNav,     setActiveNav]     = useState('sobre')
  const [chatOpen,      setChatOpen]      = useState(false)
  const [messages,      setMessages]      = useState<Message[]>([])
  const [inputText,     setInputText]     = useState('')
  const [isTyping,      setIsTyping]      = useState(false)
  const [bubbles,       setBubbles]       = useState<Bubble[]>([])
  const [activeTopic,   setActiveTopic]   = useState<string | null>(null)
  const [expandedFaq,   setExpandedFaq]   = useState<number | null>(null)
  const [selectedDay,   setSelectedDay]   = useState<number | null>(null)
  const [calDate,       setCalDate]       = useState(() => new Date(2026, 8, 1))
  const [newsSearch,    setNewsSearch]     = useState('')
  const [showArchive,   setShowArchive]   = useState(false)
  const [newsCategory,  setNewsCategory]  = useState('')
  const [newsPage,      setNewsPage]      = useState(0)
  const [selectedNews,  setSelectedNews]  = useState<NewsItem | null>(null)
  const [selectedEvent, setSelectedEvent] = useState<TISEvent | null>(null)
  const [historyOpen,   setHistoryOpen]   = useState(false)
  const [chatHistory,   setChatHistory]   = useState<ChatSession[]>(MOCK_CHAT_HISTORY)
  const sessionIdRef = useRef(200)
  const [isMobile, setIsMobile] = useState(() => typeof window !== 'undefined' && window.innerWidth < 768)
  const [mobileEventsTab] = useState<'calendar' | 'list'>('calendar')
  const [docCategory,  setDocCategory]  = useState('Todos')
  const [docQuery,     setDocQuery]     = useState('')
  const [docMessages,  setDocMessages]  = useState<DocMessage[]>([])
  const [docThinking,  setDocThinking]  = useState(false)
  const [previewDoc,   setPreviewDoc]   = useState<TISDocument | null>(null)
  const [docChatOpen,  setDocChatOpen]  = useState(false)

  // ── GSAP mural: hide all cells on mount so the login screen sits over a blank canvas ──
  useEffect(() => {
    if (!gridRef.current) return
    const cells = Array.from(gridRef.current.children) as HTMLElement[]
    gsap.set(cells, { opacity: 0 })
  }, [])

  // ── GSAP mural: assemble + cycle only after login ──
  useEffect(() => {
    if (!authed || !gridRef.current) return
    const cells = Array.from(gridRef.current.children) as HTMLElement[]
    let cycleTimer: ReturnType<typeof setTimeout> | null = null
    let alive = true
    const shuffled = [...cells].sort(() => Math.random() - 0.5)
    shuffled.forEach(cell => {
      gsap.set(cell, { opacity: 0, scale: 0.3 + Math.random() * 0.2, filter: `blur(${8 + Math.round(Math.random() * 8)}px)`, transformOrigin: '50% 50%' })
    })
    const tl = gsap.timeline()
    shuffled.forEach((cell, i) => {
      tl.to(cell, { opacity: 1, scale: 1, filter: 'blur(0px)', duration: 0.8 + Math.random() * 0.4, ease: 'expo.out' }, i * 0.085)
    })
    tl.call(startPhase2)
    function startPhase2() { if (alive) schedCycle() }
    function schedCycle() { cycleTimer = setTimeout(runCycle, 2000 + Math.random() * 2000) }
    function runCycle() {
      if (!alive) return
      const pool = [...cells]
      const batch: HTMLElement[] = []
      for (let i = 0; i < 3 + Math.round(Math.random() * 3); i++) batch.push(pool.splice(Math.floor(Math.random() * pool.length), 1)[0])
      batch.forEach((cell, i) => {
        gsap.to(cell, {
          opacity: 0, scale: 0.88, filter: 'blur(5px)',
          duration: 1.5 + Math.random() * 0.7, delay: i * (0.15 + Math.random() * 0.3), ease: 'sine.in',
          onComplete: () => {
            if (!alive) return
            cell.style.backgroundImage = `url(${photoUrl(PHOTO_IDS[Math.floor(Math.random() * PHOTO_IDS.length)])})`
            gsap.to(cell, { opacity: 1, scale: 1, filter: 'blur(0px)', duration: 1.8 + Math.random() * 1.0, delay: 0.2 + Math.random() * 0.5, ease: 'sine.out' })
          },
        })
      })
      schedCycle()
    }
    return () => { alive = false; tl.kill(); gsap.killTweensOf(cells); if (cycleTimer) clearTimeout(cycleTimer) }
  }, [authed])

  // ── Speech bubble cycling ──
  useEffect(() => {
    if (!authed) return
    bubblesAlive.current = true
    const timers: ReturnType<typeof setTimeout>[] = []
    const usedPerSlot: number[] = BUBBLE_SLOTS.map(() => -1)
    function runSlot(slot: number, delay: number) {
      const t = setTimeout(() => {
        if (!bubblesAlive.current) return
        let idx: number
        do { idx = Math.floor(Math.random() * HR_QUESTIONS.length) } while (idx === usedPerSlot[slot])
        usedPerSlot[slot] = idx
        const key = bubbleKey.current++
        setBubbles(prev => [...prev.filter(b => b.slot !== slot), { key, slot, text: HR_QUESTIONS[idx], visible: false }])
        const t2 = setTimeout(() => setBubbles(prev => prev.map(b => b.key === key ? { ...b, visible: true } : b)), 80)
        timers.push(t2)
        const show = 4200 + Math.random() * 2800
        const t3 = setTimeout(() => {
          if (!bubblesAlive.current) return
          setBubbles(prev => prev.map(b => b.key === key ? { ...b, visible: false } : b))
          const t4 = setTimeout(() => {
            setBubbles(prev => prev.filter(b => b.key !== key))
            if (bubblesAlive.current) runSlot(slot, 1400 + Math.random() * 2000)
          }, 700)
          timers.push(t4)
        }, show)
        timers.push(t3)
      }, delay)
      timers.push(t)
    }
    BUBBLE_SLOTS.forEach((_, slot) => runSlot(slot, slot * 650 + Math.random() * 350))
    return () => { bubblesAlive.current = false; timers.forEach(clearTimeout); setBubbles([]) }
  }, [authed])

  // ── Detect mobile ──
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 767px)')
    const h = (e: MediaQueryListEvent) => setIsMobile(e.matches)
    mq.addEventListener('change', h)
    setIsMobile(mq.matches)
    return () => mq.removeEventListener('change', h)
  }, [])

  // ── Auto-scroll chat ──
  useEffect(() => { messagesEnd.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages, isTyping])

  function handleMicrosoftLogin() {
    setAuthLoading(true)
    setTimeout(() => { setUser(DEMO_USER); setAuthed(true); setAuthLoading(false) }, 1800)
  }
  function handleSignOut() {
    setAuthed(false); setUser(null); setChatOpen(false)
    setMessages([]); setInputText(''); setIsTyping(false)
    setActiveNav('sobre'); setActiveTopic(null)
  }
  function openChat() {
    setChatOpen(true); setActiveTopic(null); setHistoryOpen(false)
    setMessages([{ id: 0, role: 'agent', content: `Olá, ${user?.name?.split(' ')[0]}! 👋 Sou a tua assistente de RH da TIS. Estou aqui para ajudar com férias, avaliações, documentos e muito mais.\n\nComo posso ajudar-te hoje?` }])
  }
  function openChatMobile() {
    setActiveNav('chat'); setActiveTopic(null); setHistoryOpen(false)
    if (messages.length === 0) {
      setMessages([{ id: 0, role: 'agent', content: `Olá, ${user?.name?.split(' ')[0]}! 👋 Sou a tua assistente de RH da TIS. Estou aqui para ajudar com férias, avaliações, documentos e muito mais.\n\nComo posso ajudar-te hoje?` }])
    }
  }
  function closeChat() {
    if (messages.length > 1) {
      const userMsg = messages.find(m => m.role === 'user')
      const title = userMsg ? userMsg.content.slice(0, 38) + (userMsg.content.length > 38 ? '…' : '') : 'Conversa'
      const lastAgent = [...messages].reverse().find(m => m.role === 'agent')
      const preview = lastAgent ? lastAgent.content.slice(0, 52) + '…' : ''
      const now = new Date()
      const date = `${now.getDate()} ${['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'][now.getMonth()]}`
      setChatHistory(prev => [{ id: sessionIdRef.current++, title, date, preview, messages: [...messages] }, ...prev.slice(0, 19)])
    }
    setChatOpen(false); setMessages([]); setInputText(''); setIsTyping(false); setHistoryOpen(false)
  }
  function sendMessage(text?: string) {
    const content = (text ?? inputText).trim()
    if (!content || isTyping) return
    setMessages(prev => [...prev, { id: msgId.current++, role: 'user', content }])
    setInputText(''); setIsTyping(true)
    setTimeout(() => {
      setMessages(prev => [...prev, { id: msgId.current++, role: 'agent', content: generateResponse(content) }])
      setIsTyping(false)
    }, 850 + Math.random() * 650)
  }

  const ease = 'cubic-bezier(0.4,0,0.2,1)'
  const loginGlass = { background: 'rgba(255,255,255,0.10)', backdropFilter: 'blur(18px)', WebkitBackdropFilter: 'blur(18px)', border: '1px solid rgba(255,255,255,0.22)', boxShadow: '0 6px 24px rgba(0,0,70,0.15)' }
  const chatGlass  = { background: 'rgba(8,22,80,0.42)',    backdropFilter: 'blur(36px)', WebkitBackdropFilter: 'blur(36px)', border: '1px solid rgba(255,255,255,0.20)', boxShadow: '0 12px 48px rgba(0,0,60,0.30)' }
  const darkOverlay = { background: 'rgba(2,8,42,0.58)' } as const
  const typeLabel: Record<string, string> = { meeting: 'Reunião', training: 'Formação', hr: 'RH', social: 'Social', wellness: 'Bem-estar' }

  return (
    <div className="relative h-full w-full overflow-hidden" style={{ fontFamily: "'Outfit', sans-serif" }}>

      {/* ── Layer 1: Mural grid ── */}
      <div ref={gridRef} className="absolute inset-0" style={{ display: 'grid', gridTemplateColumns: `repeat(${COLS}, 1fr)`, gridTemplateRows: `repeat(${ROWS}, 1fr)`, border: 0, paddingLeft: 0, paddingRight: 0 }}>
        {GRID_IDS.map((id, i) => (
          <div key={i} style={{ backgroundImage: `url(${photoUrl(id)})`, backgroundSize: 'cover', backgroundPosition: 'center top' }} />
        ))}
      </div>

      {/* ── Layer 2: Gradient overlay — more opaque on inner pages ── */}
      <div className="absolute inset-0 z-10" style={{
        background: ['faqs','noticias','eventos','documentos','chat'].includes(activeNav)
          ? 'linear-gradient(130deg, rgba(130,0,200,0.98) 0%, rgba(60,12,178,0.98) 45%, rgba(3,110,242,0.98) 100%)'
          : 'linear-gradient(130deg, rgba(130,0,200,0.9) 0%, rgba(60,12,178,0.88) 45%, rgba(3,110,242,0.9) 100%)',
        transition: 'background 0.4s ease',
      }} />

      <TisMark className="absolute left-8 bottom-8 z-20 h-8 w-8 text-white/18" />
      <TisMark className="absolute bottom-5 right-6 z-20 h-5 w-5 text-white/10" />

      {/* ══ LOGIN SCREEN ══ */}
      {!authed && (
        <div className="absolute inset-0 z-40 flex flex-col md:flex-row overflow-y-auto md:overflow-hidden" style={{ fontFamily: "'Outfit', sans-serif" }}>
          <div className="absolute inset-0" style={{ backgroundImage: `url(https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1920&h=1200&fit=crop&auto=format&q=80)`, backgroundSize: 'cover', backgroundPosition: 'center' }} />
          <div className="absolute inset-0" style={{ background: 'linear-gradient(130deg, rgba(130,0,200,0.92) 0%, rgba(60,12,178,0.90) 45%, rgba(3,110,242,0.92) 100%)' }} />

          {/* ── Left panel — logo + divider + title ── */}
          <div className="relative z-10 flex flex-col items-center justify-center px-8 md:px-16 pt-10 pb-4 md:py-0 gap-0 md:flex-1">
            <img src={juntosLogo} alt="Juntos Somos TIS" style={{ width: 'min(360px, 75vw)', filter: 'brightness(0) invert(1)', opacity: 1, padding: 0 }} />
            <div style={{ width: '50%', height: 1, background: 'rgba(255,255,255,0.28)', margin: '16px 0 14px' }} />
            <div className="text-center">
              <p className="font-light text-white/65 mb-1" style={{ letterSpacing: '0.18em', fontSize: isMobile ? 11 : 14 }}>Portal de</p>
              <h1 className="font-thin text-white leading-none" style={{ fontSize: isMobile ? 20 : 30, letterSpacing: '0.02em' }}>
                PESSOAS <span className="font-thin text-white/70">&amp;</span> CULTURA
              </h1>
            </div>
          </div>

          <div className="hidden md:block relative z-10 self-stretch" style={{ width: 1, background: 'rgba(255,255,255,0.14)', margin: '48px 0' }} />

          {/* ── Right panel — compact login form ── */}
          <div className="relative z-10 flex flex-col items-center justify-center px-6 md:px-10 pb-12 md:pb-0 w-full md:w-[42%]">
            <div className="rounded-3xl px-8" style={{ width: isMobile ? 'min(360px, 75vw)' : undefined, maxWidth: isMobile ? undefined : 340, background: 'rgba(255,255,255,0.10)', backdropFilter: 'blur(18px)', WebkitBackdropFilter: 'blur(18px)', border: '1px solid rgba(255,255,255,0.22)', boxShadow: '0 6px 24px rgba(0,0,70,0.15)', paddingTop: isMobile ? '1.8rem' : '3.6rem', paddingBottom: isMobile ? '1.8rem' : '3.6rem', marginTop: isMobile ? '2rem' : undefined }}>
              <div className="mb-6" style={isMobile ? { display: 'flex', justifyContent: 'center' } : {}}>
                <img src={tisLogoSvg} alt="TIS" style={{ height: 26, filter: 'brightness(0) invert(1)' }} />
              </div>
              <p className="mb-5 text-sm leading-relaxed text-white/60" style={isMobile ? { textAlign: 'center' } : {}}>
                Acede com a tua conta Microsoft institucional para entrar no portal de Recursos Humanos.
              </p>
              <button
                onClick={handleMicrosoftLogin}
                disabled={authLoading}
                className="w-full flex items-center justify-center gap-3 rounded-2xl bg-white px-6 py-3.5 text-sm font-semibold text-gray-700 hover:bg-white/95 active:scale-[0.98] transition-all disabled:opacity-60"
                style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.2)' }}
              >
                {authLoading ? <div className="h-5 w-5 rounded-full border-2 border-gray-300 border-t-[#036ef2] animate-spin" /> : <MicrosoftLogo className={isMobile ? "h-[22px] w-[22px] shrink-0" : "h-5 w-5 shrink-0"} />}
                <span>{authLoading ? 'A autenticar…' : 'Entrar com a Microsoft'}</span>
              </button>
              <div className="mt-6 flex items-center gap-3">
                <div className="flex-1 h-px bg-white/14" />
                <p className="text-xs text-white/35" style={{ letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>Apenas para colaboradores TIS</p>
                <div className="flex-1 h-px bg-white/14" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ══ PORTAL ══ */}
      {authed && (
        <>
          {/* ── Top Navigation ── */}
          <header className="absolute top-0 left-0 right-0 z-30 flex items-center justify-between px-4 md:px-10 py-4 md:py-5">
            <img src={tisLogoSvg} alt="TIS" style={{ height: 28, width: 'auto', filter: 'brightness(0) invert(1)' }} />
            {/* Desktop nav */}
            <div className="hidden md:flex items-center gap-1">
              {NAV_ITEMS.map(({ id, label, icon: Icon }) => (
                <button key={id} onClick={() => { setActiveNav(id); closeChat() }}
                  className={`flex items-center gap-2 rounded-full px-5 py-2 text-sm font-semibold transition-all duration-200 ${activeNav === id ? 'bg-white text-[#036ef2]' : 'text-white/80 hover:bg-white/15 hover:text-white'}`}
                  style={{ letterSpacing: '0.02em' }}
                >
                  <Icon className="h-4 w-4" />{label}
                </button>
              ))}
              <div className="mx-3 h-5 w-px bg-white/22" />
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white" style={{ background: 'rgba(255,255,255,0.22)', border: '1.5px solid rgba(255,255,255,0.35)' }}>
                  {user?.initials}
                </div>
                <div className="flex flex-col leading-tight">
                  <span className="text-sm font-semibold text-white">{user?.name}</span>
                  <span className="text-[10px] text-white/50">{user?.dept}</span>
                </div>
                <button onClick={handleSignOut} title="Terminar sessão" className="ml-1 rounded-full p-1.5 text-white/45 transition-all hover:bg-white/12 hover:text-white">
                  <IconSignOut className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
            {/* Mobile: only avatar + sign out */}
            <div className="flex md:hidden items-center gap-2">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white" style={{ background: 'rgba(255,255,255,0.22)', border: '1.5px solid rgba(255,255,255,0.35)' }}>
                {user?.initials}
              </div>
              <button onClick={handleSignOut} title="Terminar sessão" className="rounded-full p-1.5 text-white/45 transition-all hover:bg-white/12 hover:text-white">
                <IconSignOut className="h-3.5 w-3.5" />
              </button>
            </div>
          </header>

          {/* ── Mobile Bottom Navigation ── */}
          <nav className="fixed bottom-0 left-0 right-0 z-30 flex md:hidden items-center justify-around py-2"
            style={{ background: 'rgba(255,255,255,0.10)', backdropFilter: 'blur(28px)', WebkitBackdropFilter: 'blur(28px)', borderTop: '1px solid rgba(255,255,255,0.20)', boxShadow: '0 -4px 32px rgba(0,0,60,0.22)' }}>
            <button
              onClick={() => { setActiveNav('sobre'); if (chatOpen) closeChat() }}
              className="flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-all"
              style={{ color: activeNav === 'sobre' ? 'white' : 'rgba(255,255,255,0.38)' }}
            >
              <IconAbout className="h-5 w-5" />
              <span className="text-[10px] font-medium">Início</span>
            </button>
            <button
              onClick={() => { setActiveNav('faqs'); if (chatOpen) closeChat() }}
              className="flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-all"
              style={{ color: activeNav === 'faqs' ? 'white' : 'rgba(255,255,255,0.38)' }}
            >
              <IconFaq className="h-5 w-5" />
              <span className="text-[10px] font-medium">FAQ&apos;s</span>
            </button>
            <button
              onClick={() => { setActiveNav('noticias'); if (chatOpen) closeChat() }}
              className="flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-all"
              style={{ color: activeNav === 'noticias' ? 'white' : 'rgba(255,255,255,0.38)' }}
            >
              <IconNews className="h-5 w-5" />
              <span className="text-[10px] font-medium">Notícias</span>
            </button>
            <button
              onClick={() => { setActiveNav('eventos'); if (chatOpen) closeChat() }}
              className="flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-all"
              style={{ color: activeNav === 'eventos' ? 'white' : 'rgba(255,255,255,0.38)' }}
            >
              <IconEvents className="h-5 w-5" />
              <span className="text-[10px] font-medium">Eventos</span>
            </button>
            <button
              onClick={() => { setActiveNav('documentos'); if (chatOpen) closeChat() }}
              className="flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-all"
              style={{ color: activeNav === 'documentos' ? 'white' : 'rgba(255,255,255,0.38)' }}
            >
              <IconLibrary className="h-5 w-5" />
              <span className="text-[10px] font-medium">Docs</span>
            </button>
          </nav>

          {/* ── Floating chat button (global) ── */}
          {!(isMobile && activeNav === 'documentos') && !chatOpen && (
            <div className="fixed z-40 flex flex-col items-end gap-2 pointer-events-none" style={{ right: isMobile ? 16 : 32, bottom: isMobile ? 82 : 32 }}>
              {/* Speech bubble */}
              <div className="pointer-events-auto relative">
                <div className="rounded-2xl px-3.5 py-2 text-[13px] font-semibold text-white" style={{ background: 'rgba(8,22,80,0.92)', border: '1px solid rgba(255,255,255,0.24)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', boxShadow: '0 4px 18px rgba(0,0,60,0.40)', whiteSpace: 'nowrap' }}>
                  Posso ajudar? 💬
                </div>
                <div className="absolute right-5 -bottom-2" style={{ width: 0, height: 0, borderLeft: '7px solid transparent', borderRight: '7px solid transparent', borderTop: '8px solid rgba(8,22,80,0.92)' }} />
              </div>
              {/* Agent avatar button */}
              <div className="pointer-events-auto relative">
                <span className="absolute inset-0 rounded-full pointer-events-none" style={{ animation: 'ring-ping 1.8s cubic-bezier(0,0,0.2,1) infinite', background: 'rgba(255,255,255,0.32)' }} />
                <button
                  onClick={() => { if (isMobile) { openChatMobile() } else { setActiveNav('sobre'); openChat() } }}
                  className="relative rounded-full overflow-hidden transition-all hover:scale-105 active:scale-95"
                  style={{ width: 56, height: 56, border: '2.5px solid rgba(255,255,255,0.55)', boxShadow: '0 6px 24px rgba(0,0,80,0.45)', animation: 'avatar-pulse 2.4s ease-in-out infinite' }}
                >
                  <img src={agentPhoto} className="w-full h-full object-cover" alt="Assistente de RH" />
                </button>
              </div>
            </div>
          )}

          {/* ── Juntos Somos TIS — bottom-left (desktop only) ── */}
          <div className="absolute z-25 bottom-8 left-10 pointer-events-none hidden md:block" style={{ opacity: chatOpen || activeNav !== 'sobre' ? 0 : 0.82, transition: `opacity 0.38s ${ease}` }}>
            <img src={juntosLogo} alt="Juntos Somos TIS" style={{ width: 178, filter: 'brightness(0) invert(1)' }} />
          </div>

          {/* ── Content layer ── */}
          <div className="absolute inset-0 z-20 pb-16 md:pb-0" style={{ paddingTop: isMobile ? '60px' : '72px' }}>

            {/* ══ INÍCIO (home) ══ */}
            {activeNav === 'sobre' && (
            <div className="relative h-full flex items-center overflow-hidden">

              {/* ── Speech bubbles — 5 slots, right side, scattered (desktop only) ── */}
              {!isMobile && bubbles.map(b => {
                const slot = BUBBLE_SLOTS[b.slot]
                const show = b.visible && !chatOpen
                return (
                  <div key={b.key} className="absolute pointer-events-none"
                    style={{ top: slot.top, right: slot.right, transform: 'translateY(-50%)', opacity: show ? 1 : 0, transition: 'opacity 0.75s cubic-bezier(0.4,0,0.2,1)', zIndex: 29 }}
                  >
                    <div style={{ animation: show ? `bubble-float ${slot.dur} ${slot.delay} ease-in-out infinite` : 'none' }}>
                      <div className="relative">
                        <div className="font-medium text-white" style={{ borderRadius: 22, fontSize: 14, lineHeight: 1.5, maxWidth: 240, padding: '11px 18px', background: 'rgba(255,255,255,0.10)', border: '1px solid rgba(255,255,255,0.22)', backdropFilter: 'blur(18px)', WebkitBackdropFilter: 'blur(18px)', boxShadow: '0 6px 24px rgba(0,0,70,0.15)' }}>
                          {b.text}
                        </div>
                        {/* Left-side tail — points toward hero text */}
                        <div style={{ position: 'absolute', left: -12, top: '50%', transform: 'translateY(-50%)', width: 0, height: 0, borderTop: '9px solid transparent', borderBottom: '9px solid transparent', borderRight: '12px solid rgba(255,255,255,0.22)' }} />
                        <div style={{ position: 'absolute', left: -9,  top: '50%', transform: 'translateY(-50%)', width: 0, height: 0, borderTop: '7px solid transparent', borderBottom: '7px solid transparent', borderRight: '9px solid rgba(255,255,255,0.10)' }} />
                      </div>
                    </div>
                  </div>
                )
              })}

              {/* Hero text */}
              <div className="absolute inset-0 flex flex-col justify-center text-white"
                style={{ paddingLeft: isMobile ? '1.5rem' : 'clamp(2.5rem, 8vw, 7rem)', paddingRight: isMobile ? '1.5rem' : 'clamp(2rem, 10vw, 18rem)', opacity: chatOpen ? 0 : 1, transform: chatOpen ? 'translateX(-24px)' : 'translateX(0)', transition: `opacity 0.38s ${ease}, transform 0.38s ${ease}`, pointerEvents: chatOpen ? 'none' : 'auto' }}
              >
                <p className="mb-2 text-sm md:text-xl font-light text-white/80" style={{ letterSpacing: '0.18em' }}>Portal de</p>
                <h1 className="mb-4 md:mb-6 font-extrabold leading-none text-white" style={{ fontSize: isMobile ? 'clamp(2.2rem, 10vw, 3.2rem)' : 'clamp(3rem, 5.5vw, 5.2rem)', letterSpacing: '0.02em' }}>
                  PESSOAS{' '}<span className="font-light text-white/75">&amp;</span>{' '}CULTURA
                </h1>
                <p className="mb-1 text-base md:text-2xl font-light text-white/70" style={{ letterSpacing: '0.04em' }}>Informação. Respostas. Recursos.</p>
                <p className="mb-6 md:mb-10 text-base md:text-2xl font-bold" style={{ letterSpacing: '0.02em' }}>Tudo num só lugar.</p>
                <div className="relative inline-flex self-start md:self-start">
                  <span className="pointer-events-none absolute inset-0 rounded-full bg-white" style={{ animation: 'ring-ping 1.8s cubic-bezier(0,0,0.2,1) infinite' }} />
                  <button onClick={isMobile ? openChatMobile : openChat} className="relative inline-flex items-center gap-3 md:gap-4 rounded-full bg-white px-7 md:px-10 py-3 md:py-4 font-bold text-[#036ef2] hover:bg-white/95 active:scale-[0.98]" style={{ fontSize: isMobile ? '1rem' : '1.125rem', letterSpacing: '0.01em', animation: 'cta-glow 2s ease-in-out infinite', transition: 'transform 0.15s' }}>
                    <span style={{ animation: 'cta-text-pop 2.2s ease-in-out infinite', display: 'inline-block' }}>Falar com Agente</span>
                    <span className="font-black" style={{ fontSize: '1.55em', lineHeight: 1, display: 'inline-block', animation: 'arrow-jump 0.9s ease-in-out infinite' }}>→</span>
                  </button>
                </div>
              </div>

              {/* ── Chat panel (desktop only) ── */}
              {!isMobile && <div
                className="absolute inset-y-0 right-0 left-0 flex flex-col py-5 px-8"
                style={{ opacity: chatOpen ? 1 : 0, transform: chatOpen ? 'translateX(0)' : 'translateX(40px)', transition: `opacity 0.45s ${ease}, transform 0.45s ${ease}`, pointerEvents: chatOpen ? 'auto' : 'none' }}
              >
                <div className="flex-1 flex flex-col rounded-2xl overflow-hidden relative" style={chatGlass}>
                  {/* Header (desktop) */}
                  <div className="flex items-center justify-between px-5 py-3 shrink-0" style={{ borderBottom: '1px solid rgba(255,255,255,0.15)', background: 'rgba(255,255,255,0.08)' }}>
                    <p className="text-sm font-semibold text-white tracking-wide">Portal RH · TIS</p>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => setHistoryOpen(v => !v)}
                        title="Conversas anteriores"
                        className="h-7 w-7 rounded-full flex items-center justify-center transition-all"
                        style={historyOpen ? { background: 'rgba(255,255,255,0.22)', color: 'white' } : { color: 'rgba(255,255,255,0.55)' }}
                        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.15)'; (e.currentTarget as HTMLElement).style.color = 'white' }}
                        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = historyOpen ? 'rgba(255,255,255,0.22)' : 'transparent'; (e.currentTarget as HTMLElement).style.color = historyOpen ? 'white' : 'rgba(255,255,255,0.55)' }}
                      >
                        <IconHistory className="h-4 w-4" />
                      </button>
                      <button onClick={closeChat} className="h-7 w-7 rounded-full flex items-center justify-center text-white/55 hover:text-white hover:bg-white/15 transition-all text-lg leading-none">✕</button>
                    </div>
                  </div>

                  <div className="flex-1 flex min-h-0">

                    {/* ── Left sidebar: agent + topics (desktop only) ── */}
                    <div className="hidden md:flex w-64 shrink-0 flex-col" style={{ borderRight: '1px solid rgba(255,255,255,0.15)', background: 'rgba(255,255,255,0.07)' }}>
                      <div className="flex flex-col items-center pt-6 pb-5 px-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.10)' }}>
                        <div className="mb-3 rounded-full overflow-hidden" style={{ width: 88, height: 88, border: '2.5px solid rgba(255,255,255,0.45)', boxShadow: '0 6px 28px rgba(0,0,70,0.35)' }}>
                          <img src={agentPhoto} alt="Assistente de RH" className="h-full w-full object-cover" />
                        </div>
                        <p className="text-sm font-semibold text-white text-center leading-tight">Assistente de RH</p>
                        <p className="text-[11px] text-white/50 text-center mt-0.5">TIS · Cultura &amp; Pessoas</p>
                        <div className="flex items-center gap-1.5 mt-2.5">
                          <span className="h-2 w-2 rounded-full bg-emerald-400" style={{ boxShadow: '0 0 6px rgba(52,211,153,0.7)' }} />
                          <span className="text-xs text-white/60">Online</span>
                        </div>
                      </div>
                      <div className="flex-1 overflow-y-auto py-3 px-2">
                        <p className="px-2 pb-2 text-[10px] font-bold text-white/35 uppercase" style={{ letterSpacing: '0.14em' }}>Iniciar por tema</p>
                        {CHAT_TOPICS.map(topic => (
                          <button key={topic.id}
                            onClick={() => { setActiveTopic(topic.id); sendMessage(topic.question) }}
                            className="w-full flex items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-all"
                            style={activeTopic === topic.id ? { background: 'rgba(255,255,255,0.18)', color: 'white' } : { color: 'rgba(255,255,255,0.72)' }}
                            onMouseEnter={e => { if (activeTopic !== topic.id) (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.10)' }}
                            onMouseLeave={e => { if (activeTopic !== topic.id) (e.currentTarget as HTMLElement).style.background = 'transparent' }}
                          >
                            <topic.icon className="h-4 w-4 shrink-0" />
                            <span className="text-[15px] font-medium">{topic.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* ── Desktop: messages column + history ── */}
                    <div className="flex-1 flex flex-col min-h-0">

                    {/* ── Messages + input + history ── */}
                    <div className="flex-1 flex min-h-0">
                    {/* messages column */}
                    <div className="flex-1 flex flex-col min-h-0">
                      <div className="flex-1 overflow-y-auto p-4 space-y-3">
                        {messages.map(msg => (
                          <div key={msg.id} className={`flex items-end gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            {msg.role === 'agent' && (
                              <div className="h-9 w-9 rounded-full overflow-hidden shrink-0 mb-0.5" style={{ border: '1.5px solid rgba(255,255,255,0.35)', boxShadow: '0 2px 8px rgba(0,0,60,0.3)' }}>
                                <img src={agentPhoto} alt="" className="h-full w-full object-cover object-top" />
                              </div>
                            )}
                            <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed whitespace-pre-line ${msg.role === 'user' ? 'rounded-br-sm font-medium' : 'rounded-bl-sm text-white'}`}
                              style={msg.role === 'user' ? { background: 'rgba(255,255,255,0.92)', color: '#036ef2' } : { background: 'rgba(255,255,255,0.11)', border: '1px solid rgba(255,255,255,0.15)' }}
                            >
                              {msg.content}
                            </div>
                          </div>
                        ))}
                        {isTyping && (
                          <div className="flex items-end gap-2">
                            <div className="h-9 w-9 rounded-full overflow-hidden shrink-0" style={{ border: '1.5px solid rgba(255,255,255,0.35)', boxShadow: '0 2px 8px rgba(0,0,60,0.3)' }}>
                              <img src={agentPhoto} alt="" className="h-full w-full object-cover object-top" />
                            </div>
                            <div className="rounded-2xl rounded-bl-sm px-4 py-3" style={{ background: 'rgba(255,255,255,0.11)', border: '1px solid rgba(255,255,255,0.15)' }}>
                              <div className="flex gap-1 items-center">
                                {[0, 150, 300].map(d => <span key={d} className="h-2 w-2 rounded-full bg-white/65 animate-bounce" style={{ animationDelay: `${d}ms` }} />)}
                              </div>
                            </div>
                          </div>
                        )}
                        <div ref={messagesEnd} />
                      </div>
                      <div className="p-4 shrink-0" style={{ borderTop: '1px solid rgba(255,255,255,0.10)' }}>
                        <div className="flex items-center gap-3 rounded-full px-4 py-2.5" style={{ background: 'rgba(255,255,255,0.09)', border: '1px solid rgba(255,255,255,0.18)' }}>
                          <input value={inputText} onChange={e => setInputText(e.target.value)}
                            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage() } }}
                            placeholder="Escreve a tua pergunta…"
                            className="flex-1 bg-transparent text-white text-sm outline-none placeholder-white/40"
                          />
                          <button onClick={() => sendMessage()} disabled={!inputText.trim() || isTyping}
                            className="h-8 w-8 rounded-full bg-white flex items-center justify-center text-[#036ef2] disabled:opacity-35 hover:scale-105 active:scale-95"
                            style={{ transition: 'opacity 0.2s, transform 0.15s' }}
                          >
                            <SendIcon className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* ── History panel — slides in from the right (desktop only) ── */}
                    <div className="hidden md:flex flex-col shrink-0 overflow-hidden" style={{ width: historyOpen ? 220 : 0, transition: 'width 0.3s cubic-bezier(0.4,0,0.2,1)', borderLeft: historyOpen ? '1px solid rgba(255,255,255,0.12)' : 'none', background: 'rgba(0,0,0,0.20)' }}>
                      <div className="shrink-0 flex items-center justify-between px-3 py-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.10)' }}>
                        <p className="text-[11px] font-bold text-white/40 uppercase" style={{ letterSpacing: '0.14em' }}>Conversas</p>
                        <button
                          onClick={() => setHistoryOpen(false)}
                          title="Fechar histórico"
                          className="h-6 w-6 rounded-full flex items-center justify-center text-white/50 hover:text-white hover:bg-white/15 transition-all"
                        >
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5"><polyline points="9 18 15 12 9 6"/></svg>
                        </button>
                      </div>
                      <div className="flex-1 overflow-y-auto py-1">
                        {chatHistory.map(session => (
                          <button key={session.id}
                            onClick={() => { setMessages(session.messages.map((m, i) => ({ ...m, id: i }))); setHistoryOpen(false); setActiveTopic(null) }}
                            className="w-full text-left px-3 py-2.5 transition-all"
                            style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}
                            onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.07)'}
                            onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}
                          >
                            <div className="flex items-start justify-between gap-1 mb-0.5">
                              <p className="text-xs font-semibold text-white/80 leading-snug truncate">{session.title}</p>
                              <span className="text-[10px] text-white/30 shrink-0 mt-px">{session.date}</span>
                            </div>
                            <p className="text-[11px] text-white/40 leading-snug line-clamp-2">{session.preview}</p>
                          </button>
                        ))}
                      </div>
                    </div>

                    </div>{/* end messages+history row */}
                    </div>{/* end mobile main column */}
                  </div>{/* end flex-1 flex min-h-0 */}
                </div>{/* end chatGlass */}
              </div>}{/* end chat panel (desktop only) */}

            </div>
            )} {/* end início */}

            {/* ══ CHAT (mobile page) ══ */}
            {isMobile && activeNav === 'chat' && (
              <div className="h-full flex flex-col px-3 pt-1">
                <div className="flex-1 flex flex-col min-h-0 rounded-2xl overflow-hidden relative" style={chatGlass}>

                  {/* Header */}
                  <div className="flex items-center justify-between px-4 py-3 shrink-0" style={{ borderBottom: '1px solid rgba(255,255,255,0.15)', background: 'rgba(255,255,255,0.08)' }}>
                    <div className="flex items-center gap-2.5">
                      <div className="rounded-full overflow-hidden shrink-0" style={{ width: 34, height: 34, border: '1.5px solid rgba(255,255,255,0.4)', boxShadow: '0 2px 10px rgba(0,0,70,0.35)' }}>
                        <img src={agentPhoto} alt="" className="h-full w-full object-cover object-top" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-white leading-tight">Assistente de RH</p>
                        <div className="flex items-center gap-1">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" style={{ boxShadow: '0 0 4px rgba(52,211,153,0.7)' }} />
                          <span className="text-[10px] text-white/55">Online</span>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => setHistoryOpen(v => !v)}
                      title="Conversas anteriores"
                      className="h-7 w-7 rounded-full flex items-center justify-center transition-all"
                      style={historyOpen ? { background: 'rgba(255,255,255,0.22)', color: 'white' } : { color: 'rgba(255,255,255,0.55)' }}
                    >
                      <IconHistory className="h-4 w-4" />
                    </button>
                  </div>

                  {/* History overlay — only when open */}
                  {historyOpen && (
                    <div className="absolute inset-0 z-10 flex flex-col" style={{ background: 'rgba(100,0,180,0.95)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)' }}>
                      <div className="flex items-center justify-between px-4 py-3 shrink-0" style={{ borderBottom: '1px solid rgba(255,255,255,0.12)' }}>
                        <p className="text-sm font-bold text-white/70 uppercase" style={{ letterSpacing: '0.12em' }}>Conversas anteriores</p>
                        <button onClick={() => setHistoryOpen(false)} className="h-7 w-7 rounded-full flex items-center justify-center text-white/55 hover:text-white hover:bg-white/15 transition-all text-lg leading-none">✕</button>
                      </div>
                      <div className="flex-1 overflow-y-auto py-2">
                        {chatHistory.length === 0 ? (
                          <p className="text-center text-white/35 text-sm mt-10">Sem conversas anteriores.</p>
                        ) : chatHistory.map(session => (
                          <button key={session.id}
                            onClick={() => { setMessages(session.messages.map((m, i) => ({ ...m, id: i }))); setHistoryOpen(false); setActiveTopic(null) }}
                            className="w-full text-left px-4 py-3 transition-all"
                            style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}
                            onTouchStart={e => (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.07)'}
                            onTouchEnd={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}
                          >
                            <div className="flex items-start justify-between gap-2 mb-0.5">
                              <p className="text-sm font-semibold text-white/85 leading-snug">{session.title}</p>
                              <span className="text-[10px] text-white/35 shrink-0 mt-0.5">{session.date}</span>
                            </div>
                            <p className="text-xs text-white/45 leading-snug line-clamp-2">{session.preview}</p>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Topics strip — horizontal scroll */}
                  <div className="shrink-0 overflow-x-auto flex gap-2 px-3 py-2.5" style={{ borderBottom: '1px solid rgba(255,255,255,0.12)', background: 'rgba(255,255,255,0.05)', scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch' } as React.CSSProperties}>
                    {CHAT_TOPICS.map(topic => (
                      <button key={topic.id}
                        onClick={() => { setActiveTopic(topic.id); sendMessage(topic.question) }}
                        className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium whitespace-nowrap shrink-0 transition-all"
                        style={activeTopic === topic.id ? { background: 'rgba(255,255,255,0.22)', color: 'white' } : { background: 'rgba(255,255,255,0.09)', color: 'rgba(255,255,255,0.72)', border: '1px solid rgba(255,255,255,0.15)' }}
                      >
                        <topic.icon className="h-3.5 w-3.5 shrink-0" />
                        {topic.label}
                      </button>
                    ))}
                  </div>

                  {/* Messages */}
                  <div className="flex-1 overflow-y-auto p-3 space-y-3 min-h-0">
                    {messages.map(msg => (
                      <div key={msg.id} className={`flex items-end gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        {msg.role === 'agent' && (
                          <div className="h-9 w-9 rounded-full overflow-hidden shrink-0 mb-0.5" style={{ border: '1.5px solid rgba(255,255,255,0.35)', boxShadow: '0 2px 8px rgba(0,0,60,0.3)' }}>
                            <img src={agentPhoto} alt="" className="h-full w-full object-cover object-top" />
                          </div>
                        )}
                        <div className={`max-w-[78%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed whitespace-pre-line ${msg.role === 'user' ? 'rounded-br-sm font-medium' : 'rounded-bl-sm text-white'}`}
                          style={msg.role === 'user' ? { background: 'rgba(255,255,255,0.92)', color: '#036ef2' } : { background: 'rgba(255,255,255,0.11)', border: '1px solid rgba(255,255,255,0.15)' }}
                        >
                          {msg.content}
                        </div>
                      </div>
                    ))}
                    {isTyping && (
                      <div className="flex items-end gap-2">
                        <div className="h-9 w-9 rounded-full overflow-hidden shrink-0" style={{ border: '1.5px solid rgba(255,255,255,0.35)' }}>
                          <img src={agentPhoto} alt="" className="h-full w-full object-cover object-top" />
                        </div>
                        <div className="rounded-2xl rounded-bl-sm px-4 py-3" style={{ background: 'rgba(255,255,255,0.11)', border: '1px solid rgba(255,255,255,0.15)' }}>
                          <div className="flex gap-1 items-center">
                            {[0, 150, 300].map(d => <span key={d} className="h-2 w-2 rounded-full bg-white/65 animate-bounce" style={{ animationDelay: `${d}ms` }} />)}
                          </div>
                        </div>
                      </div>
                    )}
                    <div ref={messagesEnd} />
                  </div>

                  {/* Input */}
                  <div className="p-3 shrink-0" style={{ borderTop: '1px solid rgba(255,255,255,0.10)' }}>
                    <div className="flex items-center gap-3 rounded-full px-4 py-2.5" style={{ background: 'rgba(255,255,255,0.09)', border: '1px solid rgba(255,255,255,0.18)' }}>
                      <input value={inputText} onChange={e => setInputText(e.target.value)}
                        onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage() } }}
                        placeholder="Escreve a tua pergunta…"
                        className="flex-1 bg-transparent text-white outline-none placeholder-white/40"
                        style={{ fontSize: '16px' }}
                      />
                      <button onClick={() => sendMessage()} disabled={!inputText.trim() || isTyping}
                        className="h-8 w-8 rounded-full bg-white flex items-center justify-center text-[#036ef2] disabled:opacity-35 hover:scale-105 active:scale-95"
                        style={{ transition: 'opacity 0.2s, transform 0.15s' }}
                      >
                        <SendIcon className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>

                </div>
              </div>
            )}

            {/* ══ FAQs ══ */}
            {activeNav === 'faqs' && (
              <div className="relative h-full overflow-y-auto">
                <div className="relative z-10 max-w-6xl mx-auto px-4 md:px-12 py-6 md:py-10">

                  {/* ── Header: title + agent avatar with speech bubble ── */}
                  <div className="flex items-start justify-between gap-8 mb-6 md:mb-8">
                    <div>
                      <p className="text-xs font-bold text-white/40 uppercase mb-2" style={{ letterSpacing: '0.16em' }}>Portal</p>
                      <div className="flex items-center gap-3">
                        <h2 className="text-4xl font-extrabold text-white">Perguntas Frequentes</h2>
                        {/* Agent photo — mobile only, after title */}
                        {isMobile && (
                          <div className="shrink-0 rounded-full overflow-hidden" style={{ width: 71, height: 71, border: '2px solid rgba(255,255,255,0.4)', boxShadow: '0 4px 16px rgba(0,0,70,0.35)' }}>
                            <img src={agentPhoto} alt="Assistente de RH" className="h-full w-full object-cover object-top" />
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Agent + bubble (desktop only) */}
                    <div className="hidden md:flex items-start gap-4 shrink-0">
                      {/* Speech bubble — tail points right toward avatar */}
                      <div className="relative">
                        <div className="font-medium text-white" style={{ borderRadius: 20, fontSize: 15, lineHeight: 1.55, width: 400, paddingTop: '16px', paddingBottom: '16px', paddingLeft: 21, paddingRight: '24px', background: 'rgba(255,255,255,0.10)', border: '1px solid rgba(255,255,255,0.22)', backdropFilter: 'blur(18px)', WebkitBackdropFilter: 'blur(18px)', boxShadow: '0 6px 24px rgba(0,0,70,0.15)' }}>
                          <p className="text-white/85">Consulta aqui as perguntas&nbsp;&nbsp;mais frequentes.</p>
                          <div style={{ height: 12 }} />
                          <p className="text-white/65">Ainda tens dúvidas? Fala comigo no chat!</p>
                        </div>
                        {/* Right-pointing tail toward avatar */}
                        <div style={{ position: 'absolute', right: -12, top: 22, width: 0, height: 0, borderTop: '9px solid transparent', borderBottom: '9px solid transparent', borderLeft: '12px solid rgba(255,255,255,0.22)' }} />
                        <div style={{ position: 'absolute', right: -9,  top: 24, width: 0, height: 0, borderTop: '7px solid transparent', borderBottom: '7px solid transparent', borderLeft: '9px solid rgba(255,255,255,0.10)' }} />
                      </div>

                      {/* Avatar */}
                      <div className="shrink-0 flex flex-col items-center gap-1.5">
                        <div className="rounded-full overflow-hidden" style={{ width: 96, height: 96, border: '2.5px solid rgba(255,255,255,0.45)', boxShadow: '0 6px 28px rgba(0,0,70,0.35)' }}>
                          <img src={agentPhoto} alt="Assistente de RH" className="h-full w-full object-cover" />
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" style={{ boxShadow: '0 0 5px rgba(52,211,153,0.7)' }} />
                          <span className="text-[11px] text-white/55">Online</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* ── FAQ accordion ── */}
                  {(() => {
                    const half = Math.ceil(FAQS_DATA.length / 2)
                    const col0 = FAQS_DATA.slice(0, half)
                    const col1 = FAQS_DATA.slice(half)
                    const renderFaq = (faq: typeof FAQS_DATA[0], i: number) => (
                      <div key={i}
                        className="rounded-2xl overflow-hidden cursor-pointer transition-colors"
                        style={{ background: expandedFaq === i ? 'rgba(255,255,255,0.16)' : 'rgba(255,255,255,0.09)', border: '1px solid rgba(255,255,255,0.18)' }}
                        onClick={() => setExpandedFaq(expandedFaq === i ? null : i)}
                      >
                        <div className="flex items-center justify-between px-6 gap-4" style={{ paddingTop: '1.1rem', paddingBottom: '1.1rem' }}>
                          <p className="font-semibold text-white text-base leading-snug">{faq.q}</p>
                          <span className="text-white/50 text-2xl shrink-0 leading-none select-none">{expandedFaq === i ? '−' : '+'}</span>
                        </div>
                        {expandedFaq === i && (
                          <div className="px-6 pb-5 text-sm leading-relaxed text-white/75" style={{ borderTop: '1px solid rgba(255,255,255,0.12)' }}>
                            <div className="pt-4">{faq.a}</div>
                          </div>
                        )}
                      </div>
                    )
                    return (
                      <div className="flex flex-col md:flex-row gap-4 md:gap-6">
                        <div className="flex-1 flex flex-col gap-3 md:gap-4">{col0.map((f, i) => renderFaq(f, i))}</div>
                        <div className="flex-1 flex flex-col gap-3 md:gap-4">{col1.map((f, i) => renderFaq(f, i + half))}</div>
                      </div>
                    )
                  })()}

                  {/* ── Bottom CTA ── */}
                  <div className="flex justify-center mt-8 md:mt-12 mb-4">
                    <div className="relative inline-flex">
                      <span className="pointer-events-none absolute inset-0 rounded-full bg-white" style={{ animation: 'ring-ping 1.8s cubic-bezier(0,0,0.2,1) infinite' }} />
                      <button onClick={() => { setActiveNav('sobre'); openChat() }} className="relative inline-flex items-center gap-4 rounded-full bg-white px-10 py-4 font-bold text-[#036ef2] hover:bg-white/95 active:scale-[0.98]" style={{ fontSize: '1.125rem', letterSpacing: '0.01em', animation: 'cta-glow 2s ease-in-out infinite', transition: 'transform 0.15s' }}>
                        <span style={{ animation: 'cta-text-pop 2.2s ease-in-out infinite', display: 'inline-block' }}>Falar com Agente RH</span>
                        <span className="font-black" style={{ fontSize: '1.55em', lineHeight: 1, display: 'inline-block', animation: 'arrow-jump 0.9s ease-in-out infinite' }}>→</span>
                      </button>
                    </div>
                  </div>

                </div>
              </div>
            )}

            {/* ══ Notícias ══ */}
            {activeNav === 'noticias' && (() => {
              const CATS = ['Todas', 'Felicidade', 'Cultura', 'Carreiras', 'Políticas', 'Benefícios', 'Eventos']

              if (isMobile) {
                const carouselNews = NEWS_DATA.slice(0, 6)
                const olderNews = [...NEWS_DATA.slice(6), ...NEWS_ARCHIVE]
                const filteredOlder = newsCategory ? olderNews.filter(n => n.category === newsCategory) : olderNews
                return (
                  <div className="h-full relative overflow-hidden">
                    {/* scrollable feed */}
                    <div className="h-full overflow-y-auto" style={{ scrollbarWidth: 'none', opacity: selectedNews ? 0 : 1, pointerEvents: selectedNews ? 'none' : 'auto', transition: 'opacity 220ms' } as React.CSSProperties}>
                      {/* header */}
                      <div className="px-4 pt-4 pb-2">
                        <p className="text-xs font-bold text-white/40 uppercase mb-1" style={{ letterSpacing: '0.16em' }}>Portal</p>
                        <h2 className="text-2xl font-extrabold text-white">Notícias</h2>
                      </div>

                      {/* carousel — top 6 */}
                      <div className="flex overflow-x-auto gap-3 pl-4 pb-4 pt-2" style={{ scrollSnapType: 'x mandatory', scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch' } as React.CSSProperties}>
                        {carouselNews.map(news => (
                          <div key={news.id}
                            onClick={() => setSelectedNews(news)}
                            className="shrink-0 relative rounded-2xl overflow-hidden cursor-pointer"
                            style={{ width: 'calc(100vw - 80px)', height: 200, scrollSnapAlign: 'start', boxShadow: '0 4px 24px rgba(0,0,50,0.35)', border: '1px solid rgba(255,255,255,0.12)' }}
                          >
                            <div className="absolute inset-0" style={{ backgroundImage: `url(${news.image})`, backgroundSize: 'cover', backgroundPosition: 'center' }} />
                            <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.88) 0%, rgba(0,0,0,0.12) 55%, transparent 100%)' }} />
                            <div className="absolute bottom-0 left-0 right-0 p-4">
                              <span className="text-[10px] font-bold uppercase text-white/85 px-2.5 py-0.5 rounded-full inline-block mb-1.5" style={{ background: 'rgba(255,255,255,0.20)', border: '1px solid rgba(255,255,255,0.28)' }}>{news.category}</span>
                              <h3 className="font-bold text-white leading-snug text-sm line-clamp-2">{news.title}</h3>
                              <p className="text-[10px] text-white/50 mt-1">{news.date}</p>
                            </div>
                          </div>
                        ))}
                        <div className="shrink-0" style={{ width: 16 }} />
                      </div>

                      {/* category pills */}
                      <div className="flex gap-2 overflow-x-auto pl-4 pr-4 pb-3" style={{ scrollbarWidth: 'none' } as React.CSSProperties}>
                        {CATS.map(cat => (
                          <button key={cat}
                            onClick={() => { setNewsCategory(cat === 'Todas' ? '' : cat); setNewsPage(0) }}
                            className="shrink-0 rounded-full px-4 py-1.5 text-xs font-semibold transition-all"
                            style={(newsCategory === cat || (cat === 'Todas' && !newsCategory))
                              ? { background: 'rgba(255,255,255,0.22)', color: 'white', border: '1px solid rgba(255,255,255,0.35)' }
                              : { background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.58)', border: '1px solid rgba(255,255,255,0.15)' }}
                          >{cat}</button>
                        ))}
                      </div>

                      {/* older news list */}
                      <div className="px-4 pb-6">
                        <p className="text-[11px] font-bold text-white/40 uppercase mb-3" style={{ letterSpacing: '0.14em' }}>Ver mais</p>
                        {filteredOlder.length === 0 ? (
                          <p className="text-sm text-white/35 text-center py-6">Sem notícias nesta categoria.</p>
                        ) : filteredOlder.map(news => (
                          <div key={news.id}
                            className="flex items-start gap-3 py-3 cursor-pointer"
                            style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}
                            onClick={() => setSelectedNews(news)}
                          >
                            <div className="shrink-0 rounded-xl overflow-hidden" style={{ width: 82, height: 82 }}>
                              <div style={{ width: '100%', height: '100%', backgroundImage: `url(${news.image})`, backgroundSize: 'cover', backgroundPosition: 'center' }} />
                            </div>
                            <div className="flex-1 min-w-0 pt-0.5">
                              <p className="text-[10px] font-bold uppercase text-white/50 mb-0.5" style={{ letterSpacing: '0.08em' }}>{news.category}</p>
                              <h3 className="text-sm font-semibold text-white leading-snug line-clamp-2">{news.title}</h3>
                              <p className="text-[10px] text-white/40 mt-1">{news.date}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* article overlay */}
                    <div
                      className="absolute inset-0 flex flex-col overflow-hidden"
                      style={{ opacity: selectedNews ? 1 : 0, pointerEvents: selectedNews ? 'auto' : 'none', transition: 'opacity 260ms cubic-bezier(0.4,0,0.2,1)', backgroundImage: `url(${newsDetailBg})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
                    >
                      {selectedNews && (
                        <>
                          <div className="relative shrink-0" style={{ height: 160 }}>
                            <div className="absolute inset-0" style={{ backgroundImage: `url(${selectedNews.image})`, backgroundSize: 'cover', backgroundPosition: 'center' }} />
                            <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.6) 0%, transparent 60%)' }} />
                            <div className="absolute bottom-4 left-4">
                              <span className="text-[11px] font-bold uppercase text-white px-3 py-1.5 rounded-full" style={{ background: 'rgba(255,255,255,0.16)', letterSpacing: '0.10em', border: '1px solid rgba(255,255,255,0.22)' }}>{selectedNews.category}</span>
                            </div>
                            <button
                              onClick={() => setSelectedNews(null)}
                              className="absolute top-3 right-3 flex items-center justify-center rounded-full text-white/80"
                              style={{ width: 30, height: 30, background: 'rgba(0,0,0,0.40)', border: '1px solid rgba(255,255,255,0.25)', fontSize: 13 }}
                            >✕</button>
                          </div>
                          <div className="flex-1 overflow-y-auto px-5 py-4" style={{ scrollbarWidth: 'none' } as React.CSSProperties}>
                            <h2 className="font-extrabold text-white leading-snug mb-4" style={{ fontSize: '1.1rem' }}>{selectedNews.title}</h2>
                            <p className="text-sm text-white/65 leading-relaxed mb-4 italic" style={{ borderLeft: '2px solid rgba(255,255,255,0.25)', paddingLeft: '1rem' }}>{selectedNews.excerpt}</p>
                            <div style={{ height: 1, background: 'rgba(255,255,255,0.10)', marginBottom: '1rem' }} />
                            {selectedNews.body?.split('\n\n').map((para, i) => (
                              <p key={i} className="text-sm text-white/60 leading-relaxed mb-3">{para}</p>
                            ))}
                            {!selectedNews.body && <p className="text-sm text-white/40 text-center py-4">Sem conteúdo disponível.</p>}
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                )
              }

              // ── Desktop ──
              const allVisible = newsCategory ? NEWS_DATA.filter(n => n.category === newsCategory) : NEWS_DATA
              const totalPages = Math.ceil(allVisible.length / 5)
              const pageItems = allVisible.slice(newsPage * 5, newsPage * 5 + 5)
              const featured = pageItems[0]
              const rest = pageItems.slice(1, 5)
              const pillBtn = (news: NewsItem) => (
                <button
                  onClick={e => { e.stopPropagation(); setSelectedNews(news) }}
                  className="inline-flex items-center justify-center rounded-full text-white transition-all hover:bg-white/30 active:scale-95"
                  style={{ background: 'rgba(255,255,255,0.18)', border: '1px solid rgba(255,255,255,0.30)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)', width: 32, height: 32, fontSize: 15 }}
                >→</button>
              )
              return (
                <div className="h-full flex flex-col px-14 py-6 gap-4">
                  {/* Header row */}
                  <div className="flex items-end justify-between shrink-0 flex-wrap gap-3">
                    <div>
                      <p className="text-xs font-bold text-white/40 uppercase mb-1" style={{ letterSpacing: '0.16em' }}>Portal</p>
                      <h2 className="text-4xl font-extrabold text-white">Notícias</h2>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap justify-end">
                      {CATS.map(cat => (
                        <button key={cat}
                          onClick={() => { setNewsCategory(cat === 'Todas' ? '' : cat); setNewsPage(0); setSelectedNews(null) }}
                          className="rounded-full px-4 py-1.5 text-xs font-semibold transition-all"
                          style={(newsCategory === cat || (cat === 'Todas' && !newsCategory))
                            ? { background: 'rgba(255,255,255,0.22)', color: 'white' }
                            : { background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.58)', border: '1px solid rgba(255,255,255,0.15)' }}
                        >{cat}</button>
                      ))}
                    </div>
                  </div>

                  {/* Glassmorphism container */}
                  <div className="flex-1 min-h-0 rounded-3xl p-4 relative overflow-hidden" style={{ background: 'rgba(255,255,255,0.08)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.18)', boxShadow: '0 8px 40px rgba(0,0,50,0.25)' }}>

                    {/* News grid */}
                    <div className="h-full transition-opacity" style={{ opacity: selectedNews ? 0 : 1, pointerEvents: selectedNews ? 'none' : 'auto', transitionDuration: '220ms' }}>
                      {!featured ? (
                        <div className="flex items-center justify-center h-full text-white/35 text-sm">Sem notícias nesta categoria.</div>
                      ) : (
                        <div className="h-full" style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr', gridTemplateRows: '1fr 1fr', gap: 10 }}>

                          {/* Featured — spans 2 rows */}
                          <div className="relative rounded-2xl overflow-hidden cursor-pointer" style={{ gridRow: '1 / 3' }} onClick={() => setSelectedNews(featured)}>
                            <div className="absolute inset-0" style={{ backgroundImage: `url(${featured.image})`, backgroundSize: 'cover', backgroundPosition: 'center' }} />
                            <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.88) 0%, rgba(0,0,0,0.20) 55%, transparent 100%)' }} />
                            <div className="absolute top-4 left-4">{pillBtn(featured)}</div>
                            <div className="absolute bottom-0 left-0 right-0 p-6">
                              <p className="text-[11px] font-bold uppercase text-white/60 mb-2" style={{ letterSpacing: '0.12em' }}>{featured.category} · {featured.date}</p>
                              <h3 className="font-extrabold text-white leading-snug mb-2" style={{ fontSize: 'clamp(1.1rem,1.8vw,1.5rem)' }}>{featured.title}</h3>
                              <p className="text-sm text-white/60 leading-relaxed">{featured.excerpt}</p>
                            </div>
                          </div>

                          {/* 4 smaller cards */}
                          {Array.from({ length: 4 }).map((_, i) => {
                            const news = rest[i]
                            if (!news) return <div key={`ph-${i}`} className="rounded-2xl" style={{ background: 'rgba(255,255,255,0.04)' }} />
                            return (
                              <div key={news.id} className="relative rounded-2xl overflow-hidden cursor-pointer" onClick={() => setSelectedNews(news)}>
                                <div className="absolute inset-0" style={{ backgroundImage: `url(${news.image})`, backgroundSize: 'cover', backgroundPosition: 'center' }} />
                                <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.82) 0%, rgba(0,0,0,0.08) 55%, transparent 100%)' }} />
                                <div className="absolute top-3 left-3">{pillBtn(news)}</div>
                                <div className="absolute bottom-0 left-0 right-0 p-3.5">
                                  <p className="text-[10px] font-bold uppercase text-white/55 mb-1" style={{ letterSpacing: '0.10em' }}>{news.category}</p>
                                  <h3 className="font-bold text-white leading-snug" style={{ fontSize: '0.88rem' }}>{news.title}</h3>
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      )}
                    </div>

                    {/* Article expanded view */}
                    <div
                      className="absolute inset-0 rounded-3xl flex flex-row overflow-hidden"
                      style={{ opacity: selectedNews ? 1 : 0, pointerEvents: selectedNews ? 'auto' : 'none', transition: 'opacity 260ms cubic-bezier(0.4,0,0.2,1)', backgroundImage: `url(${newsDetailBg})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
                    >
                      {selectedNews && (
                        <>
                          <div className="relative shrink-0" style={{ width: '42%' }}>
                            <div className="absolute inset-0" style={{ backgroundImage: `url(${selectedNews.image})`, backgroundSize: 'cover', backgroundPosition: 'center' }} />
                            <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.6) 0%, transparent 60%)' }} />
                            <div className="absolute bottom-4 left-4">
                              <span className="text-[11px] font-bold uppercase text-white px-3 py-1.5 rounded-full" style={{ background: 'rgba(255,255,255,0.16)', letterSpacing: '0.10em', border: '1px solid rgba(255,255,255,0.22)' }}>{selectedNews.category}</span>
                            </div>
                          </div>
                          <div className="flex-1 flex flex-col overflow-hidden">
                            <div className="flex items-center justify-between px-8 pt-6 pb-4 shrink-0">
                              <p className="text-xs text-white/35 font-medium">{selectedNews.date}</p>
                              <button
                                onClick={() => setSelectedNews(null)}
                                className="flex items-center justify-center rounded-full text-white/55 hover:text-white transition-all"
                                style={{ width: 30, height: 30, background: 'rgba(255,255,255,0.10)', border: '1px solid rgba(255,255,255,0.18)', fontSize: 13 }}
                              >✕</button>
                            </div>
                            <div className="flex-1 overflow-y-auto px-8 pb-8" style={{ scrollbarWidth: 'none' } as React.CSSProperties}>
                              <h2 className="font-extrabold text-white leading-snug mb-4" style={{ fontSize: 'clamp(1.15rem,1.6vw,1.55rem)' }}>{selectedNews.title}</h2>
                              <p className="text-sm text-white/65 leading-relaxed mb-4 italic" style={{ borderLeft: '2px solid rgba(255,255,255,0.25)', paddingLeft: '1rem' }}>{selectedNews.excerpt}</p>
                              <div style={{ height: 1, background: 'rgba(255,255,255,0.10)', marginBottom: '1rem' }} />
                              {selectedNews.body?.split('\n\n').map((para, i) => (
                                <p key={i} className="text-sm text-white/60 leading-relaxed mb-3">{para}</p>
                              ))}
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Pagination dots */}
                  {totalPages > 1 && (
                    <div className="flex items-center justify-center gap-2.5 shrink-0 pb-1">
                      {Array.from({ length: totalPages }).map((_, p) => (
                        <button
                          key={p}
                          onClick={() => { setNewsPage(p); setSelectedNews(null) }}
                          className="rounded-full transition-all"
                          style={{ width: newsPage === p ? 22 : 8, height: 8, background: newsPage === p ? 'rgba(255,255,255,0.85)' : 'rgba(255,255,255,0.28)', border: '1px solid rgba(255,255,255,0.20)' }}
                        />
                      ))}
                    </div>
                  )}
                </div>
              )
            })()}

            {/* ══ Eventos / Calendário ══ */}
            {activeNav === 'eventos' && (() => {
              const y = calDate.getFullYear()
              const m = calDate.getMonth()
              const days = getMonthDays(y, m)
              const upcomingEvents = [...EVENTS_DATA].sort((a, b) => a.date.localeCompare(b.date))
              const listEvents = selectedDay ? eventsForDay(y, m, selectedDay) : upcomingEvents
              const EVT_IMGS: Record<string, string> = {
                meeting:  'https://images.unsplash.com/photo-1758691736433-4078b93abd72?w=800&q=80',
                training: 'https://images.unsplash.com/photo-1646369505413-216676fef89c?w=800&q=80',
                social:   'https://images.unsplash.com/photo-1527529482837-4698179dc6ce?w=800&q=80',
                wellness: 'https://images.unsplash.com/photo-1600618528240-fb9fc964b853?w=800&q=80',
                hr:       'https://images.unsplash.com/photo-1686771416282-3888ddaf249b?w=800&q=80',
              }
              return (
                <div className="relative h-full overflow-hidden">
                  <div className="relative z-10 h-full px-4 md:px-14 py-4 md:py-8 flex flex-col gap-3 md:gap-5">

                    {/* Page header */}
                    <div className="flex items-center justify-between shrink-0">
                      <div>
                        <p className="text-xs font-bold text-white/40 uppercase mb-1" style={{ letterSpacing: '0.16em' }}>Portal</p>
                        <h2 className="text-2xl md:text-4xl font-extrabold text-white">Eventos</h2>
                      </div>
                      <div className="flex items-center gap-2">
                        {/* Month nav — always visible */}
                        <div className="flex items-center gap-2 md:gap-3" style={{ background: 'rgba(255,255,255,0.10)', borderRadius: 14, padding: isMobile ? '5px 10px' : '6px 14px', border: '1px solid rgba(255,255,255,0.18)' }}>
                          <button onClick={() => { setCalDate(new Date(y, m - 1, 1)); setSelectedDay(null); setSelectedEvent(null) }} className="text-white/60 hover:text-white text-lg px-1 transition-colors">‹</button>
                          <span className="text-white font-semibold text-xs md:text-sm" style={{ minWidth: isMobile ? 80 : 140, textAlign: 'center' }}>{PT_MONTHS[m].slice(0,3)} {y}</span>
                          <button onClick={() => { setCalDate(new Date(y, m + 1, 1)); setSelectedDay(null); setSelectedEvent(null) }} className="text-white/60 hover:text-white text-lg px-1 transition-colors">›</button>
                        </div>
                      </div>
                    </div>

                    {/* Body — mobile: scrollable calendar+list | desktop: 3-column */}
                    {isMobile ? (
                      <div className="flex-1 min-h-0 relative overflow-hidden">

                        {/* Scrollable content */}
                        <div className="h-full overflow-y-auto" style={{ scrollbarWidth: 'none' } as React.CSSProperties}>

                          {/* ── Calendar — no boxes ── */}
                          <div className="mb-2">
                            <div className="grid grid-cols-7 mb-1">
                              {PT_DAYS.map(d => (
                                <div key={d} className="text-center text-xs font-bold text-white/40 uppercase py-1" style={{ letterSpacing: '0.06em' }}>{d}</div>
                              ))}
                            </div>
                            <div className="grid grid-cols-7">
                              {days.map((day, idx) => {
                                if (day === null) return <div key={`p${idx}`} />
                                const dayEvts = eventsForDay(y, m, day)
                                const isToday = y === 2026 && m === 8 && day === 1
                                const isSel = selectedDay === day
                                return (
                                  <div key={day}
                                    onClick={() => {
                                      if (dayEvts.length === 0) return
                                      if (dayEvts.length === 1) {
                                        // 1 evento: abre popup sem filtrar lista (mantém todos os eventos visíveis)
                                        setSelectedDay(null)
                                        setSelectedEvent(dayEvts[0])
                                      } else {
                                        // 2+ eventos: selecciona dia e mostra lista filtrada
                                        if (isSel) { setSelectedDay(null); setSelectedEvent(null) }
                                        else { setSelectedDay(day); setSelectedEvent(null) }
                                      }
                                    }}
                                    className={`flex flex-col items-center py-1.5 ${dayEvts.length > 0 ? 'cursor-pointer' : 'cursor-default'}`}
                                  >
                                    <div className="w-9 h-9 flex items-center justify-center rounded-full text-base font-semibold transition-all"
                                      style={{ background: isSel ? 'rgba(255,255,255,0.9)' : isToday ? 'rgba(255,255,255,0.18)' : 'transparent', color: isSel ? '#8200c8' : 'white', border: (isToday && !isSel) ? '1.5px solid rgba(255,255,255,0.55)' : 'none' }}
                                    >{day}</div>
                                    {dayEvts.length > 0 && (
                                      <div className="flex gap-1 mt-1">
                                        {dayEvts.slice(0, 3).map((ev, ei) => (
                                          <div key={ei} className="rounded-full" style={{ width: 6, height: 6, background: ev.color || 'rgba(255,255,255,0.75)' }} />
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                )
                              })}
                            </div>
                          </div>

                          {/* ── Events list below calendar ── */}
                          <div className="pt-3" style={{ borderTop: '1px solid rgba(255,255,255,0.12)' }}>
                            <p className="text-[11px] font-bold text-white/40 uppercase mb-3" style={{ letterSpacing: '0.12em' }}>
                              {selectedDay ? `Eventos · ${selectedDay} de ${PT_MONTHS[m]}` : 'Próximos Eventos'}
                            </p>
                            {selectedDay && (
                              <button
                                onClick={() => { setSelectedDay(null); setSelectedEvent(null) }}
                                className="flex items-center gap-2 rounded-full mb-3 text-sm font-semibold text-white transition-all"
                                style={{ background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.35)', padding: '6px 16px' }}
                              >← Todos os eventos</button>
                            )}
                            {listEvents.length === 0 ? (
                              <p className="text-sm text-white/35 text-center py-6">Sem eventos neste dia</p>
                            ) : listEvents.map((ev, i) => (
                              <div key={i}
                                className="flex items-start gap-3 py-3 cursor-pointer"
                                style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}
                                onClick={() => setSelectedEvent(ev)}
                              >
                                <div className="shrink-0 rounded-full" style={{ width: 3, alignSelf: 'stretch', minHeight: 36, background: ev.color || 'rgba(255,255,255,0.5)' }} />
                                <div className="flex-1 min-w-0">
                                  <p className="text-[10px] font-bold uppercase text-white/40 mb-0.5" style={{ letterSpacing: '0.09em' }}>{typeLabel[ev.type]}</p>
                                  <p className="text-sm font-semibold text-white leading-snug">{ev.title}</p>
                                  {ev.time && <p className="text-xs text-white/50 mt-0.5">{ev.time}</p>}
                                  {ev.location && <p className="text-xs text-white/35 truncate">{ev.location}</p>}
                                </div>
                                <div className="shrink-0 text-center rounded-xl px-2.5 py-1.5" style={{ background: 'rgba(255,255,255,0.12)', minWidth: 42 }}>
                                  <p className="text-lg font-bold text-white leading-none">{new Date(ev.date).getDate()}</p>
                                  <p className="text-xs text-white/50 uppercase mt-0.5 font-semibold">{PT_MONTHS[new Date(ev.date).getMonth()].slice(0, 3)}</p>
                                </div>
                              </div>
                            ))}
                          </div>

                        </div>

                        {/* ── Event detail popup (absolute, covers body only) ── */}
                        {selectedEvent && (
                          <div className="absolute inset-0 z-10 flex flex-col rounded-2xl overflow-hidden" style={{ background: 'rgba(100,0,180,0.97)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)' }}>
                            <div className="relative shrink-0" style={{ height: 150 }}>
                              <div className="absolute inset-0" style={{ backgroundImage: `url(${EVT_IMGS[selectedEvent.type] ?? EVT_IMGS.meeting})`, backgroundSize: 'cover', backgroundPosition: 'center' }} />
                              <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.72) 0%, transparent 55%)' }} />
                              <button onClick={() => setSelectedEvent(null)} className="absolute top-3 right-3 flex items-center justify-center rounded-full text-white font-bold" style={{ width: 32, height: 32, background: 'rgba(255,255,255,0.22)', border: '1.5px solid rgba(255,255,255,0.55)', fontSize: 13 }}>✕</button>
                              <div className="absolute bottom-3 left-4">
                                <span className="text-[10px] font-bold uppercase text-white px-2.5 py-1 rounded-full" style={{ background: 'rgba(255,255,255,0.18)', letterSpacing: '0.10em', border: '1px solid rgba(255,255,255,0.22)' }}>{typeLabel[selectedEvent.type] ?? selectedEvent.type}</span>
                              </div>
                            </div>
                            <div className="flex-1 overflow-y-auto px-5 py-4" style={{ scrollbarWidth: 'none' }}>
                              <h3 className="font-extrabold text-white leading-snug mb-4 text-lg">{selectedEvent.title}</h3>
                              <div className="space-y-3">
                                <div className="flex gap-3 text-sm"><span className="text-white/50 w-16 shrink-0 font-medium text-[11px] uppercase" style={{ letterSpacing: '0.08em', paddingTop: 2 }}>Data</span><span className="text-white/85 capitalize">{new Date(selectedEvent.date).toLocaleDateString('pt-PT', { weekday: 'long', day: 'numeric', month: 'long' })}</span></div>
                                {selectedEvent.time && <div className="flex gap-3 text-sm"><span className="text-white/50 w-16 shrink-0 font-medium text-[11px] uppercase" style={{ letterSpacing: '0.08em', paddingTop: 2 }}>Horário</span><span className="text-white/85">{selectedEvent.time}</span></div>}
                                {selectedEvent.location && <div className="flex gap-3 text-sm"><span className="text-white/50 w-16 shrink-0 font-medium text-[11px] uppercase" style={{ letterSpacing: '0.08em', paddingTop: 2 }}>Local</span><span className="text-white/85">{selectedEvent.location}</span></div>}
                                {selectedEvent.organizer && <div className="flex gap-3 text-sm"><span className="text-white/50 w-16 shrink-0 font-medium text-[11px] uppercase" style={{ letterSpacing: '0.08em', paddingTop: 2 }}>Organiza</span><span className="text-white/85">{selectedEvent.organizer}</span></div>}
                                {selectedEvent.description && <div className="pt-3" style={{ borderTop: '1px solid rgba(255,255,255,0.15)' }}><p className="text-sm text-white/70 leading-relaxed">{selectedEvent.description}</p></div>}
                              </div>
                            </div>
                          </div>
                        )}

                      </div>
                    ) : (
                      /* Desktop: 3-column layout — unchanged */
                      <div className="flex-1 flex min-h-0">

                        {/* ── Column 1: Calendar ── */}
                        <div className="flex flex-col min-w-0 transition-all" style={{ flex: selectedEvent ? '0 0 auto' : '1 1 0', width: selectedEvent ? '52%' : undefined, marginRight: 16, transitionDuration: '320ms', transitionTimingFunction: 'cubic-bezier(0.4,0,0.2,1)' }}>
                          <div className="grid grid-cols-7 gap-1.5 mb-1.5 shrink-0">
                            {PT_DAYS.map(d => <div key={d} className="text-center text-[10px] font-bold text-white/35 uppercase py-0.5" style={{ letterSpacing: '0.07em' }}>{d}</div>)}
                          </div>
                          <div className="flex-1 grid grid-cols-7 gap-1.5" style={{ gridAutoRows: '1fr' }}>
                            {days.map((day, idx) => {
                              if (day === null) return <div key={`p${idx}`} />
                              const dayEvts = eventsForDay(y, m, day)
                              const isToday = y === 2026 && m === 8 && day === 1
                              const isSel   = selectedDay === day
                              return (
                                <div key={day}
                                  onClick={() => { const evts = eventsForDay(y, m, day); if (isSel) { setSelectedDay(null); setSelectedEvent(null) } else { setSelectedDay(day); setSelectedEvent(evts[0] ?? null) } }}
                                  className="rounded-xl p-2 cursor-pointer transition-all overflow-hidden"
                                  style={{ background: isSel ? 'rgba(255,255,255,0.22)' : 'rgba(255,255,255,0.07)', border: isToday ? '1.5px solid rgba(255,255,255,0.65)' : '1px solid rgba(255,255,255,0.10)' }}
                                >
                                  <p className={`text-xs font-bold mb-1 ${isToday ? 'text-white' : 'text-white/55'}`}>{day}</p>
                                  {dayEvts.slice(0, 2).map((ev, ei) => (
                                    <div key={ei}
                                      className="flex items-center gap-1 text-[11px] rounded px-1.5 py-0.5 mb-0.5 text-white font-medium cursor-pointer hover:bg-white/30 transition-colors leading-snug overflow-hidden"
                                      style={{ background: 'rgba(255,255,255,0.20)' }}
                                      onClick={e => { e.stopPropagation(); setSelectedDay(day); setSelectedEvent(ev) }}
                                    >
                                      <span className="shrink-0 rounded-full" style={{ width: 6, height: 6, background: ev.color || 'rgba(255,255,255,0.75)' }} />
                                      <span className="truncate">{ev.title}</span>
                                    </div>
                                  ))}
                                  {dayEvts.length > 2 && <div className="text-[9px] text-white/40">+{dayEvts.length - 2}</div>}
                                </div>
                              )
                            })}
                          </div>
                        </div>

                        {/* ── Column 2: Upcoming events list ── */}
                        <div className="flex flex-col overflow-hidden rounded-2xl transition-all" style={{ width: selectedEvent ? 220 : 280, marginRight: selectedEvent ? 16 : 0, transitionDuration: '320ms', transitionTimingFunction: 'cubic-bezier(0.4,0,0.2,1)', background: 'rgba(255,255,255,0.09)', border: '1px solid rgba(255,255,255,0.18)' }}>
                          <div className="px-4 py-3 shrink-0" style={{ borderBottom: '1px solid rgba(255,255,255,0.12)', background: 'rgba(255,255,255,0.07)' }}>
                            <p className="text-sm font-semibold text-white">
                              {selectedDay ? `${selectedDay} de ${PT_MONTHS[m]}` : 'Próximos Eventos'}
                            </p>
                            {selectedDay && (
                              <button onClick={() => { setSelectedDay(null); setSelectedEvent(null) }} className="text-xs text-white/70 hover:text-white mt-1 font-medium transition-colors flex items-center gap-1">← todos os eventos</button>
                            )}
                          </div>
                          <div className="flex-1 overflow-y-auto" style={{ scrollbarWidth: 'none' }}>
                            {listEvents.length === 0
                              ? <p className="px-4 py-6 text-sm text-white/40 text-center">Sem eventos</p>
                              : listEvents.map((ev, i) => (
                                <div key={i}
                                  className="flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors"
                                  style={{ borderBottom: '1px solid rgba(255,255,255,0.08)', background: selectedEvent === ev ? 'rgba(255,255,255,0.12)' : 'transparent' }}
                                  onClick={() => setSelectedEvent(selectedEvent === ev ? null : ev)}
                                >
                                  <div className="shrink-0 rounded-full" style={{ width: 3, alignSelf: 'stretch', minHeight: 36, background: ev.color || 'rgba(255,255,255,0.5)' }} />
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm font-semibold text-white leading-snug truncate">{ev.title}</p>
                                    <p className="text-xs text-white/45 mt-0.5 truncate">{ev.time ?? typeLabel[ev.type]}</p>
                                  </div>
                                  <div className="shrink-0 text-center rounded-lg px-1.5 py-1" style={{ background: 'rgba(255,255,255,0.12)', minWidth: 36 }}>
                                    <p className="text-sm font-bold text-white leading-none">{new Date(ev.date).getDate()}</p>
                                    <p className="text-[9px] text-white/50 uppercase mt-0.5">{PT_MONTHS[new Date(ev.date).getMonth()].slice(0, 3)}</p>
                                  </div>
                                  <span className="text-white/30 text-base shrink-0">›</span>
                                </div>
                              ))
                            }
                          </div>
                        </div>

                        {/* ── Column 3: Event detail (desktop slide-in) ── */}
                        <div
                          className="flex flex-col overflow-hidden rounded-2xl transition-all"
                          style={{ flex: selectedEvent ? '1 1 0' : '0 0 0', width: selectedEvent ? undefined : 0, minWidth: 0, opacity: selectedEvent ? 1 : 0, transitionDuration: '320ms', transitionTimingFunction: 'cubic-bezier(0.4,0,0.2,1)', background: selectedEvent ? 'rgba(255,255,255,0.09)' : 'transparent', border: selectedEvent ? '1px solid rgba(255,255,255,0.18)' : 'none', overflow: 'hidden' }}
                        >
                          {selectedEvent && (
                            <>
                              <div className="relative shrink-0" style={{ height: 175 }}>
                                <div className="absolute inset-0" style={{ backgroundImage: `url(${EVT_IMGS[selectedEvent.type] ?? EVT_IMGS.meeting})`, backgroundSize: 'cover', backgroundPosition: 'center', borderRadius: '16px 16px 0 0' }} />
                                <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.72) 0%, transparent 55%)', borderRadius: '16px 16px 0 0' }} />
                                <button
                                  onClick={() => { setSelectedEvent(null); setSelectedDay(null) }}
                                  className="absolute top-3 right-3 flex items-center justify-center rounded-full text-white hover:bg-white hover:text-[#1c1870] transition-all font-bold"
                                  style={{ width: 36, height: 36, background: 'rgba(255,255,255,0.22)', border: '1.5px solid rgba(255,255,255,0.55)', fontSize: 15, boxShadow: '0 2px 12px rgba(0,0,0,0.35)' }}
                                >✕</button>
                                <div className="absolute bottom-3 left-4">
                                  <span className="text-[10px] font-bold uppercase text-white px-2.5 py-1 rounded-full" style={{ background: 'rgba(255,255,255,0.18)', letterSpacing: '0.10em', border: '1px solid rgba(255,255,255,0.22)' }}>{typeLabel[selectedEvent.type] ?? selectedEvent.type}</span>
                                </div>
                              </div>
                              <div className="flex-1 overflow-y-auto px-5 py-4" style={{ scrollbarWidth: 'none' }}>
                                <h3 className="font-extrabold text-white leading-snug mb-4" style={{ fontSize: '1.1rem' }}>{selectedEvent.title}</h3>
                                <div className="space-y-3">
                                  <div className="flex gap-3 text-sm">
                                    <span className="text-white/40 w-16 shrink-0 font-medium text-[11px] uppercase" style={{ letterSpacing: '0.08em', paddingTop: 2 }}>Data</span>
                                    <span className="text-white/80 capitalize">{new Date(selectedEvent.date).toLocaleDateString('pt-PT', { weekday: 'long', day: 'numeric', month: 'long' })}</span>
                                  </div>
                                  {selectedEvent.time && (
                                    <div className="flex gap-3 text-sm">
                                      <span className="text-white/40 w-16 shrink-0 font-medium text-[11px] uppercase" style={{ letterSpacing: '0.08em', paddingTop: 2 }}>Horário</span>
                                      <span className="text-white/80">{selectedEvent.time}</span>
                                    </div>
                                  )}
                                  {selectedEvent.location && (
                                    <div className="flex gap-3 text-sm">
                                      <span className="text-white/40 w-16 shrink-0 font-medium text-[11px] uppercase" style={{ letterSpacing: '0.08em', paddingTop: 2 }}>Local</span>
                                      <span className="text-white/80">{selectedEvent.location}</span>
                                    </div>
                                  )}
                                  {selectedEvent.organizer && (
                                    <div className="flex gap-3 text-sm">
                                      <span className="text-white/40 w-16 shrink-0 font-medium text-[11px] uppercase" style={{ letterSpacing: '0.08em', paddingTop: 2 }}>Organiza</span>
                                      <span className="text-white/80">{selectedEvent.organizer}</span>
                                    </div>
                                  )}
                                  {selectedEvent.description && (
                                    <div className="pt-3" style={{ borderTop: '1px solid rgba(255,255,255,0.10)' }}>
                                      <p className="text-sm text-white/65 leading-relaxed">{selectedEvent.description}</p>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </>
                          )}
                        </div>

                      </div>
                    )}
                  </div>
                </div>
              )
            })()}

            {/* ══ Documentos ══ */}
            {activeNav === 'documentos' && !isMobile && (() => {
              const filteredDocs = docCategory === 'Todos' ? DOCS_DATA : DOCS_DATA.filter(d => d.category === docCategory)
              const hasMsgs = docMessages.length > 0

              const sendDocQuery = (override?: string) => {
                const q = (override ?? docQuery).trim()
                if (!q || docThinking) return
                if (!override) setDocQuery('')
                setDocMessages(prev => [...prev, { role: 'user', content: q }])
                setDocThinking(true)
                setTimeout(() => {
                  let content: string
                  let sources: string[]
                  if (previewDoc) {
                    content = `Com base no documento "${previewDoc.name.replace(/\.(pdf|docx|xlsx|pptx)$/i, '')}" — ${previewDoc.excerpt} Consulta o documento original para detalhes completos.`
                    sources = [previewDoc.name]
                  } else {
                    const ql = q.toLowerCase()
                    const match = DOC_MOCK_RESPONSES.find(r => r.keywords.some(kw => ql.includes(kw)))
                    if (match) {
                      const matchedDoc = DOCS_DATA.find(d => match.docIds.includes(d.id))
                      if (matchedDoc) { setPreviewDoc(matchedDoc); setDocChatOpen(true) }
                      content = match.response
                      sources = match.docIds.map(id => DOCS_DATA.find(d => d.id === id)?.name ?? '').filter(Boolean)
                    } else {
                      content = `Pesquisei na biblioteca de documentos TIS, mas não encontrei informação específica sobre "${q}". Abre um documento no painel lateral para uma resposta mais precisa.`
                      sources = []
                    }
                  }
                  setDocMessages(prev => [...prev, { role: 'agent', content, sources }])
                  setDocThinking(false)
                }, 1400 + Math.random() * 600)
              }

              const openDoc = (doc: TISDocument) => {
                setPreviewDoc(doc)
                setDocChatOpen(true)
                if (docMessages.length === 0) {
                  setDocMessages([{ role: 'agent', content: `Abri o documento "${doc.name.replace(/\.(pdf|docx|xlsx|pptx)$/i, '')}". Posso ajudar com alguma questão sobre o seu conteúdo?` }])
                }
              }

              const glassPanel = { background: 'rgba(255,255,255,0.08)', backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)', border: '1px solid rgba(255,255,255,0.16)', boxShadow: '0 8px 40px rgba(0,0,50,0.22)' }

              return (
                <div className="h-full flex gap-5 px-14 py-8">

                  {/* ── Central glassmorphism box ── */}
                  <div className="flex-1 min-h-0 rounded-3xl flex flex-col overflow-hidden" style={glassPanel}>

                    {!previewDoc && !hasMsgs ? (
                      /* Hero state */
                      <div className="flex-1 flex flex-col items-center justify-center gap-7 p-8">
                        <div className="text-center">
                          <div className="mx-auto mb-7 rounded-full overflow-hidden" style={{ width: 90, height: 90, border: '2.5px solid rgba(255,255,255,0.45)', boxShadow: '0 6px 28px rgba(0,0,70,0.35)' }}>
                            <img src={agentPhoto} alt="Assistente de RH" className="h-full w-full object-cover" />
                          </div>
                          <h2 className="text-4xl font-extrabold text-white mb-3">Biblioteca de Documentos</h2>
                          <p className="text-white/50 text-base max-w-md mx-auto leading-relaxed">Faz uma pergunta e o agente de RH responde com base nos documentos da biblioteca.</p>
                        </div>
                        <div className="w-full max-w-lg relative">
                          <input
                            value={docQuery}
                            onChange={e => setDocQuery(e.target.value)}
                            onKeyDown={e => { if (e.key === 'Enter') sendDocQuery() }}
                            placeholder="Fazer uma pergunta sobre os documentos…"
                            className="w-full rounded-full px-6 py-4 pr-16 text-white placeholder-white/35 outline-none"
                            style={{ background: 'rgba(255,255,255,0.10)', border: '1px solid rgba(255,255,255,0.28)', backdropFilter: 'blur(18px)', boxShadow: '0 4px 32px rgba(0,0,80,0.18)', fontSize: 16 }}
                          />
                          <button onClick={() => sendDocQuery()} className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center justify-center rounded-full transition-all hover:bg-white/25" style={{ width: 38, height: 38, background: 'rgba(255,255,255,0.16)', border: '1px solid rgba(255,255,255,0.22)' }}>
                            <SendIcon className="h-4 w-4 text-white" />
                          </button>
                        </div>
                        <div className="flex flex-wrap gap-2 justify-center max-w-xl">
                          {['Quantos dias de férias tenho direito?', 'Como aderir ao teletrabalho?', 'Quais as coberturas do seguro de saúde?', 'Como pedir reembolso de despesas?', 'Que formações estão disponíveis?'].map(q => (
                            <button key={q} onClick={() => sendDocQuery(q)} className="rounded-full px-4 py-2 text-xs font-medium text-white/65 transition-all hover:text-white hover:bg-white/15" style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.14)' }}>{q}</button>
                          ))}
                        </div>
                        <p className="text-[11px] text-white/28 text-center">Abre um documento no painel lateral ou faz uma pergunta diretamente</p>
                      </div>

                    ) : (
                      /* Active state */
                      <div className="flex-1 flex flex-col min-h-0 relative">
                        {previewDoc ? (
                          /* Document fills full height + floating chat widget */
                          <>
                            {/* Doc header */}
                            <div className="flex items-center gap-4 px-6 py-4 shrink-0" style={{ borderBottom: '1px solid rgba(255,255,255,0.10)', background: 'rgba(255,255,255,0.05)' }}>
                              <DocTypeIcon type={previewDoc.type} className="h-[53px] w-[53px] text-white/85 shrink-0" />
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-bold text-white truncate">{previewDoc.name}</p>
                                <p className="text-xs text-white/40 mt-0.5">{previewDoc.pages} pág. · {previewDoc.size} · {previewDoc.date} · {previewDoc.category}</p>
                              </div>
                              <button className="shrink-0 flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold text-white transition-all hover:bg-white/20" style={{ background: 'rgba(255,255,255,0.10)', border: '1px solid rgba(255,255,255,0.18)' }}>
                                <IconDownload className="h-3.5 w-3.5" />
                                <span>Download</span>
                              </button>
                              <button onClick={() => { setPreviewDoc(null); setDocMessages([]); setDocChatOpen(false) }} className="shrink-0 h-7 w-7 rounded-full flex items-center justify-center text-white/40 hover:text-white hover:bg-white/15 transition-all text-sm leading-none">✕</button>
                            </div>
                            {/* PDF fills all remaining height */}
                            <div className="flex-1 min-h-0 overflow-hidden">
                              <iframe
                                src={`${import.meta.env.BASE_URL}docs/example.pdf`}
                                className="w-full h-full border-0"
                                title={previewDoc.name}
                              />
                            </div>
                            {/* ── Floating chat widget (left side) ── */}
                            <div className="absolute bottom-5 left-5 flex flex-col items-start gap-3" style={{ zIndex: 20 }}>
                              {/* Chat panel */}
                              {docChatOpen && (
                                <div className="w-80 flex flex-col overflow-hidden rounded-2xl" style={{ height: 390, background: 'rgba(76,29,149,0.92)', backdropFilter: 'blur(36px)', WebkitBackdropFilter: 'blur(36px)', border: '1px solid rgba(167,139,250,0.35)', boxShadow: '0 16px 56px rgba(76,29,149,0.55)' }}>
                                  {/* Panel header */}
                                  <div className="flex items-center gap-2.5 px-4 py-3 shrink-0" style={{ borderBottom: '1px solid rgba(167,139,250,0.18)', background: 'rgba(109,40,217,0.30)' }}>
                                    <div className="rounded-full overflow-hidden shrink-0" style={{ width: 28, height: 28, border: '1.5px solid rgba(196,181,253,0.55)' }}>
                                      <img src={agentPhoto} className="w-full h-full object-cover" alt="" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <p className="text-xs font-semibold text-white leading-tight">Assistente de RH</p>
                                      <div className="flex items-center gap-1 mt-0.5">
                                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" style={{ boxShadow: '0 0 4px rgba(52,211,153,0.7)' }} />
                                        <span className="text-[9px] text-violet-200/70">Online</span>
                                      </div>
                                    </div>
                                    <button onClick={() => setDocChatOpen(false)} className="h-6 w-6 rounded-full flex items-center justify-center text-violet-300/60 hover:text-white hover:bg-white/15 transition-all text-sm leading-none shrink-0">✕</button>
                                  </div>
                                  {/* Messages */}
                                  <div className="flex-1 overflow-y-auto px-3 py-3 space-y-3" style={{ scrollbarWidth: 'none' } as React.CSSProperties}>
                                    {docMessages.map((msg, i) => (
                                      <div key={i} className={`flex gap-2 ${msg.role === 'user' ? 'flex-row-reverse' : 'items-end'}`}>
                                        {msg.role === 'agent' && (
                                          <div className="shrink-0 rounded-full overflow-hidden" style={{ width: 22, height: 22, border: '1px solid rgba(196,181,253,0.45)' }}>
                                            <img src={agentPhoto} className="w-full h-full object-cover object-top" alt="" />
                                          </div>
                                        )}
                                        <div className={`rounded-xl px-3 py-2 ${msg.role === 'user' ? 'rounded-tr-sm' : 'rounded-bl-sm'}`} style={{ maxWidth: '82%', background: msg.role === 'user' ? 'rgba(109,40,217,0.55)' : 'rgba(255,255,255,0.12)', border: '1px solid rgba(167,139,250,0.20)', color: 'rgba(255,255,255,0.92)', fontSize: 12, lineHeight: 1.55 }}>
                                          {msg.content}
                                        </div>
                                      </div>
                                    ))}
                                    {docThinking && (
                                      <div className="flex gap-2 items-end">
                                        <div className="shrink-0 rounded-full overflow-hidden" style={{ width: 22, height: 22, border: '1px solid rgba(196,181,253,0.45)' }}>
                                          <img src={agentPhoto} className="w-full h-full object-cover object-top" alt="" />
                                        </div>
                                        <div className="rounded-xl rounded-bl-sm px-3 py-2" style={{ background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(167,139,250,0.20)' }}>
                                          <div className="flex gap-1 items-center h-4">
                                            {[0, 1, 2].map(i => <div key={i} className="rounded-full" style={{ width: 5, height: 5, background: 'rgba(196,181,253,0.70)', animation: `bubble-float 1.2s ${i * 0.22}s ease-in-out infinite` }} />)}
                                          </div>
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                  {/* Input bar */}
                                  <div className="shrink-0 px-3 py-2.5 flex items-center gap-2" style={{ borderTop: '1px solid rgba(167,139,250,0.18)' }}>
                                    <input
                                      value={docQuery}
                                      onChange={e => setDocQuery(e.target.value)}
                                      onKeyDown={e => { if (e.key === 'Enter') sendDocQuery() }}
                                      placeholder={`Pergunta sobre ${previewDoc.name.replace(/\.(pdf|docx|xlsx|pptx)$/i, '')}…`}
                                      className="flex-1 bg-transparent text-white outline-none"
                                      style={{ fontSize: 13, color: 'white' }}
                                    />
                                    <button onClick={() => sendDocQuery()} disabled={!docQuery.trim() || docThinking} className="shrink-0 flex items-center justify-center rounded-lg transition-all disabled:opacity-35" style={{ width: 28, height: 28, background: 'rgba(109,40,217,0.55)', border: '1px solid rgba(167,139,250,0.35)' }}>
                                      <SendIcon className="h-3 w-3 text-white" />
                                    </button>
                                  </div>
                                </div>
                              )}
                              {/* Avatar row: pulsing button + speech bubble */}
                              <div className="flex items-center gap-3">
                                <div className="relative">
                                  {!docChatOpen && (
                                    <span className="absolute inset-0 rounded-full pointer-events-none" style={{ animation: 'ring-ping 1.8s cubic-bezier(0,0,0.2,1) infinite', background: 'rgba(139,92,246,0.60)' }} />
                                  )}
                                  <button
                                    onClick={() => setDocChatOpen(v => !v)}
                                    className="relative rounded-full overflow-hidden transition-all hover:scale-105 active:scale-95"
                                    style={{ width: 60, height: 60, border: '2.5px solid rgba(167,139,250,0.75)', boxShadow: docChatOpen ? '0 6px 28px rgba(109,40,217,0.60)' : '0 4px 20px rgba(109,40,217,0.50)', animation: !docChatOpen ? 'avatar-pulse 2.4s ease-in-out infinite' : 'none' }}
                                  >
                                    <img src={agentPhoto} className="w-full h-full object-cover" alt="Assistente de RH" />
                                  </button>
                                </div>
                                {!docChatOpen && (
                                  <div className="flex items-center">
                                    <div style={{ width: 0, height: 0, borderTop: '6px solid transparent', borderBottom: '6px solid transparent', borderRight: '8px solid rgba(76,29,149,0.95)' }} />
                                    <div className="rounded-xl px-3 py-2 text-xs font-semibold text-white" style={{ background: 'rgba(76,29,149,0.95)', border: '1px solid rgba(167,139,250,0.40)', boxShadow: '0 4px 16px rgba(76,29,149,0.50)', whiteSpace: 'nowrap' }}>
                                      Posso ajudar? 💬
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          </>
                        ) : (
                          /* Chat fills center when no document is open */
                          <div className="flex-1 flex flex-col min-h-0">
                            {/* Close bar */}
                            <div className="shrink-0 flex items-center justify-between px-5 py-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                              <div className="flex items-center gap-2">
                                <div className="rounded-full overflow-hidden" style={{ width: 24, height: 24, border: '1px solid rgba(255,255,255,0.35)' }}>
                                  <img src={agentPhoto} className="w-full h-full object-cover" alt="" />
                                </div>
                                <span className="text-xs font-semibold text-white/55">Assistente de RH</span>
                              </div>
                              <button onClick={() => setDocMessages([])} className="h-6 w-6 rounded-full flex items-center justify-center text-white/35 hover:text-white hover:bg-white/15 transition-all text-sm leading-none">✕</button>
                            </div>
                            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4" style={{ scrollbarWidth: 'none' } as React.CSSProperties}>
                              {docMessages.map((msg, i) => (
                                <div key={i} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                                  {msg.role === 'agent' && (
                                    <div className="shrink-0 rounded-full overflow-hidden" style={{ width: 30, height: 30, border: '1.5px solid rgba(255,255,255,0.35)' }}>
                                      <img src={agentPhoto} className="w-full h-full object-cover object-top" alt="" />
                                    </div>
                                  )}
                                  <div className={`rounded-2xl px-4 py-3 ${msg.role === 'user' ? 'rounded-tr-sm' : 'rounded-tl-sm'}`} style={{ maxWidth: '72%', background: msg.role === 'user' ? 'rgba(3,110,242,0.32)' : 'rgba(255,255,255,0.10)', border: '1px solid rgba(255,255,255,0.12)' }}>
                                    <p className="text-sm text-white/90 leading-relaxed">{msg.content}</p>
                                    {msg.sources && msg.sources.length > 0 && (
                                      <div className="mt-2.5 pt-2.5" style={{ borderTop: '1px solid rgba(255,255,255,0.10)' }}>
                                        <p className="text-[9px] font-bold text-white/35 uppercase mb-1.5" style={{ letterSpacing: '0.10em' }}>Fontes</p>
                                        {msg.sources.map((s, si) => (
                                          <p key={si} className="text-[10px] text-white/50 flex items-center gap-1.5 mb-0.5">
                                            <span className="text-white/30">📄</span>{s}
                                          </p>
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              ))}
                              {docThinking && (
                                <div className="flex gap-3">
                                  <div className="shrink-0 rounded-full overflow-hidden" style={{ width: 30, height: 30, border: '1.5px solid rgba(255,255,255,0.35)' }}>
                                    <img src={agentPhoto} className="w-full h-full object-cover object-top" alt="" />
                                  </div>
                                  <div className="rounded-2xl rounded-tl-sm px-4 py-3" style={{ background: 'rgba(255,255,255,0.10)', border: '1px solid rgba(255,255,255,0.12)' }}>
                                    <div className="flex gap-1 items-center h-5">
                                      {[0, 1, 2].map(i => <div key={i} className="rounded-full" style={{ width: 6, height: 6, background: 'rgba(255,255,255,0.50)', animation: `bubble-float 1.2s ${i * 0.22}s ease-in-out infinite` }} />)}
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>
                            <div className="shrink-0 px-4 py-3 flex items-center gap-3" style={{ borderTop: '1px solid rgba(255,255,255,0.10)' }}>
                              <input
                                value={docQuery}
                                onChange={e => setDocQuery(e.target.value)}
                                onKeyDown={e => { if (e.key === 'Enter') sendDocQuery() }}
                                placeholder="Fazer uma pergunta sobre os documentos…"
                                className="flex-1 bg-transparent text-white outline-none placeholder-white/30"
                                style={{ fontSize: 16 }}
                              />
                              <button onClick={() => sendDocQuery()} disabled={!docQuery.trim() || docThinking} className="shrink-0 flex items-center justify-center rounded-xl transition-all disabled:opacity-35 hover:bg-white/20" style={{ width: 34, height: 34, background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.18)' }}>
                                <SendIcon className="h-3.5 w-3.5 text-white" />
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* ── Right panel: Library ── */}
                  <div className="w-80 shrink-0 flex flex-col rounded-2xl overflow-hidden" style={glassPanel}>
                    <div className="px-4 py-4 shrink-0" style={{ borderBottom: '1px solid rgba(255,255,255,0.10)', background: 'rgba(255,255,255,0.05)' }}>
                      <h3 className="text-sm font-extrabold text-white">Biblioteca de Documentos</h3>
                    </div>
                    <div className="flex gap-1.5 px-4 py-3 flex-wrap shrink-0" style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
                      {DOC_CATS.map(cat => (
                        <button key={cat}
                          onClick={() => setDocCategory(cat)}
                          className="rounded-full px-3 py-1 text-[11px] font-semibold transition-all"
                          style={docCategory === cat
                            ? { background: 'rgba(255,255,255,0.20)', color: 'white', border: '1px solid rgba(255,255,255,0.32)' }
                            : { background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.45)', border: '1px solid rgba(255,255,255,0.10)' }}
                        >{cat}</button>
                      ))}
                    </div>
                    <div className="flex-1 overflow-y-auto" style={{ scrollbarWidth: 'none' } as React.CSSProperties}>
                      {filteredDocs.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full gap-3 px-6 text-center py-10">
                          <IconDoc className="h-8 w-8 text-white/18" />
                          <p className="text-sm text-white/30">Sem documentos nesta categoria.</p>
                        </div>
                      ) : filteredDocs.map(doc => (
                        <div key={doc.id}
                          className="flex items-center gap-3 px-4 py-3 cursor-pointer transition-all"
                          style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', background: previewDoc?.id === doc.id ? 'rgba(130,0,200,0.18)' : 'transparent' }}
                          onClick={() => openDoc(doc)}
                          onMouseEnter={e => { if (previewDoc?.id !== doc.id) (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.05)' }}
                          onMouseLeave={e => { if (previewDoc?.id !== doc.id) (e.currentTarget as HTMLElement).style.background = 'transparent' }}
                        >
                          <DocTypeIcon type={doc.type} className="h-[27px] w-[27px] text-white/65 shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="text-[11px] font-semibold text-white leading-snug truncate">{doc.name}</p>
                            <p className="text-[10px] text-white/38 mt-0.5">{doc.size} · {doc.pages} pág. · {doc.date}</p>
                          </div>
                          <button
                            onClick={e => e.stopPropagation()}
                            className="shrink-0 flex items-center justify-center rounded-lg transition-all text-white/35 hover:text-white hover:bg-white/15"
                            style={{ width: 28, height: 28 }}
                            title="Download"
                          >
                            <IconDownload className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )
            })()}

            {/* ══ Documentos (mobile) ══ */}
            {activeNav === 'documentos' && isMobile && (() => {
              const filteredDocs = docCategory === 'Todos' ? DOCS_DATA : DOCS_DATA.filter(d => d.category === docCategory)
              const glassM = { background: 'rgba(255,255,255,0.08)', backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)', border: '1px solid rgba(255,255,255,0.16)', boxShadow: '0 8px 40px rgba(0,0,50,0.22)' }

              const sendDocQueryM = (override?: string) => {
                const q = (override ?? docQuery).trim()
                if (!q || docThinking) return
                if (!override) setDocQuery('')
                setDocMessages(prev => [...prev, { role: 'user', content: q }])
                setDocThinking(true)
                setTimeout(() => {
                  let content: string
                  let sources: string[]
                  if (previewDoc) {
                    content = `Com base no documento "${previewDoc.name.replace(/\.(pdf|docx|xlsx|pptx)$/i, '')}" — ${previewDoc.excerpt} Consulta o documento original para detalhes completos.`
                    sources = [previewDoc.name]
                  } else {
                    const ql = q.toLowerCase()
                    const match = DOC_MOCK_RESPONSES.find(r => r.keywords.some(kw => ql.includes(kw)))
                    if (match) {
                      const matchedDoc = DOCS_DATA.find(d => match.docIds.includes(d.id))
                      if (matchedDoc) setPreviewDoc(matchedDoc)
                      content = match.response
                      sources = match.docIds.map(id => DOCS_DATA.find(d => d.id === id)?.name ?? '').filter(Boolean)
                    } else {
                      content = `Pesquisei na biblioteca, mas não encontrei informação específica sobre "${q}". Tenta selecionar um documento diretamente.`
                      sources = []
                    }
                  }
                  setDocMessages(prev => [...prev, { role: 'agent', content, sources }])
                  setDocThinking(false)
                }, 1400 + Math.random() * 600)
              }

              /* ── Chat view (full-screen) ── */
              if (docChatOpen) return (
                <div className="h-full flex flex-col px-3 pt-1">
                  <div className="flex-1 flex flex-col min-h-0 rounded-2xl overflow-hidden" style={glassM}>

                    {/* Header */}
                    <div className="flex items-center gap-3 px-4 py-3 shrink-0" style={{ borderBottom: '1px solid rgba(255,255,255,0.12)', background: 'rgba(255,255,255,0.05)' }}>
                      <button
                        onClick={() => { setDocChatOpen(false); if (!previewDoc) setDocMessages([]) }}
                        className="h-8 w-8 rounded-full flex items-center justify-center text-white/55 hover:bg-white/15 transition-all shrink-0"
                      >
                        <IconArrowLeft className="h-4 w-4" />
                      </button>
                      {previewDoc ? (
                        <>
                          <DocTypeIcon type={previewDoc.type} className="h-7 w-7 text-white/80 shrink-0" />
                          <p className="flex-1 text-sm font-semibold text-white truncate min-w-0">{previewDoc.name.replace(/\.(pdf|docx|xlsx|pptx)$/i, '')}</p>
                          <button onClick={() => { setPreviewDoc(null); setDocMessages([]); setDocChatOpen(false) }} className="shrink-0 h-7 w-7 rounded-full flex items-center justify-center text-white/40 hover:text-white hover:bg-white/15 transition-all text-sm leading-none">✕</button>
                        </>
                      ) : (
                        <>
                          <div className="rounded-full overflow-hidden shrink-0" style={{ width: 32, height: 32, border: '1.5px solid rgba(255,255,255,0.40)' }}>
                            <img src={agentPhoto} className="w-full h-full object-cover" alt="" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-white leading-tight">Assistente de RH</p>
                            <div className="flex items-center gap-1 mt-0.5">
                              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" style={{ boxShadow: '0 0 4px rgba(52,211,153,0.7)' }} />
                              <span className="text-[10px] text-white/50">Online</span>
                            </div>
                          </div>
                        </>
                      )}
                    </div>

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto p-3 space-y-3 min-h-0" style={{ scrollbarWidth: 'none' } as React.CSSProperties}>
                      {docMessages.map((msg, i) => (
                        <div key={i} className={`flex items-end gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                          {msg.role === 'agent' && (
                            <div className="h-7 w-7 rounded-full overflow-hidden shrink-0 mb-0.5" style={{ border: '1.5px solid rgba(255,255,255,0.35)' }}>
                              <img src={agentPhoto} className="h-full w-full object-cover object-top" alt="" />
                            </div>
                          )}
                          <div className="max-w-[80%] px-3.5 py-2.5 text-sm leading-relaxed"
                            style={msg.role === 'user'
                              ? { background: 'rgba(255,255,255,0.92)', color: '#036ef2', borderRadius: '18px 18px 4px 18px', fontWeight: 500 }
                              : { background: 'rgba(255,255,255,0.11)', border: '1px solid rgba(255,255,255,0.15)', color: 'white', borderRadius: '18px 18px 18px 4px' }
                            }
                          >
                            {msg.content}
                            {msg.sources && msg.sources.length > 0 && (
                              <div className="mt-2 pt-2" style={{ borderTop: '1px solid rgba(255,255,255,0.12)' }}>
                                <p className="text-[9px] font-bold text-white/35 uppercase mb-1" style={{ letterSpacing: '0.10em' }}>Fontes</p>
                                {msg.sources.map((s, si) => (
                                  <p key={si} className="text-[10px] text-white/50 flex items-center gap-1 mb-0.5">📄 {s}</p>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                      {docThinking && (
                        <div className="flex items-end gap-2">
                          <div className="h-7 w-7 rounded-full overflow-hidden shrink-0" style={{ border: '1.5px solid rgba(255,255,255,0.35)' }}>
                            <img src={agentPhoto} className="h-full w-full object-cover object-top" alt="" />
                          </div>
                          <div className="px-4 py-3" style={{ background: 'rgba(255,255,255,0.11)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '18px 18px 18px 4px' }}>
                            <div className="flex gap-1 items-center">
                              {[0, 150, 300].map(d => <span key={d} className="h-2 w-2 rounded-full bg-white/65 animate-bounce" style={{ animationDelay: `${d}ms` }} />)}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Input */}
                    <div className="p-3 shrink-0" style={{ borderTop: '1px solid rgba(255,255,255,0.10)' }}>
                      <div className="flex items-center gap-2 rounded-full px-4 py-2.5" style={{ background: 'rgba(255,255,255,0.09)', border: '1px solid rgba(255,255,255,0.18)' }}>
                        <input
                          value={docQuery}
                          onChange={e => setDocQuery(e.target.value)}
                          onKeyDown={e => { if (e.key === 'Enter') sendDocQueryM() }}
                          placeholder={previewDoc ? `Pergunta sobre ${previewDoc.name.replace(/\.(pdf|docx|xlsx|pptx)$/i, '')}…` : 'Fazer uma pergunta…'}
                          className="flex-1 bg-transparent text-white outline-none placeholder-white/40"
                          style={{ fontSize: 16 }}
                        />
                        <button onClick={() => sendDocQueryM()} disabled={!docQuery.trim() || docThinking}
                          className="h-8 w-8 rounded-full bg-white flex items-center justify-center text-[#036ef2] disabled:opacity-35 active:scale-95 transition-transform"
                        >
                          <SendIcon className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>

                  </div>
                </div>
              )

              /* ── Doc detail view ── */
              if (previewDoc) return (
                <div className="h-full flex flex-col px-3 pt-1">
                  <div className="flex-1 flex flex-col min-h-0 rounded-2xl overflow-hidden" style={glassM}>

                    {/* Header */}
                    <div className="flex items-center gap-3 px-4 py-3 shrink-0" style={{ borderBottom: '1px solid rgba(255,255,255,0.12)', background: 'rgba(255,255,255,0.05)' }}>
                      <button
                        onClick={() => { setPreviewDoc(null); setDocMessages([]) }}
                        className="h-8 w-8 rounded-full flex items-center justify-center text-white/55 hover:bg-white/15 transition-all shrink-0"
                      >
                        <IconArrowLeft className="h-4 w-4" />
                      </button>
                      <p className="flex-1 text-sm font-semibold text-white">Detalhe do documento</p>
                      <button className="flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold text-white" style={{ background: 'rgba(255,255,255,0.10)', border: '1px solid rgba(255,255,255,0.18)' }}>
                        <IconDownload className="h-3.5 w-3.5" />
                        Download
                      </button>
                    </div>

                    <div className="flex-1 overflow-y-auto" style={{ scrollbarWidth: 'none' } as React.CSSProperties}>
                      {/* Doc info */}
                      <div className="flex flex-col items-center pt-8 pb-6 px-5 gap-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                        <DocTypeIcon type={previewDoc.type} className="h-20 w-20 text-white/80" />
                        <div className="text-center">
                          <p className="text-base font-bold text-white mb-2 leading-snug">{previewDoc.name}</p>
                          <div className="flex items-center justify-center gap-2 flex-wrap">
                            <span className="text-xs text-white/40">{previewDoc.pages} pág.</span>
                            <span className="text-white/20">·</span>
                            <span className="text-xs text-white/40">{previewDoc.size}</span>
                            <span className="text-white/20">·</span>
                            <span className="text-xs text-white/40">{previewDoc.date}</span>
                          </div>
                          <span className="inline-block mt-2 text-xs font-medium px-2.5 py-0.5 rounded-full" style={{ background: 'rgba(255,255,255,0.10)', color: 'rgba(255,255,255,0.60)', border: '1px solid rgba(255,255,255,0.14)' }}>{previewDoc.category}</span>
                        </div>
                        <div className="w-full rounded-xl p-3.5" style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.10)' }}>
                          <p className="text-xs text-white/60 leading-relaxed">{previewDoc.excerpt}</p>
                        </div>
                      </div>

                      {/* Agent CTA */}
                      <div className="flex flex-col gap-4 px-5 py-6">
                        <div className="flex items-center gap-3">
                          <div className="relative shrink-0">
                            <div className="rounded-full overflow-hidden" style={{ width: 48, height: 48, border: '2px solid rgba(167,139,250,0.60)' }}>
                              <img src={agentPhoto} className="w-full h-full object-cover" alt="" />
                            </div>
                            <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-emerald-400 border-2 border-[#0a1060]" style={{ boxShadow: '0 0 4px rgba(52,211,153,0.6)' }} />
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-white">Assistente de RH</p>
                            <p className="text-xs text-white/45 mt-0.5">Disponível para perguntas sobre este documento</p>
                          </div>
                        </div>
                        <button
                          onClick={() => {
                            setDocChatOpen(true)
                            if (docMessages.length === 0) setDocMessages([{ role: 'agent', content: `Estou a consultar "${previewDoc.name.replace(/\.(pdf|docx|xlsx|pptx)$/i, '')}". O que queres saber?` }])
                          }}
                          className="w-full rounded-full py-3.5 text-sm font-bold text-white active:scale-[0.98] transition-transform"
                          style={{ background: 'rgba(76,29,149,0.85)', border: '1px solid rgba(167,139,250,0.40)', boxShadow: '0 6px 24px rgba(76,29,149,0.45)' }}
                        >
                          Perguntar ao Assistente
                        </button>
                      </div>
                    </div>

                  </div>
                </div>
              )

              /* ── Library view (default) ── */
              return (
                <div className="h-full flex flex-col px-3 pt-1 gap-3">

                  {/* Search pill */}
                  <div className="shrink-0 relative">
                    <input
                      value={docQuery}
                      onChange={e => setDocQuery(e.target.value)}
                      onKeyDown={e => { if (e.key === 'Enter' && docQuery.trim()) { setDocChatOpen(true); sendDocQueryM() } }}
                      placeholder="Fazer uma pergunta sobre os documentos…"
                      className="w-full rounded-full px-5 py-3 pr-14 text-white placeholder-white/35 outline-none"
                      style={{ background: 'rgba(255,255,255,0.10)', border: '1px solid rgba(255,255,255,0.22)', backdropFilter: 'blur(18px)', fontSize: 15 }}
                    />
                    <button
                      onClick={() => { if (docQuery.trim()) { setDocChatOpen(true); sendDocQueryM() } }}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full flex items-center justify-center"
                      style={{ background: 'rgba(255,255,255,0.16)', border: '1px solid rgba(255,255,255,0.22)' }}
                    >
                      <SendIcon className="h-3.5 w-3.5 text-white" />
                    </button>
                  </div>

                  {/* Doc library card */}
                  <div className="flex-1 min-h-0 rounded-2xl flex flex-col overflow-hidden" style={glassM}>

                    {/* Header */}
                    <div className="shrink-0 px-4 py-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.04)' }}>
                      <h3 className="text-sm font-extrabold text-white">Biblioteca de Documentos</h3>
                    </div>

                    {/* Category chips */}
                    <div className="shrink-0 flex gap-1.5 px-3 py-2.5 overflow-x-auto" style={{ borderBottom: '1px solid rgba(255,255,255,0.07)', scrollbarWidth: 'none' } as React.CSSProperties}>
                      {DOC_CATS.map(cat => (
                        <button key={cat}
                          onClick={() => setDocCategory(cat)}
                          className="rounded-full px-3 py-1 text-[11px] font-semibold whitespace-nowrap shrink-0 transition-all"
                          style={docCategory === cat
                            ? { background: 'rgba(255,255,255,0.20)', color: 'white', border: '1px solid rgba(255,255,255,0.30)' }
                            : { background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.45)', border: '1px solid rgba(255,255,255,0.10)' }}
                        >{cat}</button>
                      ))}
                    </div>

                    {/* Doc list */}
                    <div className="flex-1 overflow-y-auto" style={{ scrollbarWidth: 'none' } as React.CSSProperties}>
                      {filteredDocs.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full gap-3 px-6 text-center py-10">
                          <IconDoc className="h-8 w-8 text-white/18" />
                          <p className="text-sm text-white/30">Sem documentos nesta categoria.</p>
                        </div>
                      ) : filteredDocs.map(doc => (
                        <div key={doc.id}
                          className="flex items-center gap-3 px-4 py-3.5 cursor-pointer transition-all"
                          style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}
                          onClick={() => setPreviewDoc(doc)}
                          onTouchStart={e => (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.06)'}
                          onTouchEnd={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}
                        >
                          <DocTypeIcon type={doc.type} className="h-8 w-8 text-white/65 shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-white truncate">{doc.name}</p>
                            <p className="text-xs text-white/40 mt-0.5">{doc.pages} pág. · {doc.size} · {doc.date}</p>
                          </div>
                          <span className="shrink-0 text-[10px] font-medium px-2 py-0.5 rounded-full" style={{ background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.50)', border: '1px solid rgba(255,255,255,0.12)' }}>{doc.category}</span>
                        </div>
                      ))}
                    </div>

                  </div>

                  {/* FAB — Assistente */}
                  <button
                    onClick={() => {
                      setDocChatOpen(true)
                      if (docMessages.length === 0) setDocMessages([{ role: 'agent', content: 'Olá! Podes fazer-me perguntas sobre qualquer documento da biblioteca. Como posso ajudar?' }])
                    }}
                    className="fixed right-4 flex items-center gap-2.5 px-4 rounded-full"
                    style={{ bottom: '80px', height: 50, background: 'rgba(76,29,149,0.90)', border: '1px solid rgba(167,139,250,0.40)', boxShadow: '0 6px 24px rgba(76,29,149,0.50)', zIndex: 30 }}
                  >
                    <div className="rounded-full overflow-hidden shrink-0" style={{ width: 28, height: 28, border: '1.5px solid rgba(196,181,253,0.60)' }}>
                      <img src={agentPhoto} className="w-full h-full object-cover" alt="" />
                    </div>
                    <span className="text-sm font-semibold text-white">Perguntar</span>
                  </button>

                </div>
              )
            })()}

          </div>
        </>
      )}
    </div>
  )
}
