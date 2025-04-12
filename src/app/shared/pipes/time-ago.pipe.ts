import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'timeAgo'
})
export class TimeAgoPipe implements PipeTransform {
  transform(value: Date | string): string {
    const now = new Date();
    const date = new Date(value);
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (seconds < 60) return 'néhány másodperce';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes} perce`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} órája`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days} napja`;
    const weeks = Math.floor(days / 7);
    if (weeks < 4) return `${weeks} hete`;

    return date.toLocaleDateString();
  }
}
