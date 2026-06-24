/* =====================================================================
   ANTI-BULLYING RUNNER v2.0 ULTRA — GAME.JS
   Endless Runner educativo 2.5D — motor completo do jogo
   Organização:
     1.  Configuração e constantes
     2.  Dicionário de internacionalização (PT / EN / ES)
     3.  Conteúdo: dilemas de bullying (6 cenários)
     4.  Conteúdo: itens da loja (vestes, power-ups, temas)
     5.  Estado e persistência (localStorage)
     6.  Áudio (Web Audio API — música e efeitos sonoros)
     7.  Utilitários gerais
     8.  Internacionalização — aplicação no DOM
     9.  Navegação entre telas
     10. Tela: Loading
     11. Tela: Menu
     12. Tela: Como Jogar
     13. Tela: Loja
     14. Tela: Configurações
     15. Tela: Ranking (Top Run)
     16. Motor do jogo — canvas, física, entidades, render
     17. Controles (teclado e touch)
     18. Dilemas — fluxo de pergunta/resposta
     19. Pausa / Game Over
     20. Boot — inicialização geral
   ===================================================================== */

(function () {
'use strict';

/* =====================================================================
   1. CONFIGURAÇÃO E CONSTANTES
   ===================================================================== */

const CONFIG = {
  LANES: 3,
  GRAVITY: 0.6,
  JUMP_FORCE: 12,
  BASE_SPEED: 5,
  MAX_SPEED: 15,
  SPEED_GAIN_PER_SCORE: 0.0007,
  SPEED_MULT_BOOST: 1.45,
  SPEED_MULT_SLOW: 0.55,
  PROGRESS_DIVISOR: 230,
  LIVES_MAX: 3,
  XP_PER_LEVEL: 100,
  MAX_LEVEL: 50,
  XP_CORRECT: 500,
  XP_WRONG: -50,
  XP_COIN: 10,
  XP_GEM: 50,
  DILEMMA_SCORE_STEP: 450,
  SPAWN_INTERVAL_BASE: 1150,
  SPAWN_INTERVAL_MIN: 560,
  SPAWN_DIFFICULTY_SCORE: 4500,
  MAGNET_PULL: 0.10,
  MAGNET_RANGE_P: 0.55,
  SLIDE_DURATION_TICKS: 26,
  POWER_DURATION: { shield: 9000, speed: 6000, magnet: 8000, slow: 6000, jetpack: 7000 },
  POWER_MAX_STACK: 3,
  RANKING_MAX_VISIBLE: 12
};

const FIXED_DT = 1000 / 60;
const STORAGE_KEY_STATE = 'abr_v2_state';
const STORAGE_KEY_RANKING = 'abr_v2_ranking';
const DYNAMIC_I18N_SKIP = new Set(['menu-player-level']);


/* =====================================================================
   2. DICIONÁRIO DE INTERNACIONALIZAÇÃO
   ===================================================================== */

const I18N = {
  pt: {
    'loading.tip': 'Dica: contar para um adulto de confiança não é "dedurar" — é coragem.',
    'loading.status': 'Carregando recursos do jogo…',
    'loading.credits': 'Um projeto educativo sobre prevenção ao bullying',
    'menu.level': 'Nível {n}',
    'menu.title.line1': 'ANTI-BULLYING',
    'menu.title.line2': 'RUNNER',
    'menu.subtitle': 'Corra. Decida. Faça a diferença.',
    'menu.play': 'JOGAR',
    'menu.shop': 'LOJA',
    'menu.ranking': 'TOP RUN',
    'menu.settings': 'CONFIGURAÇÕES',
    'menu.howto': 'COMO JOGAR',
    'menu.footer': 'v2.0 ULTRA — Movimente-se, decida com empatia.',
    'howto.title': 'Como Jogar',
    'howto.movement.title': 'Movimento',
    'howto.movement.desc': 'Mova-se entre as 3 pistas, pule trens e deslize por baixo de obstáculos.',
    'howto.powers.title': 'Poderes',
    'howto.power.shield': 'Escudo — protege de uma colisão',
    'howto.power.speed': 'Velocidade — acelera e multiplica XP',
    'howto.power.magnet': 'Ímã — atrai moedas e gemas',
    'howto.power.slow': 'Lentidão — facilita os desvios',
    'howto.power.jetpack': 'Jetpack — voe sobre as pistas',
    'howto.mobile.title': 'No Celular',
    'howto.mobile.desc': 'Deslize para os lados para trocar de pista, para cima para pular e para baixo para escorregar. Use os botões de poder na tela.',
    'howto.dilemmas.title': 'Dilemas',
    'howto.dilemmas.desc': 'De tempos em tempos o jogo pausa e mostra uma situação real de bullying. Escolha a atitude mais empática para ganhar XP.',
    'shop.title': 'Loja',
    'shop.tab.skins': 'Vestes',
    'shop.tab.powerups': 'Power-ups',
    'shop.tab.themes': 'Temas',
    'shop.buy': 'Comprar',
    'shop.equip': 'Equipar',
    'shop.equipped': 'Equipado',
    'shop.owned': 'Adquirido',
    'shop.level': 'Nível',
    'shop.maxlevel': 'MÁXIMO',
    'shop.startCharges': 'cargas iniciais por corrida',
    'settings.title': 'Configurações',
    'settings.name.title': 'Nome do Jogador',
    'settings.name.save': 'Salvar',
    'settings.name.saved': 'Nome salvo!',
    'settings.lang.title': 'Idioma',
    'settings.theme.title': 'Tema Visual',
    'settings.theme.arcade': 'Arcade',
    'settings.theme.forest': 'Floresta',
    'settings.theme.ocean': 'Oceano',
    'settings.theme.sunset': 'Pôr do Sol',
    'settings.audio.title': 'Áudio',
    'settings.audio.music': 'Música',
    'settings.audio.sfx': 'Efeitos Sonoros',
    'settings.reset.title': 'Dados',
    'settings.reset.desc': 'Apagar todo o progresso salvo neste dispositivo (moedas, gemas, nível e ranking).',
    'settings.reset.button': 'Apagar Progresso',
    'settings.reset.confirm': 'Tem certeza? Essa ação não pode ser desfeita.',
    'ranking.title': 'Top Run',
    'ranking.empty': 'Ninguém correu ainda. Seja o primeiro do Top Run!',
    'game.score': 'PONTOS',
    'login.title': 'Bem-vindo(a)!',
    'login.desc': 'Como podemos te chamar nesta corrida?',
    'login.confirm': 'Começar',
    'login.placeholder': 'Seu nome',
    'dilemma.tag': 'DILEMA',
    'dilemma.continue': 'Continuar Corrida',
    'dilemma.correct': 'Resposta certa! +{xp} XP',
    'dilemma.incorrect': 'Não foi a melhor escolha. {xp} XP e uma vida perdida.',
    'pause.title': 'Pausado',
    'pause.resume': 'Continuar',
    'pause.restart': 'Reiniciar',
    'pause.settings': 'Configurações',
    'pause.exit': 'Sair para o Menu',
    'gameover.title': 'Fim de Jogo',
    'gameover.score': 'Pontuação',
    'gameover.xp': 'XP Ganho',
    'gameover.coins': 'Moedas',
    'gameover.gems': 'Gemas',
    'gameover.newrecord': '🎉 Novo Recorde Pessoal!',
    'gameover.retry': 'Correr de Novo',
    'gameover.menu': 'Voltar ao Menu',
    'levelup.text': 'Nível {n} Alcançado!',
    'category.theft': 'ROUBO',
    'category.gossip': 'FOFOCA',
    'category.exclusion': 'EXCLUSÃO',
    'category.cyber': 'CYBERBULLYING',
    'category.aggression': 'AGRESSÃO',
    'category.pressure': 'PRESSÃO'
  },
  en: {
    'loading.tip': 'Tip: telling a trusted adult isn\'t "snitching" — it\'s courage.',
    'loading.status': 'Loading game assets…',
    'loading.credits': 'An educational project about bullying prevention',
    'menu.level': 'Level {n}',
    'menu.title.line1': 'ANTI-BULLYING',
    'menu.title.line2': 'RUNNER',
    'menu.subtitle': 'Run. Decide. Make a difference.',
    'menu.play': 'PLAY',
    'menu.shop': 'SHOP',
    'menu.ranking': 'TOP RUN',
    'menu.settings': 'SETTINGS',
    'menu.howto': 'HOW TO PLAY',
    'menu.footer': 'v2.0 ULTRA — Move forward, decide with empathy.',
    'howto.title': 'How To Play',
    'howto.movement.title': 'Movement',
    'howto.movement.desc': 'Move between the 3 lanes, jump over trains and slide under obstacles.',
    'howto.powers.title': 'Powers',
    'howto.power.shield': 'Shield — protects from one collision',
    'howto.power.speed': 'Speed — accelerates and multiplies XP',
    'howto.power.magnet': 'Magnet — attracts coins and gems',
    'howto.power.slow': 'Slow-mo — makes dodging easier',
    'howto.power.jetpack': 'Jetpack — fly above the lanes',
    'howto.mobile.title': 'On Mobile',
    'howto.mobile.desc': 'Swipe sideways to switch lanes, swipe up to jump and down to slide. Use the power buttons on screen.',
    'howto.dilemmas.title': 'Dilemmas',
    'howto.dilemmas.desc': 'From time to time the game pauses to show a real bullying situation. Pick the most empathetic action to earn XP.',
    'shop.title': 'Shop',
    'shop.tab.skins': 'Skins',
    'shop.tab.powerups': 'Power-ups',
    'shop.tab.themes': 'Themes',
    'shop.buy': 'Buy',
    'shop.equip': 'Equip',
    'shop.equipped': 'Equipped',
    'shop.owned': 'Owned',
    'shop.level': 'Level',
    'shop.maxlevel': 'MAX',
    'shop.startCharges': 'starting charges per run',
    'settings.title': 'Settings',
    'settings.name.title': 'Player Name',
    'settings.name.save': 'Save',
    'settings.name.saved': 'Name saved!',
    'settings.lang.title': 'Language',
    'settings.theme.title': 'Visual Theme',
    'settings.theme.arcade': 'Arcade',
    'settings.theme.forest': 'Forest',
    'settings.theme.ocean': 'Ocean',
    'settings.theme.sunset': 'Sunset',
    'settings.audio.title': 'Audio',
    'settings.audio.music': 'Music',
    'settings.audio.sfx': 'Sound Effects',
    'settings.reset.title': 'Data',
    'settings.reset.desc': 'Erase all progress saved on this device (coins, gems, level and ranking).',
    'settings.reset.button': 'Erase Progress',
    'settings.reset.confirm': 'Are you sure? This cannot be undone.',
    'ranking.title': 'Top Run',
    'ranking.empty': 'No one has run yet. Be the first on the Top Run!',
    'game.score': 'SCORE',
    'login.title': 'Welcome!',
    'login.desc': 'What should we call you in this run?',
    'login.confirm': 'Start',
    'login.placeholder': 'Your name',
    'dilemma.tag': 'DILEMMA',
    'dilemma.continue': 'Continue Run',
    'dilemma.correct': 'Right answer! +{xp} XP',
    'dilemma.incorrect': 'Not the best choice. {xp} XP and a life lost.',
    'pause.title': 'Paused',
    'pause.resume': 'Resume',
    'pause.restart': 'Restart',
    'pause.settings': 'Settings',
    'pause.exit': 'Exit to Menu',
    'gameover.title': 'Game Over',
    'gameover.score': 'Score',
    'gameover.xp': 'XP Earned',
    'gameover.coins': 'Coins',
    'gameover.gems': 'Gems',
    'gameover.newrecord': '🎉 New Personal Record!',
    'gameover.retry': 'Run Again',
    'gameover.menu': 'Back to Menu',
    'levelup.text': 'Level {n} Reached!',
    'category.theft': 'THEFT',
    'category.gossip': 'GOSSIP',
    'category.exclusion': 'EXCLUSION',
    'category.cyber': 'CYBERBULLYING',
    'category.aggression': 'AGGRESSION',
    'category.pressure': 'PEER PRESSURE'
  },
  es: {
    'loading.tip': 'Consejo: contarle a un adulto de confianza no es "acusar" — es valentía.',
    'loading.status': 'Cargando recursos del juego…',
    'loading.credits': 'Un proyecto educativo sobre prevención del bullying',
    'menu.level': 'Nivel {n}',
    'menu.title.line1': 'ANTI-BULLYING',
    'menu.title.line2': 'RUNNER',
    'menu.subtitle': 'Corre. Decide. Marca la diferencia.',
    'menu.play': 'JUGAR',
    'menu.shop': 'TIENDA',
    'menu.ranking': 'TOP RUN',
    'menu.settings': 'AJUSTES',
    'menu.howto': 'CÓMO JUGAR',
    'menu.footer': 'v2.0 ULTRA — Avanza, decide con empatía.',
    'howto.title': 'Cómo Jugar',
    'howto.movement.title': 'Movimiento',
    'howto.movement.desc': 'Muévete entre los 3 carriles, salta trenes y deslízate bajo los obstáculos.',
    'howto.powers.title': 'Poderes',
    'howto.power.shield': 'Escudo — protege de una colisión',
    'howto.power.speed': 'Velocidad — acelera y multiplica el XP',
    'howto.power.magnet': 'Imán — atrae monedas y gemas',
    'howto.power.slow': 'Lentitud — facilita esquivar',
    'howto.power.jetpack': 'Jetpack — vuela sobre los carriles',
    'howto.mobile.title': 'En el Celular',
    'howto.mobile.desc': 'Deslizá hacia los lados para cambiar de carril, hacia arriba para saltar y hacia abajo para deslizarte. Usá los botones de poder en pantalla.',
    'howto.dilemmas.title': 'Dilemas',
    'howto.dilemmas.desc': 'De vez en cuando el juego se pausa y muestra una situación real de bullying. Elegí la actitud más empática para ganar XP.',
    'shop.title': 'Tienda',
    'shop.tab.skins': 'Atuendos',
    'shop.tab.powerups': 'Power-ups',
    'shop.tab.themes': 'Temas',
    'shop.buy': 'Comprar',
    'shop.equip': 'Equipar',
    'shop.equipped': 'Equipado',
    'shop.owned': 'Adquirido',
    'shop.level': 'Nivel',
    'shop.maxlevel': 'MÁXIMO',
    'shop.startCharges': 'cargas iniciales por carrera',
    'settings.title': 'Ajustes',
    'settings.name.title': 'Nombre del Jugador',
    'settings.name.save': 'Guardar',
    'settings.name.saved': '¡Nombre guardado!',
    'settings.lang.title': 'Idioma',
    'settings.theme.title': 'Tema Visual',
    'settings.theme.arcade': 'Arcade',
    'settings.theme.forest': 'Bosque',
    'settings.theme.ocean': 'Océano',
    'settings.theme.sunset': 'Atardecer',
    'settings.audio.title': 'Audio',
    'settings.audio.music': 'Música',
    'settings.audio.sfx': 'Efectos de Sonido',
    'settings.reset.title': 'Datos',
    'settings.reset.desc': 'Borrar todo el progreso guardado en este dispositivo (monedas, gemas, nivel y ranking).',
    'settings.reset.button': 'Borrar Progreso',
    'settings.reset.confirm': '¿Estás seguro? Esta acción no se puede deshacer.',
    'ranking.title': 'Top Run',
    'ranking.empty': 'Nadie ha corrido todavía. ¡Sé el primero en el Top Run!',
    'game.score': 'PUNTOS',
    'login.title': '¡Bienvenido(a)!',
    'login.desc': '¿Cómo te llamamos en esta carrera?',
    'login.confirm': 'Comenzar',
    'login.placeholder': 'Tu nombre',
    'dilemma.tag': 'DILEMA',
    'dilemma.continue': 'Continuar Carrera',
    'dilemma.correct': '¡Respuesta correcta! +{xp} XP',
    'dilemma.incorrect': 'No fue la mejor opción. {xp} XP y una vida perdida.',
    'pause.title': 'Pausado',
    'pause.resume': 'Continuar',
    'pause.restart': 'Reiniciar',
    'pause.settings': 'Ajustes',
    'pause.exit': 'Salir al Menú',
    'gameover.title': 'Fin del Juego',
    'gameover.score': 'Puntuación',
    'gameover.xp': 'XP Ganado',
    'gameover.coins': 'Monedas',
    'gameover.gems': 'Gemas',
    'gameover.newrecord': '🎉 ¡Nuevo Récord Personal!',
    'gameover.retry': 'Correr de Nuevo',
    'gameover.menu': 'Volver al Menú',
    'levelup.text': '¡Nivel {n} Alcanzado!',
    'category.theft': 'ROBO',
    'category.gossip': 'CHISME',
    'category.exclusion': 'EXCLUSIÓN',
    'category.cyber': 'CYBERACOSO',
    'category.aggression': 'AGRESIÓN',
    'category.pressure': 'PRESIÓN DE GRUPO'
  }
};

function t(key, vars) {
  const lang = state.settings.lang || 'pt';
  let str = (I18N[lang] && I18N[lang][key]) || (I18N.pt && I18N.pt[key]) || key;
  if (vars) {
    Object.keys(vars).forEach(function (k) {
      str = str.replace('{' + k + '}', vars[k]);
    });
  }
  return str;
}


/* =====================================================================
   3. CONTEÚDO: DILEMAS DE BULLYING (6 CENÁRIOS)
   ===================================================================== */

const DILEMMAS = [
  {
    id: 'theft', icon: '💰', categoryKey: 'category.theft',
    title: { pt: 'Roubo no Refeitório', en: 'Theft at the Cafeteria', es: 'Robo en el Comedor' },
    text: {
      pt: 'Você vê um colega maior forçando outro a entregar o lanche e o dinheiro do almoço. O colega menor parece assustado.',
      en: 'You see an older student forcing a younger one to hand over their lunch and money. The smaller kid looks scared.',
      es: 'Ves a un alumno mayor obligando a otro a entregar su almuerzo y dinero. El más pequeño parece asustado.'
    },
    options: [
      { correct: false, kind: 'harmful', text: { pt: 'Filmar a cena para postar depois', en: 'Film the scene to post it later', es: 'Filmar la escena para publicarla después' } },
      { correct: true, kind: 'good', text: { pt: 'Avisar imediatamente um professor ou funcionário', en: 'Immediately tell a teacher or staff member', es: 'Avisar de inmediato a un profesor o empleado' } },
      { correct: false, kind: 'passive', text: { pt: 'Fingir que não viu e seguir andando', en: 'Pretend you didn\'t see and keep walking', es: 'Fingir que no viste y seguir caminando' } }
    ],
    feedbackCorrect: { pt: 'Procurar um adulto de confiança rapidamente protege a vítima sem te colocar em risco.', en: 'Quickly finding a trusted adult protects the victim without putting you at risk.', es: 'Buscar rápido a un adulto de confianza protege a la víctima sin ponerte en riesgo.' },
    feedbackIncorrect: { pt: 'Ignorar ou gravar sem ajudar permite que o roubo continue. Buscar um adulto é o caminho mais seguro.', en: 'Ignoring or filming without helping lets the theft continue. Finding an adult is the safest path.', es: 'Ignorar o grabar sin ayudar permite que el robo continúe. Buscar un adulto es el camino más seguro.' }
  },
  {
    id: 'gossip', icon: '🗣️', categoryKey: 'category.gossip',
    title: { pt: 'Fofoca Maldosa', en: 'Cruel Gossip', es: 'Chisme Cruel' },
    text: {
      pt: 'Um grupo está inventando e espalhando rumores cruéis sobre uma colega só para humilhá-la na frente da turma.',
      en: 'A group is making up and spreading cruel rumors about a classmate just to humiliate her in front of everyone.',
      es: 'Un grupo está inventando y difundiendo rumores crueles sobre una compañera solo para humillarla frente a todos.'
    },
    options: [
      { correct: false, kind: 'harmful', text: { pt: 'Repassar a fofoca para mais pessoas, "só por curiosidade"', en: 'Pass the gossip on to more people, "just out of curiosity"', es: 'Pasar el chisme a más personas, "solo por curiosidad"' } },
      { correct: false, kind: 'passive', text: { pt: 'Rir junto para não ficar de fora do grupo', en: 'Laugh along so you\'re not left out of the group', es: 'Reírte también para no quedar fuera del grupo' } },
      { correct: true, kind: 'good', text: { pt: 'Dizer ao grupo que aquilo é injusto e parar de espalhar', en: 'Tell the group it\'s unfair and stop spreading it', es: 'Decirle al grupo que es injusto y dejar de difundirlo' } }
    ],
    feedbackCorrect: { pt: 'Recusar-se a propagar fofocas e dizer que é injusto ajuda a interromper o ciclo do boato.', en: 'Refusing to spread gossip and calling it unfair helps stop the rumor cycle.', es: 'Negarte a difundir chismes y decir que es injusto ayuda a detener el ciclo del rumor.' },
    feedbackIncorrect: { pt: 'Espalhar ou rir da fofoca machuca ainda mais quem é o alvo.', en: 'Spreading or laughing at the gossip hurts the target even more.', es: 'Difundir o reírse del chisme lastima aún más al objetivo.' }
  },
  {
    id: 'exclusion', icon: '🚫', categoryKey: 'category.exclusion',
    title: { pt: 'Deixado de Fora', en: 'Left Out', es: 'Dejado de Lado' },
    text: {
      pt: 'Toda vez que um colega tenta se sentar com o grupo no intervalo, todos se levantam e vão embora de propósito.',
      en: 'Every time a classmate tries to sit with the group at break, everyone gets up and leaves on purpose.',
      es: 'Cada vez que un compañero intenta sentarse con el grupo en el recreo, todos se levantan y se van a propósito.'
    },
    options: [
      { correct: false, kind: 'passive', text: { pt: 'Não fazer nada, afinal não é da sua conta', en: 'Do nothing, it\'s not your business anyway', es: 'No hacer nada, al fin y al cabo no es tu asunto' } },
      { correct: true, kind: 'good', text: { pt: 'Convidar o colega para sentar com você', en: 'Invite the classmate to sit with you', es: 'Invitar al compañero a sentarse con vos' } },
      { correct: false, kind: 'harmful', text: { pt: 'Combinar com o grupo de continuar excluindo', en: 'Agree with the group to keep excluding them', es: 'Acordar con el grupo seguir excluyéndolo' } }
    ],
    feedbackCorrect: { pt: 'Um simples convite para incluir alguém pode mudar completamente o dia dessa pessoa.', en: 'A simple invitation to include someone can completely change their day.', es: 'Una simple invitación para incluir a alguien puede cambiar por completo su día.' },
    feedbackIncorrect: { pt: 'Excluir alguém de propósito machuca, mesmo sem palavras ou agressão física.', en: 'Excluding someone on purpose hurts, even without words or physical aggression.', es: 'Excluir a alguien a propósito duele, incluso sin palabras ni agresión física.' }
  },
  {
    id: 'cyber', icon: '📱', categoryKey: 'category.cyber',
    title: { pt: 'Grupo de Mensagens Cruel', en: 'Cruel Message Group', es: 'Grupo de Mensajes Cruel' },
    text: {
      pt: 'Em um grupo de chat da turma, várias pessoas estão zoando e mandando memes ofensivos sobre um colega.',
      en: 'In a class chat group, several people are mocking and sending offensive memes about a classmate.',
      es: 'En un grupo de chat de la clase, varias personas se burlan y envían memes ofensivos sobre un compañero.'
    },
    options: [
      { correct: false, kind: 'harmful', text: { pt: 'Mandar mais memes para "entrar na brincadeira"', en: 'Send more memes to "join in the fun"', es: 'Enviar más memes para "seguir la broma"' } },
      { correct: true, kind: 'good', text: { pt: 'Sair do grupo, denunciar as mensagens e avisar um adulto', en: 'Leave the group, report the messages and tell an adult', es: 'Salir del grupo, reportar los mensajes y avisar a un adulto' } },
      { correct: false, kind: 'passive', text: { pt: 'Só ler em silêncio sem responder nada', en: 'Just read silently without responding', es: 'Solo leer en silencio sin responder nada' } }
    ],
    feedbackCorrect: { pt: 'Denunciar e avisar um adulto de confiança ajuda a interromper o cyberbullying antes que piore.', en: 'Reporting it and telling a trusted adult helps stop cyberbullying before it gets worse.', es: 'Reportar y avisar a un adulto de confianza ayuda a detener el ciberacoso antes de que empeore.' },
    feedbackIncorrect: { pt: 'Participar ou apenas observar em silêncio permite que o cyberbullying continue.', en: 'Joining in or just silently watching lets cyberbullying continue.', es: 'Participar o solo observar en silencio permite que el ciberacoso continúe.' }
  },
  {
    id: 'aggression', icon: '✋', categoryKey: 'category.aggression',
    title: { pt: 'Empurrão no Corredor', en: 'Shoved in the Hallway', es: 'Empujón en el Pasillo' },
    text: {
      pt: 'Você vê um colega sendo empurrado e provocado com tapas por outro estudante mais forte, num corredor vazio.',
      en: 'You see a classmate being shoved and slapped around by a stronger student in an empty hallway.',
      es: 'Ves a un compañero siendo empujado y golpeado por un estudiante más fuerte, en un pasillo vacío.'
    },
    options: [
      { correct: false, kind: 'passive', text: { pt: 'Desviar o olhar e continuar andando rápido', en: 'Look away and keep walking quickly', es: 'Mirar hacia otro lado y seguir caminando rápido' } },
      { correct: false, kind: 'harmful', text: { pt: 'Entrar no meio e tentar bater de volta', en: 'Jump in and try to fight back', es: 'Meterte en medio e intentar devolver los golpes' } },
      { correct: true, kind: 'good', text: { pt: 'Gritar por ajuda e chamar um funcionário da escola imediatamente', en: 'Shout for help and call a school staff member immediately', es: 'Gritar pidiendo ayuda y llamar a un empleado de la escuela de inmediato' } }
    ],
    feedbackCorrect: { pt: 'Pedir ajuda de um adulto rapidamente é mais seguro e eficaz do que reagir com violência.', en: 'Quickly asking an adult for help is safer and more effective than reacting with violence.', es: 'Pedir ayuda a un adulto rápidamente es más seguro y eficaz que reaccionar con violencia.' },
    feedbackIncorrect: { pt: 'Ignorar coloca a vítima em risco, e responder com violência pode piorar tudo. Peça ajuda.', en: 'Ignoring it puts the victim at risk, and fighting back can make it worse. Ask for help.', es: 'Ignorarlo pone en riesgo a la víctima, y responder con violencia puede empeorarlo todo. Pedí ayuda.' }
  },
  {
    id: 'pressure', icon: '👥', categoryKey: 'category.pressure',
    title: { pt: 'Pressão do Grupo', en: 'Peer Pressure', es: 'Presión de Grupo' },
    text: {
      pt: 'Seus amigos dizem: "ou você ajuda a gente a zoar o novato, ou para de andar com a gente".',
      en: 'Your friends say: "either you help us mock the new kid, or stop hanging out with us".',
      es: 'Tus amigos dicen: "o nos ayudás a burlarte del nuevo, o dejás de andar con nosotros".'
    },
    options: [
      { correct: false, kind: 'harmful', text: { pt: 'Participar da zoação para não perder o grupo', en: 'Join the mocking so you don\'t lose the group', es: 'Participar de la burla para no perder al grupo' } },
      { correct: true, kind: 'good', text: { pt: 'Dizer "não" e se afastar desse tipo de atitude', en: 'Say "no" and walk away from that kind of attitude', es: 'Decir "no" y alejarte de ese tipo de actitud' } },
      { correct: false, kind: 'passive', text: { pt: 'Ficar quieto e fingir que não ouviu nada', en: 'Stay quiet and pretend you didn\'t hear anything', es: 'Quedarte callado y fingir que no escuchaste nada' } }
    ],
    feedbackCorrect: { pt: 'Dizer não a atitudes de bullying, mesmo sob pressão dos amigos, é um ato de coragem.', en: 'Saying no to bullying, even under pressure from friends, is an act of courage.', es: 'Decir no al bullying, incluso bajo presión de amigos, es un acto de valentía.' },
    feedbackIncorrect: { pt: 'Ceder à pressão ou ficar em silêncio ajuda o bullying a continuar.', en: 'Giving in to pressure or staying silent helps bullying continue.', es: 'Ceder a la presión o quedarte en silencio ayuda a que el bullying continúe.' }
  }
];

let dilemmaQueue = [];

function nextDilemma() {
  if (dilemmaQueue.length === 0) {
    dilemmaQueue = DILEMMAS.map(function (d) { return d.id; });
    shuffleArray(dilemmaQueue);
  }
  const id = dilemmaQueue.pop();
  return DILEMMAS.find(function (d) { return d.id === id; });
}


/* =====================================================================
   4. CONTEÚDO: ITENS DA LOJA
   ===================================================================== */

const SKINS = [
  { id: 'default', icon: '🛡️', tint: '#c7d6ff', accent: '#7a8bd6', cost: { coins: 0 },
    name: { pt: 'Cavaleiro Padrão', en: 'Default Knight', es: 'Caballero Estándar' },
    desc: { pt: 'O visual clássico de quem está começando a corrida.', en: 'The classic look for runners just starting out.', es: 'El look clásico para quienes empiezan la carrera.' } },
  { id: 'golden', icon: '👑', tint: '#ffd24c', accent: '#b8860b', cost: { coins: 500 },
    name: { pt: 'Cavaleiro Dourado', en: 'Golden Knight', es: 'Caballero Dorado' },
    desc: { pt: 'Armadura reluzente para quem já é veterano.', en: 'Shiny armor for veteran runners.', es: 'Armadura brillante para corredores veteranos.' } },
  { id: 'ninja', icon: '🥷', tint: '#3a3a4a', accent: '#ff2e9a', cost: { coins: 800 },
    name: { pt: 'Ninja da Empatia', en: 'Empathy Ninja', es: 'Ninja de la Empatía' },
    desc: { pt: 'Rápido, silencioso e sempre pronto para ajudar.', en: 'Fast, silent and always ready to help.', es: 'Rápido, silencioso y siempre listo para ayudar.' } },
  { id: 'astro', icon: '🧑‍🚀', tint: '#9adfff', accent: '#ffffff', cost: { gems: 40 },
    name: { pt: 'Astronauta', en: 'Astronaut', es: 'Astronauta' },
    desc: { pt: 'Direto das estrelas para espalhar respeito.', en: 'Straight from the stars to spread respect.', es: 'Directo de las estrellas para difundir respeto.' } },
  { id: 'robot', icon: '🤖', tint: '#b0b0b8', accent: '#00e5ff', cost: { coins: 1200 },
    name: { pt: 'Robô Guardião', en: 'Guardian Robot', es: 'Robot Guardián' },
    desc: { pt: 'Processamento lógico: bullying não é aceitável.', en: 'Logical conclusion: bullying is never okay.', es: 'Conclusión lógica: el bullying nunca está bien.' } },
  { id: 'princess', icon: '👸', tint: '#ff8fc6', accent: '#ffe600', cost: { gems: 60 },
    name: { pt: 'Guerreira Real', en: 'Royal Warrior', es: 'Guerrera Real' },
    desc: { pt: 'Coragem e gentileza no mesmo pacote.', en: 'Courage and kindness in one package.', es: 'Valentía y bondad en un mismo paquete.' } }
];

const THEMES = [
  { id: 'arcade', icon: '🕹️', cost: { coins: 0 },
    name: { pt: 'Arcade', en: 'Arcade', es: 'Arcade' },
    desc: { pt: 'Neon synthwave clássico.', en: 'Classic neon synthwave.', es: 'Neón synthwave clásico.' } },
  { id: 'forest', icon: '🌲', cost: { coins: 600 },
    name: { pt: 'Floresta', en: 'Forest', es: 'Bosque' },
    desc: { pt: 'Corrida em meio à natureza.', en: 'A run through nature.', es: 'Una carrera entre la naturaleza.' } },
  { id: 'ocean', icon: '🌊', cost: { gems: 35 },
    name: { pt: 'Oceano', en: 'Ocean', es: 'Océano' },
    desc: { pt: 'Tons profundos do mar.', en: 'Deep tones of the sea.', es: 'Tonos profundos del mar.' } },
  { id: 'sunset', icon: '🌅', cost: { coins: 900 },
    name: { pt: 'Pôr do Sol', en: 'Sunset', es: 'Atardecer' },
    desc: { pt: 'Cores quentes do entardecer.', en: 'Warm evening colors.', es: 'Colores cálidos del atardecer.' } }
];

const POWERUP_SHOP_ITEMS = [
  { id: 'shield', icon: '🛡️', name: { pt: 'Escudo', en: 'Shield', es: 'Escudo' } },
  { id: 'speed', icon: '⚡', name: { pt: 'Velocidade', en: 'Speed', es: 'Velocidad' } },
  { id: 'magnet', icon: '🧲', name: { pt: 'Ímã', en: 'Magnet', es: 'Imán' } },
  { id: 'slow', icon: '🌀', name: { pt: 'Lentidão', en: 'Slow-mo', es: 'Lentitud' } },
  { id: 'jetpack', icon: '🚀', name: { pt: 'Jetpack', en: 'Jetpack', es: 'Jetpack' } }
];

const POWERUP_UPGRADE_COSTS = {
  shield: [{ coins: 300 }, { coins: 700 }, { gems: 30 }],
  speed: [{ coins: 250 }, { coins: 600 }, { gems: 25 }],
  magnet: [{ coins: 280 }, { coins: 650 }, { gems: 28 }],
  slow: [{ coins: 260 }, { coins: 620 }, { gems: 26 }],
  jetpack: [{ coins: 400 }, { coins: 900 }, { gems: 45 }]
};


/* =====================================================================
   5. ESTADO E PERSISTÊNCIA
   ===================================================================== */

function defaultState() {
  return {
    playerName: '',
    hasLoggedIn: false,
    coins: 150,
    gems: 5,
    totalXP: 0,
    bestScore: 0,
    ownedSkins: ['default'],
    equippedSkin: 'default',
    ownedThemes: ['arcade'],
    powerLevels: { shield: 0, speed: 0, magnet: 0, slow: 0, jetpack: 0 },
    settings: { lang: 'pt', theme: 'arcade', musicVolume: 70, sfxVolume: 80, muted: false }
  };
}

let state = defaultState();

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_STATE);
    if (raw) {
      const parsed = JSON.parse(raw);
      state = Object.assign(defaultState(), parsed);
      state.settings = Object.assign(defaultState().settings, parsed.settings || {});
      state.powerLevels = Object.assign(defaultState().powerLevels, parsed.powerLevels || {});
    }
  } catch (e) {
    state = defaultState();
  }
}

function saveState() {
  try {
    localStorage.setItem(STORAGE_KEY_STATE, JSON.stringify(state));
  } catch (e) { /* armazenamento indisponível — ignora silenciosamente */ }
}

function loadRanking() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_RANKING);
    return raw ? JSON.parse(raw) : {};
  } catch (e) {
    return {};
  }
}

function saveRanking(rankingObj) {
  try {
    localStorage.setItem(STORAGE_KEY_RANKING, JSON.stringify(rankingObj));
  } catch (e) { /* ignora */ }
}

function submitScore(name, score, level) {
  if (!name) name = 'Jogador';
  const ranking = loadRanking();
  const existing = ranking[name];
  if (!existing || score > existing.score) {
    ranking[name] = { score: score, level: level, date: Date.now() };
    saveRanking(ranking);
    return true;
  }
  return false;
}

function getSortedRanking() {
  const ranking = loadRanking();
  return Object.keys(ranking).map(function (name) {
    return { name: name, score: ranking[name].score, level: ranking[name].level };
  }).sort(function (a, b) { return b.score - a.score; });
}

function resetAllProgress() {
  try {
    localStorage.removeItem(STORAGE_KEY_STATE);
    localStorage.removeItem(STORAGE_KEY_RANKING);
  } catch (e) { /* ignora */ }
  state = defaultState();
  location.reload();
}


/* =====================================================================
   6. ÁUDIO (WEB AUDIO API)
   ===================================================================== */

let audioCtx = null;
let masterGain = null;
let musicGainNode = null;
let sfxGainNode = null;
let musicTimer = null;
let musicStep = 0;

function ensureAudio() {
  if (!audioCtx) {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    audioCtx = new AC();
    masterGain = audioCtx.createGain();
    masterGain.connect(audioCtx.destination);
    musicGainNode = audioCtx.createGain();
    musicGainNode.connect(masterGain);
    sfxGainNode = audioCtx.createGain();
    sfxGainNode.connect(masterGain);
    applyAudioVolumes();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume().catch(function () {});
  }
}

function applyAudioVolumes() {
  if (!audioCtx) return;
  const muted = state.settings.muted;
  masterGain.gain.value = muted ? 0 : 1;
  musicGainNode.gain.value = (state.settings.musicVolume / 100) * 0.5;
  sfxGainNode.gain.value = state.settings.sfxVolume / 100;
}

function playTone(freq, type, duration, destGain, startOffset, peakGain) {
  if (!audioCtx) return;
  startOffset = startOffset || 0;
  peakGain = peakGain === undefined ? 0.3 : peakGain;
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  const now = audioCtx.currentTime + startOffset;
  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.exponentialRampToValueAtTime(peakGain, now + 0.015);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
  osc.connect(gain);
  gain.connect(destGain);
  osc.start(now);
  osc.stop(now + duration + 0.02);
}

function playSweep(freqStart, freqEnd, type, duration, destGain, peakGain) {
  if (!audioCtx) return;
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.type = type;
  const now = audioCtx.currentTime;
  osc.frequency.setValueAtTime(freqStart, now);
  osc.frequency.exponentialRampToValueAtTime(Math.max(1, freqEnd), now + duration);
  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.exponentialRampToValueAtTime(peakGain || 0.3, now + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
  osc.connect(gain);
  gain.connect(destGain);
  osc.start(now);
  osc.stop(now + duration + 0.02);
}

function playNoise(duration, destGain, peakGain) {
  if (!audioCtx) return;
  const bufferSize = Math.floor(audioCtx.sampleRate * duration);
  const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize);
  }
  const noise = audioCtx.createBufferSource();
  noise.buffer = buffer;
  const gain = audioCtx.createGain();
  gain.gain.value = peakGain || 0.3;
  noise.connect(gain);
  gain.connect(destGain);
  noise.start();
}

function sfxJump() { ensureAudio(); if (sfxGainNode) playSweep(280, 620, 'square', 0.18, sfxGainNode, 0.22); }
function sfxCollect() { ensureAudio(); if (sfxGainNode) playTone(880, 'sine', 0.12, sfxGainNode, 0, 0.25); }
function sfxGem() { ensureAudio(); if (sfxGainNode) { playTone(1046, 'sine', 0.1, sfxGainNode, 0, 0.22); playTone(1318, 'sine', 0.14, sfxGainNode, 0.06, 0.2); } }
function sfxCorrect() { ensureAudio(); if (sfxGainNode) { playTone(523, 'triangle', 0.12, sfxGainNode, 0, 0.25); playTone(659, 'triangle', 0.12, sfxGainNode, 0.1, 0.25); playTone(880, 'triangle', 0.2, sfxGainNode, 0.2, 0.25); } }
function sfxWrong() { ensureAudio(); if (sfxGainNode) playSweep(300, 90, 'sawtooth', 0.35, sfxGainNode, 0.22); }
function sfxCollision() { ensureAudio(); if (sfxGainNode) { playNoise(0.22, sfxGainNode, 0.35); playTone(80, 'square', 0.18, sfxGainNode, 0, 0.3); } }
function sfxPowerup() { ensureAudio(); if (sfxGainNode) playSweep(220, 900, 'square', 0.3, sfxGainNode, 0.2); }
function sfxClick() { ensureAudio(); if (sfxGainNode) playTone(700, 'square', 0.05, sfxGainNode, 0, 0.12); }
function sfxLevelUp() { ensureAudio(); if (sfxGainNode) { [523, 659, 784, 1046].forEach(function (f, i) { playTone(f, 'triangle', 0.18, sfxGainNode, i * 0.09, 0.25); }); } }
function sfxShieldBreak() { ensureAudio(); if (sfxGainNode) { playNoise(0.18, sfxGainNode, 0.25); playTone(1200, 'sine', 0.1, sfxGainNode, 0, 0.2); } }

const MUSIC_BASS = [110, 110, 130.81, 98, 110, 110, 146.83, 130.81];
const MUSIC_ARP = [440, 523, 659, 523, 392, 523, 659, 783.99];

function musicTick() {
  if (!audioCtx || !musicGainNode) return;
  const bassFreq = MUSIC_BASS[musicStep % MUSIC_BASS.length];
  const arpFreq = MUSIC_ARP[musicStep % MUSIC_ARP.length];
  playTone(bassFreq, 'triangle', 0.32, musicGainNode, 0, 0.5);
  if (musicStep % 2 === 0) {
    playTone(arpFreq, 'sine', 0.22, musicGainNode, 0.05, 0.18);
  }
  if (musicStep % 4 === 2) {
    playNoise(0.06, musicGainNode, 0.12);
  }
  musicStep++;
}

function startMusic() {
  ensureAudio();
  if (!audioCtx || musicTimer) return;
  musicStep = 0;
  musicTimer = setInterval(musicTick, 260);
}

function stopMusic() {
  if (musicTimer) {
    clearInterval(musicTimer);
    musicTimer = null;
  }
}


/* =====================================================================
   7. UTILITÁRIOS GERAIS
   ===================================================================== */

function clamp(v, min, max) { return Math.max(min, Math.min(max, v)); }
function lerp(a, b, t) { return a + (b - a) * t; }
function randRange(a, b) { return a + Math.random() * (b - a); }
function randInt(a, b) { return Math.floor(randRange(a, b + 1)); }

function shuffleArray(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const tmp = arr[i]; arr[i] = arr[j]; arr[j] = tmp;
  }
  return arr;
}

function $(id) { return document.getElementById(id); }

function formatCost(cost) {
  const parts = [];
  if (cost.coins) parts.push('🪙 ' + cost.coins);
  if (cost.gems) parts.push('💎 ' + cost.gems);
  if (!cost.coins && !cost.gems) parts.push('—');
  return parts.join('  ');
}

function canAfford(cost) {
  return state.coins >= (cost.coins || 0) && state.gems >= (cost.gems || 0);
}

function spendCurrency(cost) {
  state.coins -= (cost.coins || 0);
  state.gems -= (cost.gems || 0);
  updateCurrencyDisplays();
}


/* =====================================================================
   8. INTERNACIONALIZAÇÃO — APLICAÇÃO NO DOM
   ===================================================================== */

function applyI18nAll() {
  document.documentElement.lang = state.settings.lang;
  document.querySelectorAll('[data-i18n]').forEach(function (el) {
    if (DYNAMIC_I18N_SKIP.has(el.id)) return;
    el.textContent = t(el.getAttribute('data-i18n'));
  });
  $('input-login-name') && ($('input-login-name').placeholder = t('login.placeholder'));
  updatePlayerLevelLabel();
  renderShopSkins();
  renderShopPowerups();
  renderShopThemes();
  renderRanking();
  document.querySelectorAll('#lang-options .settings-option').forEach(function (btn) {
    btn.classList.toggle('active', btn.getAttribute('data-lang') === state.settings.lang);
  });
}

function updatePlayerLevelLabel() {
  const level = computeLevel(state.totalXP);
  const el = $('menu-player-level');
  if (el) el.textContent = t('menu.level', { n: level });
}


/* =====================================================================
   9. NAVEGAÇÃO ENTRE TELAS
   ===================================================================== */

function showScreen(id) {
  document.querySelectorAll('.screen').forEach(function (s) {
    if (s.id === id) {
      s.classList.remove('hidden');
      s.classList.add('active');
    } else {
      s.classList.add('hidden');
      s.classList.remove('active');
    }
  });
  const toolbar = $('global-toolbar');
  if (toolbar) toolbar.classList.toggle('hidden', id === 'screen-loading');
}

function bindNavigation() {
  $('btn-play').addEventListener('click', function () { sfxClick(); startNewRun(); });
  $('btn-shop').addEventListener('click', function () {
    sfxClick();
    renderShopSkins();
    renderShopPowerups();
    renderShopThemes();
    showScreen('screen-shop');
  });
  $('btn-ranking').addEventListener('click', function () { sfxClick(); renderRanking(); showScreen('screen-ranking'); });
  $('btn-settings').addEventListener('click', function () { sfxClick(); refreshSettingsScreen(); showScreen('screen-settings'); });
  $('btn-howto').addEventListener('click', function () { sfxClick(); showScreen('screen-howto'); });
  $('btn-howto-back').addEventListener('click', function () { sfxClick(); showScreen('screen-menu'); });
  $('btn-shop-back').addEventListener('click', function () { sfxClick(); showScreen('screen-menu'); });
  $('btn-settings-back').addEventListener('click', function () { sfxClick(); showScreen('screen-menu'); });
  $('btn-ranking-back').addEventListener('click', function () { sfxClick(); showScreen('screen-menu'); });
  $('btn-edit-name').addEventListener('click', function () { sfxClick(); refreshSettingsScreen(); showScreen('screen-settings'); });

  $('btn-mute').addEventListener('click', function () {
    ensureAudio();
    state.settings.muted = !state.settings.muted;
    $('btn-mute').setAttribute('data-state', state.settings.muted ? 'muted' : 'unmuted');
    applyAudioVolumes();
    saveState();
  });

  $('btn-fullscreen').addEventListener('click', function () {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen && document.documentElement.requestFullscreen().catch(function () {});
    } else {
      document.exitFullscreen && document.exitFullscreen().catch(function () {});
    }
  });
}


/* =====================================================================
   10. TELA: LOADING
   ===================================================================== */

function runLoadingSequence(onDone) {
  const fill = $('loading-bar-fill');
  const percentLabel = $('loading-bar-percent');
  const statusLabel = $('loading-status');
  const tipLabel = $('loading-tip');
  const tips = [t('loading.tip')];
  let progress = 0;

  const interval = setInterval(function () {
    progress += randRange(6, 14);
    if (progress >= 100) {
      progress = 100;
      clearInterval(interval);
      setTimeout(onDone, 280);
    }
    fill.style.width = progress + '%';
    percentLabel.textContent = Math.floor(progress) + '%';
    $('loading-progressbar').setAttribute('aria-valuenow', String(Math.floor(progress)));
  }, 140);

  statusLabel.textContent = t('loading.status');
  tipLabel.textContent = tips[0];
}


/* =====================================================================
   11. TELA: MENU
   ===================================================================== */

function refreshMenuScreen() {
  $('menu-player-name').textContent = state.playerName || 'Jogador';
  updatePlayerLevelLabel();
  updateCurrencyDisplays();
  updateMenuXPBar();
}

function updateCurrencyDisplays() {
  ['menu-coins-amount', 'shop-coins-amount'].forEach(function (id) { var el = $(id); if (el) el.textContent = Math.floor(state.coins); });
  ['menu-gems-amount', 'shop-gems-amount'].forEach(function (id) { var el = $(id); if (el) el.textContent = Math.floor(state.gems); });
  var hudCoins = $('hud-coins'); if (hudCoins) hudCoins.textContent = Math.floor(state.coins);
  var hudGems = $('hud-gems'); if (hudGems) hudGems.textContent = Math.floor(state.gems);
}

function computeLevel(totalXP) {
  const xp = clamp(totalXP, 0, CONFIG.XP_PER_LEVEL * CONFIG.MAX_LEVEL);
  return Math.min(CONFIG.MAX_LEVEL, Math.floor(xp / CONFIG.XP_PER_LEVEL) + 1);
}

function updateMenuXPBar() {
  const level = computeLevel(state.totalXP);
  const xpIntoLevel = clamp(state.totalXP, 0, CONFIG.XP_PER_LEVEL * CONFIG.MAX_LEVEL) - (level - 1) * CONFIG.XP_PER_LEVEL;
  const pct = level >= CONFIG.MAX_LEVEL ? 100 : clamp((xpIntoLevel / CONFIG.XP_PER_LEVEL) * 100, 0, 100);
  $('menu-xp-fill').style.width = pct + '%';
  $('menu-xp-label').textContent = (level >= CONFIG.MAX_LEVEL ? CONFIG.XP_PER_LEVEL : xpIntoLevel) + ' / ' + CONFIG.XP_PER_LEVEL + ' XP';
}


/* =====================================================================
   12. TELA: COMO JOGAR — sem lógica adicional (apenas conteúdo estático)
   ===================================================================== */


/* =====================================================================
   13. TELA: LOJA
   ===================================================================== */

function bindShopTabs() {
  document.querySelectorAll('.shop-tab').forEach(function (tab) {
    tab.addEventListener('click', function () {
      sfxClick();
      document.querySelectorAll('.shop-tab').forEach(function (b) { b.classList.remove('active'); b.setAttribute('aria-selected', 'false'); });
      document.querySelectorAll('.shop-panel').forEach(function (p) { p.classList.remove('active'); });
      tab.classList.add('active');
      tab.setAttribute('aria-selected', 'true');
      $('panel-' + tab.getAttribute('data-tab')).classList.add('active');
    });
  });
}

function buildShopCard(opts) {
  const tpl = $('template-shop-card');
  const node = tpl.content.firstElementChild.cloneNode(true);
  node.querySelector('.shop-card-icon').textContent = opts.icon;
  node.querySelector('.shop-card-name').textContent = opts.name;
  node.querySelector('.shop-card-desc').textContent = opts.desc;
  const buyBtn = node.querySelector('.shop-card-buy');
  buyBtn.querySelector('.buy-icon').textContent = opts.buyIcon;
  buyBtn.querySelector('.buy-price').textContent = opts.buyLabel;
  if (opts.owned) node.classList.add('owned');
  if (opts.equipped) node.classList.add('equipped');
  if (opts.buyClass) buyBtn.classList.add(opts.buyClass);
  buyBtn.disabled = !!opts.disabled;
  buyBtn.addEventListener('click', opts.onClick);
  return node;
}

function renderShopSkins() {
  const grid = $('shop-grid-skins');
  if (!grid) return;
  grid.innerHTML = '';
  SKINS.forEach(function (skin) {
    const owned = state.ownedSkins.indexOf(skin.id) !== -1;
    const equipped = state.equippedSkin === skin.id;
    let buyLabel, buyClass, disabled;
    if (equipped) { buyLabel = t('shop.equipped'); buyClass = 'is-equipped'; disabled = true; }
    else if (owned) { buyLabel = t('shop.equip'); buyClass = 'is-owned'; disabled = false; }
    else { buyLabel = formatCost(skin.cost); buyClass = ''; disabled = !canAfford(skin.cost); }
    const card = buildShopCard({
      icon: skin.icon,
      name: skin.name[state.settings.lang],
      desc: skin.desc[state.settings.lang],
      buyIcon: owned ? '' : '🪙',
      buyLabel: buyLabel,
      owned: owned, equipped: equipped, buyClass: buyClass, disabled: disabled,
      onClick: function () { sfxClick(); buySkin(skin.id); }
    });
    grid.appendChild(card);
  });
}

function renderAllShopGrids() {
  renderShopSkins();
  renderShopThemes();
  renderShopPowerups();
}

function buySkin(skinId) {
  const skin = SKINS.find(function (s) { return s.id === skinId; });
  if (!skin) return;
  if (state.ownedSkins.indexOf(skinId) !== -1) {
    state.equippedSkin = skinId;
    saveState();
    renderShopSkins();
    return;
  }
  if (!canAfford(skin.cost)) return;
  spendCurrency(skin.cost);
  state.ownedSkins.push(skinId);
  state.equippedSkin = skinId;
  saveState();
  // Re-renderiza as 3 abas: gastar moedas/gemas aqui pode ter tornado itens
  // das outras abas (power-ups, temas) inacessíveis, e isso precisa refletir
  // imediatamente mesmo que o jogador não tenha trocado de aba ainda.
  renderAllShopGrids();
}

function renderShopThemes() {
  const grid = $('shop-grid-themes');
  if (!grid) return;
  grid.innerHTML = '';
  THEMES.forEach(function (theme) {
    const owned = state.ownedThemes.indexOf(theme.id) !== -1;
    const equipped = state.settings.theme === theme.id;
    let buyLabel, buyClass, disabled;
    if (equipped) { buyLabel = t('shop.equipped'); buyClass = 'is-equipped'; disabled = true; }
    else if (owned) { buyLabel = t('shop.equip'); buyClass = 'is-owned'; disabled = false; }
    else { buyLabel = formatCost(theme.cost); buyClass = ''; disabled = !canAfford(theme.cost); }
    const card = buildShopCard({
      icon: theme.icon,
      name: theme.name[state.settings.lang],
      desc: theme.desc[state.settings.lang],
      buyIcon: owned ? '' : '🪙',
      buyLabel: buyLabel,
      owned: owned, equipped: equipped, buyClass: buyClass, disabled: disabled,
      onClick: function () { sfxClick(); buyTheme(theme.id); }
    });
    grid.appendChild(card);
  });
}

function buyTheme(themeId) {
  const theme = THEMES.find(function (t2) { return t2.id === themeId; });
  if (!theme) return;
  if (state.ownedThemes.indexOf(themeId) === -1) {
    if (!canAfford(theme.cost)) return;
    spendCurrency(theme.cost);
    state.ownedThemes.push(themeId);
  }
  applyTheme(themeId);
  saveState();
  renderAllShopGrids();
}

function renderShopPowerups() {
  const grid = $('shop-grid-powerups');
  if (!grid) return;
  grid.innerHTML = '';
  POWERUP_SHOP_ITEMS.forEach(function (item) {
    const level = state.powerLevels[item.id] || 0;
    const maxed = level >= 3;
    const costs = POWERUP_UPGRADE_COSTS[item.id];
    const nextCost = maxed ? null : costs[level];
    const desc = t('shop.level') + ' ' + level + '/3 — ' + level + ' ' + t('shop.startCharges');
    const buyLabel = maxed ? t('shop.maxlevel') : formatCost(nextCost);
    const card = buildShopCard({
      icon: item.icon,
      name: item.name[state.settings.lang],
      desc: desc,
      buyIcon: maxed ? '' : '🪙',
      buyLabel: buyLabel,
      owned: level > 0, equipped: maxed, buyClass: maxed ? 'is-equipped' : '',
      disabled: maxed || !canAfford(nextCost || {}),
      onClick: function () { sfxClick(); buyPowerLevel(item.id); }
    });
    grid.appendChild(card);
  });
}

function buyPowerLevel(type) {
  const level = state.powerLevels[type] || 0;
  if (level >= 3) return;
  const cost = POWERUP_UPGRADE_COSTS[type][level];
  if (!canAfford(cost)) return;
  spendCurrency(cost);
  state.powerLevels[type] = level + 1;
  saveState();
  renderAllShopGrids();
}


/* =====================================================================
   14. TELA: CONFIGURAÇÕES
   ===================================================================== */

// Sincroniza os campos da tela de Configurações com o estado atual.
// Chamada toda vez que essa tela é aberta (menu, edição rápida de nome,
// ou pelo botão de Configurações dentro da Pausa) — sem isso, por exemplo,
// o nome digitado no modal de boas-vindas não aparecia aqui depois.
function refreshSettingsScreen() {
  $('input-player-name').value = state.playerName || '';
  $('slider-music').value = state.settings.musicVolume;
  $('slider-sfx').value = state.settings.sfxVolume;
}

function bindSettingsScreen() {
  refreshSettingsScreen();

  $('btn-save-name').addEventListener('click', function () {
    const val = $('input-player-name').value.trim().slice(0, 16);
    if (val) {
      state.playerName = val;
      state.hasLoggedIn = true;
      saveState();
      refreshMenuScreen();
      sfxCorrect();
    }
  });

  document.querySelectorAll('#lang-options .settings-option').forEach(function (btn) {
    btn.addEventListener('click', function () {
      sfxClick();
      applyLanguage(btn.getAttribute('data-lang'));
    });
  });

  document.querySelectorAll('#theme-options .settings-option').forEach(function (btn) {
    btn.addEventListener('click', function () {
      sfxClick();
      const themeId = btn.getAttribute('data-theme');
      if (state.ownedThemes.indexOf(themeId) === -1) {
        showScreen('screen-shop');
        document.querySelector('[data-tab="themes"]').click();
        return;
      }
      applyTheme(themeId);
      saveState();
    });
  });

  $('slider-music').value = state.settings.musicVolume;
  $('slider-sfx').value = state.settings.sfxVolume;

  $('slider-music').addEventListener('input', function (e) {
    state.settings.musicVolume = Number(e.target.value);
    applyAudioVolumes();
    saveState();
  });

  $('slider-sfx').addEventListener('input', function (e) {
    state.settings.sfxVolume = Number(e.target.value);
    applyAudioVolumes();
    saveState();
  });

  $('btn-reset-data').addEventListener('click', function () {
    if (window.confirm(t('settings.reset.confirm'))) {
      resetAllProgress();
    }
  });
}

function applyTheme(themeId) {
  document.body.setAttribute('data-theme', themeId);
  state.settings.theme = themeId;
  refreshThemeColorCache();
  document.querySelectorAll('#theme-options .settings-option').forEach(function (btn) {
    btn.classList.toggle('active', btn.getAttribute('data-theme') === themeId);
  });
  renderShopThemes();
}

function applyLanguage(langId) {
  state.settings.lang = langId;
  document.body.setAttribute('data-lang', langId);
  saveState();
  applyI18nAll();
}


/* =====================================================================
   15. TELA: RANKING (TOP RUN)
   ===================================================================== */

function renderRanking() {
  const sorted = getSortedRanking();
  const podiumEl = $('ranking-podium');
  const listEl = $('ranking-list');
  const emptyEl = $('ranking-empty');
  listEl.innerHTML = '';

  if (sorted.length === 0) {
    podiumEl.classList.add('hidden');
    emptyEl.classList.remove('hidden');
    return;
  }
  podiumEl.classList.remove('hidden');
  emptyEl.classList.add('hidden');

  for (let i = 0; i < 3; i++) {
    const entry = sorted[i];
    $('podium-' + (i + 1) + '-name').textContent = entry ? entry.name : '—';
    $('podium-' + (i + 1) + '-score').textContent = entry ? entry.score : 0;
  }

  const rest = sorted.slice(3, CONFIG.RANKING_MAX_VISIBLE);
  const tpl = $('template-ranking-row');
  rest.forEach(function (entry, idx) {
    const row = tpl.content.firstElementChild.cloneNode(true);
    row.querySelector('.ranking-position').textContent = '#' + (idx + 4);
    row.querySelector('.ranking-name').textContent = entry.name;
    row.querySelector('.ranking-level').textContent = t('menu.level', { n: entry.level });
    row.querySelector('.ranking-score').textContent = entry.score;
    if (entry.name === state.playerName) row.classList.add('is-current-player');
    listEl.appendChild(row);
  });
}


/* =====================================================================
   16. MOTOR DO JOGO — CANVAS, FÍSICA, ENTIDADES, RENDER
   ===================================================================== */

let canvas, ctx;
let canvasW = 0, canvasH = 0;
let trackGeo = {};
let themeColors = {};

let runState = null; // criado em startNewRun()
let rafId = null;
let lastFrameTime = 0;
let accumulator = 0;

const OBSTACLE_TYPES = ['train', 'barrier', 'beam'];
const PICKUP_WEIGHTED = ['coin', 'coin', 'coin', 'coin', 'gem', 'power'];
const POWER_PICKUP_TYPES = ['shield', 'speed', 'magnet', 'slow', 'jetpack'];

function setupCanvas() {
  canvas = $('game-canvas');
  ctx = canvas.getContext('2d');
  window.addEventListener('resize', resizeCanvas);
  window.addEventListener('orientationchange', function () { setTimeout(resizeCanvas, 200); });
  resizeCanvas();
}

function resizeCanvas() {
  const dpr = window.devicePixelRatio || 1;
  const rect = canvas.parentElement.getBoundingClientRect();
  canvasW = rect.width;
  canvasH = rect.height;
  canvas.width = Math.floor(canvasW * dpr);
  canvas.height = Math.floor(canvasH * dpr);
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  recomputeTrackGeometry();
}

function recomputeTrackGeometry() {
  trackGeo = {
    groundY: canvasH * 0.86,
    vanishY: canvasH * 0.14,
    roadHalfBottom: canvasW * 0.46,
    roadHalfTop: canvasW * 0.10
  };
}

function refreshThemeColorCache() {
  const cs = getComputedStyle(document.body);
  themeColors = {
    deep: cs.getPropertyValue('--bg-deep').trim() || '#0d0221',
    mid: cs.getPropertyValue('--bg-mid').trim() || '#1a0b3d',
    elevated: cs.getPropertyValue('--bg-elevated').trim() || '#241454',
    primary: cs.getPropertyValue('--accent-primary').trim() || '#ff2e9a',
    secondary: cs.getPropertyValue('--accent-secondary').trim() || '#00e5ff',
    tertiary: cs.getPropertyValue('--accent-tertiary').trim() || '#ffe600',
    track: cs.getPropertyValue('--track-color').trim() || '#2d1b69'
  };
}

function depthT(p) { return clamp(p, 0, 1); }

function roadHalfWidthAt(p) { return lerp(trackGeo.roadHalfTop, trackGeo.roadHalfBottom, depthT(p)); }

function screenYAt(p) { return lerp(trackGeo.vanishY, trackGeo.groundY, depthT(p)); }

function laneXAt(lane, p) {
  const half = roadHalfWidthAt(p);
  const offset = (lane - 1) * (half * 0.66);
  return canvasW / 2 + offset;
}

function scaleAt(p) { return lerp(0.32, 1, depthT(p)); }

function createRunState() {
  return {
    score: 0,
    lastDilemmaScore: 0,
    lives: CONFIG.LIVES_MAX,
    gameSpeed: CONFIG.BASE_SPEED,
    distanceScroll: 0,
    player: {
      lane: 1,
      renderX: laneXAt(1, 1),
      action: 'run',
      jumpHeight: 0,
      jumpVelocity: 0,
      slideTicks: 0,
      animTimer: 0,
      animFrame: 0
    },
    inventory: Object.assign({}, state.powerLevels),
    activePowers: {},
    entities: [],
    spawnTimer: 0,
    spawnInterval: CONFIG.SPAWN_INTERVAL_BASE,
    xpGainedThisRun: 0,
    coinsGainedThisRun: 0,
    gemsGainedThisRun: 0,
    paused: false,
    inDilemma: false,
    over: false,
    sessionXPBefore: 0
  };
}

function startNewRun() {
  ensureAudio();
  hideAllModals();
  // A tela precisa ficar visível ANTES de medir o canvas: com "display:none"
  // (classe .hidden) o getBoundingClientRect() do canvas retorna tudo zerado,
  // o que quebraria toda a geometria das pistas. Por isso showScreen() vem
  // antes de resizeCanvas(), e resizeCanvas() vem antes de criar o estado
  // da corrida (que já depende de coordenadas de pista válidas).
  showScreen('screen-game');
  resizeCanvas();
  runState = createRunState();
  runState.sessionXPBefore = state.totalXP;
  updateHeartsDisplay();
  updateHUDCurrency();
  updateHUDXP();
  updateHUDScore();
  hidePowerIndicators();
  startMusic();
  lastFrameTime = 0;
  accumulator = 0;
  if (rafId) cancelAnimationFrame(rafId);
  rafId = requestAnimationFrame(gameLoop);
}

function gameLoop(now) {
  rafId = requestAnimationFrame(gameLoop);
  if (!lastFrameTime) lastFrameTime = now;
  let delta = now - lastFrameTime;
  lastFrameTime = now;
  if (delta > 250) delta = 250;
  accumulator += delta;

  while (accumulator >= FIXED_DT) {
    if (runState && !runState.paused && !runState.inDilemma && !runState.over) {
      updateGame(FIXED_DT);
    }
    accumulator -= FIXED_DT;
  }
  renderGame();
}

function updateGame(dt) {
  const rs = runState;
  let speedMult = 1;
  if (rs.activePowers.speed) speedMult *= CONFIG.SPEED_MULT_BOOST;
  if (rs.activePowers.slow) speedMult *= CONFIG.SPEED_MULT_SLOW;

  rs.gameSpeed = clamp(CONFIG.BASE_SPEED + rs.score * CONFIG.SPEED_GAIN_PER_SCORE, CONFIG.BASE_SPEED, CONFIG.MAX_SPEED);
  const effectiveSpeed = rs.gameSpeed * speedMult;
  rs.distanceScroll += effectiveSpeed;

  const xpMultiplier = rs.activePowers.speed ? 2 : 1;
  rs.score += effectiveSpeed * 0.05 * xpMultiplier;

  updatePlayerPhysics(rs.player, dt);
  updateActivePowers(rs, dt);
  updateEntities(rs, effectiveSpeed, dt);
  handleSpawning(rs, dt);
  checkDilemmaTrigger(rs);
  updateHUDScore();
}

function updatePlayerPhysics(player, dt) {
  const ticks = dt / FIXED_DT;
  if (player.action === 'jump') {
    player.jumpHeight += player.jumpVelocity * ticks;
    player.jumpVelocity -= CONFIG.GRAVITY * ticks;
    if (player.jumpHeight <= 0) {
      player.jumpHeight = 0;
      player.jumpVelocity = 0;
      player.action = 'run';
    }
  } else if (player.action === 'slide') {
    player.slideTicks -= ticks;
    if (player.slideTicks <= 0) {
      player.action = 'run';
    }
  }

  const targetX = laneXAt(player.lane, 1);
  player.renderX = lerp(player.renderX, targetX, 0.32);

  const speedForAnim = runState ? runState.gameSpeed : CONFIG.BASE_SPEED;
  const frameDuration = 95 / (speedForAnim / CONFIG.BASE_SPEED);
  player.animTimer += dt;
  if (player.animTimer >= frameDuration) {
    player.animTimer = 0;
    player.animFrame = (player.animFrame + 1) % 4;
  }
}

function updateActivePowers(rs, dt) {
  Object.keys(rs.activePowers).forEach(function (type) {
    const power = rs.activePowers[type];
    power.left -= dt;
    const ring = document.querySelector('.powerup-ring-fg[data-ring="' + type + '"]');
    if (ring) ring.style.setProperty('--pct', String(clamp(power.left / power.total, 0, 1)));
    if (power.left <= 0) {
      delete rs.activePowers[type];
      const indicator = document.querySelector('.powerup-indicator[data-power="' + type + '"]');
      if (indicator) indicator.setAttribute('hidden', '');
    }
  });
}

function hidePowerIndicators() {
  document.querySelectorAll('.powerup-indicator').forEach(function (el) { el.setAttribute('hidden', ''); });
}

function activatePower(type) {
  if (!runState || runState.paused || runState.inDilemma || runState.over) return;
  const rs = runState;
  if (rs.activePowers[type]) return;
  if (!rs.inventory[type] || rs.inventory[type] <= 0) return;
  rs.inventory[type] -= 1;
  rs.activePowers[type] = { total: CONFIG.POWER_DURATION[type], left: CONFIG.POWER_DURATION[type] };
  sfxPowerup();
  const indicator = document.querySelector('.powerup-indicator[data-power="' + type + '"]');
  if (indicator) indicator.removeAttribute('hidden');
  spawnFloatingText(type.toUpperCase() + '!', canvasW / 2, canvasH * 0.4, 'is-gem');
}

function handleSpawning(rs, dt) {
  rs.spawnTimer += dt;
  const difficultyT = clamp(rs.score / CONFIG.SPAWN_DIFFICULTY_SCORE, 0, 1);
  rs.spawnInterval = lerp(CONFIG.SPAWN_INTERVAL_BASE, CONFIG.SPAWN_INTERVAL_MIN, difficultyT);
  if (rs.spawnTimer >= rs.spawnInterval) {
    rs.spawnTimer = 0;
    spawnWave(rs);
  }
}

function spawnWave(rs) {
  const lanes = [0, 1, 2];
  const roll = Math.random();

  if (roll < 0.55) {
    const blockedLanes = shuffleArray(lanes.slice()).slice(0, randInt(1, 2));
    blockedLanes.forEach(function (lane) {
      const type = OBSTACLE_TYPES[randInt(0, OBSTACLE_TYPES.length - 1)];
      rs.entities.push(makeEntity('obstacle', type, lane));
    });
    lanes.filter(function (l) { return blockedLanes.indexOf(l) === -1; }).forEach(function (lane) {
      if (Math.random() < 0.6) rs.entities.push(makeEntity('pickup', pickPickupType(), lane));
    });
  } else {
    lanes.forEach(function (lane) {
      if (Math.random() < 0.7) rs.entities.push(makeEntity('pickup', pickPickupType(), lane));
    });
  }
}

function pickPickupType() {
  const choice = PICKUP_WEIGHTED[randInt(0, PICKUP_WEIGHTED.length - 1)];
  if (choice === 'power') return POWER_PICKUP_TYPES[randInt(0, POWER_PICKUP_TYPES.length - 1)];
  return choice;
}

function makeEntity(category, type, lane) {
  return { category: category, type: type, lane: lane, p: 0, resolved: false, bobPhase: Math.random() * Math.PI * 2 };
}

function updateEntities(rs, effectiveSpeed, dt) {
  const ticks = dt / FIXED_DT;
  const increment = (effectiveSpeed / CONFIG.PROGRESS_DIVISOR) * ticks;

  for (let i = rs.entities.length - 1; i >= 0; i--) {
    const ent = rs.entities[i];

    if (ent.category === 'pickup' && rs.activePowers.magnet) {
      const playerLane = rs.player.lane;
      if (Math.abs(ent.p - 1) < CONFIG.MAGNET_RANGE_P && ent.lane !== playerLane) {
        ent.lane += (playerLane > ent.lane ? 1 : -1) * (Math.random() < CONFIG.MAGNET_PULL * 4 ? 1 : 0);
        ent.lane = clamp(ent.lane, 0, 2);
      }
    }

    ent.p += increment;

    if (!ent.resolved && ent.p >= 0.93) {
      resolveEntity(rs, ent);
      ent.resolved = true;
    }
    if (ent.p >= 1.15) {
      rs.entities.splice(i, 1);
    }
  }
}

function resolveEntity(rs, ent) {
  const sameLane = ent.lane === rs.player.lane;
  if (ent.category === 'obstacle') {
    if (!sameLane) return;
    if (rs.activePowers.jetpack) return;
    const action = rs.player.action;
    if (ent.type === 'barrier' && action === 'jump' && rs.player.jumpHeight > 8) return;
    if (ent.type === 'beam' && action === 'slide') return;
    handleCollision(rs);
  } else if (ent.category === 'pickup') {
    const inMagnetRange = rs.activePowers.magnet && Math.abs(ent.lane - rs.player.lane) <= 1;
    const collected = sameLane || rs.activePowers.jetpack || inMagnetRange;
    if (collected) handlePickup(rs, ent.type);
  }
}

function handleCollision(rs) {
  if (rs.activePowers.shield) {
    delete rs.activePowers.shield;
    const indicator = document.querySelector('.powerup-indicator[data-power="shield"]');
    if (indicator) indicator.setAttribute('hidden', '');
    sfxShieldBreak();
    spawnFloatingText('🛡️ -1', canvasW / 2, canvasH * 0.5, '');
    return;
  }
  sfxCollision();
  loseLife(rs);
}

// Reduz uma vida e atualiza o HUD, sem disparar o Game Over imediatamente.
// Usada pelo fluxo de dilema, onde o jogador ainda precisa ler o feedback
// e clicar em "Continuar Corrida" antes da tela de fim de jogo aparecer.
function decrementLife(rs) {
  rs.lives -= 1;
  updateHeartsDisplay();
  pulseHeart(rs.lives);
}

// Usada por colisões em tempo real (trem/obstáculo), onde não há nenhum
// modal no caminho — o Game Over pode (e deve) disparar imediatamente.
function loseLife(rs) {
  decrementLife(rs);
  if (rs.lives <= 0) {
    triggerGameOver();
  }
}

function handlePickup(rs, type) {
  if (type === 'coin') {
    state.coins += 1;
    rs.coinsGainedThisRun += 1;
    addXP(rs, CONFIG.XP_COIN);
    sfxCollect();
    spawnFloatingText('+' + CONFIG.XP_COIN + ' XP', laneXAt(rs.player.lane, 1), trackGeo.groundY - 60, 'is-coin');
  } else if (type === 'gem') {
    state.gems += 1;
    rs.gemsGainedThisRun += 1;
    addXP(rs, CONFIG.XP_GEM);
    sfxGem();
    spawnFloatingText('+' + CONFIG.XP_GEM + ' XP', laneXAt(rs.player.lane, 1), trackGeo.groundY - 60, 'is-gem');
  } else {
    rs.inventory[type] = clamp((rs.inventory[type] || 0) + 1, 0, CONFIG.POWER_MAX_STACK);
    sfxCollect();
    spawnFloatingText('+1', laneXAt(rs.player.lane, 1), trackGeo.groundY - 60, '');
  }
  updateHUDCurrency();
}

function addXP(rs, amount) {
  const levelBefore = computeLevel(state.totalXP);
  state.totalXP = clamp(state.totalXP + amount, 0, CONFIG.XP_PER_LEVEL * CONFIG.MAX_LEVEL);
  rs.xpGainedThisRun += amount;
  rs.score = Math.max(0, rs.score + amount);
  const levelAfter = computeLevel(state.totalXP);
  updateHUDXP();
  if (levelAfter > levelBefore) {
    showLevelUpToast(levelAfter);
    sfxLevelUp();
  }
}

function checkDilemmaTrigger(rs) {
  if (rs.score - rs.lastDilemmaScore >= CONFIG.DILEMMA_SCORE_STEP) {
    rs.lastDilemmaScore = rs.score;
    openDilemma();
  }
}


/* ---- HUD ---- */

function updateHeartsDisplay() {
  document.querySelectorAll('#hud-lives .heart').forEach(function (heart, idx) {
    heart.classList.toggle('lost', idx >= runState.lives);
  });
}

function pulseHeart(remaining) {
  const heart = document.querySelector('#hud-lives .heart[data-heart="' + (remaining + 1) + '"]');
  if (heart) {
    heart.classList.add('pulse');
    setTimeout(function () { heart.classList.remove('pulse'); }, 420);
  }
}

function updateHUDScore() {
  $('hud-score').textContent = Math.floor(runState.score);
}

function updateHUDCurrency() {
  $('hud-coins').textContent = Math.floor(state.coins);
  $('hud-gems').textContent = Math.floor(state.gems);
}

function updateHUDXP() {
  const level = computeLevel(state.totalXP);
  $('hud-level').textContent = level;
  const xpIntoLevel = clamp(state.totalXP, 0, CONFIG.XP_PER_LEVEL * CONFIG.MAX_LEVEL) - (level - 1) * CONFIG.XP_PER_LEVEL;
  const pct = level >= CONFIG.MAX_LEVEL ? 100 : clamp((xpIntoLevel / CONFIG.XP_PER_LEVEL) * 100, 0, 100);
  $('hud-xp-fill').style.width = pct + '%';
}

function showLevelUpToast(level) {
  const toast = $('toast-levelup');
  $('toast-levelup-text').textContent = t('levelup.text', { n: level });
  toast.classList.remove('hidden');
  toast.style.animation = 'none';
  requestAnimationFrame(function () {
    toast.style.animation = '';
  });
  setTimeout(function () { toast.classList.add('hidden'); }, 2200);
}

function spawnFloatingText(text, x, y, extraClass) {
  const layer = $('floating-toast-layer');
  if (!layer) return;
  const el = document.createElement('div');
  el.className = 'float-pop' + (extraClass ? ' ' + extraClass : '');
  el.textContent = text;
  el.style.left = x + 'px';
  el.style.top = y + 'px';
  layer.appendChild(el);
  setTimeout(function () { el.remove(); }, 950);
}


/* ---- Render ---- */

function renderGame() {
  if (!ctx) return;
  ctx.clearRect(0, 0, canvasW, canvasH);
  drawBackground();
  drawTrack();
  if (runState) {
    const sorted = runState.entities.slice().sort(function (a, b) { return a.p - b.p; });
    sorted.forEach(drawEntity);
    drawPlayer();
  }
}

function drawBackground() {
  const grad = ctx.createLinearGradient(0, 0, 0, canvasH);
  grad.addColorStop(0, themeColors.deep);
  grad.addColorStop(1, themeColors.mid);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, canvasW, canvasH);

  ctx.save();
  ctx.globalAlpha = 0.5;
  ctx.fillStyle = themeColors.elevated;
  const skylineOffset = (runState ? runState.distanceScroll * 0.05 : 0) % 120;
  for (let i = -1; i < 6; i++) {
    const bx = i * 120 - skylineOffset;
    const bh = 40 + ((i * 37) % 70);
    ctx.fillRect(bx, trackGeo.vanishY - bh * 0.4, 60, bh * 0.4);
  }
  ctx.restore();
}

function drawTrack() {
  const groundY = trackGeo.groundY;
  const vanishY = trackGeo.vanishY;

  ctx.save();
  ctx.beginPath();
  ctx.moveTo(canvasW / 2 - trackGeo.roadHalfTop, vanishY);
  ctx.lineTo(canvasW / 2 + trackGeo.roadHalfTop, vanishY);
  ctx.lineTo(canvasW / 2 + trackGeo.roadHalfBottom, groundY);
  ctx.lineTo(canvasW / 2 - trackGeo.roadHalfBottom, groundY);
  ctx.closePath();
  ctx.fillStyle = themeColors.track;
  ctx.fill();
  ctx.restore();

  const scroll = runState ? runState.distanceScroll : 0;
  const stripeSpacing = 0.12;
  const offset = (scroll * 0.00065) % stripeSpacing;

  ctx.save();
  ctx.strokeStyle = themeColors.secondary;
  ctx.lineWidth = 2;
  ctx.globalAlpha = 0.55;
  for (let lane = 0; lane <= 2; lane += 2) {
    for (let pp = -offset; pp <= 1; pp += stripeSpacing) {
      const p1 = pp, p2 = pp + stripeSpacing * 0.5;
      if (p1 < 0 || p2 > 1) continue;
      const x1 = laneXAt(lane, p1) + (lane === 0 ? roadHalfWidthAt(p1) * 0.33 : -roadHalfWidthAt(p1) * 0.33);
      const x2 = laneXAt(lane, p2) + (lane === 0 ? roadHalfWidthAt(p2) * 0.33 : -roadHalfWidthAt(p2) * 0.33);
      ctx.beginPath();
      ctx.moveTo(x1, screenYAt(p1));
      ctx.lineTo(x2, screenYAt(p2));
      ctx.stroke();
    }
  }
  ctx.restore();
}

function drawEntity(ent) {
  const p = depthT(ent.p);
  if (p <= 0.02) return;
  const x = laneXAt(ent.lane, p);
  const y = screenYAt(p);
  const scale = scaleAt(p);

  if (ent.category === 'obstacle') {
    if (ent.type === 'train') drawTrain(x, y, scale);
    else if (ent.type === 'barrier') drawBarrier(x, y, scale);
    else drawBeam(x, y, scale);
  } else {
    const bob = Math.sin((ent.bobPhase || 0) + p * 14) * 4 * scale;
    if (ent.type === 'coin') drawCoin(x, y + bob, scale);
    else if (ent.type === 'gem') drawGem(x, y + bob, scale);
    else drawPowerPickup(x, y + bob, scale, ent.type);
  }
}

function drawTrain(x, y, scale) {
  const w = 86 * scale, h = 150 * scale;
  ctx.save();
  ctx.translate(x, y - h / 2);
  const grad = ctx.createLinearGradient(-w / 2, -h / 2, w / 2, h / 2);
  grad.addColorStop(0, themeColors.primary);
  grad.addColorStop(1, themeColors.elevated);
  ctx.fillStyle = grad;
  roundRect(-w / 2, -h / 2, w, h, 10 * scale);
  ctx.fill();
  ctx.fillStyle = 'rgba(0,0,0,0.35)';
  roundRect(-w / 2, -h / 2, w, h * 0.22, 8 * scale);
  ctx.fill();
  ctx.font = (40 * scale) + 'px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('🚂', 0, h * 0.08);
  ctx.restore();
}

function drawBarrier(x, y, scale) {
  const w = 70 * scale, h = 26 * scale;
  ctx.save();
  ctx.translate(x, y - h / 2);
  ctx.fillStyle = themeColors.tertiary;
  roundRect(-w / 2, -h / 2, w, h, 6 * scale);
  ctx.fill();
  ctx.strokeStyle = 'rgba(0,0,0,0.4)';
  ctx.lineWidth = 3 * scale;
  for (let i = -2; i <= 2; i++) {
    ctx.beginPath();
    ctx.moveTo(i * (w / 5), -h / 2);
    ctx.lineTo(i * (w / 5) + h * 0.6, h / 2);
    ctx.stroke();
  }
  ctx.restore();
}

function drawBeam(x, y, scale) {
  const w = 78 * scale, h = 20 * scale;
  ctx.save();
  ctx.translate(x, y - h * 2.4);
  ctx.fillStyle = themeColors.primary;
  roundRect(-w / 2, -h / 2, w, h, 5 * scale);
  ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,0.6)';
  ctx.fillRect(-w / 2, -h / 2, w, 3 * scale);
  ctx.restore();
}

function drawCoin(x, y, scale) {
  ctx.save();
  ctx.font = (30 * scale) + 'px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.shadowColor = 'rgba(255,210,76,0.7)';
  ctx.shadowBlur = 8 * scale;
  ctx.fillText('🪙', x, y);
  ctx.restore();
}

function drawGem(x, y, scale) {
  ctx.save();
  ctx.font = (30 * scale) + 'px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.shadowColor = 'rgba(122,215,255,0.8)';
  ctx.shadowBlur = 10 * scale;
  ctx.fillText('💎', x, y);
  ctx.restore();
}

const POWER_ICONS = { shield: '🛡️', speed: '⚡', magnet: '🧲', slow: '🌀', jetpack: '🚀' };

function drawPowerPickup(x, y, scale, type) {
  ctx.save();
  ctx.beginPath();
  ctx.arc(x, y, 22 * scale, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(255,255,255,0.12)';
  ctx.fill();
  ctx.strokeStyle = themeColors.secondary;
  ctx.lineWidth = 2 * scale;
  ctx.stroke();
  ctx.font = (26 * scale) + 'px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(POWER_ICONS[type] || '✨', x, y);
  ctx.restore();
}

function roundRect(x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function drawPlayer() {
  const rs = runState;
  const player = rs.player;
  const groundY = trackGeo.groundY;
  const x = player.renderX;
  const baseScale = 1.05;
  const jumpOffsetPx = player.jumpHeight * 2.1;
  let y = groundY - jumpOffsetPx;
  let squashY = 1;
  if (player.action === 'slide') { squashY = 0.6; y += 8; }

  const skin = SKINS.find(function (s) { return s.id === state.equippedSkin; }) || SKINS[0];

  const legAngles = [
    [25, -25], [-10, 10], [-25, 25], [-10, 10]
  ];
  let frame = player.animFrame;
  let leftLegAngle = 0, rightLegAngle = 0;
  if (player.action === 'run') {
    leftLegAngle = legAngles[frame][0];
    rightLegAngle = legAngles[frame][1];
  } else if (player.action === 'jump') {
    leftLegAngle = -45; rightLegAngle = 35;
  } else if (player.action === 'slide') {
    leftLegAngle = 70; rightLegAngle = 70;
  }

  ctx.save();
  ctx.translate(x, groundY);
  ctx.fillStyle = 'rgba(0,0,0,0.35)';
  ctx.beginPath();
  ctx.ellipse(0, 4, 26 * baseScale, 8 * baseScale, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  ctx.save();
  ctx.translate(x, y);
  ctx.scale(baseScale, baseScale * squashY);

  drawLeg(rightLegAngle, 6);
  drawLeg(leftLegAngle, -6);

  ctx.fillStyle = skin.accent;
  ctx.beginPath();
  ctx.moveTo(-2, -34);
  ctx.quadraticCurveTo(-22, -10 + Math.sin(frame) * 3, -6, 6);
  ctx.lineTo(2, -10);
  ctx.closePath();
  ctx.fill();

  const torsoGrad = ctx.createLinearGradient(0, -44, 0, -6);
  torsoGrad.addColorStop(0, skin.tint);
  torsoGrad.addColorStop(1, skin.accent);
  ctx.fillStyle = torsoGrad;
  roundRect(-13, -44, 26, 38, 8);
  ctx.fill();

  ctx.fillStyle = themeColors.deep;
  ctx.fillRect(-10, -28, 20, 6);

  ctx.fillStyle = skin.tint;
  ctx.beginPath();
  ctx.arc(0, -50, 13, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = themeColors.deep;
  ctx.fillRect(-8, -52, 16, 5);

  if (rs.activePowers.shield) {
    ctx.save();
    ctx.globalAlpha = 0.5 + Math.sin(performance.now() / 120) * 0.15;
    ctx.strokeStyle = themeColors.secondary;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(0, -25, 42, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }

  ctx.restore();
}

function drawLeg(angleDeg, offsetX) {
  ctx.save();
  ctx.translate(offsetX, -6);
  ctx.rotate(angleDeg * Math.PI / 180);
  ctx.fillStyle = '#2a2a3a';
  roundRect(-5, 0, 10, 26, 3);
  ctx.fill();
  ctx.restore();
}


/* =====================================================================
   17. CONTROLES (TECLADO E TOUCH)
   ===================================================================== */

function moveLane(dir) {
  if (!runState || runState.paused || runState.inDilemma || runState.over) return;
  runState.player.lane = clamp(runState.player.lane + dir, 0, CONFIG.LANES - 1);
}

function doJump() {
  if (!runState || runState.paused || runState.inDilemma || runState.over) return;
  if (runState.player.action === 'run') {
    runState.player.action = 'jump';
    runState.player.jumpVelocity = CONFIG.JUMP_FORCE;
    sfxJump();
  }
}

function doSlide() {
  if (!runState || runState.paused || runState.inDilemma || runState.over) return;
  if (runState.player.action === 'run') {
    runState.player.action = 'slide';
    runState.player.slideTicks = CONFIG.SLIDE_DURATION_TICKS;
  }
}

function handleActionCode(code) {
  switch (code) {
    case 'ArrowLeft': case 'KeyA': moveLane(-1); break;
    case 'ArrowRight': case 'KeyD': moveLane(1); break;
    case 'ArrowUp': case 'KeyW': doJump(); break;
    case 'ArrowDown': case 'KeyS': doSlide(); break;
    case 'Space': activatePower('shield'); break;
    case 'KeyQ': activatePower('speed'); break;
    case 'KeyE': activatePower('magnet'); break;
    case 'KeyR': activatePower('slow'); break;
    case 'KeyF': activatePower('jetpack'); break;
    default: break;
  }
}

function bindControls() {
  window.addEventListener('keydown', function (e) {
    // Se o jogador estiver digitando (nome do jogador, por exemplo), as
    // teclas de jogo (incluindo Espaço, Q/E/R/F e P) não devem interferir —
    // sem essa checagem, era impossível digitar nomes com espaço ou com
    // essas letras sem acionar poderes/pausa por engano.
    const focusedTag = document.activeElement && document.activeElement.tagName;
    if (focusedTag === 'INPUT' || focusedTag === 'TEXTAREA') return;

    ensureAudio();
    if (e.code === 'Space') e.preventDefault();
    if (e.code === 'Escape' || e.code === 'KeyP') {
      togglePause();
      return;
    }
    if (document.getElementById('screen-game').classList.contains('active')) {
      handleActionCode(e.code);
    }
  });

  document.querySelectorAll('.touch-power-btn').forEach(function (btn) {
    btn.addEventListener('touchstart', function (e) {
      e.preventDefault();
      ensureAudio();
      handleActionCode(btn.getAttribute('data-key'));
    }, { passive: false });
    btn.addEventListener('click', function () {
      ensureAudio();
      handleActionCode(btn.getAttribute('data-key'));
    });
  });

  const swipeLayer = $('touch-swipe-layer');
  let touchStartX = 0, touchStartY = 0, touchStartTime = 0;

  swipeLayer.addEventListener('touchstart', function (e) {
    const touch = e.changedTouches[0];
    touchStartX = touch.clientX;
    touchStartY = touch.clientY;
    touchStartTime = Date.now();
  }, { passive: true });

  // Sem isso, o navegador pode interpretar o swipe como "puxar para
  // atualizar" ou rolar a página, especialmente em iOS/Android.
  swipeLayer.addEventListener('touchmove', function (e) {
    e.preventDefault();
  }, { passive: false });

  swipeLayer.addEventListener('touchend', function (e) {
    const touch = e.changedTouches[0];
    const dx = touch.clientX - touchStartX;
    const dy = touch.clientY - touchStartY;
    const dt = Date.now() - touchStartTime;
    if (dt > 700) return;
    if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 30) {
      moveLane(dx > 0 ? 1 : -1);
    } else if (Math.abs(dy) > 30) {
      if (dy < 0) doJump();
      else doSlide();
    }
  }, { passive: true });

  $('btn-pause').addEventListener('click', function () { togglePause(); });
}


/* =====================================================================
   18. DILEMAS — FLUXO DE PERGUNTA/RESPOSTA
   ===================================================================== */

let currentDilemma = null;

function openDilemma() {
  if (!runState) return;
  runState.inDilemma = true;
  currentDilemma = nextDilemma();
  renderDilemma(currentDilemma);
  $('modal-dilemma').classList.remove('hidden');
}

function renderDilemma(dilemma) {
  const lang = state.settings.lang;
  $('dilemma-category').textContent = t(dilemma.categoryKey);
  $('dilemma-icon').textContent = dilemma.icon;
  $('dilemma-title').textContent = dilemma.title[lang];
  $('dilemma-text').textContent = dilemma.text[lang];
  $('dilemma-feedback').classList.add('hidden');

  const optionsWrap = $('dilemma-options');
  optionsWrap.innerHTML = '';
  optionsWrap.classList.remove('hidden');

  const shuffled = dilemma.options.map(function (o) { return o; });
  shuffleArray(shuffled);

  const tpl = $('template-dilemma-option');
  shuffled.forEach(function (option) {
    const btn = tpl.content.firstElementChild.cloneNode(true);
    btn.textContent = option.text[lang];
    btn.addEventListener('click', function () { handleDilemmaAnswer(option, btn); });
    optionsWrap.appendChild(btn);
  });
}

function handleDilemmaAnswer(option, btnEl) {
  const lang = state.settings.lang;
  document.querySelectorAll('.dilemma-option-btn').forEach(function (b) { b.disabled = true; });
  btnEl.classList.add(option.correct ? 'is-correct' : 'is-incorrect');

  const feedbackBox = $('dilemma-feedback');
  const feedbackText = $('dilemma-feedback-text');
  const feedbackXP = $('dilemma-feedback-xp');

  if (option.correct) {
    addXP(runState, CONFIG.XP_CORRECT);
    feedbackText.textContent = currentDilemma.feedbackCorrect[lang];
    feedbackXP.textContent = t('dilemma.correct', { xp: CONFIG.XP_CORRECT });
    feedbackXP.className = 'dilemma-feedback-xp is-positive';
    sfxCorrect();
  } else {
    addXP(runState, CONFIG.XP_WRONG);
    feedbackText.textContent = currentDilemma.feedbackIncorrect[lang];
    feedbackXP.textContent = t('dilemma.incorrect', { xp: CONFIG.XP_WRONG });
    feedbackXP.className = 'dilemma-feedback-xp is-negative';
    sfxWrong();
    decrementLife(runState);
  }

  feedbackBox.classList.remove('hidden');
}

function bindDilemmaContinue() {
  $('btn-dilemma-continue').addEventListener('click', function () {
    $('modal-dilemma').classList.add('hidden');
    if (runState) runState.inDilemma = false;
    if (runState && runState.lives <= 0) {
      triggerGameOver();
    }
  });
}


/* =====================================================================
   19. PAUSA / GAME OVER
   ===================================================================== */

function togglePause() {
  if (!runState || runState.over || runState.inDilemma) return;
  runState.paused = !runState.paused;
  if (runState.paused) {
    $('modal-pause').classList.remove('hidden');
  } else {
    $('modal-pause').classList.add('hidden');
  }
}

function bindPauseModal() {
  $('btn-resume').addEventListener('click', function () { sfxClick(); togglePause(); });
  $('btn-restart').addEventListener('click', function () {
    sfxClick();
    $('modal-pause').classList.add('hidden');
    startNewRun();
  });
  $('btn-pause-settings').addEventListener('click', function () {
    sfxClick();
    $('modal-pause').classList.add('hidden');
    showScreen('screen-settings');
  });
  $('btn-pause-exit').addEventListener('click', function () {
    sfxClick();
    $('modal-pause').classList.add('hidden');
    exitToMenu();
  });
}

function hideAllModals() {
  ['modal-login', 'modal-dilemma', 'modal-pause', 'modal-gameover'].forEach(function (id) {
    const el = $(id);
    if (el) el.classList.add('hidden');
  });
}

function exitToMenu() {
  if (rafId) cancelAnimationFrame(rafId);
  stopMusic();
  hideAllModals();
  runState = null;
  refreshMenuScreen();
  showScreen('screen-menu');
}

function triggerGameOver() {
  if (!runState || runState.over) return;
  runState.over = true;
  runState.inDilemma = false;
  if (rafId) cancelAnimationFrame(rafId);
  stopMusic();
  // Fecha qualquer modal de dilema/pausa que ainda esteja visível por baixo,
  // para que apenas a tela de Game Over apareça.
  $('modal-dilemma').classList.add('hidden');
  $('modal-pause').classList.add('hidden');

  const finalScore = Math.floor(runState.score);
  const level = computeLevel(state.totalXP);
  const isNewRecord = finalScore > state.bestScore;
  if (isNewRecord) state.bestScore = finalScore;

  saveState();
  submitScore(state.playerName || 'Jogador', finalScore, level);

  $('gameover-score').textContent = finalScore;
  $('gameover-xp').textContent = Math.max(0, Math.floor(runState.xpGainedThisRun));
  $('gameover-coins').textContent = runState.coinsGainedThisRun;
  $('gameover-gems').textContent = runState.gemsGainedThisRun;
  $('gameover-newrecord').classList.toggle('hidden', !isNewRecord);

  setTimeout(function () {
    $('modal-gameover').classList.remove('hidden');
  }, 350);
}

function bindGameOverModal() {
  $('btn-gameover-retry').addEventListener('click', function () {
    sfxClick();
    $('modal-gameover').classList.add('hidden');
    startNewRun();
  });
  $('btn-gameover-menu').addEventListener('click', function () {
    sfxClick();
    $('modal-gameover').classList.add('hidden');
    exitToMenu();
  });
}


/* =====================================================================
   20. BOOT — INICIALIZAÇÃO GERAL
   ===================================================================== */

function bindLoginModal() {
  $('btn-login-confirm').addEventListener('click', confirmLogin);
  $('input-login-name').addEventListener('keydown', function (e) {
    if (e.key === 'Enter') confirmLogin();
  });
}

function confirmLogin() {
  const input = $('input-login-name');
  const val = input.value.trim().slice(0, 16) || 'Jogador';
  state.playerName = val;
  state.hasLoggedIn = true;
  saveState();
  input.blur();
  $('modal-login').classList.add('hidden');
  refreshMenuScreen();
  showScreen('screen-menu');
}

function boot() {
  loadState();
  document.body.setAttribute('data-theme', state.settings.theme);
  document.body.setAttribute('data-lang', state.settings.lang);
  $('btn-mute').setAttribute('data-state', state.settings.muted ? 'muted' : 'unmuted');

  refreshThemeColorCache();
  setupCanvas();
  bindNavigation();
  bindShopTabs();
  bindSettingsScreen();
  bindControls();
  bindLoginModal();
  bindDilemmaContinue();
  bindPauseModal();
  bindGameOverModal();

  applyI18nAll();
  refreshMenuScreen();

  document.querySelectorAll('#theme-options .settings-option').forEach(function (btn) {
    btn.classList.toggle('active', btn.getAttribute('data-theme') === state.settings.theme);
  });

  runLoadingSequence(function () {
    if (state.hasLoggedIn && state.playerName) {
      showScreen('screen-menu');
    } else {
      showScreen('screen-menu');
      $('modal-login').classList.remove('hidden');
    }
  });

  document.addEventListener('click', ensureAudio, { once: true });
  document.addEventListener('touchstart', ensureAudio, { once: true });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot);
} else {
  boot();
}

})();
/* ==========================================================
BLOCO 12 — FX ENGINE
========================================================== */

const FX = {

particles:[],
running:false,

init(){

this.createCanvas();

this.bind();

this.animate();

this.setupAudio();

},

createCanvas(){

this.fxCanvas =
document.createElement("canvas");

this.fxCanvas.id =
"fx-canvas";

Object.assign(
this.fxCanvas.style,
{
position:"fixed",
inset:"0",
pointerEvents:"none",
zIndex:"20"
}
);

document.body.append(
this.fxCanvas
);

this.ctx =
this.fxCanvas.getContext(
"2d"
);

this.resize();

window.addEventListener(
"resize",
()=>this.resize()
);

},

resize(){

this.fxCanvas.width=
innerWidth;

this.fxCanvas.height=
innerHeight;

},

particle(
x,
y,
color="#ffffff"
){

for(
let i=0;
i<10;
i++
){

this.particles.push({

x,
y,

vx:
(Math.random()-.5)*7,

vy:
(Math.random()-.5)*7,

size:
Math.random()*7+2,

life:50,

color

});

}

},

animate(){

this.running=true;

const loop=()=>{

if(!this.running)
return;

this.ctx.clearRect(
0,
0,
this.fxCanvas.width,
this.fxCanvas.height
);

this.particles.forEach(
p=>{

p.x+=p.vx;

p.y+=p.vy;

p.life--;

p.size*=.97;

this.ctx.beginPath();

this.ctx.fillStyle=
p.color;

this.ctx.globalAlpha=
p.life/50;

this.ctx.arc(
p.x,
p.y,
p.size,
0,
7
);

this.ctx.fill();

}

);

this.ctx.globalAlpha=1;

this.particles=
this.particles.filter(
x=>x.life>0
);

requestAnimationFrame(
loop
);

};

loop();

},

bind(){

document.addEventListener(
"click",
e=>{

this.particle(

e.clientX,
e.clientY,

[
"#00ffff",
"#ff00cc",
"#ffd000",
"#00ff99"

][
Math.floor(
Math.random()*4
)
]

);

}

);

},

showToast(
text
){

const layer=
document.getElementById(
"floating-toast-layer"
);

if(!layer)
return;

const el=
document.createElement(
"div"
);

el.className=
"toast";

el.textContent=
text;

layer.append(el);

setTimeout(
()=>el.remove(),
1800
);

},

levelUp(){

this.showToast(
"⭐ NÍVEL ALCANÇADO!"
);

navigator.vibrate?.(
[80,60,80]
);

},

coin(){

this.showToast(
"+1 🪙"
);

},

gem(){

this.showToast(
"+1 💎"
);

},

power(name){

this.showToast(
name
);

},

screenTransition(){

document.body.animate(

[
{

opacity:.8,
transform:
"scale(.98)"

},

{

opacity:1,
transform:
"scale(1)"

}

],

{

duration:350

}

);

},

setupAudio(){

const AudioEngine={

ctx:null,

master:null,

enabled:true,

init(){

if(this.ctx)
return;

this.ctx=

new(
window.AudioContext||
window.webkitAudioContext
)();

this.master=
this.ctx.createGain();

this.master.gain.value=.04;

this.master.connect(
this.ctx.destination
);

},

tone(
freq,
time=.15
){

if(!this.enabled)
return;

this.init();

const osc=
this.ctx.createOscillator();

const gain=
this.ctx.createGain();

osc.connect(gain);

gain.connect(
this.master
);

osc.frequency.value=
freq;

osc.type=
"sine";

gain.gain.value=.15;

osc.start();

gain.gain.exponentialRampToValueAtTime(

0.001,

this.ctx.currentTime+
time

);

osc.stop(

this.ctx.currentTime+
time

);

}

};

window.AudioEngine=
AudioEngine;

},

startMusic(){

if(
!window.AudioEngine
)
return;

let seq=[

330,
440,
550,
660,

440,
720,
550,
660

];

let i=0;

setInterval(

()=>{

window.AudioEngine.tone(

seq[i],

.18

);

i++;

if(
i>=seq.length
)
i=0;

},

380

);

}

};

/* =======================
AUTO
======================= */

window.addEventListener(

"load",

()=>{

FX.init();

setTimeout(

()=>{

FX.startMusic();

},

1500

);

}

);

/* =======================
EXEMPLOS
======================= */

// FX.coin()

// FX.gem()

// FX.levelUp()

// FX.power("🛡️ ESCUDO")

// FX.screenTransition()
/* ==========================================================
BLOCO 13 — RUNNER ENGINE (CORRIGIDO)
========================================================== */

const Runner = {

canvas: null,
ctx: null,

running: false,

lane: 1,

player: {

x: 0,
y: 0,

width: 90,
height: 110,

jump: 0,

jumping: false,

slide: false,

velocity: 0

},

world: {

speed: 10,
distance: 0

},

obstacles: [],
coins: [],

spawnInterval: null,

init() {

this.canvas =
document.getElementById(
"game-canvas"
);

if (!this.canvas)
return;

this.ctx =
this.canvas.getContext(
"2d"
);

this.resize();

window.addEventListener(
"resize",
() => this.resize()
);

this.bind();

},

resize() {

this.canvas.width =
innerWidth;

this.canvas.height =
innerHeight;

this.player.y =
this.canvas.height - 240;

},

start() {

this.running = true;

this.spawnLoop();

this.loop();

},

stop() {

this.running = false;

if (this.spawnInterval)
clearInterval(this.spawnInterval);

},

bind() {

addEventListener(
"keydown",

e => {

if (!this.running)
return;

switch (e.code) {

case "ArrowLeft":
case "KeyA":

this.move(-1);

break;

case "ArrowRight":
case "KeyD":

this.move(1);

break;

case "ArrowUp":
case "KeyW":

this.jump();

break;

case "ArrowDown":
case "KeyS":

this.slide();

break;

}

}

);

},

move(dir) {

this.lane += dir;

if (this.lane < 0)
this.lane = 0;

if (this.lane > 2)
this.lane = 2;

FX.screenTransition();

},

jump() {

if (this.player.jumping)
return;

this.player.jumping = true;

this.player.velocity = -24;

FX.power(
"⬆️ PULO"
);

},

slide() {

this.player.slide = true;

setTimeout(() => {

this.player.slide = false;

}, 700);

},

spawnObstacle() {

this.obstacles.push({

lane: Math.floor(Math.random() * 3),

y: -180,

width: 110,

height: 110,

type: [
"🚧",
"🚂",
"📦"
][Math.floor(Math.random() * 3)]

});

},

spawnCoin() {

this.coins.push({

lane: Math.floor(Math.random() * 3),

y: -120

});

},

spawnLoop() {

if (this.spawnInterval)
clearInterval(this.spawnInterval);

this.spawnInterval = setInterval(() => {

if (!this.running)
return;

Math.random() > 0.35
? this.spawnObstacle()
: this.spawnCoin();

}, 1300);

},

playerX() {

return (

this.canvas.width / 2

+

((this.lane - 1) * 180)

);

},

physics() {

if (this.player.jumping) {

this.player.velocity += 1.2;

this.player.jump += this.player.velocity;

if (this.player.jump > 0) {

this.player.jump = 0;
this.player.jumping = false;
this.player.velocity = 0;

}

}

this.obstacles.forEach(o => {

o.y += this.world.speed;

});

this.coins.forEach(c => {

c.y += this.world.speed;

});

this.world.distance += this.world.speed;

},

drawTrack() {

const c = this.ctx;

c.fillStyle = "#4430a5";

c.fillRect(
0,
0,
this.canvas.width,
this.canvas.height
);

for (let i = 0; i < 3; i++) {

let x =
this.canvas.width / 2 +
((i - 1) * 180);

c.fillStyle =
i === 1 ? "#4e47ff" : "#2d1f66";

c.fillRect(
x - 70,
0,
140,
this.canvas.height
);

}

},

drawPlayer() {

const c = this.ctx;

let x = this.playerX();

let y =
this.player.y +
this.player.jump;

c.save();

c.translate(x, y);

c.font = "90px serif";

c.textAlign = "center";

c.fillText(

this.player.slide ? "🛹" : "🧑‍🦱",
0,
0

);

c.restore();

},

drawObstacles() {

const c = this.ctx;

this.obstacles.forEach(o => {

let x =
this.canvas.width / 2 +
((o.lane - 1) * 180);

c.font = "82px serif";

c.textAlign = "center";

c.fillText(o.type, x, o.y);

});

},

drawCoins() {

const c = this.ctx;

this.coins.forEach(cn => {

let x =
this.canvas.width / 2 +
((cn.lane - 1) * 180);

c.font = "42px serif";

c.fillText("🪙", x, cn.y);

});

},

collect() {

this.coins = this.coins.filter(c => {

let coinX =
this.canvas.width / 2 +
((c.lane - 1) * 180);

let hit =
Math.abs(this.playerX() - coinX) < 70 &&
Math.abs(this.player.y - c.y) < 80;

if (hit) {

FX.coin();

return false;

}

return true;

});

},

collision() {

this.obstacles.forEach(o => {

let obsX =
this.canvas.width / 2 +
((o.lane - 1) * 180);

let hit =
Math.abs(this.playerX() - obsX) < 90 &&
Math.abs(this.player.y + this.player.jump - o.y) < 90;

if (hit) {

this.stop();

alert("Fim de jogo");

}

});

},

loop() {

if (!this.running)
return;

requestAnimationFrame(() => this.loop());

this.physics();

this.collect();

this.collision();

this.ctx.clearRect(
0,
0,
this.canvas.width,
this.canvas.height
);

this.drawTrack();

this.drawCoins();

this.drawObstacles();

this.drawPlayer();

}

};

/* ======================
INICIAR
====================== */

window.addEventListener(

"load",

()=>{

Runner.init();

const play=

document.getElementById(
"btn-play"
);

if(play){

play.addEventListener(

"click",

()=>{

Runner.start();

}

);

}

});
/* ==========================================================
BLOCO 14 — PROGRESSÃO
========================================================== */

const Save={

key:
"abrunner_v2_ultra",

load(){

try{

return JSON.parse(

localStorage.getItem(
this.key
)

)||null;

}

catch{

return null;

}

},

save(data){

localStorage.setItem(

this.key,

JSON.stringify(data)

);

},

reset(){

localStorage.removeItem(
this.key
);

}

};

/* ===================== */

const Progress={

score:0,

coins:150,

gems:5,

xp:0,

level:1,

lives:3,

best:0,

init(){

const save=
Save.load();

if(save){

Object.assign(
this,
save
);

}

this.render();

},

render(){

setText(
"hud-score",
this.score
);

setText(
"hud-coins",
this.coins
);

setText(
"hud-gems",
this.gems
);

setText(
"hud-level",
this.level
);

setText(
"menu-coins-amount",
this.coins
);

setText(
"menu-gems-amount",
this.gems
);

this.updateXP();

this.updateLives();

},

updateXP(){

let max=

this.level*
100;

let percent=

(
this.xp/max
)*100;

const fill=

document.getElementById(
"hud-xp-fill"
);

if(fill){

fill.style.width=
percent+"%";

}

const label=

document.getElementById(
"menu-xp-label"
);

if(label){

label.textContent=

`${this.xp} / ${max} XP`;

}

},

gainXP(v){

this.xp+=v;

while(
this.xp>=
this.level*100
){

this.xp-=
this.level*100;

this.level++;

FX.levelUp();

}

this.render();

this.persist();

},

addScore(v){

this.score+=v;

if(
this.score>
this.best
){

this.best=
this.score;

}

this.render();

},

addCoin(v=1){

this.coins+=v;

FX.coin();

this.addScore(
v*5
);

this.persist();

},

addGem(v=1){

this.gems+=v;

FX.gem();

this.addScore(
v*25
);

this.persist();

},

damage(){

this.lives--;

this.updateLives();

navigator.vibrate?.(
150
);

if(
this.lives<=0
){

GameOver.show();

Runner.stop();

}

this.persist();

},

heal(){

if(
this.lives<3
){

this.lives++;

}

this.updateLives();

},

updateLives(){

document

.querySelectorAll(
".heart"
)

.forEach(

(

h,
i

)=>{

h.style.opacity=

i<this.lives

?

1

:

.25;

}

);

},

persist(){

Save.save({

score:this.score,

coins:this.coins,

gems:this.gems,

xp:this.xp,

level:this.level,

lives:this.lives,

best:this.best

});

},

resetRun(){

this.score=0;

this.lives=3;

this.render();

}

};

/* ===================== */

const GameOver={

show(){

const modal=

document.getElementById(
"modal-gameover"
);

if(!modal)
return;

modal.classList.remove(
"hidden"
);

setText(
"gameover-score",
Progress.score
);

setText(
"gameover-xp",
Progress.xp
);

setText(
"gameover-coins",
Progress.coins
);

setText(
"gameover-gems",
Progress.gems
);

if(

Progress.score
>=
Progress.best

){

document

.getElementById(
"gameover-newrecord"
)

?.classList
.remove(
"hidden"
);

}

},

hide(){

document

.getElementById(
"modal-gameover"
)

?.classList
.add(
"hidden"
);

}

};

/* ===================== */

function setText(
id,
value
){

const el=
document.getElementById(
id
);

if(el){

el.textContent=
value;

}

}

/* =======================
INTEGRAR
======================= */

window.addEventListener(

"load",

()=>{

Progress.init();

}

/* moedas */

);

const oldCollect=
Runner.collect
.bind(
Runner
);

Runner.collect=
function(){

oldCollect();

this.coins=

this.coins.filter(

c=>{

let hit=

Math.abs(

this.playerX()

-

(
this.canvas.width/2+

(
c.lane-1
)
*
180
)

)

<70;

if(hit){

Progress.addCoin();

Progress.gainXP(
3
);

return false;

}

return true;

}

);

};

/* colisão */

const oldCollision=
Runner.collision
.bind(
Runner
);

Runner.collision=
function(){

this.obstacles=

this.obstacles.filter(

o=>{

let hit=

Math.abs(

this.playerX()

-

(
this.canvas.width/2+

(
o.lane-1
)
*
180
)

)

<90

&&

Math.abs(

this.player.y+

this.player.jump-

o.y

)

<90;

if(hit){

Progress.damage();

return false;

}

return true;

}

);

};
/* ==========================================================
BLOCO 15 — SHOP SYSTEM
========================================================== */

const Shop={

skins:[

{

id:"knight",

icon:"🛡️",

name:"Cavaleiro Padrão",

desc:"O visual clássico.",

price:0,

currency:"coins"

},

{

id:"gold",

icon:"👑",

name:"Cavaleiro Dourado",

desc:"Armadura reluzente.",

price:500,

currency:"coins"

},

{

id:"ninja",

icon:"🥷",

name:"Ninja da Empatia",

desc:"Sempre pronto para ajudar.",

price:800,

currency:"coins"

},

{

id:"astro",

icon:"🧑‍🚀",

name:"Astronauta",

desc:"Espalhando respeito.",

price:40,

currency:"gems"

},

{

id:"robot",

icon:"🤖",

name:"Robô Guardião",

desc:"Bullying não é aceitável.",

price:1200,

currency:"coins"

},

{

id:"queen",

icon:"👸",

name:"Guerreira Real",

desc:"Coragem e gentileza.",

price:60,

currency:"gems"

}

],

themes:[

"arcade",
"forest",
"ocean",
"sunset"

],

owned:["knight"],

equipped:"knight",

init(){

this.load();

this.render();

this.bind();

},

load(){

const save=
Save.load();

if(!save)
return;

this.owned=
save.owned||
["knight"];

this.equipped=
save.equipped||
"knight";

},

persist(){

const save=
Save.load()||
{};

save.owned=
this.owned;

save.equipped=
this.equipped;

Save.save(save);

},

render(){

const grid=

document.getElementById(
"shop-grid-skins"
);

if(!grid)
return;

grid.innerHTML="";

this.skins.forEach(

item=>{

const card=

document
.getElementById(
"template-shop-card"
)

.content

.firstElementChild

.cloneNode(
true
);

card
.querySelector(
".shop-card-icon"
)
.textContent=
item.icon;

card
.querySelector(
".shop-card-name"
)
.textContent=
item.name;

card
.querySelector(
".shop-card-desc"
)
.textContent=
item.desc;

const btn=

card.querySelector(
".shop-card-buy"
);

const own=

this.owned.includes(
item.id
);

if(
this.equipped===
item.id
){

btn.textContent=
"Equipado";

btn.disabled=true;

}

else if(
own
){

btn.textContent=
"Equipar";

btn.onclick=
()=>{

this.equip(
item.id
);

};

}

else{

btn.textContent=

item.currency==="coins"

?

`🪙 ${item.price}`

:

`💎 ${item.price}`;

btn.onclick=
()=>{

this.buy(
item
);

};

}

grid.append(
card
);

}

);

},

buy(item){

if(

item.currency==="coins"

&&

Progress.coins<
item.price

){

FX.showToast(
"Moedas insuficientes"
);

return;

}

if(

item.currency==="gems"

&&

Progress.gems<
item.price

){

FX.showToast(
"Gemas insuficientes"
);

return;

}

if(
item.currency==="coins"
){

Progress.coins-=

item.price;

}

else{

Progress.gems-=

item.price;

}

this.owned.push(
item.id
);

Progress.render();

this.persist();

this.render();

FX.showToast(
"Comprado!"
);

},

equip(id){

this.equipped=id;

this.persist();

this.render();

FX.showToast(
"Equipado"
);

Runner.skin=id;

},

skinIcon(){

return(

this.skins.find(

s=>

s.id===this.equipped

)

?.icon

||

"🧑‍🦱"

);

},

applyTheme(name){

document.body
.dataset.theme=
name;

FX.showToast(
"Tema alterado"
);

},

bind(){

document

.querySelectorAll(
"[data-theme]"
)

.forEach(

btn=>{

btn.addEventListener(

"click",

()=>{

this.applyTheme(

btn.dataset.theme

);

}

);

}

);

}

};

/* ======================
SKIN NO PERSONAGEM
====================== */

const oldDraw=
Runner.drawPlayer
.bind(
Runner
);

Runner.drawPlayer=
function(){

const c=
this.ctx;

const x=
this.playerX();

const y=

this.player.y+

this.player.jump;

c.save();

c.translate(
x,
y
);

c.textAlign=
"center";

c.font=
"90px serif";

c.fillText(

Shop.skinIcon(),

0,

0

);

c.restore();

};

/* ======================
POWERUPS
====================== */

const Powers={

shield:false,

speed:false,

magnet:false,

activate(name){

this[name]=true;

FX.power(
name
);

setTimeout(

()=>{

this[name]=false;

},

8000

);

}

};

addEventListener(

"keydown",

e=>{

if(
e.code==="Space"
)
Powers.activate(
"shield"
);

if(
e.code==="KeyQ"
)
Powers.activate(
"speed"
);

if(
e.code==="KeyE"
)
Powers.activate(
"magnet"
);

if(
e.code==="KeyR"
)
Powers.activate(
"slow"
);

if(
e.code==="KeyF"
)
Powers.activate(
"jetpack"
);

}

);

/* ======================
AUTO
====================== */

window.addEventListener(

"load",

()=>{

Shop.init();

});
/* ==========================================================
BLOCO 16 — DILEMAS EDUCATIVOS
========================================================== */

const Dilemma={

opened:false,

index:0,

list:[

{

icon:"😔",

title:
"Exclusão no intervalo",

text:
"Você percebe um colega sendo deixado de lado e alvo de piadas.",

correct:1,

xp:20,

options:[

"Ignorar",

"Convidar para participar",

"Rir junto"

],

feedback:[

"Ignorar não ajuda.",

"Boa escolha! Inclusão importa.",

"Piadas podem machucar."

]

},

{

icon:"📱",

title:
"Mensagem ofensiva",

text:
"Alguém compartilha uma imagem para humilhar outro aluno.",

correct:2,

xp:25,

options:[

"Compartilhar",

"Mandar emojis",

"Não compartilhar e avisar"

],

feedback:[

"Espalhar piora o problema.",

"Isso não resolve.",

"Atitude responsável."

]

},

{

icon:"🗣️",

title:
"Apelidos",

text:
"Um grupo insiste em chamar alguém por apelidos ofensivos.",

correct:0,

xp:30,

options:[

"Defender com respeito",

"Filmar",

"Ignorar"

],

feedback:[

"Empatia fortalece o ambiente.",

"Expor não resolve.",

"Silêncio nem sempre ajuda."

]

}

],

show(){

if(
this.opened
)
return;

Runner.stop();

this.opened=true;

const modal=

document.getElementById(
"modal-dilemma"
);

modal.classList.remove(
"hidden"
);

const item=

this.list[
this.index
%
this.list.length
];

setText(
"dilemma-icon",
item.icon
);

setText(
"dilemma-title",
item.title
);

setText(
"dilemma-text",
item.text
);

const area=

document.getElementById(
"dilemma-options"
);

area.innerHTML="";

item.options.forEach(

(
text,
i
)=>{

const btn=

document
.getElementById(
"template-dilemma-option"
)

.content

.firstElementChild

.cloneNode(
true
);

btn.textContent=
text;

btn.onclick=
()=>{

this.answer(
i
);

};

area.append(
btn);

}

);

document
.getElementById(
"dilemma-feedback"
)

.classList
.add(
"hidden"
);

},

answer(choice){

const item=

this.list[
this.index
%
this.list.length
];

const buttons=

document.querySelectorAll(
".dilemma-option-btn"
);

buttons.forEach(

(
b,
i
)=>{

if(
i===
item.correct
){

b.classList.add(
"correct"
);

}

if(

i===
choice

&&

i!==
item.correct

){

b.classList.add(
"wrong"
);

}

b.disabled=true;

}

);

const ok=

choice===
item.correct;

const text=

ok

?

item.feedback[
item.correct
]

:

item.feedback[
choice
];

document

.getElementById(
"dilemma-feedback"
)

.classList
.remove(
"hidden"
);

setText(

"dilemma-feedback-text",

text

);

setText(

"dilemma-feedback-xp",

ok

?

`+${item.xp} XP ⭐`

:

"+5 XP"

);

Progress.gainXP(

ok

?

item.xp

:

5

);

},

continue(){

document

.getElementById(
"modal-dilemma"
)

.classList
.add(
"hidden"
);

this.index++;

this.opened=false;

Runner.start();

}

};

/* ======================
BOTÃO CONTINUAR
====================== */

window.addEventListener(

"load",

()=>{

const btn=

document.getElementById(
"btn-dilemma-continue"
);

if(btn){

btn.addEventListener(

"click",

()=>{

Dilemma.continue();

}

);

}

});

/* ======================
APARECER DURANTE JOGO
====================== */

setInterval(

()=>{

if(

Runner.running

&&

!Dilemma.opened

&&

Math.random()>.7

){

Dilemma.show();

}

},

30000

);

/* ======================
BÔNUS
====================== */

Progress.gainRespect=
function(){

this.gainXP(
15
);

FX.showToast(
"💙 Empatia +15 XP"
);

};
/* ==========================================================
BLOCO 17 — SETTINGS SYSTEM
========================================================== */

const Settings={

playerName:
"Jogador",

lang:
"pt",

music:
70,

sfx:
80,

muted:false,

init(){

this.load();

this.bind();

this.render();

},

load(){

const save=
Save.load();

if(!save)
return;

this.playerName=
save.playerName
||
"Jogador";

this.lang=
save.lang
||
"pt";

this.music=
save.music
??
70;

this.sfx=
save.sfx
??
80;

this.muted=
save.muted
||
false;

},

save(){

const save=
Save.load()
||
{};

save.playerName=
this.playerName;

save.lang=
this.lang;

save.music=
this.music;

save.sfx=
this.sfx;

save.muted=
this.muted;

Save.save(
save
);

},

render(){

setText(

"menu-player-name",

this.playerName

);

const input=

document.getElementById(
"input-player-name"
);

if(input){

input.value=
this.playerName;

}

const login=

document.getElementById(
"input-login-name"
);

if(login){

login.value=
this.playerName;

}

const music=

document.getElementById(
"slider-music"
);

if(music){

music.value=
this.music;

}

const sfx=

document.getElementById(
"slider-sfx"
);

if(sfx){

sfx.value=
this.sfx;

}

},

setName(name){

if(
!name.trim()
)
return;

this.playerName=
name
.slice(
0,
16
);

this.save();

this.render();

FX.showToast(
"Nome salvo"
);

},

toggleMute(){

this.muted=
!this.muted;

if(
window.AudioEngine
){

window.AudioEngine.enabled=
!this.muted;

}

const btn=

document.getElementById(
"btn-mute"
);

if(btn){

btn.dataset.state=

this.muted

?

"muted"

:

"unmuted";

}

this.save();

},

changeLanguage(lang){

this.lang=
lang;

document.body
.dataset.lang=
lang;

this.save();

FX.showToast(

lang==="pt"

?

"Português"

:

lang==="en"

?

"English"

:

"Español"

);

},

changeMusic(v){

this.music=
Number(v);

if(
window.AudioEngine?.master
){

window.AudioEngine.master.gain.value=

(
this.music/
100
)
*
.06;

}

this.save();

},

changeSFX(v){

this.sfx=
Number(v);

this.save();

},

reset(){

if(

confirm(

"Apagar progresso?"

)

){

localStorage.clear();

location.reload();

}

},

fullscreen(){

if(

!document.fullscreenElement

){

document.documentElement
.requestFullscreen();

}

else{

document.exitFullscreen();

}

},

bind(){

document

.getElementById(
"btn-save-name"
)

?.addEventListener(

"click",

()=>{

const input=

document.getElementById(
"input-player-name"
);

this.setName(
input.value
);

}

);

document

.getElementById(
"btn-login-confirm"
)

?.addEventListener(

"click",

()=>{

const input=

document.getElementById(
"input-login-name"
);

this.setName(
input.value
);

document

.getElementById(
"modal-login"
)

?.classList
.add(
"hidden"
);

}

);

document

.querySelectorAll(
"[data-lang]"
)

.forEach(

b=>{

b.addEventListener(

"click",

()=>{

this.changeLanguage(

b.dataset.lang

);

}

);

}

);

document

.getElementById(
"slider-music"
)

?.addEventListener(

"input",

e=>{

this.changeMusic(

e.target.value

);

}

);

document

.getElementById(
"slider-sfx"
)

?.addEventListener(

"input",

e=>{

this.changeSFX(

e.target.value

);

}

);

document

.getElementById(
"btn-reset-data"
)

?.addEventListener(

"click",

()=>{

this.reset();

}

);

document

.getElementById(
"btn-mute"
)

?.addEventListener(

"click",

()=>{

this.toggleMute();

}

);

document

.getElementById(
"btn-fullscreen"
)

?.addEventListener(

"click",

()=>{

this.fullscreen();

}

);

}

};

/* ======================
PRIMEIRO ACESSO
====================== */

window.addEventListener(

"load",

()=>{

Settings.init();

if(

Settings.playerName
===

"Jogador"

){

document

.getElementById(
"modal-login"
)

?.classList
.remove(
"hidden"
);

}

});
/* ==========================================================
BLOCO 18 — MENU + NAVEGAÇÃO
========================================================== */

const UI={

current:"menu",

screens:[

"loading",
"menu",
"game",
"shop",
"settings",
"toprun",
"howto"

],

init(){

this.bind();

this.show(
"loading"
);

setTimeout(

()=>{

this.show(
"menu"
);

},

3500

);

},

show(name){

this.current=name;

document

.querySelectorAll(
".screen"
)

.forEach(

s=>{

s.classList.remove(
"active"
);

}

);

const target=

document.getElementById(
`screen-${name}`
);

if(target){

target.classList.add(
"active"
);

}

FX.screenTransition();

},

openGame(){

this.show(
"game"
);

Game.start();

},

backMenu(){

Runner.stop();

this.show(
"menu"
);

},

bind(){

this.on(
"btn-play",
()=>{

this.openGame();

}

);

this.on(
"btn-shop",
()=>{

this.show(
"shop"
);

}

);

this.on(
"btn-settings",
()=>{

this.show(
"settings"
);

}

);

this.on(
"btn-toprun",
()=>{

TopRun.render();

this.show(
"toprun"
);

}

);

this.on(
"btn-howto",
()=>{

this.show(
"howto"
);

}

);

document

.querySelectorAll(
".btn-back-menu"
)

.forEach(

b=>{

b.addEventListener(

"click",

()=>{

this.backMenu();

}

);

}

);

},

on(
id,
fn
){

document

.getElementById(
id
)

?.addEventListener(

"click",

fn

);

}

};

/* ======================
GAME FLOW
====================== */

const Game={

started:false,

start(){

if(
this.started
)
return;

this.started=true;

Progress.resetRun();

Runner.start();

HUD.update();

FX.showToast(
"Boa corrida!"
);

},

stop(){

Runner.stop();

this.started=false;

},

restart(){

this.stop();

setTimeout(

()=>{

this.start();

},

400

);

}

};

/* ======================
TOP RUN
====================== */

const TopRun={

list:[],

load(){

this.list=

JSON.parse(

localStorage.getItem(
"toprun"
)

||

"[]"

);

},

save(){

localStorage.setItem(

"toprun",

JSON.stringify(
this.list
)

);

},

push(){

this.load();

this.list.push({

name:
Settings.playerName,

score:
Progress.best,

level:
Progress.level

});

this.list=

this.list

.sort(

(
a,
b

)=>

b.score-
a.score

)

.slice(
0,
20
);

this.save();

},

render(){

this.load();

const area=

document.getElementById(
"ranking-list"
);

if(!area)
return;

area.innerHTML="";

this.list.forEach(

(
r,
i
)=>{

const row=

document.createElement(
"div"
);

row.className=
"rank-item";

row.innerHTML=`

<span>

${i+1}

</span>

<span>

${r.name}

</span>

<span>

${r.score}

</span>

<span>

Lv.${r.level}

</span>

`;

area.append(
row
);

}

);

}

};

/* ======================
HUD
====================== */

const HUD={

update(){

setInterval(

()=>{

if(
!Runner.running
)
return;

Progress.addScore(
1
);

setText(

"hud-distance",

Math.floor(
Runner.world.distance
)

);

},

250

);

}

};

/* ======================
COMO JOGAR
====================== */

const Tutorial={

steps:[

"Desvie dos obstáculos",

"Pegue moedas e gemas",

"Escolha atitudes positivas",

"Ganhe XP",

"Suba de nível"

],

show(){

let i=0;

const next=()=>{

if(
i>=
this.steps.length
)
return;

FX.showToast(

this.steps[i]

);

i++;

setTimeout(
next,
1800
);

};

next();

}

};

document

.getElementById(
"btn-show-tutorial"
)

?.addEventListener(

"click",

()=>{

Tutorial.show();

}

);

/* ======================
GAME OVER
====================== */

const oldShow=
GameOver.show
.bind(
GameOver
);

GameOver.show=
function(){

oldShow();

TopRun.push();

};

/* ======================
AUTO
====================== */

window.addEventListener(

"load",

()=>{

UI.init();

});
/* ==========================================================
BLOCO 19 — ENDGAME SYSTEM
========================================================== */

const Achievements={

list:[

{
id:"first_run",
name:"Primeira Corrida",
desc:"Jogue pela primeira vez",
check:()=>Progress.score>0
},

{
id:"collector",
name:"Colecionador",
desc:"Pegue 100 moedas",
check:()=>Progress.coins>=100
},

{
id:"respect",
name:"Agente da Empatia",
desc:"Alcance nível 10",
check:()=>Progress.level>=10
},

{
id:"legend",
name:"Lenda Anti-Bullying",
desc:"Faça 5000 pontos",
check:()=>Progress.best>=5000
}

],

unlocked:[],

init(){

const save=
Save.load();

this.unlocked=
save?.achievements
||
[];

this.check();

},

persist(){

const save=
Save.load()
||
{};

save.achievements=
this.unlocked;

Save.save(save);

},

unlock(id){

if(
this.unlocked.includes(id)
)
return;

const item=

this.list.find(
x=>x.id===id
);

if(!item)
return;

this.unlocked.push(
id
);

this.persist();

FX.showToast(
`🏆 ${item.name}`
);

},

check(){

this.list.forEach(

a=>{

if(

a.check()

&&

!this.unlocked.includes(
a.id
)

){

this.unlock(
a.id
);

}

}

);

}

};

/* ====================== */

const Daily={

current:null,

create(){

const missions=[

{

title:
"Pegue 20 moedas",

goal:20,

type:"coins"

},

{

title:
"Ganhe 150 XP",

goal:150,

type:"xp"

},

{

title:
"Corra 3000m",

goal:3000,

type:"distance"

}

];

this.current=

missions[
new Date()
.getDate()

%
missions.length
];

this.render();

},

progress(){

if(
!this.current
)
return 0;

switch(
this.current.type
){

case "coins":
return Progress.coins;

case "xp":
return Progress.xp;

case "distance":
return Runner.world.distance;

}

return 0;

},

render(){

const el=

document.getElementById(
"daily-title"
);

if(el){

el.textContent=
this.current.title;

}

},

check(){

if(
!this.current
)
return;

if(

this.progress()

>=

this.current.goal

){

FX.showToast(
"🎁 Missão concluída"
);

Progress.addGem(
5
);

this.create();

}

}

};

/* ====================== */

const Notify={

show(
title,
text
){

const box=

document.createElement(
"div"
);

box.className=
"notify";

box.innerHTML=

`
<h3>${title}</h3>
<p>${text}</p>
`;

document.body.append(
box
);

setTimeout(

()=>{

box.remove();

},

3500

);

}

};

/* ====================== */

const Victory={

show(){

Runner.stop();

const modal=

document.getElementById(
"modal-victory"
);

if(!modal)
return;

modal.classList.remove(
"hidden"
);

setText(

"victory-score",

Progress.score

);

setText(

"victory-level",

Progress.level

);

FX.showToast(
"🏆 Vitória!"
);

},

check(){

if(
Progress.level>=10
){

this.show();

}

}

};

/* ====================== */

const Credits={

show(){

alert(

`
ANTI-BULLYING RUNNER v2.0 ULTRA

Criado por:

Izael de Souza Costa
Felipe

Projeto educativo.

Corra.
Decida.
Faça a diferença.
`

);

}

};

/* ====================== */

const Exporter={

download(){

const data={

player:
Settings.playerName,

score:
Progress.best,

level:
Progress.level,

coins:
Progress.coins,

gems:
Progress.gems,

date:
new Date()

};

const blob=

new Blob(

[
JSON.stringify(
data,
null,
2
)
],

{
type:
"application/json"
}

);

const a=

document.createElement(
"a"
);

a.href=

URL.createObjectURL(
blob
);

a.download=

"anti-bullying-runner-save.json";

a.click();

FX.showToast(
"💾 Exportado"
);

}

};

/* ====================== */

setInterval(

()=>{

Achievements.check();

Daily.check();

Victory.check();

},

5000

);

/* ====================== */

window.addEventListener(

"load",

()=>{

Achievements.init();

Daily.create();

document

.getElementById(
"btn-export"
)

?.addEventListener(

"click",

()=>{

Exporter.download();

}

);

document

.getElementById(
"btn-credits"
)

?.addEventListener(

"click",

()=>{

Credits.show();

}

);

Notify.show(

"ANTI-BULLYING RUNNER",

"Bem-vindo ao jogo!"

);

});
/* ==========================================================
PWA EMBUTIDO — SEM ARQUIVOS EXTRAS
========================================================== */

(function(){

/* ---------- MANIFEST ---------- */

const manifest={

name:
"ANTI-BULLYING RUNNER v2.0 ULTRA",

short_name:
"AB RUNNER",

description:
"Corra. Decida. Faça a diferença.",

start_url:"./",

display:
"standalone",

background_color:
"#120028",

theme_color:
"#6f47ff",

orientation:
"portrait",

icons:[]

};

const blob=
new Blob(

[
JSON.stringify(
manifest
)
],

{
type:
"application/json"
}

);

const url=
URL.createObjectURL(
blob
);

const link=
document.createElement(
"link"
);

link.rel=
"manifest";

link.href=
url;

document.head.append(
link
);

/* ---------- SERVICE WORKER ---------- */

if(

"serviceWorker"

in

navigator

){

const sw=`

const CACHE=
"abrunner-v2";

self.addEventListener(

"install",

e=>{

e.waitUntil(

caches
.open(CACHE)

.then(

c=>

c.addAll([

"./"

])

)

);

}

);

self.addEventListener(

"fetch",

e=>{

e.respondWith(

caches
.match(
e.request
)

.then(

r=>

r||

fetch(
e.request
)

)

);

}

);

`;

const swBlob=
new Blob(

[
sw
],

{
type:
"text/javascript"
}

);

const swUrl=

URL.createObjectURL(
swBlob
);

window.addEventListener(

"load",

()=>{

navigator
.serviceWorker
.register(
swUrl
);

}

);

}

/* ---------- BOTÃO INSTALAR ---------- */

let deferred;

window.addEventListener(

"beforeinstallprompt",

e=>{

e.preventDefault();

deferred=e;

const btn=

document.getElementById(
"btn-install"
);

if(btn){

btn.style.display=
"block";

}

}

);

document

.getElementById(
"btn-install"
)

?.addEventListener(

"click",

async()=>{

if(
!deferred
)
return;

deferred.prompt();

await deferred.userChoice;

deferred=null;

}

);

})();
