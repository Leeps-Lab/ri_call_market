import { html, PolymerElement } from '/static/otree-redwood/node_modules/@polymer/polymer/polymer-element.js';
import './polymer-elements/paper-button.js';
import './results/results.js';
import './results/supply_demand_graph.js';
class ResultsPage extends PolymerElement {

    static get properties() {
        return {
            g: Number,
            k: Number,
            m: Number,
            y: Number,
            q: Number,
            participation_fee: Number,
            bonds: Number,
            // sets defaults for buy/sell options (false = undefined from python)
            buyOption: {
                type: Boolean,
                value: false,
            },
            sellOption: {
                type: Boolean,
                value: false,
            },
            precision: Number,
            cost: Number,
            mLow: Number,
            mHigh: Number,
            lowValue: Number,
            highValue: Number,
            bidPrice: Number,
            askPrice: Number,
            expectedVal: Number,
            default: Boolean,
            bought: {
                type: Boolean,
                value: false,
            },
            sold: {
                type: Boolean,
                value: false,
            },
            bondPayment: Number,
            numBonds: Number,
            payoff: Number,
            bids: {
                type: Array,
                value: []
            },
            asks: {
                type: Array,
                value: []
            },
        }
    }
    static get template() {
        return html`
            <style>
                :host {
                    display: flex;
                    flex-direction: column;
                    justify-content: space-around;
                }
                .first {
                    margin-top: -9%;
                }
                .step {
                    width: 38%;
                    padding: 0 30px;
                    margin: 30px;
                }
                .btn {
                    position: relative;
                    margin: 30px 25% auto auto;
                    width: 50px;
                }
            </style>
            <supply-demand-graph
                bids="[[ bids ]]"
                asks="[[ asks ]]"
                buy-price="[[ bidPrice ]]"
                sell-price="[[ askPrice ]]"
                q="[[ q ]]"
                bought="[[ bought ]]"
                sold="[[ sold ]]"
            ></supply-demand-graph>
            <results-panel
                participation_fee="[[ participation_fee ]]"
                bonds="[[ bonds ]]"
                g="[[ g ]]"
                m="[[ m ]]"
                y="[[ y ]]"
                q="[[ q ]]"
                buy-option="[[ buyOption ]]"
                sell-option="[[ sellOption ]]"
                buy-price="[[ bidPrice ]]"
                sell-price="[[ askPrice ]]"
                low-value="[[ lowValue ]]"
                high-value="[[ highValue ]]"
                cost="[[ cost ]]"
                is-default="{{ default }}"
                bought="[[ bought ]]"
                sold="[[ sold ]]"
                bond-payment="{{ bondPayment }}"
                num-bonds="{{ numBonds }}"
                payoff="{{ payoff }}"
            ></results-panel>
        <paper-button class="btn" on-click="nextStep">Continue</paper-button>
       `;
    }

    nextStep() {
        this.dispatchEvent(new CustomEvent('getPolymerData', {
            bubbles: true,
            composed: true,
            detail: {
                this: this,
                value: { // values to dispatch to oTree
                    'payoff': this.payoff,
                },
                eventName: 'getPolymerData'
            }
        }));
    }
}

window.customElements.define('results-page', ResultsPage);
