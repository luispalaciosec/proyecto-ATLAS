export interface UiHistoryMessage {
  readonly role: 'user' | 'assistant';
  readonly content: string;
}
