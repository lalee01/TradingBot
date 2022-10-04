import { BinanceClient } from '../connection'

const CRYPTO_PAIR = process.env.CRYPTO_PAIR

const getAccountInfo = async ():Promise<any>  => {
    try {
        const orders = await BinanceClient.futuresAccount()

        const positions = orders?.['positions'].filter((position)=> {
            return position.symbol === CRYPTO_PAIR && position.initialMargin !== '0'
        })
        const assets = orders?.['assets'].filter((position)=> {
            return position.asset === "BUSD"
        })

        return {
            positions,
            assets
        }
    } catch (e) {
        console.error(e)
    }

}

export default getAccountInfo