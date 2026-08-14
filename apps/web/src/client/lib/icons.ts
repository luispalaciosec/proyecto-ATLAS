import {
  BookOpen,
  Building2,
  CircleCheck,
  createElement,
  FileText,
  FileType,
  House,
  LoaderCircle,
  MessageCircle,
  Moon,
  Pencil,
  Presentation,
  Search,
  Settings,
  Sun,
  TrendingUp,
  Upload,
  ArrowUp,
  type IconNode,
} from 'lucide';

export interface IconOptions {
  readonly size?: number;
  readonly strokeWidth?: number;
  readonly className?: string;
}

function renderIcon(IconComponent: IconNode, options: IconOptions = {}): SVGElement {
  const size = options.size ?? 18;
  const svg = createElement(IconComponent, {
    width: String(size),
    height: String(size),
    strokeWidth: String(options.strokeWidth ?? 1.75),
    'aria-hidden': 'true',
  });

  if (options.className !== undefined) {
    svg.setAttribute('class', options.className);
  }

  return svg;
}

export const navIcons = {
  home: House,
  chat: MessageCircle,
  knowledge: BookOpen,
  brands: Building2,
  activity: TrendingUp,
  settings: Settings,
} as const;

export type NavIconKey = keyof typeof navIcons;

export function createNavIcon(key: NavIconKey, className = 'nav-icon'): SVGElement {
  return renderIcon(navIcons[key], { size: 18, className });
}

export function createActionIcon(
  key: 'chat' | 'knowledge' | 'brands' | 'activity',
  className = 'action-card__icon-svg',
): SVGElement {
  const map = {
    chat: MessageCircle,
    knowledge: BookOpen,
    brands: Building2,
    activity: TrendingUp,
  } as const;

  return renderIcon(map[key], { size: 18, className });
}

export function createActivityIcon(
  type: 'conversation' | 'knowledge' | 'correction' | 'error' | 'default',
): SVGElement {
  const map = {
    conversation: MessageCircle,
    knowledge: Search,
    correction: Pencil,
    error: TrendingUp,
    default: TrendingUp,
  } as const;

  return renderIcon(map[type], { size: 16, className: 'activity-item__icon-svg' });
}

export function createThemeIcon(mode: 'light' | 'dark'): SVGElement {
  return renderIcon(mode === 'dark' ? Sun : Moon, { size: 18, className: 'shell__theme-toggle-icon' });
}

export function createUploadIdleIcon(className = 'knowledge-upload__idle-icon'): SVGElement {
  return renderIcon(Upload, { size: 28, className, strokeWidth: 1.5 });
}

export function createUploadSuccessIcon(className = 'knowledge-upload__success-icon'): SVGElement {
  return renderIcon(CircleCheck, { size: 28, className, strokeWidth: 1.75 });
}

export function createFileTypeIcon(
  extension: string,
  className = 'knowledge-upload__file-icon',
): SVGElement {
  const map: Record<string, IconNode> = {
    pdf: FileType,
    docx: FileText,
    pptx: Presentation,
    txt: FileText,
    md: FileText,
  };

  return renderIcon(map[extension] ?? FileText, { size: 28, className, strokeWidth: 1.5 });
}

export function createSendIcon(className = 'chat-composer__send-icon-svg'): SVGElement {
  return renderIcon(ArrowUp, { size: 18, className, strokeWidth: 2 });
}

export function createSendSpinner(className = 'chat-composer__send-spinner-svg'): SVGElement {
  return renderIcon(LoaderCircle, { size: 18, className, strokeWidth: 2 });
}
