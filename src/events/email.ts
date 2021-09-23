import { TypedEvent } from "@/lib/typed-event";
import { MailDataRequired } from '@sendgrid/mail';

export const EmailSent = new TypedEvent<MailDataRequired>();