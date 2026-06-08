import {
  ChatSession,
  clearChatSession,
  cloneChatSession,
  createChatSession,
  normalizeChatSession,
  renameChatSession,
} from './chat_session';

export const CHAT_STORE_VERSION = 1;

export type ChatStore = {
  version: typeof CHAT_STORE_VERSION;
  activeSessionId: string;
  sessions: ChatSession[];
};

export function createChatStore(): ChatStore {
  const session = createChatSession();

  return {
    version: CHAT_STORE_VERSION,
    activeSessionId: session.id,
    sessions: [session],
  };
}

export function cloneChatStore(store: ChatStore): ChatStore {
  return {
    version: CHAT_STORE_VERSION,
    activeSessionId: store.activeSessionId,
    sessions: store.sessions.map(cloneChatSession),
  };
}

export function normalizeChatStore(store: ChatStore): ChatStore {
  if (!Array.isArray(store.sessions) || store.sessions.length === 0) {
    return createChatStore();
  }

  const sessions = store.sessions.map(normalizeChatSession);
  const activeSessionExists = sessions.some((session) => session.id === store.activeSessionId);

  return {
    version: CHAT_STORE_VERSION,
    activeSessionId: activeSessionExists ? store.activeSessionId : sessions[0].id,
    sessions,
  };
}

export function getActiveChatSession(store: ChatStore): ChatSession {
  return ensureActiveChatSession(store);
}

export function createAndActivateChatSession(store: ChatStore, title?: string): ChatSession {
  const session = createChatSession(title);

  store.sessions.unshift(session);
  store.activeSessionId = session.id;

  return session;
}

export function setActiveChatSession(store: ChatStore, sessionId: string): ChatSession | undefined {
  const session = store.sessions.find((candidate) => candidate.id === sessionId);

  if (!session) {
    return undefined;
  }

  store.activeSessionId = session.id;

  return session;
}

export function renameChatSessionById(store: ChatStore, sessionId: string, title: string): void {
  const session = store.sessions.find((candidate) => candidate.id === sessionId);

  if (!session) {
    return;
  }

  renameChatSession(session, title);
}

export function deleteChatSessionById(store: ChatStore, sessionId: string): void {
  store.sessions = store.sessions.filter((session) => session.id !== sessionId);

  if (store.sessions.length === 0) {
    const session = createChatSession();

    store.sessions = [session];
    store.activeSessionId = session.id;
    return;
  }

  if (store.activeSessionId === sessionId) {
    store.activeSessionId = store.sessions[0].id;
  }
}

export function clearActiveChatSession(store: ChatStore): void {
  clearChatSession(ensureActiveChatSession(store));
}

function ensureActiveChatSession(store: ChatStore): ChatSession {
  let session = store.sessions.find((candidate) => candidate.id === store.activeSessionId);

  if (!session) {
    session = createChatSession();
    store.sessions.unshift(session);
    store.activeSessionId = session.id;
  }

  return session;
}
