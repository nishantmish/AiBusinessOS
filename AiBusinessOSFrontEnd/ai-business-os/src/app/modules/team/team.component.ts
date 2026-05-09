import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MockDataService } from '../../core/services/mock-data.service';
import { Employee } from '../../core/models';
@Component({ selector:'app-team', standalone:true, imports:[CommonModule], templateUrl:'./team.component.html', styleUrls:['./team.component.scss'] })
export class TeamComponent {
  data = inject(MockDataService);
  selected = signal<Employee|null>(null);
  getStatusClass(s: string) { return {active:'badge-green',inactive:'badge-gray',on_leave:'badge-amber'}[s]??'badge-gray'; }
  getAttendanceClass(s: string) { return {present:'badge-green',absent:'badge-red',half_day:'badge-amber',leave:'badge-gray'}[s]??'badge-gray'; }
}
