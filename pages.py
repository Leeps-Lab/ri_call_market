from otree.api import Currency as c, currency_range
from ._builtin import Page, WaitPage
from .models import Constants
from .models import Group
from .models import parse_config
from . import parser as parser_py


class MainPage(Page):
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
        print('subsesh config', self.subsession.config, self.subsession.buy_option)
        print('high and low val', self.player.high_val, self.player.low_val)
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
            }

page_sequence = [MainPage, ResultsWaitPage, Results]
