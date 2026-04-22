import { io } from 'socket.io-client';

let socket = null;
let lastAuth = null;
const subscribers = new Set();

function notifySubscribers() {
  subscribers.forEach((listener) => listener(socket));
}

export function connectSocket({ userId, role }) {
  const url = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5001';
  lastAuth = { userId, role };

  if (!socket) {
    socket = io(url, {
      transports: ['websocket', 'polling'],
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 500,
      timeout: 10000
    });

    const join = () => {
      if (lastAuth?.userId && lastAuth?.role) {
        socket.emit('auth:join', lastAuth);
      }
    };

    socket.on('connect', join);
    socket.on('reconnect', join);

    socket.on('connect_error', (err) => {
      console.warn('[socket] connect_error', err?.message || err);
    });

    socket.on('error', (err) => {
      console.warn('[socket] error', err);
    });
  } else {
    socket.emit('auth:join', lastAuth);
  }

  notifySubscribers();
  return socket;
}

export function getSocket() {
  return socket;
}

export function subscribeToSocket(listener) {
  subscribers.add(listener);
  listener(socket);

  return () => {
    subscribers.delete(listener);
  };
}

export function disconnectSocket() {
  if (socket) socket.disconnect();
  socket = null;
  lastAuth = null;
  notifySubscribers();
}
