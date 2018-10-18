import crypto from 'crypto';

window.crypto = {
  getRandomValues: (buf) => {
    const bytes = crypto.randomBytes(buf.length);
    buf.set(bytes);
    return buf;
  },
};
