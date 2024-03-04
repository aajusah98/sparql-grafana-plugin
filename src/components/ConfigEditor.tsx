// Form Editor UI design collecting information from the user
import React, { ChangeEvent, PureComponent } from 'react';
import { LegacyForms, InlineFieldRow, InlineFormLabel, Button } from '@grafana/ui';
import { DataSourcePluginOptionsEditorProps } from '@grafana/data';
import { MyDataSourceOptions, MySecureDataSourceOptions } from 'types';

const { SecretFormField, FormField } = LegacyForms;

interface Props extends DataSourcePluginOptionsEditorProps<MyDataSourceOptions, MySecureDataSourceOptions> {}

interface State {
  isSparqlEndpointValid: boolean | null;
}

export class ConfigEditor extends PureComponent<Props, State> {
  state: State = {
    isSparqlEndpointValid: null,
  };

  onUrlChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { onOptionsChange, options } = this.props;
    const jsonData = {
      ...options.jsonData,
      url: event.target.value,
    };
    onOptionsChange({ ...options, jsonData });

    // Reset validation result when URL changes
    this.setState({ isSparqlEndpointValid: null });
  };

  // Method to validate SPARQL endpoint

  validateSparqlEndpoint = () => {
    const { options } = this.props;
    const { jsonData } = options;
    const { url } = jsonData;

    // Regular expression for a basic URL format
    const urlRegex = /^(https?|ftp):\/\/[^\s/$.?#].[^\s]*$/;

    // Additional checks specific to SPARQL endpoint URLs
    const sparqlEndpointRegex = /\/(sparql|query)$/i;

    // Check if the URL matches the general format
    const isUrlValid = urlRegex.test(url || '');

    // Check if the URL contains "/sparql" or "/query" at the end
    const isSparqlEndpointValid = sparqlEndpointRegex.test(url || '');

    // Set the validation result in the state
    this.setState({ isSparqlEndpointValid: isUrlValid && isSparqlEndpointValid });
  };

//Event handler to handle for changes in the repository', 'username' and 'password' input field
nDatabaseChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { onOptionsChange, options } = this.props;
    const jsonData = {
      ...options.jsonData,
      Repository: event.target.value,
    };
    onOptionsChange({ ...options, jsonData });
  };

  onUsernameChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { onOptionsChange, options } = this.props;
    const jsonData = {
      ...options.jsonData,
      username: event.target.value,
    };
    onOptionsChange({ ...options, jsonData });
  };

  onPasswordChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { onOptionsChange, options } = this.props;
    const secureJsonData = {
      ...options.secureJsonData,
      password: event.target.value,
    };

    onOptionsChange({ ...options, secureJsonData });
  };

  onResetPassword = () => {
    const { onOptionsChange, options } = this.props;
    const secureJsonData = {
      ...options.secureJsonData,
      password: '',
    };

    const secureJsonFields = {
      ...options.secureJsonFields,
      password: false,
      //sets the 'password' field in secureJsonFields to false to indicate that the password is not set.
    };

    onOptionsChange({ ...options, secureJsonFields, secureJsonData });
  };

  render() {
    const { options } = this.props;
    const { jsonData, secureJsonData, secureJsonFields } = options;
    const { isSparqlEndpointValid } = this.state;

    return (
      <div className="gf-form-group">
        {/* Existing form fields */}
        <div className="gf-form">
          <FormField
            label="Url"
            labelWidth={6}
            inputWidth={20}
            onChange={this.onUrlChange}
            value={jsonData.url || ''}
            placeholder="e.g. http://dbpedia.org/ontology"
          />
        </div>

        <div className="gf-form">
          <FormField
            label="Repository"
            labelWidth={6}
            inputWidth={20}
            onChange={this.nDatabaseChange}
            value={jsonData.Repository || ''}
            placeholder="My Repository"
          />
        </div>

        <div className="gf-form">
          <FormField
            label="Username"
            labelWidth={6}
            inputWidth={20}
            onChange={this.onUsernameChange}
            value={jsonData.username || ''}
            placeholder="leave empty for no authentication"
          />
        </div>

        <div className="gf-form-inline">
          <div className="gf-form">
            <SecretFormField
              isConfigured={(secureJsonFields && secureJsonFields.password) as boolean}
              value={(secureJsonData && secureJsonData.password) || ''}
              label="Password"
              placeholder="leave empty for no authentication"
              labelWidth={6}
              inputWidth={20}
              onReset={this.onResetPassword}
              onChange={this.onPasswordChange}
            />
          </div>
        </div>

        {/* New field for SPARQL endpoint validation */}
        <InlineFieldRow>
          <InlineFormLabel width={6}>Validation</InlineFormLabel>
          <div>
            {isSparqlEndpointValid !== null &&
              (isSparqlEndpointValid ? (
                <p style={{ color: 'green' }}>Valid SPARQL endpoint!</p>
              ) : (
                <p style={{ color: 'red' }}>Invalid SPARQL endpoint.</p>
              ))}
          </div>
        </InlineFieldRow>

        {/* Button for manual validation */}
        <InlineFieldRow>
          <Button variant="secondary" onClick={this.validateSparqlEndpoint}>
            URL test
          </Button>
        </InlineFieldRow>
      </div>
    );
  }
}

