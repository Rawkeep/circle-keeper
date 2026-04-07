import { useState, useCallback, useRef, useEffect } from 'react';

// ---------------------------------------------------------------------------
// Provider Registry
// ---------------------------------------------------------------------------

export const CLOUD_PROVIDERS = {
  anthropic: {
    id: 'anthropic',
    name: 'Anthropic (Claude)',
    baseUrl: 'https://api.anthropic.com',
    chatPath: '/v1/messages',
    modelsPath: null,
    browserDirect: false,
    authStyle: 'x-api-key',
    models: [
      { id: 'claude-sonnet-4-20250514', name: 'Claude Sonnet 4', pricing: '$3 / $15 pro MTok' },
      { id: 'claude-haiku-4-20250414', name: 'Claude Haiku 4', pricing: '$0.80 / $4 pro MTok' },
      { id: 'claude-opus-4-20250514', name: 'Claude Opus 4', pricing: '$15 / $75 pro MTok' },
    ],
    pricing: 'Pay-per-token, ab $0.80/MTok',
  },
  openai: {
    id: 'openai',
    name: 'OpenAI (GPT)',
    baseUrl: 'https://api.openai.com',
    chatPath: '/v1/chat/completions',
    modelsPath: '/v1/models',
    browserDirect: true,
    authStyle: 'bearer',
    models: [
      { id: 'gpt-4o', name: 'GPT-4o', pricing: '$2.50 / $10 pro MTok' },
      { id: 'gpt-4o-mini', name: 'GPT-4o Mini', pricing: '$0.15 / $0.60 pro MTok' },
      { id: 'o4-mini', name: 'o4-mini', pricing: '$1.10 / $4.40 pro MTok' },
      { id: 'o3', name: 'o3', pricing: '$2 / $8 pro MTok' },
    ],
    pricing: 'Pay-per-token, ab $0.15/MTok',
  },
  gemini: {
    id: 'gemini',
    name: 'Google Gemini',
    baseUrl: 'https://generativelanguage.googleapis.com',
    chatPath: '/v1beta/chat/completions',
    modelsPath: null,
    browserDirect: true,
    authStyle: 'bearer',
    models: [
      { id: 'gemini-2.5-flash', name: 'Gemini 2.5 Flash', pricing: '$0.15 / $0.60 pro MTok' },
      { id: 'gemini-2.5-pro', name: 'Gemini 2.5 Pro', pricing: '$1.25 / $10 pro MTok' },
      { id: 'gemini-2.0-flash', name: 'Gemini 2.0 Flash', pricing: '$0.10 / $0.40 pro MTok' },
    ],
    pricing: 'Pay-per-token, ab $0.10/MTok',
  },
  mistral: {
    id: 'mistral',
    name: 'Mistral AI',
    baseUrl: 'https://api.mistral.ai',
    chatPath: '/v1/chat/completions',
    modelsPath: '/v1/models',
    browserDirect: true,
    authStyle: 'bearer',
    models: [
      { id: 'mistral-large-latest', name: 'Mistral Large', pricing: '$2 / $6 pro MTok' },
      { id: 'mistral-small-latest', name: 'Mistral Small', pricing: '$0.10 / $0.30 pro MTok' },
      { id: 'codestral-latest', name: 'Codestral', pricing: '$0.30 / $0.90 pro MTok' },
    ],
    pricing: 'Pay-per-token, ab $0.10/MTok',
  },
  openrouter: {
    id: 'openrouter',
    name: 'OpenRouter',
    baseUrl: 'https://openrouter.ai/api',
    chatPath: '/v1/chat/completions',
    modelsPath: '/v1/models',
    browserDirect: true,
    authStyle: 'bearer',
    models: [
      { id: 'anthropic/claude-sonnet-4', name: 'Claude Sonnet 4 (OR)', pricing: 'variabel' },
      { id: 'openai/gpt-4o', name: 'GPT-4o (OR)', pricing: 'variabel' },
      { id: 'google/gemini-2.5-flash', name: 'Gemini 2.5 Flash (OR)', pricing: 'variabel' },
      { id: 'deepseek/deepseek-r1', name: 'DeepSeek R1 (OR)', pricing: 'variabel' },
    ],
    pricing: 'Pay-per-token, variabel je Modell',
  },
  groq: {
    id: 'groq',
    name: 'Groq',
    baseUrl: 'https://api.groq.com/openai',
    chatPath: '/v1/chat/completions',
    modelsPath: '/v1/models',
    browserDirect: true,
    authStyle: 'bearer',
    models: [
      { id: 'llama-3.3-70b-versatile', name: 'Llama 3.3 70B', pricing: '$0.59 / $0.79 pro MTok' },
      { id: 'llama-3.1-8b-instant', name: 'Llama 3.1 8B', pricing: '$0.05 / $0.08 pro MTok' },
      { id: 'mixtral-8x7b-32768', name: 'Mixtral 8x7B', pricing: '$0.24 / $0.24 pro MTok' },
    ],
    pricing: 'Pay-per-token, ab $0.05/MTok',
  },
};

// ---------------------------------------------------------------------------
// Storage helpers
// ---------------------------------------------------------------------------

const KEYS_STORAGE = 'universal_ai_keys';
const CONFIG_STORAGE = 'universal_ai_config';
const FREEMIUM_STORAGE = 'universal_ai_freemium';
const FREEMIUM_LIMIT = 5;

function loadKeys() {
  try {
    return JSON.parse(localStorage.getItem(KEYS_STORAGE) || '{}');
  } catch {
    return {};
  }
}

function saveKeys(keys) {
  localStorage.setItem(KEYS_STORAGE, JSON.stringify(keys));
}

function loadConfig() {
  try {
    return JSON.parse(localStorage.getItem(CONFIG_STORAGE) || '{}');
  } catch {
    return {};
  }
}

function saveConfig(cfg) {
  localStorage.setItem(CONFIG_STORAGE, JSON.stringify(cfg));
}

function loadFreemium() {
  try {
    const data = JSON.parse(localStorage.getItem(FREEMIUM_STORAGE) || '{}');
    const today = new Date().toISOString().slice(0, 10);
    if (data.date !== today) {
      return { date: today, used: 0 };
    }
    return data;
  } catch {
    return { date: new Date().toISOString().slice(0, 10), used: 0 };
  }
}

function saveFreemium(data) {
  localStorage.setItem(FREEMIUM_STORAGE, JSON.stringify(data));
}

function maskKey(key) {
  if (!key || key.length < 8) return key ? '****' : '';
  return key.slice(0, 4) + '****' + key.slice(-4);
}

// ---------------------------------------------------------------------------
// Request builders
// ---------------------------------------------------------------------------

function buildHeaders(provider, apiKey) {
  const headers = { 'Content-Type': 'application/json' };

  if (provider.id === 'anthropic') {
    headers['x-api-key'] = apiKey;
    headers['anthropic-version'] = '2023-06-01';
    headers['anthropic-dangerous-direct-browser-access'] = 'true';
  } else {
    headers['Authorization'] = 'Bearer ' + apiKey;
  }

  if (provider.id === 'openrouter') {
    headers['HTTP-Referer'] = typeof window !== 'undefined' ? window.location.origin : '';
    headers['X-Title'] = typeof document !== 'undefined' ? document.title || 'App' : 'App';
  }

  return headers;
}

function buildBody(provider, model, prompt, systemPrompt, history, stream) {
  if (provider.id === 'anthropic') {
    const messages = [...(history || [])];
    messages.push({ role: 'user', content: prompt });
    const body = {
      model: model,
      max_tokens: 4096,
      messages: messages,
    };
    if (systemPrompt) {
      body.system = systemPrompt;
    }
    if (stream) {
      body.stream = true;
    }
    return body;
  }

  // OpenAI-compatible format (openai, gemini, mistral, openrouter, groq)
  const messages = [];
  if (systemPrompt) {
    messages.push({ role: 'system', content: systemPrompt });
  }
  if (history && history.length > 0) {
    messages.push(...history);
  }
  messages.push({ role: 'user', content: prompt });

  const body = {
    model: model,
    messages: messages,
  };
  if (stream) {
    body.stream = true;
  }
  return body;
}

function buildUrl(provider, proxyUrl) {
  const base = proxyUrl || provider.baseUrl;
  return base + provider.chatPath;
}

// ---------------------------------------------------------------------------
// Response parsers
// ---------------------------------------------------------------------------

function parseResponse(provider, data) {
  if (provider.id === 'anthropic') {
    if (data.content && data.content.length > 0) {
      return data.content[0].text;
    }
    return '';
  }
  // OpenAI-compatible
  if (data.choices && data.choices.length > 0) {
    return data.choices[0].message.content || '';
  }
  return '';
}

function parseSSEChunk(provider, parsed) {
  if (provider.id === 'anthropic') {
    if (parsed.type === 'content_block_delta' && parsed.delta && parsed.delta.text) {
      return parsed.delta.text;
    }
    return '';
  }
  // OpenAI-compatible
  if (parsed.choices && parsed.choices.length > 0 && parsed.choices[0].delta) {
    return parsed.choices[0].delta.content || '';
  }
  return '';
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export function useUniversalAI() {
  const [state, setState] = useState(() => {
    const cfg = loadConfig();
    const keys = loadKeys();
    const providerId = cfg.provider || 'openai';
    const provider = CLOUD_PROVIDERS[providerId] || CLOUD_PROVIDERS.openai;
    const model = cfg.model || provider.models[0].id;
    const freemium = loadFreemium();

    return {
      providerId: providerId,
      model: model,
      proxyUrl: cfg.proxyUrl || null,
      isLoading: false,
      error: null,
      freemiumUsed: freemium.used,
      keys: keys,
    };
  });

  const abortRef = useRef(null);

  const currentProvider = CLOUD_PROVIDERS[state.providerId] || CLOUD_PROVIDERS.openai;
  const currentApiKey = state.keys[state.providerId] || '';
  const isConnected = Boolean(currentApiKey);

  // --- Key management ---

  const setApiKey = useCallback((providerId, key) => {
    setState((prev) => {
      const newKeys = { ...prev.keys, [providerId]: key };
      saveKeys(newKeys);
      return { ...prev, keys: newKeys, error: null };
    });
  }, []);

  const removeApiKey = useCallback((providerId) => {
    setState((prev) => {
      const newKeys = { ...prev.keys };
      delete newKeys[providerId];
      saveKeys(newKeys);
      return { ...prev, keys: newKeys };
    });
  }, []);

  const getApiKey = useCallback(
    (providerId) => {
      return state.keys[providerId] || '';
    },
    [state.keys]
  );

  const getMaskedKey = useCallback(
    (providerId) => {
      return maskKey(state.keys[providerId]);
    },
    [state.keys]
  );

  // --- Provider / model / proxy ---

  const setProvider = useCallback((id) => {
    if (!CLOUD_PROVIDERS[id]) return;
    setState((prev) => {
      const provider = CLOUD_PROVIDERS[id];
      const cfg = loadConfig();
      cfg.provider = id;
      cfg.model = provider.models[0].id;
      saveConfig(cfg);
      return { ...prev, providerId: id, model: provider.models[0].id, error: null };
    });
  }, []);

  const setModel = useCallback((modelId) => {
    setState((prev) => {
      const cfg = loadConfig();
      cfg.model = modelId;
      saveConfig(cfg);
      return { ...prev, model: modelId, error: null };
    });
  }, []);

  const setProxyUrl = useCallback((url) => {
    setState((prev) => {
      const cfg = loadConfig();
      cfg.proxyUrl = url || null;
      saveConfig(cfg);
      return { ...prev, proxyUrl: url || null };
    });
  }, []);

  // --- Freemium gate ---

  const checkFreemium = useCallback(() => {
    const freemium = loadFreemium();
    if (freemium.used >= FREEMIUM_LIMIT) {
      return false;
    }
    return true;
  }, []);

  const incrementFreemium = useCallback(() => {
    const freemium = loadFreemium();
    freemium.used += 1;
    saveFreemium(freemium);
    setState((prev) => ({ ...prev, freemiumUsed: freemium.used }));
  }, []);

  // --- ask (non-streaming) ---

  const ask = useCallback(
    async (prompt, systemPrompt, options) => {
      const opts = options || {};
      const retries = opts.retries !== undefined ? opts.retries : 2;
      const provider = CLOUD_PROVIDERS[state.providerId];
      const apiKey = state.keys[state.providerId];

      if (!apiKey) {
        if (!checkFreemium()) {
          const err = 'Tageslimit erreicht (' + FREEMIUM_LIMIT + ' Anfragen). Bitte hinterlege einen API-Schluessel.';
          setState((prev) => ({ ...prev, error: err }));
          throw new Error(err);
        }
        incrementFreemium();
      }

      if (!apiKey && !state.proxyUrl) {
        const err = 'Kein API-Schluessel fuer ' + provider.name + ' hinterlegt und kein Proxy konfiguriert.';
        setState((prev) => ({ ...prev, error: err }));
        throw new Error(err);
      }

      setState((prev) => ({ ...prev, isLoading: true, error: null }));

      const url = buildUrl(provider, state.proxyUrl);
      const headers = buildHeaders(provider, apiKey);
      const body = buildBody(provider, state.model, prompt, systemPrompt, opts.history, false);

      let lastError = null;
      for (let attempt = 0; attempt <= retries; attempt++) {
        try {
          const res = await fetch(url, {
            method: 'POST',
            headers: headers,
            body: JSON.stringify(body),
          });

          if (!res.ok) {
            const errorBody = await res.text().catch(() => '');
            const msg =
              'API-Fehler ' +
              res.status +
              ' (' +
              provider.name +
              '): ' +
              (errorBody.slice(0, 200) || res.statusText);
            throw new Error(msg);
          }

          const data = await res.json();
          const text = parseResponse(provider, data);
          setState((prev) => ({ ...prev, isLoading: false, error: null }));
          return text;
        } catch (err) {
          lastError = err;
          if (attempt < retries) {
            await new Promise((r) => setTimeout(r, 1000 * (attempt + 1)));
          }
        }
      }

      const errMsg = lastError
        ? lastError.message
        : 'Unbekannter Fehler bei der Anfrage an ' + provider.name;
      setState((prev) => ({ ...prev, isLoading: false, error: errMsg }));
      throw lastError || new Error(errMsg);
    },
    [state.providerId, state.model, state.keys, state.proxyUrl, checkFreemium, incrementFreemium]
  );

  // --- askStream (SSE streaming) ---

  const askStream = useCallback(
    async (prompt, systemPrompt, history, onChunk) => {
      const provider = CLOUD_PROVIDERS[state.providerId];
      const apiKey = state.keys[state.providerId];

      if (!apiKey) {
        if (!checkFreemium()) {
          const err = 'Tageslimit erreicht (' + FREEMIUM_LIMIT + ' Anfragen). Bitte hinterlege einen API-Schluessel.';
          setState((prev) => ({ ...prev, error: err }));
          throw new Error(err);
        }
        incrementFreemium();
      }

      if (!apiKey && !state.proxyUrl) {
        const err = 'Kein API-Schluessel fuer ' + provider.name + ' hinterlegt und kein Proxy konfiguriert.';
        setState((prev) => ({ ...prev, error: err }));
        throw new Error(err);
      }

      setState((prev) => ({ ...prev, isLoading: true, error: null }));

      const url = buildUrl(provider, state.proxyUrl);
      const headers = buildHeaders(provider, apiKey);
      const body = buildBody(provider, state.model, prompt, systemPrompt, history, true);

      const controller = new AbortController();
      abortRef.current = controller;

      try {
        const res = await fetch(url, {
          method: 'POST',
          headers: headers,
          body: JSON.stringify(body),
          signal: controller.signal,
        });

        if (!res.ok) {
          const errorBody = await res.text().catch(() => '');
          const msg =
            'Stream-Fehler ' +
            res.status +
            ' (' +
            provider.name +
            '): ' +
            (errorBody.slice(0, 200) || res.statusText);
          throw new Error(msg);
        }

        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';
        let fullText = '';

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() || '';

          for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed || trimmed === 'event: message_start' || trimmed === 'event: message_stop') continue;
            if (trimmed.startsWith('event:')) continue;
            if (trimmed === 'data: [DONE]') continue;

            if (trimmed.startsWith('data: ')) {
              const jsonStr = trimmed.slice(6);
              try {
                const parsed = JSON.parse(jsonStr);
                const chunk = parseSSEChunk(provider, parsed);
                if (chunk) {
                  fullText += chunk;
                  if (onChunk) onChunk(chunk, fullText);
                }
              } catch {
                // Unvollstaendiges JSON-Fragment, wird ignoriert
              }
            }
          }
        }

        setState((prev) => ({ ...prev, isLoading: false, error: null }));
        abortRef.current = null;
        return fullText;
      } catch (err) {
        abortRef.current = null;
        if (err.name === 'AbortError') {
          setState((prev) => ({ ...prev, isLoading: false, error: null }));
          return '';
        }
        const errMsg = err.message || 'Stream-Fehler bei ' + provider.name;
        setState((prev) => ({ ...prev, isLoading: false, error: errMsg }));
        throw err;
      }
    },
    [state.providerId, state.model, state.keys, state.proxyUrl, checkFreemium, incrementFreemium]
  );

  // --- abortStream ---

  const abortStream = useCallback(() => {
    if (abortRef.current) {
      abortRef.current.abort();
      abortRef.current = null;
      setState((prev) => ({ ...prev, isLoading: false }));
    }
  }, []);

  // --- detectModels ---

  const detectModels = useCallback(async () => {
    const provider = CLOUD_PROVIDERS[state.providerId];
    if (!provider.modelsPath) {
      return provider.models;
    }

    const apiKey = state.keys[state.providerId];
    if (!apiKey) {
      throw new Error('Kein API-Schluessel fuer ' + provider.name + ' hinterlegt. Modell-Erkennung nicht moeglich.');
    }

    const base = state.proxyUrl || provider.baseUrl;
    const url = base + provider.modelsPath;
    const headers = buildHeaders(provider, apiKey);
    delete headers['Content-Type'];

    try {
      const res = await fetch(url, { method: 'GET', headers: headers });
      if (!res.ok) {
        throw new Error('Modell-Abfrage fehlgeschlagen: ' + res.status);
      }
      const data = await res.json();
      const list = data.data || data.models || [];
      return list.map((m) => ({
        id: m.id,
        name: m.id,
        pricing: '',
      }));
    } catch (err) {
      throw new Error('Modell-Erkennung fehlgeschlagen: ' + (err.message || 'Unbekannter Fehler'));
    }
  }, [state.providerId, state.keys, state.proxyUrl]);

  // --- cloudModels (flat list for current provider) ---

  const cloudModels = currentProvider.models;

  // --- Sync freemium on mount ---

  useEffect(() => {
    const f = loadFreemium();
    setState((prev) => {
      if (prev.freemiumUsed !== f.used) {
        return { ...prev, freemiumUsed: f.used };
      }
      return prev;
    });
  }, []);

  // --- Return ---

  return {
    provider: currentProvider,
    model: state.model,
    apiKey: maskKey(currentApiKey),
    isConnected: isConnected,
    isLoading: state.isLoading,
    error: state.error,
    freemiumUsed: state.freemiumUsed,
    freemiumLimit: FREEMIUM_LIMIT,
    ask: ask,
    askStream: askStream,
    abortStream: abortStream,
    setProvider: setProvider,
    setModel: setModel,
    setApiKey: setApiKey,
    removeApiKey: removeApiKey,
    getApiKey: getApiKey,
    getMaskedKey: getMaskedKey,
    detectModels: detectModels,
    setProxyUrl: setProxyUrl,
    providers: CLOUD_PROVIDERS,
    cloudModels: cloudModels,
  };
}
