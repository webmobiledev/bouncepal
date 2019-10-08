import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';

@Pipe({
  name: 'formatImage',
})
export class FormatImagePipe implements PipeTransform {
  constructor(private sanitizer: DomSanitizer) {}

  transform(value: string, ...args) {
    return this.sanitizer.bypassSecurityTrustUrl(value);
  }
}
