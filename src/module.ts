import { DataSourcePlugin } from '@grafana/data';
import { DataSource } from './datasource';
import { ConfigEditor } from './components/ConfigEditor';
import { QueryEditor } from './components/QueryEditor';
import { MyQuery, MyDataSourceOptions } from './types';

// entrypoint for SparQL plugin
// Create a new DataSourcePlugin instance with specific type 
//which specifying the types for the data source, query, and data source options.

export const plugin = new DataSourcePlugin<DataSource, MyQuery, MyDataSourceOptions>(DataSource)
  // Create ConfigEditor component for configuring the data source plugin
  .setConfigEditor(ConfigEditor)
  // Create QueryEditor component responsible for defining and editing queries
  .setQueryEditor(QueryEditor);
