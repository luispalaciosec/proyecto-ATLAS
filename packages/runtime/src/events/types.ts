/**
 * @see ATLAS-RUNTIME-002 Event Model
 */
export interface RuntimeEventEnvelope {
  readonly event_id: string;
  readonly event_type: string;
  readonly event_version: string;
  readonly timestamp: string;
  readonly correlation_id: string;
  readonly execution_id: string;
  readonly payload: Readonly<Record<string, unknown>>;
}

export interface RuntimeEventFilter {
  readonly execution_id?: string;
  readonly event_type?: string;
  readonly correlation_id?: string;
}

export type RuntimeEventHandler = (event: RuntimeEventEnvelope) => void;

export interface RuntimeEventSubscription {
  readonly subscription_id: string;
  readonly unsubscribe: () => void;
}
