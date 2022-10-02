import type { HeikinAshi } from '../chart/heikinAshi'
import { StochasticRSIOutput } from 'technicalindicators/declarations/momentum/StochasticRSI'

type Options = {
    heikinAshi: HeikinAshi,
    srsi: StochasticRSIOutput[]
    atr: number[]
}

const piluStrategy = ({ srsi, heikinAshi, atr}: Options) => {
        const LONG_LEVEL = 20
        const SHORT_LEVEL = 80

        const currentSrsri = srsi[srsi.length-1]
        const lastSrsi = srsi[srsi.length-2]
        const currenctAtr = atr[atr.length-1]
        const isLastCandleBullish = heikinAshi.bullish[heikinAshi.bullish.length-1]
        const isLastCandleBearish = heikinAshi.bearish[heikinAshi.bearish.length-1]
        const currentOpen = heikinAshi?.open?.[heikinAshi.open?.length-1]

        //Long
        if(currentOpen && currentSrsri.d < currentSrsri.k && lastSrsi.d < LONG_LEVEL && currentSrsri.d > LONG_LEVEL && isLastCandleBullish) {
            console.log("Long order")
            console.log("ATR:", currenctAtr)
            console.log("Open:", heikinAshi?.open?.[heikinAshi.open?.length-1])
            console.log("TP:", currentOpen + currenctAtr)
            console.log("SL:", currentOpen - currenctAtr/2)
            console.log(new Date())
        }       

        //Short
        if(currentOpen && currentSrsri.d > currentSrsri.k && lastSrsi.d > SHORT_LEVEL && currentSrsri.d < SHORT_LEVEL && isLastCandleBearish) {
            console.log("Short order")
            console.log("ATR:", currenctAtr)
            console.log("Open:", heikinAshi?.open?.[heikinAshi.open?.length-1])
            console.log("TP:", currentOpen - currenctAtr)
            console.log("SL:", currentOpen + currenctAtr/2)
            console.log(new Date())
        }   

}

export default piluStrategy