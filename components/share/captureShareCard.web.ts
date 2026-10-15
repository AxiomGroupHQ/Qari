// @ai-generated
import {ImageFormat, type CanvasRef} from '@shopify/react-native-skia';

/** Web has no file system cache; returns the PNG as a data URL. */
export async function captureShareCard(
  canvasRef: React.RefObject<CanvasRef | null>,
): Promise<string> {
  const image = canvasRef.current?.makeImageSnapshot();
  if (!image) throw new Error('Failed to capture share card image');
  return `data:image/png;base64,${image.encodeToBase64(ImageFormat.PNG, 100)}`;
}
