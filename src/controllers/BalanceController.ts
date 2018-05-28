import { getManager, Transaction, TransactionManager, EntityManager, getRepository } from 'typeorm'
import { Balance } from '../entity/Balance'
import { Controller, Param, Get, Post, Body } from 'routing-controllers'
import { BalanceBodyInterface } from '../lib/types'
import BalanceAlreadyExist from '../lib/errors/BalanceAlreadyExist'
import ClassValidationFail from '../lib/errors/ClassValidationFail'
import Joi from 'joi'
import { balanceBodySchema, uniqueNameSchema, uniqueNameSchemaLike } from '../constraints/schemas'
import BalanceNotFound from '../lib/errors/BalanceNotFound'

@Controller()
export class BalanceController {

  @Get('/balances')
  async getAll () {
    const balances: Balance[] = await getManager().find(Balance)
    if (balances.length === 0) throw new BalanceNotFound()
    return balances
  }

  @Get('/balances/:uniqueName')
  async getOne (@Param('uniqueName') uniqueName: string) {
    const { error, value } = Joi.validate<any>(uniqueName, uniqueNameSchemaLike)
    if (error != null) return (new ClassValidationFail()).message = error.message

    const balance: Balance = await getRepository(Balance).findOne({ uniqueName: value })
    if (balance == null) throw new BalanceNotFound()

    return balance
  }

  @Post('/balances')
  @Transaction()
  async createOne (@TransactionManager() manager: EntityManager, @Body() body: BalanceBodyInterface): Promise<any> {

    const { error, value } = Joi.validate<BalanceBodyInterface>(body, balanceBodySchema)

    if (error != null) throw new ClassValidationFail(error.message)
    let { uniqueName, amount } = value
    amount = parseInt(`${amount}`, 10)

    const balance: Balance = await getRepository(Balance).findOne({ uniqueName })
    if (balance != null) throw new BalanceAlreadyExist()

    const newBalance: Balance = getRepository(Balance).create({
      uniqueName,
      amount
    })

    return manager.save(newBalance)
  }

  @Post('/balances/delete')
  @Transaction()
  async deleteOne (@TransactionManager() manager: EntityManager, @Body() body: BalanceBodyInterface): Promise<any> {
    const { error, value } = Joi.validate(body, uniqueNameSchema)

    if (error != null) throw new ClassValidationFail(error.message)
    let { uniqueName } = value

    const balance: Balance = await getRepository(Balance).findOne({ uniqueName })
    if (balance == null) throw new BalanceNotFound()

    return getRepository(Balance).delete(balance)
  }
}
