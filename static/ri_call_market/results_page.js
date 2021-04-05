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
            numBonds: {
                type: Number,
                computed: '_getNumBonds(bonds, bought, sold)',
                notify: true,
                reflectToAttribute: true,
            },
            payoff: Number,
            bids: {
                type: Array,
                value: []
            },
            asks: {
                type: Array,
                value: []
            },
            step: {
                type: Number,
                value: 0,
                notify: true,
                reflectToAttribute: true,
            },
            payoffpage: {
                type: Boolean,
                value: true,
            },
            isDefault: {
                type: Boolean,
                computed: '_getDefaultResult(y, g)',
                notify: true,
                reflectToAttribute: true,
            },
            bondPayment: {
                type: Number,
                computed: '_getBondPayment(m)',
                notify: true,
                reflectToAttribute: true,
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
                .def {
                    color: #DF5353;
                }
                .non-def {
                    color: #55BF3B;
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
                expected-value="{{ expectedVal }}"
                step = "{{step}}"
            ></results-panel>
            <paper-button class="btn" on-click="step_add" hidden$="{{_disable(step)}}"> Next </paper-button>
            <div hidden$="{{_hide(step)}}">
            <h3>Default? <span class$="[[ _getDefaultColor(defaultResult) ]]">[[ defaultResult ]]</span></h3>
                <h4>Actual bond payment: [[ bondPayment ]]<br/>
                Your private info cost: [[ cost ]]</h4>
            <h3>Your payoff: [[ _getPayoffFormula(bought, sold, participation_fee, q, cost) ]] = [[ payoff ]]</h3>
            </div>
            <paper-button class="btn" on-click="nextStep" hidden$="{{_hide(step)}}" >Continue</paper-button>
       `;
    }
    step_add() {
        this.step = 1;
    }
    _disable(step) {
      return this.step == 1;
    }
    _hide(step) {
        return this.step != 1;
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
    _getDefaultColor() {
        return this.isDefault ? 'def' : 'non-def';
    }
    _getDefaultResult(y, g) {
        if (y < g) {
            this.defaultResult = 'Yes';
            return true;
        } else {
            this.defaultResult = 'No';
            return false;
        }
    }
    _getBondPayment(m) {
        return this.isDefault ? m : 100; // 0 if match
    }
    _getPayoffFormula(bought, sold, participation_fee, q, cost) {
        let f = ``;
        // bought
        if (bought)
            f += ` (${this.numBonds} * ${this.bondPayment}) - ${q}`;
        // sold
        else if (sold)
            f += ` ${q}`;
        // neither
        else
            f += ` (${this.numBonds} * ${this.bondPayment})`;
        // cost if non-zero
        if (cost)
            f += ` - ${cost}`;
        return f;
    }
    _getNumBonds(bonds, bought, sold) {
        // bought
        if(bought) {
            return ++bonds;
        }
        // sold
        if (sold) {
            return --bonds;
        }
        return bonds;
    }
}

window.customElements.define('results-page', ResultsPage);
