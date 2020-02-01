(async () => {
require('dotenv').config()
var ccxt = require ('ccxt')

var config = {
 'apiKey': process.env.TRADEAPIKEY,
 'secret': process.env.TRADEAPISECRET,
}
//getExchange :: String -> StrMap -> Object
let getExchange = exchange => config => {
  let res = new ccxt[exchange](config)
  if (process.env.TESTNET === 'true') {
    res.urls.api = res.urls.test
  }
  return res
}

async function market (argv) {
  console.log('Submitting a ' + argv.side + ' order for ' + argv.amount + ' on ' + argv.symbol)

  let exchange = getExchange('bitmex')(config)

  let orderResult = await exchange.privatePostOrder({
    symbol: argv.symbol,
    ordType: 'Market',
    side: (argv.side == 'buy' ? 'Buy' : 'Sell'),
    orderQty: argv.amount
  })
  ordStatus = orderResult.ordStatus
  ordPrice = orderResult.avgPx
  ordId = orderResult.orderID
  console.log('Order status ' + ordStatus + ' average price ' + ordPrice)
  console.log('Order ID: ' + ordId)
}

async function position(argv) {

  let exchange = getExchange('bitmex')(config)
  let positions = await exchange.privateGetPosition({
    filter: {
      isOpen: true,
      symbol: argv.symbol
    }
  })
  for (const position of positions) {
    let humanText = `Position:\t ${position.currentQty} ${position.quoteCurrency}\n` +
      `Current price:\t ${position.lastPrice} ${position.quoteCurrency}\n` +
      `Entry price:\t ${+position.avgEntryPrice.toFixed(2)} ${position.quoteCurrency}\n` +
      `Current value:\t ${position.lastValue/100000000} ${position.currency}`
    let jsonText = JSON.stringify({
      position: position.currentQty,
      price: position.lastPrice,
      entry: +position.avgEntryPrice.toFixed(2),
      value: position.lastValue
    })
    console.log(process.env.JSON_OUTPUT === 'true' ? jsonText : humanText)
  }
}

async function fundingRate (argv) {

  let exchange = getExchange('bitmex')({})
  let instruments = await exchange.publicGetInstrument({
    filter: {
      state: "Open",
    },
    symbol: argv.symbol
  })
  for (const instrument of instruments) {
      console.log('Instrument ' + instrument.symbol + ' funding rate ' +
        instrument.fundingRate + ' which is approx ' +
        +(instrument.fundingRate*3*365*100).toFixed(2) + '% p.a.')
  }
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
  }, market)
  .command('position [symbol]', 'show current position', (yargs) => {
    yargs.positional('symbol', {
      type: 'string',
      describe: 'which market to show position in, default XBTUSD',
      default: 'XBTUSD'
    })
  }, position)
  .command('fundingrate [symbol]', 'show funding rate', (yargs) => {
    yargs.positional('symbol', {
      type: 'string',
      describe: 'which market to show funding rate of, default XBTUSD',
      default: 'XBTUSD'
    })
  }, fundingRate)
  .help()
  .argv

})()
