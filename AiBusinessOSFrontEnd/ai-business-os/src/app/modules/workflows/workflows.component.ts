import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MockDataService } from '../../core/services/mock-data.service';
import { Workflow } from '../../core/models';
@Component({ selector:'app-workflows', standalone:true, imports:[CommonModule], templateUrl:'./workflows.component.html', styleUrls:['./workflows.component.scss'] })
export class WorkflowsComponent {
  data = inject(MockDataService);
  selectedWf = signal<Workflow|null>(null);
  toggle(wf: Workflow) { this.data.workflows.update(ws => ws.map(w => w.id===wf.id ? {...w, isActive:!w.isActive} : w)); }
}
