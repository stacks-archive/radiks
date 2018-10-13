import './setup';
import { fakeModel, TestModel } from './helpers';

describe('Model', () => {
  test('encrypts data', async (t) => {
    crypto.getRandomValues(16);
    const model = fakeModel();
    const encrypted = await model.encrypted();
    expect(encrypted.name).toEqual(model.attrs.name);
    expect(encrypted.description).not.toEqual(model.attrs.description);
    expect(encrypted.tags).not.toEqual(model.attrs.tags);
    expect(encrypted.metadata).not.toEqual(model.attrs.metadata);
    expect(encrypted.number).not.toEqual(model.attrs.number);
    t();
  });

  test('decrypts data', async (t) => {
    const model = fakeModel();
    const encrypted = await model.encrypted();
    const decrypted = new model.constructor(encrypted);
    await decrypted.decrypt();
    expect(decrypted.attrs.name).toEqual(model.attrs.name);
    expect(decrypted.attrs.metadata).toEqual(model.attrs.metadata);
    expect(decrypted.attrs.description).toEqual(model.attrs.description);
    expect(decrypted.attrs.tags).toEqual(model.attrs.tags);
    expect(decrypted.attrs.number).toEqual(model.attrs.number);
    t();
  });

  describe('save', () => {
    test('saves to couchdb', async (t) => {
      const model = fakeModel();
      await model.save();
      const doc = await TestModel.db().get(model.id);
      expect(doc.name).toEqual(model.attrs.name);
      expect(doc.description).not.toEqual(model.attrs.description);
      t();
    });
  });
});
