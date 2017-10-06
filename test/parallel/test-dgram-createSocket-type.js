'use strict';
const common = require('../common');
const assert = require('assert');
const dgram = require('dgram');
const invalidTypes = [
  'test',
  ['udp4'],
  new String('udp4'),
  1,
  {},
  true,
  false,
  null,
  undefined
];
const validTypes = [
  'udp4',
  'udp6',
  { type: 'udp4' },
  { type: 'udp6' }
];

// Error must be thrown with invalid types
invalidTypes.forEach((invalidType) => {
  const errMessage = `Bad socket type (${invalidType}) specified. Valid types are: udp4, udp6`;
  assert.throws(() => {
    dgram.createSocket(invalidType);
  }, common.expectsError({
    code: 'ERR_SOCKET_BAD_TYPE',
    type: TypeError,
    message: errMessage
  }));
});

// Error must not be thrown with valid types
validTypes.forEach((validType) => {
  assert.doesNotThrow(() => {
    const socket = dgram.createSocket(validType);
    socket.close();
  });
});

// Ensure buffer sizes can be set
{
  const socket = dgram.createSocket({
    type: 'udp4',
    recvBufferSize: 10000,
    sendBufferSize: 15000
  });

  socket.bind(common.mustCall(() => {
    // note: linux will double the buffer size
    const goodRecvBufferSize = 10000;
    const goodLinuxRecvBufferSize = 20000;
    assert.ok(socket.getRecvBufferSize() === goodRecvBufferSize ||
              socket.getRecvBufferSize() === goodLinuxRecvBufferSize,
              `SO_RCVBUF is ${socket.getRecvBufferSize()}, but should be ${goodRecvBufferSize} or ${goodLinuxRecvBufferSize}`);
    const goodSendBufferSize = 15000;
    const goodLinuxSendBufferSize = 30000;
    assert.ok(socket.getSendBufferSize() === goodSendBufferSize ||
              socket.getSendBufferSize() === goodLinuxSendBufferSize,
              `SO_SNDBUF is ${socket.getSendBufferSize()}, , but should be ${goodSendBufferSize} or ${goodLinuxSendBufferSize}`);
    socket.close();
  }));
}
