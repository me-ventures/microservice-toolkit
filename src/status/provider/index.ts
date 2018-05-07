var data = {
    service: {
        name: 'test-service',
    },
    events: {
        consume: [],
        publish: [],
    },
    httpEndpoints: [],
};

var publishKeyLookup = {};
var publishExampleKeyLookup = {};
var consumeExampleKeyLookup = {};

export function getData(){
    return data;
}

export function reset(){
    data = {
        service: {
            name: 'test-service'
        },
        events: {
            consume: [],
            publish: []
        },
        httpEndpoints: [],
    };

    publishKeyLookup = {};
    publishExampleKeyLookup = {};
    consumeExampleKeyLookup = {};
}

export function setServiceInformation( name ){
    data.service.name = name;
}

let endpoints = {};
export function setHttpEndpointsFromConfig( config ){

    function checkForHttpValue( value ){
        if( value.startsWith('http://') || value.startsWith('https://') ){
            endpoints[value] = true;
        }
    }

    if( Array.isArray(config) ){
        config.forEach(setHttpEndpointsFromConfig);
    }

    else if( typeof config === 'object' ){
        for( let k in config ){
            setHttpEndpointsFromConfig(config[k]);
        }
    }

    else if( typeof config === 'string' ){
        checkForHttpValue(config);
    }

    data.httpEndpoints = Object.keys(endpoints);
}

export function addEventConsume( namespace, topic, shared, queueName, schema ){
    var event = {
        namespace: namespace,
        topic: topic,
        shared: shared == true,
        queueName: queueName || '',
        schema: schema || ''
    };

    data.events.consume.push(event);

    consumeExampleKeyLookup[namespace + topic] = {
        exampleAdded: false,
        idx: data.events.consume.length - 1
    };
}

export function setEventConsumeExample( namespace, topic, example ){
    var key = namespace + topic;

    if( typeof consumeExampleKeyLookup[key] !== 'object' ){
        throw new Error(
            "unknown key: " + key
        );
    } else if( ! consumeExampleKeyLookup[key].exampleAdded ) {

        // prevent a circular reference introduced later from causing
        // JSON.stringify to break
        let clonedExample = JSON.parse(JSON.stringify(example));

        data.events.consume[consumeExampleKeyLookup[key].idx].example = (
            clonedExample
        );

        consumeExampleKeyLookup[key].exampleAdded = true;
    }
}

export function addEventPublish( namespace, topic, schema ){
    if( ! publishKeyLookup[namespace + topic] ){
        var event = {
            namespace: namespace,
            topic: topic,
            schema: schema || ''
        };

        data.events.publish.push(event);

        publishKeyLookup[namespace + topic] = true;

        publishExampleKeyLookup[namespace + topic] = {
            exampleAdded: false,
            idx: data.events.publish.length - 1
        };
    }
}

export function setEventPublishExample( namespace, topic, example ){
    var key = namespace + topic;

    if( typeof publishExampleKeyLookup[key] !== 'object' ){
        throw new Error(
            "unknown key: " + key
        );
    } else if( ! publishExampleKeyLookup[key].exampleAdded ) {

        // prevent a circular reference introduced later from causing
        // JSON.stringify to break
        let clonedExample = JSON.parse(JSON.stringify(example));

        data.events.publish[publishExampleKeyLookup[key].idx].example = (
            clonedExample
        );

        publishExampleKeyLookup[key].exampleAdded = true;
    }
}
