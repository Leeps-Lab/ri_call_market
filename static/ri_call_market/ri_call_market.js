import { html, PolymerElement } from '/static/otree-redwood/node_modules/@polymer/polymer/polymer-element.js'; // // /static/otree-redwood/node_modules/@polymer/
import './public_info/public_info.js';
import './info_precision/info_precision.js';
import './bond_price/bond_price.js';
import './polymer-elements/paper-button.js';
import './results/results.js';
import './results/supply_demand_graph.js';
class RICallMarket extends PolymerElement {

    static get properties() {
        return {
            step: {
                type: Number,
                value: 0,
                observer: function (step) {
                    setTimeout(function () {
                        if (step && step < 3) {  // auto scroll down to next step/screen
                            window.scrollBy({ top: 480, behavior: 'smooth' });
                        }
                    }, 500);
                },
                notify: true,
                reflectToAttribute: true,
            },
            e: Number,
            g: Number,
            k: Number,
            m: Number,
            y: Number,
            q: Number,
            height: Number,
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
            buttonLabel: {
                type: String,
                value: 'Next',
            },
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
            <div class="first">
            <public-info
                    g="[[ g ]]"
                    credits="[[ participation_fee ]]"
                ></public-info>
            </div>
            <div hidden$="{{ _hideStep(step, 1) }}">
                <info-precision
                    k="[[ k ]]"
                    precision="{{ precision }}"
                    cost="{{ cost }}"
                    disable-select="{{ _disableStep(step, 1) }}"
                    height = "[[ height ]]"
                ></info-precision>
            </div>
            <div class="step" hidden$="{{ _hideStep(step, 2) }}">
                <bond-price
                    g="[[ g ]]"
                    m="[[ m ]]"
                    q="[[ q ]]"
                    e="[[ e ]]"
                    buy-option="[[ buyOption ]]"
                    sell-option="[[ sellOption ]]"
                    precision="[[ precision ]]"
                    default-prob="[[ g ]]"
                    m-low="{{ mLow }}"
                    m-high="{{ mHigh }}"
                    low-value="{{ lowValue }}"
                    high-value="{{ highValue }}"
                    buy-price="{{ bidPrice }}"
                    sell-price="{{ askPrice }}"
                    expected-value="{{ expectedVal }}"
                    disable-select="[[ _disableStep(step, 2) ]]"
                    hide-before-submit="{{ _hideStep(step, 3) }}"
                    animate-price="[[ _animatePrice(2) ]]"
                ></bond-price>
            </div>
        <paper-button class="btn" on-click="nextStep" hidden$="[[ _updateButtonLabel(step)]]">[[ buttonLabel ]]</paper-button>
        <div class ="step" hidden$="{{_hideStep(step, 4)}}"

        >Please wait for all other players to finish.</div>
       `;
    }

    nextStep() {
        this.step++;
        this.dispatchEvent(new CustomEvent('getPolymerData', {
            bubbles: true,
            composed: true,
            detail: {
                this: this,
                value: { // values to dispatch to oTree
                    'step': this.step,
                    'precision': this.precision,
                    'cost': this.cost,
                    'bidPrice': this.bidPrice,
                    'askPrice': this.askPrice,
                    'mLow': this.mLow,
                    'mHigh': this.mHigh,
                    'lowValue': this.lowValue,
                    'highValue': this.highValue,
                    'payoff': this.payoff,
                },
                eventName: 'getPolymerData'
            }
        }));
        return this.step;
    }

    _hideStep(step, num) {
        return step < num;
    }

    _disableStep(step, num) {
        return step != num;
        // return false; // allow changes to previous steps for debugging
    }

    _updateButtonLabel(step) {
        if (step)
            this.buttonLabel = 'Submit';
        else
            this.buttonLabel = 'Next';
        // determines when bid/ask prices submitted to hide button
        return step > 3;
    }

    _animatePrice(step) {
        return step == 5;
    }
}

window.customElements.define('ri-call-market', RICallMarket);
