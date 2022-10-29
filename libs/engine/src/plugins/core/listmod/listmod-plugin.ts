import createFunctionCall from '../../../create/create-function-call';
import createVector from '../../../create/create-vector';
import evaluate from '../../../eval';
import { FunctionHeaderItem, FunctionNode, SyntaxTreeNode, Vector } from '../../../types';
import { mapParametersToStackFrame } from '../../../utils/parameter-utils';
import {
    addPluginAuthor,
    addPluginDescription,
    addPluginFunction,
    createPlugin,
    createPluginFunction,
} from '../../../utils/plugin-builder';

const listmodPlugin = createPlugin('listmod');
addPluginAuthor(listmodPlugin, 'core');
addPluginDescription(listmodPlugin, 'modify lists');

const singleListHeader: FunctionHeaderItem[] = [{ name: 'l', type: 'vector', evaluate: true }];
const twoListsHeader: FunctionHeaderItem[] = [
    { name: 'l1', type: 'vector', evaluate: true },
    { name: 'l2', type: 'vector', evaluate: true },
];

const functionAndListHeader: FunctionHeaderItem[] = [
    { name: 'f', type: 'function', evaluate: true },
    { name: 'l', type: 'vector', evaluate: true },
];

addPluginFunction(
    listmodPlugin,
    createPluginFunction(
        'list:filter',
        functionAndListHeader,
        'Filter a list l with a filter function f',
        'Filter eine Liste l mit einer Filterfunktion f',
        (parameters, context) => {
            const parameterStackFrame = mapParametersToStackFrame(
                'list:filter',
                parameters,
                functionAndListHeader,
                context,
            );
            const filterFunction = <FunctionNode>parameterStackFrame['f'];
            const list = <Vector>parameterStackFrame['l'];
            const resultValues: SyntaxTreeNode[] = [];

            if (filterFunction.header.length !== 1) {
                throw 'TypeError: list:filter: Invalid filter function signature';
            }

            list.values.forEach((value) => {
                const filterResult = evaluate(createFunctionCall(filterFunction, [value]), context);
                if (filterResult.type !== 'boolean') {
                    throw `TypeError: list:filter: Invalid filter function return type. Expected "boolean" got "${filterResult.type}"`;
                }

                if (filterResult.value) {
                    resultValues.push(value);
                }
            });

            return createVector(resultValues);
        },
    ),
);

addPluginFunction(
    listmodPlugin,
    createPluginFunction(
        'list:map',
        functionAndListHeader,
        'Maps each element x of list l to f(x).',
        'Bildet jedes Element x der List l auf f(x) ab.',
        (parameters, context) => {
            const parameterStackFrame = mapParametersToStackFrame(
                'list:map',
                parameters,
                functionAndListHeader,
                context,
            );
            const mapFunction = <FunctionNode>parameterStackFrame['f'];
            const list = <Vector>parameterStackFrame['l'];
            const resultValues: SyntaxTreeNode[] = [];

            if (mapFunction.header.length !== 1) {
                throw 'TypeError: list:map: Invalid map function signature';
            }

            list.values.forEach((value) => {
                const mapResult = evaluate(createFunctionCall(mapFunction, [value]), context);
                resultValues.push(mapResult);
            });

            return createVector(resultValues);
        },
    ),
);

const reduceHeader: FunctionHeaderItem[] = [
    { name: 'f', type: 'function', evaluate: true },
    { name: 'l', type: 'vector', evaluate: true },
    { name: 'start_acc', type: 'any', evaluate: true, optional: true },
];

addPluginFunction(
    listmodPlugin,
    createPluginFunction(
        'list:reduce',
        reduceHeader,
        'Reduces a list to a single value with the specified reducer function',
        'Reduziert eine Liste mithilfe der übergebenen Reduzierfunktion',
        (parameters, context) => {
            const parameterStackFrame = mapParametersToStackFrame('list:reduce', parameters, reduceHeader, context);
            const reduceFunction = <FunctionNode>parameterStackFrame['f'];
            const list = <Vector>parameterStackFrame['l'];
            const startAcc = parameterStackFrame['start_acc'];

            if (reduceFunction.header.length !== 2) {
                throw 'TypeError: list:reduce: Invalid reduce function signature';
            }

            if (list.values.length === 0) {
                throw 'RuntimeError: list:reduce: List is empty';
            }

            if (list.values.length < 2 && !startAcc) {
                throw 'RuntimeError: list:reduce: start_acc not specified';
            }

            if (startAcc) {
                return list.values.reduce(
                    (acc, value) => evaluate(createFunctionCall(reduceFunction, [acc, value]), context),
                    startAcc,
                );
            }

            return list.values.reduce((acc, value) =>
                evaluate(createFunctionCall(reduceFunction, [acc, value]), context),
            );
        },
    ),
);

addPluginFunction(
    listmodPlugin,
    createPluginFunction(
        'list:reverse',
        singleListHeader,
        'Creates a new list with the elements of l in reverse order.',
        'Erzeugt eine neue Liste mit den Elementen von l in umgekehrter Reihenfolge.',
        (parameters, context) => {
            const parameterStackFrame = mapParametersToStackFrame(
                'list:reverse',
                parameters,
                singleListHeader,
                context,
            );
            const values = (<Vector>parameterStackFrame['l']).values;
            return createVector([...values].reverse());
        },
    ),
);

addPluginFunction(
    listmodPlugin,
    createPluginFunction(
        'list:concat',
        twoListsHeader,
        'Creates a new list with the elements of l1 and l2 concatenated.',
        'Erzeugt eine neue Liste mit den Elementen von l1 und l2 hintereinander gehängt.',
        (parameters, context) => {
            const parameterStackFrame = mapParametersToStackFrame('list:concat', parameters, twoListsHeader, context);
            const firstListValues = (<Vector>parameterStackFrame['l1']).values;
            const secondListValues = (<Vector>parameterStackFrame['l2']).values;
            return createVector([...firstListValues, ...secondListValues]);
        },
    ),
);

export default listmodPlugin;
