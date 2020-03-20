import './mocks/crypto';
import { find } from '../src/api';
import { configure } from '../src/config';
import fetchMock from 'fetch-mock';

test('it can query with $or', async t => {
  configure({ apiServer: 'http://localhost' });
  fetchMock.mock('*', { results: [] });
  await find({
    $or: [{ name: { $regex: 'abc' } }, { age: { $lt: 5 } }],
  });
  expect(fetchMock.lastUrl()).toEqual(
    'http://localhost/radiks/models/find?$or[0][name][$regex]=abc&$or[1][age][$lt]=5'
  );
  t();
});
