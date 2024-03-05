// Import necessary modules from React, Grafana SDK, and other dependencies.
import React, { PureComponent } from 'react';
import { Parser as SparqlParser } from 'sparqljs';
import { QueryEditorProps } from '@grafana/data';
import { CodeEditor, Button, Icon } from '@grafana/ui';
// Assuming 'DataSource', 'MyDataSourceOptions', and 'MyQuery' types are defined in a 'types' module.
import { DataSource } from 'datasource';
import { MyDataSourceOptions, MyQuery } from 'types';

/**
 * Type definitions for the props expected by QueryEditor component.
 */

type Props = QueryEditorProps<DataSource, MyQuery, MyDataSourceOptions>;

/**
 * Type definitions for the state of QueryEditor component.
 */

interface State {
  validationMessage: string; // Add type definition
}

/**
 * QueryEditor component for editing and validating SPARQL queries.
 * This component provides a code editor for users to write SPARQL queries,
 * a button to validate these queries, and displays validation messages.
 */
export class QueryEditor extends PureComponent<Props, State > {
  state: State = {
    validationMessage: '',
  };

   /**
   * Updates the RDF query in the component's state when the user changes the content in the code editor.
   * @param value The updated query text from the editor.
   */
    onRdfQueryChange = (value: string | undefined) => {
      const { onChange, query } = this.props;
      onChange({ ...query, rdfQuery: value || '' });
    };
  
  /**
   * Validates the SPARQL query for syntax and structure.
   * Updates the component state with a validation message based on the query's validity.
   */
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

      // The isValidStructure function needs to be defined to check the structure of the parsed query.
      if (isValidStructure(parsedQuery)) {
          this.setState({ validationMessage: 'SPARQL query is valid!' });
        // Trigger the query execution callback if the query is valid.
          onRunQuery(); 
      } else {
          // Query structure is invalid 
          this.setState({ validationMessage: 'SPARQL query has an invalid structure. Please provide a valid query.' });
      }

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      this.setState({ validationMessage: `SPARQL query is not valid. ${errorMessage}` });
    }
    
    /**
 * Placeholder function for validating the structure of the parsed SPARQL query.
 * This should be replaced with actual validation logic according to specific requirements.
 * @param parsedQuery The parsed representation of the SPARQL query.
 * @returns true if the query structure is considered valid, false otherwise.
 */
    function isValidStructure(parsedQuery: any): boolean {
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

