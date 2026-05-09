import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MockDataService } from '../../core/services/mock-data.service';

@Component({
  selector: 'app-attendance',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './attendance.component.html',
  styleUrls: ['./attendance.component.scss']
})
export class AttendanceComponent {
  data = inject(MockDataService);
  today = new Date().toISOString().slice(0, 10);

  getInitials(name: string): string {
    return name.split(' ').map((n: string) => n[0]).join('');
  }

  getStatusClass(s: string): string {
    const m: Record<string,string> = { present:'badge-green', absent:'badge-red', half_day:'badge-amber', leave:'badge-gray' };
    return m[s] ?? 'badge-gray';
  }

  getStatusIcon(s: string): string {
    const m: Record<string,string> = { present:'ti-check', absent:'ti-x', half_day:'ti-clock', leave:'ti-beach' };
    return m[s] ?? 'ti-minus';
  }

  checkIn(id: string) {
    const time = new Date().toLocaleTimeString([], { hour:'2-digit', minute:'2-digit' });
    this.data.attendance.update(rs => rs.map(r =>
      r.employeeId === id && !r.checkIn ? { ...r, checkIn: time, status: 'present' } : r
    ));
  }

  checkOut(id: string) {
    const time = new Date().toLocaleTimeString([], { hour:'2-digit', minute:'2-digit' });
    this.data.attendance.update(rs => rs.map(r =>
      r.employeeId === id && r.checkIn && !r.checkOut ? { ...r, checkOut: time, hours: 8 } : r
    ));
  }
}
