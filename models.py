import csv
import random
import math
import statistics
from otree.api import (
    models,
    widgets,
    BaseConstants,
    BaseSubsession,
    BaseGroup,
    BasePlayer,
    Currency as c,
    currency_range,
)

author = 'Your name here'

doc = """
Your app description
"""

def parse_config(config):
    with open('ri_call_market/configs/session_config.csv', newline='') as config_file:
        rows = list(csv.DictReader(config_file))
        rounds = []
        for row in rows:
            rounds.append({
                'round': int(row['round']) if row['round'] else 0,
                'total_rounds': int(row['total_rounds']) if row['total_rounds'] else 0,
                'block_total': int(row['block_total']) if row['block_total'] else 0,
                'participation_fee': float(row['participation_fee']) if row.get('participation_fee') else 100,
                'bonus': False if row.get('bonus') == 'False' else True,
                'initial_bonds': int(row['initial_bonds']) if row.get('initial_bonds') else 1,
                'pause_page': False if row.get('pause_page') == 'False' else True,
                'buy_option': False if row.get('buy_option') == 'False' else True,
                'sell_option': False if row.get('sell_option') == 'False' else True,
                'g': int(row['g']) if row.get('g') else int(random.uniform(0, 100)),
                'k': float(row['k']) if row.get('k') else float(random.uniform(0, 100)),
                'm': int(row['m']) if row.get('m') else int(random.uniform(0, 100)),
                'y': int(row['y']) if row.get('y') else int(random.uniform(0, 100)),
                'q': int(row['q']) if row.get('q') else int(random.uniform(1, 100)), # actual price should be positive
            })
    return rounds

class Constants(BaseConstants):
    name_in_url = 'ri_call_market'
    players_per_group = None
    num_rounds = 99
    def total_rounds(self):
        return self.config.get('total_rounds')
    def round_number(self):
        return len(parse_config(self.session.config['config_file']))

    def get_expected_value(self):
        return

    def get_default_result(self):
        return

class Subsession(BaseSubsession):
    # initial values of fields for players for each subsession
    g = models.IntegerField()
    k = models.FloatField()
    m = models.IntegerField()
    y = models.IntegerField()
    q = models.IntegerField()
    block_total = models.IntegerField()
    expected_value = models.FloatField()
    default = models.BooleanField()
    buy_option = models.BooleanField()
    sell_option = models.BooleanField()

    def creating_session(self):
        # print('in creating_session', self.round_number)
        config = self.config
        if not self.config or self.round_number > len(config):
            return

    def get_g(self):
        if self.g is None:
            self.g = self.config.get('g')
            self.save()
        return self.g

    def get_k(self):
        if self.k is None:
            self.k = self.config.get('k')
            self.save()
        return self.k

    def get_m(self):
        if self.m is None:
            self.m = self.config.get('m')
            self.save()
        return self.m

    def get_y(self):
        if self.y is None:
            self.y = self.config.get('y')
            self.save()
        return self.y

    def get_q(self):
        if self.q is None:
            self.q = self.config.get('q')
            self.save()
        return self.q

    def get_expected_value(self):
        if self.expected_value is None:
            self.expected_value = (100 - self.g) + (self.g * self.m * 0.01)
            self.save()
        return self.expected_value

    def get_default(self):
        if self.default is None:
            self.default = self.y < self.g
            self.save()
        return self.default

    def get_buy_option(self):
        if self.buy_option is None:
            self.buy_option = self.config.get('buy_option')
            self.save()
        return self.buy_option

    def get_sell_option(self):
        if self.sell_option is None:
            self.sell_option = self.config.get('sell_option')
            self.save()
        return self.sell_option

    def num_rounds(self):
        return len(parse_config(self.session.config['config_file']))

    def block_total(self):
        if self.block_total is None:
            self.block_total = self.config.get('block_total')
            self.save()
        return self.block_total

    def bonus(self):
        if self.bonus is None:
            self.bonus = self.config.get('bonus')
            self.save()
        return self.bonus
    def pause_page(self):
        if self.pause_page is None:
            self.pause_page = self.config.get('pause_page')
            self.save()
        return self.pause_page

    @property
    def config(self):
        try:
            return parse_config(self.session.config['config_file'])[self.round_number-1]
        except IndexError:
            # print('index error')
            return None

class Group(BaseGroup):
    clearing_price = models.FloatField()

    # called when all players have submitted bid/ask prices (reached wait page)
    def set_clearing_price(self):
        bid_prices = []
        ask_prices = []

        if self.subsession.get_buy_option():
            bid_prices.extend([p.bid_price for p in self.get_players()])
            # bids sorted highest to lowest
            bid_prices.sort(reverse=True)

        if self.subsession.get_sell_option():
            ask_prices.extend([p.ask_price for p in self.get_players()])
            # asks sorted lowest to highest
            ask_prices.sort()


        if self.subsession.get_buy_option() and self.subsession.get_sell_option():
            prices = []
            prices.extend(ask_prices)
            prices.extend(bid_prices)
            # sort all prices to determine clearing
            prices.sort()
            self.clearing_price = round(statistics.median(prices), 2)
        else:
            # assuming all players submit bids, asks, or both
            n = max(len(bid_prices), len(ask_prices))
            m = n // 2 if n % 2 == 0 else (n + 1) // 2
            if self.subsession.get_buy_option():
                self.clearing_price = bid_prices[-m] # 93, 76, 68, 64 -> m = 2nd lowest bid (68)
            else:
                self.clearing_price = ask_prices[m] # 21, 29, 58, 85 -> m+1 = 3rd lowest ask (58)

        """
        handle bids and asks exactly at p*
        1. collect player id's of bid and ask prices
        2. if # of bid matches != # of ask matches, shuffle player id's to ration randomly
        3. execute transactions for min(len(pid_bid_matches), len(pid_ask_matches)), 0 -> len(list)
            - id's collected earlier used to reference player and directly set bought/sold to True
        4. leftovers in one set of prices = "long side", and are ignored
            - id's used to set bought/sold to false

        - UI: accepted = green, rejected = red, all the rest = black/blue
        """
        pid_bid_matches = []
        pid_ask_matches = []

        pid_bid_matches.extend([p.id_in_group for p in self.get_players() if p.bid_price == self.clearing_price])
        pid_ask_matches.extend([p.id_in_group for p in self.get_players() if p.ask_price == self.clearing_price])

        if pid_bid_matches or pid_ask_matches:

            # if unequal number of bids and ask matches, shuffle players to ration randomly
            if len(pid_bid_matches) != len(pid_ask_matches):
                print('before shuffle', pid_bid_matches, pid_ask_matches)
                random.shuffle(pid_bid_matches)
                random.shuffle(pid_ask_matches)
                print('after shuffle', pid_bid_matches, pid_ask_matches)

            # execute transactions for both sets
            print('START executing transactions: ', pid_bid_matches, pid_ask_matches)
            while pid_bid_matches and pid_ask_matches:
                pb = pid_bid_matches.pop(0)
                pa = pid_ask_matches.pop(0)
                self.get_player_by_id(pb).bought = True
                self.get_player_by_id(pa).sold = True
            print('FINISH executing transactions: ', pid_bid_matches, pid_ask_matches)

            # "long side" of randomly selected from the bigger set are ignored
            # TODO: case untested
            for pb in pid_bid_matches:
                print('long side - bids: ', pid_bid_matches)
                self.get_player_by_id(pb).bought = False
            for pa in pid_ask_matches:
                print('long side - asks: ', pid_ask_matches)
                self.get_player_by_id(pa).sold = False

        self.save()
        return bid_prices, ask_prices, self.clearing_price

class Player(BasePlayer):
    width = models.IntegerField(initial=100)
    cost = models.FloatField(initial=0)
    m_low = models.FloatField(initial=0)
    m_high = models.FloatField(initial=100)
    low_val = models.FloatField(initial=0)
    high_val = models.FloatField(initial=100)
    bid_price = models.FloatField(initial=0)
    ask_price = models.FloatField(initial=100)
    bought = models.BooleanField()
    sold = models.BooleanField()
    round_payoff = models.FloatField(initial=100)
    ready = models.BooleanField(initial = False)
    def live_ready(self, data):
        print(data)
        self.ready = True
        if all(p.ready for p in self.get_others_in_group()):
            return {0:"Submit"}
    def get_bought(self):
        print('get bought', self.bid_price, self.bought)
        if self.bought is None:
            self.bought = self.subsession.buy_option and self.bid_price > self.group.clearing_price
            self.save()
        return self.bought

    def get_sold(self):
        print('get sold', self.ask_price, self.sold)
        if self.sold is None:
            self.sold = self.subsession.sell_option and self.ask_price < self.group.clearing_price
            self.save()
        return self.sold

def custom_export(self, players):
    # header row
    print(players.values_list())
    yield ['width', 'cost', 'm_low', 'm_high', 'low_val', 'high_val', 'bid_price', 'ask_price', 'bought', 'sold', 'round_payoff']
    for p in players:
        yield [p.width, p.bid_price, p.ask_price, p.bought, p.sold, p.round_payoff]
