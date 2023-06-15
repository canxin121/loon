const http = require('http');
const backend = require('backend');

const char = String.fromCharCode;
const byte = (c) => c.charCodeAt(0);
const find = (str, sub) => str.indexOf(sub);
const sub = (str, start, end) => str.substring(start, end);

const ADDRESS = backend.ADDRESS;
const PROXY = backend.PROXY;
const DIRECT_WRITE = backend.SUPPORT.DIRECT_WRITE;

const SUCCESS = backend.RESULT.SUCCESS;
const HANDSHAKE = backend.RESULT.HANDSHAKE;
const DIRECT = backend.RESULT.DIRECT;

const ctx_uuid = backend.get_uuid;
const ctx_proxy_type = backend.get_proxy_type;
const ctx_address_type = backend.get_address_type;
const ctx_address_host = backend.get_address_host;
const ctx_address_bytes = backend.get_address_bytes;
const ctx_address_port = backend.get_address_port;
const ctx_write = backend.write;
const ctx_free = backend.free;
const ctx_debug = backend.debug;

const is_http_request = http.is_http_request;

const flags = {};
const marks = {};
const kHttpHeaderSent = 1;
const kHttpHeaderRecived = 2;

function wa_lua_on_flags_cb(ctx) {
    return 0;
}

function wa_lua_on_handshake_cb(ctx) {
    const uuid = ctx_uuid(ctx);

    if (flags[uuid] === kHttpHeaderRecived) {
        return true;
    }

    let res = null;

    if (flags[uuid] !== kHttpHeaderSent) {
        const host = ctx_address_host(ctx);
        const port = ctx_address_port(ctx);

        res = 'CONNECT ' + host + ':' + port + '@gw.alicdn.com:80 HTTP/1.1\r\n' +
            'Host: gw.alicdn.com m:80\r\n' +
            'Proxy-Connection: Keep-Alive\r\n' +
            'X-T5-Auth: YTY0Nzlk\r\n' +
            'User-Agent: baiduboxapp\r\n\r\n';

        ctx_write(ctx, res);
        flags[uuid] = kHttpHeaderSent;
    }

    return false;
}

function wa_lua_on_read_cb(ctx, buf) {
    const uuid = ctx_uuid(ctx);
    if (flags[uuid] === kHttpHeaderSent) {
        flags[uuid] = kHttpHeaderRecived;
        return HANDSHAKE, null;
    }

    return DIRECT, buf;
}

function wa_lua_on_write_cb(ctx, buf) {
    const host = ctx_address_host(ctx);
    const port = ctx_address_port(ctx);

    if (is_http_request(buf) === 1) {
        const index = find(buf, '/');
        const method = sub(buf, 0, index - 1);
        const rest = sub(buf, index);
        const [unused, e] = [rest.indexOf('\r\n'), rest.search(/\r\n/)];

        const less = sub(rest, e + 1);
        const [ignored, e1] = [less.indexOf('\r\n'), less.search(/\r\n/)];

        buf = method + sub(rest, 0, e) +
            // 'X-Online-Host:\t\t ' + host + '\r\n' +
            '\tHost: tms.dingtalk.com:80\r\n' +
            'X-T5-Auth: YTY0Nzlk\r\n' +
            sub(rest, e + 1);
    }

    return DIRECT, buf;
}

function wa_lua_on_close_cb(ctx) {
    const uuid = ctx_uuid(ctx);
    flags[uuid] = null;
    ctx_free(ctx);
    return SUCCESS;
}
