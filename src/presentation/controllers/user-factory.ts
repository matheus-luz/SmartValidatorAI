import { badRequest, serverError } from './../helpers/http-helpers';
import { HttpRequest, HttpResponse } from '../protocols/http'
import { MissingParamError } from '../errors/missing-param-erros'
import { Controller } from '../protocols/controller';
import { EmailValidator } from '../protocols/email-validator';
import { InvalidParamError } from '../errors/invalid-param-error';

export class UserFactoryController implements Controller {
    private readonly emailValidator: EmailValidator

    constructor (emailValidator: EmailValidator) {
        this.emailValidator = emailValidator
    }

    handle(httpRequest: HttpRequest): HttpResponse {
        try {
            const requiredFields = ['email', 'password']
            for (const field of requiredFields) {
                if (!httpRequest.body[field]) {
                    return badRequest(new MissingParamError(field))
                }
            }
            const isValid = this.emailValidator.isValid(httpRequest.body.email)
            if (!isValid) {
                return badRequest(new InvalidParamError('email'))
            }

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