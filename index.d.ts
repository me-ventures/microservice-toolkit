declare namespace Toolkit {

    interface ToolkitStatic {
        init: any,
        initFromConfig( config : Config ): ToolkitStatic,
        authorization: any,
        http: any,
        metrics: any,
        context: any,
        status: any,
        logger: any
    }

    export interface Config {
        authorization ?: any,
        http ?: any,
        metrics ?: any,
        context ?: any,
        status ?: any,
        logger ?: any,
        swagger ?: any,
        logger ?: any
    }
}


declare var toolkit: Toolkit.ToolkitStatic;

declare module "microservice-toolkit" {
    export = toolkit;
}
