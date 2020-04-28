function generateEvent() {
  return {
    body: `[${new Date().toISOString()}] This is a simple test`
  };
}

module.exports = {
  generateEvent
};