import * as http from 'http';

function request(url: string) {
  return new Promise<string>((resolve) => {
    http.get(url, (response) => {
      let body = '';

      response.on('data', (chunk) => (body += chunk));
      response.on('end', () => resolve(body));
    });
  });
}

afterAll((done: jest.DoneCallback) => {
  request('http://localhost:4200/stop').then(done);
});

describe('SelectSnapshot server-side rendering', () => {
  it('should render counter state', async () => {
    // Arrange & act
    const body = await request('http://localhost:4200');

    // Assert
    expect(body.indexOf('Server-side rendered counter state is:')).toBeGreaterThan(-1);
    expect(body.indexOf('"counter": 0')).toBeGreaterThan(-1);
  });
});
