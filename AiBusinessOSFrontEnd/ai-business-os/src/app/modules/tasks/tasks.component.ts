import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MockDataService } from '../../core/services/mock-data.service';
import { PermissionService } from '../../core/services/permission.service';
import { Task } from '../../core/models';

@Component({ selector:'app-tasks', standalone:true, imports:[CommonModule,FormsModule], templateUrl:'./tasks.component.html', styleUrls:['./tasks.component.scss'] })
export class TasksComponent {
  data = inject(MockDataService);
  perms = inject(PermissionService);
  showModal = signal(false);
  filterStatus = signal('all');
  filterPriority = signal('all');
  statuses = ['todo','in_progress','done','blocked'];
  statusLabels: Record<string,string> = { todo:'To Do', in_progress:'In Progress', done:'Done', blocked:'Blocked' };
  priorities = ['low','medium','high','urgent'];
  newTask = { title:'', description:'', assignee:'', priority:'medium', dueDate:'' };

  filtered = computed(() => {
    let tasks = this.data.tasks();
    if (this.filterStatus() !== 'all') tasks = tasks.filter(t => t.status === this.filterStatus());
    if (this.filterPriority() !== 'all') tasks = tasks.filter(t => t.priority === this.filterPriority());
    return tasks;
  });

  getByStatus(s: string) { return this.filtered().filter(t => t.status === s); }
  getPriorityClass(p: string) { const m: Record<string,string> = { low:'badge-gray', medium:'badge-blue', high:'badge-amber', urgent:'badge-red' }; return m[p]??'badge-gray'; }
  getStatusClass(s: string) { const m: Record<string,string> = { todo:'badge-gray', in_progress:'badge-blue', done:'badge-green', blocked:'badge-red' }; return m[s]??'badge-gray'; }
  getPriorityIcon(p: string) { const m: Record<string,string> = { low:'ti-arrow-down', medium:'ti-minus', high:'ti-arrow-up', urgent:'ti-arrow-bar-up' }; return m[p]??'ti-minus'; }

  toggleStatus(task: Task) {
    const next: Record<string,string> = { todo:'in_progress', in_progress:'done', done:'todo', blocked:'todo' };
    this.data.tasks.update(ts => ts.map(t => t.id === task.id ? { ...t, status: next[t.status] as any } : t));
  }

  addTask() {
    const t: Task = {
      id:'t'+Date.now(), title:this.newTask.title, description:this.newTask.description,
      assignee:this.newTask.assignee||this.data.currentUser().name, assigneeId:'u1',
      dueDate:this.newTask.dueDate, priority:this.newTask.priority as any,
      status:'todo', tags:[], createdAt:new Date().toISOString().slice(0,10)
    };
    this.data.tasks.update(ts => [t, ...ts]);
    this.showModal.set(false);
    this.newTask = { title:'', description:'', assignee:'', priority:'medium', dueDate:'' };
  }
}
