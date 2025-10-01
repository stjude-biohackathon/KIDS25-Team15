import { useState } from "react";
import Box from "@mui/material/Box"
import Button from "@mui/material/Button"
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import { useRef, useEffect } from "react";
import { API_ENDPOINTS } from "@constants";
import { useAppState } from '@components/AppStateProvider/AppStateProvider';

interface Message {
    sender: "user" | "ai";
    content: string;
}

const ChatBox = () => {
    const [prompt, setPrompt] = useState('');
    const [messages, setMessages] = useState<Message[]>([
        { sender: "ai", content: "Hello! How can I assist you today?" }
    ]);
    const [loading, setLoading] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setPrompt(event.target.value);
    };

    const { setKey } = useAppState()

    const handleSend = async () => {
        if (!prompt.trim()) return;
        const userMessage: Message = { sender: "user", content: prompt };
        setMessages(prev => [...prev, userMessage]);
        setPrompt('');
        setLoading(true);

        try {
            const response = await fetch(API_ENDPOINTS.CHAT_API, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ prompt: prompt }),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }

            // Stream the response from the API
            if (!response.body) {
                throw new Error("No response body");
            }
            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let aiContent = "";
            let done = false;
            let buffer = "";

            // Add a placeholder AI message to update as we stream
            setMessages(prev => [
                ...prev,
                { sender: "ai", content: "" }
            ]);

            while (!done) {
                const { value, done: streamDone } = await reader.read();
                done = streamDone;
                if (value) {
                    buffer += decoder.decode(value, { stream: true });

                    // Split by newlines to handle NDJSON
                    let lines = buffer.split('\n');
                    // Keep the last partial line in buffer
                    buffer = lines.pop() || "";

                    for (const line of lines) {
                        if (!line.trim()) continue;
                        try {
                            const json = JSON.parse(line);
                            if (json.response) {
                                aiContent += json.response;
                                setMessages(prev => {
                                    // Update the last AI message with the streamed content
                                    const updated = [...prev];
                                    const lastIdx = updated.length - 1;
                                    if (updated[lastIdx]?.sender === "ai") {
                                        updated[lastIdx] = { ...updated[lastIdx], content: aiContent };
                                    }
                                    return updated;
                                });
                            }
                        } catch (e) {
                            // Ignore JSON parse errors for incomplete lines
                        }
                    }
                }
            }
            // Handle any remaining buffered data
            if (buffer.trim()) {
                try {
                    const json = JSON.parse(buffer);
                    if (json.response) {
                        aiContent += json.response;
                        setMessages(prev => {
                            const updated = [...prev];
                            const lastIdx = updated.length - 1;
                            if (updated[lastIdx]?.sender === "ai") {
                                updated[lastIdx] = { ...updated[lastIdx], content: aiContent };
                            }
                            return updated;
                        });
                    }
                } catch (e) {
                    // Ignore
                }
            }
        } catch (error) {
            console.error("Error fetching response:", error);
            setMessages(prev => [...prev, { sender: "ai", content: "Error retrieving response" }]);
        } finally {
            setLoading(false);
        }
    };

    const handleFormSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        handleSend();
    };

    useEffect(() => {
        if (!loading) {
            inputRef.current?.focus();
        }
    }, [loading]);

    return (
        <Box
            sx={{
                display: 'flex',
                flexDirection: 'column',
                height: `calc(90vh - 75px)`,
                justifyContent: 'flex-end',
                p: 2,
                mb: 2,
                bgcolor: 'background.default',
            }}
        >
            {/* Return to welcome screen */}
            <Button sx={{
                height: 'auto',
                justifyContent: 'right'
            }} onClick={() => setKey("screen", "welcome")}>X
            </Button>

            {/* Chat messages area */}
            <Box
                sx={{
                    flex: 1,
                    overflowY: 'auto',
                    mb: 2,
                    px: 1,
                    scrollbarWidth: 'none', 
                    msOverflowStyle: 'none', 
                    '&::-webkit-scrollbar': { display: 'none' }, 
                }}
                ref={el => {
                    // Auto-scroll to bottom on new message
                    if (el) {
                        el.scrollTop = el.scrollHeight;
                    }
                }}
            >
                {messages.map((msg, idx) => (
                    <Box key={idx} sx={{ mb: 2, display: 'flex', flexDirection: 'column', alignItems: msg.sender === "user" ? "flex-end" : "flex-start" }}>
                        <Typography variant="body2" color="text.secondary">
                            {msg.sender === "user" ? "You" : "Jude-E"}
                        </Typography>
                        <Box
                            sx={{
                                bgcolor: msg.sender === "user" ? 'darkblue.main' : 'darkred.main',
                                // color: msg.sender === "user" ? 'primary.contrastText' : 'text.primary',
                                color: 'primary.contrastText',
                                p: 2,
                                mt: 0.5,
                                maxWidth: '80%',
                                borderRadius: 2,
                            }}
                        >
                            <Typography variant="body1" sx={{ fontSize: 24 }}>
                                {msg.content}
                            </Typography>
                        </Box>
                    </Box>
                ))}
                {loading && (
                    <Box sx={{ mb: 2 }}>
                        <Typography variant="body2" color="text.secondary">
                            Jude-E
                        </Typography>
                        <Box
                            sx={{
                                bgcolor: 'darkred.main',
                                p: 2,
                                mt: 0.5,
                                maxWidth: '80%',
                                borderRadius: 2,
                            }}
                        >
                            <Typography variant="body1" sx={{ fontSize: 24 }}>
                                ...
                            </Typography>
                        </Box>
                    </Box>
                )}
            </Box>

            {/* Input prompt area */}
            <Box
                component="form"
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    borderRadius: 2,
                    boxShadow: 1,
                    p: 1,
                }}
                onSubmit={handleFormSubmit}
            >
                <Box sx={{ flex: 1 }}>
                    <input
                        ref={inputRef}
                        type="text"
                        value={prompt}
                        onChange={handleInputChange}
                        placeholder="Type your message..."
                        style={{
                            width: '100%',
                            border: 'none',
                            outline: 'none',
                            background: 'transparent',
                            fontSize: 32,
                            padding: 8,
                            color: 'inherit',
                        }}
                        disabled={loading}
                    />
                </Box>
                <IconButton color="primary" type="submit" sx={{ ml: 1 }} disabled={prompt.trim() === '' || loading}>
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        height="24"
                        width="24"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                    >
                        <path d="M2 21l21-9-21-9v7l15 2-15 2z" />
                    </svg>
                </IconButton>
            </Box>
        </Box>
    )
}

export default ChatBox;