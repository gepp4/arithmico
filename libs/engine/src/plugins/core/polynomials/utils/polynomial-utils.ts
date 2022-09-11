import {
    compareMonomialsDegreeEqual,
    compareMonomialsDegreeGreater,
    compareMonomialsDegreeSmaller,
    Constant,
    divideMonomials,
    fillPolynomialWithZero,
    haveMonomialsSameBase,
    multiplyMonomials,
    NonConstant,
    Polynomial,
    sortMonomialsByDegree,
} from '../../../../utils/polynomial-type-utils';

export function getDegreeFromPolynomial(p: Polynomial): number {
    const highestMonomial = p.sort(sortMonomialsByDegree)[0];

    if (highestMonomial === null) {
        throw "RuntimeError: internally Polynomial isn't correct!";
    }

    if (highestMonomial.type === 'constant') {
        return 0;
    } else {
        return highestMonomial.degree;
    }
}

export function calculatePolynomialDash(p: Polynomial, q: Polynomial, minus = false): Polynomial {
    const result: Polynomial = [];

    const copiedP = p.slice().sort((a, b) => -1 * sortMonomialsByDegree(a, b));
    let copiedQ = q.slice().sort((a, b) => -1 * sortMonomialsByDegree(a, b));

    while (copiedP.length > 0 && copiedQ.length > 0) {
        const latestElementP = copiedP.at(-1);
        const latestElementQ = copiedQ.at(-1);

        if (compareMonomialsDegreeGreater(latestElementP, latestElementQ)) {
            result.push(copiedP.pop());
            continue;
        }

        if (compareMonomialsDegreeSmaller(latestElementP, latestElementQ)) {
            result.push(copiedQ.pop());
            continue;
        }

        if (
            compareMonomialsDegreeEqual(latestElementP, latestElementQ) &&
            haveMonomialsSameBase(latestElementP, latestElementQ)
        ) {
            if (latestElementP.type === 'monomial') {
                result.push(<NonConstant>{
                    type: 'monomial',
                    coefficient: minus
                        ? latestElementP.coefficient - latestElementQ.coefficient
                        : latestElementP.coefficient + latestElementQ.coefficient,
                    base: (<NonConstant>latestElementP).base,
                    degree: (<NonConstant>latestElementP).degree,
                });
            }
            if (latestElementP.type === 'constant') {
                result.push(<Constant>{
                    type: 'constant',
                    coefficient: minus
                        ? latestElementP.coefficient - latestElementQ.coefficient
                        : latestElementP.coefficient + latestElementQ.coefficient,
                });
            }
            copiedP.pop();
            copiedQ.pop();
            continue;
        }

        if (
            compareMonomialsDegreeEqual(latestElementQ, latestElementQ) &&
            !haveMonomialsSameBase(latestElementP, latestElementQ)
        ) {
            copiedQ = copiedQ.filter((m) => {
                if (haveMonomialsSameBase(latestElementP, m) && compareMonomialsDegreeEqual(latestElementP, m)) {
                    result.push(<NonConstant>{
                        type: 'monomial',
                        coefficient: minus
                            ? latestElementP.coefficient - m.coefficient
                            : latestElementP.coefficient + m.coefficient,
                        base: (<NonConstant>m).base,
                        degree: (<NonConstant>m).degree,
                    });
                    copiedP.pop();
                    return false;
                } else {
                    return true;
                }
            });
        }
    }

    if (copiedP.length !== 0) {
        return result.concat(copiedP).filter((m) => m.coefficient !== 0);
    }
    if (copiedQ.length !== 0) {
        return result.concat(copiedQ).filter((m) => m.coefficient !== 0);
    }
    return result.filter((m) => m.coefficient !== 0);
}

export function calculatePolynomialMultiplication(p: Polynomial, q: Polynomial): Polynomial {
    const multipliedPolynomials: Polynomial[] = [];

    const copiedP = p.slice();
    const copiedQ = q.slice();

    copiedP.forEach((mp) => {
        const multipliedMonomials: Polynomial = [];
        copiedQ.forEach((mq) => multipliedMonomials.push(multiplyMonomials(mp, mq)));
        multipliedPolynomials.push(multipliedMonomials);
    });

    return multipliedPolynomials.reduce((a, b) => calculatePolynomialDash(a, b)).sort(sortMonomialsByDegree);
}

export function calculatePolynomialDivision(p: Polynomial, q: Polynomial): [Polynomial, Polynomial] {
    const constantZero = [<Constant>{ type: 'constant', coefficient: 0 }];
    let quotient: Polynomial = constantZero;
    let remainder: Polynomial = fillPolynomialWithZero(p.slice());
    const divisor = q.slice();

    console.debug('quotient begin: ', quotient);
    console.debug('remainder begin: ', remainder);
    console.debug('divisor: ', divisor);
    let i = 1;

    while (
        !(remainder.length === 1 && remainder[0].type === 'constant' && remainder[0].coefficient === 0) &&
        getDegreeFromPolynomial(remainder) >= getDegreeFromPolynomial(divisor)
    ) {
        const temp: Polynomial = [divideMonomials(remainder[0], divisor[0])];
        quotient = calculatePolynomialDash(quotient, temp);
        remainder = calculatePolynomialDash(remainder, calculatePolynomialMultiplication(temp, divisor), true);
        remainder = remainder.length === 0 ? constantZero : remainder;

        console.debug(`temp ${i}`, temp);
        console.debug(`remainder ${i}`, remainder);
        console.debug(`quotient ${i}`, quotient);
        i++;
    }

    return [quotient, remainder];
}
