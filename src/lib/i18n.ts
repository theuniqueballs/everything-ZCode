import { useCallback, useSyncExternalStore } from 'react';
import type { ToolkitCategoryId } from './toolkit-types';

/**
 * Lightweight i18n layer: a flat RU/EN dictionary + a hydration-safe
 * language hook (useSyncExternalStore, same pattern as use-favorites).
 * No extra dependencies; persistence via localStorage («ezc-lang»).
 */

export type Lang = 'ru' | 'en';

export const LANGS: { id: Lang; label: string; full: string }[] = [
  { id: 'ru', label: 'RU', full: 'Русский' },
  { id: 'en', label: 'EN', full: 'English' },
];

type Entry = { ru: string; en: string };

const DICT: Record<string, Entry> = {
  /* ---- Header ---- */
  'nav.catalog': { ru: 'Каталог', en: 'Catalog' },
  'nav.concepts': { ru: 'Концепты', en: 'Concepts' },
  'nav.install': { ru: 'Установка', en: 'Install' },
  'nav.principles': { ru: 'Принципы', en: 'Principles' },
  'header.subtitle': { ru: 'конфиги для Z.ai Code', en: 'configs for Z.ai Code' },
  'header.search': { ru: 'Поиск', en: 'Search' },
  'header.openCatalog': { ru: 'Открыть каталог', en: 'Open catalog' },
  'aria.mainNav': { ru: 'Основная навигация', en: 'Main navigation' },
  'aria.mobileNav': { ru: 'Мобильная навигация', en: 'Mobile navigation' },
  'aria.openPalette': { ru: 'Открыть палитру команд (Cmd+K)', en: 'Open command palette (Cmd+K)' },
  'aria.shortcuts': { ru: 'Горячие клавиши (?)', en: 'Keyboard shortcuts (?)' },
  'aria.githubRef': { ru: 'Референс-репозиторий на GitHub', en: 'Reference repository on GitHub' },
  'aria.toggleTheme': { ru: 'Переключить тему', en: 'Toggle theme' },
  'aria.toggleLang': { ru: 'Переключить язык интерфейса', en: 'Switch interface language' },
  'tip.palette': { ru: 'Палитра команд — ⌘K', en: 'Command palette — ⌘K' },
  'tip.shortcuts': { ru: 'Горячие клавиши — ?', en: 'Keyboard shortcuts — ?' },
  'tip.githubRef': { ru: 'Референс: everything-claude-code', en: 'Reference: everything-claude-code' },
  'tip.theme': { ru: 'Светлая / тёмная тема', en: 'Light / dark theme' },

  /* ---- Hero ---- */
  'hero.badge': {
    ru: 'Вдохновлено everything-claude-code · Собрано для Z.ai',
    en: 'Inspired by everything-claude-code · Built for Z.ai',
  },
  'hero.subA': {
    ru: 'Полная коллекция production-ready конфигов для ZCode / Z.ai:',
    en: 'A complete collection of production-ready configs for ZCode / Z.ai:',
  },
  'hero.subHL': { ru: 'агенты, команды, скиллы, правила, хуки', en: 'agents, commands, skills, rules, hooks' },
  'hero.subB': {
    ru: '— выработанные в реальной разработке с моделями GLM. Копируй, адаптируй, используй.',
    en: '— forged in real-world development with GLM models. Copy, adapt, and use them.',
  },
  'hero.ctaCatalog': { ru: 'Смотреть каталог', en: 'Browse catalog' },
  'hero.ctaInstall': { ru: 'Установка', en: 'Installation' },
  'hero.total': { ru: 'файлов · 7 категорий · MIT license', en: 'files · 7 categories · MIT license' },
  'hero.loading': { ru: 'Загрузка каталога…', en: 'Loading catalog…' },

  /* ---- Config of the day ---- */
  'day.aria': { ru: 'Конфиг дня', en: 'Config of the day' },
  'day.badge': { ru: 'Конфиг дня', en: 'Config of the day' },
  'day.open': { ru: 'Открыть', en: 'Open' },
  'day.lines': { ru: '{n} строк', en: '{n} lines' },
  'day.prevDay': { ru: 'Предыдущий день', en: 'Previous day' },
  'day.nextDay': { ru: 'Следующий день', en: 'Next day' },
  'day.backToToday': { ru: 'Вернуться к сегодняшнему конфигу', en: 'Back to today’s config' },
  'day.rel.today': { ru: 'Сегодня', en: 'Today' },
  'day.rel.yesterday': { ru: 'Вчера', en: 'Yesterday' },
  'day.rel.tomorrow': { ru: 'Завтра', en: 'Tomorrow' },
  'day.rel.ago': { ru: '{n} дн. назад', en: '{n} day(s) ago' },
  'day.rel.in': { ru: 'через {n} дн.', en: 'in {n} day(s)' },
  'day.inCatalog': { ru: 'Показать в каталоге', en: 'Locate in catalog' },

  /* ---- Item detail sheet ---- */
  'detail.aria': { ru: 'Просмотр конфига', en: 'Config details' },
  'detail.viewOnGithub': { ru: 'Открыть файл на GitHub', en: 'View file on GitHub' },

  /* ---- Categories ---- */
  'cat.all': { ru: 'Все', en: 'All' },
  'cat.agents': { ru: 'Агенты', en: 'Agents' },
  'cat.commands': { ru: 'Команды', en: 'Commands' },
  'cat.skills': { ru: 'Скиллы', en: 'Skills' },
  'cat.rules': { ru: 'Правила', en: 'Rules' },
  'cat.hooks': { ru: 'Хуки', en: 'Hooks' },
  'cat.contexts': { ru: 'Контексты', en: 'Contexts' },
  'cat.settings': { ru: 'Настройки', en: 'Settings' },
  'cat1.agents': { ru: 'Агент', en: 'Agent' },
  'cat1.commands': { ru: 'Команда', en: 'Command' },
  'cat1.skills': { ru: 'Скилл', en: 'Skill' },
  'cat1.rules': { ru: 'Правило', en: 'Rule' },
  'cat1.hooks': { ru: 'Хук', en: 'Hook' },
  'cat1.contexts': { ru: 'Контекст', en: 'Context' },
  'cat1.settings': { ru: 'Настройки', en: 'Settings' },

  /* ---- Catalog ---- */
  'catalog.title': { ru: 'Каталог конфигов', en: 'Config catalog' },
  'catalog.desc': {
    ru: 'Все {n} файлов тулкита. Ищите, просматривайте, копируйте и скачивайте — каждый файл готов к использованию.',
    en: 'All {n} toolkit files. Search, preview, copy and download — every file is ready to use.',
  },
  'catalog.searchPh': { ru: 'Поиск: tdd, security, hooks, z-ai…', en: 'Search: tdd, security, hooks, z-ai…' },
  'catalog.searchAria': { ru: 'Поиск по каталогу', en: 'Search the catalog' },
  'catalog.clearSearch': { ru: 'Очистить поиск', en: 'Clear search' },
  'catalog.random': { ru: 'Случайный конфиг', en: 'Random config' },
  'catalog.compare': { ru: 'Сравнить два конфига (diff)', en: 'Compare two configs (diff)' },
  'catalog.allTab': { ru: 'Все · {n}', en: 'All · {n}' },
  'catalog.favTab': { ru: 'Избранное · {n}', en: 'Favorites · {n}' },
  'catalog.filterAria': { ru: 'Фильтр по категориям', en: 'Filter by category' },
  'catalog.copyCategory': { ru: 'Копировать категорию', en: 'Copy category' },
  'catalog.copyCategoryTitle': {
    ru: 'Скопировать все файлы категории (с разделителями)',
    en: 'Copy all files of the category (with separators)',
  },
  'catalog.zipTitle': {
    ru: 'Скачать все файлы категории ZIP-архивом',
    en: 'Download all category files as a ZIP archive',
  },
  'catalog.favOnly': { ru: 'Показаны только избранные конфиги ({n})', en: 'Showing favorites only ({n})' },
  'catalog.collection': { ru: 'Коллекция избранного', en: 'Favorites collection' },
  'catalog.colCount': { ru: '{n} шт.', en: '{n}' },
  'catalog.colNew': { ru: 'Новая коллекция', en: 'New collection' },
  'catalog.colRename': { ru: 'Переименовать коллекцию', en: 'Rename collection' },
  'catalog.colDelete': { ru: 'Удалить коллекцию', en: 'Delete collection' },
  'catalog.colDialogTitleCreate': { ru: 'Новая коллекция избранного', en: 'New favorites collection' },
  'catalog.colDialogTitleRename': { ru: 'Переименовать коллекцию', en: 'Rename collection' },
  'catalog.colDialogDescCreate': {
    ru: 'Звёздочка ★ добавляет конфиг в активную коллекцию — переключайтесь между наборами в любой момент.',
    en: 'Starring a config adds it to the active collection — switch between sets any time.',
  },
  'catalog.colDialogDescRename': {
    ru: 'Введите новое название для активной коллекции.',
    en: 'Enter a new name for the active collection.',
  },
  'catalog.colNamePh': { ru: 'Название коллекции', en: 'Collection name' },
  'catalog.colCreate': { ru: 'Создать', en: 'Create' },
  'catalog.colSave': { ru: 'Сохранить', en: 'Save' },
  'catalog.colCancel': { ru: 'Отмена', en: 'Cancel' },
  'catalog.colDeleteTitle': { ru: 'Удалить коллекцию «{name}»?', en: 'Delete collection “{name}”?' },
  'catalog.colDeleteDesc': {
    ru: 'Будет удалена подборка из {n} конфиг(ов). Сами конфиги останутся в тулките. Действие необратимо.',
    en: 'The curated list of {n} config(s) will be removed. The configs themselves stay in the toolkit. This cannot be undone.',
  },
  'catalog.colDeleteConfirm': { ru: 'Удалить', en: 'Delete' },
  'catalog.import': { ru: 'Импорт', en: 'Import' },
  'catalog.importTitle': {
    ru: 'Импортировать избранное из JSON (экспорт этого сайта или массив путей)',
    en: "Import favorites from JSON (this site's export or a plain path array)",
  },
  'catalog.exportFav': { ru: 'Экспорт избранного', en: 'Export favorites' },
  'catalog.exportFavTitle': {
    ru: 'Скачать избранное как JSON (пути + метаданные)',
    en: 'Download favorites as JSON (paths + metadata)',
  },
  'catalog.recent': { ru: 'Недавние:', en: 'Recent:' },
  'catalog.clearRecent': { ru: 'Очистить историю просмотров', en: 'Clear view history' },
  'catalog.densityComfortable': { ru: 'Обычная плотность списка', en: 'Comfortable list density' },
  'catalog.densityCompact': { ru: 'Компактная плотность списка', en: 'Compact list density' },
  'catalog.searchFocus': {
    ru: 'Фокус на поиск — клавиша /',
    en: 'Focus search — press /',
  },
  'catalog.found': { ru: 'Найдено:', en: 'Found:' },
  'catalog.zipSearchTitle': { ru: 'Скачать найденные конфиги ZIP-архивом ({n})', en: 'Download the found configs as a ZIP archive ({n})' },
  'catalog.navHint': { ru: '↑/↓ или j/k — навигация', en: '↑/↓ or j/k — navigate' },
  'catalog.emptyFav': {
    ru: 'В избранном пока пусто — добавьте конфиги звёздочкой ★',
    en: 'Favorites are empty — star some configs ★',
  },
  'catalog.emptyQuery': { ru: 'Ничего не найдено по запросу «{q}»', en: 'Nothing found for “{q}”' },
  'catalog.resetFilters': { ru: 'Сбросить фильтры', en: 'Reset filters' },
  'catalog.selectFile': { ru: 'Выберите файл слева', en: 'Pick a file on the left' },
  'catalog.emptyPreview': { ru: 'Здесь появится выбранный конфиг', en: 'The selected config will appear here' },
  'catalog.orBrowse': { ru: 'или листайте', en: 'or browse with' },
  'catalog.andOpen': { ru: 'и открывайте', en: 'and open with' },
  'catalog.lines': { ru: 'строк', en: 'lines' },
  'catalog.linesShort': { ru: 'стр.', en: 'lines' },
  'catalog.reload': { ru: 'Перезагрузить', en: 'Reload' },
  'catalog.unknownError': { ru: 'Неизвестная ошибка', en: 'Unknown error' },

  /* ---- Item actions ---- */
  'item.copyLink': { ru: 'Скопировать ссылку на конфиг', en: 'Copy config link' },
  'item.copyOg': { ru: 'Скопировать OG-ссылку (картинка-превью для соцсетей)', en: 'Copy OG link (social preview image)' },
  'item.favAdd': { ru: 'В избранное', en: 'Add to favorites' },
  'item.favRemove': { ru: 'Убрать из избранного', en: 'Remove from favorites' },
  'item.done': { ru: 'Готово', en: 'Done' },
  'item.copy': { ru: 'Копировать', en: 'Copy' },
  'item.copied': { ru: 'Скопировано', en: 'Copied' },
  'item.copyConfig': { ru: 'Скопировать конфиг', en: 'Copy config' },
  'item.download': { ru: 'Скачать', en: 'Download' },
  'item.downloadName': { ru: 'Скачать {name}', en: 'Download {name}' },

  /* ---- Toasts ---- */
  'toast.copied': { ru: 'Скопировано в буфер обмена', en: 'Copied to clipboard' },
  'toast.copyFailed': { ru: 'Не удалось скопировать', en: 'Failed to copy' },
  'toast.linkCopied': { ru: 'Ссылка на конфиг скопирована', en: 'Config link copied' },
  'toast.ogCopied': { ru: 'OG-ссылка с картинкой-превью скопирована', en: 'OG preview image link copied' },
  'toast.colCreated': { ru: 'Коллекция «{name}» создана и активирована', en: 'Collection “{name}” created and activated' },
  'toast.colRenamed': { ru: 'Коллекция переименована в «{name}»', en: 'Collection renamed to “{name}”' },
  'toast.colDeleted': { ru: 'Коллекция «{name}» удалена', en: 'Collection “{name}” deleted' },
  'toast.colExists': { ru: 'Коллекция с таким названием уже существует (или название пустое)', en: 'A collection with this name already exists (or the name is empty)' },
  'toast.linkCopyFailed': { ru: 'Не удалось скопировать ссылку', en: 'Failed to copy the link' },
  'toast.downloaded': { ru: 'Скачано: {name}', en: 'Downloaded: {name}' },
  'toast.importInvalid': {
    ru: 'Некорректный файл — ожидается JSON экспорта избранного',
    en: 'Invalid file — expected a favorites export JSON',
  },
  'toast.importNoneKnown': {
    ru: 'В файле нет ни одного пути из этого каталога',
    en: 'The file contains no paths from this catalog',
  },
  'toast.importOk': { ru: 'Импорт избранного: {parts}', en: 'Favorites import: {parts}' },
  'toast.importReadFailed': { ru: 'Не удалось прочитать файл', en: 'Failed to read the file' },
  'toast.randomEmpty': { ru: 'Нет конфигов для случайного выбора', en: 'No configs to pick from' },
  'toast.randomPick': { ru: 'Случайный выбор: {name}', en: 'Random pick: {name}' },
  'toast.categoryCopied': {
    ru: 'Скопировано {n} файлов категории «{cat}»',
    en: 'Copied {n} files from “{cat}”',
  },
  'import.new': { ru: '+{n} новых', en: '+{n} new' },
  'import.existing': { ru: '{n} уже были', en: '{n} already added' },
  'import.unknown': { ru: '{n} не найдено в каталоге', en: '{n} not found in the catalog' },
  'toast.catalogDownloaded': { ru: 'Каталог скачан (JSON)', en: 'Catalog downloaded (JSON)' },
  'toast.downloadFailed': { ru: 'Ошибка скачивания', en: 'Download failed' },
  'toast.zipEmpty': { ru: 'Нет файлов для архивации', en: 'No files to archive' },
  'toast.zipDownloaded': { ru: 'Скачано: {name} ({n} файлов)', en: 'Downloaded: {name} ({n} files)' },
  'toast.zipFailed': { ru: 'Не удалось собрать ZIP-архив', en: 'Failed to build the ZIP archive' },
  'toast.favEmpty': { ru: 'Избранное пусто — сначала добавьте конфиги ★', en: 'Favorites are empty — star some configs ★ first' },
  'toast.favExported': { ru: 'Экспортировано избранное: {n} конфигов', en: 'Favorites exported: {n} configs' },
  'toast.favExportFailed': { ru: 'Не удалось экспортировать избранное', en: 'Failed to export favorites' },

  /* ---- Stats ---- */
  'stats.title': { ru: 'Аналитика тулкита', en: 'Toolkit analytics' },
  'stats.desc': {
    ru: 'Распределение конфигов по категориям, крупнейшие файлы и агрегаты — вся статистика считается из фактического содержимого каталога.',
    en: 'Category distribution, largest files and totals — every number is computed from the actual catalog content.',
  },
  'stats.byCategory': { ru: 'Конфиги по категориям', en: 'Configs by category' },
  'stats.byCategoryDesc': {
    ru: 'Сколько конфигов в каждой из 7 категорий',
    en: 'How many configs live in each of the 7 categories',
  },
  'stats.top5': { ru: 'Топ-5 крупнейших', en: 'Top 5 largest' },
  'stats.top5Desc': { ru: 'Конфиги с наибольшим числом строк', en: 'Configs with the most lines' },
  'stats.totalLines': { ru: 'Всего строк', en: 'Total lines' },
  'stats.totalSize': { ru: 'Суммарный размер', en: 'Combined size' },
  'stats.avgLines': { ru: 'В среднем строк', en: 'Average lines' },
  'stats.ariaCat': { ru: '{cat}: {n} конфигов', en: '{cat}: {n} configs' },
  'stats.ariaItem': { ru: '{name}: {n} строк', en: '{name}: {n} lines' },
  'stats.footerA': { ru: 'Самая наполненная категория — ', en: 'The biggest category is ' },
  'stats.footerCount': { ru: '{n} конфигов', en: '{n} configs' },
  'stats.footerB': { ru: '; медианный размер файла — ', en: '; the median file size is ' },
  'stats.footerLines': { ru: '{n} строк', en: '{n} lines' },

  /* ---- Concepts ---- */
  'concepts.title': { ru: 'Ключевые концепты', en: 'Key concepts' },
  'concepts.desc': {
    ru: 'Шесть идей, на которых построен тулкит. Они важнее отдельных файлов — файлы меняются, принципы остаются.',
    en: 'Six ideas the toolkit is built on. They matter more than individual files — files change, principles stay.',
  },
  'concepts.c1.title': { ru: 'Внешняя память', en: 'External memory' },
  'concepts.c1.tagline': { ru: 'worklog.md вместо забывчивости', en: 'worklog.md beats forgetfulness' },
  'concepts.c1.text': {
    ru: 'Контекст диалога волатилен — файл на диске нет. Каждая сессия читает worklog, пишет checkpoint-ы и завершается handover-ом. Решения переживают перезапуск.',
    en: 'Chat context is volatile — a file on disk is not. Every session reads the worklog, writes checkpoints and ends with a handover. Decisions survive restarts.',
  },
  'concepts.c2.title': { ru: 'Циклы верификации', en: 'Verification loops' },
  'concepts.c2.tagline': { ru: '«сборка прошла» ≠ «работает»', en: '“the build passed” ≠ “it works”' },
  'concepts.c2.text': {
    ru: 'Каждая фича проходит: lint → dev.log → браузерный golden path → layout. Протокол встроен в агента e2e-runner и команду /verify.',
    en: 'Every feature goes through: lint → dev.log → browser golden path → layout. The protocol is built into the e2e-runner agent and the /verify command.',
  },
  'concepts.c3.title': { ru: 'Делегирование как защита контекста', en: 'Delegation as context protection' },
  'concepts.c3.tagline': { ru: 'субагенты поглощают шум', en: 'subagents absorb the noise' },
  'concepts.c3.text': {
    ru: 'У субагентов свежее контекстное окно. Поиск — Explore, ревью — code-reviewer, самостоятельные сборки — full-stack-developer. У вас остаётся только оркестрация.',
    en: 'Subagents get a fresh context window. Search — Explore, review — code-reviewer, autonomous builds — full-stack-developer. Only orchestration stays with you.',
  },
  'concepts.c4.title': { ru: 'Непрерывное обучение', en: 'Continuous learning' },
  'concepts.c4.tagline': { ru: 'сессия → скилл', en: 'session → skill' },
  'concepts.c4.text': {
    ru: '/learn превращает открытые с трудом решения в скиллы с разделом «pitfalls». Через ~10 сессий тулкит кодифицирует месяцы опыта — так строился референс-репозиторий.',
    en: '/learn turns hard-won solutions into skills with a “pitfalls” section. After ~10 sessions the toolkit codifies months of experience — that is how the reference repo was built.',
  },
  'concepts.c5.title': { ru: 'Ревью с фильтром уверенности', en: 'Confidence-filtered review' },
  'concepts.c5.tagline': { ru: 'только находки >80%', en: 'only findings >80%' },
  'concepts.c5.text': {
    ru: 'Каждая находка обязана иметь file:line, сценарий отказа и защищаемую severity. Инфляция severity разрушает доверие быстрее пропущенных багов.',
    en: 'Every finding must carry a file:line, a failure scenario and a defensible severity. Severity inflation destroys trust faster than missed bugs.',
  },
  'concepts.c6.title': { ru: 'Дисциплина контекста', en: 'Context discipline' },
  'concepts.c6.tagline': { ru: 'токены — конечный ресурс', en: 'tokens are a finite resource' },
  'concepts.c6.text': {
    ru: 'Читай лениво (offset/limit), грепай вместо полных файлов, делегируй explore-задачи, checkpoint при насыщении. Todo-лист — операционная память сессии.',
    en: "Read lazily (offset/limit), grep instead of full files, delegate explore tasks, checkpoint when saturated. The todo list is the session's operating memory.",
  },

  /* ---- Install ---- */
  'install.title': { ru: 'Установка', en: 'Installation' },
  'install.desc': {
    ru: 'Три способа начать: скопировать файлы, подключить хуки или просто перенять workflow.',
    en: 'Three ways to start: copy the files, wire up the hooks, or simply adopt the workflow.',
  },
  'install.catalogJson': { ru: 'Каталог (JSON)', en: 'Catalog (JSON)' },
  'install.fullZip': { ru: 'Весь тулкит (ZIP)', en: 'Full toolkit (ZIP)' },
  'install.step': { ru: 'шаг {n}/3', en: 'step {n}/3' },
  'install.s1.title': { ru: 'Скопируйте конфиги', en: 'Copy the configs' },
  'install.s1.desc': {
    ru: 'Агенты, команды, скиллы и правила — обычные файлы. Скачайте ZIP или копируйте только нужное.',
    en: 'Agents, commands, skills and rules are plain files. Grab the ZIP or copy only what you need.',
  },
  'install.s2.title': { ru: 'Подключите хуки', en: 'Wire up the hooks' },
  'install.s2.desc': {
    ru: 'Пять кроссплатформенных Node-скриптов: защита от footgun-ов, напоминания, восстановление памяти.',
    en: 'Five cross-platform Node scripts: footgun protection, reminders, memory recovery.',
  },
  'install.s3.title': { ru: 'Примите workflow', en: 'Adopt the workflow' },
  'install.s3.desc': {
    ru: 'Две привычки дают 80% ценности даже без установки файлов.',
    en: 'Two habits deliver 80% of the value even without installing any files.',
  },

  /* ---- Principles ---- */
  'principles.title': { ru: 'Важные принципы', en: 'Important principles' },
  'principles.desc': {
    ru: 'Из практики референс-репозитория: что работает в продакшене, а что выглядит хорошо только в README.',
    en: 'From the reference repo’s practice: what works in production and what only looks good in a README.',
  },
  'principles.p1.title': { ru: 'Выбор модели', en: 'Model choice' },
  'principles.p1.a': {
    ru: 'glm-4.6 — для кода: ревью, резолвер ошибок, дизайн API',
    en: 'glm-4.6 — for code: review, error resolver, API design',
  },
  'principles.p1.b': {
    ru: 'glm-4.5-air — для лёгких задач: документация, worklog',
    en: 'glm-4.5-air — for light tasks: docs, worklog',
  },
  'principles.p1.c': {
    ru: 'Дорогая модель не нужна там, где важна скорость, а не глубина',
    en: 'An expensive model is not needed where speed matters more than depth',
  },
  'principles.p2.title': { ru: 'Бюджет контекстного окна', en: 'Context-window budget' },
  'principles.p2.a': {
    ru: 'Настройте 20–30 MCP, но держите включёнными меньше 10 на проект',
    en: 'Configure 20–30 MCP servers but keep fewer than 10 enabled per project',
  },
  'principles.p2.b': {
    ru: 'До 80 активных инструментов — дальше полезный контекст тает',
    en: 'Up to 80 active tools — beyond that the useful context fades',
  },
  'principles.p2.c': {
    ru: 'Каждый включённый инструмент — налог на каждый следующий вызов',
    en: 'Every enabled tool is a tax on every next call',
  },
  'principles.p3.title': { ru: 'Кастомизация', en: 'Customization' },
  'principles.p3.a': {
    ru: 'Эти конфиги кодифицируют один workflow — ваш может отличаться',
    en: 'These configs codify one workflow — yours may differ',
  },
  'principles.p3.b': {
    ru: 'Начните с резонирующего, модифицируйте под свой стек',
    en: 'Start with what resonates, adapt it to your stack',
  },
  'principles.p3.c': {
    ru: 'Удаляйте неиспользуемое, добавляйте своё через /learn',
    en: "Delete what you don't use, add your own via /learn",
  },
  'principles.alertTitle': { ru: 'Правило большого пальца', en: 'Rule of thumb' },
  'principles.alertText': {
    ru: 'Начните с worklog-протокола и цикла верификации — они дают максимальный эффект уже на первой неделе. Остальное подключайте по мере роста проекта.',
    en: 'Start with the worklog protocol and the verification loop — they deliver the most value within the first week already. Adopt the rest as the project grows.',
  },

  /* ---- Footer ---- */
  'footer.tagline': {
    ru: 'Конфиги, выработанные в реальной разработке с ZCode и моделями GLM. Копируйте, адаптируйте под свой стек, возвращайте улучшения.',
    en: 'Configs forged in real-world development with ZCode and GLM models. Copy them, adapt them to your stack, and give improvements back.',
  },
  'footer.sections': { ru: 'Разделы', en: 'Sections' },
  'footer.linkCatalog': { ru: 'Каталог конфигов', en: 'Config catalog' },
  'footer.linkConcepts': { ru: 'Ключевые концепты', en: 'Key concepts' },
  'footer.linkInstall': { ru: 'Установка', en: 'Installation' },
  'footer.linkPrinciples': { ru: 'Принципы', en: 'Principles' },
  'footer.sources': { ru: 'Источники', en: 'Sources' },
  'footer.refLink': { ru: 'everything-claude-code (референс)', en: 'everything-claude-code (reference)' },
  'footer.made': { ru: 'Everything ZCode · MIT License · Сделано с ZCode', en: 'Everything ZCode · MIT License · Built with ZCode' },

  /* ---- Command palette ---- */
  'palette.ph': { ru: 'Поиск конфигов: tdd, security, hooks…', en: 'Search configs: tdd, security, hooks…' },
  'palette.empty': {
    ru: 'Ничего не найдено. Попробуйте: «review», «prisma», «hook»…',
    en: 'Nothing found. Try: “review”, “prisma”, “hook”…',
  },
  'palette.actions': { ru: 'Действия', en: 'Actions' },
  'palette.random': { ru: 'Случайный конфиг', en: 'Random config' },
  'palette.showFav': { ru: 'Показать избранное', en: 'Show favorites' },
  'palette.toggleTheme': { ru: 'Переключить тему', en: 'Toggle theme' },
  'palette.compare': { ru: 'Сравнить два конфига (diff)', en: 'Compare two configs (diff)' },
  'palette.downloadZip': { ru: 'Скачать весь тулкит (ZIP)', en: 'Download the full toolkit (ZIP)' },
  'palette.shortcuts': { ru: 'Горячие клавиши', en: 'Keyboard shortcuts' },
  'palette.sections': { ru: 'Разделы', en: 'Sections' },
  'palette.recent': { ru: 'Недавние конфиги', en: 'Recent configs' },
  'palette.similarHeading': { ru: 'Похожие на {name}', en: 'Similar to {name}' },
  'palette.compareSimilar': {
    ru: 'Diff выбранного с самым похожим',
    en: 'Diff selection with its closest match',
  },
  'palette.sec.catalog': { ru: 'Каталог конфигов', en: 'Config catalog' },
  'palette.sec.stats': { ru: 'Аналитика тулкита', en: 'Toolkit analytics' },
  'palette.sec.concepts': { ru: 'Ключевые концепты', en: 'Key concepts' },
  'palette.sec.install': { ru: 'Установка', en: 'Installation' },
  'palette.sec.principles': { ru: 'Принципы', en: 'Principles' },
  'palette.footer': { ru: 'Палитра открывается по', en: 'Palette opens with' },

  /* ---- Compare dialog ---- */
  'compare.title': { ru: 'Сравнение конфигов', en: 'Compare configs' },
  'compare.desc': {
    ru: 'Unified diff по содержимому (frontmatter не учитывается). Выберите два конфига.',
    en: 'Unified diff of the content (frontmatter excluded). Pick two configs.',
  },
  'compare.phA': { ru: 'Конфиг A (база)', en: 'Config A (base)' },
  'compare.phB': { ru: 'Конфиг B (сравнение)', en: 'Config B (compare)' },
  'compare.ariaA': { ru: 'Конфиг A — база сравнения', en: 'Config A — comparison base' },
  'compare.ariaB': { ru: 'Конфиг B — с чем сравнивать', en: 'Config B — compare against' },
  'compare.swap': { ru: 'Поменять A и B местами', en: 'Swap A and B' },
  'compare.swapTitle': { ru: 'Поменять местами', en: 'Swap' },
  'compare.similarity': { ru: 'похожесть {n}%', en: 'similarity {n}%' },
  'compare.added': { ru: '+{n} добавлено', en: '+{n} added' },
  'compare.removed': { ru: '−{n} удалено', en: '−{n} removed' },
  'compare.copyDiff': { ru: 'Копировать diff', en: 'Copy diff' },
  'compare.copied': { ru: 'Скопировано', en: 'Copied' },
  'compare.toastCopied': { ru: 'Diff скопирован в буфер обмена', en: 'Diff copied to clipboard' },
  'compare.toastFailed': { ru: 'Не удалось скопировать diff', en: 'Failed to copy the diff' },
  'compare.emptyBoth': { ru: 'Выберите два конфига для сравнения.', en: 'Pick two configs to compare.' },
  'compare.emptyA': { ru: 'Выберите конфиг A — базу сравнения.', en: 'Pick config A — the comparison base.' },
  'compare.emptyB': { ru: 'Выберите конфиг B — с чем сравнивать.', en: 'Pick config B — what to compare against.' },
  'compare.identical': { ru: 'Конфиги идентичны по содержимому', en: 'The configs are identical in content' },
  'compare.identicalDesc': {
    ru: '{a} и {b} различаются только frontmatter/метаданными',
    en: '{a} and {b} differ only in frontmatter/metadata',
  },
  'compare.truncated': { ru: '… показано {n} из {m} строк', en: '… showing {n} of {m} lines' },

  /* ---- Shortcuts dialog ---- */
  'shortcuts.title': { ru: 'Горячие клавиши', en: 'Keyboard shortcuts' },
  'shortcuts.desc': {
    ru: 'Всё управление доступно с клавиатуры — как в vim.',
    en: 'Everything is keyboard-accessible — vim-style.',
  },
  'sc.palette': {
    ru: 'Палитра команд — быстрый поиск по всем конфигам',
    en: 'Command palette — quick search across all configs',
  },
  'sc.help': { ru: 'Этот справочник горячих клавиш', en: 'This keyboard shortcuts cheat-sheet' },
  'sc.listNav': {
    ru: 'Навигация по списку каталога (vim-стиль)',
    en: 'Navigate the catalog list (vim-style)',
  },
  'sc.paletteNav': {
    ru: 'Навигация по палитре — когда фокус вне поиска',
    en: 'Navigate the palette — when focus is outside search',
  },
  'sc.arrows': { ru: 'То же самое стрелками', en: 'Same with arrow keys' },
  'sc.enter': { ru: 'Открыть выбранный конфиг', en: 'Open the selected config' },
  'sc.star': {
    ru: 'Клик по звёздочке — в избранное (персистится)',
    en: 'Click the star — add to favorites (persisted)',
  },
  'sc.esc': { ru: 'Закрыть палитру, диалог или превью', en: 'Close the palette, dialog or preview' },
  'sc.focusSearch': {
    ru: 'Фокус на поиск в каталоге',
    en: 'Focus the catalog search',
  },
  'sc.group.general': { ru: 'Общие', en: 'General' },
  'sc.group.catalog': { ru: 'Каталог', en: 'Catalog' },
  'sc.group.palette': { ru: 'Палитра команд', en: 'Command palette' },

  /* ---- Similar configs ---- */
  'similar.label': { ru: 'Похожие:', en: 'Similar:' },
  'similar.score': { ru: 'Похожесть {n}%', en: 'Similarity {n}%' },
  'similar.compare': { ru: 'Сравнить {a} и {b}', en: 'Compare {a} and {b}' },
  'similar.diff': { ru: 'Diff: {a} ↔ {b}', en: 'Diff: {a} ↔ {b}' },

  /* ---- TOC / misc ---- */
  'toc.title': { ru: 'Содержание · {n}', en: 'Contents · {n}' },
  'toc.nav': { ru: 'Содержание конфига', en: 'Config contents' },
  'totop': { ru: 'Наверх', en: 'Back to top' },
};

/** Translate with {var} interpolation. Falls back to ru, then to the key itself. */
export function translate(lang: Lang, key: string, vars?: Record<string, string | number>): string {
  const entry = DICT[key];
  let out = entry ? entry[lang] : key;
  if (vars) {
    for (const [k, v] of Object.entries(vars)) out = out.replaceAll(`{${k}}`, String(v));
  }
  return out;
}

/* ---- Lang persistence (same external-store pattern as use-favorites) ---- */
const STORAGE_KEY = 'ezc-lang';
let cache: Lang = 'ru';
let primed = false;
const listeners = new Set<() => void>();

function readLang(): Lang {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw === 'en' ? 'en' : 'ru';
  } catch {
    return 'ru';
  }
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  window.addEventListener('storage', listener);
  return () => {
    listeners.delete(listener);
    window.removeEventListener('storage', listener);
  };
}

function getSnapshot(): Lang {
  if (!primed && typeof window !== 'undefined') {
    primed = true;
    cache = readLang();
    document.documentElement.lang = cache;
  }
  return cache;
}

function getServerSnapshot(): Lang {
  return 'ru';
}

function writeLang(next: Lang) {
  cache = next;
  try {
    localStorage.setItem(STORAGE_KEY, next);
  } catch {
    // storage unavailable — keep in-memory only
  }
  document.documentElement.lang = next;
  listeners.forEach((l) => l());
}

/** Current lang outside of React (e.g. toast helpers in lib/zip.ts). */
export function getLang(): Lang {
  return getSnapshot();
}

/** Category label (plural form) by id and lang. */
export function categoryLabel(id: ToolkitCategoryId, lang: Lang): string {
  return translate(lang, `cat.${id}`);
}

/** Category label (singular form) by id and lang. */
export function categoryLabelSingular(id: ToolkitCategoryId, lang: Lang): string {
  return translate(lang, `cat1.${id}`);
}

/**
 * Hydration-safe i18n hook. SSR renders with 'ru'; after hydration the
 * persisted choice applies (brief flash is acceptable and consistent
 * with next-themes behavior).
 */
export function useI18n() {
  const lang = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const setLang = useCallback((next: Lang) => writeLang(next), []);

  const t = useCallback(
    (key: string, vars?: Record<string, string | number>) => translate(lang, key, vars),
    [lang]
  );

  return { lang, setLang, t };
}
