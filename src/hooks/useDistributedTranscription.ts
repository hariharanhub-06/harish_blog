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
        if (!isActive || typeof window === 'undefined') return;

        // Check browser support
        const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
        if (!SpeechRecognition) return;

        let recognition: any;
        try {
            recognition = new SpeechRecognition();
        } catch (e) {
            console.error("Speech Recognition initialization failed:", e);
            return;
        }

        recognition.continuous = true;
        recognition.interimResults = false; // independent transcription needs complete sentences usually
        recognition.lang = 'en-US';

        recognition.onstart = () => {
            setIsListening(true);
            isRunningRef.current = true;
        };

        recognition.onend = () => {
            setIsListening(false);
            // Auto-restart with delay to prevent browser notification spam
            if (isRunningRef.current && isActive) {
                setTimeout(() => {
                    if (isRunningRef.current && isActive) {
                        try {
                            recognition.start();
                        } catch (e) {
                            // Ignore restart errors
                        }
                    }
                }, 1000);
            }
        };

        recognition.onresult = async (event: any) => {
            const result = event.results[event.resultIndex];
            if (result.isFinal) {
                const transcript = result[0].transcript.trim();
                if (transcript) {
                    // Send to server
                    try {
                        await fetch(`/api/sessions/${sessionId}/minutes`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                content: transcript,
                                type: 'transcript',
                                speakerName: userName
                            })
                        });
                    } catch (e) {
                        console.error("Failed to send transcript", e);
                    }
                }
            }
        };

        recognitionRef.current = recognition;

        try {
            recognition.start();
        } catch (e) {
            console.error("Error starting recognition", e);
        }

        return () => {
            isRunningRef.current = false;
            if (recognitionRef.current) {
                recognitionRef.current.stop();
            }
        };
    }, [sessionId, userName, isActive]);

    return { isListening };
}
