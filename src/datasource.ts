import {
  DataSourceInstanceSettings,
  DataFrameView,
  DataQueryResponse,
  MetricFindValue,
  DataFrame,
  DataQueryRequest,
  ScopedVars,
} from '@grafana/data';
import { DataSourceWithBackend, getTemplateSrv } from '@grafana/runtime';
import { MyDataSourceOptions, MyQuery } from './types';

// Define the DataSource class, extending DataSourceWithBackend
// Constructor to initialize the data source instance
// Call the constructor of the base class with the instance settings

export class DataSource extends DataSourceWithBackend<MyQuery, MyDataSourceOptions> {
  constructor(instanceSettings: DataSourceInstanceSettings<MyDataSourceOptions>) {
    super(instanceSettings);
  }
//method to apply template variables to the query's rdfQuery property using Grafana's template service.
// template helps to annotations for data in queries
  applyTemplateVariables(query: MyQuery, scopedVars: ScopedVars): Record<string, any> {
    const evaluatedRDFQuery = getTemplateSrv().replace(query.rdfQuery, scopedVars);
    return {
      ...query,
      rdfQuery: evaluatedRDFQuery,
    };
  }

   // Asynchronous method to execute metric find queries
   async metricFindQuery(query: MyQuery, options: any): Promise<MetricFindValue[]> {
    // Apply template variables to the query
    const evaluatedQuery = this.applyTemplateVariables(query, options.scopedVars);

    // Construct a data query request
    const request = {
      targets: [
        {
          ...evaluatedQuery,
          refId: 'metricFindQuery',
        },
      ],
      range: options.range,
      rangeRaw: options.rangeRaw,
    } as DataQueryRequest<MyQuery>;


    let res: DataQueryResponse | undefined;

    try {
      // Execute the query and convert the observable result to a promise
      res = await this.query(request).toPromise();
    } catch (err) {
      // Handle errors by rejecting the promise with the error
      return Promise.reject(err);
    }

    // Check if the response is valid and contains data
    if (!res || !res.data || res.data.length < 0) {
      return [];
    }

    // Extract the first data frame from the response
    const dataFrame = res.data[0] as DataFrame;

    // Check if the data frame is valid and contains fields
    if (!dataFrame || dataFrame.fields.length < 0) {
      return [];
    }

    // Extract the field name from the data frame
    const field = dataFrame.fields[0].name;

    // Create a view for the data frame
    const view = new DataFrameView(dataFrame);

    // Map the data and return as an array of MetricFindValue
    return view.map((item) => {
      return {
        text: item[field],
      };
    });
  }
}
