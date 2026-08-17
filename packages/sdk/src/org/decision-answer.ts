import type { ResolvedDecisionWithEvidence } from './decision-resolver.js';
import { readEntityPayload } from './entity-resolver.js';
import { parseDecision } from './schemas/decision.js';
import { parseEvidence } from './schemas/evidence.js';

export function formatDecisionWithEvidence(
  resolved: ResolvedDecisionWithEvidence,
  policyContextLine?: string,
): string {
  const decision = parseDecision(readEntityPayload(resolved.decision));
  const lines: string[] = [];

  if (decision.subjectType === 'discount_request' && decision.outcome === 'approved') {
    const approvedPercent = decision.approvedPercent ?? decision.requestedPercent;
    const clientLabel = decision.clientLegalName.replace(/\.$/, '');

    lines.push(`Descuento aprobado para ${clientLabel}.`);
    lines.push(
      `Decisión: ${approvedPercent}% aprobado el ${decision.decidedAt} por ${decision.decidedBy}.`,
    );
  } else if (decision.subjectType === 'discount_request' && decision.outcome === 'rejected') {
    lines.push(`Descuento rechazado para ${decision.clientLegalName}.`);
    lines.push(
      `Decisión: ${decision.requestedPercent}% rechazado el ${decision.decidedAt} por ${decision.decidedBy}.`,
    );
  } else {
    lines.push(`Decisión registrada para ${decision.clientLegalName}.`);
    lines.push(
      `Resultado: ${decision.outcome} el ${decision.decidedAt} por ${decision.decidedBy}.`,
    );
  }

  if (resolved.evidence.length > 0) {
    lines.push('Evidencia citada:');

    for (const evidenceRecord of resolved.evidence) {
      const evidence = parseEvidence(readEntityPayload(evidenceRecord));
      lines.push(`- "${evidence.content}" (registrada por ${evidence.recordedBy}).`);
    }
  }

  if (typeof policyContextLine === 'string' && policyContextLine.trim().length > 0) {
    lines.push(policyContextLine.trim());
  }

  return lines.join('\n');
}
