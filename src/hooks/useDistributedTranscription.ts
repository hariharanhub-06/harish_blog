import { useEffect, useRef, useState } from 'react';

interface Props {
    sessionId: string;
    userName: string;
    isActive: boolean; // Only listen if session is active/user is ready
    lang?: string;     // Transcription language (e.g., 'en-IN', 'ta-IN')
}

// Detect browser type
function getBrowserInfo() {
    const ua = navigator.userAgent;
    const isBrave = (navigator as any).brave !== undefined;
    const isChrome = /Chrome/.test(ua) && !isBrave;
    const isEdge = /Edg/.test(ua);
    const isSafari = /Safari/.test(ua) && !/Chrome/.test(ua);
    const isFirefox = /Firefox/.test(ua);

    return { isBrave, isChrome, isEdge, isSafari, isFirefox };
}

export function useDistributedTranscription({ sessionId, userName, isActive, lang = 'en-IN' }: Props) {
    const [isListening, setIsListening] = useState(false);
    const [interimTranscript, setInterimTranscript] = useState('');
    const [error, setError] = useState<string | null>(null);
    const recognitionRef = useRef<any>(null);
    const isRunningRef = useRef(false);
    const errorCountRef = useRef(0);
    const hasShownBrowserWarning = useRef(false);

    const instanceIdRef = useRef(0);

    useEffect(() => {
        const currentInstanceId = ++instanceIdRef.current;
        console.log(`🎙️ [Distributed Transcription] Hook called for ${userName}, isActive: ${isActive}, instance: ${currentInstanceId}`);

        if (!isActive || typeof window === 'undefined') {
            console.log(`⏸️ [Distributed Transcription] Not starting (isActive: ${isActive})`);
            return;
        }

        // Check browser support
        const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
        if (!SpeechRecognition) {
            // ... (keep support check logic same)
            const browserInfo = getBrowserInfo();
            console.error('❌ [Distributed Transcription] Speech Recognition API not supported');
            return;
        }

        let recognition: any;
        try {
            recognition = new SpeechRecognition();
        } catch (e) {
            console.error("❌ [Distributed Transcription] Speech Recognition initialization failed:", e);
            return;
        }

        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = lang;

        recognition.onstart = () => {
            if (currentInstanceId !== instanceIdRef.current) return;
            console.log(`🎤 [Distributed Transcription] Started listening for ${userName} (inst: ${currentInstanceId})`);
            setIsListening(true);
            setError(null);
            isRunningRef.current = true;
        };

        recognition.onend = () => {
            if (currentInstanceId !== instanceIdRef.current) {
                console.log(`⏹️ [Distributed Transcription] Instance ${currentInstanceId} ended (superseded)`);
                return;
            }

            console.log(`⏹️ [Distributed Transcription] Stopped listening for ${userName} (inst: ${currentInstanceId})`);
            setIsListening(false);

            // Auto-restart with delay to prevent browser notification spam
            if (isRunningRef.current && isActive) {
                console.log(`🔄 [Distributed Transcription] Auto-restarting in 1 second...`);
                setTimeout(() => {
                    if (isRunningRef.current && isActive && currentInstanceId === instanceIdRef.current) {
                        try {
                            recognition.start();
                        } catch (e) {
                            console.warn('⚠️ [Distributed Transcription] Restart failed');
                        }
                    }
                }, 1000);
            }
        };

        recognition.onresult = async (event: any) => {
            if (currentInstanceId !== instanceIdRef.current) return;
            // ... (keep result logic same)
            const result = event.results[event.resultIndex];
            const transcript = result[0].transcript.trim();

            if (!result.isFinal) {
                setInterimTranscript(transcript);
            }

            if (result.isFinal) {
                setInterimTranscript('');
                if (transcript && transcript.length > 1) {
                    try {
                        const response = await fetch(`/api/sessions/${sessionId}/minutes`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                content: transcript,
                                type: 'transcript',
                                speakerName: userName
                            })
                        });
                        if (!response.ok) console.error(`❌ [Distributed Transcription] Server error: ${response.status}`);
                    } catch (e) {
                        console.error("❌ [Distributed Transcription] Failed to send transcript", e);
                    }
                }
            }
        };

        recognition.onerror = (event: any) => {
            if (currentInstanceId !== instanceIdRef.current) return;

            errorCountRef.current++;
            const browserInfo = getBrowserInfo();

            // Soften 'aborted' logging as it's often a normal part of lifecycle or focus change
            if (event.error === 'aborted') {
                console.log(`ℹ️ [Distributed Transcription] Recognition aborted (inst: ${currentInstanceId})`);
                return;
            }

            console.error(`❌ [Distributed Transcription] Error for ${userName}:`, event.error);
            setError(event.error);

            if (event.error === 'not-allowed') {
                alert(`🎙️ Microphone Access Denied!`);
            } else if (event.error === 'network') {
                if (browserInfo.isBrave && errorCountRef.current >= 3 && !hasShownBrowserWarning.current) {
                    hasShownBrowserWarning.current = true;
                    alert(`⚠️ Brave privacy settings might be blocking transcription.`);
                }
            }
        };

        recognitionRef.current = recognition;

        try {
            console.log(`▶️ [Distributed Transcription] Attempting to start (inst: ${currentInstanceId})...`);
            recognition.start();
        } catch (e) {
            console.error("❌ [Distributed Transcription] Error starting", e);
        }

        return () => {
            console.log(`🛑 [Distributed Transcription] Cleanup for inst: ${currentInstanceId}`);
            isRunningRef.current = false;
            // Immediate stop to release the mic
            try {
                recognition.onend = null; // Prevent the local restart loop
                recognition.stop();
            } catch (e) { }
        };
    }, [sessionId, userName, isActive, lang]);

    return { isListening, interimTranscript, error };
}
