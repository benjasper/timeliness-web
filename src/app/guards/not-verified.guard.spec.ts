import { TestBed } from '@angular/core/testing';

import { NotVerifiedGuard } from './not-verified.guard';

describe('NotVerifiedGuard', () => {
  let guard: NotVerifiedGuard;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    guard = TestBed.inject(NotVerifiedGuard);
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });
});
