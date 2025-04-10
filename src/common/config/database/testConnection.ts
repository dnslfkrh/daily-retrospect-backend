import { DataSource, DataSourceOptions } from "typeorm";
import { mysqlConfig } from "./mysql";
import { Logger } from "@nestjs/common";

const logger = new Logger("TestConnection");

export async function testConnection() {
  const datasource = new DataSource(mysqlConfig as DataSourceOptions);

  try {
    await datasource.initialize();
    logger.log("MySQL Connect Success");
  } catch (error) {
    logger.error("MySQL Connect Fail", error?.message);
  }
}