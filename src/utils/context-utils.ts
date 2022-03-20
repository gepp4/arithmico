import { Context, StackObject } from '../types';

function isNameAlreadyTaken(name: string, context: Context) {
    return context.stack.some((stackFrame) => !!stackFrame[name]);
}

export function useStrictContextValidator(name: string, context: Context) {
    if (context.stack.length === 0) {
        throw 'ContextError: no stackframes available';
    }

    if (isNameAlreadyTaken(name, context)) {
        throw `ContextError: ${name} is already defined`;
    }
}

export function insertStackObject(name: string, stackObject: StackObject, context: Context) {
    useStrictContextValidator(name, context);
    context.stack[context.stack.length - 1][name] = stackObject;
}
