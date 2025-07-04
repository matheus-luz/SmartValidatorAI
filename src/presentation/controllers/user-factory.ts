import { AddAccount } from './../../domain/usecases/add-account';
import { badRequest, serverError } from './../helpers/http-helpers';
import { HttpRequest, HttpResponse, Controller, EmailValidator } from '../protocols'
import { MissingParamError, InvalidParamError } from '../errors'

export class UserFactoryController implements Controller {
    private readonly emailValidator: EmailValidator
    private readonly addAccount: AddAccount

    constructor (emailValidator: EmailValidator, addAccount: AddAccount) {
        this.emailValidator = emailValidator
        this.addAccount = addAccount
    }

    handle(httpRequest: HttpRequest): HttpResponse {
        try {
            const requiredFields = ['email', 'password', 'passwordConfirmation']
            for (const field of requiredFields) {
                if (!httpRequest.body[field]) {
                    return badRequest(new MissingParamError(field))
                }
            }

            const { name, email, password, passwordConfirmation } = httpRequest.body;

            if (password !== passwordConfirmation) {
                return badRequest(new InvalidParamError('passwordConfirmation'))
            }

            const isValid = this.emailValidator.isValid(email)
            if (!isValid) {
                return badRequest(new InvalidParamError('email'))
            }

            this.addAccount.add({ name, email, password })
            return {
                statusCode: 200,
                body: ''
            }
        } catch (error) {
            console.error(error);
            return serverError()
        }
    }
}