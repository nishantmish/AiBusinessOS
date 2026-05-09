import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MockDataService } from '../../core/services/mock-data.service';
import { Conversation } from '../../core/models';

@Component({ selector:'app-inbox', standalone:true, imports:[CommonModule,FormsModule], templateUrl:'./inbox.component.html', styleUrls:['./inbox.component.scss'] })
export class InboxComponent {
  data = inject(MockDataService);
  selected = signal<Conversation|null>(null);
  replyText = signal('');
  filter = signal<'all'|'open'|'resolved'>('all');

  filtered = computed(() => {
    const convs = this.data.conversations();
    if (this.filter() === 'all') return convs;
    return convs.filter(c => c.status === this.filter());
  });

  select(conv: Conversation) { this.selected.set(conv); }

  sendReply() {
    if (!this.replyText().trim() || !this.selected()) return;
    const conv = this.selected()!;
    const newMsg = { id:'m'+Date.now(), conversationId:conv.id, content:this.replyText(), sender:'agent' as const, timestamp:new Date().toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'}), status:'sent' as const };
    this.data.conversations.update(cs => cs.map(c => c.id === conv.id ? { ...c, messages:[...c.messages, newMsg], lastMessage:this.replyText(), lastMessageAt:'Just now', unread:0 } : c));
    this.selected.update(c => c ? { ...c, messages:[...c.messages, newMsg] } : null);
    this.replyText.set('');
  }

  getInitials(name: string) { return name.split(' ').map(n=>n[0]).join(''); }
  getStatusClass(s: string) { return s==='open'?'badge-green':s==='resolved'?'badge-gray':'badge-amber'; }
}
