import { Email } from "./email";

// import WelcomeEmail, { WelcomeEmailConfig } from './templates/welcome';

// let em = new Email<WelcomeEmailConfig>({
//     content: WelcomeEmail,
// });

// em.send('cseitz5@kent.edu', {
//     name: 'Chris',
// })

import { WelcomeEmail } from './templates/welcome';

WelcomeEmail.send('cseitz5@kent.edu', {
    name: 'Chris'
})