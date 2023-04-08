import * as http from 'http';

function request(url: string) {
  return new Promise<string>(resolve => {
    http.get(url, response => {
      let body = '';

      response.on('data', chunk => (body += chunk));
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
    expect(body.indexOf('app-progress')).toBeGreaterThan(-1);
    expect(body.indexOf('class="ivy-enabled"')).toBeGreaterThan(-1);
    expect(body.indexOf('style="width:0%;"')).toBeGreaterThan(-1);
  });
});
