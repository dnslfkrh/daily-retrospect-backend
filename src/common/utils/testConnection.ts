import { DataSource, DataSourceOptions } from "typeorm";
import { Logger } from "@nestjs/common";
import { getMysqlConfig } from "../config/database/mysql";
import { ConfigService } from "@nestjs/config";

const logger = new Logger("TestConnection");

export async function testConnection() {
  const configService = new ConfigService();
  const mysqlConfig = await getMysqlConfig(configService);

  const datasource = new DataSource(mysqlConfig as DataSourceOptions);

  try {
    await datasource.initialize();
    logger.log("MySQL Connect Success");
  } catch (error) {
    logger.error("MySQL Connect Fail", error?.message);
  }
}