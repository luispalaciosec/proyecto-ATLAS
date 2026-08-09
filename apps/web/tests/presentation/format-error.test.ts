import { describe, expect, it } from 'vitest';

import { formatCorrectionStatus, formatUserError } from '../../src/presentation/format-error.js';

describe('formatUserError', () => {
  it('maps rate limit errors to friendly Spanish', () => {
    const result = formatUserError('HTTP 429 Too Many Requests');

    expect(result.message).toContain('temporalmente ocupado');
    expect(result.message).not.toContain('429');
  });

  it('maps tool failures without exposing tool_use_failed', () => {
    const result = formatUserError('tool_use_failed: memory_search');

    expect(result.message).not.toContain('tool_use_failed');
    expect(result.technical).toContain('tool_use_failed');
  });

  it('maps connection errors', () => {
    const result = formatUserError('ECONNREFUSED');

    expect(result.message).toContain('conexión');
  });

  it('maps empty goal validation', () => {
    const result = formatUserError('goal must not be empty');

    expect(result.message).toContain('Escribe un mensaje');
  });

  it('maps llm required without Configuración dead-end', () => {
    const result = formatUserError('llm api_key required');

    expect(result.message).toContain('instaló ATLAS');
    expect(result.message).not.toContain('Configuración');
  });
});

describe('formatCorrectionStatus', () => {
  it('maps no_prior_turn to friendly copy', () => {
    const result = formatCorrectionStatus('no_prior_turn');

    expect(result.message).toContain('Todavía no hay una respuesta');
    expect(result.message).not.toContain('no_prior_turn');
  });

  it('maps recorded corrections', () => {
    const result = formatCorrectionStatus('recorded');

    expect(result.message).toContain('Gracias');
  });
});
