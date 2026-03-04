declare module 'gifenc' {
  interface GIFEncoderInstance {
    writeFrame(
      index: Uint8Array,
      width: number,
      height: number,
      opts?: {
        palette?: number[][];
        delay?: number;
        dispose?: number;
        transparent?: boolean;
        transparentIndex?: number;
      }
    ): void;
    finish(): void;
    bytesView(): Uint8Array;
    bytes(): Uint8Array;
    buffer: ArrayBuffer;
  }

  export function GIFEncoder(): GIFEncoderInstance;
  export function quantize(rgba: Uint8Array, maxColors: number, options?: { format?: string }): number[][];
  export function applyPalette(rgba: Uint8Array, palette: number[][], format?: string): Uint8Array;
  export function nearestColorIndex(palette: number[][], pixel: number[]): number;
  export function nearestColorIndexWithDistance(palette: number[][], pixel: number[]): [number, number];
  export function snapColorsToPalette(palette: number[][], knownColors: number[][], threshold?: number): void;
  export function prequantize(rgba: Uint8Array, options?: { roundRGB?: number; roundAlpha?: number; oneBitAlpha?: boolean | number }): void;
}
