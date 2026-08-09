import { t } from '../../i18n/index.js';

export function formatWorkingContext(activeWorkspace: string, brandName: string): string {
  if (activeWorkspace === 'default') {
    return t('workspace.workingIn', { name: t('workspace.general') });
  }

  return t('workspace.workingWith', { name: brandName });
}
