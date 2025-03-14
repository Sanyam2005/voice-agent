// frontend/src/components/FixedVoiceAssistant.js
import React, { useState, useRef, useEffect } from 'react';
import { FaMicrophone, FaMicrophoneSlash, FaVolumeMute, FaVolumeUp, FaPlay } from 'react-icons/fa';
import { BsMoonFill, BsSunFill } from 'react-icons/bs';

import './VoiceAgent.css';

const VoiceAgent = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [conversation, setConversation] = useState([]);
  const [darkMode, setDarkMode] = useState(false);
  const [volume, setVolume] = useState(0);
  const [muted, setMuted] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(true);
  const [hasSpeechBeenInitialized, setHasSpeechBeenInitialized] = useState(false);

  const canvasRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioStreamRef = useRef(null);
  const conversationEndRef = useRef(null);
  
  // Mock responses for the assistant
  const mockResponses = [
    "I understand you're asking about that. Let me think about it for a moment.",
    "That's an interesting question! Based on what I know, I'd say it depends on several factors.",
    "I'd be happy to help with that. Here's what I think might work in this situation.",
    "Thanks for asking. From my perspective, the best approach would be to consider all options.",
    "I've thought about this, and I believe there are multiple ways to address this question.",
    "Great question! The answer isn't straightforward, but I'll try to explain it clearly.",
    "I appreciate you bringing this up. It's something many people wonder about.",
    "Let me share some thoughts on that. First, it's important to consider the context.",
    "I've analyzed this question, and here's what I think would be most helpful for you.",
    "Based on the information available, I'd recommend focusing on a few key points."
  ];

  // Initialize audio context and analyser
  useEffect(() => {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    audioContextRef.current = new AudioContext();
    analyserRef.current = audioContextRef.current.createAnalyser();
    analyserRef.current.fftSize = 256;

    // Check for saved dark mode preference
    const savedDarkMode = localStorage.getItem('voiceAssistantDarkMode') === 'true';
    setDarkMode(savedDarkMode);

    // Check if speech synthesis is supported
    if (typeof window.speechSynthesis === 'undefined') {
      console.warn('Speech synthesis not supported in this browser');
      setSpeechSupported(false);
    } else {
      // Load voices
      const loadVoices = () => {
        window.speechSynthesis.getVoices();
      };
      
      loadVoices();
      
      // Some browsers need this event to load voices
      if (window.speechSynthesis.onvoiceschanged !== undefined) {
        window.speechSynthesis.onvoiceschanged = loadVoices;
      }
    }

    // Add welcome message
    const welcomeMessage = "Hello! I'm your voice assistant. What can I help you with today?";
    setConversation([
      {
        id: 'welcome',
        sender: 'assistant',
        content: welcomeMessage,
        timestamp: new Date().toISOString()
      }
    ]);

    return () => {
      // Clean up
      if (audioStreamRef.current) {
        audioStreamRef.current.getTracks().forEach(track => track.stop());
      }
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close();
      }
      // Stop any ongoing speech
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  // Apply dark mode class to body
  useEffect(() => {
    if (darkMode) {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
    
    // Save preference
    localStorage.setItem('voiceAssistantDarkMode', darkMode.toString());
  }, [darkMode]);

  // Auto-scroll to bottom of conversation
  useEffect(() => {
    if (conversationEndRef.current) {
      conversationEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [conversation]);

  // Audio visualizer
  useEffect(() => {
    if (!analyserRef.current || !canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const canvasCtx = canvas.getContext('2d');
    const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
    
    const draw = () => {
      requestAnimationFrame(draw);
      
      if (analyserRef.current) {
        analyserRef.current.getByteFrequencyData(dataArray);
        
        // Calculate average volume
        const average = dataArray.reduce((a, b) => a + b, 0) / dataArray.length;
        setVolume(isRecording ? average : average * 0.3);
        
        // Clear canvas
        canvasCtx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Draw visualization
        const barWidth = (canvas.width / dataArray.length) * 2.5;
        let barHeight;
        let x = 0;
        
        canvasCtx.fillStyle = isRecording ? '#4f46e5' : (isSpeaking ? '#10b981' : '#94a3b8');
        
        for (let i = 0; i < dataArray.length; i++) {
          barHeight = (dataArray[i] / 2) * (isRecording || isSpeaking ? 1 : 0.3);
          
          canvasCtx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);
          x += barWidth + 1;
        }
      }
    };
    
    draw();
  }, [isRecording, isSpeaking]);

  // Text-to-speech function
  const speakText = (text) => {
    if (muted || !speechSupported) return;
    
    try {
      // First, make sure speech synthesis is initialized
      if (!hasSpeechBeenInitialized) {
        // Many browsers require user interaction before speech works
        // This empty utterance helps initialize the system
        const initUtterance = new SpeechSynthesisUtterance('');
        window.speechSynthesis.speak(initUtterance);
        setHasSpeechBeenInitialized(true);
      }
      
      // Cancel any ongoing speech
      window.speechSynthesis.cancel();
      
      // Create speech utterance
      const utterance = new SpeechSynthesisUtterance(text);
      
      // Set voice (optional)
      const voices = window.speechSynthesis.getVoices();
      console.log("Available voices:", voices.length);
      
      // Try to find a good voice - preferring female English voices
      let chosenVoice = voices.find(voice => 
        voice.lang.includes('en') && voice.name.includes('Female')
      );
      
      // If no preferred voice, try any English voice
      if (!chosenVoice) {
        chosenVoice = voices.find(voice => voice.lang.includes('en'));
      }
      
      // If still no voice, use the first available
      if (!chosenVoice && voices.length > 0) {
        chosenVoice = voices[0];
      }
      
      if (chosenVoice) {
        console.log("Using voice:", chosenVoice.name);
        utterance.voice = chosenVoice;
      }
      
      // Set properties
      utterance.rate = 1.0; // Speed
      utterance.pitch = 1.0; // Pitch
      utterance.volume = 1.0; // Volume
      
      // Set event handlers
      utterance.onstart = () => {
        console.log("Speech started");
        setIsSpeaking(true);
      };
      
      utterance.onend = () => {
        console.log("Speech ended");
        setIsSpeaking(false);
      };
      
      utterance.onerror = (event) => {
        console.error('Speech synthesis error:', event);
        setIsSpeaking(false);
      };
      
      // Speak the text
      window.speechSynthesis.speak(utterance);
      
      console.log("Speech synthesis request sent");
      
    } catch (error) {
      console.error("Speech synthesis error:", error);
      setSpeechSupported(false);
    }
  };

  // Play welcome message after user interaction
  const playWelcomeMessage = () => {
    speakText("Hello! I'm your voice assistant. What can I help you with today?");
  };

  // Start recording
  const startRecording = async () => {
    try {
      // Stop any ongoing speech
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
        setIsSpeaking(false);
      }
      
      // Get microphone access
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioStreamRef.current = stream;
      
      // Connect microphone to analyser
      const source = audioContextRef.current.createMediaStreamSource(stream);
      source.connect(analyserRef.current);
      
      // Set up media recorder
      const options = { mimeType: 'audio/webm' };
      mediaRecorderRef.current = new MediaRecorder(stream, options);
      
      // Set up data handling
      mediaRecorderRef.current.ondataavailable = () => {
        // We're not actually saving the audio data since this is a mock implementation
      };
      
      // Handle recording stop
      mediaRecorderRef.current.onstop = () => {
        handleRecordingComplete();
      };
      
      // Start recording
      mediaRecorderRef.current.start();
      setIsRecording(true);
      
      // If this is the first interaction, initialize speech
      if (!hasSpeechBeenInitialized && speechSupported) {
        setHasSpeechBeenInitialized(true);
        // Some browsers need user interaction before speech works
        window.speechSynthesis.speak(new SpeechSynthesisUtterance(''));
      }
      
    } catch (err) {
      console.error('Error accessing microphone:', err);
      alert('Failed to access microphone. Please ensure you have a microphone connected and you have granted permission to use it.');
    }
  };

  // Stop recording
  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    
    if (audioStreamRef.current) {
      audioStreamRef.current.getTracks().forEach(track => track.stop());
    }
    
    setIsRecording(false);
  };

  // Handle recording complete
  const handleRecordingComplete = () => {
    // Add user message to conversation
    const userMessageId = `user-${Date.now()}`;
    setConversation(prev => [...prev, {
      id: userMessageId,
      sender: 'user',
      content: 'User audio message',
      timestamp: new Date().toISOString()
    }]);
    
    // Simulate processing
    setIsProcessing(true);
    
    // Generate mock response after a delay
    setTimeout(() => {
      // Get random response
      const responseIndex = Math.floor(Math.random() * mockResponses.length);
      const responseContent = mockResponses[responseIndex];
      
      // Add assistant message to conversation
      const assistantMessageId = `assistant-${Date.now()}`;
      setConversation(prev => [...prev, {
        id: assistantMessageId,
        sender: 'assistant',
        content: responseContent,
        timestamp: new Date().toISOString()
      }]);
      
      // Speak the response
      speakText(responseContent);
      
      setIsProcessing(false);
    }, 1500); // 1.5 second delay to simulate processing
  };

  // Toggle dark mode
  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };
  
  // Toggle mute
  const toggleMute = () => {
    setMuted(!muted);
    
    if (!muted) {
      // Muting - stop any ongoing speech
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
        setIsSpeaking(false);
      }
    }
  };
  
  // Format timestamp to readable time
  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Get animation style based on volume
  const getRecordingAnimationStyle = () => {
    const scale = 1 + (volume / 255) * 0.5;
    return {
      transform: `scale(${scale})`
    };
  };

  return (
    <div className={`voice-assistant ${darkMode ? 'dark' : 'light'}`}>
      <div className="assistant-container">
        <header className="assistant-header">
          <h2 className="assistant-title">Voice Assistant</h2>
          <div className="header-controls">
            <button 
              className="control-button"
              onClick={toggleMute}
              aria-label={muted ? "Unmute" : "Mute"}
            >
              {muted ? <FaVolumeMute /> : <FaVolumeUp />}
            </button>
            <button 
              className="control-button"
              onClick={toggleDarkMode}
              aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
            >
              {darkMode ? <BsSunFill /> : <BsMoonFill />}
            </button>
          </div>
        </header>
        
        <div className="messages-area">
          <div className="messages-container">
            {conversation.map((message) => (
              <div 
                key={message.id} 
                className={`message ${message.sender === 'user' ? 'user-message' : 'assistant-message'}`}
              >
                <div className="message-bubble">
                  <div className="message-content">{message.content}</div>
                </div>
                <div className="message-meta">
                  <span className="message-sender">{message.sender === 'user' ? 'You' : 'Assistant'}</span>
                  <span className="message-time">{formatTime(message.timestamp)}</span>
                  {message.sender === 'assistant' && speechSupported && (
                    <button 
                      className="play-button"
                      onClick={() => speakText(message.content)}
                      aria-label="Play message"
                    >
                      <FaPlay />
                    </button>
                  )}
                </div>
              </div>
            ))}
            <div ref={conversationEndRef} />
          </div>
        </div>
        
        {!hasSpeechBeenInitialized && speechSupported && (
          <div className="welcome-button-container">
            <button className="welcome-button" onClick={playWelcomeMessage}>
              Click to hear welcome message
            </button>
            <p className="info-text">Your browser requires interaction before audio can play</p>
          </div>
        )}
        
        <div className="controls-area">
          <canvas ref={canvasRef} className="audio-visualizer" height="60" />
          
          <div className="main-controls">
            <button 
              className={`record-button ${isRecording ? 'recording' : ''}`}
              onClick={isRecording ? stopRecording : startRecording}
              disabled={isProcessing || isSpeaking}
              style={isRecording ? getRecordingAnimationStyle() : {}}
              aria-label={isRecording ? "Stop recording" : "Start recording"}
            >
              {isRecording ? <FaMicrophoneSlash /> : <FaMicrophone />}
              <span className="button-ring"></span>
            </button>
            
            {isRecording && (
              <div className="status-indicator recording">
                <span className="status-dot"></span>
                Recording...
              </div>
            )}
            
            {isProcessing && (
              <div className="status-indicator processing">
                <div className="loading-spinner"></div>
                Processing...
              </div>
            )}
            
            {isSpeaking && (
              <div className="status-indicator speaking">
                <div className="sound-wave">
                  <span></span><span></span><span></span><span></span><span></span>
                </div>
                Speaking...
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VoiceAgent;