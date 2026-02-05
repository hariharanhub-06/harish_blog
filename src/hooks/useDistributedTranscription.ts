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

    useEffect(() => {
        console.log(`🎙️ [Distributed Transcription] Hook called for ${userName}, isActive: ${isActive}`);

        if (!isActive || typeof window === 'undefined') {
            console.log(`⏸️ [Distributed Transcription] Not starting (isActive: ${isActive})`);
            return;
        }


        // Check browser support
        const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
        if (!SpeechRecognition) {
            const browserInfo = getBrowserInfo();
            console.error('❌ [Distributed Transcription] Speech Recognition API not supported in this browser');

            if (browserInfo.isFirefox) {
                console.error('❌ [Distributed Transcription] Firefox does not support the Web Speech Recognition API');
                alert('🦊 Firefox Not Supported\n\nFirefox does not support the Web Speech Recognition API.\n\nTo enable live transcription, please use:\n✅ Chrome\n✅ Microsoft Edge\n✅ Safari\n\nYou can still participate in the webinar, but transcription won\'t work in Firefox.');
            } else {
                alert('Speech Recognition not supported in your browser. Please use Chrome, Edge, or Safari.');
            }
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
        recognition.interimResults = true; // Show live transcription while speaking
        recognition.lang = lang;

        recognition.onstart = () => {
            console.log(`🎤 [Distributed Transcription] Started listening for ${userName}`);
            setIsListening(true);
            setError(null);
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
            const transcript = result[0].transcript.trim();

            // Show interim results live (while speaking)
            if (!result.isFinal) {
                console.log(`💬 [Distributed Transcription] Interim from ${userName}: "${transcript}"`);
                // Update state for live UI display
                setInterimTranscript(transcript);
            }

            // Send only final results to server
            if (result.isFinal) {
                console.log(`📝 [Distributed Transcription] Final from ${userName}: "${transcript}"`);
                // Clear interim text since we got the final version
                setInterimTranscript('');

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
            errorCountRef.current++;
            const browserInfo = getBrowserInfo();

            console.error(`❌ [Distributed Transcription] Error for ${userName}:`, event.error, event);
            setError(event.error);

            // Handle different error types with browser-specific messages
            if (event.error === 'not-allowed') {
                alert(`🎙️ Microphone Access Denied!\n\nPlease allow microphone access to enable live transcription.\n\n1. Click the microphone icon in your browser's address bar\n2. Select "Allow"\n3. Refresh the page`);
            } else if (event.error === 'network') {
                // Network errors are common in Brave due to privacy settings
                if (browserInfo.isBrave && !hasShownBrowserWarning.current) {
                    hasShownBrowserWarning.current = true;
                    console.warn(`⚠️ [Distributed Transcription] Brave detected - network error is expected due to privacy settings`);

                    if (errorCountRef.current >= 3) {
                        alert(`⚠️ Speech Recognition Blocked\n\nBrave browser blocks Google's speech recognition service for privacy.\n\nTo enable transcription:\n\n✅ OPTION 1: Use Chrome or Edge\n✅ OPTION 2: Disable Brave Shields for this site:\n   • Click the Brave lion icon in the address bar\n   • Turn off "Shields"\n   • Refresh the page\n\nTranscription will continue retrying automatically.`);
                    }
                } else if (errorCountRef.current === 1) {
                    // Show generic network error only on first occurrence
                    console.warn(`⚠️ [Distributed Transcription] Network error - speech recognition may not be available`);
                }
            } else if (event.error === 'no-speech') {
                console.log(`🔇 [Distributed Transcription] No speech detected, will retry...`);
            } else if (event.error === 'aborted') {
                console.log(`⏹️ [Distributed Transcription] Recognition aborted, will retry...`);
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
    }, [sessionId, userName, isActive, lang]);

    return { isListening, interimTranscript, error };
}
