(async () => {
require('dotenv').config()
var ccxt = require ('ccxt')


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

    let exchange = new ccxt.bitmex({
     'apiKey': process.env.TRADEAPIKEY,
     'secret': process.env.TRADEAPISECRET,
    })

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

    let exchange = new ccxt.bitmex({
     'apiKey': process.env.APIKEY,
     'secret': process.env.APISECRET,
    })

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
  .command('fundingrate [symbol]', 'show funding rate of perpetual swaps', (yargs) => {
    yargs.positional('symbol', {
      type: 'string',
      describe: 'which market to show funding rate of, default XBTUSD',
      default: 'XBTUSD'
    })
  }, function (argv) {

    let exchange = new ccxt.bitmex()

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
  .command('instrument [symbol]', 'show instruments and their premium', (yargs) => {
    yargs.positional('symbol', {
      type: 'string',
      describe: 'which symbol to show funding rate of, default all open',
      default: ''
    })
  }, function (argv) {

    let exchange = new ccxt.bitmex()

    var instrumentArgs = {
      filter: {
        "state": "Open",
      }
    }

    if (argv.symbol)
      instrumentArgs = { "symbol": argv.symbol }

    exchange.publicGetInstrument(instrumentArgs).then( (instruments) => {
      for (const instrument of instruments) {
        let premium = (instrument.markPrice - instrument.indicativeSettlePrice) / instrument.indicativeSettlePrice
        console.log('Instrument ' + instrument.symbol + ' price ' + instrument.markPrice
          + ' settle price ' + instrument.indicativeSettlePrice
          + ' premium ' + (100*premium).toFixed(2) + '%'
          + (instrument.expiry ? (
            ' (' + (100 * premium * 365 / Math.abs((new Date() - Date.parse(instrument.expiry)) / (24 * 60 * 60 * 1000))).toFixed(2)
            + '% p.a.)'
            +' expiry ' + instrument.expiry) : '')

        )
      }
    })
  })
  .help()
  .argv

})()
