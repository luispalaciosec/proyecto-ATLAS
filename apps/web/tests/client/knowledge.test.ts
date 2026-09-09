/**
 * @vitest-environment jsdom
 */
import { beforeEach, describe, expect, it, vi } from 'vitest';

import {
  applyPendingChatDraftToComposer,
  bindKnowledgeDialogRoot,
  renderKnowledge,
  resetKnowledgePageStateForTests,
} from '../../src/client/pages/knowledge.js';
import {
  getState,
  setActiveWorkspace,
  setPendingChatDraft,
  setRoute,
} from '../../src/client/state/app-state.js';

const searchKnowledge = vi.fn();
const uploadKnowledgeDocument = vi.fn();
const fetchKnowledgeDocuments = vi.fn();
const createKnowledgeFolder = vi.fn();

vi.mock('../../src/client/api/client.js', () => ({
  searchKnowledge: (...args: unknown[]) => searchKnowledge(...args),
  uploadKnowledgeDocument: (...args: unknown[]) => uploadKnowledgeDocument(...args),
  fetchKnowledgeDocuments: (...args: unknown[]) => fetchKnowledgeDocuments(...args),
  createKnowledgeFolder: (...args: unknown[]) => createKnowledgeFolder(...args),
  fetchHistory: vi.fn(async () => ({ workspace: 'default', messages: [], canCorrect: false })),
  fetchWorkspaces: vi.fn(async () => ({ workspaces: ['default'] })),
  sendChatMessage: vi.fn(),
  sendCorrection: vi.fn(),
}));

async function flushUi(): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, 0));
  await new Promise((resolve) => setTimeout(resolve, 0));
}

describe('renderKnowledge', () => {
  beforeEach(() => {
    document.body.innerHTML = '<main id="main"></main>';
    setActiveWorkspace('default', { resetChat: true });
    setRoute('/conocimiento');
    searchKnowledge.mockReset();
    uploadKnowledgeDocument.mockReset();
    fetchKnowledgeDocuments.mockReset();
    createKnowledgeFolder.mockReset();
    fetchKnowledgeDocuments.mockResolvedValue({
      workspace: 'default',
      folders: ['General'],
      total: 0,
      documents: [],
    });
    createKnowledgeFolder.mockResolvedValue({
      workspace: 'default',
      folders: ['General', 'Comercial'],
    });
    resetKnowledgePageStateForTests();
  });

  it('renders upload zone and document library', async () => {
    const main = document.querySelector('#main') as HTMLElement;
    renderKnowledge(main);

    expect(main.textContent).toContain('Subir documentos');
    expect(main.textContent).toContain('Arrastra uno o varios archivos');
    expect(main.textContent).toContain('Biblioteca de documentos');
    expect(main.textContent).toContain('Crear carpeta');
    expect(main.querySelector('#knowledge-upload-dropzone')).not.toBeNull();
    expect(main.querySelector('#knowledge-upload-folder-select')).not.toBeNull();

    await flushUi();
    await flushUi();

    expect(fetchKnowledgeDocuments).toHaveBeenCalledWith('default', undefined);
    expect(main.textContent).toContain('Aún no hay documentos');
  });

  it('uploads a supported file and refreshes active search', async () => {
    uploadKnowledgeDocument.mockImplementation(
      async (
        _slug: string,
        file: File,
        onProgress?: (progress: { phase: string; progress: number; fileName: string }) => void,
      ) => {
        onProgress?.({ phase: 'uploading', progress: 20, fileName: file.name });
        onProgress?.({ phase: 'indexing', progress: 80, fileName: file.name });
        onProgress?.({ phase: 'available', progress: 100, fileName: file.name });
        return {
          documentId: 'doc.test',
          fileName: 'manual.txt',
          folder: 'General',
          chunks: 2,
          recordIds: ['a', 'b'],
        };
      },
    );
    searchKnowledge.mockResolvedValue({
      workspace: 'default',
      query: 'manual',
      total: 1,
      records: [
        {
          id: 'record.upload',
          title: 'Manual comercial',
          snippet: 'Manual comercial de Geeks',
          typeLabel: 'Documento',
          contextLabel: 'General',
          sourceLabel: 'Información almacenada en el conocimiento general.',
        },
      ],
    });

    const main = document.querySelector('#main') as HTMLElement;
    renderKnowledge(main);

    const input = main.querySelector('#knowledge-search-input') as HTMLInputElement;
    input.value = 'manual';
    (main.querySelector('#knowledge-search-form') as HTMLFormElement).requestSubmit();
    await flushUi();
    await flushUi();

    const fileInput = main.querySelector('#knowledge-upload-input') as HTMLInputElement;
    const file = new File(['contenido'], 'manual.txt', { type: 'text/plain' });
    Object.defineProperty(fileInput, 'files', { value: [file] });
    fileInput.dispatchEvent(new Event('change', { bubbles: true }));

    await flushUi();
    await flushUi();

    expect(uploadKnowledgeDocument).toHaveBeenCalledWith(
      'default',
      file,
      expect.any(Function),
      'General',
    );
    expect(getState().statusText).toContain('manual.txt');
    expect(getState().statusText).toContain('2 fragmentos');
    expect(main.textContent).toContain('Disponible para buscar');
    expect((main.querySelector('#knowledge-upload-progress') as HTMLElement | null)?.hidden).toBe(
      false,
    );
    expect(searchKnowledge).toHaveBeenLastCalledWith('default', 'manual');
  });

  it('uploads multiple supported files sequentially', async () => {
    uploadKnowledgeDocument.mockImplementation(async (_slug: string, file: File) => ({
      documentId: `doc.${file.name}`,
      fileName: file.name,
      folder: 'General',
      chunks: 1,
      recordIds: [file.name],
    }));

    const main = document.querySelector('#main') as HTMLElement;
    renderKnowledge(main);
    await flushUi();
    await flushUi();

    const fileInput = main.querySelector('#knowledge-upload-input') as HTMLInputElement;
    const files = [
      new File(['a'], 'manual.txt', { type: 'text/plain' }),
      new File(['b'], 'politica.md', { type: 'text/markdown' }),
    ];
    Object.defineProperty(fileInput, 'files', { value: files });
    fileInput.dispatchEvent(new Event('change', { bubbles: true }));

    await flushUi();
    await flushUi();

    expect(uploadKnowledgeDocument).toHaveBeenCalledTimes(2);
    expect(getState().statusText).toContain('Se incorporaron 2 documentos');
    expect(main.textContent).toContain('Documento 2 de 2');
  });

  it('shows upload progress phases while uploading', async () => {
    let resolveUpload!: (value: {
      documentId: string;
      fileName: string;
      folder: string;
      chunks: number;
      recordIds: string[];
    }) => void;
    const uploadPromise = new Promise<{
      documentId: string;
      fileName: string;
      folder: string;
      chunks: number;
      recordIds: string[];
    }>((resolve) => {
      resolveUpload = resolve;
    });

    uploadKnowledgeDocument.mockImplementation(
      async (
        _slug: string,
        file: File,
        onProgress?: (progress: { phase: string; progress: number; fileName: string }) => void,
      ) => {
        onProgress?.({ phase: 'uploading', progress: 25, fileName: file.name });
        onProgress?.({ phase: 'reading', progress: 55, fileName: file.name });
        onProgress?.({ phase: 'indexing', progress: 75, fileName: file.name });
        return uploadPromise;
      },
    );

    const main = document.querySelector('#main') as HTMLElement;
    renderKnowledge(main);

    const fileInput = main.querySelector('#knowledge-upload-input') as HTMLInputElement;
    const file = new File(['contenido'], 'informe.pdf', { type: 'application/pdf' });
    Object.defineProperty(fileInput, 'files', { value: [file] });
    fileInput.dispatchEvent(new Event('change', { bubbles: true }));

    await flushUi();

    expect(main.textContent).toContain('informe.pdf');
    expect(main.textContent).toContain('Indexando en el conocimiento');

    resolveUpload({
      documentId: 'doc.test',
      fileName: 'informe.pdf',
      folder: 'General',
      chunks: 1,
      recordIds: ['x'],
    });
    await flushUi();
    await flushUi();

    expect(main.textContent).toContain('Disponible para buscar');
    expect(
      (main.querySelector('#knowledge-upload-search-btn') as HTMLButtonElement | null)?.hidden,
    ).toBe(false);
  });

  it('creates a folder and refreshes the library', async () => {
    const main = document.querySelector('#main') as HTMLElement;
    renderKnowledge(main);
    await flushUi();
    await flushUi();

    const input = main.querySelector('#knowledge-create-folder-input') as HTMLInputElement;
    input.value = 'Comercial';
    (main.querySelector('#knowledge-create-folder-form') as HTMLFormElement).requestSubmit();
    await flushUi();
    await flushUi();

    expect(createKnowledgeFolder).toHaveBeenCalledWith('default', 'Comercial');
    expect(main.textContent).toContain('Carpeta «Comercial» creada.');
  });

  it('renders document library entries and folder filters', async () => {
    fetchKnowledgeDocuments.mockResolvedValue({
      workspace: 'default',
      folders: ['General', 'Comercial'],
      total: 1,
      documents: [
        {
          documentId: 'doc.1',
          fileName: 'Manual.pdf',
          fileType: 'pdf',
          folder: 'Comercial',
          chunks: 3,
          uploadedAt: '2026-08-10T12:00:00.000Z',
          recordIds: ['a', 'b', 'c'],
        },
      ],
    });

    const main = document.querySelector('#main') as HTMLElement;
    renderKnowledge(main);
    await flushUi();
    await flushUi();

    expect(main.textContent).toContain('Manual.pdf');
    expect(main.textContent).toContain('Todas las carpetas');
    expect(main.textContent).toContain('Comercial');
    expect(main.textContent).toContain('Buscar en documento');
  });

  it('renders empty state before searching', () => {
    const main = document.querySelector('#main') as HTMLElement;
    renderKnowledge(main);

    expect(main.textContent).toContain('Tu conocimiento está aquí para ayudarte.');
    expect(main.querySelector('#knowledge-examples')?.children.length).toBe(4);
    expect(main.textContent).toContain('Trabajando en General');
  });

  it('shows loading and results after search', async () => {
    searchKnowledge.mockResolvedValue({
      workspace: 'default',
      query: 'Clientes VIP',
      total: 1,
      records: [
        {
          id: 'record.1',
          title: 'Ana García es cliente VIP',
          snippet: 'Ana García es cliente VIP desde 2024.',
          typeLabel: 'Nota',
          contextLabel: 'General',
          sourceLabel: 'Información almacenada en el conocimiento general.',
        },
      ],
    });

    const main = document.querySelector('#main') as HTMLElement;
    renderKnowledge(main);

    const input = main.querySelector('#knowledge-search-input') as HTMLInputElement;
    input.value = 'Clientes VIP';
    (main.querySelector('#knowledge-search-form') as HTMLFormElement).requestSubmit();

    expect(main.textContent).toContain('Estamos buscando en el conocimiento de General');

    await flushUi();
    await flushUi();

    expect(searchKnowledge).toHaveBeenCalledWith('default', 'Clientes VIP');
    expect(main.textContent).toContain('1 resultado encontrado');
    expect(main.textContent).toContain('Ana García es cliente VIP');
    expect(main.textContent).toContain('Usar en una conversación');
  });

  it('shows no-results state with ask action', async () => {
    searchKnowledge.mockResolvedValue({
      workspace: 'default',
      query: 'inexistente',
      total: 0,
      records: [],
    });

    const main = document.querySelector('#main') as HTMLElement;
    renderKnowledge(main);

    const input = main.querySelector('#knowledge-search-input') as HTMLInputElement;
    input.value = 'inexistente';
    (main.querySelector('#knowledge-search-form') as HTMLFormElement).requestSubmit();
    await flushUi();
    await flushUi();

    expect(main.textContent).toContain('No encontramos información sobre eso.');
    expect(main.textContent).toContain('No encontré lo que buscaba');
  });

  it('shows error state with retry', async () => {
    searchKnowledge.mockRejectedValueOnce(new Error('CORE_INVALID_IDENTIFIER'));

    const main = document.querySelector('#main') as HTMLElement;
    renderKnowledge(main);

    const input = main.querySelector('#knowledge-search-input') as HTMLInputElement;
    input.value = 'fallo';
    (main.querySelector('#knowledge-search-form') as HTMLFormElement).requestSubmit();
    await flushUi();
    await flushUi();

    expect(main.textContent).toContain('No pudimos consultar el conocimiento en este momento.');
    expect(main.textContent).toContain('Intentar de nuevo');
    const details = main.querySelector('.error-panel__details') as HTMLElement | null;
    expect(details?.hidden).toBe(true);
    expect(details?.textContent).toContain('CORE_INVALID_IDENTIFIER');
  });

  it('opens chat with a prepared prompt from a result', async () => {
    searchKnowledge.mockResolvedValue({
      workspace: 'geeks',
      query: 'Ana García',
      total: 1,
      records: [
        {
          id: 'record.1',
          title: 'Ana García es cliente VIP',
          snippet: 'Ana García es cliente VIP desde 2024.',
          typeLabel: 'Nota',
          contextLabel: 'Geeks',
          sourceLabel: 'Información almacenada en el conocimiento de Geeks.',
        },
      ],
    });

    setActiveWorkspace('geeks', { resetChat: true });
    const main = document.querySelector('#main') as HTMLElement;
    renderKnowledge(main);

    const input = main.querySelector('#knowledge-search-input') as HTMLInputElement;
    input.value = 'Ana García';
    (main.querySelector('#knowledge-search-form') as HTMLFormElement).requestSubmit();
    await flushUi();
    await flushUi();

    const useButton = main.querySelector('.knowledge-card__actions .btn') as HTMLButtonElement;
    useButton.click();

    expect(getState().pendingChatDraft).toContain('Ana García');
    expect(getState().route).toBe('/chat');
  });

  it('resets to idle when active brand changes', () => {
    const main = document.querySelector('#main') as HTMLElement;
    renderKnowledge(main);

    const input = main.querySelector('#knowledge-search-input') as HTMLInputElement;
    input.value = 'persistente';

    setActiveWorkspace('geeks', { resetChat: true });
    renderKnowledge(main);

    expect(getState().activeWorkspace).toBe('geeks');
    expect(main.textContent).toContain('Tu conocimiento está aquí para ayudarte.');
  });

  it('shows a normal success message for a new file name', async () => {
    fetchKnowledgeDocuments.mockResolvedValue({
      workspace: 'default',
      folders: ['General'],
      total: 0,
      documents: [],
    });
    uploadKnowledgeDocument.mockResolvedValue({
      documentId: 'doc.new',
      fileName: 'nuevo-manual.txt',
      folder: 'General',
      chunks: 1,
      recordIds: ['a'],
    });

    const main = document.querySelector('#main') as HTMLElement;
    renderKnowledge(main);
    await flushUi();
    await flushUi();

    const fileInput = main.querySelector('#knowledge-upload-input') as HTMLInputElement;
    Object.defineProperty(fileInput, 'files', {
      value: [new File(['contenido'], 'nuevo-manual.txt', { type: 'text/plain' })],
    });
    fileInput.dispatchEvent(new Event('change', { bubbles: true }));

    await flushUi();
    await flushUi();

    expect(getState().statusText).toContain('nuevo-manual.txt');
    expect((main.querySelector('#knowledge-upload-notice') as HTMLElement | null)?.hidden).toBe(
      true,
    );
  });

  it('shows a duplicate confirmation dialog and persistent notice for an exact file name repeat', async () => {
    document.body.insertAdjacentHTML('beforeend', '<div id="shell-dialog-root"></div>');
    bindKnowledgeDialogRoot(document.querySelector('#shell-dialog-root') as HTMLElement);

    fetchKnowledgeDocuments.mockResolvedValue({
      workspace: 'default',
      folders: ['General'],
      total: 1,
      documents: [
        {
          documentId: 'doc.existing',
          fileName: 'manual.txt',
          fileType: 'txt',
          folder: 'General',
          chunks: 2,
          uploadedAt: '2026-08-16T10:00:00.000Z',
          recordIds: ['a', 'b'],
        },
      ],
    });
    uploadKnowledgeDocument.mockResolvedValue({
      documentId: 'doc.repeat',
      fileName: 'manual.txt',
      folder: 'General',
      chunks: 1,
      recordIds: ['c'],
    });

    const main = document.querySelector('#main') as HTMLElement;
    renderKnowledge(main);
    await flushUi();
    await flushUi();

    const fileInput = main.querySelector('#knowledge-upload-input') as HTMLInputElement;
    Object.defineProperty(fileInput, 'files', {
      value: [new File(['contenido'], 'manual.txt', { type: 'text/plain' })],
    });
    fileInput.dispatchEvent(new Event('change', { bubbles: true }));

    await flushUi();
    await flushUi();

    expect(document.body.textContent).toContain('¿Actualizar conocimiento existente?');
    expect(document.body.textContent).toContain('manual.txt coincide con manual.txt');

    (document.querySelector('#knowledge-duplicate-continue') as HTMLButtonElement).click();
    await flushUi();
    await flushUi();

    expect(uploadKnowledgeDocument).toHaveBeenCalled();
    expect(getState().statusText).not.toContain('Se incorporó manual.txt');
    expect((main.querySelector('#knowledge-upload-notice') as HTMLElement | null)?.hidden).toBe(
      false,
    );
    expect(main.textContent).toContain('Conocimiento actualizado');
  });

  it('detects a similar file name before upload and shows the duplicate notice afterward', async () => {
    document.body.insertAdjacentHTML('beforeend', '<div id="shell-dialog-root"></div>');
    bindKnowledgeDialogRoot(document.querySelector('#shell-dialog-root') as HTMLElement);

    fetchKnowledgeDocuments.mockResolvedValue({
      workspace: 'default',
      folders: ['General'],
      total: 1,
      documents: [
        {
          documentId: 'doc.price-2024',
          fileName: 'lista_precios_2024.pdf',
          fileType: 'pdf',
          folder: 'General',
          chunks: 3,
          uploadedAt: '2026-08-16T10:00:00.000Z',
          recordIds: ['a', 'b', 'c'],
        },
      ],
    });
    uploadKnowledgeDocument.mockResolvedValue({
      documentId: 'doc.price-2025',
      fileName: 'lista_precios_2025.pdf',
      folder: 'General',
      chunks: 2,
      recordIds: ['d', 'e'],
    });

    const main = document.querySelector('#main') as HTMLElement;
    renderKnowledge(main);
    await flushUi();
    await flushUi();

    const fileInput = main.querySelector('#knowledge-upload-input') as HTMLInputElement;
    Object.defineProperty(fileInput, 'files', {
      value: [new File(['pdf'], 'lista_precios_2025.pdf', { type: 'application/pdf' })],
    });
    fileInput.dispatchEvent(new Event('change', { bubbles: true }));

    await flushUi();
    await flushUi();

    expect(document.body.textContent).toContain('parece una versión de lista_precios_2024.pdf');

    (document.querySelector('#knowledge-duplicate-continue') as HTMLButtonElement).click();
    await flushUi();
    await flushUi();

    expect(uploadKnowledgeDocument).toHaveBeenCalled();
    expect((main.querySelector('#knowledge-upload-notice') as HTMLElement | null)?.hidden).toBe(
      false,
    );
    expect(main.textContent).toContain('lista_precios_2024.pdf');
  });
});

describe('applyPendingChatDraftToComposer', () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <main id="main">
        <textarea id="chat-input"></textarea>
      </main>
    `;
  });

  it('prefills chat composer from pending draft', async () => {
    setPendingChatDraft('¿Qué información tenemos sobre Ana García?');
    applyPendingChatDraftToComposer();
    await flushUi();

    const input = document.querySelector('#chat-input') as HTMLTextAreaElement;
    expect(input.value).toBe('¿Qué información tenemos sobre Ana García?');
  });
});
