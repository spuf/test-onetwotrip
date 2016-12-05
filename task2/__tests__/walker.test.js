describe('walker', () => {

  const walker = require('../src/walker');

  it('should walk 1x1', () => {
    const matrix = [
      [100]
    ];
    const expected = [100];
    expect(walker(matrix)).toEqual(expected);
  });

  it('should walk 3x3', () => {
    const matrix = [
      [1, 2, 3],
      [4, 5, 6],
      [7, 8, 9]
    ];
    const expected = [5, 4, 7, 8, 9, 6, 3, 2, 1];
    expect(walker(matrix)).toEqual(expected);
  });

  it('should walk 5x5', () => {
    const matrix = [
      [25, 24, 23, 22, 21],
      [10,  9,  8,  7, 20],
      [11,  2,  1,  6, 19],
      [12,  3,  4,  5, 18],
      [13, 14, 15, 16, 17]
    ];
    const expected = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25];
    expect(walker(matrix)).toEqual(expected);
  });

  it('should walk 7x7', () => {
    const matrix = [
      [49, 48, 47, 46, 45, 44, 43],
      [26, 25, 24, 23, 22, 21, 42],
      [27, 10,  9,  8,  7, 20, 41],
      [28, 11,  2,  1,  6, 19, 40],
      [29, 12,  3,  4,  5, 18, 39],
      [30, 13, 14, 15, 16, 17, 38],
      [31, 32, 33, 34, 35, 36, 37]
    ];
    const expected = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26,
      27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49];
    expect(walker(matrix)).toEqual(expected);
  });
});
