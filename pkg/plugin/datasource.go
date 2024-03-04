package plugin

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"net/url"
	"time"

	"github.com/grafana/grafana-plugin-sdk-go/backend"
	"github.com/grafana/grafana-plugin-sdk-go/backend/instancemgmt"
	"github.com/grafana/grafana-plugin-sdk-go/data"
	"github.com/knakk/sparql"
)

// Make sure Datasource implements required interfaces. This is important to do
// since otherwise we will only get a not implemented error response from plugin in
// runtime. In this example datasource instance implements backend.QueryDataHandler,
// backend.CheckHealthHandler interfaces. Plugin should not implement all these
// interfaces - only those which are required for a particular task.
var (
	_ backend.QueryDataHandler      = (*Datasource)(nil)
	_ backend.CheckHealthHandler    = (*Datasource)(nil)
	_ instancemgmt.InstanceDisposer = (*Datasource)(nil)
)

// NewDatasource creates a new datasource instance.
func NewDatasource(_ context.Context, _ backend.DataSourceInstanceSettings) (instancemgmt.Instance, error) {
	return &Datasource{}, nil
}

// Datasource is an example datasource which can respond to data queries, reports
// its health and has streaming skills.
type Datasource struct {
	URL        string `json:"url"`        // Maps to "url" in the JSON
	Repository string `json:"Repository"` // Maps to "repository" in the JSON
	Username   string `json:"username"`   // Maps to "username" in the JSON
	Password   string `json:"password"`   // Assuming this comes from secureJsonData and is decrypted
}

type MyQuery struct {
	RdfQuery string `json:"rdfQuery"` // Ensure the json tag matches the key used in the frontend
}

// Dispose here tells plugin SDK that plugin wants to clean up resources when a new instance
// created. As soon as datasource settings change detected by SDK old datasource instance will
// be disposed and a new one will be created using NewSampleDatasource factory function.
func (d *Datasource) Dispose() {
	// Clean up datasource instance resources.
}

// QueryData handles multiple queries and returns multiple responses.
// req contains the queries []DataQuery (where each query contains RefID as a unique identifier).
// The QueryDataResponse contains a map of RefID to the response for each query, and each response
// contains Frames ([]*Frame).
func (d *Datasource) QueryData(ctx context.Context, req *backend.QueryDataRequest) (*backend.QueryDataResponse, error) {

	var settings Datasource
	// Unmarshal jsonData into settings
	if err := json.Unmarshal(req.PluginContext.DataSourceInstanceSettings.JSONData, &settings); err != nil {
		return nil, fmt.Errorf("error unmarshalling jsonData: %w", err)
	}

	settings.Password = req.PluginContext.DataSourceInstanceSettings.DecryptedSecureJSONData["password"]

	// create response struct
	response := backend.NewQueryDataResponse()

	for _, q := range req.Queries {
		var res backend.DataResponse

		var queryModel MyQuery
		err := json.Unmarshal(q.JSON, &queryModel)
		if err != nil {
			res.Error = err
			response.Responses[q.RefID] = res
			continue
		}

		res = d.query(ctx, queryModel, settings)

		response.Responses[q.RefID] = res

	}

	return response, nil
}

func (d *Datasource) query(ctx context.Context, queryModel MyQuery, settings Datasource) backend.DataResponse {

	response := backend.DataResponse{}

	repo, err := sparql.NewRepo(settings.URL,
		sparql.DigestAuth(settings.Username, settings.Password),
		sparql.Timeout(time.Millisecond*1500),
	)

	if err != nil {
		backend.Logger.Debug("Error creating SPARQL repository", "Repo", err)
	}
	res, err := repo.Query(queryModel.RdfQuery)

	if err != nil {
		backend.Logger.Debug("Error creating SPARQL queery", "Repo", err)
	}

	// Use the first row to extract column names (bindings)
	columnNames := make([]string, 0, len(res.Results.Bindings[0]))
	for name := range res.Results.Bindings[0] {
		columnNames = append(columnNames, name)
	}
	// Now `columnNames` contains all the column names from the result set

	backend.Logger.Debug("ColumnNames", "ColNames", columnNames)

	frame := data.NewFrame("response")

	// For each column name, create a new field
	for _, name := range columnNames {
		// Here you might decide the type of the field based on the expected result type
		// For simplicity, let's assume all fields are of type string
		frame.Fields = append(frame.Fields, data.NewField(name, nil, []string{}))
	}

	for _, row := range res.Results.Bindings {
		for i, name := range columnNames {
			value := row[name].Value // Assuming this is how you get a value for a column in a row
			// Since we assumed fields are of type []string, we can directly append
			frame.Fields[i].Append(value)
		}
	}

	response.Frames = append(response.Frames, frame)

	return response
}

// CheckHealth handles health checks sent from Grafana to the plugin.
// The main use case for these health checks is the test button on the
// datasource configuration page which allows users to verify that
// a datasource is working as expected.
func (d *Datasource) CheckHealth(ctx context.Context, req *backend.CheckHealthRequest) (*backend.CheckHealthResult, error) {
	var settings Datasource
	if err := json.Unmarshal(req.PluginContext.DataSourceInstanceSettings.JSONData, &settings); err != nil {
		return nil, fmt.Errorf("error unmarshalling jsonData: %w", err)
	}

	// Simple URL format validation
	_, err := url.ParseRequestURI(settings.URL)
	if err != nil {
		return &backend.CheckHealthResult{
			Status:  backend.HealthStatusError,
			Message: "Invalid URL format",
		}, nil
	}

	// Optional: Lightweight check if the URL is reachable
	// Making a HEAD request to avoid downloading content
	resp, err := http.Head(settings.URL)
	if err != nil {
		return &backend.CheckHealthResult{
			Status:  backend.HealthStatusError,
			Message: "URL is not reachable",
		}, nil
	}
	defer resp.Body.Close()

	if resp.StatusCode >= 400 {
		return &backend.CheckHealthResult{
			Status:  backend.HealthStatusError,
			Message: "URL is reachable but returned an error status",
		}, nil
	}

	// URL is well-formed and reachable
	return &backend.CheckHealthResult{
		Status:  backend.HealthStatusOk,
		Message: "URL is valid and reachable",
	}, nil
}
