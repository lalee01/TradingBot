import type { HeikinAshi } from '../chart/heikinAshi'
import { StochasticRSIOutput } from 'technicalindicators/declarations/momentum/StochasticRSI'
import sendTelegramMessage from '../telegram/telegram'

type Options = {
    heikinAshi: HeikinAshi,
    srsi: StochasticRSIOutput[]
    atr: number[]
    busdBalance: string
}

const piluStrategy = async ({ srsi, heikinAshi, atr, busdBalance}: Options) => {
        const LONG_LEVEL = 20
        const SHORT_LEVEL = 80

        const currentSrsri = srsi[srsi.length-1]
        const lastSrsi = srsi[srsi.length-2]
        const thirdSrsi = srsi[srsi.length-3]
        const currenctAtr = atr[atr.length-1]
        const isLastCandleBullish = heikinAshi.bullish[heikinAshi.bullish.length-2]
        const isLastCandleBearish = heikinAshi.bearish[heikinAshi.bearish.length-2]
        const currentOpen = heikinAshi?.open?.[heikinAshi.open?.length-1]
        //Long
        if(
            currentOpen &&
            (currentSrsri.d < currentSrsri.k && lastSrsi.d < LONG_LEVEL && currentSrsri.d > LONG_LEVEL && isLastCandleBullish)
            
        ) {
            sendTelegramMessage(`Long order\n ATR: ${currenctAtr}}\n Open: ${currentOpen}\nTP: ${currentOpen + currenctAtr}\n SL: ${currentOpen - currenctAtr/2}`)
        }       

        if(
            ( thirdSrsi.d >= thirdSrsi.k && lastSrsi.d + 5 < lastSrsi.k && isLastCandleBullish )
        ) {
            sendTelegramMessage(`Beta Signal:\nLong order\n ATR: ${currenctAtr}}\n Open: ${currentOpen}\nTP: ${(currentOpen ?? 0) + currenctAtr}\n SL: ${(currentOpen ?? 0) - currenctAtr/2}`)
        }
        //Short
        if(currentOpen && currentSrsri.d > currentSrsri.k && lastSrsi.d > SHORT_LEVEL && currentSrsri.d < SHORT_LEVEL && isLastCandleBearish) {
            sendTelegramMessage(`Short order\n ATR: ${currenctAtr}}\n Open: ${currentOpen}\nTP: ${currentOpen - currenctAtr}\n SL: ${currentOpen + currenctAtr/2}`)
        }   

        if(
            ( thirdSrsi.d <= thirdSrsi.k && lastSrsi.d > lastSrsi.k + 5 && isLastCandleBearish )
        ) {
            sendTelegramMessage(`Beta Signal: Short order\n ATR: ${currenctAtr}}\n Open: ${currentOpen}\nTP: ${(currentOpen ?? 0) - currenctAtr}\n SL: ${(currentOpen ?? 0) + currenctAtr/2}`)
        }

}

export default piluStrategy