import { Module } from "@nestjs/common";
import { AWSClient } from "./aws.client";
import { S3Service } from "./s3.service";

@Module({
  providers: [
    AWSClient,
    S3Service
  ],
  exports: [
    AWSClient,
    S3Service
  ],
})
export class AwsModule { }
