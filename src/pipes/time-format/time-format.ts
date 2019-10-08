import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'timeFormat',
})
export class TimeFormatPipe implements PipeTransform {
  transform(value: string, ...args) {
    const diff = (new Date().getTime() - new Date(value).getTime()) / 1000;
    if (diff / 60 < 1) {
      return diff.toFixed() + ' seconds ago';
    } else if (diff / 60 >= 1 && diff / 3600 < 1) {
      return (diff / 60).toFixed() + ' minutes ago';
    } else if (diff / 3600 >= 1 && diff / (3600 * 24) < 1) {
      return (diff / 3600).toFixed() + ' hours ago';
    } else if (diff / (3600 * 24) >= 1) {
      return (diff / (3600 * 24)).toFixed() + ' days ago';
    }
  }
}
