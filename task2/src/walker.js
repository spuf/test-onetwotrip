/**
 * Walk the matrix on basic JS
 */
module.exports = function (matrix) {
  var center = Math.floor(matrix.length / 2), // matrix center
    x = center, // current position
    y = center,
    steps = 1, // amount of steps to move
    res = [], // result
    i;

  res.push(matrix[y][x]);
  while (steps < center * 2) {
    // move left 1 step
    x -= 1;
    res.push(matrix[y][x]);
    // move down
    for (i = 0; i < steps; i++) {
      y += 1;
      res.push(matrix[y][x]);
    }
    // add step
    steps += 1;
    // move right
    for (i = 0; i < steps; i++) {
      x += 1;
      res.push(matrix[y][x]);
    }
    // move top
    for (i = 0; i < steps; i++) {
      y -= 1;
      res.push(matrix[y][x]);
    }
    // move left
    for (i = 0; i < steps; i++) {
      x -= 1;
      res.push(matrix[y][x]);
    }
    // add step
    steps += 1;
  }
  return res;
};
