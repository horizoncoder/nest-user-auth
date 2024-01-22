import { Injectable, ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class RefreshTokenGuard extends AuthGuard('jwt-refresh') {

    //it is necessary to get cookies from the request because cookies are protected we can not do it through JavaScript on the client.
    canActivate(context: ExecutionContext) {
        const request = context.switchToHttp().getRequest();
        const refreshToken = request.cookies['refreshToken'];

        if (refreshToken) {
            request.headers['authorization'] = `Bearer ${refreshToken}`;
        }

        return super.canActivate(context);
    }
}
