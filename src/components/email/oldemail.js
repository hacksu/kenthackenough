import fetch from 'node-fetch';
import marked from 'marked';
import { mpath } from 'utils/paths';
import mime from 'mime-types';

import config from 'config';

const SENDGRID_API_KEY = config.get('Sendgrid.key');
const SENDGRID_FROM = config.get('Sendgrid.from');
const SENDGRID_FROMNAME = config.get('Sendgrid.fromName');


// Used to define string-replacing for various substitutions
const SUBSTITUTION_TAG = (name) => `%{${name}}%`;
// Whatever is returned here, when in an email, will be replaced with the value.
//  components/user schema values are imported automatically.


// Sendgrid base payload
let defaultPayload = {
    from: {
        email: SENDGRID_FROM,
        name: SENDGRID_FROMNAME,
    },
    reply_to: {
        email: SENDGRID_FROM,
        name: SENDGRID_FROMNAME,
    },
    personalizations: [

    ],
    content: [

    ],
    tracking_settings: {
        subscription_tracking: {
            enable: true,
            substitution_tag: SUBSTITUTION_TAG('unsubscribe'),
        }
    }
};
const DEFAULT_PAYLOAD = JSON.stringify(defaultPayload);


class Email {
    subject = "Kent Hack Enough";
    contents = {};
    attachments = [];

    constructor(args={}) {
        //Object.assign(this, args);
        for (let x in args) {
            if (x in this && typeof this[x] == 'function') {
                this[x](args[x])
            } else {
                this[x] = args[x];
            }
        }
    }

    text(str) {
        this.contents['text/plain'] = str;
        return this;
    }

    markdown(str) {
        this.contents['text/html'] = {
            str,
            compile: function() {
                return marked(this.str);
            },
        }
    }

    html(str) {
        this.contents['text/html'] = str;
        return this;
    }

    export() {
        return Object.entries(this.contents).map(([key, value_]) => {
            let value = value_;
            if (typeof value != 'string' && 'compile' in value) {
                value = value.compile();
            }
            return {
                type: key,
                value,
            }
        })
    }

    attach(args, name) {
        let attachment = {};
        if (typeof args == 'string') {
            let path = args;
            attachment.content = fs.readFileSync(path);
            attachment.type = mime.lookup(path);
            if (name) {
                attachment.filename = name;
            }
        } else {
            Object.assign(attachment, args);
            if (!('type' in attachment)) {
                attachment.type = mime.lookup(path);
            }
        }
        if (!('content' in attachment)) {
            throw new Error("Attachment needs content!")
        }
        if (!(attachment.content instanceof Buffer)) {
            throw new Error("Content must be in the form of a buffer!")
        }
        if (!('filename' in attachment)) {
            throw new Error("Attachment needs filename!");
        }
        attachment.content = attachment.content.toString('base64');
        this.attachments.push(attachment);
        return this;
    }

    dispatch(...users) {
        let { subject, attachments } = this;
        let payload = Object.assign(JSON.parse(DEFAULT_PAYLOAD), {
            subject,
            attachments,
        });
        payload.personalizations = users.map(user => {
            let { email, name } = user;
            let substitutions = Object.fromEntries(Object.entries(mpath.getAll(user)).map(([key, value]) => {
                return [SUBSTITUTION_TAG(key), value]
            }));
            return {
                to: [
                    {
                        email,
                        name,
                    }
                ],
                substitutions,
            }
        })
        payload.content = this.export();
        // console.log(payload);
        return fetch('https://api.sendgrid.com/v3/mail/send', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${SENDGRID_API_KEY}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        }).then(res => {
            return {
                success: true,
            };
        }).catch(err => {
            return {
                success: false,
                error: err,
            }
        })
    }
}

export { Email };