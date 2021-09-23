import React from 'react';
import { Email, Stylesheet } from '../email';
export interface WelcomeEmailConfig {
    name: string;
    [key: string]: any;
}

export const WelcomeEmail = new Email<WelcomeEmailConfig>({
    subject: ({ name }) => `Welcome to KHE, ${name}!`,
    content(props: WelcomeEmailConfig) {
        return (
            <div>
                <Stylesheet/>
                <h1>Welcome {props.name}</h1>
            </div>
        )
    }
})