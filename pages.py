from otree.api import Currency as c, currency_range
from ._builtin import Page, WaitPage
from .models import Constants
from .models import Group
from .models import parse_config
from . import parser as parser_py

class block_page(Page):
    def is_displayed(self):
        try:
            return int(self.subsession.config.get('round'))%5 == 1
        except:
            return False
    def vars_for_template(self):
        try:
            participation_cost =  round(self.subsession.in_round(self.subsession.config.get('round')).config.get('participation_fee') +self.subsession.in_round(self.subsession.config.get('round') + 1).config.get('participation_fee') +self.subsession.in_round(self.subsession.config.get('round') + 2).config.get('participation_fee') + self.subsession.in_round(self.subsession.config.get('round') + 3).config.get('participation_fee') + self.subsession.in_round(self.subsession.config.get('round') + 4).config.get('participation_fee'),2)
        except:
            participation_cost = round(self.subsession.in_round(self.subsession.config.get('round')).config.get('participation_fee'),2)
        return{
            'block_num': int(self.subsession.config.get('round')/5) +1,
            'Participation_cost': participation_cost,
            }

class MainPage(Page):
    timeout_seconds = 180
    form_model = 'player'
    form_fields = ['width', 'cost', 'm_low', 'm_high', 'low_val', 'high_val', 'bid_price', 'ask_price']

    def is_displayed(self):
        return self.subsession.config is not None

    def vars_for_template(self):
        return {
            'round_num': self.subsession.config.get('round'),
            'g': self.subsession.get_g(),
            'k': self.subsession.get_k(),
            'm': self.subsession.get_m(),
            'y': self.subsession.get_y(),
            'q': self.subsession.get_q(),
            'expected_value': self.subsession.get_expected_value(),
            'default': self.subsession.get_default(),
        }

class ResultsWaitPage(WaitPage):
    after_all_players_arrive = 'set_clearing_price'

    def is_displayed(self):
        return self.subsession.config is not None



class Results(Page):
    form_model = 'player'
    form_fields = ['round_payoff']

    def is_displayed(self):
        return self.subsession.config is not None

    def vars_for_template(self):
        print('subsesh config', self.subsession.config)
        print('high and low val', self.player.high_val, self.player.low_val)
        bid_prices, ask_prices, clearing_price = self.group.set_clearing_price()
        print('pages bids, asks, clear', bid_prices, ask_prices, clearing_price)
        return {
            'bought': self.player.get_bought(),
            'sold': self.player.get_sold(),
            'g': self.subsession.get_g(),
            'k': self.subsession.get_k(),
            'm': self.subsession.get_m(),
            'y': self.subsession.get_y(),
            'q': self.subsession.get_q(),
            'expected_value': self.subsession.get_expected_value(),
            'default': self.subsession.get_default(),
            'bids': bid_prices,
            'asks': ask_prices,
            'clear': clearing_price,
            }
class EndBlock(Page):
    def is_displayed(self):
        try:
            return (self.subsession.config.get('round'))%5 == 0
        except:
            return False

    def vars_for_template(self):
        Participation_cost = round(self.subsession.in_round(self.subsession.config.get('round')).config.get('participation_fee') +self.subsession.in_round(self.subsession.config.get('round') - 1).config.get('participation_fee') +self.subsession.in_round(self.subsession.config.get('round') - 2).config.get('participation_fee') + self.subsession.in_round(self.subsession.config.get('round') - 3).config.get('participation_fee') + self.subsession.in_round(self.subsession.config.get('round') - 4).config.get('participation_fee'),2)

        total_round_payoff = round((self.player.in_round(self.subsession.config.get('round')).round_payoff + self.player.in_round(self.subsession.config.get('round') - 1).round_payoff + self.player.in_round(self.subsession.config.get('round') - 2).round_payoff + self.player.in_round(self.subsession.config.get('round') - 3).round_payoff + self.player.in_round(self.subsession.config.get('round') - 4).round_payoff),2)
        return{
            'block_num': int(self.subsession.config.get('round')/5),
            'Participation_cost': Participation_cost,
            'total_round_payoff': total_round_payoff,
            'total_payoff': round(total_round_payoff  - Participation_cost,2),
            'round_5': round((self.player.in_round(self.subsession.config.get('round')).round_payoff), 2),
            'round_4': round((self.player.in_round(self.subsession.config.get('round') - 1).round_payoff), 2),
            'round_3': round((self.player.in_round(self.subsession.config.get('round') - 2).round_payoff), 2),
            'round_2': round((self.player.in_round(self.subsession.config.get('round') - 3).round_payoff), 2),
            'round_1': round((self.player.in_round(self.subsession.config.get('round') - 4).round_payoff), 2),

            }
class pause(Page):
    def is_displayed(self):
        try:
            return (self.subsession.config.get('round')) == 15
        except:
            return False
class payment_page(Page):
    def is_displayed(self):
        try:
            return self.subsession.config.get('round') == 30
        except:
            return False
    def vars_for_template(self):
        payment_payoff = 0
        ##sum of total round payoffs
        participation_fee_total = 0
        ##sum of total participation fees
        for p in self.player.in_all_rounds():
            payment_payoff += p.round_payoff
        ##function to sum round payoffs
        for s in self.subsession.in_all_rounds():
            participation_fee_total += s.config.get('participation_fee')
        ##function to sum total participation fees
        return{
            'player_id': self.player.id_in_group,
            'total_payoff': round((payment_payoff - participation_fee_total)*.5,2)
        }


page_sequence = [block_page, MainPage, ResultsWaitPage, Results, EndBlock, pause, payment_page]
