import { html, PolymerElement } from '/static/otree-redwood/node_modules/@polymer/polymer/polymer-element.js';

class SupplyDemandGraph extends PolymerElement {
    static get properties() {
        return {
            // single point as its own series on chart
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

    /** configures bid and ask price points for transactions colors (red/green), 
    * and adds dummy points to start and end steps with vertical lines */ 
    _getPricePoints(prices, price) {
        let data = [];
        if (price === undefined)
            return data;
        // dummy point for leftmost vertical line step
        if (prices[0] <= prices[prices.length - 1]) {
            data.push({
                x: 0,
                y: 0,
                tooltip: false,
            });       
         } else {
            data.push({
                x: 0,
                y: 100,
                tooltip: false,
            });
        }
        // console.log(price, this.buyPrice, this.sellPrice, this.bought, this.sold);
        for (let i = 0; i < prices.length; i++) {
            // marker on player's submitted price
            if (price && prices[i] === price) {
                data.push({
                    x: i+1,
                    y: prices[i],
                });
            } else
                data.push([i+1, prices[i]]);
            // place clearing price with proper x coordinate
            if ((prices[i] === this.q || (!prices.includes(this.q) && i && prices[i-1] < this.q && this.q > prices[i])) && this.clearing_price.length == 0)
            this.clearing_price.push({
                x: i,
                y: this.q,
                marker: {
                    symbol: 'url(../../../../../static/ri_call_market/shared/clearing_price.png)',
                    width: 25,
                    height: 25,
                }
            });
        }
        // dummy point for rightmost vertical line step
        if (prices[0] <= prices[prices.length - 1])
            data.push([prices.length, 100]);
        else
            data.push([prices.length, 0]);
        return data;
    }

    _getColorZones(prices, price) {
        prices.unshift(0);
        let zones = [];
        let color = '#DF5353';
        if (price === this.buyPrice && this.bought || price === this.sellPrice && this.sold)
            color = '#55BF3B';
        let index =  prices.indexOf(price);
        // avoids including the vertical step in the colored zone (horizontal line only)
        let startZone = index - 0.985;
        let endZone = index - 0.015;
        zones.push({
            value: startZone,
        });
        zones.push({
            value: endZone,
            color: color,
        });

        return zones;
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
                max: Math.max(this.bids.length, this.asks.length),
            },
            yAxis: {
                min: 0, 
                max: 100, // TODO: hardcoded with dummy points, may need to pass in params e.g. initial endowment
                title: {
                    text: 'Bid/Ask Price'
                },
            },
            tooltip: {
                crosshairs: true,
                // shared: true,
                formatter: function () {
                    for (const p of this.points) {
                        // removes tooltip for 1st and last dummy points
                        if (p.y === 0 || p.y === 100) {
                            return false;
                        }
                    }
                    let formats = [];
                    formats.push(this.x);
                    this.points.forEach(function(point) {
                        formats.push('<b>' + point.series.name + '</b>: ' + point.y);
                    })                     
                    return formats;          
                },
                split: true,
                distance: 30,
                padding: 5,
            },
            plotOptions: {
                series: {
                    step: 'right',
                    lineWidth: 4,
                },
            },
            series: [{
                name: 'Bid Price',
                data: this._getPricePoints(this.bids, this.buyPrice),
                zoneAxis: 'x',
                zones: this._getColorZones(this.bids, this.buyPrice),
            }, {
                name: 'Ask Price',
                data: this._getPricePoints(this.asks, this.sellPrice),
                zoneAxis: 'x',
                zones: this._getColorZones(this.asks, this.sellPrice),
            },
            {
                name: 'Bond Price',
                data: this.clearing_price,
            }],
        });
    }
}

window.customElements.define('supply-demand-graph', SupplyDemandGraph);