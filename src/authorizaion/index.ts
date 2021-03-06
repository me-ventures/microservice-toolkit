import * as request from "request-promise-native";
let endpoint: string;

export function init( _endpoint: string ): void {
    endpoint = _endpoint;
}

export function checkPermission( operation: string, userId: number|string )
    : Promise<boolean>
{
    return request({
        method: 'GET',
        uri: endpoint + `/v1/user/${userId}/hasPermission/${operation}`,
        simple: false,
        resolveWithFullResponse: true
    }).then((res: any) => {
        return res.statusCode === 200;
    });
}

export interface AuthorizationConfig {
    endpoint: string
}
