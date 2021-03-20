import { ExtractorDirective } from './extractor.directive';
import { readFileSync } from 'fs';

describe('ExtractorDirective', () => {
  it('should create an instance', () => {
    const directive = new ExtractorDirective();
    expect(directive).toBeTruthy();
  });
});
