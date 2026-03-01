export class MockQueueService {
  async publish(exchange: string, routingKey: string, payload: unknown) { return Promise.resolve(); }
  async sendToQueue(queue: string, payload: unknown) { return Promise.resolve(); }
  async consume(queue: string, handler: Function) { return Promise.resolve(); }
  getChannel() { return { assertQueue: jest.fn(), assertExchange: jest.fn(), bindQueue: jest.fn(), consume: jest.fn() }; }
}
