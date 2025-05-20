
const riskMultiplier= Number(process.env.RISK ?? 1)
const feeCorrectionForLoss = Number(process.env.FEE_CORRECTION ?? 1)

type settingProps = {
    entryPrice : number
    stoplossPrice: number
    availableBalance: number
  }

const riskManagement = ({entryPrice,stoplossPrice,availableBalance}:settingProps) =>{

  const riskInPrice = availableBalance * feeCorrectionForLoss * (0.01 * riskMultiplier)
  const distance = Math.abs(entryPrice - stoplossPrice)
  const quantity =riskInPrice / distance

return quantity
}

export default riskManagement