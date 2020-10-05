import { html, PolymerElement } from '/static/otree-redwood/node_modules/@polymer/polymer/polymer-element.js';

class SupplyDemandGraph extends PolymerElement {
    static get properties() {
        return {
        }
    }

    static get template() {
        return html`
            <style>
                :host {
                    display: block;
                }
            </style>
            <figure class="highcharts-figure">
                <div id="chart"></div>
            </figure>
        `;
    }

    _getNondefault(def) {
        return 100 - def;
    }

    ready() {
        super.ready();
        this._initHighchart();
    }

    _getPricePoints(prices, price) {
        let data = [];
        console.log('price', price);
        for (let i = 0; i < prices.length; i++) {
            // marker on player's submitted price
            if (price && prices[i] === price)
                data.push({
                    x: i+1,
                    y: prices[i],
                    marker: {
                        symbol: 'url(https://www.highcharts.com/samples/graphics/snow.png)'
                    }
                });
            else
                data.push([i+1, prices[i]]);
        }
        console.log(this.data);
        return data;
    }

    _initHighchart() {
        Highcharts.setOptions({
            colors: ['#2F3238', '#007bff'],
        });

        this.graphObj = Highcharts.chart({
            chart: {
                renderTo: this.$.chart,
            },
            title: {
                text: 'Supply/Demand'
            },
            subtitle: {
                text: ''
            },
            xAxis: {
                // min: 1,
                // max: Math.max(this.bids.length, this.bids.length), // TODO: replace with number of players in group
            },
            yAxis: {
                title: {
                    text: 'Bid/Ask Price'
                },
                labels: {
                    // formatter: function () {
                    //     return this.value + '°';
                    // }
                }
            },
            tooltip: {
                crosshairs: true,
                shared: true
            },
            plotOptions: {
                series: {
                    step: 'left',
                },
                spline: {
                    marker: {
                        radius: 4,
                        lineColor: '#666666',
                        lineWidth: 1
                    }
                }
            },
            series: [{
                name: 'Bid Price',
                marker: {
                    symbol: 'square'
                },
                data: this._getPricePoints(this.bids, this.buyPrice),
                // data: [7.0, 6.9, 9.5, 14.5, 18.2, 21.5, 25.2, {
                //     y: 26.5,
                //     marker: {
                //         symbol: 'url(https://www.highcharts.com/samples/graphics/sun.png)'
                //     }
                // }, 23.3, 18.3, 13.9, 9.6]        
            }, {
                name: 'Ask Price',
                marker: {
                    symbol: 'diamond'
                },
                data: this._getPricePoints(this.asks, this.sellPrice),
                // data: [{
                //     y: 8.9,
                //     marker: {
                //         symbol: 'url(https://www.highcharts.com/samples/graphics/snow.png)'
                //     }
                // }, 14.2, 15.7, 18.5, 15.9, 13.2, 11.0, 9.6, 8.2]
            }]
        });
    }
}

window.customElements.define('supply-demand-graph', SupplyDemandGraph);