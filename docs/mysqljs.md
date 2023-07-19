# Mysqljs

## What insert into return ?

```ts
const result = conn.query('insert into ...')

result = {
  fieldCount: 0,
  affectedRows: 1,
  insertId: 0,
  info: '',
  serverStatus: 2,
  warningStatus: 0,
  changedRows: 0
}
```
