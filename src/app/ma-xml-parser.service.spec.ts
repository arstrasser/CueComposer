import { TestBed } from '@angular/core/testing';

import { MaXmlParserService } from './ma-xml-parser.service';

describe('MaXmlParserService', () => {
  let service: MaXmlParserService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MaXmlParserService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
