function generateEvent() {
  const buf = Buffer.alloc(1024);
  buf.fill(new Date().toISOString());
  return {
    body: buf.toString()
  };
}

module.exports = {
  generateEvent
};