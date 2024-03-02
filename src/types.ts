import { DataSourceJsonData } from '@grafana/data';
import { DataQuery } from '@grafana/schema';

// Define the structure of a query for your data source
export interface MyQuery extends DataQuery {
  rdfQuery: string;
}

// Define an enum for visualization format in the Query Editor
export enum Format {
  Table = 'table'
}


/**Interface DataSourceJsonData
 * It helps define the data  to configured for each DataSource instance
 */
export interface MyDataSourceOptions extends DataSourceJsonData {
  url: string;
  Repository?: string;
  username?: string;
}

// MysecureDataSource interface helps to secure data that are not sent over HTTP to the frontend
// helps to useful for handling sensitive information
export interface MySecureDataSourceOptions {
  password?: string;
}
