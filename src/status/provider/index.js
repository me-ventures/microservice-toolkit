module.exports = {
    setServiceInformation: setServiceInformation,
    addEventConsume: addEventConsume,
    addEventConsumeExample: addEventConsumeExample,
    addEventPublish: addEventPublish,
    addEventPublishExample: addEventPublishExample,
    getData: getData,
    reset: reset
};


var data = {
    service: {
        name: 'test-service'
    },
    events: {
        consume: [],
        publish: []
    }
};

var publishKeyLookup = {};

function getData(){
    return data;
}

function reset(){
    data = {
        service: {
            name: 'test-service'
        },
        events: {
            consume: [],
            publish: []
        }
    };

    publishKeyLookup = {};
}

function setServiceInformation( name ){
    data.service.name = name;
}

function addEventConsume( namespace, topic, shared, queueName, schema ){
    var event = {
        namespace: namespace,
        topic: topic,
        shared: shared == true,
        queueName: queueName || '',
        schema: schema || ''
    };

    data.events.consume.push(event);
}

function addEventConsumeExample( namespace, topic, queueName ){
    // @todo
}

function addEventPublish( namespace, topic, schema ){
    if( ! publishKeyLookup[namespace + topic] ){
        var event = {
            namespace: namespace,
            topic: topic,
            schema: schema || ''
        };

        data.events.publish.push(event);

        publishKeyLookup[namespace + topic] = true;
    }
}

function addEventPublishExample( namespace, topic ){
    // @todo
}
