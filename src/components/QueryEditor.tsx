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
export class QueryEditor extends PureComponent<Props> {
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


    // Example: Check if the SPARQL query is not empty
    const isValid = query.rdfQuery.trim() !== '';

    // Set the validation message based on the validation result
    let validationMessage = isValid ? 'SPARQL query is valid!' : 'SPARQL query is not valid. Please provide a valid query.';

    
    // Parse the SPARQL query to check its structure 
    try {
  const parser = new SparqlParser();
  const parsedQuery = parser.parse(query.rdfQuery);

  // Check if the parsedQuery has a valid structure based on your requirements
  if (isValidStructure(parsedQuery)) {
    console.log('Parsed SPARQL query:', parsedQuery);

  } else {
    validationMessage = 'SPARQL query has an invalid structure. Please provide a valid query structure.';
  }
    }  catch (error) {
    console.error('Error parsing SPARQL query:', error);
    validationMessage = 'SPARQL query is not valid. Please provide a valid query.';
    }
     
    // Function to check the structure of the parsed query
    function isValidStructure(parsedQuery: any): boolean {
    
      const expectedStructure = 'select (?x as ?xString)(count(?y) as ?count){ ?x ?y ?z }';
      return parsedQuery.type === 'query' && parsedQuery.where === expectedStructure;
    }

     
    // Update the state with the validation message
    this.setState({ validationMessage });


    // Trigger a query run if needed
    if (isValid) {
      onRunQuery();
    }
  };

  render() {
    const { query } = this.props;
    const { validationMessage } = this.state;

    return (
      <div>
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
      </div>
    );
  }
}
