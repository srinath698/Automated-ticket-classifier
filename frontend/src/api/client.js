const API_BASE = '/api';

async function request(path, options, fallbackMessage) {
  const res = await fetch(`${API_BASE}${path}`, options);
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(formatError(body.detail, fallbackMessage, res.status));
  return body;
}

function formatError(detail, fallbackMessage, status) {
  if (typeof detail === 'string' && detail) return detail;
  if (Array.isArray(detail)) {
    return detail.map((item) => item?.msg || 'Invalid request').join(' ');
  }
  return `${fallbackMessage} (${status})`;
}

export async function checkHealth() {
  return request('/health', undefined, 'Health check failed');
}

export async function predictTicket(text) {
  return request('/predict', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text }),
  }, 'Classification failed');
}

export async function explainTicket(text) {
  return request('/explain', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text }),
  }, 'Explanation failed');
}

export async function sendChatMessage({
  ticket_text,
  predicted_category,
  recommended_department,
  confidence_percentage,
  conversation_history,
  message,
}) {
  return request('/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      ticket_text,
      predicted_category,
      recommended_department,
      confidence_percentage,
      conversation_history,
      message,
    }),
  }, 'Chat request failed');
}

export async function getMetrics() {
  return request('/metrics', undefined, 'Failed to fetch model metrics');
}
