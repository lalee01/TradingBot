import Binance from "node-binance-api";
import "dotenv/config";
import sendTelegramMessage from './../telegram/telegram';

type shortProps = {
  slShort : number
  tpShort: number
  symbol: String
}

type longProps = {
  slLong : number
  tpLong: number
  symbol: String
}

const binance = new Binance().options({
  APIKEY: process.env.API_KEY,
  APISECRET: process.env.SECRET_KEY,
});

export const accountInfo = {
  balance : 0 ,
  wasActiveOrder : false,
  quantityForTrade : 0
}

const leverage = Number(process.env.LEVERAGE)

const account = async () => {
  await binance.useServerTime()
  await binance.futuresBalance().then((response : any)=>{
    accountInfo.balance = response[8].availableBalance
  })
}

const getActiveOrders = async () => {
  await account()
  await binance.futuresBalance().then(()=>{
    if(accountInfo.balance <0.5){
      accountInfo.wasActiveOrder = true
    }else{
      accountInfo.wasActiveOrder = false
    }
  })
}

export const longOrder = async ({slLong , tpLong, symbol} : longProps) =>{
  
  await account()
  await getActiveOrders()

  const getMarkPrice = await binance.futuresMarkPrice(symbol)
  const quantity = (12/getMarkPrice.markPrice).toFixed(3)
  
  if(accountInfo.wasActiveOrder === false) {
    await binance.useServerTime()
    await binance.futuresMarginType( symbol, 'ISOLATED' ).then((res:any) => console.log(res))
    await binance.futuresLeverage( symbol, leverage ).then((res:any) => console.log(res))
    await binance.futuresMarketBuy( symbol, quantity ).then((res:any) => console.log(res))
    
    await binance.futuresOrder( "SELL" , symbol, 0 , 0 , {
      type:"STOP_MARKET" , 
      stopPrice: slLong ,
      workingType: 'MARK_PRICE' , 
      priceProtect: true ,
      closePosition: true,
      timeInForce: 'GTE_GTC',
    }).then((res:any) => console.log(res))

    await binance.futuresOrder( "SELL" , symbol, 0 , 0 , {
      type:"TAKE_PROFIT_MARKET" , 
      stopPrice: tpLong ,
      workingType: 'MARK_PRICE' , 
      priceProtect: true ,
      closePosition: true,
      timeInForce: 'GTE_GTC',
    }).then((res:any) => console.log(res))

    sendTelegramMessage("Long order sent")
  }
}

export const shortOrder = async ({slShort , tpShort ,symbol}:shortProps) =>{

  await account()
  await getActiveOrders()

  const getMarkPrice = await binance.futuresMarkPrice(symbol)
  const quantity = (12/getMarkPrice.markPrice).toFixed(3)

  if(accountInfo.wasActiveOrder === false) {
    await binance.useServerTime()
    await binance.futuresMarginType( symbol, 'ISOLATED' ).then((res:any) => console.log(res))
    await binance.futuresLeverage( symbol, leverage ).then((res:any) => console.log(res))
    await binance.futuresMarketSell( symbol, quantity ).then((res:any) => console.log(res))
    
    await binance.futuresOrder( "BUY" , symbol, 0 , 0 , {
      type:"STOP_MARKET" , 
      stopPrice: slShort ,
      workingType: 'MARK_PRICE' , 
      priceProtect: true ,
      closePosition: true,
      timeInForce: 'GTE_GTC',
    }).then((res: any) => console.log(res))
    
    await binance.futuresOrder( "BUY" , symbol, 0 , 0 , {
      type:"TAKE_PROFIT_MARKET" , 
      stopPrice: tpShort ,
      workingType: 'MARK_PRICE' , 
      priceProtect: true ,
      closePosition: true,
      timeInForce: 'GTE_GTC',
    }).then((res: any) => console.log(res))

    sendTelegramMessage("Short order sent")
  }
}