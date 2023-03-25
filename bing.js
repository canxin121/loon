const reqHeaders = $request.headers;

reqHeaders['x-forwarded-for'] = '1.1.1.1';

delete reqHeaders["user-agent"];
delete reqHeaders["sec-ch-ua-full-version"];
delete reqHeaders["sec-ch-ua-full-version-list"];
let userAgent = 'iPhone';

reqHeaders['User-Agent'] = `Mozilla/5.0 (${userAgent}; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/110.0.0.0 Safari/537.36 Edg/110.0.1587.41`;
reqHeaders['sec-ch-ua'] = '"Chromium";v="110", "Not A(Brand";v="24", "Microsoft Edge";v="110"'
reqHeaders['sec-ch-ua-mobile'] = '?0'
reqHeaders['sec-ch-ua-platform'] = 'macOS'

$done({ headers: reqHeaders });
