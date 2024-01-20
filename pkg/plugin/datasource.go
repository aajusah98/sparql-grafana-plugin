package plugin

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"math/rand"

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
	// create response struct
	response := backend.NewQueryDataResponse()

	// loop over queries and execute them individually.
	for _, q := range req.Queries {
		res := d.query(ctx, req.PluginContext, q)

		// save the response in a hashmap
		// based on with RefID as identifier
		response.Responses[q.RefID] = res
	}

	return response, nil
}

type queryModel struct{}

func (d *Datasource) query(_ context.Context, pCtx backend.PluginContext, query backend.DataQuery) backend.DataResponse {
	var response backend.DataResponse

	// Unmarshal the JSON into our queryModel.
	var qm queryModel

	err := json.Unmarshal(query.JSON, &qm)
	if err != nil {
		return backend.ErrDataResponse(backend.StatusBadRequest, fmt.Sprintf("json unmarshal: %v", err.Error()))
	}
	repo, err := sparql.NewRepo("https://query.wikidata.org/sparql")
	if err != nil {

	}

	// queryString := `
	// 	SELECT ?item ?itemLabel WHERE {
	// 		?item wdt:P31 wd:Q146.
	// 		SERVICE wikibase:label { bd:serviceParam wikibase:language "[AUTO_LANGUAGE],en". }
	// 	}`

	queryString := `SELECT ?author ?authorLabel ?count
		WITH {
		  SELECT ?author (COUNT(?paper) AS ?count)
		  WHERE {
			?article schema:about ?author ;
			  schema:isPartOf <https://species.wikimedia.org/> .
			?author wdt:P31 wd:Q5.
			?paper wdt:P50 ?author.
		  }
		  GROUP BY ?author
		  ORDER BY DESC(?count)
		  LIMIT 200
		} AS %i
		WHERE {
		  INCLUDE %i
		  SERVICE wikibase:label { bd:serviceParam wikibase:language "[AUTO_LANGUAGE],en" . }
		}
		ORDER BY DESC(?count)`
	res, err := repo.Query(queryString)
	if err != nil {
		log.Fatal(err)
	}

	// duration := query.TimeRange.To.Sub(query.TimeRange.From)
	// mid := query.TimeRange.From.Add(duration / 2)

	// bindings := res.Bindings()

	// for _, tr := range bindings["data"] {
	// 	i, _ := strconv.Atoi(tr.String())
	// vals = append(vals, int64(i))

	// }
	var items []string
	var itemLabels []string
	var counts []string

	for _, result := range res.Results.Bindings {
		item := result["author"].Value
		itemLabel := result["authorLabel"].Value
		count := result["count"].Value
		items = append(items, item)
		itemLabels = append(itemLabels, itemLabel)
		counts = append(counts, count)
	}

	fmt.Println(itemLabels)
	// create data frame response.
	// For an overview on data frames and how grafana handles them:
	// https://grafana.com/developers/plugin-tools/introduction/data-frames
	frame := data.NewFrame("response")

	// add fields.
	frame.Fields = append(frame.Fields,
		data.NewField("item", nil, items),
		data.NewField("values", nil, itemLabels),
		data.NewField("count", nil, counts),
	)

	// add the frames to the response.
	response.Frames = append(response.Frames, frame)

	return response
}

// CheckHealth handles health checks sent from Grafana to the plugin.
// The main use case for these health checks is the test button on the
// datasource configuration page which allows users to verify that
// a datasource is working as expected.
func (d *Datasource) CheckHealth(_ context.Context, req *backend.CheckHealthRequest) (*backend.CheckHealthResult, error) {
	var status = backend.HealthStatusOk
	var message = "Data source is working"

	if rand.Int()%2 == 0 {
		status = backend.HealthStatusError
		message = "randomized error"
	}

	return &backend.CheckHealthResult{
		Status:  status,
		Message: message,
	}, nil
}
