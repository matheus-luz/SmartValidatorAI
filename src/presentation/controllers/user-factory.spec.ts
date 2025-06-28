/* eslint-disable @typescript-eslint/no-unused-vars */
import { InvalidParamError } from '../errors/invalid-param-error'
import { MissingParamError } from '../errors/missing-param-erros'
import { ServerError } from '../errors/server-error'
import { EmailValidator } from '../protocols/email-validator'
import { UserFactoryController } from './user-factory'

interface SutTypes {
    sut: UserFactoryController,
    emailValidatorStub: EmailValidator
}

const makeSut = (): SutTypes => {
    class EmailValidatorStub implements EmailValidator {
        isValid(email: string): boolean {
            return true
        }
    }

    const emailValidatorStub = new EmailValidatorStub()
    const sut = new UserFactoryController(emailValidatorStub)
    return {
        sut, 
        emailValidatorStub
    }
}

describe('UserFactory Controller', () => {
    test('Should return 440 if no email is provided', () => {
        const { sut } = makeSut()
        const httpRequest = {
            body: {
                password: 'any_password',
            }
        }
        const httpResponse = sut.handle(httpRequest)
        expect(httpResponse.statusCode).toBe(400)
        expect(httpResponse.body).toEqual(new MissingParamError('email'))
    })

    test('Should return 440 if no password is provided', () => {
        const { sut } = makeSut()
        const httpRequest = {
            body: {
                email: 'any_email@mail.com',
            }
        }
        const httpResponse = sut.handle(httpRequest)
        expect(httpResponse.statusCode).toBe(400)
        expect(httpResponse.body).toEqual(new MissingParamError('password'))
    })

    test('Should return 440 if an invalid email is provided', () => {
        const { sut, emailValidatorStub } = makeSut()
        jest.spyOn(emailValidatorStub, 'isValid').mockReturnValueOnce(false)
        const httpRequest = {
            body: {
                email: 'invalid_email@mail.com',
                password: 'any_password',
            }
        }
        const httpResponse = sut.handle(httpRequest)
        expect(httpResponse.statusCode).toBe(400)
        expect(httpResponse.body).toEqual(new InvalidParamError('email'))
    })

    test('Should call EmailValidator with correct email', () => {
        const { sut, emailValidatorStub } = makeSut()
        const isValidSpy = jest.spyOn(emailValidatorStub, 'isValid')
        const httpRequest = {
            body: {
                email: 'any_email@mail.com',
                password: 'any_password',
            }
        }
        sut.handle(httpRequest)
        expect(isValidSpy).toHaveBeenCalledWith('any_email@mail.com')
    })

    test('Should returns 500 if EmailValidar throws', () => {
        class EmailValidatorStub implements EmailValidator {
            isValid(email: string): boolean {
                throw new Error()
            }
        }
        const emailValidatorStub = new EmailValidatorStub()
        const sut = new UserFactoryController(emailValidatorStub)
        const httpRequest = {
            body: {
                email: 'any_email@mail.com',
                password: 'any_password',
            }
        }
        const httpResponse = sut.handle(httpRequest)
        expect(httpResponse.statusCode).toBe(500)
        expect(httpResponse.body).toEqual(new ServerError())
    })
})