import { DataSource, DataSourceOptions } from "typeorm";
import { mysqlConfig } from "./mysql";

export async function testConnection() {
  const datasource = new DataSource(mysqlConfig as DataSourceOptions);

  try {
    await datasource.initialize();
    console.log("MySQL 연결 성공");
  } catch (error) {
    console.error("MySQL 연결 실패: ", error.message);
  }
}