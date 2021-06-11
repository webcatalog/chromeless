/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/. */

const browser = window.browser || window.chrome;

// fix Google prevents signing in because of security concerns
// https://github.com/webcatalog/webcatalog-app/issues/455
// https://github.com/meetfranz/franz/issues/1720#issuecomment-566460763
browser.webRequest.onBeforeSendHeaders.addListener((details) => {
  const { requestHeaders } = details;
  const blockingResponse = {};

  for (let i = 0, l = requestHeaders.length; i < l; i += 1) {
    if (requestHeaders[i].name === 'User-Agent') {
      requestHeaders[i].value = `${requestHeaders[i].value} Edge/18.18875`;
      break;
    }
  }

  blockingResponse.requestHeaders = requestHeaders;
  return blockingResponse;
}, {
  urls: [ "https://accounts.google.com/*" ]
}, ['requestHeaders', 'blocking']);
