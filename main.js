'use strict';

/*
 * Created with @iobroker/create-adapter v1.34.0
 */

// The adapter-core module gives you access to the core ioBroker functions
// you need to create an adapter
const utils = require('@iobroker/adapter-core');

// Load your modules here, e.g.:
// const fs = require("fs");

class Vizard extends utils.Adapter {

    /**
     * @param {Partial<utils.AdapterOptions>} [options={}]
     */
    constructor(options) {
        super({
            ...options,
            name: 'vizard',
        });
        this.on('ready', this.onReady.bind(this));
        this.on('stateChange', this.onStateChange.bind(this));
        // this.on('objectChange', this.onObjectChange.bind(this));
        // this.on('message', this.onMessage.bind(this));
        this.on('unload', this.onUnload.bind(this));
    }

    /**
     * Is called when databases are connected and adapter received configuration.
     */
    async onReady() {
        this.log.info('Getting web config');
        const webConfig = await this.getForeignObjectAsync('system.adapter.web.0');
        const overrideConfig = {
            webPort: (webConfig && webConfig.native && webConfig.native.port) || 8082,
            socketPort: 8500 + this.instance,
            socketSecure: false,
            web_protocol: 'http'
        };
        const config = await this.getForeignObjectAsync('system.adapter.' + this.namespace);
        if (!config) {
            this.terminate('', 1);
        }
        const defaultSocketPort = 8500 + this.instance;
        config.native = {
            ...config.native,
            ...overrideConfig,
            socketPort: defaultSocketPort
        };
        this.log.debug('Web config: ' + JSON.stringify(config));
        await this.setForeignObjectAsync(config._id, config);

        this.log.info('Got web config');
        this.log.info('config state mappings: ' + this.config.stateMappings);

        for (const stateMapping of this.config.stateMappings) {
            this.subscribeForeignStates(stateMapping.sourceState);
        }

        this.writeFileAsync(this.name, 'test.html', 'this is a test!!');

        // examples for the checkPassword/checkGroup functions
        let result = await this.checkPasswordAsync('admin', 'iobroker');
        this.log.info('check user admin pw iobroker: ' + result);

        result = await this.checkGroupAsync('admin', 'admin');
        this.log.info('check group user admin group admin: ' + result);
    }

    /**
     * Is called when adapter shuts down - callback has to be called under any circumstances!
     * @param {() => void} callback
     */
    onUnload(callback) {
        try {
            // Here you must clear all timeouts or intervals that may still be active
            // clearTimeout(timeout1);
            // clearTimeout(timeout2);
            // ...
            // clearInterval(interval1);

            callback();
        } catch (e) {
            callback();
        }
    }

    // If you need to react to object changes, uncomment the following block and the corresponding line in the constructor.
    // You also need to subscribe to the objects with `this.subscribeObjects`, similar to `this.subscribeStates`.
    // /**
    //  * Is called if a subscribed object changes
    //  * @param {string} id
    //  * @param {ioBroker.Object | null | undefined} obj
    //  */
    // onObjectChange(id, obj) {
    //     if (obj) {
    //         // The object was changed
    //         this.log.info(`object ${id} changed: ${JSON.stringify(obj)}`);
    //     } else {
    //         // The object was deleted
    //         this.log.info(`object ${id} deleted`);
    //     }
    // }

    /**
     * Is called if a subscribed state changes
     * @param {string} id
     * @param {ioBroker.State | null | undefined} state
     */
    onStateChange(id, state) {
        if (state) {
            // The state was changed
            this.log.info(`state ${id} changed: ${state.val} (ack = ${state.ack})`);
        } else {
            // The state was deleted
            this.log.info(`state ${id} deleted`);
        }
    }

    // If you need to accept messages in your adapter, uncomment the following block and the corresponding line in the constructor.
    // /**
    //  * Some message was sent to this instance over message box. Used by email, pushover, text2speech, ...
    //  * Using this method requires "common.messagebox" property to be set to true in io-package.json
    //  * @param {ioBroker.Message} obj
    //  */
    // onMessage(obj) {
    //     if (typeof obj === 'object' && obj.message) {
    //         if (obj.command === 'send') {
    //             // e.g. send email or pushover or whatever
    //             this.log.info('send command');

    //             // Send response in callback if required
    //             if (obj.callback) this.sendTo(obj.from, obj.command, 'Message received', obj.callback);
    //         }
    //     }
    // }

}

if (require.main !== module) {
    // Export the constructor in compact mode
    /**
     * @param {Partial<utils.AdapterOptions>} [options={}]
     */
    module.exports = (options) => new Vizard(options);
} else {
    // otherwise start the instance directly
    new Vizard();
}
