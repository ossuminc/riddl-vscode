/**
 * Type declarations for @ossuminc/riddl-lib
 *
 * This is a minimal declaration file for the RIDDL library compiled from Scala.js.
 * The library provides parsing, AST manipulation, and validation for RIDDL language files.
 */

declare module '@ossuminc/riddl-lib' {
    // Location information for tokens and AST nodes
    export interface Location {
        line: number;
        col: number;
        offset: number;
        endOffset?: number;
        source: string;
    }

    // Token structure from parseToTokens
    export interface Token {
        text: string;
        kind: string;
        location: Location;
    }

    // Error structure
    export interface RiddlError {
        kind: string;
        message: string;
        location: Location;
    }

    // JavaScript-friendly result type
    export interface ParseResult<T = any> {
        succeeded: boolean;
        value?: T;
        errors?: RiddlError[];
    }

    // Token parse result
    export interface TokenResult extends ParseResult<Token[]> {}

    // Validation messages grouped by severity
    export interface ValidationMessages {
        errors: RiddlError[];
        warnings: RiddlError[];
        info: RiddlError[];
        all: RiddlError[];
    }

    // Validation result with both parse and validation errors
    export interface ValidationResult {
        succeeded: boolean;
        parseErrors?: RiddlError[];
        validationMessages?: ValidationMessages;
    }

    // Build information structure
    export interface BuildInfo {
        name: string;
        version: string;
        scalaVersion: string;
        sbtVersion: string;
        moduleName: string;
        description: string;
        organization: string;
        organizationName: string;
        copyrightHolder: string;
        copyright: string;
        licenses: string;
        projectHomepage: string;
        organizationHomepage: string;
        builtAtString: string;
        buildInstant: string;
        isSnapshot: boolean;
    }

    // RiddlAPI Facade - Stable API with non-minified method names
    export const RiddlAPI: {
        version: string;
        buildInfo: BuildInfo;
        parseString(source: string, origin?: string, verbose?: boolean): ParseResult;
        parseStringWithContext(source: string, origin: string, verbose: boolean, context: any): ParseResult;
        parseNebula(source: string, origin?: string, verbose?: boolean): ParseResult;
        parseToTokens(source: string, origin?: string, verbose?: boolean): TokenResult;
        validateString(source: string, origin?: string, verbose?: boolean, noANSIMessages?: boolean): ValidationResult;
        createContext(showTimes?: boolean, showWarnings?: boolean, verbose?: boolean): any;
        formatErrorArray(errors: RiddlError[]): string;
        errorsToStrings(errors: RiddlError[]): string[];
        formatInfo: string;
    };

    // Parser-related exports
    export const TopLevelParser$: any;
    export const RiddlParserInput: any;
    export function RiddlParserInput(data: string, root: string): any;

    // Message handling
    export const Messages: any;

    // AST utilities
    export const AST: any;

    // AST Node constructors
    export function Domain(loc: any, id: any, ...args: any[]): any;
    export function Context(loc: any, id: any, ...args: any[]): any;
    export function Entity(loc: any, id: any, ...args: any[]): any;
    export function Type(loc: any, id: any, typeEx: any, ...args: any[]): any;

    // Location
    export const At$: any;
    export function At(input: any, offset?: number, col?: number): any;

    // Other common exports - add as needed
    export const Folding: any;
    export const Finder: any;

}
