import { useState, useRef } from 'react';
import { useConversation } from '@elevenlabs/react';

export const useElevenLabsConversation = () => {
  const [transcripts, setTranscripts] = useState([]);
  const transcriptsRef = useRef([]);
  const startTimeRef = useRef(null);

  const addTranscript = (role, text) => {
    const newTranscripts = [...transcriptsRef.current, { role, text }];
    transcriptsRef.current = newTranscripts;
    setTranscripts(newTranscripts);
  };

  const conversation = useConversation({
    onConnect: () => {},
    onDisconnect: () => {},
    onMessage: (message) => {
      if (message.source === 'user') addTranscript('user', message.message);
      if (message.source === 'ai') addTranscript('AI', message.message);
    },
    onError: () => {},
    onAudio: () => {},
  });

  const startConversation = async (agentId) => {
    transcriptsRef.current = [];
    setTranscripts([]);
    startTimeRef.current = Date.now();
    await navigator.mediaDevices.getUserMedia({ audio: true });
    const devices = await navigator.mediaDevices.enumerateDevices();
    const audioInputs = devices.filter(d => d.kind === 'audioinput');
    const tozoMic = audioInputs.find(d => d.label.startsWith('Headset (TOZO'));
    const deviceId = tozoMic ? tozoMic.deviceId : undefined;
    await conversation.startSession({
      agentId,
      connectionType: 'websocket',
      inputDeviceId: deviceId,
    });
  };

  const endConversation = async () => {
    await conversation.endSession();
  };

  const getSessionStats = () => {
    const durationSeconds = startTimeRef.current 
      ? Math.floor((Date.now() - startTimeRef.current) / 1000) 
      : 0;
    const wordsSpoken = transcriptsRef.current
      .filter(t => t.role === 'user')
      .reduce((sum, t) => sum + t.text.split(/\s+/).filter(w => w).length, 0);
    return { durationSeconds, wordsSpoken };
  };

  const clearTranscripts = () => {
    transcriptsRef.current = [];
    setTranscripts([]);
  };

  return {
    startConversation,
    endConversation,
    getSessionStats,
    clearTranscripts,
    status: conversation.status,
    isSpeaking: conversation.isSpeaking,
    transcripts,
  };
};
