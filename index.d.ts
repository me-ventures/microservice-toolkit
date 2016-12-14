declare namespace MevToolkit {

    interface Toolkit {
        init: any,
        initFromConfig( config : Config ): Toolkit,
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
        swagger ?: any
    }
}

export = MevToolkit;

