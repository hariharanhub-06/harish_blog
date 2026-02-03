"use client";

import { useState, useRef, useEffect } from "react";
import { X, MessageSquare, Send, CheckCircle2, ArrowUp } from "lucide-react";
import { motion, AnimatePresence, useScroll, useTransform, useSpring, useMotionValue } from "framer-motion";

interface FormData {
    name: string;
    email: string;
    mobile: string;
    message: string;
}

export default function ContactForm() {
    const [isOpen, setIsOpen] = useState(false);
    const [showCharacter, setShowCharacter] = useState(false);
    const [showBubble, setShowBubble] = useState(false);
    const [hasSeenCharacter, setHasSeenCharacter] = useState(false);
    const [formData, setFormData] = useState<FormData>({
        name: "",
        email: "",
        mobile: "",
        message: ""
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [error, setError] = useState("");

    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);

    const { scrollYProgress } = useScroll();
    const pathLength = useSpring(scrollYProgress, { stiffness: 100, damping: 30, restDelta: 0.001 });

    // Track head position for bubble synchronization
    const bubbleY = useMotionValue(0);

    // Chroma Key Processing Loop
    useEffect(() => {
        const video = videoRef.current;
        const canvas = canvasRef.current;
        if (!video || !canvas) return;

        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        if (!ctx) return;

        let animationFrameId: number;

        const processFrame = () => {
            // Check if video is actually ready to be drawn
            if (video.paused || video.ended || video.readyState < 2) {
                animationFrameId = requestAnimationFrame(processFrame);
                return;
            }

            // Match canvas size to video aspect ratio, but cap at a low resolution for performance
            const MAX_WIDTH = 180;
            if (canvas.width !== MAX_WIDTH) {
                const scale = MAX_WIDTH / video.videoWidth;
                canvas.width = MAX_WIDTH;
                canvas.height = video.videoHeight * scale;
            }

            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

            try {
                const frame = ctx.getImageData(0, 0, canvas.width, canvas.height);
                const length = frame.data.length;
                let topPixelY = canvas.height;
                let foundTop = false;

                for (let i = 0; i < length; i += 4) {
                    const r = frame.data[i + 0];
                    const g = frame.data[i + 1];
                    const b = frame.data[i + 2];

                    // Chroma key detection (Green)
                    // Dominant green threshold - refined to be less aggressive
                    if (g > 70 && g > r * 1.3 && g > b * 1.3) {
                        frame.data[i + 3] = 0; // Transparent
                    } else if (!foundTop && frame.data[i + 3] > 120) {
                        // Found a solid non-transparent pixel
                        const pixelIndex = i / 4;
                        topPixelY = Math.floor(pixelIndex / canvas.width);
                        foundTop = true;
                    }
                }

                // Update bubble Y offset based on character's actual head position in frame
                if (foundTop) {
                    const percentFromTop = topPixelY / canvas.height;
                    // Improved mapping: since canvas is smaller, 120 offset needs to be consistent
                    // (percentFromTop - 0.2) maps to -30px to +120px depending on jump height
                    const offset = (percentFromTop - 0.2) * 120;
                    bubbleY.set(offset);
                }

                ctx.putImageData(frame, 0, 0);
            } catch (e) {
                // Handle potential security errors or frame access issues
            }

            animationFrameId = requestAnimationFrame(processFrame);
        };

        processFrame();
        return () => cancelAnimationFrame(animationFrameId);
    }, [showCharacter]);

    // Check if user has seen character before
    useEffect(() => {
        // Show character after a short delay (0.5s) on every visit
        const characterTimer = setTimeout(() => {
            setShowCharacter(true);
            // Show bubble 0.3 seconds after character
            setTimeout(() => setShowBubble(true), 300);
        }, 500);

        return () => clearTimeout(characterTimer);
    }, []);

    // Explicitly play video when character is shown
    useEffect(() => {
        if (showCharacter && videoRef.current) {
            const video = videoRef.current;
            video.load(); // Force reload for new source
            const playPromise = video.play();
            if (playPromise !== undefined) {
                playPromise.catch(err => {
                    console.warn("Video auto-play failed, waiting for interaction", err);
                });
            }
        }
    }, [showCharacter]);

    // Re-show bubble when form is closed
    useEffect(() => {
        if (!isOpen && showCharacter) {
            const timer = setTimeout(() => setShowBubble(true), 500);
            return () => clearTimeout(timer);
        }
    }, [isOpen, showCharacter]);

    // Listen for global open event
    useEffect(() => {
        const handleOpen = () => {
            setIsOpen(true);
            if (!hasSeenCharacter) {
                localStorage.setItem('seenChatCharacter', 'true');
                setHasSeenCharacter(true);
            }
        };
        window.addEventListener("open-ai-chat", handleOpen);
        return () => window.removeEventListener("open-ai-chat", handleOpen);
    }, [hasSeenCharacter]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData(prev => ({
            ...prev,
            [e.target.name]: e.target.value
        }));
        setError("");
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Basic validation
        if (!formData.name || !formData.email || !formData.message) {
            setError("Please fill in all required fields");
            return;
        }

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            setError("Please enter a valid email address");
            return;
        }

        setIsSubmitting(true);
        setError("");

        try {
            const response = await fetch('/api/contact', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name: formData.name,
                    email: formData.email,
                    mobile: formData.mobile,
                    message: formData.message,
                    subject: "Contact Form Submission",
                    category: "Contact Form"
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to send message');
            }

            setIsSubmitted(true);
            setFormData({ name: "", email: "", mobile: "", message: "" });

            // Reset after 3 seconds
            setTimeout(() => {
                setIsSubmitted(false);
                setIsOpen(false);
            }, 3000);
        } catch (err) {
            setError("Failed to send message. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const containerRef = useRef<HTMLDivElement>(null);

    // Handle click outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen]);

    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleCharacterClick = () => {
        setIsOpen(!isOpen);
        if (!hasSeenCharacter) {
            localStorage.setItem('seenChatCharacter', 'true');
            setHasSeenCharacter(true);
        }
        setShowBubble(false); // Hide bubble once clicked
    };

    return (
        <div ref={containerRef} className="fixed bottom-6 right-6 z-[60] flex items-center justify-center">
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="mb-4 w-[340px] md:w-[420px] bg-[#0e0e0e] border border-white/10 rounded-3xl shadow-2xl overflow-hidden backdrop-blur-xl absolute bottom-[80px] right-0 flex flex-col max-h-[calc(100vh-120px)]"
                    >
                        {/* Header */}
                        <div className="p-5 bg-gradient-to-r from-orange-600/20 to-transparent border-b border-white/5 flex justify-between items-center shrink-0">
                            <div>
                                <h3 className="text-sm font-black text-white tracking-widest uppercase">Contact Me</h3>
                                <p className="text-[9px] text-emerald-500 uppercase tracking-wider">● Available</p>
                            </div>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="text-white/40 hover:text-white transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* Form Content */}
                        <div className="p-6 bg-black/20 overflow-y-auto custom-scrollbar">
                            {isSubmitted ? (
                                <motion.div
                                    initial={{ scale: 0.8, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    className="flex flex-col items-center justify-center py-12 text-center"
                                >
                                    <CheckCircle2 className="text-emerald-500 mb-4" size={48} />
                                    <h4 className="text-white font-bold text-lg mb-2">Message Sent! 🎉</h4>
                                    <p className="text-white/60 text-sm">Thank you for reaching out. I'll get back to you soon!</p>
                                </motion.div>
                            ) : (
                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <div>
                                        <label className="block text-xs text-white/60 mb-1.5 font-medium">
                                            Name <span className="text-orange-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            name="name"
                                            value={formData.name}
                                            onChange={handleChange}
                                            placeholder="Your full name"
                                            className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-white/30 focus:border-orange-600 focus:ring-1 focus:ring-orange-600/50 outline-none transition-all"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs text-white/60 mb-1.5 font-medium">
                                            Email <span className="text-orange-500">*</span>
                                        </label>
                                        <input
                                            type="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleChange}
                                            placeholder="your.email@example.com"
                                            className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-white/30 focus:border-orange-600 focus:ring-1 focus:ring-orange-600/50 outline-none transition-all"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs text-white/60 mb-1.5 font-medium">
                                            Phone (Optional)
                                        </label>
                                        <input
                                            type="tel"
                                            name="mobile"
                                            value={formData.mobile}
                                            onChange={handleChange}
                                            placeholder="+91 XXXXX XXXXX"
                                            className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-white/30 focus:border-orange-600 focus:ring-1 focus:ring-orange-600/50 outline-none transition-all"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs text-white/60 mb-1.5 font-medium">
                                            Message <span className="text-orange-500">*</span>
                                        </label>
                                        <textarea
                                            name="message"
                                            value={formData.message}
                                            onChange={handleChange}
                                            placeholder="Tell me what you're looking for..."
                                            rows={4}
                                            className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-white/30 focus:border-orange-600 focus:ring-1 focus:ring-orange-600/50 outline-none resize-none transition-all"
                                            required
                                        />
                                    </div>

                                    {error && (
                                        <p className="text-red-400 text-xs">{error}</p>
                                    )}

                                    <button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="w-full bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]"
                                    >
                                        {isSubmitting ? (
                                            <>
                                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                Sending...
                                            </>
                                        ) : (
                                            <>
                                                <Send size={16} />
                                                Send Message
                                            </>
                                        )}
                                    </button>
                                </form>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Scroll Progress Circle (Left Side) - Always visible or as before */}
            <div className="fixed bottom-4 left-4 md:bottom-6 md:left-6 z-[60] flex items-center justify-center w-[36px] h-[36px] md:w-[40px] md:h-[40px]">
                <svg
                    className="absolute w-full h-full -rotate-90 cursor-pointer hover:opacity-80 transition-opacity"
                    viewBox="0 0 100 100"
                    onClick={scrollToTop}
                >
                    <title>Scroll to Top</title>
                    <circle
                        cx="50"
                        cy="50"
                        r="48"
                        fill="none"
                        stroke="rgba(255, 255, 255, 0.1)"
                        strokeWidth="4"
                    />
                    <motion.circle
                        cx="50"
                        cy="50"
                        r="48"
                        fill="none"
                        stroke="#ea580c" // Orange-600
                        strokeWidth="4"
                        strokeLinecap="round"
                        style={{ pathLength }}
                    />
                </svg>
                {/* ArrowUp inside circle */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 0.6 }}
                        className="text-white"
                    >
                        <ArrowUp size={14} className="md:w-4 md:h-4" />
                    </motion.div>
                </div>
            </div>

            {/* Animated Video Character */}
            {showCharacter && (
                <div className="fixed bottom-4 right-4 md:bottom-6 md:right-6 z-[60] flex items-end justify-end pointer-events-none">
                    <motion.div
                        initial={{ x: 400, opacity: 0 }}
                        animate={{
                            x: 0,
                            opacity: 1
                        }}
                        exit={{ x: 400, opacity: 0 }}
                        transition={{
                            x: { type: "spring", damping: 25, stiffness: 120 },
                            opacity: { duration: 0.5 }
                        }}
                        className="relative cursor-pointer pointer-events-auto"
                        onClick={handleCharacterClick}
                    >
                        {/* Speech Bubble */}
                        <AnimatePresence>
                            {showBubble && (
                                <motion.div
                                    initial={{ scale: 0, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    exit={{ scale: 0, opacity: 0 }}
                                    className="absolute bottom-[95px] md:bottom-[135px] right-0 mb-4 bg-white text-black px-1.5 py-1 rounded-lg shadow-2xl min-w-[80px] max-w-[110px] md:min-w-[100px] md:max-w-[140px] z-20"
                                    style={{
                                        transformOrigin: "bottom right",
                                        y: bubbleY
                                    }}
                                >
                                    <p className="text-[8px] md:text-[9px] font-bold text-orange-600 leading-tight">Meet my boss! 👋</p>
                                    <p className="text-[7px] md:text-[8px] text-black/70 mt-0 leading-tight">Fill the form</p>
                                    <div className="absolute bottom-0 right-6 w-0 h-0 border-l-4 border-l-transparent border-r-4 border-r-transparent border-t-4 border-t-white translate-y-full" />
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Hidden Video for processing - Lazy loaded */}
                        {showCharacter && (
                            <video
                                ref={videoRef}
                                src={process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT
                                    ? `${process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT}/mascot/mascot-dance.mp4?tr=f-auto,q-60`
                                    : "/mascot-dance.mp4"}
                                autoPlay
                                loop
                                muted
                                playsInline
                                crossOrigin="anonymous"
                                className="hidden"
                                preload="metadata" // Only load metadata initially
                                onCanPlayThrough={() => {
                                    videoRef.current?.play().catch(() => { });
                                }}
                            />
                        )}

                        {/* Visible Canvas with Chroma Key */}
                        <canvas
                            ref={canvasRef}
                            className="w-[60px] h-[90px] md:w-[100px] md:h-[150px] drop-shadow-2xl"
                            style={{
                                // Color shift filter to pull colors towards the theme
                                // Rotate hue to orange territory, boost saturation/contrast
                                filter: 'saturate(1.8) brightness(1.1) contrast(1.2) hue-rotate(15deg) sepia(0.2)'
                            }}
                        />
                    </motion.div>
                </div>
            )}
        </div>
    );
}
