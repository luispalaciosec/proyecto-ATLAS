/**
 * @vitest-environment jsdom
 */
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { SettingsApiError } from '../../src/client/api/client.js';
import { renderSettings } from '../../src/client/pages/settings.js';
import type { LlmSettingsView } from '../../src/presentation/llm-settings.js';

const fetchLlmSettings = vi.fn();
const saveLlmSettings = vi.fn();
const resetLlmSettings = vi.fn();
const testLlmSettings = vi.fn();

vi.mock('../../src/client/api/client.js', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../../src/client/api/client.js')>();
  return {
    ...actual,
    fetchLlmSettings: (...args: unknown[]) => fetchLlmSettings(...args),
    saveLlmSettings: (...args: unknown[]) => saveLlmSettings(...args),
    resetLlmSettings: (...args: unknown[]) => resetLlmSettings(...args),
    testLlmSettings: (...args: unknown[]) => testLlmSettings(...args),
  };
});

const FAKE_KEY = 'sk-test-FICTICIA-000000a3f2';

const savedGeminiView: LlmSettingsView = {
  source: 'saved',
  configured: true,
  provider: 'gemini',
  baseUrl: 'https://generativelanguage.googleapis.com/v1beta/openai/',
  model: 'gemini-test-model',
  hasApiKey: true,
  apiKeyMasked: '…a3f2',
};

async function flushUi(): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, 0));
  await new Promise((resolve) => setTimeout(resolve, 0));
}

function el<T extends Element>(selector: string): T {
  return document.querySelector(selector) as T;
}

async function mountSettings(view: LlmSettingsView): Promise<HTMLElement> {
  fetchLlmSettings.mockResolvedValue(view);
  const main = document.querySelector('#main') as HTMLElement;
  renderSettings(main);
  await flushUi();
  return main;
}

describe('renderSettings', () => {
  beforeEach(() => {
    document.body.innerHTML = '<main id="main"></main>';
    fetchLlmSettings.mockReset();
    saveLlmSettings.mockReset();
    resetLlmSettings.mockReset();
    testLlmSettings.mockReset();
  });

  it('shows the current status with a masked key and never fills the key field', async () => {
    const main = await mountSettings(savedGeminiView);

    expect(main.textContent).toContain('Asistente de IA configurado.');
    expect(main.textContent).toContain('Origen: guardado desde esta página.');
    expect(main.textContent).toContain('Clave: termina en …a3f2');
    expect(el<HTMLSelectElement>('#settings-provider').value).toBe('gemini');
    expect(el<HTMLInputElement>('#settings-model').value).toBe('gemini-test-model');
    expect(el<HTMLInputElement>('#settings-api-key').type).toBe('password');
    expect(el<HTMLInputElement>('#settings-api-key').value).toBe('');
    expect(el<HTMLInputElement>('#settings-api-key').placeholder).toContain('conservar');
    expect(el<HTMLButtonElement>('#settings-reset').hidden).toBe(false);
  });

  it('shows the free-tier warning, recommendations and the model-name note', async () => {
    const main = await mountSettings({ source: 'none', configured: false, hasApiKey: false });

    expect(main.textContent).toContain('No uses el tier gratuito con datos reales de clientes.');
    expect(main.textContent).toContain('Ollama (local)');
    expect(main.textContent).toContain('Verifica el nombre vigente en la consola del proveedor.');
    expect(main.textContent).toContain('Sin configurar');
    expect(el<HTMLButtonElement>('#settings-reset').hidden).toBe(true);
  });

  it('fills the default base URL per provider without overwriting a custom one', async () => {
    await mountSettings({ source: 'none', configured: false, hasApiKey: false });
    const provider = el<HTMLSelectElement>('#settings-provider');
    const baseUrl = el<HTMLInputElement>('#settings-base-url');

    expect(el<HTMLElement>('#settings-base-url-field').hidden).toBe(true);

    provider.value = 'gemini';
    provider.dispatchEvent(new Event('change'));
    expect(baseUrl.value).toBe('https://generativelanguage.googleapis.com/v1beta/openai/');
    expect(el<HTMLElement>('#settings-base-url-field').hidden).toBe(false);

    provider.value = 'ollama';
    provider.dispatchEvent(new Event('change'));
    expect(baseUrl.value).toBe('http://localhost:11434/v1');
    expect(el<HTMLElement>('#settings-api-key-hint').textContent).toContain('no necesita clave');

    baseUrl.value = 'http://192.168.1.50:11434/v1';
    provider.value = 'openai-compatible';
    provider.dispatchEvent(new Event('change'));
    expect(baseUrl.value).toBe('http://192.168.1.50:11434/v1');
  });

  it('asks for a new key when the base URL differs from the saved one', async () => {
    await mountSettings(savedGeminiView);
    const baseUrl = el<HTMLInputElement>('#settings-base-url');

    baseUrl.value = 'https://otro.example.test/v1';
    baseUrl.dispatchEvent(new Event('input'));

    expect(el<HTMLInputElement>('#settings-api-key').placeholder).toBe('Pega aquí tu clave');
  });

  it('tests the proposed configuration and shows the readable result', async () => {
    await mountSettings(savedGeminiView);
    testLlmSettings.mockResolvedValue({
      ok: false,
      code: 'unauthorized',
      status: 401,
      message: 'La clave no es válida o expiró (401). Revisa la clave de API.',
    });

    el<HTMLInputElement>('#settings-api-key').value = FAKE_KEY;
    el<HTMLButtonElement>('#settings-test').click();
    await flushUi();

    expect(testLlmSettings).toHaveBeenCalledWith({
      provider: 'gemini',
      model: 'gemini-test-model',
      baseUrl: 'https://generativelanguage.googleapis.com/v1beta/openai/',
      apiKey: FAKE_KEY,
    });
    const result = el<HTMLElement>('#settings-result');
    expect(result.hidden).toBe(false);
    expect(result.textContent).toContain('(401)');
    expect(result.classList.contains('settings-result--error')).toBe(true);
  });

  it('saves, clears the key field and refreshes the status', async () => {
    await mountSettings({ source: 'none', configured: false, hasApiKey: false });
    saveLlmSettings.mockResolvedValue({
      ...savedGeminiView,
      provider: 'anthropic',
      baseUrl: undefined,
      model: 'claude-test-model',
    });

    el<HTMLInputElement>('#settings-model').value = 'claude-test-model';
    el<HTMLInputElement>('#settings-api-key').value = FAKE_KEY;
    el<HTMLFormElement>('#settings-form').dispatchEvent(new Event('submit', { cancelable: true }));
    await flushUi();

    expect(saveLlmSettings).toHaveBeenCalledWith({
      provider: 'anthropic',
      model: 'claude-test-model',
      apiKey: FAKE_KEY,
    });
    expect(el<HTMLInputElement>('#settings-api-key').value).toBe('');
    expect(el<HTMLElement>('#settings-result').textContent).toContain('Configuración guardada');
    expect(document.body.textContent).toContain('Modelo: claude-test-model');
    expect(document.body.innerHTML).not.toContain(FAKE_KEY);
  });

  it('shows the server validation message when saving fails', async () => {
    await mountSettings({ source: 'none', configured: false, hasApiKey: false });
    saveLlmSettings.mockRejectedValue(new SettingsApiError('Escribe la clave de API.', 400));

    el<HTMLInputElement>('#settings-model').value = 'claude-test-model';
    el<HTMLFormElement>('#settings-form').dispatchEvent(new Event('submit', { cancelable: true }));
    await flushUi();

    expect(el<HTMLElement>('#settings-result').textContent).toBe('Escribe la clave de API.');
  });

  it('shows a load error when the settings cannot be fetched', async () => {
    fetchLlmSettings.mockRejectedValue(new Error('network'));
    const main = document.querySelector('#main') as HTMLElement;

    renderSettings(main);
    await flushUi();

    expect(main.textContent).toContain('No pudimos cargar la configuración.');
  });
});
