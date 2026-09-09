import type { DiscountEvaluation } from './policy-evaluator.js';
import type { ResolvedPolicy } from './version-resolver.js';
import type { WarrantyPolicy } from './schemas/warranty-policy.js';

export function formatDiscountEvaluation(evaluation: DiscountEvaluation): string {
  const lines = [
    evaluation.autonomous
      ? `Puedes aplicar ${evaluation.requestedPercent}% de forma autónoma.`
      : `No puedes aplicar ${evaluation.requestedPercent}% de forma autónoma.`,
    `Límite autónomo: ${evaluation.limitPercent}%${evaluation.policy ? ` (política ${evaluation.policy.policyCode})` : ''}.`,
    `Cliente ${evaluation.client.legalName} califica (${evaluation.client.segment}${evaluation.client.renewalActive ? ', renovación activa' : ', renovación inactiva'}).`,
  ];

  if (!evaluation.autonomous && evaluation.approverRole !== undefined) {
    lines.push(`Requiere aprobación de ${evaluation.approverRole}.`);
  }

  if (evaluation.reasoning.length > 0) {
    lines.push('', 'Razonamiento:', ...evaluation.reasoning.map((step) => `- ${step}`));
  }

  return lines.join('\n');
}

export function formatCurrentWarrantyPolicy(resolved: ResolvedPolicy<WarrantyPolicy>): string {
  return [
    `Política vigente: ${resolved.content.policyCode}.`,
    `Plazo de garantía: ${resolved.content.warrantyDays} días.`,
    `Vigente desde: ${resolved.content.effectiveFrom}.`,
    `Revisión actual: ${resolved.revision}.`,
  ].join('\n');
}

export function formatWarrantyPolicyHistory(
  resolved: ResolvedPolicy<WarrantyPolicy>,
  history: readonly {
    readonly revision: number;
    readonly content: unknown;
    readonly author: string;
  }[],
): string {
  const lines = [formatCurrentWarrantyPolicy(resolved), '', 'Historial auditado:'];

  for (const entry of history) {
    const content = entry.content as Partial<WarrantyPolicy>;
    const days =
      typeof content.warrantyDays === 'number'
        ? `${content.warrantyDays} días`
        : 'valor desconocido';
    const effectiveFrom =
      typeof content.effectiveFrom === 'string' ? content.effectiveFrom : 'fecha desconocida';

    lines.push(
      `- Revisión ${entry.revision}: ${days} (desde ${effectiveFrom}), autor ${entry.author}.`,
    );
  }

  return lines.join('\n');
}
