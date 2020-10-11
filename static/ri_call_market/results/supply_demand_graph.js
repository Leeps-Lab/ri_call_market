import { html, PolymerElement } from '/static/otree-redwood/node_modules/@polymer/polymer/polymer-element.js';

class SupplyDemandGraph extends PolymerElement {
    static get properties() {
        return {
            clearing_price: {
                type: Array,
                value: [],
            }
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
        for (let i = 0; i < prices.length; i++) {
            // marker on player's submitted price
            if (price && prices[i] === price) {
                let url = 'url(../../../../../static/ri_call_market/shared/rejected.png)';
                if (price === this.buyPrice && this.bought || price === this.sellPrice && this.sold)
                    url = 'url(../../../../../static/ri_call_market/shared/transacted.png)';                    
                data.push({
                    x: i+1,
                    y: prices[i],
                    marker: {
                        symbol: url,
                        width: 24,
                        height: 24,
                    }
                });
                // plots clearing price without symbol if bid/ask price matches
                // probably not needed - clearing price exists on x-coord i-1 (prev. corner)
                // if (prices[i] === this.q) {
                //     this.clearing_price.push([i, this.q]); // [i, this.q]
                // }
            } else
                data.push([i+1, prices[i]]);

            // place clearing price with proper x coordinate
            if ((prices[i] === this.q || (!prices.includes(this.q) && i > 0 && prices[i-1] < this.q && this.q > prices[i])) && this.clearing_price.length == 0)
            this.clearing_price.push({
                x: i,
                y: this.q,
                marker: {
                    symbol: 'url(../../../../../static/ri_call_market/shared/clearing_price.png)',
                    width: 20,
                    height: 20,
                }
            });
        }
        return data;
    }

    _initHighchart() {
        Highcharts.setOptions({
            colors: ['#2F3238', '#007bff', 'orange'],
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
                min: 0,
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
                    step: 'right',
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
                    symbol: 'diamond',
                },
                data: this._getPricePoints(this.asks, this.sellPrice),
                // data: [{
                //     y: 8.9,
                //     marker: {
                //         symbol: 'url(https://www.highcharts.com/samples/graphics/snow.png)'
                //     }
                // }, 14.2, 15.7, 18.5, 15.9, 13.2, 11.0, 9.6, 8.2]
            },
            {
                name: 'Bond Price',
                marker: {
                    symbol: 'circle' // 'circle', 'square','diamond', 'triangle' and 'triangle-down'
                },
                data: this.clearing_price
            }],
            // navigation: {
            //     buttonOptions: {
            //         height: 40,
            //         width: 48,
            //         symbolSize: 24,
            //         symbolX: 23,
            //         symbolY: 21,
            //         symbolStrokeWidth: 2
            //     }
            // }
        });
    }
}

window.customElements.define('supply-demand-graph', SupplyDemandGraph);