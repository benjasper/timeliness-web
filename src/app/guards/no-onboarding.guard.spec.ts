import { TestBed } from '@angular/core/testing';

import { NoOnboardingGuard } from './no-onboarding.guard';

describe('NoOnboardingGuard', () => {
  let guard: NoOnboardingGuard;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    guard = TestBed.inject(NoOnboardingGuard);
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });
});
