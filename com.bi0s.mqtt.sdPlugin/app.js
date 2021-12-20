function sendMqtt(broker, port, clientid, topic, msg) {
    if(clientid == "") {
        clientid = makeId(8);
    }
    
    client = new Paho.MQTT.Client(broker, Number(port), clientid);
    client.connect({ onSuccess: () =>
    {
        message = new Paho.MQTT.Message(msg);
        message.destinationName = topic;
        client.send(message);
        client.disonnect();
    }});
}

$SD.on('connected', (jsonObj) => connected(jsonObj));

function connected(jsonObj) {
    console.log(`[connected] ${JSON.stringify(jsonObj)}`);
    $SD.on('com.bi0s.mqtt.action.willAppear', (jsonObj) => action.onWillAppear(jsonObj));
    $SD.on('com.bi0s.mqtt.action.keyDown', (jsonObj) => action.onKeyDown(jsonObj));
    $SD.on('com.bi0s.mqtt.action.didReceiveSettings', (jsonObj) => action.onDidReceiveSettings(jsonObj));
    $SD.on('com.bi0s.mqtt.action.propertyInspectorDidAppear', (jsonObj) => { });
    $SD.on('com.bi0s.mqtt.action.propertyInspectorDidDisappear', (jsonObj) => { });
    $SD.on('com.bi0s.mqtt.action.sendToPlugin', (jsonObj) => action.onSendToPlugin(jsonObj));
};

function makeId(length) {
    var result           = '';
    var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for ( var i = 0; i < length; i++ ) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
   }
   return result;
}

const action = {
    onDidReceiveSettings: (jsonObj) => {
        console.log(`[onDidReceiveMessage] ${JSON.stringify(jsonObj)}`);
    },
    onWillAppear: (jsonObj) => {
        console.log(`[onWillAppear] ${JSON.stringify(jsonObj)}`);
        $SD.api.sendToPropertyInspector(jsonObj.context, Utils.getProp(jsonObj, "payload.settings", {}), jsonObj.action);
    },
    onSendToPlugin: (jsonObj) => {
        console.log(`[onSendToPlugin] ${JSON.stringify(jsonObj)}`);
        if (jsonObj.payload) {
            $SD.api.setSettings(jsonObj.context, jsonObj.payload);
        }
    },
    onKeyDown: (jsonObj) => {
        let settings = jsonObj.payload.settings;

        sendMqtt(settings.valBroker, settings.valPort, settings.valClientId, settings.valTopic, settings.valMessage);
    }
};