// Query Editor UI design 
import React, { PureComponent } from 'react';
import { Parser as SparqlParser } from 'sparqljs';
import { QueryEditorProps } from '@grafana/data';
import { CodeEditor, Button, Icon } from '@grafana/ui'; 
import { DataSource } from 'datasource'; // Assuming 'datasource' is the actual path to your datasource module
import { MyDataSourceOptions, MyQuery } from 'types';

type Props = QueryEditorProps<DataSource, MyQuery, MyDataSourceOptions>;

interface State {
  validationMessage: string; // Add type definition
}

// QueryEditor component definition
export class QueryEditor extends PureComponent<Props, State > {
  state: State = {
    validationMessage: '',
  };

  
  // Event handler QueryChange is used for update RDF query in the component state
  onRdfQueryChange = (value: string | undefined) => {
    const { onChange, query } = this.props;
    onChange({ ...query, rdfQuery: value || '' });
  };
  
  // New method for handling SPARQL query validation
  validateSparqlQuery = () => {
    const { query, onRunQuery } = this.props;
    console.log("Validating SPARQL query:", query.rdfQuery);
    this.setState({ validationMessage: '' }); 

    if (!query?.rdfQuery?.trim()) {
      // If query is empty, update message and don't proceed further
      this.setState({ validationMessage: 'SPARQL query is empty. Please provide a query.' });
      return;
  }
    
    try {
      const parser = new SparqlParser();
      parser.parse(query.rdfQuery.trim());
      const parsedQuery = parser.parse(query.rdfQuery.trim());

      // Assuming isValidStructure properly checks the parsed query structure
      if (isValidStructure(parsedQuery)) {
          // Query is structurally valid
          this.setState({ validationMessage: 'SPARQL query is valid!' });
          onRunQuery(); // Consider moving this outside if you only want to validate without executing
      } else {
          // Query structure is invalid 
          this.setState({ validationMessage: 'SPARQL query has an invalid structure. Please provide a valid query.' });
      }

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      this.setState({ validationMessage: `SPARQL query is not valid. ${errorMessage}` });
    }
    // Define isValidStructure according to your actual validation requirements
      function isValidStructure(parsedQuery: any): boolean {
      // For example, checking if it's a SELECT query
      return parsedQuery.queryType === 'SELECT';
      }
      onRunQuery();
  };

  render() {
    const { query } = this.props;
    const { validationMessage } = this.state;

    return (
      <div>
         {/* Validation Button */}
         <Button variant="primary" onClick={this.validateSparqlQuery}>
          <Icon name="check" /> Validate SPARQL Query
        </Button>

        {/* Display the validation message */}
        {validationMessage && (
          <div style={{ marginTop: '10px', color: validationMessage.includes('not valid') ? 'red' : 'green' }}>
            {validationMessage}
          </div>
        )}
        <CodeEditor
          height={'240px'}
          onEditorDidMount={(editor) => {
            editor.onDidChangeModelContent(() => {
              this.onRdfQueryChange(editor.getValue());
            });
          }}
          monacoOptions={{ minimap: { enabled: false }, automaticLayout: true }}
          value={query.rdfQuery || ''}
          language={'sparql'}
        />

       
      </div>
    );
  }
}
