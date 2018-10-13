import './setup';
import { fakeModel } from './helpers';

describe('Model', () => {
  test('encrypts data', async (t) => {
    const model = fakeModel();
    const encrypted = await model.encrypted();
    expect(encrypted.name).toBe(model.attrs.name);
    expect(encrypted.description).not.toBe(model.attrs.description);
    expect(encrypted.tags).not.toBe(model.attrs.tags);
    expect(encrypted.metadata).not.toBe(model.attrs.metadata);
    expect(encrypted.number).not.toBe(model.attrs.number);
    t();
  });
});
