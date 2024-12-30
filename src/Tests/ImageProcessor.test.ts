import { ImageProcessor } from "../SpotCheckPullRequest/ImageProcessor";
import path from 'node:path';

describe('ImageProcessor', () => {
  test('Load image by relative path', async () => {
    const processor = new ImageProcessor();
    const image = await processor.parseImage('../Tests/images/tux-8bit.png');
    expect(image.width).toBe(386);
    expect(image.height).toBe(395);
  });

  test('Load image by absolute path', async () => {
    const processor = new ImageProcessor();
    const image = await processor.parseImage(path.join(__dirname, '/images/tux-8bit.png'));
    expect(image.width).toBe(386);
    expect(image.height).toBe(395);
  });

  test('Load 16-bit image', async () => {
    const processor = new ImageProcessor();
    const image = await processor.parseImage('../Tests/images/tux-16bit.png');
    expect(image.width).toBe(386);
    expect(image.height).toBe(395);
  });

  test('Compare 8-bit and 16-bit image', async () => {
    const processor = new ImageProcessor();
    const { percentage, testFailed } = await processor.compareImage(
        '../Tests/images/tux-8bit.png',
        '../Tests/images/tux-16bit.png',
        '../Tests/images/tux-diff.png',
        0);
    expect(testFailed).toBe(false);
    expect(percentage).toBe(0);
  });

  test('Compare different image adhering threshold', async () => {
    const processor = new ImageProcessor();
    const { percentage, testFailed } = await processor.compareImage(
        '../Tests/images/tux-16bit.png',
        '../Tests/images/tux-16bit-eye.png',
        '../Tests/images/tux-16bit-eye-diff.png',
        .2);
    expect(testFailed).toBe(false);
    expect(percentage).toBeLessThanOrEqual(.2);
  });

  test('Compare different image exceeding threshold', async () => {
    const processor = new ImageProcessor();
    const { percentage, testFailed } = await processor.compareImage(
        '../Tests/images/tux-16bit.png',
        '../Tests/images/tux-16bit-eye.png',
        '../Tests/images/tux-16bit-eye-diff.png',
        .1);
    expect(testFailed).toBe(true);
    expect(percentage).toBeGreaterThanOrEqual(.1);
  });

})