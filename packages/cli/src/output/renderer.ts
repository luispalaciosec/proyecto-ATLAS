export class OutputRenderer {
  info(message: string): void {
    console.log(message);
  }

  error(message: string): void {
    console.error(message);
  }

  json(value: unknown): void {
    console.log(JSON.stringify(value, null, 2));
  }
}
