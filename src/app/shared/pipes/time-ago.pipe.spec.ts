import { TimeAgoPipe } from './time-ago.pipe';

describe('DatePipe', () => {
  it('create an instance', () => {
    const pipe = new TimeAgoPipe();
    expect(pipe).toBeTruthy();
  });
});
