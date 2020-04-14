import { Request, Response, NextFunction } from 'express'

/**
 * Declare types for http handler
 */

export type HttpRequest = Request
export type HttpResponse = Response
export type HttpNext = NextFunction

export interface SimpleHandler {
  (req: HttpRequest, res: HttpResponse): void
}

export interface NextHandler {
  (req: HttpRequest, res: HttpResponse, next: HttpNext): void
}

export interface ErrorHandler {
  (err: Error, req: HttpRequest, res: HttpResponse, next: HttpNext): void
}

export type HttpHandler = SimpleHandler | NextHandler | ErrorHandler
