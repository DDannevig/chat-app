const listeners = {
  open: new Set(),
  close: new Set(),
  message: new Set(),
  error: new Set(),
};

let ws = null;
let url = null;

function _forward(eventName, ev) {
  const set = listeners[eventName];
  if (!set) return;
  set.forEach((fn) => {
    try { fn(ev); } catch (e) { console.error('wsClient listener error', e); }
  });
}

function _attach() {
  if (!ws) return;
  ws.addEventListener('open', (e) => _forward('open', e));
  ws.addEventListener('close', (e) => _forward('close', e));
  ws.addEventListener('error', (e) => _forward('error', e));
  ws.addEventListener('message', (e) => _forward('message', e));
}

export function init(connectUrl) {
  url = connectUrl;
  if (ws && ws.readyState !== WebSocket.CLOSED) return ws;
  ws = new WebSocket(connectUrl);
  _attach();
  return ws;
}

export function addListener(eventName, fn) {
  if (!listeners[eventName]) listeners[eventName] = new Set();
  listeners[eventName].add(fn);
}

export function removeListener(eventName, fn) {
  if (!listeners[eventName]) return;
  listeners[eventName].delete(fn);
}

export function send(data) {
  if (!ws || ws.readyState !== WebSocket.OPEN) throw new Error('WebSocket not open');
  ws.send(data);
}

export function close() {
  if (!ws) return;
  try { ws.close(); } catch (e) {}
  ws = null;
}

export function readyState() {
  return ws ? ws.readyState : WebSocket.CLOSED;
}

const wsClient = { init, addListener, removeListener, send, close, readyState };
export default wsClient;
