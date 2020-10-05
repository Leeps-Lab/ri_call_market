import { html, PolymerElement } from '/static/otree-redwood/node_modules/@polymer/polymer/polymer-element.js';
import '../shared/buysell_slider.js';
import '../polymer-elements/paper-button.js';

class Results extends PolymerElement {
    static get properties() {
        return {
            step: {
                type: Number,
                value: 0,
                notify: true,
                reflectToAttribute: true,
            },
            isDefault: {
                type: Boolean,
                computed: '_getDefaultResult(y, g)',
                notify: true,
                reflectToAttribute: true,
            },
            defaultResult: String,
            bondPayment: {
                type: Number,
                computed: '_getBondPayment(m)',
                notify: true,
                reflectToAttribute: true,
            },
            numBonds: {
                type: Number,
                computed: '_getNumBonds(bonds, bought, sold)',
                notify: true,
                reflectToAttribute: true,
            },
            payoff: {
                type: Number,
                computed: '_getPayoff(bought, sold, endowment, q, cost, bondPayment)',
                notify: true,
                reflectToAttribute: true,
            },
            buttonLabel: {
                type: String,
                value: 'Continue',
            },
        }
    }

    static get template() {
        return html`
            <style>
                #results {
                    text-align: center;
                }
                @keyframes fadein {
                    0% { opacity:0; }
                    66% { opacity:0; }
                    100% { opacity:1; }
                }
                #substep {
                    opacity: 0;
                }
                .row {
                    display: flex;
                    flex-direction: row;
                    justify-content: space-evenly;
                }
                .def {
                    color: #DF5353;
                }
                .non-def {
                    color: #55BF3B;
                }
                .sell-val {
                    color: #007bff;
                    font-weight: bold;
                }
                .buy-val {
                    color: #2F3238;
                    font-weight: bold;
                }
                .price-val {
                    color: orange;
                    font-weight: bold;
                }    
                .slider {
                    --price-color: orange;   
                }    
            </style>
            <div id="results">
                <buysell-slider
                    class="slider"
                    low-value="[[ lowValue ]]"
                    high-value="[[ highValue ]]"
                    buy-option="[[ buyOption ]]"
                    sell-option="[[ sellOption ]]"
                    buy-price="[[ buyPrice ]]"
                    sell-price="[[ sellPrice ]]"
                    price-to-show="[[ q ]]"
                    disable-select
                ></buysell-slider>
                <div id="buy-sell">
                    <div class="row">
                        <p hidden$="[[ _hidePrice(buyOption) ]]">Your bid: <span class="buy-val">[[ buyPrice ]]</span></p>
                        <p hidden$="[[ _hidePrice(sellOption) ]]">Your ask: <span class="sell-val">[[ sellPrice ]]</span></p>
                    </div>
                    <h4>
                        Bond price: <span class="price-val">[[ q ]]</span>.
                        <span hidden$="[[ sellOption ]]">You [[ _getBuy(bought) ]].</span>
                        <span hidden$="[[ buyOption ]]">You [[ _getSell(sold) ]].</span>
                        <span hidden$="[[ _hideOption(buyOption, sellOption) ]]">You [[ _getBuy(bought) ]] and [[ _getSell(sold) ]].</span>
                        You now have [[ numBonds ]] bonds.
                    </h4>
                </div>
                <div id="substep" class$="[[ _hideResults(hideBeforeSubmit) ]]">
                    <h3>Default? <span class$="[[ _getDefaultColor(defaultResult) ]]">[[ defaultResult ]]</span></h3>
                        <h4>Actual bond payment: [[ bondPayment ]]<br/>
                        Your private info cost: [[ cost ]]</h4>
                    <h3>Your payoff: [[ _getPayoffFormula(bought, sold, endowment, q, cost) ]] = [[ payoff ]]</h3>
                </div>
            </div>
        `;
    }

    _hidePrice(option) {
        if (option)
            return !option;
        else
            return true;
    }

    _hideResults(hideBeforeSubmit) {
            this.$.substep.animate([
                { opacity: 0 },
                { opacity: 1 },
            ], {
                duration: 1000, //milliseconds
                easing: 'ease-in',
                fill: 'forwards',
                delay: 1000, // wait until show price animation finish
            });
        return hideBeforeSubmit;
    }

    _getNondefault(def) {
        return 100 - def;
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

    _getDefaultColor() {
        return this.isDefault ? 'def' : 'non-def';
    }

    _getBuy(bought) {
        return bought ? 'bought' : 'didn\'t buy';
    }

    _getSell(sold) {
        return sold ? 'sold' : 'didn\'t sell';
    }
    
    _getBondPayment(m) {
        return this.isDefault ? m : 100; // 0 if match
    }

    _getPayoff(bought, sold, endowment, q, cost, bondPayment) {
        // neither bought nor sold
        let val = endowment + bondPayment - cost;
        // bought
        if(bought) {
            val = endowment + (2 * bondPayment) - cost - q;
        }
        // sold
        if (sold) {
            val = endowment + q - cost;
        }
        return parseFloat(val.toFixed(2));
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

    _getPayoffFormula(bought, sold, endowment, q, cost) {
        let f = `${endowment}`;
        // bought
        if (bought)
            f += ` + (2 * ${this.bondPayment}) - ${q}`;
        // sold
        else if (sold)
            f += ` + ${q}`;
        // neither
        else
            f += ` + ${this.bondPayment}`;
        // cost if non-zero
        if (cost)
            f += ` - ${cost}`;
        return f;
    }

    _hideOption(buyOption, sellOption) {
        if (buyOption && sellOption)
            return false;
        else
            return true;
    }
}

window.customElements.define('results-page', Results);
