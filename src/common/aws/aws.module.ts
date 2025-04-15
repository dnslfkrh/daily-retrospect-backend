import { Module } from "@nestjs/common";
import { AWSClient } from "src/common/aws/aws.client";

@Module({
  providers: [
    AWSClient
  ],
  exports: [
    AWSClient
  ],
})
export class AwsModule { }
