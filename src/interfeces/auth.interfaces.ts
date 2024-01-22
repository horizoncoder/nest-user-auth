export interface TokensInterface {
    accessToken: string,
    refreshToken: string

}
export interface JwtPayloadInterface{ id: number,
    role: number,
    iat: number,
    exp: number
}

