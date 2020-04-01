# margin-bitmex

See liquidation on [Bitmex](https://www.bitmex.com/register/FG84Zq) futures and get notified, perform simple trades

## Motivation

Sometimes you want to keep USD value of your Bitcoin, for example if you know you will have future expenses with known USD value. If you don't want to go to Ethereum-land for this purpose and want to stay within the BTC ecosystem, you could use [Bitmex](https://www.bitmex.com/register/FG84Zq)'s perpetual swap or expiring futures for this purpose.

[Bitmex](https://www.bitmex.com/register/FG84Zq) is a well-known centralized exchange. In order to minimize counterparty risk (hacking, owners of [Bitmex](https://www.bitmex.com/register/FG84Zq) just running away with your crypto), you can enter hedging positions, but keep most of your coins outside of [Bitmex](https://www.bitmex.com/register/FG84Zq) (for example on your hardware wallet).

In order to do all of this, I decided to write a few scripts. The first one checks if my margin balance on [Bitmex](https://www.bitmex.com/register/FG84Zq) is high enough in order for the positions not to get liquidated. If the margin is approaching lower values, I get an encrypted notification via Signal.

The second script allows me to quickly hedge positions of BTC I received or unhedge if I spend them.

This allows me to hedge Bitcoin price risk, earn [Bitmex](https://www.bitmex.com/register/FG84Zq)'s funding rate and stay chilled during day and night, because I know I don't put too much on [Bitmex](https://www.bitmex.com/register/FG84Zq), but my position won't get liquidated.

### A concrete example

I received 100 USD in BTC as a payment for a project. I know I have to cover my costs of Internet connection, which is 39 USD and it is due next week. I also know I want to have a dinner today which is 21 USD.

Because I have the BTC, I need to quickly hedge 39+21=60 USD in BTC. I have an account on [Bitmex](https://www.bitmex.com/register/FG84Zq) with a sufficient margin. I need to sell 60 units of XBTUSD contract:

```
node trade-bitmex.js market sell 60
```

In the evening, I pay 21 USD for dinner and because I live in a country where I can pay with BTC in restaurants, I have spent 21 USD worth of BTC for dinner. In order not to leave the position, I need to buy 21 units of XBTUSD contract on [Bitmex](https://www.bitmex.com/register/FG84Zq):

```
node trade-bitmex.js market buy 21
```

The rest of the position is still hedged.

After three days, Bitcoin goes up a bit and my position would get liquidated soon, if I do not fund my [Bitmex](https://www.bitmex.com/register/FG84Zq) account. I send the transaction from my wallet to [Bitmex](https://www.bitmex.com/register/FG84Zq). Then I have to pay my Internet connection. I pay with BTC using [Lamium](https://lamium.io/?ref=5jTwHHDt) and I need to exit the rest of the position.

```
node trade-bitmex.js market buy 39
```

During the time of the hedging, my 60 USD (and then 39 USD after I ate dinner) were safely hedged, so even a drop of 50% would not hurt me. In addition, I earned funding rate for the duration of my position (could be easily 10% p.a., check [Bitmex](https://www.bitmex.com/register/FG84Zq)'s current funding rate).

Well, the banks are so last century, which bank pays you 10% p.a. on your USD balance? :)

Of course, you could do all of this in a web interface. Set up liquidation price notifications in your crypto tracking app, update it with trades and sell and buy XBTUSD contract on [Bitmex](https://www.bitmex.com/register/FG84Zq).

## Installation

```bash
npm install
```

Optionally, install [signal-cli](https://github.com/AsamK/signal-cli) for example if you have homebrew:

```bash
brew install signal-cli
```

Then create API keys on bitmex. If you only want notification (and no trading, it is enough to create read-only API key). Copy .env.example to .env, edit and paste the API id and secret. If you want trading, you can optionally allow trading (no warranty or responsibility whatsoever, audit the code!).

When you have your API keys set up, it's time to play

## Usage

### margin-bitmex.js

This program is used to check the liquidation price of future/perpetual swap positions. You can use these to fix your Bitcoin's USD value (short) or do collateralized loan (long).

When [Bitmex](https://www.bitmex.com/register/FG84Zq) API returns the position's liquidation price, we check the difference between the last price and liquidation price and it's difference.

```
# node margin-bitmex.js
Balance: 0.001
Last price: 9376.84
Liquidation price: 12666
Margin of safety: 1.3507748879153318
```

If you want to get a warning, you can add -w 1.4 parameter, which will create a warning if liquidation price is 140% of last price or less (in short position) or more in case of long position.

```
node margin-bitmex.js -w 1.4
Balance: 0.001
Last price: 9363.96
Liquidation price: 12666
Margin of safety: 1.3526328604564737
Our liquidation margin is below threshold!
Deposit to: "3LGdXkqYCMPC2S3rJELPjxoK4G7Ao9Qa1s"
```

(The deposit address is my donation address, but if you run it, it will be your account's funding address - but it is safer if you just have your address on file somewhere safe).

The price ratio is based on the ratio of price movement, not on your margin/wallet balance.

### check-margin.sh

First copy check-margin.sh.example to check-margin.sh. Copy the repository to `~/.bitmex-checker`. Setup and register [signal-cli](https://github.com/AsamK/signal-cli) change your phone numbers in check-margin.sh (sending and receiving number). Alternatively, you can use other notification method (e-mail, etc.).

What the script does is that there are two thresholds. One is 1.2 by default and the second one is 1.1. If the first one is reached, you get a notification every two hours (unless there is a deposit that will change the liquidation price or the price returns to normal values).

The second one is more urgent and you will have a more frequent notifications if this level is reached, everytime the script is launched.

#### Launching the script from cron

Use crontab -e and add something similar to this:

```
0,30 * * * * (/home/username/.bitmex-checker/check-margin.sh ) > /home/username/.bitmex-checker.log 2>&1
```

This will run the checker every thirty minutes. This is also the interval in which you would get the more urgent notifications.

### trade-bitmex.js

This is an experimental feature which allows me to do quick trades from the command-line without login
and see your position and other parameters.


```
# node trade-bitmex.js help
trade-bitmex <cmd> [args]

Commands:
  trade-bitmex market side amount [symbol]  submit a market order
  trade-bitmex position [symbol]            show current position
  trade-bitmex fundingrate [symbol]         show funding rate

Options:
  --version  Show version number                                       [boolean]
  --help     Show help                                                 [boolean]
```

#### Command-line trading

If I want to fix USD value of my BTC, I do market sell order, for example in this case fixing 1 USD:

```
# node trade-bitmex.js market sell 1
Submitting a sell order for 1 on XBTUSD
Order status Filled average price 9283.5
Order ID: [CENSORED]
```

Of course I should have received/saved 1 USD worth of BTC in order for this to stabilize and not short BTC - you should do this when you receive BTC that has some value and you want to keep the USD value of received BTC.

If you are spending from the account, you are buying XBTUSD (yes, it is counterintuitive, but you are buying back BTC, so lowering your position), so you would do:

```bash
node trade-bitmex.js market buy 1
```

You can also buy/sell on other markets, that's the last parameter, it just defaults to XBTUSD.

#### Checking your position

In order to see your current (dollar) position run:

```
# node trade-bitmex.js position
Position -60 USD
```

Because we are short 60 USD (-60 means short 60) on XBTUSD, it means that along with original
Bitcoin worth 60 USD at the time when we entered the position and the current balance, we
have hedged 60 USD value in BTC.

This is something like USD balance of this strategy.

#### Funding rate

We would also like to know the current interest rate (called funding rate).
Shorts earn this funding rate, so if this gets negative, we pay funding rate
(it happens sometimes).

```
node trade-bitmex.js fundingrate
Instrument XBTUSD funding rate 0.0001 which is approx 10.95% p.a.
```

Please note that the funding rate changes all the time.

# Donate and more information about the crypto lifestyle

If you like these scripts, I'd be happy if you donated Bitcoin to [3LGdXkqYCMPC2S3rJELPjxoK4G7Ao9Qa1s](bitcoin:3LGdXkqYCMPC2S3rJELPjxoK4G7Ao9Qa1s).

This script is inspired by my own [check-cdp](https://github.com/jooray/check-cdp) script (well, I can be my own inspiration sometimes:).

You can also use my referral links to register for the services that allow you to use Bitcoin better:

* [Bitmex](https://www.bitmex.com/register/FG84Zq) - a derivatives exchange that this project is all about

* [Lamium](https://lamium.io/?ref=5jTwHHDt) - a service to pay your standard invoices in Europe (SEPA) area using Bitcoin

* [Purse](https://bit.ly/purse-juraj) - a service that allows you to do [up to 33% discounted shopping on Amazon](https://juraj.bednar.io/en/blog-en/2019/06/11/how-to-use-cryptocurrencies-for-discounted-shopping-on-amazon/)

If you want to learn more about using cryptocurrencies and why it is good, check out my upcoming book [Financial Surveillance and Crypto Utopias](https://juraj.bednar.io/en/projects/financial-surveillance-and-crypto-utopias-book/) and see the talk from [Hackers Congress Paralelní Polis](https://juraj.bednar.io/en/talk-en/2019/10/16/financial-surveillance-and-crypto-utopias-recording-from-hcpp19/) where I go through the main topics of the first part.
