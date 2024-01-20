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

export class DataSource extends DataSourceWithBackend<MyQuery, MyDataSourceOptions> {
  constructor(instanceSettings: DataSourceInstanceSettings<MyDataSourceOptions>) {
    super(instanceSettings);
  }

  applyTemplateVariables(query: MyQuery, scopedVars: ScopedVars): Record<string, any> {
    const evaluatedRDFQuery = getTemplateSrv().replace(query.rdfQuery, scopedVars);
    return {
      ...query,
      rdfQuery: evaluatedRDFQuery,
    };
  }

  async metricFindQuery(query: MyQuery, options: any): Promise<MetricFindValue[]> {
    const evaluatedQuery = this.applyTemplateVariables(query, options.scopedVars);

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
      res = await this.query(request).toPromise();
    } catch (err) {
      return Promise.reject(err);
    }

    if (!res || !res.data || res.data.length < 0) {
      return [];
    }

    const dataFrame = res.data[0] as DataFrame;
    if (!dataFrame || dataFrame.fields.length < 0) {
      return [];
    }

    const field = dataFrame.fields[0].name;
    const view = new DataFrameView(dataFrame);

    return view.map((item) => {
      return {
        text: item[field],
      };
    });
  }
}
