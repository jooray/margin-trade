(async () => {
require('dotenv').config()
var ccxt = require ('ccxt')


let exchange = new ccxt.bitmex({
 'apiKey': process.env.TRADEAPIKEY,
 'secret': process.env.TRADEAPISECRET,
})

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
  .help()
  .argv

})()
