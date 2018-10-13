
import Model from '../src/model';
// import './setup';

export class TestModel extends Model {
  static schema = {
    name: {
      type: String,
      decrypted: true,
    },
    metadata: Object,
    tags: Array,
    number: Number,
    description: String,
  }
}

export const fakeModel = () => {
  const name = 'tester';
  const metadata = { a: 1 };
  const tags = ['tags'];
  const number = 4;
  const description = 'asdf';
  const model = new TestModel({
    name,
    metadata,
    tags,
    number,
    description,
  });
  return model;
};
