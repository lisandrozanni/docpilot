import { env } from '../lib/env.js';
import * as real from './s3.real.js';
import * as mock from './s3.mock.js';

const impl = env.MOCK_EXTERNAL_SERVICES ? mock : real;

export const buildS3Key = impl.buildS3Key;
export const createPresignedUploadUrl = impl.createPresignedUploadUrl;
export const downloadObject = impl.downloadObject;
export const objectExists = impl.objectExists;
