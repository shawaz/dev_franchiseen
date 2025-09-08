/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";
import type * as admin from "../admin.js";
import type * as businesses from "../businesses.js";
import type * as categories from "../categories.js";
import type * as deals from "../deals.js";
import type * as escrow from "../escrow.js";
import type * as financialTransactions from "../financialTransactions.js";
import type * as franchise from "../franchise.js";
import type * as frcTokens from "../frcTokens.js";
import type * as industries from "../industries.js";
import type * as myFunctions from "../myFunctions.js";
import type * as platformTeam from "../platformTeam.js";
import type * as setup from "../setup.js";
import type * as shares from "../shares.js";
import type * as teams from "../teams.js";
import type * as uploadLogo from "../uploadLogo.js";
import type * as uploadcare from "../uploadcare.js";
import type * as users from "../users.js";

/**
 * A utility for referencing Convex functions in your app's API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
declare const fullApi: ApiFromModules<{
  admin: typeof admin;
  businesses: typeof businesses;
  categories: typeof categories;
  deals: typeof deals;
  escrow: typeof escrow;
  financialTransactions: typeof financialTransactions;
  franchise: typeof franchise;
  frcTokens: typeof frcTokens;
  industries: typeof industries;
  myFunctions: typeof myFunctions;
  platformTeam: typeof platformTeam;
  setup: typeof setup;
  shares: typeof shares;
  teams: typeof teams;
  uploadLogo: typeof uploadLogo;
  uploadcare: typeof uploadcare;
  users: typeof users;
}>;
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;
