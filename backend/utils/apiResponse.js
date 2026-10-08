const buildResponse = ({ success = true, message = '', data = null, meta = null }) => ({
  success,
  message,
  data,
  meta
});

module.exports = { buildResponse };
