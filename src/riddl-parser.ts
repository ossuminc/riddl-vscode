/**
 * RIDDL Parser integration for VSCode
 *
 * This module provides helpers to work with the RIDDL library's Scala.js output,
 * converting Scala data structures to JavaScript-friendly formats.
 */

import { RiddlAPI, ParseResult } from '@ossuminc/riddl-lib';

/**
 * JavaScript-friendly token interface
 */
export interface RiddlToken {
    text: string;
    kind: string;
    start: number;
    end: number;
}

/**
 * Converts a Scala.js List of tokens to a JavaScript array
 *
 * The Scala.js List structure uses:
 * - W(): get head element
 * - aa(): get tail (rest of list)
 * - y(): get length
 *
 * Each token has:
 * - x(): returns the kind/type (e.g., "Keyword", "Identifier")
 * - Location info stored in properties like Ay, zy, Iy (containing start/end positions)
 *
 * @param scalaList The Scala.js List from RiddlAPI.parseToTokens()
 * @returns JavaScript array of tokens with text and kind properties
 */
export function convertTokenList(scalaList: any): RiddlToken[] {
    const tokens: RiddlToken[] = [];
    let current = scalaList;
    const maxTokens = 10000; // Safety limit
    let count = 0;

    while (current && count < maxTokens) {
        // Check if list is empty
        const lengthVal = typeof current.y === 'function' ? current.y() : 0;
        if (lengthVal === 0) {
            break;
        }

        // Get head token
        if (typeof current.W === 'function') {
            const token = current.W();

            if (token && typeof token.x === 'function') {
                // Get token kind
                const kind = token.x();

                // Extract location and text
                const locProp = Object.keys(token)[0]; // e.g., Ay, zy, Iy
                if (locProp && token[locProp]) {
                    const loc = token[locProp];
                    if (loc.Da && loc.Pa !== undefined && loc.xb !== undefined) {
                        const input = loc.Da;
                        const start = loc.Pa;
                        const end = loc.xb;

                        // Extract text from source
                        const text = input.Ro ? input.Ro.substring(start, end) : '';

                        tokens.push({
                            text,
                            kind,
                            start,
                            end
                        });
                    }
                }
            }
        }

        // Move to tail
        if (typeof current.aa === 'function') {
            current = current.aa();
        } else {
            break;
        }

        count++;
    }

    return tokens;
}

/**
 * Parse RIDDL source and return tokens as a JavaScript array
 *
 * @param source RIDDL source code
 * @param origin Origin identifier (e.g., filename)
 * @returns Result with JavaScript array of tokens, or error
 * @deprecated Use RiddlAPI.parseToTokens directly - it now returns JavaScript arrays
 */
export function parseToTokenArray(source: string, origin: string = 'string'): ParseResult<RiddlToken[]> {
    // This function is now deprecated since RiddlAPI.parseToTokens returns JS arrays directly
    const result = RiddlAPI.parseToTokens(source, origin);
    return result as any;
}

/**
 * Parse RIDDL source to AST
 *
 * @param source RIDDL source code
 * @param origin Origin identifier (e.g., filename)
 * @param verbose Enable verbose error messages
 * @returns Parse result
 */
export function parseRiddl(source: string, origin: string = 'string', verbose: boolean = false): ParseResult {
    return RiddlAPI.parseString(source, origin, verbose) as any;
}
