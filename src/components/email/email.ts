import React from 'react';
import sendgrid, { MailDataRequired } from '@sendgrid/mail';
import { renderToStaticMarkup } from 'react-dom/server';

import config from 'config';

const SENDGRID_API_KEY = config.get('sendgrid.key');
const SENDGRID_FROM = config.get('sendgrid.from');
const SENDGRID_FROMNAME = config.get('sendgrid.fromName');


// Used to define string-replacing for various substitutions
const SUBSTITUTION_TAG = (name) => `%{${name}}%`;
// Whatever is returned here, when in an email, will be replaced with the value.
//  components/user schema values are imported automatically.

const UNSUBSCRIBE = SUBSTITUTION_TAG('unsubscribe');


interface EmailConfig {
    subject?: string;
    content: any;
    context?: any;
    [key: string]: any;
}

export class Email<TypeContext> implements EmailConfig {
    subject = "Kent Hack Enough";
    context: any = {};
    attachments = [];
    content: any;

    constructor(args: EmailConfig) {
        Object.assign(this, args);
    }

    contents(ctx?: TypeContext) {
        const contentType = typeof this.content;
        let content = this.content;
        const context = {
            ...(this.context),
            ...(ctx || {}),
            UNSUBSCRIBE,
            __proto__: this,
        };
        if (contentType == 'function') {
            content = content(context)
        }
        if (React.isValidElement(content)) {
            content = renderToStaticMarkup(content);
        } else {
            // do markdown
        }
        return {
            html: content,
        };
    }

    async send(email: string, ctx?: TypeContext) {
        const payload: MailDataRequired = {
            from: {
                email: SENDGRID_FROM,
                name: SENDGRID_FROMNAME
            },
            to: email,
            ...this.contents(ctx),
            subject: this.subject,
            trackingSettings: {
                subscriptionTracking: {
                    enable: true,
                    substitutionTag: UNSUBSCRIBE,
                }
            },
        };
        console.log(payload);
        // sendgrid.send(payload);
    }
}