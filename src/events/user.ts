import { TypedEvent } from "@/lib/typed-event";
import {
    User
} from '@/graphql/types';

export const UserCreated = new TypedEvent<{
    user: User
    [key: string]: any;
}>();