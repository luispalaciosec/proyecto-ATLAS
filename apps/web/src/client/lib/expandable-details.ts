import { t } from '../../i18n/index.js';

let detailsIdCounter = 0;

export function appendExpandableDetails(container: HTMLElement, technicalDetails: string): void {
  const detailsId = `error-details-${detailsIdCounter++}`;

  const detailsButton = document.createElement('button');
  detailsButton.type = 'button';
  detailsButton.className = 'btn btn--ghost';
  detailsButton.textContent = t('common.showDetails');
  detailsButton.setAttribute('aria-expanded', 'false');
  detailsButton.setAttribute('aria-controls', detailsId);

  const details = document.createElement('pre');
  details.id = detailsId;
  details.className = 'error-panel__details';
  details.hidden = true;
  details.textContent = technicalDetails;

  detailsButton.addEventListener('click', () => {
    const willExpand = details.hidden;
    details.hidden = !willExpand;
    detailsButton.setAttribute('aria-expanded', String(willExpand));
    detailsButton.textContent = willExpand ? t('common.hideDetails') : t('common.showDetails');
  });

  container.append(detailsButton, details);
}
