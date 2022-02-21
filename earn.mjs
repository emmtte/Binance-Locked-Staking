#!/usr/bin/env node

import axios from 'axios'
import { binanceKey, binanceSecret, telegramToken, telegramChatId } from './config.mjs'
import { Spot } from '@binance/connector' ; const spot = new Spot(binanceKey,binanceSecret)
import Big from 'big.js'
import schedule from 'node-schedule'
import { EventEmitter } from 'events' ; const event = new EventEmitter()
import { readFile, writeFile } from 'fs/promises'
import { Bot } from 'grammy' ; const bot = new Bot(telegramToken)

let locked={}, savings={}, staking={} , balances={}

String.prototype.right = function(width=6) {return this.padStart(width, ' ').substring(0, width) }
String.prototype.left  = function(width=6) {return this.padEnd  (width, ' ').substring(0, width) }

process.on('uncaughtException', err => {console.log(err.stack)})
process.once('SIGINT', async err => { process.exit()} )

process.stdout.write('API Permissions ')
await spot.apiPermissions({recvWindow: 10000}) // https://binance-docs.github.io/apidocs/spot/en/#get-api-key-permission-user_data
.then( res => { console.log('✓') ; let {enableReading} = res.data ; if (enableReading==false) { process.exit()}})
.catch( error => { if (error.response) {let {response:{data:{code,msg}}} =error ; console.log(`✗ ${msg} (${code})`) } else {console.log('✗ ',error.message)} ; process.exit() })

event.on('earn', async ()  => {

//await readFile(`savings.json`).then(res => savings = JSON.parse(res)).catch (err => console.log(err.message) )

process.stdout.write('Locked Savings')
  await spot.savingsProductList('CUSTOMIZED_FIXED',{status:'SUBSCRIBABLE',current:1,size:100})
    .then( async ({data}) => {await writeFile(`savings.json`, JSON.stringify(data, null, 1)) ; ; savings = data ; console.log('✓')})
    .catch( error => { if (error.response) {let {response:{data:{code,msg}}} =error ; console.log(`✗ ${msg} (${code})`) } else {console.log('✗ ',error.message)} })

for (const item of savings) {
  let {asset,duration,lotSize,interestRate}=item
  interestRate = Big(interestRate).times(100).toNumber()
  if (asset in locked) {
    if (asset.rate > interestRate ) {locked[asset] = {days:duration,rate:interestRate,min:lotSize*1,earn:'°'}}
  }
  else { locked[asset] = {days:duration,rate:interestRate,min:lotSize*1,earn:'°'} }
}


//await readFile(`staking.json`).then(res => staking = JSON.parse(res)).catch (err => console.log(err.message) )

process.stdout.write('Locked Stakings')
  await axios.get('https://www.binance.com/gateway-api/v1/friendly/pos/union?pageSize=100&pageIndex=1')
    .then( async ({data}) => { await writeFile(`staking.json`, JSON.stringify(data, null, 1) ) ; staking = data ; console.log('✓') })
    .catch(error => {console.error(error.message) ; process.exit()})

if (staking.total > 100) {console.log(`App error please open an issue for update (${staking.total})`) ; process.exit()}

staking=staking.data

for (const token of staking) {
  for (const project of token.projects) {
    if (project.sellOut == false) {
      let asset = project.asset
      let rate = Big(project.config.annualInterestRate).times(100).toNumber()
      console.log(rate)
      if (project.config.extraInterestAsset ) {/*console.log('on passe ici');asset=`${asset}/${project.config.extraInterestAsset}`*/ rate = Big(project.config.extraAnnualInterestRate).times(100).toNumber()}
       
      if (asset in locked) {
        if (rate > locked[asset].rate ) {locked[asset] = { days:project.duration*1, rate:rate, min:project.config.minPurchaseAmount*1, earn:''}} 
      }
      else { locked[asset] = {days:project.duration*1, rate: rate, min:project.config.minPurchaseAmount*1, earn:''} }
    }
  }
}

console.log(locked)


//await readFile(`balances.json`).then(res => balances = JSON.parse(res)).catch (err => console.log(err.message) )

process.stdout.write('Balances')
  await spot.account()
    .then( async ({data}) => { await writeFile(`balances.json`, JSON.stringify(data.balances, null, 1) ) ; balances = data.balances ;  console.log('✓')})
    .catch(error => {console.log(error.message) ; process.exit()})

let msg = []
 for (const product of balances) {
  if (product.asset in locked) {
    console.log(product.asset,product.free*1,'>',locked[product.asset].min)
    let lock=''
    if (product.locked*1 !== 0) {lock='*'}
    if (product.free*1 > locked[product.asset].min) { 
      msg.push(`${product.asset.left(6)}${lock}${locked[product.asset].rate.toString().right(6)}% ${locked[product.asset].days.toString().right(3)}D ${product.free.right(11)}\n`)
   }
  }
}


console.log(msg)


  if (msg.length) {msg=msg.slice(-125).join('') ; await bot.api.sendMessage(telegramChatId,`\`\`\`\n${msg}\`\`\``,{parse_mode: 'Markdown'})}

})

event.emit('earn')
schedule.scheduleJob('40 00 2/6 * * *', () => { event.emit('earn') }) // At second 40, minute 0, every day 6 hours
