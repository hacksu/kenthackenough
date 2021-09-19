import React from 'react';

export interface WelcomeEmailConfig {
    name: string;
    [key: string]: any;
}

export default function WelcomeEmail(props: WelcomeEmailConfig) {
    return (
        <div>
            <h1>Welcome {props.name}</h1>
        </div>
    )
}