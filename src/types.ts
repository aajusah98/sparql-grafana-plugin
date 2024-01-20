import { DataSourceJsonData } from '@grafana/data';
import { DataQuery } from '@grafana/schema';

// Define the structure of a query for your data source
export interface MyQuery extends DataQuery {
  rdfQuery: string;
  Format: Format;
}

// Define an enum for visualization format in the Query Editor
export enum Format {
  Table = 'table'
}

// Define a type for the visualization format
export type FormatInterface = {
  [key in Format]: string;
};

/**
 * These are options configured for each DataSource instance
 */
export interface MyDataSourceOptions extends DataSourceJsonData {
  url: string;
  Repository?: string;
  username?: string;
}

// Define secure options that are not sent over HTTP to the frontend
export interface MySecureDataSourceOptions {
  password?: string;
}
