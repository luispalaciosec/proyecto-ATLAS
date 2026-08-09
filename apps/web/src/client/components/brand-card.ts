import type { BrandProduct } from '../../presentation/map-brand.js';
import { formatActivityTime } from '../../presentation/map-activity.js';
import { t } from '../../i18n/index.js';

export interface BrandCardHandlers {
  readonly onSelect: (brandId: string) => void;
}

function knowledgeCopy(brand: BrandProduct): string {
  if (brand.knowledgeCount === undefined) {
    return t('brands.knowledgeEmpty');
  }

  if (brand.knowledgeCount === 1) {
    return t('brands.knowledgeCountOne');
  }

  return t('brands.knowledgeCountMany', { count: brand.knowledgeCount });
}

function activityCopy(brand: BrandProduct): string {
  const recent = brand.recentActivity?.[0];

  if (recent === undefined) {
    return t('brands.activityEmpty');
  }

  return t('brands.activityRecent', {
    time: formatActivityTime(recent.occurredAt),
    title: recent.title,
  });
}

export function renderBrandCardSkeleton(): HTMLElement {
  const card = document.createElement('article');
  card.className = 'brand-card brand-card--skeleton';
  card.setAttribute('aria-hidden', 'true');
  card.innerHTML = `
    <div class="brand-card__header">
      <span class="brand-card__skeleton brand-card__skeleton--title"></span>
    </div>
    <span class="brand-card__skeleton brand-card__skeleton--line"></span>
    <span class="brand-card__skeleton brand-card__skeleton--line brand-card__skeleton--short"></span>
    <span class="brand-card__skeleton brand-card__skeleton--button"></span>
  `;
  return card;
}

export function renderBrandCard(brand: BrandProduct, handlers: BrandCardHandlers): HTMLElement {
  const card = document.createElement('article');
  card.className = 'brand-card card';
  card.dataset.brandId = brand.id;

  if (brand.isActive) {
    card.classList.add('brand-card--active');
  }

  if (brand.isGeneral) {
    card.classList.add('brand-card--general');
  }

  const header = document.createElement('div');
  header.className = 'brand-card__header';

  const title = document.createElement('h2');
  title.className = 'brand-card__title';
  title.textContent = brand.name;

  header.append(title);

  if (brand.isActive) {
    const badge = document.createElement('span');
    badge.className = 'brand-card__badge';
    badge.textContent = t('brands.activeBadge');
    header.append(badge);
  }

  card.append(header);

  if (brand.description !== undefined) {
    const description = document.createElement('p');
    description.className = 'brand-card__description';
    description.textContent = brand.description;
    card.append(description);
  }

  const knowledgeSection = document.createElement('div');
  knowledgeSection.className = 'brand-card__section';

  const knowledgeLabel = document.createElement('p');
  knowledgeLabel.className = 'brand-card__section-label';
  knowledgeLabel.textContent = t('brands.knowledgeLabel');

  const knowledgeValue = document.createElement('p');
  knowledgeValue.className = 'brand-card__section-value';
  knowledgeValue.textContent = knowledgeCopy(brand);

  knowledgeSection.append(knowledgeLabel, knowledgeValue);
  card.append(knowledgeSection);

  const activitySection = document.createElement('div');
  activitySection.className = 'brand-card__section';

  const activityLabel = document.createElement('p');
  activityLabel.className = 'brand-card__section-label';
  activityLabel.textContent = t('brands.activityLabel');

  const activityValue = document.createElement('p');
  activityValue.className = 'brand-card__section-value';
  activityValue.textContent = activityCopy(brand);

  activitySection.append(activityLabel, activityValue);
  card.append(activitySection);

  const actions = document.createElement('div');
  actions.className = 'brand-card__actions';

  const button = document.createElement('button');
  button.type = 'button';
  button.className = brand.isActive ? 'btn btn--secondary' : 'btn btn--primary';
  button.textContent = brand.isActive
    ? t('brands.ctaActive')
    : t('brands.ctaWork', { name: brand.name });

  if (brand.isActive) {
    button.setAttribute('aria-current', 'true');
    button.disabled = true;
  } else {
    button.addEventListener('click', () => {
      handlers.onSelect(brand.id);
    });
  }

  actions.append(button);
  card.append(actions);

  return card;
}
