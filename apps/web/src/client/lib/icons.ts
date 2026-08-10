import {
  BookOpen,
  Building2,
  createElement,
  House,
  MessageCircle,
  Pencil,
  Search,
  Settings,
  TrendingUp,
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
