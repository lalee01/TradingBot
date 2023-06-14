import { Klines } from 'src/binance/query/klines'

type hlCollectors = {
    highPrice: number
    lowPrice: number
    openTime?: Date
    type?:String
    trend?:String
}

type klinesHL = {
    price: number
    openTime?: Date
    type?:String
    trend?:String
}

export type trend = {
    newTrend?:String
    time?:Date
    latestHigh:Number
    latestLow:Number
    break:Boolean
}

const hlCollector : Array<hlCollectors> = []
const trendChange : Array<trend> = []

const klinesLows : Array<klinesHL> = []
const klinesHighs : Array<klinesHL> = []

const trendfinder = async (inputData: Klines[]) => {

    inputData.map((kline, index)=>{

        const timeConverter = new Date(kline.openTime+7200000)

        if(index-1 > 0 && index+1 < inputData.length){

            if (kline.lowPrice < inputData[index+1].lowPrice && kline.lowPrice < inputData[index-1].lowPrice && inputData[index+1].openPrice < inputData[index+1].closePrice && inputData[index-1].closePrice < inputData[index-1].openPrice){
            
                klinesLows.push({
                    price : kline.lowPrice,
                    openTime:timeConverter
                })

                if(klinesLows.length-1 > 0){

                    if(klinesLows[klinesLows.length-2].price > kline.lowPrice){

                        hlCollector.push({
                            highPrice:klinesHighs[klinesHighs.length-1].price,
                            lowPrice:klinesLows[klinesLows.length-1].price,
                            openTime:timeConverter,
                            type:'Lower Low',
                            trend : 'DOWN'
                        })
                    }
                    
                    if(klinesLows[klinesLows.length-2].price < kline.lowPrice){

                        hlCollector.push({
                            highPrice: klinesHighs[klinesHighs.length-1].price,
                            lowPrice:klinesLows[klinesLows.length-1].price,
                            openTime:timeConverter,
                            type:'Higher Low',
                            trend : 'UP'
                        })
                    }
                }
            }
            
            if (kline.highPrice > inputData[index+1].highPrice && kline.highPrice > inputData[index-1].highPrice && inputData[index+1].openPrice > inputData[index+1].closePrice && inputData[index-1].closePrice > inputData[index-1].openPrice){
                
                klinesHighs.push({
                    price : kline.highPrice,
                    openTime:timeConverter
                })

                if(klinesLows.length-1 > 0){

                    if(klinesHighs[klinesHighs.length-2].price > kline.highPrice){

                        hlCollector.push({
                            highPrice: klinesHighs[klinesHighs.length-1].price,
                            lowPrice:klinesLows[klinesLows.length-1].price,
                            openTime:timeConverter,
                            type:'Lower High',
                            trend : 'DOWN'
                        })
                    }
                    
                    if(klinesHighs[klinesHighs.length-2].price < kline.highPrice){

                        hlCollector.push({
                            highPrice: klinesHighs[klinesHighs.length-1].price,
                            lowPrice:klinesLows[klinesLows.length-1].price,
                            openTime:timeConverter,
                            type:'Higher High',
                            trend : 'UP'
                        })
                    }
                }
            }  
        }
    })

    hlCollector.map((hl, index)=>{

        if(index-1 > 0){
            
            if(hl.trend != hlCollector[index-1].trend){
                trendChange.push({
                    newTrend:hl.trend,
                    time:hl.openTime,
                    latestHigh:hl.highPrice,
                    latestLow:hl.lowPrice,
                    break:true
                })
            }else{
                trendChange.push({
                    newTrend:hl.trend,
                    time:hl.openTime,
                    latestHigh:hl.highPrice,
                    latestLow:hl.lowPrice,
                    break:false
                })
            }
        }
    })

    return trendChange

}

export default trendfinder