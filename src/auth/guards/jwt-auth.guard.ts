import { ExecutionContext } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { GqlExecutionContext } from "@nestjs/graphql";
import { strategiesNames } from '../enum/strategies-names'


export class JwtAuthGuard extends AuthGuard(strategiesNames.jwt_http) {

    getRequest(context: ExecutionContext) {
        const ctx = GqlExecutionContext.create(context);
        const request = ctx.getContext().req;
        return request;
    }

}