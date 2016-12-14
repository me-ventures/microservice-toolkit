declare namespace MevToolkit {

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

declare var Toolkit: MevToolkit.ToolkitStatic;

declare module "microservice-toolkit" {
    export = Toolkit;
}
