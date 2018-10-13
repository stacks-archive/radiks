import crypto from 'crypto';

window.crypto = {
  getRandomValues: () => {
    const buf = Buffer.alloc(16);
    const bytes = crypto.randomBytes(16);
    buf.set(bytes);
    return buf;
  },
};
