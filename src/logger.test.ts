import bunyan from 'bunyan';

describe('Given a log function', () => {
  test('When the log is defined, then it should be an instance of bunyan', async () => {
    const log = (await import('./logger')).default;
    expect(log).toBeInstanceOf(bunyan);
  });
});
