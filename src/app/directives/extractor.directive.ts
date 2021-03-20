import { parse } from 'papaparse';
import { Directive } from '@angular/core';


@Directive({
  selector: '[appExtractor]'
})
export class ExtractorDirective {

  constructor() { }

  public extract(file: File) : any {
    const config = {
      header: true,
      preview: 20,
      worker: false, // TODO: change to true
      step: function(results, parser) {
        console.log("Row data:", results.data);
        console.log("Row errors:", results.errors);
      },
      complete: function(results, file) {
        console.log("Parsing complete:", results, file);
      },
      beforeFirstChunk: undefined // TODO: change this to parse out lines up to the first empty line
    };

    parse(file, config);
  }

}
