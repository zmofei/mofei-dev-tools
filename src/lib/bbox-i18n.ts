import { absoluteUrl } from '@/lib/site';

export const BBOX_LANGUAGES = ['en', 'zh', 'de', 'es', 'fr'] as const;

export type BBoxLanguage = (typeof BBOX_LANGUAGES)[number];
export type BBoxLocale = 'en_US' | 'zh_CN' | 'de_DE' | 'es_ES' | 'fr_FR';

export type BBoxTextKey =
  | 'toolTitle'
  | 'openPanel'
  | 'howToUse'
  | 'collapsePanel'
  | 'previewBbox'
  | 'previewBboxDesc'
  | 'loaded'
  | 'inputBboxData'
  | 'inputBboxDesc'
  | 'loadExample'
  | 'inputPlaceholder'
  | 'resizeTitle'
  | 'parsing'
  | 'parseSuccess'
  | 'autoDetect'
  | 'clear'
  | 'bboxInfo'
  | 'preview'
  | 'drawn'
  | 'currentScreenMapInfo'
  | 'zoomLevel'
  | 'copyGeoJSON'
  | 'drawArea'
  | 'drawHintDesktop'
  | 'drawHintMobile'
  | 'urlSourceHint'
  | 'needOtherFormats'
  | 'needOtherFormatsDesc'
  | 'convertCoordinates'
  | 'craftedBy'
  | 'starProject'
  | 'helpIntro'
  | 'helpStep1'
  | 'helpStep2'
  | 'helpStep3'
  | 'helpStep4'
  | 'invalidBbox'
  | 'invalidCoordinates'
  | 'parseError'
  | 'mapUnavailable'
  | 'mapUnavailableDesc'
  | 'mapHintDesktop'
  | 'mapHintMobile'
  | 'centerPoint'
  | 'width'
  | 'height'
  | 'area'
  | 'copy'
  | 'copied'
  | 'share'
  | 'shared'
  | 'loadingFromUrl';

type BBoxSeoEntry = {
  title: string;
  description: string;
  keywords: string[];
  category: string;
  classification: string;
  locale: BBoxLocale;
  openGraphTitle: string;
  openGraphDescription: string;
};

export function normalizeBBoxLanguage(value?: string | null): BBoxLanguage {
  return BBOX_LANGUAGES.includes(value as BBoxLanguage) ? (value as BBoxLanguage) : 'en';
}

export function isBBoxLanguage(value?: string | null): value is BBoxLanguage {
  return BBOX_LANGUAGES.includes(value as BBoxLanguage);
}

export function bboxPath(language: BBoxLanguage) {
  if (language === 'en') return '/bbox';
  return `/${language}/bbox`;
}

export function bboxUrl(language: BBoxLanguage) {
  return absoluteUrl(bboxPath(language));
}

export const BBOX_HREFLANG: Record<BBoxLanguage, string> = {
  en: 'en-US',
  zh: 'zh-CN',
  de: 'de-DE',
  es: 'es-ES',
  fr: 'fr-FR',
};

export const BBOX_LOCALE: Record<BBoxLanguage, BBoxLocale> = {
  en: 'en_US',
  zh: 'zh_CN',
  de: 'de_DE',
  es: 'es_ES',
  fr: 'fr_FR',
};

export function bboxAlternates() {
  return {
    canonical: bboxUrl('en'),
    languages: {
      [BBOX_HREFLANG.en]: bboxUrl('en'),
      [BBOX_HREFLANG.zh]: bboxUrl('zh'),
      [BBOX_HREFLANG.de]: bboxUrl('de'),
      [BBOX_HREFLANG.es]: bboxUrl('es'),
      [BBOX_HREFLANG.fr]: bboxUrl('fr'),
      'x-default': bboxUrl('en'),
    },
  };
}

export function bboxAlternateLocales(language: BBoxLanguage) {
  return BBOX_LANGUAGES
    .filter((item) => item !== language)
    .map((item) => BBOX_LOCALE[item]);
}

export function bboxLanguageFromPath(pathname: string): BBoxLanguage {
  const [, first, second] = pathname.split('/');
  if (second === 'bbox') return normalizeBBoxLanguage(first);
  return 'en';
}

export function bboxLanguageLinks() {
  const hash = typeof window === 'undefined' ? '' : window.location.hash;
  const search = typeof window === 'undefined' ? '' : window.location.search;
  const suffix = `${search}${hash}`;

  return Object.fromEntries(
    BBOX_LANGUAGES.map((language) => [language, `${bboxPath(language)}${suffix}`]),
  ) as Record<BBoxLanguage, string>;
}

export const BBOX_LANGUAGE_LABELS: Record<BBoxLanguage, string> = {
  en: 'EN',
  zh: '中',
  de: 'DE',
  es: 'ES',
  fr: 'FR',
};

export const BBOX_TEXT: Record<BBoxLanguage, Record<BBoxTextKey, string>> = {
  en: {
    toolTitle: 'BBox Drawing Tool',
    openPanel: 'Open panel',
    howToUse: 'How to use',
    collapsePanel: 'Collapse panel',
    previewBbox: 'Preview BBox',
    previewBboxDesc: 'If you have BBox data to preview, click here to paste it',
    loaded: 'Loaded',
    inputBboxData: 'Input BBox Data',
    inputBboxDesc: 'Enter bounding box data below for validation and visual preview',
    loadExample: 'Load example',
    inputPlaceholder: 'Enter BBox data for validation and preview...\n\nSupported data formats:\nArray format: [24.782, 60.120, 25.254, 60.297]\nComma-separated: 24.782, 60.120, 25.254, 60.297\nGeoJSON: {"bbox": [24.782, 60.120, 25.254, 60.297]}',
    resizeTitle: 'Drag to resize BBox input height',
    parsing: 'Parsing BBox data...',
    parseSuccess: 'BBox data parsed successfully and displayed on the map',
    autoDetect: 'Auto-detect: Array format, GeoJSON, comma-separated values',
    clear: 'Clear',
    bboxInfo: 'BBox Info',
    preview: 'Preview',
    drawn: 'Drawn',
    currentScreenMapInfo: 'Current Screen Map Info',
    zoomLevel: 'Zoom Level',
    copyGeoJSON: 'Copy GeoJSON',
    drawArea: 'Draw Area',
    drawHintDesktop: 'Hold Shift and drag on the map to draw a rectangle area and see precise bounding box information',
    drawHintMobile: 'Drawing requires a desktop browser. Use a desktop device for precise rectangle drawing.',
    urlSourceHint: 'This BBox comes from the current URL. Click Clear to remove the BBox parameters from the link.',
    needOtherFormats: 'Need other formats?',
    needOtherFormatsDesc: 'For other coordinate formats, use our coordinate converter tool',
    convertCoordinates: 'Convert Coordinates',
    craftedBy: 'Crafted by Mofei in Helsinki',
    starProject: 'Star the project',
    helpIntro: 'A BBox is a common map bounding box, usually represented as minLng, minLat, maxLng, maxLat.',
    helpStep1: 'Move the map to the target area. The current screen map info updates automatically.',
    helpStep2: 'On desktop, hold Shift and drag on the map to draw a precise rectangle.',
    helpStep3: 'If you already have a BBox, GeoJSON, or array, expand Preview BBox and paste it.',
    helpStep4: 'Copy the WGS84 BBox or GeoJSON for map queries, API debugging, and data clipping.',
    invalidBbox: 'Invalid bbox: min values must be less than max values',
    invalidCoordinates: 'Invalid coordinates: longitude range -180~180, latitude range -90~90',
    parseError: 'Unable to parse input format. Supported: Array [minLng,minLat,maxLng,maxLat], GeoJSON, comma-separated values',
    mapUnavailable: 'Map is not configured',
    mapUnavailableDesc: 'Set NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN before starting or deploying the app.',
    mapHintDesktop: 'Hold Shift and drag to draw a rectangular area. Press ESC to cancel drawing. The calculated bounding box shows the extent of the drawn rectangle area. By default, it shows the current viewport bounds.',
    mapHintMobile: 'Drawing functionality requires a PC browser. On mobile devices, you can view the bounding box of the current map viewport and adjust the visible area by dragging the map.',
    centerPoint: 'Center Point',
    width: 'Width',
    height: 'Height',
    area: 'Area',
    copy: 'Copy',
    copied: 'Copied!',
    share: 'Share',
    shared: 'Shared!',
    loadingFromUrl: 'Loading from URL...',
  },
  zh: {
    toolTitle: 'BBox绘制工具',
    openPanel: '展开面板',
    howToUse: '使用说明',
    collapsePanel: '收起面板',
    previewBbox: '预览 BBox',
    previewBboxDesc: '如果你有 BBox 数据想预览，点击这里粘贴',
    loaded: '已加载',
    inputBboxData: '输入BBox数据',
    inputBboxDesc: '在下方输入边界框数据进行验证和可视化预览',
    loadExample: '导入示例',
    inputPlaceholder: '在此输入BBox数据进行验证和预览...\n\n支持的数据格式：\n数组格式: [24.782, 60.120, 25.254, 60.297]\n逗号分隔: 24.782, 60.120, 25.254, 60.297\nGeoJSON: {"bbox": [24.782, 60.120, 25.254, 60.297]}',
    resizeTitle: '拖拽调整 BBox 输入框高度',
    parsing: '正在解析BBox数据...',
    parseSuccess: 'BBox数据解析成功，已在地图上显示',
    autoDetect: '自动识别：数组格式、GeoJSON、逗号分隔值',
    clear: '清空',
    bboxInfo: 'BBox 信息',
    preview: '预览',
    drawn: '绘制',
    currentScreenMapInfo: '当前屏幕地图信息',
    zoomLevel: '缩放级别',
    copyGeoJSON: '复制GeoJSON',
    drawArea: '绘制区域',
    drawHintDesktop: '按住 Shift 键并在地图上拖拽绘制矩形区域，查看精确的边界框信息',
    drawHintMobile: '绘制功能需要在PC浏览器中使用。请在桌面设备上访问此页面进行精确的矩形区域绘制。',
    urlSourceHint: '这个 BBox 来自当前地址链接。你可以点击“清空”删除链接里的 BBox 参数。',
    needOtherFormats: '需要其他格式？',
    needOtherFormatsDesc: '如需其他坐标格式，请使用我们的坐标转换工具',
    convertCoordinates: '转换坐标格式',
    craftedBy: 'Mofei 在赫尔辛基用心开发',
    starProject: 'Star 支持项目',
    helpIntro: 'BBox 是地图数据里常用的边界框，通常按 minLng、minLat、maxLng、maxLat 表示一个矩形范围。',
    helpStep1: '拖动地图到目标区域，右侧会自动显示当前屏幕地图信息。',
    helpStep2: '在桌面端按住 Shift 并拖拽地图，可以绘制一个精确矩形。',
    helpStep3: '已有 BBox、GeoJSON 或数组时，展开预览 BBox 粘贴后会在地图上预览。',
    helpStep4: '复制 WGS84 BBox 或 GeoJSON，用在地图查询、接口调试和数据裁剪里。',
    invalidBbox: '无效的边界框：最小值必须小于最大值',
    invalidCoordinates: '无效的坐标：经度范围 -180~180，纬度范围 -90~90',
    parseError: '无法解析输入格式。支持：数组 [minLng,minLat,maxLng,maxLat]、GeoJSON、逗号分隔值',
    mapUnavailable: '地图未配置',
    mapUnavailableDesc: '启动或部署前请设置 NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN。',
    mapHintDesktop: '按住 Shift 键并拖拽鼠标来绘制矩形区域。按 ESC 键取消绘制。计算出的边界框是所绘制矩形区域的范围。默认显示当前可视区域的边界框。',
    mapHintMobile: '绘制功能需要在PC浏览器中使用。在移动设备上，您可以查看当前地图可视区域的边界框，并通过拖拽地图调整可视区域。',
    centerPoint: '中心点',
    width: '宽度',
    height: '高度',
    area: '面积',
    copy: '复制',
    copied: '已复制',
    share: '分享',
    shared: '已分享',
    loadingFromUrl: '正在从URL加载...',
  },
  de: {
    toolTitle: 'BBox-Zeichenwerkzeug',
    openPanel: 'Panel öffnen',
    howToUse: 'Anleitung',
    collapsePanel: 'Panel einklappen',
    previewBbox: 'BBox-Vorschau',
    previewBboxDesc: 'Wenn du BBox-Daten prüfen möchtest, hier klicken und einfügen',
    loaded: 'Geladen',
    inputBboxData: 'BBox-Daten eingeben',
    inputBboxDesc: 'Gib unten Bounding-Box-Daten ein, um sie zu prüfen und auf der Karte anzuzeigen',
    loadExample: 'Beispiel laden',
    inputPlaceholder: 'BBox-Daten zur Prüfung und Vorschau eingeben...\n\nUnterstützte Formate:\nArray: [24.782, 60.120, 25.254, 60.297]\nKommagetrennt: 24.782, 60.120, 25.254, 60.297\nGeoJSON: {"bbox": [24.782, 60.120, 25.254, 60.297]}',
    resizeTitle: 'Höhe des BBox-Eingabefelds ziehen',
    parsing: 'BBox-Daten werden gelesen...',
    parseSuccess: 'BBox-Daten wurden erkannt und auf der Karte angezeigt',
    autoDetect: 'Automatische Erkennung: Array, GeoJSON, kommagetrennte Werte',
    clear: 'Löschen',
    bboxInfo: 'BBox-Info',
    preview: 'Vorschau',
    drawn: 'Gezeichnet',
    currentScreenMapInfo: 'Aktueller Kartenausschnitt',
    zoomLevel: 'Zoomstufe',
    copyGeoJSON: 'GeoJSON kopieren',
    drawArea: 'Bereich zeichnen',
    drawHintDesktop: 'Shift gedrückt halten und auf der Karte ziehen, um ein Rechteck zu zeichnen.',
    drawHintMobile: 'Das Zeichnen ist für Desktop-Browser gedacht. Auf Mobilgeräten kannst du den Kartenausschnitt nutzen.',
    urlSourceHint: 'Diese BBox stammt aus dem aktuellen Link. Klicke auf Löschen, um die BBox-Parameter aus der URL zu entfernen.',
    needOtherFormats: 'Andere Formate benötigt?',
    needOtherFormatsDesc: 'Für andere Koordinatenformate nutze den Koordinatenkonverter.',
    convertCoordinates: 'Koordinaten konvertieren',
    craftedBy: 'Mit Sorgfalt von Mofei in Helsinki entwickelt',
    starProject: 'Projekt mit Star unterstützen',
    helpIntro: 'Eine BBox ist eine Bounding Box für Kartendaten, meist als minLng, minLat, maxLng, maxLat.',
    helpStep1: 'Bewege die Karte zum Zielgebiet. Die Infos zum aktuellen Kartenausschnitt werden automatisch aktualisiert.',
    helpStep2: 'Halte auf dem Desktop Shift gedrückt und ziehe auf der Karte ein präzises Rechteck.',
    helpStep3: 'Wenn du bereits eine BBox, GeoJSON oder ein Array hast, öffne die BBox-Vorschau und füge es ein.',
    helpStep4: 'Kopiere WGS84-BBox oder GeoJSON für Kartenabfragen, API-Tests und Datenausschnitte.',
    invalidBbox: 'Ungültige BBox: Mindestwerte müssen kleiner als Maximalwerte sein',
    invalidCoordinates: 'Ungültige Koordinaten: Längengrad -180 bis 180, Breitengrad -90 bis 90',
    parseError: 'Format konnte nicht gelesen werden. Unterstützt: Array [minLng,minLat,maxLng,maxLat], GeoJSON, kommagetrennte Werte',
    mapUnavailable: 'Karte ist nicht konfiguriert',
    mapUnavailableDesc: 'Setze NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN vor Start oder Deployment der App.',
    mapHintDesktop: 'Shift gedrückt halten und ziehen, um ein Rechteck zu zeichnen. ESC bricht ab. Standardmäßig wird die BBox des aktuellen Kartenausschnitts angezeigt.',
    mapHintMobile: 'Das Zeichnen benötigt einen Desktop-Browser. Auf Mobilgeräten kannst du die Karte verschieben und die BBox des sichtbaren Ausschnitts verwenden.',
    centerPoint: 'Mittelpunkt',
    width: 'Breite',
    height: 'Höhe',
    area: 'Fläche',
    copy: 'Kopieren',
    copied: 'Kopiert!',
    share: 'Teilen',
    shared: 'Geteilt!',
    loadingFromUrl: 'Wird aus URL geladen...',
  },
  es: {
    toolTitle: 'Herramienta para dibujar BBox',
    openPanel: 'Abrir panel',
    howToUse: 'Cómo usar',
    collapsePanel: 'Contraer panel',
    previewBbox: 'Vista previa de BBox',
    previewBboxDesc: 'Si tienes datos BBox para previsualizar, haz clic aquí y pégalos',
    loaded: 'Cargado',
    inputBboxData: 'Introducir datos BBox',
    inputBboxDesc: 'Introduce datos de bounding box para validarlos y verlos en el mapa',
    loadExample: 'Cargar ejemplo',
    inputPlaceholder: 'Introduce datos BBox para validación y vista previa...\n\nFormatos compatibles:\nArray: [24.782, 60.120, 25.254, 60.297]\nSeparado por comas: 24.782, 60.120, 25.254, 60.297\nGeoJSON: {"bbox": [24.782, 60.120, 25.254, 60.297]}',
    resizeTitle: 'Arrastra para cambiar la altura del campo BBox',
    parsing: 'Analizando datos BBox...',
    parseSuccess: 'Datos BBox analizados y mostrados en el mapa',
    autoDetect: 'Detección automática: array, GeoJSON, valores separados por comas',
    clear: 'Limpiar',
    bboxInfo: 'Información de BBox',
    preview: 'Vista previa',
    drawn: 'Dibujado',
    currentScreenMapInfo: 'Información del mapa visible',
    zoomLevel: 'Nivel de zoom',
    copyGeoJSON: 'Copiar GeoJSON',
    drawArea: 'Dibujar área',
    drawHintDesktop: 'Mantén Shift y arrastra en el mapa para dibujar un rectángulo preciso.',
    drawHintMobile: 'El dibujo requiere un navegador de escritorio. En móvil puedes usar el área visible del mapa.',
    urlSourceHint: 'Esta BBox viene del enlace actual. Haz clic en Limpiar para eliminar los parámetros BBox de la URL.',
    needOtherFormats: '¿Necesitas otros formatos?',
    needOtherFormatsDesc: 'Para otros formatos de coordenadas, usa el conversor de coordenadas.',
    convertCoordinates: 'Convertir coordenadas',
    craftedBy: 'Creado con cuidado por Mofei en Helsinki',
    starProject: 'Dar estrella al proyecto',
    helpIntro: 'Una BBox es una caja delimitadora de mapa, normalmente expresada como minLng, minLat, maxLng, maxLat.',
    helpStep1: 'Mueve el mapa al área objetivo. La información del mapa visible se actualiza automáticamente.',
    helpStep2: 'En escritorio, mantén Shift y arrastra para dibujar un rectángulo preciso.',
    helpStep3: 'Si ya tienes una BBox, GeoJSON o array, abre Vista previa de BBox y pégalo.',
    helpStep4: 'Copia la BBox WGS84 o GeoJSON para consultas de mapas, depuración de APIs y recorte de datos.',
    invalidBbox: 'BBox inválida: los valores mínimos deben ser menores que los máximos',
    invalidCoordinates: 'Coordenadas inválidas: longitud -180~180, latitud -90~90',
    parseError: 'No se pudo analizar el formato. Compatible: array [minLng,minLat,maxLng,maxLat], GeoJSON, valores separados por comas',
    mapUnavailable: 'El mapa no está configurado',
    mapUnavailableDesc: 'Define NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN antes de iniciar o desplegar la app.',
    mapHintDesktop: 'Mantén Shift y arrastra para dibujar un rectángulo. Pulsa ESC para cancelar. Por defecto se muestra la BBox del área visible.',
    mapHintMobile: 'El dibujo requiere un navegador de escritorio. En móvil puedes ver la BBox del área visible y ajustar el mapa arrastrándolo.',
    centerPoint: 'Centro',
    width: 'Ancho',
    height: 'Alto',
    area: 'Área',
    copy: 'Copiar',
    copied: '¡Copiado!',
    share: 'Compartir',
    shared: '¡Compartido!',
    loadingFromUrl: 'Cargando desde URL...',
  },
  fr: {
    toolTitle: 'Outil de dessin BBox',
    openPanel: 'Ouvrir le panneau',
    howToUse: 'Mode d’emploi',
    collapsePanel: 'Réduire le panneau',
    previewBbox: 'Aperçu BBox',
    previewBboxDesc: 'Si vous avez des données BBox à prévisualiser, cliquez ici pour les coller',
    loaded: 'Chargé',
    inputBboxData: 'Saisir les données BBox',
    inputBboxDesc: 'Saisissez des données de bounding box pour les valider et les visualiser',
    loadExample: 'Charger un exemple',
    inputPlaceholder: 'Saisissez des données BBox pour validation et aperçu...\n\nFormats pris en charge :\nTableau : [24.782, 60.120, 25.254, 60.297]\nSéparé par des virgules : 24.782, 60.120, 25.254, 60.297\nGeoJSON : {"bbox": [24.782, 60.120, 25.254, 60.297]}',
    resizeTitle: 'Glisser pour redimensionner le champ BBox',
    parsing: 'Analyse des données BBox...',
    parseSuccess: 'Données BBox analysées et affichées sur la carte',
    autoDetect: 'Détection automatique : tableau, GeoJSON, valeurs séparées par des virgules',
    clear: 'Effacer',
    bboxInfo: 'Infos BBox',
    preview: 'Aperçu',
    drawn: 'Dessinée',
    currentScreenMapInfo: 'Infos de la carte affichée',
    zoomLevel: 'Niveau de zoom',
    copyGeoJSON: 'Copier GeoJSON',
    drawArea: 'Dessiner une zone',
    drawHintDesktop: 'Maintenez Shift et faites glisser sur la carte pour dessiner un rectangle précis.',
    drawHintMobile: 'Le dessin nécessite un navigateur de bureau. Sur mobile, utilisez la zone visible de la carte.',
    urlSourceHint: 'Cette BBox provient du lien actuel. Cliquez sur Effacer pour supprimer les paramètres BBox de l’URL.',
    needOtherFormats: 'Besoin d’autres formats ?',
    needOtherFormatsDesc: 'Pour d’autres formats de coordonnées, utilisez le convertisseur de coordonnées.',
    convertCoordinates: 'Convertir les coordonnées',
    craftedBy: 'Conçu avec soin par Mofei à Helsinki',
    starProject: 'Soutenir avec une étoile',
    helpIntro: 'Une BBox est une boîte englobante de carte, généralement exprimée en minLng, minLat, maxLng, maxLat.',
    helpStep1: 'Déplacez la carte vers la zone cible. Les infos de la carte affichée se mettent à jour automatiquement.',
    helpStep2: 'Sur ordinateur, maintenez Shift et faites glisser pour dessiner un rectangle précis.',
    helpStep3: 'Si vous avez déjà une BBox, du GeoJSON ou un tableau, ouvrez Aperçu BBox et collez-le.',
    helpStep4: 'Copiez la BBox WGS84 ou le GeoJSON pour les requêtes cartographiques, le débogage API et le découpage de données.',
    invalidBbox: 'BBox invalide : les valeurs minimales doivent être inférieures aux valeurs maximales',
    invalidCoordinates: 'Coordonnées invalides : longitude -180~180, latitude -90~90',
    parseError: 'Format impossible à analyser. Pris en charge : tableau [minLng,minLat,maxLng,maxLat], GeoJSON, valeurs séparées par des virgules',
    mapUnavailable: 'La carte n’est pas configurée',
    mapUnavailableDesc: 'Définissez NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN avant de démarrer ou déployer l’app.',
    mapHintDesktop: 'Maintenez Shift et faites glisser pour dessiner un rectangle. Appuyez sur ESC pour annuler. Par défaut, la BBox de la zone visible est affichée.',
    mapHintMobile: 'Le dessin nécessite un navigateur de bureau. Sur mobile, vous pouvez consulter la BBox de la zone visible et déplacer la carte.',
    centerPoint: 'Centre',
    width: 'Largeur',
    height: 'Hauteur',
    area: 'Surface',
    copy: 'Copier',
    copied: 'Copié !',
    share: 'Partager',
    shared: 'Partagé !',
    loadingFromUrl: 'Chargement depuis l’URL...',
  },
};

export const BBOX_SEO: Record<BBoxLanguage, BBoxSeoEntry> = {
  en: {
    title: "Free BBox Drawing Tool - Interactive Map Bounding Box Generator | Mofei's Tools",
    description: 'Draw and generate bounding boxes on interactive maps. Get WGS84 bounds, preview BBox data, export GeoJSON, and share map bounding boxes for GIS development.',
    keywords: ['bbox tool', 'bounding box generator', 'GIS bounding box', 'map bounds', 'WGS84 bbox', 'GeoJSON bbox', 'online GIS tool'],
    category: 'GIS Tools',
    classification: 'Geographic Information Tool',
    locale: 'en_US',
    openGraphTitle: 'Free BBox Drawing Tool',
    openGraphDescription: 'Draw, preview, copy, and share map bounding boxes online.',
  },
  zh: {
    title: '免费 BBox 绘制工具 - 在线地图边界框生成器 | Mofei 工具',
    description: '在交互式地图上绘制和预览 BBox，生成 WGS84 边界框、复制 GeoJSON，并分享地图范围。适合 GIS 开发和地理数据处理。',
    keywords: ['BBox 绘制工具', '边界框生成器', 'GIS 工具', '地图范围', 'WGS84 BBox', 'GeoJSON BBox', '在线地图工具'],
    category: 'GIS 工具',
    classification: '地理信息工具',
    locale: 'zh_CN',
    openGraphTitle: '免费 BBox 绘制工具',
    openGraphDescription: '在线绘制、预览、复制和分享地图边界框。',
  },
  de: {
    title: 'Kostenloses BBox-Zeichenwerkzeug - Interaktiver Bounding-Box-Generator | Mofei Tools',
    description: 'Zeichne und prüfe Bounding Boxes auf einer interaktiven Karte. Erhalte WGS84-Grenzen, kopiere GeoJSON und teile BBox-Links für GIS-Entwicklung.',
    keywords: ['BBox Werkzeug', 'Bounding Box Generator', 'GIS Werkzeug', 'Kartenausschnitt', 'WGS84 BBox', 'GeoJSON BBox', 'online GIS Tool'],
    category: 'GIS-Werkzeuge',
    classification: 'Geoinformationswerkzeug',
    locale: 'de_DE',
    openGraphTitle: 'Kostenloses BBox-Zeichenwerkzeug',
    openGraphDescription: 'Bounding Boxes online zeichnen, prüfen, kopieren und teilen.',
  },
  es: {
    title: 'Herramienta gratuita para dibujar BBox - Generador interactivo de bounding boxes | Mofei Tools',
    description: 'Dibuja y valida bounding boxes en un mapa interactivo. Obtén límites WGS84, copia GeoJSON y comparte enlaces BBox para desarrollo GIS.',
    keywords: ['herramienta BBox', 'generador bounding box', 'herramienta GIS', 'límites de mapa', 'BBox WGS84', 'BBox GeoJSON', 'GIS online'],
    category: 'Herramientas GIS',
    classification: 'Herramienta de información geográfica',
    locale: 'es_ES',
    openGraphTitle: 'Herramienta gratuita para dibujar BBox',
    openGraphDescription: 'Dibuja, valida, copia y comparte bounding boxes online.',
  },
  fr: {
    title: 'Outil gratuit de dessin BBox - Générateur interactif de bounding boxes | Mofei Tools',
    description: 'Dessinez et vérifiez des bounding boxes sur une carte interactive. Obtenez des limites WGS84, copiez du GeoJSON et partagez des liens BBox pour le SIG.',
    keywords: ['outil BBox', 'générateur bounding box', 'outil SIG', 'limites de carte', 'BBox WGS84', 'BBox GeoJSON', 'outil SIG en ligne'],
    category: 'Outils SIG',
    classification: 'Outil d’information géographique',
    locale: 'fr_FR',
    openGraphTitle: 'Outil gratuit de dessin BBox',
    openGraphDescription: 'Dessinez, vérifiez, copiez et partagez des bounding boxes en ligne.',
  },
};

export function bboxText(language: BBoxLanguage, key: BBoxTextKey) {
  return BBOX_TEXT[language][key] ?? BBOX_TEXT.en[key];
}
