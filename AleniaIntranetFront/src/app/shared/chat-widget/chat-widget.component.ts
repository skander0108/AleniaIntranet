import { Component, inject, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChatService, ChatMessage } from '../../core/services/chat.service';

@Component({
    selector: 'app-chat-widget',
    standalone: true,
    imports: [CommonModule, FormsModule],
    template: `
        <!-- Floating Chat Button -->
        <button *ngIf="!isOpen" (click)="toggleChat()"
            class="fixed bottom-6 right-6 z-[90] size-14 rounded-full bg-gradient-to-br from-primary to-blue-600 text-white shadow-xl hover:shadow-2xl hover:scale-105 active:scale-95 transition-all duration-200 flex items-center justify-center group"
            aria-label="Open IT Support Chat">
            <span class="material-symbols-outlined text-[28px] group-hover:rotate-12 transition-transform">support_agent</span>
            <span class="absolute -top-0.5 -right-0.5 size-4 bg-green-400 rounded-full border-2 border-white animate-pulse"></span>
        </button>

        <!-- Chat Panel -->
        <div *ngIf="isOpen"
            class="fixed bottom-6 right-6 z-[90] w-[400px] max-w-[calc(100vw-2rem)] h-[580px] max-h-[calc(100vh-6rem)] bg-white dark:bg-[#1a202c] rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 flex flex-col overflow-hidden chat-panel-enter">

            <!-- Header -->
            <div class="shrink-0 px-5 py-3.5 text-white" [ngClass]="{
                'bg-gradient-to-r from-primary to-blue-600': chatService.conversationStatus() === 'BOT',
                'bg-gradient-to-r from-amber-500 to-orange-500': chatService.conversationStatus() === 'ESCALATED',
                'bg-gradient-to-r from-green-500 to-emerald-600': chatService.conversationStatus() === 'ASSIGNED',
                'bg-gradient-to-r from-gray-500 to-gray-600': chatService.conversationStatus() === 'RESOLVED'
            }">
                <div class="flex items-center justify-between">
                    <div class="flex items-center gap-3">
                        <div class="size-9 rounded-full bg-white/20 flex items-center justify-center">
                            <span class="material-symbols-outlined text-[20px]">
                                {{ chatService.conversationStatus() === 'BOT' ? 'smart_toy' :
                                   chatService.conversationStatus() === 'ESCALATED' ? 'hourglass_top' :
                                   chatService.conversationStatus() === 'ASSIGNED' ? 'support_agent' : 'check_circle' }}
                            </span>
                        </div>
                        <div>
                            <h3 class="font-bold text-sm leading-tight">IT Support</h3>
                            <div class="flex items-center gap-1.5">
                                <span class="size-2 rounded-full animate-pulse" [ngClass]="{
                                    'bg-green-300': chatService.conversationStatus() !== 'RESOLVED',
                                    'bg-gray-300': chatService.conversationStatus() === 'RESOLVED'
                                }"></span>
                                <span class="text-[11px] text-white/80 font-medium">
                                    {{ chatService.conversationStatus() === 'BOT' ? 'Chatbot Active' :
                                       chatService.conversationStatus() === 'ESCALATED' ? 'Waiting for agent...' :
                                       chatService.conversationStatus() === 'ASSIGNED' ? 'Agent Connected' : 'Resolved' }}
                                </span>
                            </div>
                        </div>
                    </div>
                    <div class="flex items-center gap-1">
                        <button (click)="chatService.clearMessages()"
                            class="p-1.5 rounded-lg hover:bg-white/20 transition-colors" title="New conversation">
                            <span class="material-symbols-outlined text-[18px]">add_comment</span>
                        </button>
                        <button (click)="toggleChat()"
                            class="p-1.5 rounded-lg hover:bg-white/20 transition-colors" title="Close">
                            <span class="material-symbols-outlined text-[18px]">close</span>
                        </button>
                    </div>
                </div>
            </div>

            <!-- Escalation Banner -->
            <div *ngIf="chatService.conversationStatus() === 'ESCALATED'"
                class="shrink-0 px-4 py-2 bg-amber-50 dark:bg-amber-900/20 border-b border-amber-200 dark:border-amber-800 text-center">
                <p class="text-xs font-medium text-amber-700 dark:text-amber-300">
                    ⏳ Your request has been escalated. An IT agent will join shortly.
                </p>
            </div>

            <!-- Messages Area -->
            <div #messagesContainer
                class="flex-1 overflow-y-auto px-4 py-4 space-y-3 scroll-smooth bg-gray-50 dark:bg-[#111418]">

                <div *ngFor="let msg of chatService.messages(); trackBy: trackById"
                    class="flex animate-msg-in"
                    [ngClass]="msg.senderType === 'USER' ? 'justify-end' : 'justify-start'">

                    <!-- Bot/Admin avatar -->
                    <div *ngIf="msg.senderType !== 'USER'" class="shrink-0 mr-2 mt-1">
                        <div class="size-7 rounded-full flex items-center justify-center" [ngClass]="{
                            'bg-primary/10': msg.senderType === 'BOT',
                            'bg-green-100 dark:bg-green-900/30': msg.senderType === 'ADMIN'
                        }">
                            <span class="material-symbols-outlined text-[16px]" [ngClass]="{
                                'text-primary': msg.senderType === 'BOT',
                                'text-green-600': msg.senderType === 'ADMIN'
                            }">
                                {{ msg.senderType === 'BOT' ? 'smart_toy' : 'support_agent' }}
                            </span>
                        </div>
                    </div>

                    <!-- Message bubble -->
                    <div class="max-w-[78%]">
                        <!-- Sender name for admin -->
                        <div *ngIf="msg.senderType === 'ADMIN' && msg.senderName" class="text-[10px] font-bold text-green-600 dark:text-green-400 mb-0.5 ml-1">
                            {{ msg.senderName }}
                        </div>
                        <div class="px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed whitespace-pre-line"
                            [ngClass]="msg.senderType === 'USER'
                                ? 'bg-primary text-white rounded-br-md'
                                : msg.senderType === 'ADMIN'
                                    ? 'bg-green-50 dark:bg-green-900/20 text-[#111418] dark:text-green-100 border border-green-200 dark:border-green-800 rounded-bl-md shadow-sm'
                                    : 'bg-white dark:bg-gray-800 text-[#111418] dark:text-gray-200 border border-gray-100 dark:border-gray-700 rounded-bl-md shadow-sm'">
                            {{ msg.content }}
                            <div class="text-[10px] mt-1 opacity-60"
                                [ngClass]="msg.senderType === 'USER' ? 'text-right' : 'text-left'">
                                {{ msg.createdAt | date:'shortTime' }}
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Typing indicator -->
                <div *ngIf="chatService.isLoading()" class="flex justify-start animate-msg-in">
                    <div class="shrink-0 mr-2 mt-1">
                        <div class="size-7 rounded-full bg-primary/10 flex items-center justify-center">
                            <span class="material-symbols-outlined text-primary text-[16px]">smart_toy</span>
                        </div>
                    </div>
                    <div class="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl rounded-bl-md px-4 py-3 shadow-sm">
                        <div class="flex gap-1.5 items-center">
                            <span class="size-2 bg-gray-400 rounded-full animate-bounce" style="animation-delay:0ms"></span>
                            <span class="size-2 bg-gray-400 rounded-full animate-bounce" style="animation-delay:150ms"></span>
                            <span class="size-2 bg-gray-400 rounded-full animate-bounce" style="animation-delay:300ms"></span>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Input Area -->
            <div class="shrink-0 px-4 py-3 border-t border-gray-100 dark:border-gray-700 bg-white dark:bg-[#1a202c]">
                <form (ngSubmit)="sendMessage()" class="flex items-center gap-2">
                    <input #messageInput
                        [(ngModel)]="newMessage" name="message"
                        [disabled]="chatService.conversationStatus() === 'RESOLVED'"
                        class="flex-1 h-10 px-4 rounded-full bg-gray-100 dark:bg-gray-800 text-[#111418] dark:text-white text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-shadow disabled:opacity-50"
                        [placeholder]="chatService.conversationStatus() === 'RESOLVED' ? 'Conversation resolved' : 'Describe your IT issue...'"
                        autocomplete="off" />
                    <button type="submit"
                        [disabled]="!newMessage.trim() || chatService.conversationStatus() === 'RESOLVED'"
                        class="size-10 rounded-full bg-primary text-white flex items-center justify-center hover:bg-blue-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all hover:scale-105 active:scale-95 shrink-0">
                        <span class="material-symbols-outlined text-[20px]">send</span>
                    </button>
                </form>
                <p class="text-[10px] text-gray-400 text-center mt-2">Alenia IT Support • Internal use only</p>
            </div>
        </div>
    `,
    styles: [`
        @keyframes chatPanelEnter {
            from { transform: translateY(20px) scale(0.95); opacity: 0; }
            to { transform: translateY(0) scale(1); opacity: 1; }
        }
        .chat-panel-enter { animation: chatPanelEnter 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        @keyframes msgIn {
            from { transform: translateY(8px); opacity: 0; }
            to { transform: translateY(0); opacity: 1; }
        }
        .animate-msg-in { animation: msgIn 0.2s ease-out forwards; }
    `]
})
export class ChatWidgetComponent implements AfterViewChecked {
    chatService = inject(ChatService);

    @ViewChild('messagesContainer') messagesContainer!: ElementRef;
    @ViewChild('messageInput') messageInput!: ElementRef;

    isOpen = false;
    newMessage = '';
    private previousMessageCount = 0;

    toggleChat(): void {
        this.isOpen = !this.isOpen;
        if (this.isOpen) {
            setTimeout(() => this.messageInput?.nativeElement?.focus(), 100);
        }
    }

    sendMessage(): void {
        const content = this.newMessage.trim();
        if (!content) return;
        this.newMessage = '';
        this.chatService.sendMessage(content);
    }

    ngAfterViewChecked(): void {
        const msgs = this.chatService.messages();
        if (msgs.length !== this.previousMessageCount) {
            this.previousMessageCount = msgs.length;
            this.scrollToBottom();
        }
    }

    private scrollToBottom(): void {
        try {
            const el = this.messagesContainer?.nativeElement;
            if (el) el.scrollTop = el.scrollHeight;
        } catch (e) { }
    }

    trackById(index: number, msg: ChatMessage): string {
        return msg.id;
    }
}
