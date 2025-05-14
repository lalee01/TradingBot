import { BinanceClient } from "./connection.js"
import fs from "fs"
import 'dotenv/config'

type coinSettings = {
    symbol:string
    pair:string
    baseAsset:string
    quoteAsset:string
    pricePrecision:number
    quantityPrecision:number
    priceFilter:Object
    lotFilter:Object
    marketLotFilter:Object
}

const re = RegExp(".0*1" );


(async () =>{
    const info:Array<any>=[]
    const coinSettings :Array<coinSettings>=[]
    await BinanceClient.futuresExchangeInfo().then((response:Promise<Array>)=>info.push(response.symbols));

    info[0].map((element:any)=>{

        const counter = (size:number)=>{
            let precision = []
            if(size == 1){
            precision.push(0) 
          }else{
            precision.push(re.exec(size)[0].length -1)
          }
        return precision[0]
        }

        const oneSymbolInfo = {
            symbol:element.symbol,
            price:counter(element.filters[0].tickSize),
            quantity:counter(element.filters[1].stepSize),
        }
        coinSettings.push(oneSymbolInfo)
    })

    const jsonData = JSON.stringify(coinSettings, null, 2);

    fs.writeFile("./src/binance/coinsettings2_test.json", jsonData, 'utf8', (err) => {
        if (err) {
            console.error('Error writing to file', err);
        } else {
            console.log('Data written to file');
        }
    })

})()