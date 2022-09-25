import { CandleList, stochasticrsi } from 'technicalindicators'

type Options = {
    rsiPeriod?: number
    stochasticPeriod?: number 
    kPeriod?: number
    dPeriod?: number
}

const srsi = (inputData: CandleList, { rsiPeriod = 14, stochasticPeriod = 14, kPeriod = 3, dPeriod = 3}: Options) => {
    return stochasticrsi({values: inputData.close ?? [], rsiPeriod, stochasticPeriod, kPeriod, dPeriod})
}

export default srsi