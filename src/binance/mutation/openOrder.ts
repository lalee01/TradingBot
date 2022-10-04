import { BinanceClient } from '../connection'

type Options = {
  stopLoss: number
  takeProfit: number
  orderType: "SELL" | "BUY"
  availableBalance: number
  openPrice: number
}

const LEVERAGE = Number(process.env.LEVERAGE)
const CRYPTO_PAIR = process.env.CRYPTO_PAIR

const openOrder = async ({ stopLoss, takeProfit, orderType, availableBalance, openPrice}: Options) => {
  await BinanceClient.useServerTime()
  const quantity = ((availableBalance*LEVERAGE)/openPrice).toFixed(3)
  await BinanceClient.futuresMarginType( CRYPTO_PAIR, 'ISOLATED' ).then((res:any) => console.log(res))
  await BinanceClient.futuresLeverage( CRYPTO_PAIR, LEVERAGE ).then((res:any) => console.log(res))
  await BinanceClient.futuresMarketBuy( CRYPTO_PAIR, quantity ).then((res:any) => console.log(res))

  if(orderType === "SELL") {
    await BinanceClient.futuresMarketSell( CRYPTO_PAIR, quantity ).then((res:any) => console.log(res))
  } else if (orderType === "BUY") {
    await BinanceClient.futuresMarketBuy( CRYPTO_PAIR, quantity ).then((res:any) => console.log(res))
  }

  await BinanceClient.futuresOrder( orderType === "SELL" ? "BUY" : "SELL" , CRYPTO_PAIR, 0 , 0 , {
    type:"STOP_MARKET" , 
    stopPrice: stopLoss ,
    workingType: 'MARK_PRICE' , 
    priceProtect: true ,
    closePosition: true,
    timeInForce: 'GTE_GTC',
  }).then((res:any) => console.log(res))

  await BinanceClient.futuresOrder( orderType === "SELL" ? "BUY" : "SELL" , CRYPTO_PAIR, 0 , 0 , {
    type:"TAKE_PROFIT_MARKET" , 
    stopPrice: takeProfit ,
    workingType: 'MARK_PRICE' , 
    priceProtect: true ,
    closePosition: true,
    timeInForce: 'GTE_GTC',
  }).then((res:any) => console.log(res))

}       

export default openOrder