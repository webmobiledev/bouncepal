import { NgModule } from '@angular/core';
import { TimeFormatPipe } from './time-format/time-format';
import { FormatImagePipe } from './format-image/format-image';
@NgModule({
	declarations: [TimeFormatPipe,
    FormatImagePipe],
	imports: [],
	exports: [TimeFormatPipe,
    FormatImagePipe]
})
export class PipesModule {}
