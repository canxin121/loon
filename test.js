let HTTP_STATUS_INVALID = -1
let HTTP_STATUS_CONNECTED = 0
let HTTP_STATUS_WAITRESPONSE = 1
let HTTP_STATUS_FORWARDING = 2
var httpStatus = HTTP_STATUS_INVALID

function tunnelDidConnected() {
    console.log($session)
    if ($session.proxy.isTLS) {
        //https
    } else {
        //http
        _writeHttpHeader()
        httpStatus = HTTP_STATUS_CONNECTED
    }
    return true
}

function tunnelTLSFinished() {
    _writeHttpHeader()
    httpStatus = HTTP_STATUS_CONNECTED
    return true
}

function tunnelDidRead(data) {
    if (httpStatus == HTTP_STATUS_WAITRESPONSE) {
        //check http response code == 200
        //Assume success here
        console.log("http handshake success")
        httpStatus = HTTP_STATUS_FORWARDING
        $tunnel.established($session)//可以进行数据转发
        return null//不将读取到的数据转发到客户端
    } else if (httpStatus == HTTP_STATUS_FORWARDING) {
        return data
    }
}

function tunnelDidWrite() {
    if (httpStatus == HTTP_STATUS_CONNECTED) {
        console.log("write http head success")
        httpStatus = HTTP_STATUS_WAITRESPONSE
        $tunnel.readTo($session, "\x0D\x0A\x0D\x0A")//读取远端数据直到出现\r\n\r\n
        return false //中断wirte callback
    }
    return true
}

function tunnelDidClose() {
    return true
}

//Tools
function _writeHttpHeader() {
    let conHost = $session.conHost
    let conPort = $session.conPort

    var header = `CONNECT ${conHost}:${conPort}@gw.alicdn.com:80 HTTP/1.1\r\nHost: gw.alicdn.com m:80\r\nConnection: keep-alive\r\nUser-Agent: Mozilla/5.0 (iPhone; CPU iPhone OS 15_4_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.4 Mobile/15E148 Safari/604.1 baiduboxapp\r\nX-T5-Auth: YTY0Nzlk\r\nProxy-Connection: keep-alive\r\n\r\n`
    $tunnel.write($session, header)
}
