(async () => {
require('dotenv').config()
const argv = require('yargs').argv
var ccxt = require ('ccxt')
let exchange = new ccxt.bitmex({
 'apiKey': process.env.APIKEY,
 'secret': process.env.APISECRET,
})
if (process.env.TESTNET === 'true') {
  exchange.urls.api = exchange.urls.test
}

let [balance, positions ] = await Promise.all([
  exchange.fetchBalance(),
  exchange.privateGetPosition({
    filter: {
      isOpen: true,
      symbol: "XBTUSD"
    }
  })
])

console.error('Balance: ' + balance.total.BTC)
if (positions.length > 0) {
  liquidationPrice = positions[0].liquidationPrice
  lastPrice = positions[0].lastPrice
  liquidationPercentage = liquidationPrice / lastPrice
  console.error('Last price: ' + lastPrice)
  console.error('Liquidation price: ' + liquidationPrice)
  console.error('Margin of safety: ' + (liquidationPercentage*100).toFixed(2) + '%')
  if ((argv.w) && (argv.w > liquidationPercentage)) {
    console.log("Our liquidation margin is below threshold!")
    exchange.privateGetUserDepositAddress({currency: 'XBt'}).then( (response) => {
      console.log("Deposit to: " + response)
      process.exit(1)
    })
  }
} else {
  console.error('No positions open')
}

})()
