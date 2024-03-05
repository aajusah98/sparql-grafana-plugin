/**
 * ConfigEditor is a React component for configuring datasource options.
 * It allows users to set URL, Repository, Username, and Password for accessing the SPARQL endpoint.
 */
import React, { ChangeEvent, PureComponent } from 'react';
import { LegacyForms } from '@grafana/ui';
import { DataSourcePluginOptionsEditorProps } from '@grafana/data';
import { MyDataSourceOptions, MySecureDataSourceOptions } from 'types';

const { SecretFormField, FormField } = LegacyForms;

interface Props extends DataSourcePluginOptionsEditorProps<MyDataSourceOptions, MySecureDataSourceOptions> {}



export class ConfigEditor extends PureComponent<Props> {
  /**
   * Handles changes to the SPARQL endpoint URL field.
   * @param {ChangeEvent<HTMLInputElement>} event - The event triggered by changing the URL input field.
   */
  onUrlChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { onOptionsChange, options } = this.props;
    const jsonData = {
      ...options.jsonData,
      url: event.target.value,
    };
    onOptionsChange({ ...options, jsonData });

  };


    /**
     * Handles changes to the Repository input field.
     * @param {ChangeEvent<HTMLInputElement>} event - The event triggered by changing the repository input field.
     */
nDatabaseChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { onOptionsChange, options } = this.props;
    const jsonData = {
      ...options.jsonData,
      Repository: event.target.value,
    };
    onOptionsChange({ ...options, jsonData });
  };

  /**
   * Handles changes to the Username input field.
   * @param {ChangeEvent<HTMLInputElement>} event - The event triggered by changing the username input field.
   */
  onUsernameChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { onOptionsChange, options } = this.props;
    const jsonData = {
      ...options.jsonData,
      username: event.target.value,
    };
    onOptionsChange({ ...options, jsonData });
  };

  /**
   * Handles changes to the Password input field.
   * @param {ChangeEvent<HTMLInputElement>} event - The event triggered by changing the password input field.
   */
  onPasswordChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { onOptionsChange, options } = this.props;
    const secureJsonData = {
      ...options.secureJsonData,
      password: event.target.value,
    };

    onOptionsChange({ ...options, secureJsonData });
  };

  /**
   * Resets the Password field to an empty value.
   */
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
            placeholder="e.g. https://query.wikidata.org/sparql"
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
      </div>
    );
  }
}

