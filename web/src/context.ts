import tunnel from 'tunnel-rat';

export abstract class GlobalTunnel {
  static Canvas = tunnel();
}
