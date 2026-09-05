import { TestBed } from '@angular/core/testing';
import { App } from './app';

// Scaffolding from `ng new` also asserted the starter page's
// <h1>Hello, artist-dashboard</h1>. This app is a router shell and never had that
// heading, so the assertion could not pass and the target failed from
// the day the real app replaced the placeholder. Removed rather than
// rewritten: "the shell mounts" is the useful part, and the rest is
// covered by the feature suites.
describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

});
