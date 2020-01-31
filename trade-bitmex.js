(async () => {
require('dotenv').config()
var ccxt = require ('ccxt')

var config = {
 'apiKey': process.env.TRADEAPIKEY,
 'secret': process.env.TRADEAPISECRET,
}

require('yargs')
  .scriptName("trade-bitmex")
  .usage('$0 <cmd> [args]')
  .command('market side amount [symbol]', 'submit a market order', (yargs) => {
    yargs.positional('side', {
      type: 'string',
      describe: 'either buy or sell',
      choices: ['buy', 'sell']
    }).positional('amount', {
      type: 'number',
      describe: 'amount to buy or sell'
    }).positional('symbol', {
      type: 'string',
      describe: 'which market to post order to, default XBTUSD',
      default: 'XBTUSD'
    })
  }, function (argv) {
    console.log('Submitting a ' + argv.side + ' order for ' + argv.amount + ' on ' + argv.symbol)

    let exchange = new ccxt.bitmex(config)
    if (process.env.TESTNET === 'true') {
      exchange.urls.api = exchange.urls.test
    }

    exchange.privatePostOrder({
      symbol: argv.symbol,
      ordType: 'Market',
      side: (argv.side == 'buy' ? 'Buy' : 'Sell'),
      orderQty: argv.amount
    }).then( (orderResult) => {
      ordStatus = orderResult.ordStatus
      ordPrice = orderResult.avgPx
      ordId = orderResult.orderID
      console.log('Order status ' + ordStatus + ' average price ' + ordPrice)
      console.log('Order ID: ' + ordId)
    }
    )
  })
  .command('position [symbol]', 'show current position', (yargs) => {
    yargs.positional('symbol', {
      type: 'string',
      describe: 'which market to show position in, default XBTUSD',
      default: 'XBTUSD'
    })
  }, function (argv) {

    let exchange = new ccxt.bitmex(config)
    if (process.env.TESTNET === 'true') {
      exchange.urls.api = exchange.urls.test
    }
    exchange.privateGetPosition({
      filter: {
        "isOpen": true,
        "symbol": argv.symbol
      }
    }).then( (positions) => {
      for (const position of positions) {
        console.log('Position ' + position.currentQty + ' ' + position.quoteCurrency)
      }
    })
  })
  .command('fundingrate [symbol]', 'show funding rate', (yargs) => {
    yargs.positional('symbol', {
      type: 'string',
      describe: 'which market to show funding rate of, default XBTUSD',
      default: 'XBTUSD'
    })
  }, function (argv) {

    let exchange = new ccxt.bitmex()
    if (process.env.TESTNET === 'true') {
      exchange.urls.api = exchange.urls.test
    }
    exchange.publicGetInstrument({
      filter: {
        "state": "Open",
      },
      "symbol": argv.symbol
    }).then( (instruments) => {
      for (const instrument of instruments) {
        console.log('Instrument ' + instrument.symbol + ' funding rate ' +
          instrument.fundingRate + ' which is approx ' +
          (instrument.fundingRate*3*365*100).toFixed(2) + '% p.a.')
      }
    })
  })
  .help()
  .argv

})()
