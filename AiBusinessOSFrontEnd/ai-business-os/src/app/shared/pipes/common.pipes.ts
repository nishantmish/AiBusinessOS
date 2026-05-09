import { Pipe, PipeTransform } from '@angular/core';

/**
 * Pipe to format currency in INR (Indian Rupees)
 * Usage: {{ value | appCurrency }}
 */
@Pipe({
  name: 'appCurrency',
  standalone: true
})
export class CurrencyPipe implements PipeTransform {
  transform(value: number | string, format: 'full' | 'short' = 'short'): string {
    if (!value) return '₹0';

    const num = typeof value === 'string' ? parseFloat(value) : value;

    if (format === 'short') {
      if (num >= 1000000) return `₹${(num / 1000000).toFixed(1)}M`;
      if (num >= 1000) return `₹${(num / 1000).toFixed(1)}K`;
      return `₹${num.toFixed(0)}`;
    }

    return `₹${num.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;
  }
}

/**
 * Pipe to format numbers with thousands separator
 * Usage: {{ value | appNumber }}
 */
@Pipe({
  name: 'appNumber',
  standalone: true
})
export class NumberPipe implements PipeTransform {
  transform(value: number | string): string {
    if (!value) return '0';

    const num = typeof value === 'string' ? parseFloat(value) : value;
    return num.toLocaleString('en-IN');
  }
}

/**
 * Pipe to format percentage
 * Usage: {{ value | appPercent }}
 */
@Pipe({
  name: 'appPercent',
  standalone: true
})
export class PercentPipe implements PipeTransform {
  transform(value: number | string, decimals: number = 1): string {
    if (!value) return '0%';

    const num = typeof value === 'string' ? parseFloat(value) : value;
    return `${num.toFixed(decimals)}%`;
  }
}

/**
 * Pipe to truncate text with ellipsis
 * Usage: {{ text | appTruncate:20 }}
 */
@Pipe({
  name: 'appTruncate',
  standalone: true
})
export class TruncatePipe implements PipeTransform {
  transform(value: string, limit: number = 50): string {
    if (!value) return '';

    return value.length > limit ? value.substring(0, limit) + '...' : value;
  }
}

/**
 * Pipe to get initials from a name
 * Usage: {{ name | appInitials }}
 */
@Pipe({
  name: 'appInitials',
  standalone: true
})
export class InitialsPipe implements PipeTransform {
  transform(value: string): string {
    if (!value) return '';

    return value
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }
}

/**
 * Pipe to format time ago (e.g., "2 hours ago")
 * Usage: {{ date | appTimeAgo }}
 */
@Pipe({
  name: 'appTimeAgo',
  standalone: true
})
export class TimeAgoPipe implements PipeTransform {
  transform(value: string | Date): string {
    if (!value) return '';

    const date = new Date(value);
    const now = new Date();
    const diff = now.getTime() - date.getTime();

    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    const weeks = Math.floor(days / 7);
    const months = Math.floor(days / 30);
    const years = Math.floor(days / 365);

    if (seconds < 60) return 'just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    if (weeks < 4) return `${weeks}w ago`;
    if (months < 12) return `${months}mo ago`;
    return `${years}y ago`;
  }
}

/**
 * Pipe to format date as "Jan 1, 2024"
 * Usage: {{ date | appDateFormat }}
 */
@Pipe({
  name: 'appDateFormat',
  standalone: true
})
export class DateFormatPipe implements PipeTransform {
  transform(value: string | Date, format: 'short' | 'long' = 'short'): string {
    if (!value) return '';

    const date = new Date(value);
    const options: Intl.DateTimeFormatOptions =
      format === 'short'
        ? { month: 'short', day: 'numeric', year: 'numeric' }
        : { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' };

    return date.toLocaleDateString('en-US', options);
  }
}

/**
 * Pipe to format file size
 * Usage: {{ bytes | appFileSize }}
 */
@Pipe({
  name: 'appFileSize',
  standalone: true
})
export class FileSizePipe implements PipeTransform {
  transform(value: number): string {
    if (!value) return '0 B';

    const units = ['B', 'KB', 'MB', 'GB', 'TB'];
    let size = value;
    let unitIndex = 0;

    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }

    return `${size.toFixed(1)} ${units[unitIndex]}`;
  }
}

/**
 * Export all pipes
 */
export const SHARED_PIPES = [
  CurrencyPipe,
  NumberPipe,
  PercentPipe,
  TruncatePipe,
  InitialsPipe,
  TimeAgoPipe,
  DateFormatPipe,
  FileSizePipe
];
