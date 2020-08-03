import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

import Extension = require('../extension');
import { EditorCommand } from './EditorCommand';

export class BiomeEditorCommand extends EditorCommand {

    id = "BiomeEditor";
    title = "Biome Editor";
    folder = "worldgen/biome";
    jsonKeys: string[] = [];

    private config: any;

    onReceiveMessage(message: any): boolean {
        switch (message.command) {
            case "init":
                this.sendConfig();
        }
        return true;
    }

    getKeys(message: any): string[] {
        let keys = this.jsonKeys;

        this.getKeysFromJson(keys, this.config, message.json);
        // remove emtpys

        return keys;
    }

    private sendConfig() {
        let text = fs.readFileSync(path.join(Extension.rootPath, 'resources/html_configs', 'biome.json'), 'utf8');
        this.config = JSON.parse(text !== '' ? text : '{}');
        let message = {
            command: 'init',
            config: this.config
        };

        Extension.panels.get(this.id)?.webview.postMessage(message);
    }

    private getKeysFromJson(keys: string[], json: any, doc: any) {
        for (let key in json) {
            keys.push(key);

            let docObj: any = {};
            if (doc) {
                docObj = doc[key];
            }
            if (json[key].type === 'Group') {
                if (json[key].children_type === 'children') {
                    this.getKeysFromJson(keys, json[key].children, docObj);
                } else if (json[key].children_type === 'item') {
                    for (let i of Object.keys(docObj)) {
                        keys.push(i);
                    }
                    this.getKeysFromJson(keys, { '': json[key].item }, docObj);
                }
            } else if (json[key].type === 'List') {
                if (json[key].children_type === 'item') {
                    this.getKeysFromJson(keys, { '': json[key].item }, docObj);
                } else if (json[key].children_type === 'children') {
                    for (let i in json[key].children) {
                        this.getKeysFromJson(keys, { '': json[key].children[i] }, docObj[i]);
                    }
                }
            }
        }
    }
}