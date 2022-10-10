import * as AWS from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk'
import { createLogger } from '../utils/logger'

const XAWS = AWSXRay.captureAWS(AWS)

// TODO: Implement the fileStogare logic

const logger = createLogger('TodosAccess')


export class AttachmentUtils {

    constructor(
        private s3 = new XAWS.S3({ signatureVersion: 'v4' }),
        private attachmentS3Bucket = process.env.ATTACHMENT_S3_BUCKET,
        private signedURLExpiration = process.env.SIGNED_URL_EXPIRATION
    ) {

    }

    async getSignedUrl(bucketKey: string): Promise<string> {
        logger.info(`Generating signed URL. Bucket: ${this.attachmentS3Bucket}, Key: ${bucketKey}`)
        return this.s3.getSignedUrl('putObject', {
            Bucket: this.attachmentS3Bucket,
            Expires: Number(this.signedURLExpiration),
            Key: bucketKey,
        })
    }

    async deleteItemAttachment(bucketKey: string): Promise<void> {
        logger.info(`Deleting attachment with key: ${bucketKey}`)
        await this.s3.deleteObject({
          Bucket: this.attachmentS3Bucket,
          Key: bucketKey
        }).promise()
    }

}