import { DataSource, DataSourceOptions } from "typeorm";
import { Logger } from "@nestjs/common";
import { getMysqlConfig } from "./mysql";

const logger = new Logger("TestConnection");

export async function testConnection() {
  const datasource = new DataSource(getMysqlConfig() as DataSourceOptions);

  try {
    await datasource.initialize();
    logger.log("MySQL Connect Success");
  } catch (error) {
    logger.error("MySQL Connect Fail", error?.message);
  }
}