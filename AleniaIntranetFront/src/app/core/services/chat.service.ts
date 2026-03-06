import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

export interface ChatMessage {
    id: string;
    conversationId: string;
    content: string;
    senderType: 'USER' | 'BOT' | 'ADMIN';
    senderId?: string;
    senderName?: string;
    createdAt: string;
}

export interface ChatConversation {
    id: string;
    userName: string;
    userEmail: string;
    assignedAdminName?: string;
    status: 'BOT' | 'ESCALATED' | 'ASSIGNED' | 'RESOLVED';
    subject?: string;
    messageCount: number;
    lastMessage: string;
    createdAt: string;
    updatedAt: string;
    resolvedAt?: string;
}

@Injectable({ providedIn: 'root' })
export class ChatService {
    private apiUrl = `${environment.apiUrl}/chat`;
    messages = signal<ChatMessage[]>([]);
    conversationStatus = signal<string>('BOT');
    conversationId = signal<string | null>(null);
    isLoading = signal(false);

    private stompClient: any = null;
    private wsConnected = false;

    constructor(private http: HttpClient) {
        // Add initial greeting
        this.messages.set([{
            id: 'greeting',
            conversationId: '',
            content: '👋 Hello! I\'m the Alenia IT Support Bot.\n\nI can help you with:\n• 🔑 Password reset\n• 🌐 VPN connection\n• 📧 Email / Outlook issues\n• 💿 Software installation\n• 🖨️ Printer setup\n• 💬 Teams / meetings\n• 📶 Wi-Fi / network\n\nWhat do you need help with?',
            senderType: 'BOT',
            senderName: 'IT Support Bot',
            createdAt: new Date().toISOString()
        }]);
    }

    sendMessage(content: string): void {
        // Optimistic UI: add user message immediately
        const tempUserMsg: ChatMessage = {
            id: 'temp-' + Date.now(),
            conversationId: this.conversationId() || '',
            content,
            senderType: 'USER',
            senderName: 'You',
            createdAt: new Date().toISOString()
        };
        this.messages.update(msgs => [...msgs, tempUserMsg]);
        this.isLoading.set(true);

        this.http.post<ChatMessage[]>(`${this.apiUrl}/send`, { message: content })
            .subscribe({
                next: (responses) => {
                    this.isLoading.set(false);

                    // Remove temp user message, add real ones
                    this.messages.update(msgs => {
                        const filtered = msgs.filter(m => m.id !== tempUserMsg.id);
                        return [...filtered, ...responses];
                    });

                    // Update conversation status from bot responses
                    if (responses.length > 0) {
                        const lastMsg = responses[responses.length - 1];
                        this.conversationId.set(lastMsg.conversationId);

                        // Check if escalated
                        if (lastMsg.content.includes('connecting you to an IT support agent')) {
                            this.conversationStatus.set('ESCALATED');
                            this.connectWebSocket(lastMsg.conversationId);
                        }
                    }
                },
                error: () => {
                    this.isLoading.set(false);
                    this.messages.update(msgs => [...msgs, {
                        id: 'error-' + Date.now(),
                        conversationId: '',
                        content: '⚠️ Unable to send message. Please try again.',
                        senderType: 'BOT',
                        senderName: 'System',
                        createdAt: new Date().toISOString()
                    }]);
                }
            });
    }

    /**
     * Connect to WebSocket for real-time admin messages on an escalated conversation.
     */
    private connectWebSocket(conversationId: string): void {
        if (this.wsConnected) return;

        // Dynamic import for SockJS + STOMP
        const SockJS = (window as any)['SockJS'];
        const Stomp = (window as any)['Stomp'];

        if (!SockJS || !Stomp) {
            console.warn('SockJS/Stomp not loaded — falling back to polling');
            this.startPolling(conversationId);
            return;
        }

        const socket = new SockJS('/ws');
        this.stompClient = Stomp.over(socket);
        this.stompClient.debug = null; // Silence STOMP debug

        this.stompClient.connect({}, () => {
            this.wsConnected = true;
            this.stompClient.subscribe(`/topic/conversation.${conversationId}`, (frame: any) => {
                const message: ChatMessage = JSON.parse(frame.body);
                // Avoid duplicates
                this.messages.update(msgs => {
                    if (msgs.some(m => m.id === message.id)) return msgs;
                    return [...msgs, message];
                });

                // Update status if admin joined
                if (message.senderType === 'ADMIN' && message.content.includes('has joined')) {
                    this.conversationStatus.set('ASSIGNED');
                }
                if (message.content.includes('marked as resolved')) {
                    this.conversationStatus.set('RESOLVED');
                }
            });
        }, () => {
            this.wsConnected = false;
            // Fallback to polling if WebSocket fails
            this.startPolling(conversationId);
        });
    }

    /**
     * Polling fallback if WebSocket isn't available.
     */
    private pollingInterval: any;
    private startPolling(conversationId: string): void {
        this.pollingInterval = setInterval(() => {
            this.http.get<ChatMessage[]>(`${this.apiUrl}/conversations/${conversationId}/messages`)
                .subscribe(msgs => {
                    this.messages.set(msgs);
                    const last = msgs[msgs.length - 1];
                    if (last && last.content.includes('marked as resolved')) {
                        this.conversationStatus.set('RESOLVED');
                        clearInterval(this.pollingInterval);
                    }
                });
        }, 3000);
    }

    clearMessages(): void {
        this.conversationStatus.set('BOT');
        this.conversationId.set(null);
        if (this.stompClient) {
            this.stompClient.disconnect();
            this.wsConnected = false;
        }
        if (this.pollingInterval) {
            clearInterval(this.pollingInterval);
        }
        this.messages.set([{
            id: 'greeting-' + Date.now(),
            conversationId: '',
            content: '👋 Chat cleared. How can I help you?',
            senderType: 'BOT',
            senderName: 'IT Support Bot',
            createdAt: new Date().toISOString()
        }]);
    }
}
