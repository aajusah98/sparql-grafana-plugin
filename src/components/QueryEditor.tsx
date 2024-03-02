// UI design 
import React, { PureComponent } from 'react';
import { CodeEditor } from '@grafana/ui';
import { QueryEditorProps } from '@grafana/data';
import { DataSource } from 'datasource'; // Assuming 'datasource' is the actual path to your datasource module
import { MyDataSourceOptions, MyQuery } from 'types';

type Props = QueryEditorProps<DataSource, MyQuery, MyDataSourceOptions>;

// QueryEditor component definition
export class QueryEditor extends PureComponent<Props> {
  // Event handler QueryChange is used for update RDF query in the component state
  onRdfQueryChange = (value: string | undefined) => {
    const { onChange, query } = this.props;
    onChange({ ...query, rdfQuery: value || '' });
  };

  render() {
    return (
      <div>
        {/* CodeEditor component for editing RDF queries */}
        <CodeEditor
          height={"240px"}
          onEditorDidMount={(editor) => {
            editor.onDidChangeModelContent(() => {
              this.onRdfQueryChange(editor.getValue());
            });
          }}
          monacoOptions={{ minimap: { enabled: false }, automaticLayout: true }}
          value={this.props.query.rdfQuery || ''}
          language={'sparql'} // Set the language to SPARQL
        />
      </div>
    );
  }
}
