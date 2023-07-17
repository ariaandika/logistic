// / <reference path="./schema/schema.d.ts"/>

export {}


declare global {
  type Result<T> =
    { success: true; data: T } |
    { success: false; error: Error };
}

// connection.query('INSERT INTO posts SET ?', {title: 'test'}, function (error, results, fields) {
//   if (error) throw error;
//   console.log(results.insertId);
// });