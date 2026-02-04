import { useEffect, useRef, useState } from 'react';

interface Props {
    sessionId: string;
    userName: string;
    isActive: boolean; // Only listen if session is active/user is ready
}

export function useDistributedTranscription({ sessionId, userName, isActive }: Props) {
    const [isListening, setIsListening] = useState(false);
    const recognitionRef = useRef<any>(null);
    const isRunningRef = useRef(false);

    useEffect(() => {
        console.log(`🎙️ [Distributed Transcription] Hook called for ${userName}, isActive: ${isActive}`);

        if (!isActive || typeof window === 'undefined') {
            console.log(`⏸️ [Distributed Transcription] Not starting (isActive: ${isActive})`);
            return;
        }

        // Check browser support
        const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
        if (!SpeechRecognition) {
            console.error('❌ [Distributed Transcription] Speech Recognition API not supported in this browser');
            alert('Speech Recognition not supported in your browser. Please use Chrome, Edge, or Safari.');
            return;
        }

        console.log('✅ [Distributed Transcription] Speech Recognition API is supported');

        let recognition: any;
        try {
            recognition = new SpeechRecognition();
            console.log('✅ [Distributed Transcription] Speech Recognition instance created');
        } catch (e) {
            console.error("❌ [Distributed Transcription] Speech Recognition initialization failed:", e);
            return;
        }

        recognition.continuous = true;
        recognition.interimResults = false; // independent transcription needs complete sentences usually
        recognition.lang = 'en-US';

        recognition.onstart = () => {
            console.log(`🎤 [Distributed Transcription] Started listening for ${userName}`);
            setIsListening(true);
            isRunningRef.current = true;
        };

        recognition.onend = () => {
            console.log(`⏹️ [Distributed Transcription] Stopped listening for ${userName}`);
            setIsListening(false);
            // Auto-restart with delay to prevent browser notification spam
            if (isRunningRef.current && isActive) {
                console.log(`🔄 [Distributed Transcription] Auto-restarting in 1 second...`);
                setTimeout(() => {
                    if (isRunningRef.current && isActive) {
                        try {
                            recognition.start();
                        } catch (e) {
                            console.warn('⚠️ [Distributed Transcription] Restart failed (might already be running)');
                        }
                    }
                }, 1000);
            }
        };

        recognition.onresult = async (event: any) => {
            const result = event.results[event.resultIndex];
            if (result.isFinal) {
                const transcript = result[0].transcript.trim();
                console.log(`📝 [Distributed Transcription] Captured from ${userName}: "${transcript}"`);

                // Filter out short noise (less than 2 chars)
                if (transcript && transcript.length > 1) {
                    // Send to server
                    try {
                        console.log(`📤 [Distributed Transcription] Sending to server...`);
                        const response = await fetch(`/api/sessions/${sessionId}/minutes`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                content: transcript,
                                type: 'transcript',
                                speakerName: userName
                            })
                        });

                        if (response.ok) {
                            console.log(`✅ [Distributed Transcription] Sent successfully`);
                        } else {
                            console.error(`❌ [Distributed Transcription] Server error: ${response.status}`);
                        }
                    } catch (e) {
                        console.error("❌ [Distributed Transcription] Failed to send transcript", e);
                    }
                } else {
                    console.log(`⏭️ [Distributed Transcription] Skipping short/empty transcript`);
                }
            }
        };

        recognition.onerror = (event: any) => {
            console.error(`❌ [Distributed Transcription] Error for ${userName}:`, event.error, event);
            if (event.error === 'not-allowed') {
                alert(`Microphone permission denied! Please allow microphone access to enable transcription.`);
            }
        };

        recognitionRef.current = recognition;

        try {
            console.log(`▶️ [Distributed Transcription] Attempting to start recognition...`);
            recognition.start();
        } catch (e) {
            console.error("❌ [Distributed Transcription] Error starting recognition", e);
        }

        return () => {
            console.log(`🛑 [Distributed Transcription] Cleanup for ${userName}`);
            isRunningRef.current = false;
            if (recognitionRef.current) {
                recognitionRef.current.stop();
            }
        };
    }, [sessionId, userName, isActive]);

    return { isListening };
}
