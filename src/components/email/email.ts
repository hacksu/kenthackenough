import React from 'react';
import sendgrid, { MailDataRequired } from '@sendgrid/mail';
import { renderToStaticMarkup } from 'react-dom/server';

import { EmailSent } from '@/events';

import config from 'config';

const SENDGRID_API_KEY = config.get('sendgrid.key');
const SENDGRID_FROM = config.get('sendgrid.from');
const SENDGRID_FROMNAME = config.get('sendgrid.fromName');

sendgrid.setApiKey(SENDGRID_API_KEY);

// todo: extract linked assets from emails and embed them as attachments

// todo: have frontend "backdrops" that can be injected into pages (not email thing, just idk where to write this todo yet lol)


// Used to define string-replacing for various substitutions
const SUBSTITUTION_TAG = (name) => `%{${name}}%`;
// Whatever is returned here, when in an email, will be replaced with the value.
//  components/user schema values are imported automatically.

const UNSUBSCRIBE = SUBSTITUTION_TAG('unsubscribe');


import sass from 'sass';
export function Stylesheet(props) {
    const file = props?.file || (__dirname + '/templates/styles/index.scss');
    const data = sass.renderSync({
        file,
    }).css.toString('utf8');
    return React.createElement('style', null, data)
}


interface EmailConfig<EmailContext = DefaultEmailContext> {
    subject?: string | Function;
    content: any;
    context?: EmailContext;
    [key: string]: any;
}

export interface DefaultEmailContext {
    [key: string]: any;
}

export class Email<TypeContext = DefaultEmailContext> implements EmailConfig<TypeContext> {
    subject = "Kent Hack Enough";
    context: any = {};
    attachments = [];
    content: any;

    constructor(args: EmailConfig<TypeContext>) {
        Object.assign(this, args);
    }

    ctx(ctx?: TypeContext) {
        return {
            ...(this.context),
            ...(ctx || {}),
            UNSUBSCRIBE,
            __proto__: this,
        };
    }

    contents(ctx?: TypeContext) {
        const contentType = typeof this.content;
        let content = this.content;
        const context = this.ctx(ctx);
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
        let subject = this.subject;
        if (typeof subject == 'function') {
            // @ts-ignore
            subject = subject(this.ctx(ctx));
        }
        const payload: MailDataRequired = {
            from: {
                email: SENDGRID_FROM,
                name: SENDGRID_FROMNAME
            },
            to: email,
            ...this.contents(ctx),
            subject,
            trackingSettings: {
                subscriptionTracking: {
                    enable: true,
                    substitutionTag: UNSUBSCRIBE,
                }
            },
        };
        console.log(payload);
        EmailSent.emit(payload);
        return await sendgrid.send(payload);
    }
}