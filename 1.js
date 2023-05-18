const backend = require('backend');

const ADDRESS = backend.ADDRESS;
const PROXY = backend.PROXY;
const DIRECT_WRITE = backend.SUPPORT.DIRECT_WRITE;

const SUCCESS = backend.RESULT.SUCCESS;
const HANDSHAKE = backend.RESULT.HANDSHAKE;
const DIRECT = backend.RESULT.DIRECT;

let flags = {};
const kHttpHeaderSent = 1;
const kHttpHeaderRecived = 2;

function wa_on_flags_cb(session) {
  return DIRECT_WRITE;
}

function wa_on_handshake_cb(session) {
  const uuid = session.uuid;

  if (flags[uuid] == kHttpHeaderRecived) {
    return true;
  }

  if (flags[uuid] !== kHttpHeaderSent) {
    const host = session.address.host;
    const port = session.address.port;
    const res = `CONNECT ${host}:${port}HTTP/1.1\r\n` +
                `Host: 153.3.236.22:443\r\n` +
                `User-Agent: Mozilla/5.0 (Linux; Android 12; RMX3300 Build/SKQ1.211019.001; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/97.0.4692.98 Mobile Safari/537.36 T7/13.32 SP-engine/2.70.0 baiduboxapp/13.32.0.10 (Baidu; P1 12) NABar/1.0\r\n` +
                `Proxy-Connection: Keep-Alive\r\n` +
                `X-T5-Auth: 683556433\r\n\r\n`;
    backend.write(session, res);
    flags[uuid] = kHttpHeaderSent;
  }

  return false;
}

function wa_on_read_cb(session, data) {
  const uuid = session.uuid;

  if (flags[uuid] == kHttpHeaderSent) {
    flags[uuid] = kHttpHeaderRecived;
    return [HANDSHAKE, null];
  }

  return [DIRECT, data];
}

function wa_on_write_cb(session, data) {
  return [DIRECT, data];
}

function wa_on_close_cb(session) {
  const uuid = session.uuid;
  flags[uuid] = null;
  backend.free(session);
  return SUCCESS;
}

module.exports = {
  wa_on_flags_cb,
  wa_on_handshake_cb,
  wa_on_read_cb,
  wa_on_write_cb,
  wa_on_close_cb
};
