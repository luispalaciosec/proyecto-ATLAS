const workspaceSelect = document.querySelector('#workspace-select');
const workspaceNewInput = document.querySelector('#workspace-new');
const workspaceUseButton = document.querySelector('#workspace-use');
const workspaceActive = document.querySelector('#workspace-active');
const messages = document.querySelector('#messages');
const chatForm = document.querySelector('#chat-form');
const goalInput = document.querySelector('#goal-input');
const correctionInput = document.querySelector('#correction-input');
const correctButton = document.querySelector('#correct-button');
const status = document.querySelector('#status');

let activeWorkspace = 'default';

function setStatus(text) {
  status.textContent = text;
}

function appendMessage(kind, text) {
  const element = document.createElement('div');
  element.className = `message ${kind}`;
  element.textContent = text;
  messages.append(element);
  messages.scrollTop = messages.scrollHeight;
}

function workspacePayloadValue() {
  return activeWorkspace === 'default' ? undefined : activeWorkspace;
}

async function loadWorkspaces() {
  const response = await fetch('/api/workspaces');

  if (!response.ok) {
    throw new Error('Unable to load workspaces');
  }

  const payload = await response.json();
  workspaceSelect.replaceChildren();

  for (const workspace of payload.workspaces ?? []) {
    const option = document.createElement('option');
    option.value = workspace;
    option.textContent = workspace;
    workspaceSelect.append(option);
  }

  workspaceSelect.value = activeWorkspace;
  workspaceActive.textContent = `Active workspace: ${activeWorkspace}`;
}

function setActiveWorkspace(workspace) {
  const trimmed = workspace.trim();

  if (trimmed.length === 0) {
    setStatus('Workspace name must not be empty.');
    return;
  }

  activeWorkspace = trimmed;
  workspaceSelect.value = activeWorkspace;
  workspaceActive.textContent = `Active workspace: ${activeWorkspace}`;
  messages.replaceChildren();
  setStatus(`Switched to workspace "${activeWorkspace}".`);
}

async function sendChat(goal) {
  setStatus('Sending goal...');

  const response = await fetch('/api/chat', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      goal,
      ...(workspacePayloadValue() !== undefined ? { workspace: workspacePayloadValue() } : {}),
    }),
  });

  const payload = await response.json();

  if (!response.ok) {
    throw new Error(payload.error ?? 'Chat request failed');
  }

  if (payload.mode === 'llm') {
    appendMessage('assistant', payload.llm_message ?? '(empty LLM response)');
  } else {
    appendMessage(
      'assistant',
      [
        `Mode: deterministic`,
        `Success: ${payload.success ? 'yes' : 'no'}`,
        `Workflow: ${payload.workflow_id ?? 'n/a'}`,
        `Retrieval: ${payload.retrieval?.selected ?? 0}/${payload.retrieval?.total_candidates ?? 0}`,
      ].join('\n'),
    );
  }

  setStatus(`Turn ${payload.turn} completed (${payload.mode ?? 'unknown'}).`);
}

async function sendCorrection(correction) {
  setStatus('Submitting correction...');

  const response = await fetch('/api/correct', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      correction,
      ...(workspacePayloadValue() !== undefined ? { workspace: workspacePayloadValue() } : {}),
    }),
  });

  const payload = await response.json();

  if (!response.ok) {
    throw new Error(payload.error ?? 'Correction request failed');
  }

  appendMessage('system', payload.message ?? payload.status);
  setStatus(`Correction status: ${payload.status}`);
}

workspaceSelect.addEventListener('change', () => {
  setActiveWorkspace(workspaceSelect.value);
});

workspaceUseButton.addEventListener('click', () => {
  setActiveWorkspace(workspaceNewInput.value);
});

chatForm.addEventListener('submit', async (event) => {
  event.preventDefault();

  const goal = goalInput.value.trim();

  if (goal.length === 0) {
    setStatus('Goal must not be empty.');
    return;
  }

  appendMessage('user', goal);
  goalInput.value = '';

  try {
    await sendChat(goal);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    appendMessage('error', message);
    setStatus(message);
  }
});

correctButton.addEventListener('click', async () => {
  const correction = correctionInput.value.trim();

  if (correction.length === 0) {
    setStatus('Correction must not be empty.');
    return;
  }

  correctionInput.value = '';

  try {
    await sendCorrection(correction);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    appendMessage('error', message);
    setStatus(message);
  }
});

loadWorkspaces().catch((error) => {
  const message = error instanceof Error ? error.message : String(error);
  setStatus(message);
});
