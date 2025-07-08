import { ImageProcessor } from "../SpotCheckV0/ImageProcessor";
import path from 'node:path';
import fs from 'node:fs';
import { Mirror } from "./Mirror";

describe('ImageProcessor', () => {

  let imageBase: string = '';

  beforeAll(async () => {
    imageBase = await Mirror.createMirror('../Tests/images');
  });
  
  test('Load image by relative path', async () => {
    
    // Arrange
    const processor = new ImageProcessor(imageBase);

    // Act
    const image = await processor.parseImage('tux-8bit.png');

    // Assert
    expect(image.width).toBe(386);
    expect(image.height).toBe(395);
  });

  test('Load image by absolute path', async () => {

    // Arrange
    const processor = new ImageProcessor(imageBase);

    // Act
    const image = await processor.parseImage(path.join(__dirname, 'images/tux-8bit.png'));

    // Assert
    expect(image.width).toBe(386);
    expect(image.height).toBe(395);
  });

  test('Load 16-bit image', async () => {

    // Arrange
    const processor = new ImageProcessor(imageBase);

    // Act
    const image = await processor.parseImage('tux-16bit.png');

    // Assert
    expect(image.width).toBe(386);
    expect(image.height).toBe(395);
  });

  test('Compare 8-bit and 16-bit image', async () => {

    // Arrange
    const processor = new ImageProcessor(imageBase);

    // Act
    const { percentage, testFailed } = await processor.compareImage(
        'tux-8bit.png',
        'tux-16bit.png',
        'tux-diff.png',
        0);

    // Assert
    expect(testFailed).toBe(false);
    expect(percentage).toBe(0);
  });

  test.each([
    ['larger 8-bit'  , '8bit'          , '8bit-plus10px' ],
    ['larger 16-bit' , '16bit'         , '16bit-plus10px'],
    ['smaller 8-bit' , '8bit-plus10px' , '8bit'          ],
    ['smaller 16-bit', '16bit-plus10px', '16bit'         ],
  ])('Compare %s image', async (_, baseImage, compareImage) => {

    // Arrange
    const processor = new ImageProcessor(imageBase);

    // Act
    const { percentage, testFailed } = await processor.compareImage(
        `tux-${baseImage}.png`,
        `tux-${compareImage}.png`,
        'tux-diff.png',
        0);

    // Assert
    expect(testFailed).toBe(false);
    expect(percentage).toBe(0);
  });

  test('Compare different image adhering threshold', async () => {

    // Arrange
    const processor = new ImageProcessor(imageBase);

    // Act
    const { percentage, testFailed } = await processor.compareImage(
        'tux-16bit.png',
        'tux-16bit-eye.png',
        'tux-16bit-eye-diff.png',
        .2);

    // Assert
    expect(testFailed).toBe(false);
    expect(percentage).toBeLessThanOrEqual(.2);
  });

  test('Compare different image exceeding threshold', async () => {

    // Arrange
    const processor = new ImageProcessor(imageBase);

    // Adt
    const { percentage, testFailed } = await processor.compareImage(
        'tux-16bit.png',
        'tux-16bit-eye.png',
        'tux-16bit-eye-diff.png',
        .1);

    // Assert
    expect(testFailed).toBe(true);
    expect(percentage).toBeGreaterThanOrEqual(.1);
  });


  test('Compare with not found diff image', async () => {

    // Arrange
    const processor = new ImageProcessor(imageBase);

    // Adt
    const { percentage, testFailed } = await processor.compareImage(
        'tux-16bit.png',
        'tux-16bit-notfound.png',
        'tux-16bit-notfound-diff.png',
        .1);

    // Assert
    expect(testFailed).toBe(true);
    expect(percentage).toBe(1);
  });

  test('Log not found comparison image', async () => {

    // Arrange
    var errorMessage: string = undefined;
    const error = (message: string) => errorMessage = message;
    const processor = new ImageProcessor(imageBase, { info: () => {}, error });

    // Adt
    const { percentage, testFailed } = await processor.compareImage(
        'tux-16bit.png',
        'comparison-notfound.png',
        '',
        .1);

    // Assert
    expect(errorMessage).toContain('Failed to parse comparison image: comparison-notfound.png');
  });

  test('Log not found baseline image', async () => {

    // Arrange
    var errorMessage: string = undefined;
    const error = (message: string) => errorMessage = message;
    const processor = new ImageProcessor(imageBase, { info: () => {}, error });

    // Adt
    const { percentage, testFailed } = await processor.compareImage(
        'baseline-notfound.png',
        '',
        '',
        .1);

    // Assert
    expect(errorMessage).toContain('Failed to parse baseline image: baseline-notfound.png');
  });
})