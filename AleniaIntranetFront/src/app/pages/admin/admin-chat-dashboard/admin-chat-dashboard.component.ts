import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

interface ChatConversation {
    id: string;
    userName: string;
    userEmail: string;
    assignedAdminName?: string;
    status: string;
    subject?: string;
    messageCount: number;
    lastMessage: string;
    createdAt: string;
    updatedAt: string;
}

interface ChatMessage {
    id: string;
    conversationId: string;
    senderType: string;
    senderId?: string;
    senderName?: string;
    content: string;
    createdAt: string;
}

@Component({
    selector: 'app-admin-chat-dashboard',
    standalone: true,
    imports: [CommonModule, FormsModule],
    template: `
    <div class="max-w-7xl mx-auto">
        <!-- Header -->
        <div class="mb-8">
            <h1 class="text-3xl font-black text-[#111418] dark:text-white">IT Support Chat</h1>
            <p class="text-slate-500 dark:text-slate-400 mt-1">Manage escalated conversations from employees</p>
        </div>

        <div class="flex gap-6 h-[calc(100vh-220px)]">
            <!-- Conversations List -->
            <div class="w-96 shrink-0 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 overflow-hidden flex flex-col">
                <div class="px-5 py-4 border-b border-slate-100 dark:border-slate-800">
                    <h2 class="font-bold text-[#111418] dark:text-white flex items-center gap-2">
                        <span class="material-symbols-outlined text-primary">forum</span>
                        Conversations
                        <span *ngIf="conversations.length > 0" class="text-xs bg-primary text-white px-2 py-0.5 rounded-full">{{ conversations.length }}</span>
                    </h2>
                </div>
                <div class="flex-1 overflow-y-auto">
                    <div *ngIf="conversations.length === 0" class="flex flex-col items-center justify-center h-full text-slate-400">
                        <span class="material-symbols-outlined text-4xl mb-2">forum</span>
                        <p class="text-sm">No escalated conversations</p>
                    </div>
                    <div *ngFor="let conv of conversations"
                        (click)="selectConversation(conv)"
                        class="px-5 py-4 border-b border-slate-50 dark:border-slate-800 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                        [ngClass]="{'bg-primary/5 border-l-4 border-l-primary': selectedConversation?.id === conv.id}">
                        <div class="flex items-start justify-between mb-1">
                            <h3 class="font-bold text-sm text-[#111418] dark:text-white">{{ conv.userName }}</h3>
                            <span class="text-[10px] px-2 py-0.5 rounded-full font-bold"
                                [ngClass]="{
                                    'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300': conv.status === 'ESCALATED',
                                    'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300': conv.status === 'ASSIGNED',
                                    'bg-gray-100 text-gray-600': conv.status === 'RESOLVED'
                                }">
                                {{ conv.status }}
                            </span>
                        </div>
                        <p class="text-xs text-slate-500 dark:text-slate-400 truncate">{{ conv.lastMessage }}</p>
                        <div class="flex items-center gap-2 mt-2 text-[10px] text-slate-400">
                            <span>{{ conv.messageCount }} messages</span>
                            <span>•</span>
                            <span>{{ conv.createdAt | date:'short' }}</span>
                        </div>
                    </div>
                </div>
                <div class="px-5 py-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/30">
                    <button (click)="loadConversations()" class="text-xs text-primary font-bold hover:underline flex items-center gap-1">
                        <span class="material-symbols-outlined text-[16px]">refresh</span> Refresh
                    </button>
                </div>
            </div>

            <!-- Chat Area -->
            <div class="flex-1 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 overflow-hidden flex flex-col">
                <ng-container *ngIf="selectedConversation; else noSelection">
                    <!-- Chat Header -->
                    <div class="px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                        <div>
                            <h3 class="font-bold text-[#111418] dark:text-white">{{ selectedConversation.userName }}</h3>
                            <p class="text-xs text-slate-500">{{ selectedConversation.userEmail }}</p>
                        </div>
                        <div class="flex items-center gap-2">
                            <button *ngIf="selectedConversation.status === 'ESCALATED'"
                                (click)="assignToMe()" class="px-4 py-2 bg-primary text-white rounded-lg text-sm font-bold hover:bg-blue-600 transition-colors flex items-center gap-1.5">
                                <span class="material-symbols-outlined text-[18px]">person_add</span> Assign to me
                            </button>
                            <button *ngIf="selectedConversation.status === 'ASSIGNED'"
                                (click)="resolveConversation()" class="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-bold hover:bg-green-700 transition-colors flex items-center gap-1.5">
                                <span class="material-symbols-outlined text-[18px]">check_circle</span> Resolve
                            </button>
                        </div>
                    </div>

                    <!-- Messages -->
                    <div class="flex-1 overflow-y-auto px-5 py-4 space-y-3 bg-gray-50 dark:bg-[#111418]">
                        <div *ngFor="let msg of messages"
                            class="flex" [ngClass]="msg.senderType === 'ADMIN' ? 'justify-end' : 'justify-start'">
                            <!-- Avatar -->
                            <div *ngIf="msg.senderType !== 'ADMIN'" class="shrink-0 mr-2 mt-1">
                                <div class="size-7 rounded-full flex items-center justify-center" [ngClass]="{
                                    'bg-primary/10': msg.senderType === 'BOT',
                                    'bg-blue-100 dark:bg-blue-900/30': msg.senderType === 'USER'
                                }">
                                    <span class="material-symbols-outlined text-[16px]" [ngClass]="{
                                        'text-primary': msg.senderType === 'BOT',
                                        'text-blue-600': msg.senderType === 'USER'
                                    }">
                                        {{ msg.senderType === 'BOT' ? 'smart_toy' : 'person' }}
                                    </span>
                                </div>
                            </div>
                            <div class="max-w-[70%]">
                                <div *ngIf="msg.senderName && msg.senderType !== 'ADMIN'" class="text-[10px] font-bold mb-0.5 ml-1" [ngClass]="{
                                    'text-primary': msg.senderType === 'BOT',
                                    'text-blue-600': msg.senderType === 'USER'
                                }">{{ msg.senderName }}</div>
                                <div class="px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed whitespace-pre-line"
                                    [ngClass]="msg.senderType === 'ADMIN'
                                        ? 'bg-green-600 text-white rounded-br-md'
                                        : msg.senderType === 'USER'
                                            ? 'bg-white dark:bg-gray-800 text-[#111418] dark:text-gray-200 border border-gray-100 dark:border-gray-700 rounded-bl-md shadow-sm'
                                            : 'bg-primary/5 text-[#111418] dark:text-gray-300 border border-primary/20 rounded-bl-md'">
                                    {{ msg.content }}
                                    <div class="text-[10px] mt-1 opacity-60">{{ msg.createdAt | date:'shortTime' }}</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Reply input -->
                    <div *ngIf="selectedConversation.status === 'ASSIGNED'" class="shrink-0 px-5 py-3 border-t border-slate-100 dark:border-slate-800">
                        <form (ngSubmit)="sendReply()" class="flex items-center gap-2">
                            <input [(ngModel)]="replyMessage" name="reply"
                                class="flex-1 h-10 px-4 rounded-full bg-gray-100 dark:bg-gray-800 text-[#111418] dark:text-white text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500/50"
                                placeholder="Type your reply..." autocomplete="off" />
                            <button type="submit" [disabled]="!replyMessage.trim()"
                                class="size-10 rounded-full bg-green-600 text-white flex items-center justify-center hover:bg-green-700 disabled:opacity-40 transition-all shrink-0">
                                <span class="material-symbols-outlined text-[20px]">send</span>
                            </button>
                        </form>
                    </div>
                    <div *ngIf="selectedConversation.status === 'ESCALATED'" class="shrink-0 px-5 py-3 border-t border-slate-100 dark:border-slate-800 bg-amber-50 dark:bg-amber-900/10 text-center">
                        <p class="text-xs text-amber-700 dark:text-amber-300 font-medium">Click "Assign to me" to start replying</p>
                    </div>
                </ng-container>

                <ng-template #noSelection>
                    <div class="flex-1 flex flex-col items-center justify-center text-slate-400">
                        <span class="material-symbols-outlined text-6xl mb-4">chat</span>
                        <p class="text-lg font-medium">Select a conversation</p>
                        <p class="text-sm">Choose a conversation from the list to respond</p>
                    </div>
                </ng-template>
            </div>
        </div>
    </div>
    `
})
export class AdminChatDashboardComponent implements OnInit {
    private apiUrl = `${environment.apiUrl}/admin/chat`;

    conversations: ChatConversation[] = [];
    selectedConversation: ChatConversation | null = null;
    messages: ChatMessage[] = [];
    replyMessage = '';

    private refreshInterval: any;

    constructor(private http: HttpClient) { }

    ngOnInit(): void {
        this.loadConversations();
        // Auto-refresh every 5 seconds
        this.refreshInterval = setInterval(() => {
            this.loadConversations();
            if (this.selectedConversation) {
                this.loadMessages(this.selectedConversation.id);
            }
        }, 5000);
    }

    loadConversations(): void {
        this.http.get<ChatConversation[]>(`${this.apiUrl}/conversations`)
            .subscribe(convs => this.conversations = convs);
    }

    selectConversation(conv: ChatConversation): void {
        this.selectedConversation = conv;
        this.loadMessages(conv.id);
    }

    loadMessages(conversationId: string): void {
        this.http.get<ChatMessage[]>(`${this.apiUrl}/conversations/${conversationId}/messages`)
            .subscribe(msgs => this.messages = msgs);
    }

    assignToMe(): void {
        if (!this.selectedConversation) return;
        this.http.post<ChatConversation>(`${this.apiUrl}/conversations/${this.selectedConversation.id}/assign`, {})
            .subscribe(conv => {
                this.selectedConversation = conv;
                this.loadConversations();
                this.loadMessages(conv.id);
            });
    }

    sendReply(): void {
        if (!this.selectedConversation || !this.replyMessage.trim()) return;
        const message = this.replyMessage.trim();
        this.replyMessage = '';

        this.http.post<ChatMessage>(`${this.apiUrl}/conversations/${this.selectedConversation.id}/reply`, { message })
            .subscribe(msg => {
                this.messages.push(msg);
            });
    }

    resolveConversation(): void {
        if (!this.selectedConversation) return;
        this.http.post(`${this.apiUrl}/conversations/${this.selectedConversation.id}/resolve`, {})
            .subscribe(() => {
                if (this.selectedConversation) {
                    this.selectedConversation.status = 'RESOLVED';
                }
                this.loadConversations();
                if (this.selectedConversation) {
                    this.loadMessages(this.selectedConversation.id);
                }
            });
    }

    ngOnDestroy(): void {
        if (this.refreshInterval) clearInterval(this.refreshInterval);
    }
}
