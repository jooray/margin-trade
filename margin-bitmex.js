(async () => {
require('dotenv').config()
const argv = require('yargs').argv
var ccxt = require ('ccxt')
let exchange = new ccxt.bitmex({
 'apiKey': process.env.APIKEY,
 'secret': process.env.APISECRET,
})

balancePromise = exchange.fetchBalance()
positionsPromise = exchange.privateGetPosition({
  filter: {
    "isOpen": true
  }
})
Promise.all([balancePromise, positionsPromise]).then( (values) => {
  balance = values[0]
  positions = values[1]
  console.error('Balance: ' + balance.total.BTC)
  isUndercollateralized = false
  for (position of positions) {
    liquidationPrice = position.liquidationPrice
    lastPrice = position.lastPrice
    isLong = (position.currentQty > 0)
    liquidationPercentage = (isLong) ? (lastPrice / liquidationPrice) : (liquidationPrice / lastPrice)
    console.error('Symbol: ' + position.symbol)
    console.error('Last price: ' + lastPrice)
    console.error('Liquidation price: ' + liquidationPrice)
    console.error('Margin of safety: ' + (liquidationPercentage*100).toFixed(2) + '%')
    if ((argv.w) && (argv.w > liquidationPercentage)) {
      isUndercollateralized = true
      console.error('This position is below threshold')
    }
  }
  if (isUndercollateralized) {
      console.log("Our liquidation margin is below threshold on at least one position!")
      exchange.privateGetUserDepositAddress({currency: 'XBt'}).then( (response) => {
        console.log("Deposit to: " + response)
        process.exit(1)
      })
    }

}
)

})()
