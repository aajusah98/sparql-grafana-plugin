// UI design 
import React, { PureComponent } from 'react';
import { CodeEditor, InlineFieldRow, InlineFormLabel, Select } from '@grafana/ui';
import { QueryEditorProps, SelectableValue } from '@grafana/data';
import { DataSource } from 'datasource';
import { MyDataSourceOptions, MyQuery, Format } from 'types';

type Props = QueryEditorProps<DataSource, MyQuery, MyDataSourceOptions>;

const Formats = [
  {
    label: 'Table',
    value: Format.Table,
    description: 'Table View',
  }
] as Array<SelectableValue<Format>>;

export class QueryEditor extends PureComponent<Props> {
  onRdfQueryChange = (value: string | undefined) => {
    const { onChange, query } = this.props;
    onChange({ ...query, rdfQuery: value || '' });
  };

  onFormatChanged = (selected: SelectableValue<Format>) => {
    const { onChange, query, onRunQuery } = this.props;
    onChange({ ...query, Format: selected.value || Format.Table });
    onRunQuery();
  };
   // node graph format (no need in this)        
 // resolveFormat = (value: string | undefined) => {
 //   if (value === Format.NodeGraph) {
 //     return Formats[1];
 //   
 //    return Formats[0];
 //  };

  render() {
    return (
      <div>
        <CodeEditor height={"240px"} onEditorDidMount={(editor) => {editor.onDidChangeModelContent(() => {this.onRdfQueryChange(editor.getValue());});}}monacoOptions={{ minimap: { enabled: false }, automaticLayout: true }}value={this.props.query.rdfQuery || ''}language={'sparql'} // Set the language to SPARQL
        />
          <InlineFieldRow>
          <InlineFormLabel width={5}>Format</InlineFormLabel>
          <Select
            className="width-14"
            //value={this.resolveFormat(this.props.query.Format)}
            options={Formats}
            defaultValue={Formats[0]}
            onChange={this.onFormatChanged}
            width="auto"
          />
        </InlineFieldRow>
      </div>
    );
  }
}
