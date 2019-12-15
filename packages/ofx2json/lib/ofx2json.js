'use strict';

const fs = require('fs')

module.exports = ofx2Json;

function ofx2Json(path) {
    try {
        return new Promise((resolve, reject) => {
            const data = fs.readFileSync(path, 'utf8');

            const ofx = data.split('<OFX>', 2)

            const header = ofx[0].split(/\r?\n/)
                .map((line) => (line.split(':')))
                .reduce((o, [k, v]) => ({ ...o, [k]: v }), {})

            let content = ofx[1]
                .replace(/>\s+</g, '><')
                .replace(/\s+</g, '<')
                .replace(/>\s+/g, '>')
                .replace(/<([A-Z0-9_]*)+\.+([A-Z0-9_]*)>([^<]+)/g, '<\$1\$2>\$3')
                .replace(/<(\w+?)>([^<]+)/g, '<\$1>\$2</\$1>');

            const regex = /(<\w+[^<]*?)\s+([\w-]+)="([^"]+)">/
            while (content.match(regex)) content = content.replace(regex, '<$2>$3</$2>$1>');

            content = content.replace(/\s/g, ' ')
                .replace(/< *\?[^>]*?\? *>/g, '')
                .replace(/< *!--[^>]*?-- *>/g, '')
                .replace(/< *(\/?) *(\w[\w-]+\b):(\w[\w-]+\b)/g, '<$1$2_$3')
                .replace(/< *(\w[\w-]+\b)([^>]*?)\/ *>/g, '< $1$2>')
                .replace(/(\w[\w-]+\b):(\w[\w-]+\b) *= *"([^>]*?)"/g, '$1_$2="$3"')
                .replace(/< *(\w[\w-]+\b)((?: *\w[\w-]+ *= *" *[^"]*?")+ *)>( *[^< ]*?\b.*?)< *\/ *\1 *>/g, '< $1$2 value="$3">')
                .replace(/< *(\w[\w-]+\b) *</g, '<$1>< ')
                .replace(/> *>/g, '>')
                .replace(/"/g, '\\"')
                .replace(/< *(\w[\w-]+\b) *>([^<>]*?)< *\/ *\1 *>/g, '"$1":"$2",')
                .replace(/< *(\w[\w-]+\b) *>([^<>]*?)< *\/ *\1 *>/g, '"$1":[{$2}],')
                .replace(/< *(\w[\w-]+\b) *>(?=("\w[\w-]+\b)":\{.*?\},\2)(.*?)< *\/ *\1 *>/, '"$1":{}$3},')
                .replace(/],\s*?".*?": *\[/g, ',')
                .replace(/< \/(\w[\w-]+\b)\},\{\1>/g, '},{')
                .replace(/< *(\w[\w-]+\b)[^>]*?>/g, '"$1":{')
                .replace(/< *\/ *\w[\w-]+ *>/g, '},')
                .replace(/\} *,(?= *(\}|\]))/g, '}')
                .replace(/] *,(?= *(\}|\]))/g, ']')
                .replace(/" *,(?= *(\}|\]))/g, '"')
                .replace(/ *, *$/g, '');

            resolve({ header, content: JSON.parse(`{${content}`) })
        })

    } catch (e) {
        throw e.message
    }

}
