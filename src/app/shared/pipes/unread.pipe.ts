import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'unreadOnly' })
export class UnreadPipe implements PipeTransform {
  transform(notifications: any[]): any[] {
    return notifications.filter(n => !n.isRead);
  }
}