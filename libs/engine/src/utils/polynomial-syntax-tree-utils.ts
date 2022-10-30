import { NumberNode, SymbolNode, SyntaxTreeNode } from '../types/SyntaxTreeNodes';
import { convertOperatorChainToList } from './symbolic-utils';
import {
    createConstantMonomial,
    createNonConstantMonomial,
    Polynomial,
    compareMonomials,
} from './polynomial-type-utils';

export function getSummands(node: SyntaxTreeNode): SyntaxTreeNode[] {
    return convertOperatorChainToList('plus', node);
}

export function getFactors(summand: SyntaxTreeNode): SyntaxTreeNode[] {
    return convertOperatorChainToList('times', summand);
}

function isSummandConstant(summand: SyntaxTreeNode) {
    const factors = getFactors(summand);
    return factors.length === 1 && summand.type !== 'times' && factors[0].type === 'number';
}

function isSummandLinear(summand: SyntaxTreeNode) {
    const factors = getFactors(summand);
    return (
        (factors.length === 1 && summand.type !== 'times' && factors[0].type === 'symbol') ||
        (factors.length === 2 && factors[1].type !== 'power' && factors[1].type === 'symbol')
    );
}

export function getMonomialCoefficientFromSummand(summand: SyntaxTreeNode): number {
    const factors = getFactors(summand);
    const coefficients = <NumberNode[]>factors.filter((factor) => factor.type === 'number');

    if (coefficients.length === 0) {
        return 1;
    }

    if (coefficients.length === 1) {
        return coefficients[0].value;
    }

    if (isSummandConstant(summand) && factors[0].type === 'number') {
        return factors[0].value;
    }

    throw 'RuntimeError: multiple coefficients';
}

function getMonomialDegreeFromSummand(summand: SyntaxTreeNode): number {
    const factors = getFactors(summand);

    if (isSummandLinear(summand)) {
        return 1;
    }
    if (isSummandConstant(summand)) {
        return 0;
    }

    const degrees: NumberNode[] = <NumberNode[]>(
        convertOperatorChainToList('power', factors.length === 1 ? factors[0] : factors[1]).filter(
            (factor) => factor.type === 'number',
        )
    );

    if (degrees.length === 1) {
        return degrees[0].value;
    }

    throw 'RuntimeError: multiple degrees';
}

function getMonomialBaseFromSummand(summand: SyntaxTreeNode) {
    const factors = getFactors(summand);

    if (isSummandLinear(summand)) {
        if (factors.length === 2 && factors[1].type === 'symbol') {
            return factors[1].name;
        }

        if (factors.length === 1 && factors[0].type === 'symbol') {
            return factors[0].name;
        }
    }

    if (isSummandConstant(summand)) {
        return null;
    }

    const bases = <SymbolNode[]>(
        convertOperatorChainToList('power', factors.length === 1 ? factors[0] : factors[1]).filter(
            (factor) => factor.type === 'symbol',
        )
    );

    if (bases.length === 1) {
        return bases[0].name;
    }

    throw 'RuntimeError: multiple bases';
}

export function isPolynomialDegreeValid(node: SyntaxTreeNode) {
    const summands = getSummands(node);
    return summands.every((summand) => {
        const degree = getMonomialDegreeFromSummand(summand);
        return degree >= 0 && degree % 1 === 0;
    });
}

function checkEverySummandsHasSymbolBase(summands: SyntaxTreeNode[], symbol: string) {
    return summands.every((summand) => getMonomialBaseFromSummand(summand) === symbol || isSummandConstant(summand));
}

export function isEverySummandOfPolynomialBaseSame(node: SyntaxTreeNode) {
    const summands = getSummands(node);
    if (summands.length === 1) {
        return isSummandConstant(summands[0]) || getMonomialBaseFromSummand(summands[0]) !== undefined;
    }

    if (summands.length >= 2) {
        const symbol = getMonomialBaseFromSummand(summands[1]);
        return checkEverySummandsHasSymbolBase(summands, symbol);
    }

    return false;
}

export function haveTwoPolynomialsSameBase(node1: SyntaxTreeNode, node2: SyntaxTreeNode) {
    const summands = [...getSummands(node1), ...getSummands(node2)];
    const bases = new Set<string>();
    summands.forEach((summand) => {
        if (isSummandConstant(summand)) {
            return;
        }

        bases.add(getMonomialBaseFromSummand(summand));
    });
    return bases.size <= 1;
}

function summandToMonomial(summand: SyntaxTreeNode) {
    if (isSummandConstant(summand)) {
        return createConstantMonomial(getMonomialCoefficientFromSummand(summand));
    } else {
        return createNonConstantMonomial(
            getMonomialCoefficientFromSummand(summand),
            getMonomialBaseFromSummand(summand),
            getMonomialDegreeFromSummand(summand),
        );
    }
}

export function getPolynomial(node: SyntaxTreeNode): Polynomial {
    return getSummands(node).map(summandToMonomial).sort(compareMonomials);
}
