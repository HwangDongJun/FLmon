// GENERATED CODE -- DO NOT EDIT!

'use strict';
var grpc = require('grpc');
var FLmon_pb = require('./FLmon_pb.js');

function serialize_FLmonRequest(arg) {
  if (!(arg instanceof FLmon_pb.FLmonRequest)) {
    throw new Error('Expected argument of type FLmonRequest');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_FLmonRequest(buffer_arg) {
  return FLmon_pb.FLmonRequest.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_FLmonResponse(arg) {
  if (!(arg instanceof FLmon_pb.FLmonResponse)) {
    throw new Error('Expected argument of type FLmonResponse');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_FLmonResponse(buffer_arg) {
  return FLmon_pb.FLmonResponse.deserializeBinary(new Uint8Array(buffer_arg));
}


var FLmonService = exports.FLmonService = {
  transportFLmon: {
    path: '/FLmon/transportFLmon',
    requestStream: false,
    responseStream: false,
    requestType: FLmon_pb.FLmonRequest,
    responseType: FLmon_pb.FLmonResponse,
    requestSerialize: serialize_FLmonRequest,
    requestDeserialize: deserialize_FLmonRequest,
    responseSerialize: serialize_FLmonResponse,
    responseDeserialize: deserialize_FLmonResponse,
  },
};

exports.FLmonClient = grpc.makeGenericClientConstructor(FLmonService);
