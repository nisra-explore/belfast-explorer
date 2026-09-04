import { wrapLabel } from "./wrapLabel.js";
import { yAxisLabelPlugin } from "./yAxisLabelPlugin.js";
import { chart_container, chart_card, chart_title, chart_subtitle,
         headline_fig, headline_stat, headline_year,
         themes_menu } from "./elements.js";
import { lgd_code, lgd_name, hsct_code } from "../config/config.js";

export let ni_result;

export async function buildCharts(tables, matrix, statistic, geog_type, result, plot_ni, time_var, subtitle_text, other_headline, other_selections, id_vars, stat_label, unit, lgd_matrix, ward_type) {

    let headline_value = "Not available";
    let data_series = null;
    let time_series = [];

    if (plot_ni) {

        chart_card.classList.remove("d-none");
        chart_card.classList.add("d-block");

        if (geog_type != "none") {
            const NI_position = result.dimension[geog_type].category.index.indexOf(lgd_code);
            result.value.splice(NI_position, 1);
            result.dimension[geog_type].category.index.splice(NI_position, 1);
            delete result.dimension[geog_type].category.label[lgd_code];
        }

        while (chart_container.firstChild) {
            chart_container.removeChild(chart_container.firstChild)
        }

        let ni_url;

        let categories = Object.keys(tables[matrix].categories);

        if (geog_type == "DEA2014") {
            ni_url = 'https://ws-data.nisra.gov.uk/public/api.jsonrpc?data=' + 
                encodeURIComponent('{"jsonrpc": "2.0", "method": "PxStat.Data.Cube_API.ReadDataset", "params": {"class": "query","id": ' + id_vars.replace("DEA2014", "LGD2014") + ',"dimension": {"STATISTIC": {"category": {"index": ["' +
                    statistic + '"]}}, "LGD2014": {"category": {"index": ["' +
                    lgd_code + 
                    '"]}}' + other_selections + '},"extension": {"pivot": null,"codes": false,"language": {"code": "en"},"format": {"type": "JSON-stat","version": "2.0"},"matrix": "' +
                    lgd_matrix + '"},"version": "2.0"}}')

        }  else if (ward_type) {
            ni_url = 'https://ws-data.nisra.gov.uk/public/api.jsonrpc?data=' + 
                encodeURIComponent('{"jsonrpc": "2.0", "method": "PxStat.Data.Cube_API.ReadDataset", "params": {"class": "query","id": ' + id_vars.replace(ward_type, "LGD2014") + ',"dimension": {"STATISTIC": {"category": {"index": ["' +
                    statistic + '"]}}, "LGD2014": {"category": {"index": ["' +
                    lgd_code + 
                    '"]}}' + other_selections + '},"extension": {"pivot": null,"codes": false,"language": {"code": "en"},"format": {"type": "JSON-stat","version": "2.0"},"matrix": "' +
                    lgd_matrix + '"},"version": "2.0"}}')
                    
        } else if (geog_type == "none") {

            ni_url = 'https://ws-data.nisra.gov.uk/public/api.jsonrpc?data=' +
                encodeURIComponent('{"jsonrpc":"2.0", "method": "PxStat.Data.Cube_API.ReadDataset", "params": {"class": "query", "id": ' + id_vars + ', "dimension": { "STATISTIC": {"category": {"index": ["' + statistic +
                    '"]}}' + other_selections + '},"extension": {"pivot": null,"codes": false,"language": {"code":"en"},"format":{"type": "JSON-stat","version": "2.0"},"matrix": "' +
                    matrix + '"},"version": "2.0"}}');

        } else if (geog_type == "HSCT") {
            ni_url = 'https://ws-data.nisra.gov.uk/public/api.jsonrpc?data=' +
                encodeURIComponent('{"jsonrpc": "2.0", "method": "PxStat.Data.Cube_API.ReadDataset", "params": {"class": "query", "id": ' + id_vars + ', "dimension": { "STATISTIC": {"category": {"index": ["' + statistic +
                    '"]}}, "' + geog_type +
                    '": {"category": {"index": ["' + hsct_code + '"]}}' + other_selections + '},"extension": {"pivot": null,"codes": false,"language": {"code":"en"},"format":{"type": "JSON-stat","version": "2.0"},"matrix": "' +
                    matrix + '"},"version": "2.0"}}');

        } else {

            ni_url = 'https://ws-data.nisra.gov.uk/public/api.jsonrpc?data=' +
                encodeURIComponent('{"jsonrpc": "2.0", "method": "PxStat.Data.Cube_API.ReadDataset", "params": {"class": "query", "id": ' + id_vars + ', "dimension": { "STATISTIC": {"category": {"index": ["' + statistic +
                    '"]}}, "' + geog_type +
                    '": {"category": {"index": ["' + lgd_code + '"]}}' + other_selections + '},"extension": {"pivot": null,"codes": false,"language": {"code":"en"},"format":{"type": "JSON-stat","version": "2.0"},"matrix": "' +
                    matrix + '"},"version": "2.0"}}');
        }



        const ni_response = await fetch(ni_url);
        ni_result = await ni_response.json();

        data_series = ni_result.result.value;
        // Make sure values are numbers
        const values = data_series.map(v => (v === null || v === undefined ? null : Number(v)));
        if (values[values.length - 1] != null) headline_value = values[values.length - 1].toLocaleString();

        time_series = ni_result.result.dimension[time_var].category.index;
        headline_year.textContent = time_series[time_series.length - 1];
        headline_stat.innerHTML = other_headline;

        Chart.defaults.font.family = "'Roboto', Arial, sans-serif";
        Chart.defaults.color = "#212529"; // optional: match Bootstrap body color

        // Chart data
        const chart_data = {
            labels: [...time_series],
            datasets: [{
                label: stat_label,
                data: [...values],
                borderColor: "#00205b",
                backgroundColor: "#00205b",
                barPercentage: 0.4,
                fill: false,
                pointBackgroundColor: "#00205b",
                tension: 0
            }]
        };

        // Decide chart type dynamically
        const chart_type = (values.length === 1) ? "bar" : "line";

        // Axis titles
        const xAxisTitle = result.dimension[time_var].label || "";
        const yAxisTitle = unit || "";

        // Chart config
        const chart_config = {
            type: chart_type,
            data: chart_data,
            options: {
                responsive: true,
                maintainAspectRatio: false,
                layout: { padding: { top: wrapLabel(yAxisTitle).length * 25, left: 30 } }, // space for Y label
                interaction: { intersect: false, mode: "index" },
                scales: {
                    x: {
                        grid: { lineWidth: 0, drawTicks: true, tickWidth: 1 },
                        ticks: { minRotation: 0, maxRotation: 0, autoSkip: true, maxTicksLimit: 8 },
                        title: {
                            display: !!xAxisTitle,
                            text: xAxisTitle,
                            color: "#6c757d",
                            padding: { top: 10 },
                            font: { size: 14, weight: "500", family: "'Roboto', Arial, sans-serif" }
                        }
                    },
                    y: {
                        beginAtZero: true,
                        ticks: {
                            minRotation: 0,
                            maxRotation: 0,
                            callback: (v) => {
                                try { return Number(v).toLocaleString("en-GB"); }
                                catch { return v; }
                            }
                        },
                        title: { display: false } // plugin draws the label
                    }
                },
                plugins: {
                    legend: { display: false },
                    yAxisLabel: {
                        text: yAxisTitle,
                        color: "#6c757d",
                        offset: 10,
                        font: { size: 14, weight: "500", family: "'Roboto', Arial, sans-serif" },
                        maxChars: 12 // wrap threshold
                    }
                }
            },
            plugins: [yAxisLabelPlugin]
        };





        if (time_series.length == 1) {
            chart_title.textContent = `${stat_label} in ${lgd_name} ${time_series[0]}`;
        } else {
            chart_title.textContent = `${stat_label} in ${lgd_name} (${time_series[0]} to ${time_series[time_series.length - 1]})`;
        }

        chart_subtitle.innerHTML = subtitle_text;

        // Create a new canvas and render
        const chart_canvas = document.createElement("canvas");
        chart_canvas.id = "line-canvas";
        chart_container.appendChild(chart_canvas);

        // Prefer element or 2D context, not just the id string
        const ctx = chart_canvas.getContext('2d');
        new Chart(ctx, chart_config);

        let unit_fixed = unit;


        if (unit.toLowerCase() == "number") {
            unit_fixed = "";
        }
        headline_fig.innerHTML = `<span class = "headline-value" style="font-size: 2.5rem; font-weight: 500;">${headline_value}</span> ${unit_fixed}`;


    }

    return {
        data_series,
        time_series
    }
}