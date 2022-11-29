/**
 * Represents a texture image source.
 */
export type ImageRepresentation = ImageBitmap | HTMLCanvasElement | ImageData | HTMLImageElement | HTMLVideoElement

/**
 * Constructs a texture. Useful for displaying and storing image data.
 */
export class Texture {
  /**
   * Flags the texture for update. Default is `true`.
   */
  public needsUpdate = true

  constructor(
    /**
     * An optional {@link ImageRepresentation} to set this texture to.
     */
    public image?: ImageRepresentation,
  ) {}

  /**
   * Disposes texture from GPU memory.
   */
  dispose(): void {
    // Implemented by renderer
  }
}
