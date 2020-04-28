function generateEvent(size) {
  const buf = Buffer.alloc(size);
  buf.fill(new Date().toISOString());
  return {
    body: buf.toString()
  };
}

module.exports = {
  generateEvent
};