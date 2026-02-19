import { useEffect, useRef, useCallback } from 'react';
import { useProjectDispatch } from '../store/context';
import type { ComponentDefinition } from '@claudiv/core';

interface WsMessage {
  type: string;
  file?: string;
  component?: ComponentDefinition;
  fqn?: string;
  [key: string]: any;
}

export function useWebSocket() {
  const dispatch = useProjectDispatch();
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimer = useRef<ReturnType<typeof setTimeout>>();

  const connect = useCallback(() => {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const ws = new WebSocket(`${protocol}//${window.location.host}/ws`);

    ws.onopen = () => {
      dispatch({ type: 'SET_CONNECTED', connected: true });
      ws.send(JSON.stringify({ type: 'subscribe', projectRoot: '.' }));
    };

    ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data) as WsMessage;

        switch (msg.type) {
          case 'file-changed':
            if (msg.component) {
              dispatch({ type: 'UPDATE_COMPONENT', component: msg.component });
            }
            break;
          case 'file-created':
            if (msg.component) {
              dispatch({ type: 'ADD_COMPONENT', component: msg.component });
            }
            break;
          case 'file-deleted':
            if (msg.fqn) {
              dispatch({ type: 'REMOVE_COMPONENT', fqn: msg.fqn });
            }
            break;
        }
      } catch {
        // ignore malformed messages
      }
    };

    ws.onclose = () => {
      dispatch({ type: 'SET_CONNECTED', connected: false });
      reconnectTimer.current = setTimeout(connect, 3000);
    };

    ws.onerror = () => {
      ws.close();
    };

    wsRef.current = ws;
  }, [dispatch]);

  useEffect(() => {
    connect();
    return () => {
      clearTimeout(reconnectTimer.current);
      wsRef.current?.close();
    };
  }, [connect]);

  return wsRef;
}
