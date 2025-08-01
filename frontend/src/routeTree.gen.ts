/* eslint-disable */

// @ts-nocheck

// noinspection JSUnusedGlobalSymbols

// This file was automatically generated by TanStack Router.
// You should NOT make any changes in this file as it will be overwritten.
// Additionally, you should also exclude this file from your linter and/or formatter to prevent it from being checked or modified.

import { Route as rootRouteImport } from './routes/__root'
import { Route as privateRouteRouteImport } from './routes/(private)/route'
import { Route as IndexRouteImport } from './routes/index'
import { Route as privateDashboardRouteImport } from './routes/(private)/dashboard'
import { Route as PublicLoginIndexRouteImport } from './routes/_public/login/index'
import { Route as PublicCadastroIndexRouteImport } from './routes/_public/cadastro/index'
import { Route as privateLayoutNovoRegistroIndexRouteImport } from './routes/(private)/_layout/novo-registro/index'
import { Route as privateLayoutConfiguracoesIndexRouteImport } from './routes/(private)/_layout/configuracoes/index'
import { Route as privateLayoutContaIdIndexRouteImport } from './routes/(private)/_layout/conta/$id/index'

const privateRouteRoute = privateRouteRouteImport.update({
  id: '/(private)',
  getParentRoute: () => rootRouteImport,
} as any)
const IndexRoute = IndexRouteImport.update({
  id: '/',
  path: '/',
  getParentRoute: () => rootRouteImport,
} as any)
const privateDashboardRoute = privateDashboardRouteImport.update({
  id: '/dashboard',
  path: '/dashboard',
  getParentRoute: () => privateRouteRoute,
} as any)
const PublicLoginIndexRoute = PublicLoginIndexRouteImport.update({
  id: '/_public/login/',
  path: '/login/',
  getParentRoute: () => rootRouteImport,
} as any)
const PublicCadastroIndexRoute = PublicCadastroIndexRouteImport.update({
  id: '/_public/cadastro/',
  path: '/cadastro/',
  getParentRoute: () => rootRouteImport,
} as any)
const privateLayoutNovoRegistroIndexRoute =
  privateLayoutNovoRegistroIndexRouteImport.update({
    id: '/_layout/novo-registro/',
    path: '/novo-registro/',
    getParentRoute: () => privateRouteRoute,
  } as any)
const privateLayoutConfiguracoesIndexRoute =
  privateLayoutConfiguracoesIndexRouteImport.update({
    id: '/_layout/configuracoes/',
    path: '/configuracoes/',
    getParentRoute: () => privateRouteRoute,
  } as any)
const privateLayoutContaIdIndexRoute =
  privateLayoutContaIdIndexRouteImport.update({
    id: '/_layout/conta/$id/',
    path: '/conta/$id/',
    getParentRoute: () => privateRouteRoute,
  } as any)

export interface FileRoutesByFullPath {
  '/': typeof privateRouteRouteWithChildren
  '/dashboard': typeof privateDashboardRoute
  '/cadastro': typeof PublicCadastroIndexRoute
  '/login': typeof PublicLoginIndexRoute
  '/configuracoes': typeof privateLayoutConfiguracoesIndexRoute
  '/novo-registro': typeof privateLayoutNovoRegistroIndexRoute
  '/conta/$id': typeof privateLayoutContaIdIndexRoute
}
export interface FileRoutesByTo {
  '/': typeof privateRouteRouteWithChildren
  '/dashboard': typeof privateDashboardRoute
  '/cadastro': typeof PublicCadastroIndexRoute
  '/login': typeof PublicLoginIndexRoute
  '/configuracoes': typeof privateLayoutConfiguracoesIndexRoute
  '/novo-registro': typeof privateLayoutNovoRegistroIndexRoute
  '/conta/$id': typeof privateLayoutContaIdIndexRoute
}
export interface FileRoutesById {
  __root__: typeof rootRouteImport
  '/': typeof IndexRoute
  '/(private)': typeof privateRouteRouteWithChildren
  '/(private)/dashboard': typeof privateDashboardRoute
  '/_public/cadastro/': typeof PublicCadastroIndexRoute
  '/_public/login/': typeof PublicLoginIndexRoute
  '/(private)/_layout/configuracoes/': typeof privateLayoutConfiguracoesIndexRoute
  '/(private)/_layout/novo-registro/': typeof privateLayoutNovoRegistroIndexRoute
  '/(private)/_layout/conta/$id/': typeof privateLayoutContaIdIndexRoute
}
export interface FileRouteTypes {
  fileRoutesByFullPath: FileRoutesByFullPath
  fullPaths:
    | '/'
    | '/dashboard'
    | '/cadastro'
    | '/login'
    | '/configuracoes'
    | '/novo-registro'
    | '/conta/$id'
  fileRoutesByTo: FileRoutesByTo
  to:
    | '/'
    | '/dashboard'
    | '/cadastro'
    | '/login'
    | '/configuracoes'
    | '/novo-registro'
    | '/conta/$id'
  id:
    | '__root__'
    | '/'
    | '/(private)'
    | '/(private)/dashboard'
    | '/_public/cadastro/'
    | '/_public/login/'
    | '/(private)/_layout/configuracoes/'
    | '/(private)/_layout/novo-registro/'
    | '/(private)/_layout/conta/$id/'
  fileRoutesById: FileRoutesById
}
export interface RootRouteChildren {
  IndexRoute: typeof IndexRoute
  privateRouteRoute: typeof privateRouteRouteWithChildren
  PublicCadastroIndexRoute: typeof PublicCadastroIndexRoute
  PublicLoginIndexRoute: typeof PublicLoginIndexRoute
}

declare module '@tanstack/react-router' {
  interface FileRoutesByPath {
    '/(private)': {
      id: '/(private)'
      path: '/'
      fullPath: '/'
      preLoaderRoute: typeof privateRouteRouteImport
      parentRoute: typeof rootRouteImport
    }
    '/': {
      id: '/'
      path: '/'
      fullPath: '/'
      preLoaderRoute: typeof IndexRouteImport
      parentRoute: typeof rootRouteImport
    }
    '/(private)/dashboard': {
      id: '/(private)/dashboard'
      path: '/dashboard'
      fullPath: '/dashboard'
      preLoaderRoute: typeof privateDashboardRouteImport
      parentRoute: typeof privateRouteRoute
    }
    '/_public/login/': {
      id: '/_public/login/'
      path: '/login'
      fullPath: '/login'
      preLoaderRoute: typeof PublicLoginIndexRouteImport
      parentRoute: typeof rootRouteImport
    }
    '/_public/cadastro/': {
      id: '/_public/cadastro/'
      path: '/cadastro'
      fullPath: '/cadastro'
      preLoaderRoute: typeof PublicCadastroIndexRouteImport
      parentRoute: typeof rootRouteImport
    }
    '/(private)/_layout/novo-registro/': {
      id: '/(private)/_layout/novo-registro/'
      path: '/novo-registro'
      fullPath: '/novo-registro'
      preLoaderRoute: typeof privateLayoutNovoRegistroIndexRouteImport
      parentRoute: typeof privateRouteRoute
    }
    '/(private)/_layout/configuracoes/': {
      id: '/(private)/_layout/configuracoes/'
      path: '/configuracoes'
      fullPath: '/configuracoes'
      preLoaderRoute: typeof privateLayoutConfiguracoesIndexRouteImport
      parentRoute: typeof privateRouteRoute
    }
    '/(private)/_layout/conta/$id/': {
      id: '/(private)/_layout/conta/$id/'
      path: '/conta/$id'
      fullPath: '/conta/$id'
      preLoaderRoute: typeof privateLayoutContaIdIndexRouteImport
      parentRoute: typeof privateRouteRoute
    }
  }
}

interface privateRouteRouteChildren {
  privateDashboardRoute: typeof privateDashboardRoute
  privateLayoutConfiguracoesIndexRoute: typeof privateLayoutConfiguracoesIndexRoute
  privateLayoutNovoRegistroIndexRoute: typeof privateLayoutNovoRegistroIndexRoute
  privateLayoutContaIdIndexRoute: typeof privateLayoutContaIdIndexRoute
}

const privateRouteRouteChildren: privateRouteRouteChildren = {
  privateDashboardRoute: privateDashboardRoute,
  privateLayoutConfiguracoesIndexRoute: privateLayoutConfiguracoesIndexRoute,
  privateLayoutNovoRegistroIndexRoute: privateLayoutNovoRegistroIndexRoute,
  privateLayoutContaIdIndexRoute: privateLayoutContaIdIndexRoute,
}

const privateRouteRouteWithChildren = privateRouteRoute._addFileChildren(
  privateRouteRouteChildren,
)

const rootRouteChildren: RootRouteChildren = {
  IndexRoute: IndexRoute,
  privateRouteRoute: privateRouteRouteWithChildren,
  PublicCadastroIndexRoute: PublicCadastroIndexRoute,
  PublicLoginIndexRoute: PublicLoginIndexRoute,
}
export const routeTree = rootRouteImport
  ._addFileChildren(rootRouteChildren)
  ._addFileTypes<FileRouteTypes>()
